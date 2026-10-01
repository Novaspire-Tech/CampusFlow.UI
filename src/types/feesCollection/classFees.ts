export interface ClassFees {
  classFeesId: number;
  schoolClassId: number;
  className: string;
  feesTypeId: number;
  feeTypeName: string;
  fee: number;
  feeType?: any;
  createdDate?: string;
  updatedDate?: string;
}

export interface ClassFeesDTO {
  schoolClassId: number;
  feesTypeId: number;
  fee: number;
}

export interface GetClassFeesParams {
  feeTypeIds: number[];
  schoolClassId: number;
}