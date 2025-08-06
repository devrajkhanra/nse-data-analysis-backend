import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse } from "csv-parse";
import { Nifty50Company } from "../types";

/**
 * Reads the nifty50list.csv file from ~/Desktop/data/broad and returns an array of Nifty50Company objects.
 * @returns Promise resolving to an array of Nifty50Company objects
 * @throws Error if the file is missing, cannot be parsed, or has invalid headers
 */
export async function readNifty50List(): Promise<Nifty50Company[]> {
  const dataPath = path.join(
    os.homedir(),
    "Desktop",
    "NSE-Data",
    "data",
    "broad",
    "nifty50list.csv"
  );

  try {
    // Ensure the file exists
    await fsPromises.access(dataPath);

    const results: Nifty50Company[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(dataPath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on("data", (row) => {
          // Normalize header names to handle variations (e.g., case-insensitive)
          const headers = Object.keys(row).reduce((acc, key) => {
            acc[key.toLowerCase()] = key;
            return acc;
          }, {} as Record<string, string>);

          const companyNameKey =
            headers["company_name"] || headers["company name"];
          const industryKey = headers["industry"];
          const symbolKey = headers["symbol"];
          const seriesKey = headers["series"];
          const isinCodeKey = headers["isin_code"] || headers["isin code"];

          if (
            !companyNameKey ||
            !industryKey ||
            !symbolKey ||
            !seriesKey ||
            !isinCodeKey
          ) {
            reject(
              new Error(
                "Invalid headers in nifty50list.csv: COMPANY_NAME, INDUSTRY, SYMBOL, SERIES, ISIN_CODE required"
              )
            );
            return;
          }

          results.push({
            companyName: row[companyNameKey]?.trim(),
            industry: row[industryKey]?.trim(),
            symbol: row[symbolKey]?.trim(),
            series: row[seriesKey]?.trim(),
            isinCode: row[isinCodeKey]?.trim(),
          });
        })
        .on("end", () => {
          if (results.length === 0) {
            reject(
              new Error("nifty50list.csv is empty or contains no valid data")
            );
          } else {
            resolve(results);
          }
        })
        .on("error", (err) =>
          reject(new Error(`Failed to parse nifty50list.csv: ${err.message}`))
        );
    });
  } catch (error) {
    throw new Error(`nifty50list.csv not found at ${dataPath}`);
  }
}
