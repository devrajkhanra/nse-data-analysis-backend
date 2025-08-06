// import * as fs from "fs";
// import * as fsPromises from "fs/promises";
// import * as path from "path";
// import * as os from "os";
// import { parse } from "csv-parse";
// import { OptionRow } from "../types";

// // Directory containing option CSV files
// const OPTION_ROOT = path.join(
//   os.homedir(),
//   "Desktop",
//   "NSE-Data",
//   "data",
//   "option"
// );

// // Normalize CSV headers to standard keys (remove spaces, asterisks, case-insensitive)
// function normalizeHeaders(row: Record<string, unknown>) {
//   const lower = Object.keys(row).reduce((acc, key) => {
//     acc[key.toLowerCase().replace(/\s+/g, "").replace("*", "")] = key;
//     return acc;
//   }, {} as Record<string, string>);

//   return {
//     instrument: lower["instrument"],
//     symbol: lower["symbol"],
//     expDate: lower["exp_date"] || lower["expdate"],
//     strPrice: lower["str_price"] || lower["strikeprice"] || lower["strike"],
//     optType: lower["opt_type"] || lower["type"],
//     openPrice: lower["open_price"],
//     hiPrice: lower["hi_price"],
//     loPrice: lower["lo_price"],
//     closePrice: lower["close_price"],
//     openInt: lower["open_int"] || lower["openint"],
//     trdQty: lower["trd_qty"] || lower["trade_qty"],
//     noOfCont: lower["no_of_cont"],
//     noOfTrade: lower["no_of_trade"],
//     notionVal: lower["notion_val"] || lower["notionalval"],
//     prVal: lower["pr_val"] || lower["prval"],
//   };
// }

// /**
//  * Parse a single option CSV file into an array of OptionRow
//  * Skips comment/footer lines starting with '*' in the first column.
//  * Uses relaxed CSV parser settings for robustness.
//  *
//  * @param filePath Full file path to read
//  * @returns Promise<OptionRow[]>
//  */
// async function parseOptionFile(filePath: string): Promise<OptionRow[]> {
//   return new Promise((resolve, reject) => {
//     const results: OptionRow[] = [];

//     fs.createReadStream(filePath)
//       .pipe(
//         parse({
//           columns: true,
//           skip_empty_lines: true,
//           trim: true,
//           relax_column_count: true, // Allows rows with wrong number of columns
//           relax_quotes: true, // Allows some malformed quotes
//           // Uncomment if your version supports to skip faulty rows
//           // skip_records_with_error: true,
//         })
//       )
//       .on("data", (row: Record<string, string>) => {
//         // Skip comment/comment lines starting with '*'
//         const firstValue = Object.values(row)[0]?.trim() || "";
//         if (firstValue.startsWith("*")) return;

//         const h = normalizeHeaders(row);

//         if (
//           !h.instrument ||
//           !h.symbol ||
//           !h.expDate ||
//           !h.strPrice ||
//           !h.optType
//         ) {
//           // Skip rows missing mandatory columns
//           return;
//         }

//         try {
//           results.push({
//             instrument: row[h.instrument].trim(),
//             symbol: row[h.symbol].trim(),
//             expDate: row[h.expDate].trim(),
//             strPrice: parseFloat(row[h.strPrice]),
//             optType: row[h.optType].trim(),
//             openPrice: parseFloat(row[h.openPrice]) || 0,
//             hiPrice: parseFloat(row[h.hiPrice]) || 0,
//             loPrice: parseFloat(row[h.loPrice]) || 0,
//             closePrice: parseFloat(row[h.closePrice]) || 0,
//             openInt: parseFloat(row[h.openInt]) || 0,
//             trdQty: parseInt(row[h.trdQty], 10) || 0,
//             noOfCont: parseInt(row[h.noOfCont], 10) || 0,
//             noOfTrade: parseInt(row[h.noOfTrade], 10) || 0,
//             notionVal: parseFloat(row[h.notionVal]) || 0,
//             prVal: parseFloat(row[h.prVal]) || 0,
//           });
//         } catch {
//           // Skip malformed rows silently
//         }
//       })
//       .on("end", () => resolve(results))
//       .on("error", (err) =>
//         reject(
//           new Error(
//             `Failed to parse ${path.basename(filePath)}: ${err.message}`
//           )
//         )
//       );
//   });
// }

// /**
//  * Reads all option CSV files matching pattern opDDMMYYYY.csv from option folder.
//  * Returns a combined array of all parsed OptionRow.
//  * Throws if no matching files or no valid data found.
//  */
// export async function readAllOptionFiles(): Promise<OptionRow[]> {
//   // Check existence of option folder
//   await fsPromises.access(OPTION_ROOT);

//   // Read available files in directory
//   const files = await fsPromises.readdir(OPTION_ROOT);

//   // Filter files matching pattern like op01082025.csv
//   const optionFiles = files.filter((f) => /^op\d{8}\.csv$/i.test(f));

//   if (!optionFiles.length) {
//     throw new Error(
//       "No option files matching pattern 'opDDMMYYYY.csv' found in ~/Desktop/NSE-Data/data/option"
//     );
//   }

//   let allData: OptionRow[] = [];

//   for (const file of optionFiles) {
//     try {
//       const fileData = await parseOptionFile(path.join(OPTION_ROOT, file));
//       allData = allData.concat(fileData);
//     } catch (err) {
//       console.warn(
//         `Warning: Failed to parse file ${file}: ${(err as Error).message}`
//       );
//       // Continue processing remaining files
//     }
//   }

//   if (!allData.length) {
//     throw new Error("No valid option data found in any option CSV files.");
//   }

//   return allData;
// }

// /**
//  * Reads and parses option CSV files for the given date(s).
//  * @param dates - a single date string (DDMMYYYY) or an array of date strings
//  * @returns Promise<OptionRow[]> combined option rows for all matching dates
//  * @throws if no valid files or data found
//  */
// export async function readOptionFilesByDates(
//   dates: string | string[]
// ): Promise<OptionRow[]> {
//   const dateArray = Array.isArray(dates) ? dates : [dates];

//   // Validate that each date matches DDMMYYYY format
//   for (const d of dateArray) {
//     if (!/^\d{8}$/.test(d)) {
//       throw new Error(
//         `Invalid date format '${d}'. Expected DDMMYYYY (e.g. 01072025)`
//       );
//     }
//   }

//   await fsPromises.access(OPTION_ROOT);

//   // Compose expected filenames like opDDMMYYYY.csv for each date
//   const filesToRead = dateArray.map((d) => `op${d}.csv`);

//   let allRows: OptionRow[] = [];

//   for (const fileName of filesToRead) {
//     const fullPath = path.join(OPTION_ROOT, fileName);
//     try {
//       await fsPromises.access(fullPath);
//     } catch {
//       // Skip missing files, optionally warn here
//       console.warn(`Option file missing for date: ${fileName}`);
//       continue;
//     }

//     try {
//       const parsed = await parseOptionFile(fullPath);
//       allRows = allRows.concat(parsed);
//     } catch (err) {
//       console.warn(
//         `Warning: Failed to parse option file ${fileName}: ${
//           (err as Error).message
//         }`
//       );
//       // Continue reading other files
//     }
//   }

//   if (allRows.length === 0) {
//     throw new Error(
//       `No valid option data found for given date(s): ${dateArray.join(", ")}`
//     );
//   }

//   return allRows;
// }

import * as fs from "fs";
import * as fsPromises from "fs/promises";
import * as path from "path";
import * as os from "os";
import { parse } from "csv-parse";
import { OptionRow } from "../types";

const OPTION_ROOT = path.join(
  os.homedir(),
  "Desktop",
  "NSE-Data",
  "data",
  "option"
);

function normalizeHeaders(row: Record<string, unknown>) {
  const lower = Object.keys(row).reduce((acc, key) => {
    acc[key.toLowerCase().replace(/\s+/g, "").replace("*", "")] = key;
    return acc;
  }, {} as Record<string, string>);

  return {
    instrument: lower["instrument"],
    symbol: lower["symbol"],
    expDate: lower["exp_date"] || lower["expdate"],
    strPrice: lower["str_price"] || lower["strikeprice"] || lower["strike"],
    optType: lower["opt_type"] || lower["type"],
    openPrice: lower["open_price"],
    hiPrice: lower["hi_price"],
    loPrice: lower["lo_price"],
    closePrice: lower["close_price"],
    openInt: lower["open_int"] || lower["openint"],
    trdQty: lower["trd_qty"] || lower["trade_qty"],
    noOfCont: lower["no_of_cont"],
    noOfTrade: lower["no_of_trade"],
    notionVal: lower["notion_val"] || lower["notionalval"],
    prVal: lower["pr_val"] || lower["prval"],
  };
}

async function parseOptionFile(filePath: string): Promise<OptionRow[]> {
  return new Promise((resolve, reject) => {
    const results: OptionRow[] = [];

    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_column_count: true,
          relax_quotes: true,
        })
      )
      .on("data", (row: Record<string, string>) => {
        const firstValue = Object.values(row)[0]?.trim() || "";
        if (firstValue.startsWith("*")) return;

        const h = normalizeHeaders(row);
        if (
          !h.instrument ||
          !h.symbol ||
          !h.expDate ||
          !h.strPrice ||
          !h.optType
        ) {
          return;
        }
        try {
          results.push({
            instrument: row[h.instrument].trim(),
            symbol: row[h.symbol].trim(),
            expDate: row[h.expDate].trim(),
            strPrice: parseFloat(row[h.strPrice]),
            optType: row[h.optType].trim(),
            openPrice: parseFloat(row[h.openPrice]) || 0,
            hiPrice: parseFloat(row[h.hiPrice]) || 0,
            loPrice: parseFloat(row[h.loPrice]) || 0,
            closePrice: parseFloat(row[h.closePrice]) || 0,
            openInt: parseFloat(row[h.openInt]) || 0,
            trdQty: parseInt(row[h.trdQty], 10) || 0,
            noOfCont: parseInt(row[h.noOfCont], 10) || 0,
            noOfTrade: parseInt(row[h.noOfTrade], 10) || 0,
            notionVal: parseFloat(row[h.notionVal]) || 0,
            prVal: parseFloat(row[h.prVal]) || 0,
          });
        } catch {
          // ignore parse errors on this row
        }
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

export async function readAllOptionFiles(): Promise<OptionRow[]> {
  await fsPromises.access(OPTION_ROOT);
  const files = await fsPromises.readdir(OPTION_ROOT);
  const optionFiles = files.filter((f) => /^op\d{8}\.csv$/i.test(f));
  if (!optionFiles.length)
    throw new Error(
      "No option files matching pattern 'opDDMMYYYY.csv' found in option data directory."
    );
  let allData: OptionRow[] = [];
  for (const file of optionFiles) {
    try {
      const data = await parseOptionFile(path.join(OPTION_ROOT, file));
      allData = allData.concat(data);
    } catch (error) {
      console.warn(
        `Warning: Failed to parse file ${file}: ${(error as Error).message}`
      );
    }
  }
  if (!allData.length)
    throw new Error("No valid option data found in any CSV files.");
  return allData;
}

export async function readOptionFilesByDates(
  dates: string | string[]
): Promise<OptionRow[]> {
  const dateArray = Array.isArray(dates) ? dates : [dates];
  for (const d of dateArray) {
    if (!/^\d{8}$/.test(d)) {
      throw new Error(`Invalid date format '${d}'. Expected DDMMYYYY.`);
    }
  }
  await fsPromises.access(OPTION_ROOT);
  const filesToRead = dateArray.map((d) => `op${d}.csv`);
  let allRows: OptionRow[] = [];
  for (const fileName of filesToRead) {
    const fullPath = path.join(OPTION_ROOT, fileName);
    try {
      await fsPromises.access(fullPath);
    } catch {
      console.warn(`Option file missing for date: ${fileName}`);
      continue;
    }
    try {
      const parsed = await parseOptionFile(fullPath);
      allRows = allRows.concat(parsed);
    } catch (error) {
      console.warn(
        `Warning: Failed to parse option file ${fileName}: ${
          (error as Error).message
        }`
      );
    }
  }
  if (!allRows.length)
    throw new Error(
      `No valid option data found for given date(s): ${dateArray.join(", ")}`
    );
  return allRows;
}
