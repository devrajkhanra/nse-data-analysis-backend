import { Router } from "express";
import { readAndEnsureDataDirectory } from "../utils/directoryHelper";
import {
  readStockFilesByDates,
  readStockFilesByDatesAndSymbol,
} from "../utils/stockReader";

const router = Router();

/**
 * Get stock data for specific date(s) filtered by Nifty 50 and series EQ
 * Example: /stock/by-dates?dates=01072025 or /stock/by-dates?dates=01072025,02072025
 */
router.get("/stock/by-dates", async (req, res) => {
  try {
    const { dates } = req.query;

    if (!dates) {
      return res
        .status(400)
        .json({ error: 'Query parameter "dates" is required' });
    }

    // Normalize dates input to string array
    const dateArray =
      typeof dates === "string"
        ? dates.split(",").map((d) => d.trim())
        : Array.isArray(dates)
        ? dates.map((d) => String(d).trim())
        : [String(dates).trim()];

    await readAndEnsureDataDirectory(); // Ensure data directory exists

    const stockData = await readStockFilesByDates(dateArray);

    res.json(stockData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

/**
 * Get stock data for specific date(s) and symbol filtered by Nifty 50 and series EQ
 * Example: /stock/by-dates-and-symbol?dates=01072025&symbol=TCS
 */
router.get("/stock/by-dates-and-symbol", async (req, res) => {
  try {
    const { dates, symbol } = req.query;

    if (!dates) {
      return res
        .status(400)
        .json({ error: 'Query parameter "dates" is required' });
    }

    if (!symbol) {
      return res
        .status(400)
        .json({ error: 'Query parameter "symbol" is required' });
    }

    // Normalize dates input to string array
    const dateArray =
      typeof dates === "string"
        ? dates.split(",").map((d) => d.trim())
        : Array.isArray(dates)
        ? dates.map((d) => String(d).trim())
        : [String(dates).trim()];

    const symbolStr =
      typeof symbol === "string" ? symbol.trim() : String(symbol).trim();

    await readAndEnsureDataDirectory();

    const stockData = await readStockFilesByDatesAndSymbol(
      dateArray,
      symbolStr
    );

    res.json(stockData);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

export default router;
