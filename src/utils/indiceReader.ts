import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse } from "csv-parse";
import { IndexData } from "../types";

const INDICE_ROOT = path.join(
  os.homedir(),
  "Desktop",
  "NSE-Data",
  "data",
  "indice"
);

// Utility: Normalize headers with fallback keys
function normalizeHeaders(row: Record<string, any>) {
  const lower = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase()] = key;
    return acc;
  }, {} as Record<string, string>);
  return {
    indexName: lower["index_name"] || lower["index name"],
    indexDate: lower["index_date"] || lower["index date"],
    openValue: lower["open_index_value"] || lower["open index value"],
    highValue: lower["high_index_value"] || lower["high index value"],
    lowValue: lower["low_index_value"] || lower["low index value"],
    closeValue: lower["closing_index_value"] || lower["closing index value"],
    pointsChange: lower["points_change"] || lower["points change"],
    changePercent: lower["change_percent"] || lower["change percent"],
    volume: lower["volume"],
    turnoverRsCr:
      lower["turnover_rscr"] || lower["turnover rscr"] || lower["turnover"],
    pe: lower["pe"] || lower["p_e"] || lower["p/e"],
    pb: lower["pb"] || lower["p_b"] || lower["p/b"],
    divYield: lower["div_yield"] || lower["div yield"],
  };
}

// Utility: Parse a CSV file for IndexData
async function parseIndexFile(
  filePath: string,
  filterIndexName?: string
): Promise<IndexData[]> {
  return new Promise((resolve, reject) => {
    const results: IndexData[] = [];
    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on("data", (row: Record<string, string>) => {
        const h = normalizeHeaders(row);
        // Required headers check
        if (!h.indexName || !h.indexDate || !h.closeValue) return;

        // If filter is specified, restrict only to that index name
        if (
          filterIndexName &&
          String(row[h.indexName]).trim().toLowerCase() !==
            filterIndexName.toLowerCase()
        ) {
          return;
        }

        results.push({
          indexName: row[h.indexName]?.trim(),
          indexDate: row[h.indexDate]?.trim(),
          openIndexValue: row[h.openValue]
            ? parseFloat(row[h.openValue]) || null
            : null,
          highIndexValue: row[h.highValue]
            ? parseFloat(row[h.highValue]) || null
            : null,
          lowIndexValue: row[h.lowValue]
            ? parseFloat(row[h.lowValue]) || null
            : null,
          closingIndexValue: parseFloat(row[h.closeValue]) || 0,
          pointsChange: row[h.pointsChange]
            ? parseFloat(row[h.pointsChange]) || null
            : null,
          changePercent: row[h.changePercent]
            ? parseFloat(row[h.changePercent]) || null
            : null,
          volume: row[h.volume] ? parseInt(row[h.volume], 10) || null : null,
          turnoverRsCr: row[h.turnoverRsCr]
            ? parseFloat(row[h.turnoverRsCr]) || null
            : null,
          pe: row[h.pe] ? parseFloat(row[h.pe]) || null : null,
          pb: row[h.pb] ? parseFloat(row[h.pb]) || null : null,
          divYield: row[h.divYield]
            ? parseFloat(row[h.divYield]) || null
            : null,
        });
      })
      .on("end", () => resolve(results))
      .on("error", (err) =>
        reject(
          new Error(
            `Failed to parse ${path.basename(filePath)}: ${err.message}`
          )
        )
      );
  });
}

// 1. All files
export async function readAllIndiceFiles(): Promise<IndexData[]> {
  await fsPromises.access(INDICE_ROOT);
  const files = await fsPromises.readdir(INDICE_ROOT);
  const csvFiles = files.filter((f) => f.endsWith(".csv"));
  if (!csvFiles.length)
    throw new Error("No CSV files found in ~/Desktop/NSE-Data/data/indice");

  const allResults: IndexData[] = [];
  for (const file of csvFiles) {
    const res = await parseIndexFile(path.join(INDICE_ROOT, file));
    allResults.push(...res);
  }
  if (!allResults.length)
    throw new Error("No valid data found in indice CSV files.");
  return allResults;
}

// 2. By dates (accepts string or array)
export async function readIndiceFilesByDates(
  dates: string | string[]
): Promise<IndexData[]> {
  const arr = Array.isArray(dates) ? dates : [dates];
  for (const date of arr) {
    if (!/^\d{2}\d{2}\d{4}$/.test(date))
      throw new Error(`Invalid date format: ${date}`);
  }
  await fsPromises.access(INDICE_ROOT);
  let allResults: IndexData[] = [];
  for (const date of arr) {
    const file = path.join(INDICE_ROOT, `ind_close_all_${date}.csv`);
    try {
      await fsPromises.access(file);
      const res = await parseIndexFile(file);
      allResults.push(...res);
    } catch {
      /* skip missing files */
    }
  }
  if (!allResults.length)
    throw new Error(
      "No valid data found for the specified dates: " + arr.join(", ")
    );
  return allResults;
}

// 3. By dates and index name
export async function readIndiceFilesByDatesAndIndex(
  dates: string | string[],
  indexName: string
): Promise<IndexData[]> {
  if (!indexName || typeof indexName !== "string")
    throw new Error("Index name must be a non-empty string");
  const arr = Array.isArray(dates) ? dates : [dates];
  for (const date of arr) {
    if (!/^\d{2}\d{2}\d{4}$/.test(date))
      throw new Error(`Invalid date format: ${date}`);
  }
  await fsPromises.access(INDICE_ROOT);

  let allResults: IndexData[] = [];
  for (const date of arr) {
    const file = path.join(INDICE_ROOT, `ind_close_all_${date}.csv`);
    try {
      await fsPromises.access(file);
      const res = await parseIndexFile(file, indexName);
      allResults.push(...res);
    } catch {
      /* skip missing files */
    }
  }
  if (!allResults.length) {
    throw new Error(
      `No data found for index "${indexName}" on dates: ${arr.join(", ")}`
    );
  }
  return allResults;
}
