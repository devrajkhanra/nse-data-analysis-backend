import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse } from "csv-parse";

interface StockSummary {
  companyName: string;
  industry: string;
}

/**
 * Reads the nifty50list.csv file from ~/Desktop/data/broad and returns an array of stock names and industries.
 * @returns Promise resolving to an array of objects with companyName and industry
 * @throws Error if the file is missing or cannot be parsed
 */
export async function readNifty50List(): Promise<StockSummary[]> {
  const dataPath = path.join(
    os.homedir(),
    "Desktop",
    "data",
    "broad",
    "nifty50list.csv"
  );

  try {
    // Ensure the file exists
    await fsPromises.access(dataPath);

    const results: StockSummary[] = [];

    return new Promise((resolve, reject) => {
      fs.createReadStream(dataPath)
        .pipe(parse({ columns: true, skip_empty_lines: true }))
        .on("data", (row) => {
          results.push({
            companyName: row.COMPANY_NAME?.trim(),
            industry: row.INDUSTRY?.trim(),
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
        .on("error", (err) => {
          reject(new Error(`Failed to parse nifty50list.csv: ${err.message}`));
        });
    });
  } catch (error) {
    throw new Error(`nifty50list.csv not found at ${dataPath}`);
  }
}
