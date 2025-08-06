// src/types.ts

export interface Nifty50Company {
  companyName: string;
  industry: string;
  symbol: string;
  series: string;
  isinCode: string;
}

export interface IndexData {
  indexName: string;
  indexDate: string;
  openIndexValue: number | null;
  highIndexValue: number | null;
  lowIndexValue: number | null;
  closingIndexValue: number;
  pointsChange: number | null;
  changePercent: number | null;
  volume: number | null;
  turnoverRsCr: number | null;
  pe: number | null;
  pb: number | null;
  divYield: number | null;
}

export interface SecurityData {
  symbol: string;
  series: string;
  date1: string;
  prevClose: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  lastPrice: number;
  closePrice: number;
  avgPrice: number;
  ttlTrdQnty: number;
  turnoverLacs: number;
  noOfTrades: number;
  delivQty: number | null;
  delivPer: number | null;
}

export interface OptionRow {
  instrument: string; // e.g., "OPTIDX"
  symbol: string; // e.g., "BANKNIFTY"
  expDate: string; // e.g., "31-07-2025"
  strPrice: number; // Strike Price
  optType: string; // "CE" or "PE"
  openPrice: number;
  hiPrice: number;
  loPrice: number;
  closePrice: number;
  openInt: number;
  trdQty: number;
  noOfCont: number;
  noOfTrade: number;
  notionVal: number;
  prVal: number;
}

// Grouped option chain leg without delta info
export interface OptionChainLegs {
  strPrice: number;
  CE?: OptionRow;
  PE?: OptionRow;
}

// Base option chain without deltas
export interface OptionChain {
  instrument: string;
  symbol: string;
  expDate: string;
  strikes: OptionChainLegs[];
}

// Option row extended with deltas
export interface OptionRowWithDeltas extends OptionRow {
  deltaOI?: number; // Change in OI vs previous day
  deltaPremium?: number; // Change in closePrice vs previous day
}

// Option chain leg with delta-enhanced option rows
export interface OptionChainLegsWithDeltas {
  strPrice: number;
  CE?: OptionRowWithDeltas;
  PE?: OptionRowWithDeltas;
}

// Option chain with deltas
export interface OptionChainWithDeltas {
  instrument: string;
  symbol: string;
  expDate: string;
  strikes: OptionChainLegsWithDeltas[];
}
