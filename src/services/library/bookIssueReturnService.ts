import AxiosFunc from '../../utils/axios'
import type { BookIssueReturn, BookIssueReturnFormData, BookIssueReturnListResponse } from '../../types/library/bookIssueReturn'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true'

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/book-issue/all',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/book-issue/getAll',
  CREATE:          '/school-group/{schoolGroupCode}/school/{schoolCode}/book-issue/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/book-issue/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/book-issue/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/book-issue/delete-multiple',
  FILTER:          '/school-group/{schoolGroupCode}/school/{schoolCode}/book-issue/filter',
  FILTER_Schools:  '/school-group/{schoolGroupCode}/school/book-issue/filter',
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BackendMember = {
  addStudentMemberId?: number
  addStaffMemberId?:   number
  firstName?:          string
  lastName?:           string
  staffName?:          string
  libraryCardNo?:      string
  email?:              string
}

type BackendBookIssueReturn = {
  bookIssueId:   number
  memberType:    'STAFF' | 'STUDENT'
  issueDate?:    string
  returnDate?:   string
  issueStatus?:  string
  submitStatus?: 'PENDING' | 'SUBMIT'
  submitDate?:   string
  fine?:         number
  book?: { listBookId: number; bookTitle: string }
  member?:        BackendMember
  staffMember?:   BackendMember
  studentMember?: BackendMember
}

// ─── Date Utils ───────────────────────────────────────────────────────────────

const toISODate = (dateStr?: string): string => {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) return dateStr.slice(0, 10)
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    const [dd, mm, yyyy] = dateStr.split('/')
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`
  }
  return dateStr
}

const toBackendDate = (dateStr?: string): string => {
  if (!dateStr) return ''
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [yyyy, mm, dd] = dateStr.split('-')
    return `${dd}/${mm}/${yyyy}`
  }
  throw new Error(`Unsupported date format: ${dateStr}`)
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (data: BackendBookIssueReturn): BookIssueReturn => {
  const isStaff = data.memberType === 'STAFF'
  const member: BackendMember =
    data.member ?? (isStaff ? data.staffMember : data.studentMember) ?? {}

  const libraryCardId = isStaff
    ? String(member.addStaffMemberId ?? '')
    : String(member.addStudentMemberId ?? '')

  const memberName =
    [member.firstName, member.lastName].filter(Boolean).join(' ').trim() ||
    member.staffName ||
    member.email ||
    ''

  return {
    id:            String(data.bookIssueId ?? ''),
    memberType:    data.memberType,
    libraryCardId,
    libraryCardNo: member.libraryCardNo ?? '',
    memberName,
    bookId:        String(data.book?.listBookId ?? ''),
    bookTitle:     data.book?.bookTitle ?? '',
    issueDate:     toISODate(data.issueDate),
    returnDate:    toISODate(data.returnDate),
    issueStatus:   data.issueStatus,
    submitStatus:  data.submitStatus ?? 'PENDING',
    submitDate:    toISODate(data.submitDate),
    fine:          data.fine ?? 0,
  }
}

const toBackend = (data: BookIssueReturnFormData) => ({
  bookId:               Number(data.bookId),
  memberType:           data.memberType,
  issueDate:            toBackendDate(data.issueDate),
  returnDate:           toBackendDate(data.returnDate),
  issueStatus:          data.issueStatus ?? 'ISSUED',
  submitStatus:         data.submitStatus ?? 'PENDING',
  submitDate:           data.submitDate ? toBackendDate(data.submitDate) : null,
  fine:                 Number(data.fine) || 0,
  staffLibraryCardId:   data.memberType === 'STAFF'   ? Number(data.libraryCardId) : null,
  studentLibraryCardId: data.memberType === 'STUDENT' ? Number(data.libraryCardId) : null,
})

// ─── Response Normaliser ──────────────────────────────────────────────────────

const normalisePaginated = (raw: unknown, page: number, size: number): BookIssueReturnListResponse => {
  if (Array.isArray(raw)) {
    const items = (raw as BackendBookIssueReturn[]).map(toFrontend)
    return { bookIssueReturns: items, currentPage: page, totalItems: items.length, totalPages: Math.ceil(items.length / size) || 1 }
  }

  if (raw !== null && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>
    const rawItems =
      Array.isArray(obj['bookIssues'])       ? (obj['bookIssues'] as BackendBookIssueReturn[]) :
      Array.isArray(obj['bookIssueReturns']) ? (obj['bookIssueReturns'] as BackendBookIssueReturn[]) : []

    const items      = rawItems.map(toFrontend)
    const currentPage = typeof obj['currentPage'] === 'number' ? obj['currentPage'] : page
    const totalItems  = typeof obj['totalItems']  === 'number' ? obj['totalItems']  : items.length
    const totalPages  = typeof obj['totalPages']  === 'number' ? obj['totalPages']  : Math.ceil(totalItems / size) || 1

    return { bookIssueReturns: items, currentPage, totalItems, totalPages }
  }

  return { bookIssueReturns: [], currentPage: page, totalItems: 0, totalPages: 1 }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const bookIssueReturnService = {

  getAll: async (page = 0, size = 10, sortDirection: 'asc' | 'desc' = 'desc'): Promise<BookIssueReturnListResponse> => {
    const url = isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)
    const res = await AxiosFunc.Get(url, { page, size, sortDirection })
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Failed to fetch book issue records')
    return normalisePaginated(res?.data?.data, page, size)
  },

  getAllPages: async (sortDirection: 'asc' | 'desc' = 'desc'): Promise<BookIssueReturnListResponse> => {
    const pageSize = 10
    const firstPage = await bookIssueReturnService.getAll(0, pageSize, sortDirection)
    const bookIssueReturns = [...firstPage.bookIssueReturns]
    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const response = await bookIssueReturnService.getAll(page, pageSize, sortDirection)
      bookIssueReturns.push(...response.bookIssueReturns)
    }
    return { ...firstPage, bookIssueReturns, currentPage: 0 }
  },

  filter: async (search = '', page = 0, size = 10, sortBy = 'issueDate', sortDirection: 'asc' | 'desc' = 'desc'): Promise<BookIssueReturnListResponse> => {
    const base = isAllSchools() ? buildUrl(EP.FILTER_Schools) : buildUrl(EP.FILTER)
    const qs = `search=${encodeURIComponent(search)}&page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`
    const res = await AxiosFunc.Post(`${base}?${qs}`, {})
    return normalisePaginated(res?.data?.data, page, size)
  },

  create: async (data: BookIssueReturnFormData): Promise<BookIssueReturn> => {
    const res = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data))
    return toFrontend(res.data.data as BackendBookIssueReturn)
  },

  update: async (id: string, data: BookIssueReturnFormData): Promise<BookIssueReturn> => {
    const res = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data))
    return toFrontend(res.data.data as BackendBookIssueReturn)
  },

  delete: async (id: string): Promise<void> => {
    const res = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
    if (res.data?.status !== 200) throw new Error('Delete failed')
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const res = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), ids)
    if (res.data?.status !== 200) throw new Error('Failed to delete items')
  },
}