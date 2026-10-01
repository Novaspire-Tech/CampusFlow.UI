export interface ComplaintTypeRef {
  id: string;
  name: string;
}

export interface SourceRef {
  id: string;
  name: string;
}

export interface Complain {
  id: string;
  complainId: string;
  complainTypeId: string;
  complaintType: ComplaintTypeRef;
  complaintTypeName: string;
  sourceId: string;
  source: SourceRef;
  sourceName: string;
  complainBy: string;
  phone: string;
  date: string;
  description: string;
  actionTaken: string;
  assigned: string;
  note: string;
  document?: string | File | null;
}

export interface ComplainFormData {
  complainTypeId: string;
  sourceId: string;
  complainBy: string;
  phone: string;
  date: string;
  description: string;
  actionTaken: string;
  assigned: string;
  note: string;
  document?: File | null;
}