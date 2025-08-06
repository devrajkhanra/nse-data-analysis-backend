"use strict";
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
const express_1 = require("express");
const optionReader_1 = require("../utils/optionReader");
const optionChainBuilder_1 = require("../helpers/optionChainBuilder");
const router = (0, express_1.Router)();
/**
 * @route GET /option/chain
 * @desc Get option chain for given symbol (e.g. BANKNIFTY) and expiry (e.g. 31-07-2025)
 * @queryParam symbol: string - required
 * @queryParam expiry: string - required, date format should match data (e.g. DD-MM-YYYY)
 */
router.get("/option/chain", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { symbol, expiry, dates } = req.query;
        if (!symbol ||
            typeof symbol !== "string" ||
            !expiry ||
            typeof expiry !== "string") {
            return res.status(400).json({
                error: "Query parameters 'symbol' and 'expiry' (strings) are required.",
            });
        }
        let optionRows = [];
        if (dates) {
            let dateArray = [];
            if (typeof dates === "string") {
                dateArray = dates.split(",").map((d) => d.trim());
            }
            else if (Array.isArray(dates)) {
                dateArray = dates.map((d) => String(d).trim());
            }
            else {
                return res.status(400).json({ error: "'dates' parameter is invalid." });
            }
            try {
                optionRows = yield (0, optionReader_1.readOptionFilesByDates)(dateArray);
            }
            catch (err) {
                return res
                    .status(500)
                    .json({
                    error: `Failed to read option files for dates: ${err.message}`,
                });
            }
        }
        else {
            // If no dates param, load all option files
            try {
                optionRows = yield (0, optionReader_1.readAllOptionFiles)();
            }
            catch (err) {
                return res
                    .status(500)
                    .json({ error: `Failed to read option files: ${err.message}` });
            }
        }
        const chain = (0, optionChainBuilder_1.buildOptionChainForSymbolAndExpiry)(optionRows, symbol, expiry);
        if (!chain) {
            return res.status(404).json({
                error: `Option chain not found for symbol '${symbol}' and expiry '${expiry}'.`,
            });
        }
        return res.json(chain);
    }
    catch (error) {
        return res
            .status(500)
            .json({ error: error.message || "Internal Server Error" });
    }
}));
/**
 * @route GET /option/test
 * @desc Returns unique symbols and expiries available in option data
 */
router.get("/option/test", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const optionRows = yield (0, optionReader_1.readAllOptionFiles)();
        if (!optionRows.length) {
            return res.status(404).json({ error: "No option data found." });
        }
        // Extract unique symbols and expiries, showing combinations
        const uniqueCombos = Array.from(new Set(optionRows.map((r) => `${JSON.stringify(r.symbol)} | ${JSON.stringify(r.expDate)}`)));
        // Also unique lists for convenience
        const uniqueSymbols = Array.from(new Set(optionRows.map((r) => r.symbol)));
        const uniqueExpiries = Array.from(new Set(optionRows.map((r) => r.expDate)));
        // Optional: show a few sample OptionRows for inspection
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
exports.default = router;
