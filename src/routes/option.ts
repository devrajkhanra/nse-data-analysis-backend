import { Router } from "express";
import {
  readAllOptionFiles,
  readOptionFilesByDates,
} from "../utils/optionReader";
import { buildOptionChainForSymbolAndExpiry } from "../helpers/optionChainBuilder";
import { OptionRow, OptionChain } from "../types";

const router = Router();

/**
 * @route GET /option/chain
 * @desc Get option chain for given symbol (e.g. BANKNIFTY) and expiry (e.g. 31-07-2025)
 * @queryParam symbol: string - required
 * @queryParam expiry: string - required, date format should match data (e.g. DD-MM-YYYY)
 */
router.get("/option/chain", async (req, res) => {
  try {
    const { symbol, expiry, dates } = req.query;

    if (
      !symbol ||
      typeof symbol !== "string" ||
      !expiry ||
      typeof expiry !== "string"
    ) {
      return res.status(400).json({
        error: "Query parameters 'symbol' and 'expiry' (strings) are required.",
      });
    }

    let optionRows: OptionRow[] = [];

    if (dates) {
      let dateArray: string[] = [];
      if (typeof dates === "string") {
        dateArray = dates.split(",").map((d) => d.trim());
      } else if (Array.isArray(dates)) {
        dateArray = dates.map((d) => String(d).trim());
      } else {
        return res.status(400).json({ error: "'dates' parameter is invalid." });
      }
      try {
        optionRows = await readOptionFilesByDates(dateArray);
      } catch (err: any) {
        return res
          .status(500)
          .json({
            error: `Failed to read option files for dates: ${err.message}`,
          });
      }
    } else {
      // If no dates param, load all option files
      try {
        optionRows = await readAllOptionFiles();
      } catch (err: any) {
        return res
          .status(500)
          .json({ error: `Failed to read option files: ${err.message}` });
      }
    }

    const chain: OptionChain | null = buildOptionChainForSymbolAndExpiry(
      optionRows,
      symbol,
      expiry
    );

    if (!chain) {
      return res.status(404).json({
        error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
      });
    }

    return res.json(chain);
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error.message || "Internal Server Error" });
  }
});

/**
 * @route GET /option/test
 * @desc Returns unique symbols and expiries available in option data
 */
router.get("/option/test", async (req, res) => {
  try {
    const optionRows: OptionRow[] = await readAllOptionFiles();
    if (!optionRows.length) {
      return res.status(404).json({ error: "No option data found." });
    }

    // Extract unique symbols and expiries, showing combinations
    const uniqueCombos = Array.from(
      new Set(
        optionRows.map(
          (r) => `${JSON.stringify(r.symbol)} | ${JSON.stringify(r.expDate)}`
        )
      )
    );

    // Also unique lists for convenience
    const uniqueSymbols = Array.from(new Set(optionRows.map((r) => r.symbol)));
    const uniqueExpiries = Array.from(
      new Set(optionRows.map((r) => r.expDate))
    );

    // Optional: show a few sample OptionRows for inspection
    const sampleRows = optionRows.slice(0, 5);

    return res.json({
      uniqueSymbolExpiryCombos: uniqueCombos,
      uniqueSymbols,
      uniqueExpiries,
      sampleRows,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
});

export default router;
