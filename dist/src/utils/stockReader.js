"use strict";
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
exports.readStockFilesByDatesAndSymbol = exports.readStockFilesByDates = void 0;
const fs = __importStar(require("fs"));
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const csv_parse_1 = require("csv-parse");
const nifty50Reader_1 = require("./nifty50Reader"); // Adjust the path as necessary
/**
 * Read stock data files for given dates and return only Nifty50 EQ securities.
 * @param dates Single date or array, e.g., "01072025" or ["01072025"]
 */
function readStockFilesByDates(dates) {
    return __awaiter(this, void 0, void 0, function* () {
        const stockPath = path.join(os.homedir(), "Desktop", "NSE-Data", "data", "stock");
        const dateArray = Array.isArray(dates) ? dates : [dates];
        // 1. Get all Nifty50 symbols
        const nifty50List = yield (0, nifty50Reader_1.readNifty50List)();
        const nifty50Symbols = new Set(nifty50List.map((el) => el.symbol.trim().toUpperCase()));
        const results = [];
        // 2. For each requested date, open the right file
        for (const date of dateArray) {
            if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
                throw new Error(`Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`);
            }
            const file = `sec_bhavdata_full_${date}.csv`;
            const filePath = path.join(stockPath, file);
            try {
                yield fsPromises.access(filePath);
            }
            catch (_a) {
                continue; // Skip missing files
            }
            yield new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true, trim: true }))
                    .on("data", (row) => {
                    // Normalize headers
                    const headers = Object.keys(row).reduce((acc, key) => {
                        acc[key.toLowerCase().trim()] = key;
                        return acc;
                    }, {});
                    const symbolKey = headers["symbol"];
                    const seriesKey = headers["series"];
                    if (!symbolKey ||
                        !seriesKey ||
                        typeof row[symbolKey] !== "string" ||
                        typeof row[seriesKey] !== "string") {
                        // Skip if key not present
                        return;
                    }
                    // Only process EQ series and if symbol is in Nifty 50
                    if (row[seriesKey].trim().toUpperCase() === "EQ" &&
                        nifty50Symbols.has(row[symbolKey].trim().toUpperCase())) {
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
                        }
                        catch (e) {
                            // Ignore parse errors for this row
                        }
                    }
                })
                    .on("end", () => resolve())
                    .on("error", (err) => reject(new Error(`Failed to parse ${file}: ${err.message}`)));
            });
        }
        if (results.length === 0) {
            throw new Error("No valid Nifty 50 EQ data found in stock CSV files for the given dates.");
        }
        return results;
    });
}
exports.readStockFilesByDates = readStockFilesByDates;
/**
 * Reads stock data for given dates and a specific symbol, matching only EQ series and present in Nifty 50
 * @param dates Single date or array of dates in DDMMYYYY format
 * @param symbol Symbol to filter by (case-insensitive)
 * @returns Promise resolving to array of SecurityData objects for the symbol on the given dates
 */
function readStockFilesByDatesAndSymbol(dates, symbol) {
    return __awaiter(this, void 0, void 0, function* () {
        const stockPath = path.join(os.homedir(), "Desktop", "NSE-Data", "data", "stock");
        const dateArray = Array.isArray(dates) ? dates : [dates];
        const symbolUpper = symbol.trim().toUpperCase();
        // Load Nifty 50 symbols for validation
        const nifty50List = yield (0, nifty50Reader_1.readNifty50List)();
        const nifty50Symbols = new Set(nifty50List.map((el) => el.symbol.trim().toUpperCase()));
        if (!nifty50Symbols.has(symbolUpper)) {
            throw new Error(`Symbol "${symbol}" is not in the Nifty 50 list.`);
        }
        const results = [];
        for (const date of dateArray) {
            if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
                throw new Error(`Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`);
            }
            const file = `sec_bhavdata_full_${date}.csv`;
            const filePath = path.join(stockPath, file);
            try {
                yield fsPromises.access(filePath);
            }
            catch (_a) {
                continue; // Skip missing files
            }
            yield new Promise((resolve, reject) => {
                fs.createReadStream(filePath)
                    .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true, trim: true }))
                    .on("data", (row) => {
                    const headers = Object.keys(row).reduce((acc, key) => {
                        acc[key.toLowerCase().trim()] = key;
                        return acc;
                    }, {});
                    const symbolKey = headers["symbol"];
                    const seriesKey = headers["series"];
                    if (!symbolKey ||
                        !seriesKey ||
                        typeof row[symbolKey] !== "string" ||
                        typeof row[seriesKey] !== "string") {
                        return;
                    }
                    // Match series EQ and symbol match case-insensitive
                    if (row[seriesKey].trim().toUpperCase() === "EQ" &&
                        row[symbolKey].trim().toUpperCase() === symbolUpper) {
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
                        }
                        catch (_a) {
                            // Ignore parsing errors on row
                        }
                    }
                })
                    .on("end", () => resolve())
                    .on("error", (err) => reject(new Error(`Failed to parse ${file}: ${err.message}`)));
            });
        }
        if (results.length === 0) {
            throw new Error(`No valid EQ data found for symbol "${symbol}" on dates: ${dateArray.join(", ")}`);
        }
        return results;
    });
}
exports.readStockFilesByDatesAndSymbol = readStockFilesByDatesAndSymbol;
