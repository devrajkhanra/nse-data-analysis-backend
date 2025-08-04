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
const indiceReader_1 = require("../utils/indiceReader");
const router = (0, express_1.Router)();
/**
 * Get all indice data from all CSV files in ~/Desktop/data/indice
 */
router.get("/allIndice", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, directoryHelper_1.readAndEnsureDataDirectory)(); // Ensure directory exists
        const indiceData = yield (0, indiceReader_1.readAllIndiceFiles)();
        res.json(indiceData);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
/**
 * Get indice data for specific date(s) provided in query parameter
 * Example: /indice/by-dates?dates=01072025 or /indice/by-dates?dates=01072025,02072025
 */
router.get("/indice/by-dates", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dates } = req.query;
        if (!dates) {
            return res
                .status(400)
                .json({ error: 'Query parameter "dates" is required' });
        }
        // Convert dates to string or string array, handling ParsedQs
        const dateArray = typeof dates === "string"
            ? dates.split(",").map((d) => d.trim())
            : Array.isArray(dates)
                ? dates.map((d) => String(d).trim())
                : [String(dates).trim()];
        yield (0, directoryHelper_1.readAndEnsureDataDirectory)(); // Ensure directory exists
        const indiceData = yield (0, indiceReader_1.readIndiceFilesByDates)(dateArray);
        res.json(indiceData);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
/**
 * Get indice data for specific date(s) and index name provided in query parameters
 * Example: /indice/by-dates-and-index?dates=01072025&index=NIFTY%2050
 */
router.get("/indice/by-dates-and-index", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { dates, index } = req.query;
        if (!dates) {
            return res
                .status(400)
                .json({ error: 'Query parameter "dates" is required' });
        }
        if (!index) {
            return res
                .status(400)
                .json({ error: 'Query parameter "index" is required' });
        }
        // Convert dates to string or string array, handling ParsedQs
        const dateArray = typeof dates === "string"
            ? dates.split(",").map((d) => d.trim())
            : Array.isArray(dates)
                ? dates.map((d) => String(d).trim())
                : [String(dates).trim()];
        // Convert index to string, handling ParsedQs
        const indexName = typeof index === "string" ? index.trim() : String(index).trim();
        yield (0, directoryHelper_1.readAndEnsureDataDirectory)(); // Ensure directory exists
        const indiceData = yield (0, indiceReader_1.readIndiceFilesByDatesAndIndex)(dateArray, indexName);
        res.json(indiceData);
    }
    catch (error) {
        res.status(500).json({ error: error });
    }
}));
exports.default = router;
