export interface PurposeRef {
  id: string
  purposeId: string
  purposeName: string
}

export interface VisitorBook {
  id: string
  visitorBookId: string
  visitorName: string
  phone: string
  meetingWith: string
  numberOfPerson: string
  date: string
  inTime: string
  outTime?: string
  note?: string
  purposeId?: string
  purpose?: PurposeRef
  purposeName?: string
}

export interface VisitorBookFormData {
  visitorName: string
  phone: string
  meetingWith: string
  numberOfPerson: string
  date: string
  inTime: string
  outTime?: string
  note?: string
  purposeId?: string
}

export interface VisitorBookListResponse {
  visitors: VisitorBook[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
}

export interface VisitorBookSearchParams {
  purposeId?: string
  search?: string
}

export const EMPTY_SEARCH_PARAMS: VisitorBookSearchParams = {}
