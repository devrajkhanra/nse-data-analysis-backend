"use strict";
// import { Router } from "express";
// import * as fsPromises from "fs/promises";
// import * as os from "os";
// import * as path from "path";
// import {
//   readAllOptionFiles,
//   readOptionFilesByDates,
// } from "../utils/optionReader";
// import { OptionRow, OptionChain } from "../types";
// const OPTION_ROOT = path.join(
//   os.homedir(),
//   "Desktop",
//   "NSE-Data",
//   "data",
//   "option"
// );
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
// const router = Router();
// /**
//  * @route GET /option/chain
//  * @desc Get option chain for given symbol (e.g. BANKNIFTY) and expiry (e.g. 31-07-2025)
//  * @queryParam symbol: string - required
//  * @queryParam expiry: string - required, date format should match data (e.g. DD-MM-YYYY)
//  */
// router.get("/option/chain", async (req, res) => {
//   try {
//     const { symbol, expiry, dates } = req.query;
//     if (
//       !symbol ||
//       typeof symbol !== "string" ||
//       !expiry ||
//       typeof expiry !== "string"
//     ) {
//       return res.status(400).json({
//         error: "Query parameters 'symbol' and 'expiry' (strings) are required.",
//       });
//     }
//     let optionRows: OptionRow[] = [];
//     if (dates) {
//       let dateArray: string[] = [];
//       if (typeof dates === "string") {
//         dateArray = dates.split(",").map((d) => d.trim());
//       } else if (Array.isArray(dates)) {
//         dateArray = dates.map((d) => String(d).trim());
//       } else {
//         return res.status(400).json({ error: "'dates' parameter is invalid." });
//       }
//       try {
//         optionRows = await readOptionFilesByDates(dateArray);
//       } catch (err: any) {
//         return res
//           .status(500)
//           .json({
//             error: `Failed to read option files for dates: ${err.message}`,
//           });
//       }
//     } else {
//       // If no dates param, load all option files
//       try {
//         optionRows = await readAllOptionFiles();
//       } catch (err: any) {
//         return res
//           .status(500)
//           .json({ error: `Failed to read option files: ${err.message}` });
//       }
//     }
//     const chain: OptionChain | null = buildOptionChainForSymbolAndExpiry(
//       optionRows,
//       symbol,
//       expiry
//     );
//     if (!chain) {
//       return res.status(404).json({
//         error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
//       });
//     }
//     return res.json(chain);
//   } catch (error: any) {
//     return res
//       .status(500)
//       .json({ error: error.message || "Internal Server Error" });
//   }
// });
// /**
//  * @route GET /option/test
//  * @desc Returns unique symbols and expiries available in option data
//  */
// router.get("/option/test", async (req, res) => {
//   try {
//     const optionRows: OptionRow[] = await readAllOptionFiles();
//     if (!optionRows.length) {
//       return res.status(404).json({ error: "No option data found." });
//     }
//     // Extract unique symbols and expiries, showing combinations
//     const uniqueCombos = Array.from(
//       new Set(
//         optionRows.map(
//           (r) => `${JSON.stringify(r.symbol)} | ${JSON.stringify(r.expDate)}`
//         )
//       )
//     );
//     // Also unique lists for convenience
//     const uniqueSymbols = Array.from(new Set(optionRows.map((r) => r.symbol)));
//     const uniqueExpiries = Array.from(
//       new Set(optionRows.map((r) => r.expDate))
//     );
//     // Optional: show a few sample OptionRows for inspection
//     const sampleRows = optionRows.slice(0, 5);
//     return res.json({
//       uniqueSymbolExpiryCombos: uniqueCombos,
//       uniqueSymbols,
//       uniqueExpiries,
//       sampleRows,
//     });
//   } catch (error: any) {
//     return res.status(500).json({ error: error?.message || String(error) });
//   }
// });
// /**
//  * GET /option/available-dates
//  * Returns a sorted array of dates (string in DDMMYYYY) for which option CSV files exist.
//  */
// router.get("/option/available-dates", async (req, res) => {
//   try {
//     const files = await fsPromises.readdir(OPTION_ROOT);
//     const dates = files
//       .map((f) => {
//         const match = f.match(/^op(\d{8})\.csv$/i);
//         return match ? match[1] : null;
//       })
//       .filter((d) => d !== null) as string[];
//     dates.sort();
//     res.json(dates);
//   } catch (err: any) {
//     res
//       .status(500)
//       .json({ error: err.message || "Failed to list option dates." });
//   }
// });
// export default router;
// src/routes/option.ts
const express_1 = require("express");
const fsPromises = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const optionReader_1 = require("../utils/optionReader");
const optionChainBuilder_1 = require("../helpers/optionChainBuilder");
const optionChainDeltas_1 = require("../helpers/optionChainDeltas");
const router = (0, express_1.Router)();
const OPTION_ROOT = path.join(os.homedir(), "Desktop", "NSE-Data", "data", "option");
/**
 * GET /option/test
 * Returns unique symbol-expiry combos along with unique symbols, expiries, and sample option rows.
 */
router.get("/option/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const optionRows = yield (0, optionReader_1.readAllOptionFiles)();
        if (!optionRows.length) {
            return res.status(404).json({ error: "No option data found." });
        }
        const uniqueCombos = Array.from(new Set(optionRows.map((r) => `${JSON.stringify(r.symbol)} | ${JSON.stringify(r.expDate)}`)));
        const uniqueSymbols = Array.from(new Set(optionRows.map((r) => r.symbol)));
        const uniqueExpiries = Array.from(new Set(optionRows.map((r) => r.expDate)));
        const sampleRows = optionRows.slice(0, 5);
        return res.json({
            uniqueSymbolExpiryCombos: uniqueCombos,
            uniqueSymbols,
            uniqueExpiries,
            sampleRows,
        });
    }
    catch (error) {
        return res.status(500).json({ error: (error === null || error === void 0 ? void 0 : error.message) || String(error) });
    }
}));
/**
 * GET /option/available-dates
 * Returns sorted list of available option CSV dates (DDMMYYYY) in option folder.
 */
router.get("/option/available-dates", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const files = yield fsPromises.readdir(OPTION_ROOT);
        const dates = files
            .map((f) => {
            const match = f.match(/^op(\d{8})\.csv$/i);
            return match ? match[1] : null;
        })
            .filter((d) => d !== null);
        dates.sort();
        res.json(dates);
    }
    catch (err) {
        res
            .status(500)
            .json({ error: err.message || "Failed to list option dates." });
    }
}));
/**
 * GET /option/chain
 * Required query params:
 *  - symbol: option symbol (e.g. BANKNIFTY)
 *  - expiry: expiry date string (e.g. 31-07-2025)
 * Optional:
 *  - dates: comma-separated list of DDMMYYYY dates for files to load (default: all)
 *  - previousDate: single DDMMYYYY date string for previous day data (to compute deltas)
 * Returns option chain data with optional delta fields.
 */
router.get("/option/chain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, expiry, dates, previousDate } = req.query;
        if (!symbol ||
            typeof symbol !== "string" ||
            !expiry ||
            typeof expiry !== "string") {
            return res.status(400).json({
                error: "Query parameters 'symbol' and 'expiry' are required and must be strings.",
            });
        }
        // Parse dates param if supplied
        let dateArray = [];
        if (dates) {
            if (typeof dates === "string") {
                dateArray = dates.split(",").map((d) => d.trim());
            }
            else if (Array.isArray(dates)) {
                dateArray = dates.map((d) => String(d).trim());
            }
            else {
                return res.status(400).json({ error: "'dates' parameter is invalid." });
            }
        }
        const prevDateStr = typeof previousDate === "string" ? previousDate.trim() : undefined;
        // Load current option rows
        let currentOptionRows = [];
        if (dateArray.length > 0) {
            currentOptionRows = yield (0, optionReader_1.readOptionFilesByDates)(dateArray);
        }
        else {
            currentOptionRows = yield (0, optionReader_1.readAllOptionFiles)();
        }
        // Load previous day's option rows if previousDate specified
        let previousOptionRows = [];
        if (prevDateStr) {
            try {
                previousOptionRows = yield (0, optionReader_1.readOptionFilesByDates)(prevDateStr);
            }
            catch (err) {
                console.warn(`Failed to load previous date data ${prevDateStr}: ${err.message}`);
            }
        }
        // Return option chain with delta if previous day data present
        if (prevDateStr && previousOptionRows.length > 0) {
            const chainWithDeltas = (0, optionChainDeltas_1.buildOptionChainWithDeltas)(currentOptionRows, previousOptionRows, symbol, expiry);
            if (!chainWithDeltas) {
                return res.status(404).json({
                    error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
                });
            }
            return res.json(chainWithDeltas);
        }
        // Otherwise return regular option chain without delta
        const standardChain = (0, optionChainBuilder_1.buildOptionChainForSymbolAndExpiry)(currentOptionRows, symbol, expiry);
        if (!standardChain) {
            return res.status(404).json({
                error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
            });
        }
        return res.json(standardChain);
    }
    catch (error) {
        return res.status(500).json({ error: (error === null || error === void 0 ? void 0 : error.message) || String(error) });
    }
}));
exports.default = router;
