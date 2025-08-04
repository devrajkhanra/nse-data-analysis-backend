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
exports.readIndiceFilesByDatesAndIndex = exports.readIndiceFilesByDates = exports.readAllIndiceFiles = void 0;
const fs = __importStar(require("fs"));
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const csv_parse_1 = require("csv-parse");
/**
 * Reads all CSV files from ~/Desktop/data/indice and returns an array of IndexData objects.
 * @returns Promise resolving to an array of IndexData objects from all files
 * @throws Error if the folder is missing, empty, or files cannot be parsed
 */
function readAllIndiceFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        const indicePath = path.join(os.homedir(), "Desktop", "data", "indice");
        try {
            // Ensure the folder exists
            yield fsPromises.access(indicePath);
            // Get all CSV files in the indice folder
            const files = yield fsPromises.readdir(indicePath);
            const csvFiles = files.filter((file) => file.endsWith(".csv"));
            if (csvFiles.length === 0) {
                throw new Error("No CSV files found in ~/Desktop/data/indice");
            }
            const results = [];
            // Process each CSV file
            for (const file of csvFiles) {
                const filePath = path.join(indicePath, file);
                yield new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true }))
                        .on("data", (row) => {
                        var _a, _b;
                        // Normalize header names
                        const headers = Object.keys(row).reduce((acc, key) => {
                            acc[key.toLowerCase()] = key;
                            return acc;
                        }, {});
                        const indexNameKey = headers["index_name"] || headers["index name"];
                        const indexDateKey = headers["index_date"] || headers["index date"];
                        const openIndexValueKey = headers["open_index_value"] || headers["open index value"];
                        const highIndexValueKey = headers["high_index_value"] || headers["high index value"];
                        const lowIndexValueKey = headers["low_index_value"] || headers["low index value"];
                        const closingIndexValueKey = headers["closing_index_value"] || headers["closing index value"];
                        const pointsChangeKey = headers["points_change"] || headers["points change"];
                        const changePercentKey = headers["change_percent"] || headers["change percent"];
                        const volumeKey = headers["volume"];
                        const turnoverRsCrKey = headers["turnover_rscr"] ||
                            headers["turnover rscr"] ||
                            headers["turnover"];
                        const peKey = headers["pe"] || headers["p_e"] || headers["p/e"];
                        const pbKey = headers["pb"] || headers["p_b"] || headers["p/b"];
                        const divYieldKey = headers["div_yield"] || headers["div yield"];
                        if (!indexNameKey || !indexDateKey || !closingIndexValueKey) {
                            reject(new Error(`Invalid headers in ${file}: INDEX_NAME, INDEX_DATE, CLOSING_INDEX_VALUE required`));
                            return;
                        }
                        results.push({
                            indexName: (_a = row[indexNameKey]) === null || _a === void 0 ? void 0 : _a.trim(),
                            indexDate: (_b = row[indexDateKey]) === null || _b === void 0 ? void 0 : _b.trim(),
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
                        .on("error", (err) => reject(new Error(`Failed to parse ${file}: ${err.message}`)));
                });
            }
            if (results.length === 0) {
                throw new Error("No valid data found in indice CSV files");
            }
            return results;
        }
        catch (error) {
            throw new Error(`Failed to access or process ~/Desktop/data/indice: ${error}`);
        }
    });
}
exports.readAllIndiceFiles = readAllIndiceFiles;
/**
 * Reads specific CSV files from ~/Desktop/data/indice for the given date(s) and returns an array of IndexData objects.
 * @param dates A single date or array of dates in DDMMYYYY format (e.g., "01072025" or ["01072025", "02072025"])
 * @returns Promise resolving to an array of IndexData objects from the specified files
 * @throws Error if no files are found, files cannot be parsed, or headers are invalid
 */
function readIndiceFilesByDates(dates) {
    return __awaiter(this, void 0, void 0, function* () {
        const indicePath = path.join(os.homedir(), "Desktop", "data", "indice");
        const dateArray = Array.isArray(dates) ? dates : [dates];
        // Validate date format (DDMMYYYY)
        for (const date of dateArray) {
            if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
                throw new Error(`Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`);
            }
        }
        try {
            // Ensure the folder exists
            yield fsPromises.access(indicePath);
            const results = [];
            // Process each specified date
            for (const date of dateArray) {
                const file = `ind_close_all_${date}.csv`;
                const filePath = path.join(indicePath, file);
                try {
                    yield fsPromises.access(filePath);
                }
                catch (_a) {
                    continue; // Skip missing files
                }
                yield new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true }))
                        .on("data", (row) => {
                        var _a, _b;
                        // Normalize header names
                        const headers = Object.keys(row).reduce((acc, key) => {
                            acc[key.toLowerCase()] = key;
                            return acc;
                        }, {});
                        const indexNameKey = headers["index_name"] || headers["index name"];
                        const indexDateKey = headers["index_date"] || headers["index date"];
                        const openIndexValueKey = headers["open_index_value"] || headers["open index value"];
                        const highIndexValueKey = headers["high_index_value"] || headers["high index value"];
                        const lowIndexValueKey = headers["low_index_value"] || headers["low index value"];
                        const closingIndexValueKey = headers["closing_index_value"] || headers["closing index value"];
                        const pointsChangeKey = headers["points_change"] || headers["points change"];
                        const changePercentKey = headers["change_percent"] || headers["change percent"];
                        const volumeKey = headers["volume"];
                        const turnoverRsCrKey = headers["turnover_rscr"] ||
                            headers["turnover rscr"] ||
                            headers["turnover"];
                        const peKey = headers["pe"] || headers["p_e"] || headers["p/e"];
                        const pbKey = headers["pb"] || headers["p_b"] || headers["p/b"];
                        const divYieldKey = headers["div_yield"] || headers["div yield"];
                        if (!indexNameKey || !indexDateKey || !closingIndexValueKey) {
                            reject(new Error(`Invalid headers in ${file}: INDEX_NAME, INDEX_DATE, CLOSING_INDEX_VALUE required`));
                            return;
                        }
                        results.push({
                            indexName: (_a = row[indexNameKey]) === null || _a === void 0 ? void 0 : _a.trim(),
                            indexDate: (_b = row[indexDateKey]) === null || _b === void 0 ? void 0 : _b.trim(),
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
                        .on("error", (err) => reject(new Error(`Failed to parse ${file}: ${err.message}`)));
                });
            }
            if (results.length === 0) {
                throw new Error(`No valid data found for the specified dates: ${dateArray.join(", ")}`);
            }
            return results;
        }
        catch (error) {
            throw new Error(`Failed to access or process ~/Desktop/data/indice: ${error}`);
        }
    });
}
exports.readIndiceFilesByDates = readIndiceFilesByDates;
/**
 * Reads specific CSV files from ~/Desktop/data/indice for the given date(s) and index name, returning matching IndexData objects.
 * @param dates A single date or array of dates in DDMMYYYY format (e.g., "01072025" or ["01072025", "02072025"])
 * @param indexName The index name to filter by (e.g., "NIFTY 50")
 * @returns Promise resolving to an array of IndexData objects matching the index name from the specified files
 * @throws Error if no files are found, files cannot be parsed, headers are invalid, or no matching data is found
 */
function readIndiceFilesByDatesAndIndex(dates, indexName) {
    return __awaiter(this, void 0, void 0, function* () {
        const indicePath = path.join(os.homedir(), "Desktop", "data", "indice");
        const dateArray = Array.isArray(dates) ? dates : [dates];
        // Validate inputs
        if (!indexName || typeof indexName !== "string") {
            throw new Error("Index name must be a non-empty string");
        }
        for (const date of dateArray) {
            if (!/^\d{2}\d{2}\d{4}$/.test(date)) {
                throw new Error(`Invalid date format: ${date}. Expected DDMMYYYY (e.g., 01072025)`);
            }
        }
        try {
            // Ensure the folder exists
            yield fsPromises.access(indicePath);
            const results = [];
            // Process each specified date
            for (const date of dateArray) {
                const file = `ind_close_all_${date}.csv`;
                const filePath = path.join(indicePath, file);
                try {
                    yield fsPromises.access(filePath);
                }
                catch (_a) {
                    continue; // Skip missing files
                }
                yield new Promise((resolve, reject) => {
                    fs.createReadStream(filePath)
                        .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true }))
                        .on("data", (row) => {
                        var _a, _b, _c;
                        // Normalize header names
                        const headers = Object.keys(row).reduce((acc, key) => {
                            acc[key.toLowerCase()] = key;
                            return acc;
                        }, {});
                        const indexNameKey = headers["index_name"] || headers["index name"];
                        const indexDateKey = headers["index_date"] || headers["index date"];
                        const openIndexValueKey = headers["open_index_value"] || headers["open index value"];
                        const highIndexValueKey = headers["high_index_value"] || headers["high index value"];
                        const lowIndexValueKey = headers["low_index_value"] || headers["low index value"];
                        const closingIndexValueKey = headers["closing_index_value"] || headers["closing index value"];
                        const pointsChangeKey = headers["points_change"] || headers["points change"];
                        const changePercentKey = headers["change_percent"] || headers["change percent"];
                        const volumeKey = headers["volume"];
                        const turnoverRsCrKey = headers["turnover_rscr"] ||
                            headers["turnover rscr"] ||
                            headers["turnover"];
                        const peKey = headers["pe"] || headers["p_e"] || headers["p/e"];
                        const pbKey = headers["pb"] || headers["p_b"] || headers["p/b"];
                        const divYieldKey = headers["div_yield"] || headers["div yield"];
                        if (!indexNameKey || !indexDateKey || !closingIndexValueKey) {
                            reject(new Error(`Invalid headers in ${file}: INDEX_NAME, INDEX_DATE, CLOSING_INDEX_VALUE required`));
                            return;
                        }
                        // Filter by indexName (case-insensitive)
                        if (((_a = row[indexNameKey]) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase()) ===
                            indexName.toLowerCase()) {
                            results.push({
                                indexName: (_b = row[indexNameKey]) === null || _b === void 0 ? void 0 : _b.trim(),
                                indexDate: (_c = row[indexDateKey]) === null || _c === void 0 ? void 0 : _c.trim(),
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
                        .on("error", (err) => reject(new Error(`Failed to parse ${file}: ${err.message}`)));
                });
            }
            if (results.length === 0) {
                throw new Error(`No data found for index "${indexName}" on dates: ${dateArray.join(", ")}`);
            }
            return results;
        }
        catch (error) {
            throw new Error(`Failed to access or process ~/Desktop/data/indice: ${error}`);
        }
    });
}
exports.readIndiceFilesByDatesAndIndex = readIndiceFilesByDatesAndIndex;
