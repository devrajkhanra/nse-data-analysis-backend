// import {
//   OptionRow,
//   OptionChainWithDeltas,
//   OptionChainLegsWithDeltas,
//   OptionRowWithDeltas,
// } from "../types";

// export function buildOptionChainWithDeltas(
//   currentRows: OptionRow[],
//   previousRows: OptionRow[],
//   symbol: string,
//   expiry: string
// ): OptionChainWithDeltas | null {
//   const filterRows = (rows: OptionRow[]) =>
//     rows.filter(
//       (r) =>
//         r.symbol.trim().toUpperCase() === symbol.trim().toUpperCase() &&
//         r.expDate.trim() === expiry.trim()
//     );

//   const currFiltered = filterRows(currentRows);
//   const prevFiltered = filterRows(previousRows);

//   if (currFiltered.length === 0) return null;

//   const instrument = currFiltered[0].instrument;

//   const prevMap = new Map<string, OptionRow>();
//   for (const prev of prevFiltered) {
//     prevMap.set(`${prev.strPrice}_${prev.optType}`, prev);
//   }

//   const strikesMap = new Map<number, OptionChainLegsWithDeltas>();

//   for (const curr of currFiltered) {
//     let legs = strikesMap.get(curr.strPrice);
//     if (!legs) {
//       legs = { strPrice: curr.strPrice };
//       strikesMap.set(curr.strPrice, legs);
//     }

//     const key = `${curr.strPrice}_${curr.optType}`;
//     const prevRow = prevMap.get(key);

//     const deltaOI = prevRow ? curr.openInt - prevRow.openInt : undefined;
//     const deltaPremium = prevRow
//       ? curr.closePrice - prevRow.closePrice
//       : undefined;

//     const enhancedOption: OptionRowWithDeltas = {
//       ...curr,
//       deltaOI,
//       deltaPremium,
//     };

//     if (curr.optType === "CE") {
//       legs.CE = enhancedOption;
//     } else if (curr.optType === "PE") {
//       legs.PE = enhancedOption;
//     }
//   }

//   return {
//     instrument,
//     symbol: symbol.trim(),
//     expDate: expiry.trim(),
//     strikes: Array.from(strikesMap.values()).sort(
//       (a, b) => a.strPrice - b.strPrice
//     ),
//   };
// }

import { OptionRow, OptionChain, OptionChainLegs } from "../types";

export function buildOptionChainForSymbolAndExpiry(
  rows: OptionRow[],
  symbol: string,
  expiry: string
): OptionChain | null {
  const filtered = rows.filter(
    (row) =>
      row.symbol.trim().toUpperCase() === symbol.trim().toUpperCase() &&
      row.expDate.trim() === expiry.trim()
  );
  if (!filtered.length) return null;

  const instrument = filtered[0].instrument;
  const strikesMap = new Map<number, OptionChainLegs>();

  for (const row of filtered) {
    let legs = strikesMap.get(row.strPrice);
    if (!legs) {
      legs = { strPrice: row.strPrice };
      strikesMap.set(row.strPrice, legs);
    }
    if (row.optType === "CE") legs.CE = row;
    else if (row.optType === "PE") legs.PE = row;
  }

  const strikes = Array.from(strikesMap.values()).sort(
    (a, b) => a.strPrice - b.strPrice
  );

  return {
    instrument,
    symbol: symbol.trim(),
    expDate: expiry.trim(),
    strikes,
  };
}
