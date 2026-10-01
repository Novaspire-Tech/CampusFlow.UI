export interface PostalReceive {
  id: string;
  postalReceiveId: string;
  fromTitle: string;
  referenceNo: string;
  address: string;
  note?: string;
  toTitle: string;
  date: string;
  document?: string | File | null;
}

export interface PostalReceiveFormData {
  fromTitle: string;
  referenceNo: string;
  address: string;
  note?: string;
  toTitle: string;
  date: string;
  document?: File | null;
}