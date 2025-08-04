import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse } from "csv-parse";
import { IndexData } from "../types";

/**
 * Reads all CSV files from ~/Desktop/data/indice and returns an array of IndexData objects.
 * @returns Promise resolving to an array of IndexData objects from all files
 * @throws Error if the folder is missing, empty, or files cannot be parsed
 */
export async function readAllIndiceFiles(): Promise<IndexData[]> {
  const indicePath = path.join(os.homedir(), "Desktop", "data", "indice");

  try {
    // Ensure the folder exists
    await fsPromises.access(indicePath);

    // Get all CSV files in the indice folder
    const files = await fsPromises.readdir(indicePath);
    const csvFiles = files.filter((file) => file.endsWith(".csv"));

    if (csvFiles.length === 0) {
      throw new Error("No CSV files found in ~/Desktop/data/indice");
    }

    const results: IndexData[] = [];

    // Process each CSV file
    for (const file of csvFiles) {
      const filePath = path.join(indicePath, file);
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true, skip_empty_lines: true }))
          .on("data", (row) => {
            // Normalize header names
            const headers = Object.keys(row).reduce((acc, key) => {
              acc[key.toLowerCase()] = key;
              return acc;
            }, {} as Record<string, string>);

            const indexNameKey = headers["index_name"] || headers["index name"];
            const indexDateKey = headers["index_date"] || headers["index date"];
            const openIndexValueKey =
              headers["open_index_value"] || headers["open index value"];
            const highIndexValueKey =
              headers["high_index_value"] || headers["high index value"];
            const lowIndexValueKey =
              headers["low_index_value"] || headers["low index value"];
            const closingIndexValueKey =
              headers["closing_index_value"] || headers["closing index value"];
            const pointsChangeKey =
              headers["points_change"] || headers["points change"];
            const changePercentKey =
              headers["change_percent"] || headers["change percent"];
            const volumeKey = headers["volume"];
            const turnoverRsCrKey =
              headers["turnover_rscr"] ||
              headers["turnover rscr"] ||
              headers["turnover"];
            const peKey = headers["pe"] || headers["p_e"] || headers["p/e"];
            const pbKey = headers["pb"] || headers["p_b"] || headers["p/b"];
            const divYieldKey = headers["div_yield"] || headers["div yield"];

            if (!indexNameKey || !indexDateKey || !closingIndexValueKey) {
              reject(
                new Error(
                  `Invalid headers in ${file}: INDEX_NAME, INDEX_DATE, CLOSING_INDEX_VALUE required`
                )
              );
              return;
            }

            results.push({
              indexName: row[indexNameKey]?.trim(),
              indexDate: row[indexDateKey]?.trim(),
              openIndexValue: row[openIndexValueKey]
                ? parseFloat(row[openIndexValueKey]) || null
                : null,
              highIndexValue: row[highIndexValueKey]
                ? parseFloat(row[highIndexValueKey]) || null
                : null,
              lowIndexValue: row[lowIndexValueKey]
                ? parseFloat(row[lowIndexValueKey]) || null
                : null,
              closingIndexValue: parseFloat(row[closingIndexValueKey]) || 0,
              pointsChange: row[pointsChangeKey]
                ? parseFloat(row[pointsChangeKey]) || null
                : null,
              changePercent: row[changePercentKey]
                ? parseFloat(row[changePercentKey]) || null
                : null,
              volume: row[volumeKey]
                ? parseInt(row[volumeKey], 10) || null
                : null,
              turnoverRsCr: row[turnoverRsCrKey]
                ? parseFloat(row[turnoverRsCrKey]) || null
                : null,
              pe: row[peKey] ? parseFloat(row[peKey]) || null : null,
              pb: row[pbKey] ? parseFloat(row[pbKey]) || null : null,
              divYield: row[divYieldKey]
                ? parseFloat(row[divYieldKey]) || null
                : null,
            });
          })
          .on("end", () => resolve())
          .on("error", (err) =>
            reject(new Error(`Failed to parse ${file}: ${err.message}`))
          );
      });
    }

    if (results.length === 0) {
      throw new Error("No valid data found in indice CSV files");
    }

    return results;
  } catch (error) {
    throw new Error(
      `Failed to access or process ~/Desktop/data/indice: ${error}`
    );
  }
}

/**
 * Reads specific CSV files from ~/Desktop/data/indice for the given date(s) and returns an array of IndexData objects.
 * @param dates A single date or array of dates in DDMMYYYY format (e.g., "01072025" or ["01072025", "02072025"])
 * @returns Promise resolving to an array of IndexData objects from the specified files
 * @throws Error if no files are found, files cannot be parsed, or headers are invalid
 */
export async function readIndiceFilesByDates(
  dates: string | string[]
): Promise<IndexData[]> {
  const indicePath = path.join(os.homedir(), "Desktop", "data", "indice");
  const dateArray = Array.isArray(dates) ? dates : [dates];

  // Validate date format (DDMMYYYY)
  for (const date of dateArray) {
    if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
      throw new Error(
        `Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`
      );
    }
  }

  try {
    // Ensure the folder exists
    await fsPromises.access(indicePath);

    const results: IndexData[] = [];

    // Process each specified date
    for (const date of dateArray) {
      const file = `ind_close_all_${date}.csv`;
      const filePath = path.join(indicePath, file);

      try {
        await fsPromises.access(filePath);
      } catch {
        continue; // Skip missing files
      }

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true, skip_empty_lines: true }))
          .on("data", (row) => {
            // Normalize header names
            const headers = Object.keys(row).reduce((acc, key) => {
              acc[key.toLowerCase()] = key;
              return acc;
            }, {} as Record<string, string>);

            const indexNameKey = headers["index_name"] || headers["index name"];
            const indexDateKey = headers["index_date"] || headers["index date"];
            const openIndexValueKey =
              headers["open_index_value"] || headers["open index value"];
            const highIndexValueKey =
              headers["high_index_value"] || headers["high index value"];
            const lowIndexValueKey =
              headers["low_index_value"] || headers["low index value"];
            const closingIndexValueKey =
              headers["closing_index_value"] || headers["closing index value"];
            const pointsChangeKey =
              headers["points_change"] || headers["points change"];
            const changePercentKey =
              headers["change_percent"] || headers["change percent"];
            const volumeKey = headers["volume"];
            const turnoverRsCrKey =
              headers["turnover_rscr"] ||
              headers["turnover rscr"] ||
              headers["turnover"];
            const peKey = headers["pe"] || headers["p_e"] || headers["p/e"];
            const pbKey = headers["pb"] || headers["p_b"] || headers["p/b"];
            const divYieldKey = headers["div_yield"] || headers["div yield"];

            if (!indexNameKey || !indexDateKey || !closingIndexValueKey) {
              reject(
                new Error(
                  `Invalid headers in ${file}: INDEX_NAME, INDEX_DATE, CLOSING_INDEX_VALUE required`
                )
              );
              return;
            }

            results.push({
              indexName: row[indexNameKey]?.trim(),
              indexDate: row[indexDateKey]?.trim(),
              openIndexValue: row[openIndexValueKey]
                ? parseFloat(row[openIndexValueKey]) || null
                : null,
              highIndexValue: row[highIndexValueKey]
                ? parseFloat(row[highIndexValueKey]) || null
                : null,
              lowIndexValue: row[lowIndexValueKey]
                ? parseFloat(row[lowIndexValueKey]) || null
                : null,
              closingIndexValue: parseFloat(row[closingIndexValueKey]) || 0,
              pointsChange: row[pointsChangeKey]
                ? parseFloat(row[pointsChangeKey]) || null
                : null,
              changePercent: row[changePercentKey]
                ? parseFloat(row[changePercentKey]) || null
                : null,
              volume: row[volumeKey]
                ? parseInt(row[volumeKey], 10) || null
                : null,
              turnoverRsCr: row[turnoverRsCrKey]
                ? parseFloat(row[turnoverRsCrKey]) || null
                : null,
              pe: row[peKey] ? parseFloat(row[peKey]) || null : null,
              pb: row[pbKey] ? parseFloat(row[pbKey]) || null : null,
              divYield: row[divYieldKey]
                ? parseFloat(row[divYieldKey]) || null
                : null,
            });
          })
          .on("end", () => resolve())
          .on("error", (err) =>
            reject(new Error(`Failed to parse ${file}: ${err.message}`))
          );
      });
    }

    if (results.length === 0) {
      throw new Error(
        `No valid data found for the specified dates: ${dateArray.join(", ")}`
      );
    }

    return results;
  } catch (error) {
    throw new Error(
      `Failed to access or process ~/Desktop/data/indice: ${error}`
    );
  }
}

/**
 * Reads specific CSV files from ~/Desktop/data/indice for the given date(s) and index name, returning matching IndexData objects.
 * @param dates A single date or array of dates in DDMMYYYY format (e.g., "01072025" or ["01072025", "02072025"])
 * @param indexName The index name to filter by (e.g., "NIFTY 50")
 * @returns Promise resolving to an array of IndexData objects matching the index name from the specified files
 * @throws Error if no files are found, files cannot be parsed, headers are invalid, or no matching data is found
 */
export async function readIndiceFilesByDatesAndIndex(
  dates: string | string[],
  indexName: string
): Promise<IndexData[]> {
  const indicePath = path.join(os.homedir(), "Desktop", "data", "indice");
  const dateArray = Array.isArray(dates) ? dates : [dates];

  // Validate inputs
  if (!indexName || typeof indexName !== "string") {
    throw new Error("Index name must be a non-empty string");
  }
  for (const date of dateArray) {
    if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
      throw new Error(
        `Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`
      );
    }
  }

  try {
    // Ensure the folder exists
    await fsPromises.access(indicePath);

    const results: IndexData[] = [];

    // Process each specified date
    for (const date of dateArray) {
      const file = `ind_close_all_${date}.csv`;
      const filePath = path.join(indicePath, file);

      try {
        await fsPromises.access(filePath);
      } catch {
        continue; // Skip missing files
      }

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(parse({ columns: true, skip_empty_lines: true }))
          .on("data", (row) => {
            // Normalize header names
            const headers = Object.keys(row).reduce((acc, key) => {
              acc[key.toLowerCase()] = key;
              return acc;
            }, {} as Record<string, string>);

            const indexNameKey = headers["index_name"] || headers["index name"];
            const indexDateKey = headers["index_date"] || headers["index date"];
            const openIndexValueKey =
              headers["open_index_value"] || headers["open index value"];
            const highIndexValueKey =
              headers["high_index_value"] || headers["high index value"];
            const lowIndexValueKey =
              headers["low_index_value"] || headers["low index value"];
            const closingIndexValueKey =
              headers["closing_index_value"] || headers["closing index value"];
            const pointsChangeKey =
              headers["points_change"] || headers["points change"];
            const changePercentKey =
              headers["change_percent"] || headers["change percent"];
            const volumeKey = headers["volume"];
            const turnoverRsCrKey =
              headers["turnover_rscr"] ||
              headers["turnover rscr"] ||
              headers["turnover"];
            const peKey = headers["pe"] || headers["p_e"] || headers["p/e"];
            const pbKey = headers["pb"] || headers["p_b"] || headers["p/b"];
            const divYieldKey = headers["div_yield"] || headers["div yield"];

            if (!indexNameKey || !indexDateKey || !closingIndexValueKey) {
              reject(
                new Error(
                  `Invalid headers in ${file}: INDEX_NAME, INDEX_DATE, CLOSING_INDEX_VALUE required`
                )
              );
              return;
            }

            // Filter by indexName (case-insensitive)
            if (
              row[indexNameKey]?.trim().toLowerCase() ===
              indexName.toLowerCase()
            ) {
              results.push({
                indexName: row[indexNameKey]?.trim(),
                indexDate: row[indexDateKey]?.trim(),
                openIndexValue: row[openIndexValueKey]
                  ? parseFloat(row[openIndexValueKey]) || null
                  : null,
                highIndexValue: row[highIndexValueKey]
                  ? parseFloat(row[highIndexValueKey]) || null
                  : null,
                lowIndexValue: row[lowIndexValueKey]
                  ? parseFloat(row[lowIndexValueKey]) || null
                  : null,
                closingIndexValue: parseFloat(row[closingIndexValueKey]) || 0,
                pointsChange: row[pointsChangeKey]
                  ? parseFloat(row[pointsChangeKey]) || null
                  : null,
                changePercent: row[changePercentKey]
                  ? parseFloat(row[changePercentKey]) || null
                  : null,
                volume: row[volumeKey]
                  ? parseInt(row[volumeKey], 10) || null
                  : null,
                turnoverRsCr: row[turnoverRsCrKey]
                  ? parseFloat(row[turnoverRsCrKey]) || null
                  : null,
                pe: row[peKey] ? parseFloat(row[peKey]) || null : null,
                pb: row[pbKey] ? parseFloat(row[pbKey]) || null : null,
                divYield: row[divYieldKey]
                  ? parseFloat(row[divYieldKey]) || null
                  : null,
              });
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
        `No data found for index "${indexName}" on dates: ${dateArray.join(
          ", "
        )}`
      );
    }

    return results;
  } catch (error) {
    throw new Error(
      `Failed to access or process ~/Desktop/data/indice: ${error}`
    );
  }
}
