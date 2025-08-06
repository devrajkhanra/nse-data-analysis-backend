"use strict";
// import {
//   OptionRow,
//   OptionChainWithDeltas,
//   OptionChainLegsWithDeltas,
//   OptionRowWithDeltas,
// } from "../types";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptionChainForSymbolAndExpiry = void 0;
function buildOptionChainForSymbolAndExpiry(rows, symbol, expiry) {
    const filtered = rows.filter((row) => row.symbol.trim().toUpperCase() === symbol.trim().toUpperCase() &&
        row.expDate.trim() === expiry.trim());
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
        if (row.optType === "CE")
            legs.CE = row;
        else if (row.optType === "PE")
            legs.PE = row;
    }
    const strikes = Array.from(strikesMap.values()).sort((a, b) => a.strPrice - b.strPrice);
    return {
        instrument,
        symbol: symbol.trim(),
        expDate: expiry.trim(),
        strikes,
    };
}
exports.buildOptionChainForSymbolAndExpiry = buildOptionChainForSymbolAndExpiry;
