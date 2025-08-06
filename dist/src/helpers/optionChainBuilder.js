"use strict";
// src/helpers/optionChainBuilder.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptionChainForSymbolAndExpiry = void 0;
/**
 * Build an option chain for a specific symbol and expiry date.
 *
 * @param rows - Array of all option rows
 * @param symbol - Symbol to filter, e.g., BANKNIFTY
 * @param expiry - Expiry date string matching that in data, e.g., "31-07-2025"
 * @returns OptionChain or null if not found
 */
function buildOptionChainForSymbolAndExpiry(rows, symbol, expiry) {
    // Normalize inputs for matching (case insensitive, trimmed)
    const symbolNorm = symbol.trim().toUpperCase();
    const expiryNorm = expiry.trim();
    const filtered = rows.filter((row) => row.symbol.trim().toUpperCase() === symbolNorm &&
        row.expDate.trim() === expiryNorm);
    if (!filtered.length)
        return null;
    const instrument = filtered[0].instrument;
    const strikesMap = new Map();
    for (const row of filtered) {
        let legs = strikesMap.get(row.strPrice);
        if (!legs) {
            legs = { strPrice: row.strPrice };
            strikesMap.set(row.strPrice, legs);
        }
        if (row.optType === "CE") {
            legs.CE = row;
        }
        else if (row.optType === "PE") {
            legs.PE = row;
        }
    }
    const strikes = Array.from(strikesMap.values()).sort((a, b) => a.strPrice - b.strPrice);
    return {
        instrument,
        symbol: symbolNorm,
        expDate: expiryNorm,
        strikes,
    };
}
exports.buildOptionChainForSymbolAndExpiry = buildOptionChainForSymbolAndExpiry;
