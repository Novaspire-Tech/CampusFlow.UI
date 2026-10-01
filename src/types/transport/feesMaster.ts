export type FineType = "none" | "percentage" | "fixed";

export interface TransportFeesMaster {
  id: string | null;
  month: string;
  dueDate: string | undefined;
  percentage: string | null;
  fixAmount: string | null;
  fineType: FineType;
}


export interface TransportFeesMasterDto {
  month: string;
  dueDate: string;
  percentage: string | null;
  fixAmount: string | null;
}