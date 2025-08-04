import { Router } from "express";
import { readAndEnsureDataDirectory } from "../utils/directoryHelper";
import {
  readAllIndiceFiles,
  readIndiceFilesByDates,
  readIndiceFilesByDatesAndIndex,
} from "../utils/indiceReader";

const router = Router();

/**
 * Get all indice data from all CSV files in ~/Desktop/data/indice
 */
router.get("/allIndice", async (req, res) => {
  try {
    await readAndEnsureDataDirectory(); // Ensure directory exists
    const indiceData = await readAllIndiceFiles();
    res.json(indiceData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

/**
 * Get indice data for specific date(s) provided in query parameter
 * Example: /indice/by-dates?dates=01072025 or /indice/by-dates?dates=01072025,02072025
 */
router.get("/indice/by-dates", async (req, res) => {
  try {
    const { dates } = req.query;

    if (!dates) {
      return res
        .status(400)
        .json({ error: 'Query parameter "dates" is required' });
    }

    // Convert dates to string or string array, handling ParsedQs
    const dateArray =
      typeof dates === "string"
        ? dates.split(",").map((d) => d.trim())
        : Array.isArray(dates)
        ? dates.map((d) => String(d).trim())
        : [String(dates).trim()];

    await readAndEnsureDataDirectory(); // Ensure directory exists
    const indiceData = await readIndiceFilesByDates(dateArray);
    res.json(indiceData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

/**
 * Get indice data for specific date(s) and index name provided in query parameters
 * Example: /indice/by-dates-and-index?dates=01072025&index=NIFTY%2050
 */
router.get("/indice/by-dates-and-index", async (req, res) => {
  try {
    const { dates, index } = req.query;

    if (!dates) {
      return res
        .status(400)
        .json({ error: 'Query parameter "dates" is required' });
    }
    if (!index) {
      return res
        .status(400)
        .json({ error: 'Query parameter "index" is required' });
    }

    // Convert dates to string or string array, handling ParsedQs
    const dateArray =
      typeof dates === "string"
        ? dates.split(",").map((d) => d.trim())
        : Array.isArray(dates)
        ? dates.map((d) => String(d).trim())
        : [String(dates).trim()];

    // Convert index to string, handling ParsedQs
    const indexName =
      typeof index === "string" ? index.trim() : String(index).trim();

    await readAndEnsureDataDirectory(); // Ensure directory exists
    const indiceData = await readIndiceFilesByDatesAndIndex(
      dateArray,
      indexName
    );
    res.json(indiceData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

export default router;
