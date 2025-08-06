import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse } from "csv-parse";
import { SecurityData, Nifty50Company } from "../types";
import { readNifty50List } from "./nifty50Reader"; // Adjust the path as necessary

/**
 * Read stock data files for given dates and return only Nifty50 EQ securities.
 * @param dates Single date or array, e.g., "01072025" or ["01072025"]
 */
export async function readStockFilesByDates(
  dates: string | string[]
): Promise<SecurityData[]> {
  const stockPath = path.join(
    os.homedir(),
    "Desktop",
    "NSE-Data",
    "data",
    "stock"
  );
  const dateArray = Array.isArray(dates) ? dates : [dates];

  // 1. Get all Nifty50 symbols
  const nifty50List: Nifty50Company[] = await readNifty50List();
  const nifty50Symbols = new Set(
    nifty50List.map((el) => el.symbol.trim().toUpperCase())
  );

  const results: SecurityData[] = [];

  // 2. For each requested date, open the right file
  for (const date of dateArray) {
    if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
      throw new Error(
        `Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`
      );
    }
    const file = `sec_bhavdata_full_${date}.csv`;
    const filePath = path.join(stockPath, file);

    try {
      await fsPromises.access(filePath);
    } catch {
      continue; // Skip missing files
    }

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
        .on("data", (row) => {
          // Normalize headers
          const headers = Object.keys(row).reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = key;
            return acc;
          }, {} as Record<string, string>);

          const symbolKey = headers["symbol"];
          const seriesKey = headers["series"];
          if (
            !symbolKey ||
            !seriesKey ||
            typeof row[symbolKey] !== "string" ||
            typeof row[seriesKey] !== "string"
          ) {
            // Skip if key not present
            return;
          }

          // Only process EQ series and if symbol is in Nifty 50
          if (
            row[seriesKey].trim().toUpperCase() === "EQ" &&
            nifty50Symbols.has(row[symbolKey].trim().toUpperCase())
          ) {
            try {
              results.push({
                symbol: row[symbolKey].trim(),
                series: row[seriesKey].trim(),
                date1: row[headers["date1"]]
                  ? row[headers["date1"]].trim()
                  : "",
                prevClose: parseFloat(row[headers["prev_close"]]) || 0,
                openPrice: parseFloat(row[headers["open_price"]]) || 0,
                highPrice: parseFloat(row[headers["high_price"]]) || 0,
                lowPrice: parseFloat(row[headers["low_price"]]) || 0,
                lastPrice: parseFloat(row[headers["last_price"]]) || 0,
                closePrice: parseFloat(row[headers["close_price"]]) || 0,
                avgPrice: parseFloat(row[headers["avg_price"]]) || 0,
                ttlTrdQnty: parseInt(row[headers["ttl_trd_qnty"]], 10) || 0,
                turnoverLacs: parseFloat(row[headers["turnover_lacs"]]) || 0,
                noOfTrades: parseInt(row[headers["no_of_trades"]], 10) || 0,
                delivQty: row[headers["deliv_qty"]]
                  ? parseInt(row[headers["deliv_qty"]], 10) || null
                  : null,
                delivPer: row[headers["deliv_per"]]
                  ? parseFloat(row[headers["deliv_per"]]) || null
                  : null,
              });
            } catch (e) {
              // Ignore parse errors for this row
            }
          }
        })
        .on("end", () => resolve())
        .on("error", (err) =>
          reject(new Error(`Failed to parse ${file}: ${err.message}`))
        );
    });
  }

  if (results.length === 0) {
    throw new Error(
      "No valid Nifty 50 EQ data found in stock CSV files for the given dates."
    );
  }

  return results;
}

/**
 * Reads stock data for given dates and a specific symbol, matching only EQ series and present in Nifty 50
 * @param dates Single date or array of dates in DDMMYYYY format
 * @param symbol Symbol to filter by (case-insensitive)
 * @returns Promise resolving to array of SecurityData objects for the symbol on the given dates
 */
export async function readStockFilesByDatesAndSymbol(
  dates: string | string[],
  symbol: string
): Promise<SecurityData[]> {
  const stockPath = path.join(
    os.homedir(),
    "Desktop",
    "NSE-Data",
    "data",
    "stock"
  );
  const dateArray = Array.isArray(dates) ? dates : [dates];
  const symbolUpper = symbol.trim().toUpperCase();

  // Load Nifty 50 symbols for validation
  const nifty50List: Nifty50Company[] = await readNifty50List();
  const nifty50Symbols = new Set(
    nifty50List.map((el) => el.symbol.trim().toUpperCase())
  );

  if (!nifty50Symbols.has(symbolUpper)) {
    throw new Error(`Symbol "${symbol}" is not in the Nifty 50 list.`);
  }

  const results: SecurityData[] = [];

  for (const date of dateArray) {
    if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
      throw new Error(
        `Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`
      );
    }
    const file = `sec_bhavdata_full_${date}.csv`;
    const filePath = path.join(stockPath, file);

    try {
      await fsPromises.access(filePath);
    } catch {
      continue; // Skip missing files
    }

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
        .on("data", (row) => {
          const headers = Object.keys(row).reduce((acc, key) => {
            acc[key.toLowerCase().trim()] = key;
            return acc;
          }, {} as Record<string, string>);

          const symbolKey = headers["symbol"];
          const seriesKey = headers["series"];
          if (
            !symbolKey ||
            !seriesKey ||
            typeof row[symbolKey] !== "string" ||
            typeof row[seriesKey] !== "string"
          ) {
            return;
          }

          // Match series EQ and symbol match case-insensitive
          if (
            row[seriesKey].trim().toUpperCase() === "EQ" &&
            row[symbolKey].trim().toUpperCase() === symbolUpper
          ) {
            try {
              results.push({
                symbol: row[symbolKey].trim(),
                series: row[seriesKey].trim(),
                date1: row[headers["date1"]]
                  ? row[headers["date1"]].trim()
                  : "",
                prevClose: parseFloat(row[headers["prev_close"]]) || 0,
                openPrice: parseFloat(row[headers["open_price"]]) || 0,
                highPrice: parseFloat(row[headers["high_price"]]) || 0,
                lowPrice: parseFloat(row[headers["low_price"]]) || 0,
                lastPrice: parseFloat(row[headers["last_price"]]) || 0,
                closePrice: parseFloat(row[headers["close_price"]]) || 0,
                avgPrice: parseFloat(row[headers["avg_price"]]) || 0,
                ttlTrdQnty: parseInt(row[headers["ttl_trd_qnty"]], 10) || 0,
                turnoverLacs: parseFloat(row[headers["turnover_lacs"]]) || 0,
                noOfTrades: parseInt(row[headers["no_of_trades"]], 10) || 0,
                delivQty: row[headers["deliv_qty"]]
                  ? parseInt(row[headers["deliv_qty"]], 10) || null
                  : null,
                delivPer: row[headers["deliv_per"]]
                  ? parseFloat(row[headers["deliv_per"]]) || null
                  : null,
              });
            } catch {
              // Ignore parsing errors on row
            }
          }
        })
        .on("end", () => resolve())
        .on("error", (err) =>
          reject(new Error(`Failed to parse ${file}: ${err.message}`))
        );
    });
  }

  if (results.length === 0) {
    throw new Error(
      `No valid EQ data found for symbol "${symbol}" on dates: ${dateArray.join(
        ", "
      )}`
    );
  }

  return results;
}
