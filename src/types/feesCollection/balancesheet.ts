export type BalanceSheetBasis = "session" | "dateRange" | "year";

export interface BalanceSheetForm {
  basis:     BalanceSheetBasis;
  sessionId: string;
  yearId:    string;
  fromDate:  string;
  toDate:    string;
}
export type BalanceSheetResult =
  | { downloaded: true }
  | { downloaded: false; message: string };