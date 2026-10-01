export interface ClassRef {
  id: string;
  schoolClassId: string;
  className: string;
}

export interface SourceRef {
  id: string;
  sourceId: string;
  sourceName: string;
}

export interface ReferenceRef {
  id: string;
  referenceId: string;
  referenceName: string;
}

export interface AdmissionEnquiry {
  schoolCode?: string | null;
  id: string;
  admissionEnquiryId: string;
  studentName: string;
  phone: string;
  email?: string;
  address?: string;
  description?: string;
  note?: string;
  enquiryDate: string;
  nextFollowUpDate?: string;
  numberOfChild?: string;
  reference?: ReferenceRef;
  referenceName?: string;
  assigned?: string;
  classId?: string;
  class?: ClassRef;
  className?: string;
  sourceId: string;
  source: SourceRef;
  sourceName: string;
  status: string;
}

export interface AdmissionEnquiryFormData {
  studentName: string;
  phone: string;
  email?: string;
  address?: string;
  description?: string;
  note?: string;
  enquiryDate: string;
  nextFollowUpDate?: string;
  numberOfChild?: string;
  reference?: string;
  assigned?: string;
  classId?: string;
  sourceId: string;
  status: string;
}

export interface AdmissionEnquiryListResponse {
  admissionEnquiries: AdmissionEnquiry[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface AdmissionEnquirySearchParams {
  classId?: string;
  sourceId?: string;
  reference?: string;
  search?: string;
  enquiryDate?: string;
  enquiryFromDate?: string;
  status?: string;
}

export const EMPTY_SEARCH_PARAMS: AdmissionEnquirySearchParams = {};