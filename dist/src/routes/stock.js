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
const directoryHelper_1 = require("../utils/directoryHelper");
const stockReader_1 = require("../utils/stockReader");
const router = (0, express_1.Router)();
/**
 * Get stock data for specific date(s) filtered by Nifty 50 and series EQ
 * Example: /stock/by-dates?dates=01072025 or /stock/by-dates?dates=01072025,02072025
 */
router.get("/stock/by-dates", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dates } = req.query;
        if (!dates) {
            return res
                .status(400)
                .json({ error: 'Query parameter "dates" is required' });
        }
        // Normalize dates input to string array
        const dateArray = typeof dates === "string"
            ? dates.split(",").map((d) => d.trim())
            : Array.isArray(dates)
                ? dates.map((d) => String(d).trim())
                : [String(dates).trim()];
        yield (0, directoryHelper_1.readAndEnsureDataDirectory)(); // Ensure data directory exists
        const stockData = yield (0, stockReader_1.readStockFilesByDates)(dateArray);
        res.json(stockData);
    }
    catch (error) {
        res.status(500).json({ error: String(error) });
    }
}));
/**
 * Get stock data for specific date(s) and symbol filtered by Nifty 50 and series EQ
 * Example: /stock/by-dates-and-symbol?dates=01072025&symbol=TCS
 */
router.get("/stock/by-dates-and-symbol", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dates, symbol } = req.query;
        if (!dates) {
            return res
                .status(400)
                .json({ error: 'Query parameter "dates" is required' });
        }
        if (!symbol) {
            return res
                .status(400)
                .json({ error: 'Query parameter "symbol" is required' });
        }
        // Normalize dates input to string array
        const dateArray = typeof dates === "string"
            ? dates.split(",").map((d) => d.trim())
            : Array.isArray(dates)
                ? dates.map((d) => String(d).trim())
                : [String(dates).trim()];
        const symbolStr = typeof symbol === "string" ? symbol.trim() : String(symbol).trim();
        yield (0, directoryHelper_1.readAndEnsureDataDirectory)();
        const stockData = yield (0, stockReader_1.readStockFilesByDatesAndSymbol)(dateArray, symbolStr);
        res.json(stockData);
    }
    catch (error) {
        res.status(500).json({ error: String(error) });
    }
}));
exports.default = router;
