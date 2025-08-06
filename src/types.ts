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
  expDate: string; // e.g., "2025-07-31"
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

// Option chain grouped by symbol+expiry ("legs")
export interface OptionChainLegs {
  strPrice: number;
  CE?: OptionRow;
  PE?: OptionRow;
}

export interface OptionChain {
  instrument: string; // "OPTIDX"
  symbol: string; // "BANKNIFTY"
  expDate: string; // "2025-07-31"
  strikes: OptionChainLegs[];
}
