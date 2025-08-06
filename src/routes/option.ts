// import { Router } from "express";
// import * as fsPromises from "fs/promises";
// import * as os from "os";
// import * as path from "path";
// import {
//   readAllOptionFiles,
//   readOptionFilesByDates,
// } from "../utils/optionReader";
// import { OptionRow, OptionChain } from "../types";
// const OPTION_ROOT = path.join(
//   os.homedir(),
//   "Desktop",
//   "NSE-Data",
//   "data",
//   "option"
// );

// const router = Router();

// /**
//  * @route GET /option/chain
//  * @desc Get option chain for given symbol (e.g. BANKNIFTY) and expiry (e.g. 31-07-2025)
//  * @queryParam symbol: string - required
//  * @queryParam expiry: string - required, date format should match data (e.g. DD-MM-YYYY)
//  */
// router.get("/option/chain", async (req, res) => {
//   try {
//     const { symbol, expiry, dates } = req.query;

//     if (
//       !symbol ||
//       typeof symbol !== "string" ||
//       !expiry ||
//       typeof expiry !== "string"
//     ) {
//       return res.status(400).json({
//         error: "Query parameters 'symbol' and 'expiry' (strings) are required.",
//       });
//     }

//     let optionRows: OptionRow[] = [];

//     if (dates) {
//       let dateArray: string[] = [];
//       if (typeof dates === "string") {
//         dateArray = dates.split(",").map((d) => d.trim());
//       } else if (Array.isArray(dates)) {
//         dateArray = dates.map((d) => String(d).trim());
//       } else {
//         return res.status(400).json({ error: "'dates' parameter is invalid." });
//       }
//       try {
//         optionRows = await readOptionFilesByDates(dateArray);
//       } catch (err: any) {
//         return res
//           .status(500)
//           .json({
//             error: `Failed to read option files for dates: ${err.message}`,
//           });
//       }
//     } else {
//       // If no dates param, load all option files
//       try {
//         optionRows = await readAllOptionFiles();
//       } catch (err: any) {
//         return res
//           .status(500)
//           .json({ error: `Failed to read option files: ${err.message}` });
//       }
//     }

//     const chain: OptionChain | null = buildOptionChainForSymbolAndExpiry(
//       optionRows,
//       symbol,
//       expiry
//     );

//     if (!chain) {
//       return res.status(404).json({
//         error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
//       });
//     }

//     return res.json(chain);
//   } catch (error: any) {
//     return res
//       .status(500)
//       .json({ error: error.message || "Internal Server Error" });
//   }
// });

// /**
//  * @route GET /option/test
//  * @desc Returns unique symbols and expiries available in option data
//  */
// router.get("/option/test", async (req, res) => {
//   try {
//     const optionRows: OptionRow[] = await readAllOptionFiles();
//     if (!optionRows.length) {
//       return res.status(404).json({ error: "No option data found." });
//     }

//     // Extract unique symbols and expiries, showing combinations
//     const uniqueCombos = Array.from(
//       new Set(
//         optionRows.map(
//           (r) => `${JSON.stringify(r.symbol)} | ${JSON.stringify(r.expDate)}`
//         )
//       )
//     );

//     // Also unique lists for convenience
//     const uniqueSymbols = Array.from(new Set(optionRows.map((r) => r.symbol)));
//     const uniqueExpiries = Array.from(
//       new Set(optionRows.map((r) => r.expDate))
//     );

//     // Optional: show a few sample OptionRows for inspection
//     const sampleRows = optionRows.slice(0, 5);

//     return res.json({
//       uniqueSymbolExpiryCombos: uniqueCombos,
//       uniqueSymbols,
//       uniqueExpiries,
//       sampleRows,
//     });
//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message || String(error) });
//   }
// });

// /**
//  * GET /option/available-dates
//  * Returns a sorted array of dates (string in DDMMYYYY) for which option CSV files exist.
//  */
// router.get("/option/available-dates", async (req, res) => {
//   try {
//     const files = await fsPromises.readdir(OPTION_ROOT);
//     const dates = files
//       .map((f) => {
//         const match = f.match(/^op(\d{8})\.csv$/i);
//         return match ? match[1] : null;
//       })
//       .filter((d) => d !== null) as string[];
//     dates.sort();
//     res.json(dates);
//   } catch (err: any) {
//     res
//       .status(500)
//       .json({ error: err.message || "Failed to list option dates." });
//   }
// });

// export default router;

// src/routes/option.ts

import { Router } from "express";
import * as fsPromises from "fs/promises";
import * as os from "os";
import * as path from "path";

import {
  readAllOptionFiles,
  readOptionFilesByDates,
} from "../utils/optionReader";

import { buildOptionChainForSymbolAndExpiry } from "../helpers/optionChainBuilder";

import { buildOptionChainWithDeltas } from "../helpers/optionChainDeltas";

import { OptionRow, OptionChain } from "../types";

const router = Router();

const OPTION_ROOT = path.join(
  os.homedir(),
  "Desktop",
  "NSE-Data",
  "data",
  "option"
);

/**
 * GET /option/test
 * Returns unique symbol-expiry combos along with unique symbols, expiries, and sample option rows.
 */
router.get("/option/test", async (req, res) => {
  try {
    const optionRows: OptionRow[] = await readAllOptionFiles();
    if (!optionRows.length) {
      return res.status(404).json({ error: "No option data found." });
    }

    const uniqueCombos = Array.from(
      new Set(
        optionRows.map(
          (r) => `${JSON.stringify(r.symbol)} | ${JSON.stringify(r.expDate)}`
        )
      )
    );
    const uniqueSymbols = Array.from(new Set(optionRows.map((r) => r.symbol)));
    const uniqueExpiries = Array.from(
      new Set(optionRows.map((r) => r.expDate))
    );
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

/**
 * GET /option/available-dates
 * Returns sorted list of available option CSV dates (DDMMYYYY) in option folder.
 */
router.get("/option/available-dates", async (req, res) => {
  try {
    const files = await fsPromises.readdir(OPTION_ROOT);
    const dates = files
      .map((f) => {
        const match = f.match(/^op(\d{8})\.csv$/i);
        return match ? match[1] : null;
      })
      .filter((d) => d !== null) as string[];
    dates.sort();
    res.json(dates);
  } catch (err: any) {
    res
      .status(500)
      .json({ error: err.message || "Failed to list option dates." });
  }
});

/**
 * GET /option/chain
 * Required query params:
 *  - symbol: option symbol (e.g. BANKNIFTY)
 *  - expiry: expiry date string (e.g. 31-07-2025)
 * Optional:
 *  - dates: comma-separated list of DDMMYYYY dates for files to load (default: all)
 *  - previousDate: single DDMMYYYY date string for previous day data (to compute deltas)
 * Returns option chain data with optional delta fields.
 */
router.get("/option/chain", async (req, res) => {
  try {
    const { symbol, expiry, dates, previousDate } = req.query;

    if (
      !symbol ||
      typeof symbol !== "string" ||
      !expiry ||
      typeof expiry !== "string"
    ) {
      return res.status(400).json({
        error:
          "Query parameters 'symbol' and 'expiry' are required and must be strings.",
      });
    }

    // Parse dates param if supplied
    let dateArray: string[] = [];
    if (dates) {
      if (typeof dates === "string") {
        dateArray = dates.split(",").map((d) => d.trim());
      } else if (Array.isArray(dates)) {
        dateArray = dates.map((d) => String(d).trim());
      } else {
        return res.status(400).json({ error: "'dates' parameter is invalid." });
      }
    }

    const prevDateStr =
      typeof previousDate === "string" ? previousDate.trim() : undefined;

    // Load current option rows
    let currentOptionRows: OptionRow[] = [];
    if (dateArray.length > 0) {
      currentOptionRows = await readOptionFilesByDates(dateArray);
    } else {
      currentOptionRows = await readAllOptionFiles();
    }

    // Load previous day's option rows if previousDate specified
    let previousOptionRows: OptionRow[] = [];
    if (prevDateStr) {
      try {
        previousOptionRows = await readOptionFilesByDates(prevDateStr);
      } catch (err) {
        console.warn(
          `Failed to load previous date data ${prevDateStr}: ${
            (err as Error).message
          }`
        );
      }
    }

    // Return option chain with delta if previous day data present
    if (prevDateStr && previousOptionRows.length > 0) {
      const chainWithDeltas = buildOptionChainWithDeltas(
        currentOptionRows,
        previousOptionRows,
        symbol,
        expiry
      );
      if (!chainWithDeltas) {
        return res.status(404).json({
          error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
        });
      }
      return res.json(chainWithDeltas);
    }

    // Otherwise return regular option chain without delta
    const standardChain = buildOptionChainForSymbolAndExpiry(
      currentOptionRows,
      symbol,
      expiry
    );

    if (!standardChain) {
      return res.status(404).json({
        error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
      });
    }

    return res.json(standardChain);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || String(error) });
  }
});

export default router;
