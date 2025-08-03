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

export interface OptionsData {
  instrument: string;
  symbol: string;
  expDate: string;
  strPrice: number;
  optType: string;
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
