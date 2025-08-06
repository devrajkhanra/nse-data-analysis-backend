"use strict";
// import * as fs from "fs";
// import * as fsPromises from "fs/promises";
// import * as path from "path";
// import * as os from "os";
// import { parse } from "csv-parse";
// import { OptionRow } from "../types";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readOptionFilesByDates = exports.readAllOptionFiles = void 0;
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
const fs = __importStar(require("fs"));
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const csv_parse_1 = require("csv-parse");
const OPTION_ROOT = path.join(os.homedir(), "Desktop", "NSE-Data", "data", "option");
function normalizeHeaders(row) {
    const lower = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase().replace(/\s+/g, "").replace("*", "")] = key;
        return acc;
    }, {});
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
function parseOptionFile(filePath) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe((0, csv_parse_1.parse)({
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true,
                relax_quotes: true,
            }))
                .on("data", (row) => {
                var _a;
                const firstValue = ((_a = Object.values(row)[0]) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                if (firstValue.startsWith("*"))
                    return;
                const h = normalizeHeaders(row);
                if (!h.instrument ||
                    !h.symbol ||
                    !h.expDate ||
                    !h.strPrice ||
                    !h.optType) {
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
                }
                catch (_b) {
                    // ignore parse errors on this row
                }
            })
                .on("end", () => resolve(results))
                .on("error", (err) => reject(new Error(`Failed to parse ${path.basename(filePath)}: ${err.message}`)));
        });
    });
}
function readAllOptionFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fsPromises.access(OPTION_ROOT);
        const files = yield fsPromises.readdir(OPTION_ROOT);
        const optionFiles = files.filter((f) => /^op\d{8}\.csv$/i.test(f));
        if (!optionFiles.length)
            throw new Error("No option files matching pattern 'opDDMMYYYY.csv' found in option data directory.");
        let allData = [];
        for (const file of optionFiles) {
            try {
                const data = yield parseOptionFile(path.join(OPTION_ROOT, file));
                allData = allData.concat(data);
            }
            catch (error) {
                console.warn(`Warning: Failed to parse file ${file}: ${error.message}`);
            }
        }
        if (!allData.length)
            throw new Error("No valid option data found in any CSV files.");
        return allData;
    });
}
exports.readAllOptionFiles = readAllOptionFiles;
function readOptionFilesByDates(dates) {
    return __awaiter(this, void 0, void 0, function* () {
        const dateArray = Array.isArray(dates) ? dates : [dates];
        for (const d of dateArray) {
            if (!/^\d{8}$/.test(d)) {
                throw new Error(`Invalid date format '${d}'. Expected DDMMYYYY.`);
            }
        }
        yield fsPromises.access(OPTION_ROOT);
        const filesToRead = dateArray.map((d) => `op${d}.csv`);
        let allRows = [];
        for (const fileName of filesToRead) {
            const fullPath = path.join(OPTION_ROOT, fileName);
            try {
                yield fsPromises.access(fullPath);
            }
            catch (_a) {
                console.warn(`Option file missing for date: ${fileName}`);
                continue;
            }
            try {
                const parsed = yield parseOptionFile(fullPath);
                allRows = allRows.concat(parsed);
            }
            catch (error) {
                console.warn(`Warning: Failed to parse option file ${fileName}: ${error.message}`);
            }
        }
        if (!allRows.length)
            throw new Error(`No valid option data found for given date(s): ${dateArray.join(", ")}`);
        return allRows;
    });
}
exports.readOptionFilesByDates = readOptionFilesByDates;
