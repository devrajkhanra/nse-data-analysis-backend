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
exports.readNifty50List = void 0;
const fs = __importStar(require("fs"));
const fsPromises = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const csv_parse_1 = require("csv-parse");
/**
 * Reads the nifty50list.csv file from ~/Desktop/data/broad and returns an array of Nifty50Company objects.
 * @returns Promise resolving to an array of Nifty50Company objects
 * @throws Error if the file is missing, cannot be parsed, or has invalid headers
 */
function readNifty50List() {
    return __awaiter(this, void 0, void 0, function* () {
        const dataPath = path.join(os.homedir(), "Desktop", "data", "broad", "nifty50list.csv");
        try {
            // Ensure the file exists
            yield fsPromises.access(dataPath);
            const results = [];
            return new Promise((resolve, reject) => {
                fs.createReadStream(dataPath)
                    .pipe((0, csv_parse_1.parse)({ columns: true, skip_empty_lines: true }))
                    .on("data", (row) => {
                    var _a, _b, _c, _d, _e;
                    // Normalize header names to handle variations (e.g., case-insensitive)
                    const headers = Object.keys(row).reduce((acc, key) => {
                        acc[key.toLowerCase()] = key;
                        return acc;
                    }, {});
                    const companyNameKey = headers["company_name"] || headers["company name"];
                    const industryKey = headers["industry"];
                    const symbolKey = headers["symbol"];
                    const seriesKey = headers["series"];
                    const isinCodeKey = headers["isin_code"] || headers["isin code"];
                    if (!companyNameKey ||
                        !industryKey ||
                        !symbolKey ||
                        !seriesKey ||
                        !isinCodeKey) {
                        reject(new Error("Invalid headers in nifty50list.csv: COMPANY_NAME, INDUSTRY, SYMBOL, SERIES, ISIN_CODE required"));
                        return;
                    }
                    results.push({
                        companyName: (_a = row[companyNameKey]) === null || _a === void 0 ? void 0 : _a.trim(),
                        industry: (_b = row[industryKey]) === null || _b === void 0 ? void 0 : _b.trim(),
                        symbol: (_c = row[symbolKey]) === null || _c === void 0 ? void 0 : _c.trim(),
                        series: (_d = row[seriesKey]) === null || _d === void 0 ? void 0 : _d.trim(),
                        isinCode: (_e = row[isinCodeKey]) === null || _e === void 0 ? void 0 : _e.trim(),
                    });
                })
                    .on("end", () => {
                    if (results.length === 0) {
                        reject(new Error("nifty50list.csv is empty or contains no valid data"));
                    }
                    else {
                        resolve(results);
                    }
                })
                    .on("error", (err) => reject(new Error(`Failed to parse nifty50list.csv: ${err.message}`)));
            });
        }
        catch (error) {
            throw new Error(`nifty50list.csv not found at ${dataPath}`);
        }
    });
}
exports.readNifty50List = readNifty50List;
