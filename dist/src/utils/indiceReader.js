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
const INDICE_ROOT = path.join(os.homedir(), "Desktop", "NSE-Data", "data", "indice");
// Utility: Normalize headers with fallback keys
function normalizeHeaders(row) {
    const lower = Object.keys(row).reduce((acc, key) => {
        acc[key.toLowerCase()] = key;
        return acc;
    }, {});
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
        turnoverRsCr: lower["turnover_rscr"] || lower["turnover rscr"] || lower["turnover"],
        pe: lower["pe"] || lower["p_e"] || lower["p/e"],
        pb: lower["pb"] || lower["p_b"] || lower["p/b"],
        divYield: lower["div_yield"] || lower["div yield"],
    };
}
// Utility: Parse a CSV file for IndexData
function parseIndexFile(filePath, filterIndexName) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(filePath)
                .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true }))
                .on("data", (row) => {
                var _a, _b;
                const h = normalizeHeaders(row);
                // Required headers check
                if (!h.indexName || !h.indexDate || !h.closeValue)
                    return;
                // If filter is specified, restrict only to that index name
                if (filterIndexName &&
                    String(row[h.indexName]).trim().toLowerCase() !==
                        filterIndexName.toLowerCase()) {
                    return;
                }
                results.push({
                    indexName: (_a = row[h.indexName]) === null || _a === void 0 ? void 0 : _a.trim(),
                    indexDate: (_b = row[h.indexDate]) === null || _b === void 0 ? void 0 : _b.trim(),
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
                .on("error", (err) => reject(new Error(`Failed to parse ${path.basename(filePath)}: ${err.message}`)));
        });
    });
}
// 1. All files
function readAllIndiceFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        yield fsPromises.access(INDICE_ROOT);
        const files = yield fsPromises.readdir(INDICE_ROOT);
        const csvFiles = files.filter((f) => f.endsWith(".csv"));
        if (!csvFiles.length)
            throw new Error("No CSV files found in ~/Desktop/NSE-Data/data/indice");
        const allResults = [];
        for (const file of csvFiles) {
            const res = yield parseIndexFile(path.join(INDICE_ROOT, file));
            allResults.push(...res);
        }
        if (!allResults.length)
            throw new Error("No valid data found in indice CSV files.");
        return allResults;
    });
}
exports.readAllIndiceFiles = readAllIndiceFiles;
// 2. By dates (accepts string or array)
function readIndiceFilesByDates(dates) {
    return __awaiter(this, void 0, void 0, function* () {
        const arr = Array.isArray(dates) ? dates : [dates];
        for (const date of arr) {
            if (!/^\d{2}\d{2}\d{4}$/.test(date))
                throw new Error(`Invalid date format: ${date}`);
        }
        yield fsPromises.access(INDICE_ROOT);
        let allResults = [];
        for (const date of arr) {
            const file = path.join(INDICE_ROOT, `ind_close_all_${date}.csv`);
            try {
                yield fsPromises.access(file);
                const res = yield parseIndexFile(file);
                allResults.push(...res);
            }
            catch (_a) {
                /* skip missing files */
            }
        }
        if (!allResults.length)
            throw new Error("No valid data found for the specified dates: " + arr.join(", "));
        return allResults;
    });
}
exports.readIndiceFilesByDates = readIndiceFilesByDates;
// 3. By dates and index name
function readIndiceFilesByDatesAndIndex(dates, indexName) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!indexName || typeof indexName !== "string")
            throw new Error("Index name must be a non-empty string");
        const arr = Array.isArray(dates) ? dates : [dates];
        for (const date of arr) {
            if (!/^\d{2}\d{2}\d{4}$/.test(date))
                throw new Error(`Invalid date format: ${date}`);
        }
        yield fsPromises.access(INDICE_ROOT);
        let allResults = [];
        for (const date of arr) {
            const file = path.join(INDICE_ROOT, `ind_close_all_${date}.csv`);
            try {
                yield fsPromises.access(file);
                const res = yield parseIndexFile(file, indexName);
                allResults.push(...res);
            }
            catch (_a) {
                /* skip missing files */
            }
        }
        if (!allResults.length) {
            throw new Error(`No data found for index "${indexName}" on dates: ${arr.join(", ")}`);
        }
        return allResults;
    });
}
exports.readIndiceFilesByDatesAndIndex = readIndiceFilesByDatesAndIndex;
