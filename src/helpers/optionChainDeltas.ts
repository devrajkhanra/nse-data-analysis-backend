// src/helpers/optionChainDeltas.ts

import {
  OptionRow,
  OptionChainWithDeltas,
  OptionChainLegsWithDeltas,
  OptionRowWithDeltas,
} from "../types";

/**
 * Computes delta (difference) of openInt and closePrice between previous and current option rows
 * @param currentRows - array of OptionRow for current date
 * @param previousRows - array of OptionRow for previous date
 * @param symbol - filter symbol
 * @param expiry - filter expiry date string (e.g. "31-07-2025")
 * @returns OptionChainWithDeltas or null if no current data found
 */
export function buildOptionChainWithDeltas(
  currentRows: OptionRow[],
  previousRows: OptionRow[],
  symbol: string,
  expiry: string
): OptionChainWithDeltas | null {
  const filterRows = (rows: OptionRow[]) =>
    rows.filter(
      (r) =>
        r.symbol.trim().toUpperCase() === symbol.trim().toUpperCase() &&
        r.expDate.trim() === expiry.trim()
    );

  const currFiltered = filterRows(currentRows);
  const prevFiltered = filterRows(previousRows);

  if (currFiltered.length === 0) return null;

  const instrument = currFiltered[0].instrument;

  // Map previous option rows by 'strPrice_optType' for quick lookup
  const prevMap = new Map<string, OptionRow>();
  for (const prev of prevFiltered) {
    prevMap.set(`${prev.strPrice}_${prev.optType}`, prev);
  }

  // Build new strikes map with delta info
  const strikesMap = new Map<number, OptionChainLegsWithDeltas>();

  for (const curr of currFiltered) {
    let legs = strikesMap.get(curr.strPrice);
    if (!legs) {
      legs = { strPrice: curr.strPrice };
      strikesMap.set(curr.strPrice, legs);
    }

    const key = `${curr.strPrice}_${curr.optType}`;
    const prevRow = prevMap.get(key);

    const deltaOI = prevRow ? curr.openInt - prevRow.openInt : undefined;
    const deltaPremium = prevRow
      ? curr.closePrice - prevRow.closePrice
      : undefined;

    const enhancedOption: OptionRowWithDeltas = {
      ...curr,
      deltaOI,
      deltaPremium,
    };

    if (curr.optType === "CE") {
      legs.CE = enhancedOption;
    } else if (curr.optType === "PE") {
      legs.PE = enhancedOption;
    }
  }

  return {
    instrument,
    symbol: symbol.trim(),
    expDate: expiry.trim(),
    strikes: Array.from(strikesMap.values()).sort(
      (a, b) => a.strPrice - b.strPrice
    ),
  };
}
