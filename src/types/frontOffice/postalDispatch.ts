export interface PostalDispatch {
  id: string;
  postalDispatchId: string;
  title: string;
  referenceNo: string;
  address:string;
  fromTitle: string;
  phone?: string;
  date: string;
  description?: string;
  note?: string;
  document?: string | File | null;
}

export interface PostalDispatchFormData {
  title: string;
  referenceNo: string;
  fromTitle: string;
  address:string;
  phone?: string;
  date: string;
  description?: string;
  note?: string;
  document?: File | null;
}