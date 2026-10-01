import AxiosFunc, { API_BASE_URL } from '../../utils/axios'
import type { BookList, BookListResponse, BookListSearchParams, BookListStats } from '../../types/library/bookList'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:              '/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/all',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/${id}`,
  CREATE:               '/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/add',
  UPDATE:    (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/update/${id}`,
  DELETE:    (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/delete/${id}`,
  DELETE_MULTIPLE:      '/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/delete-multiple',
  FILTER:               '/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/filter',
  BULK_UPLOAD_XL:       '/school-group/{schoolGroupCode}/school/{schoolCode}/list-book/add/xl-sheet',
  DOWNLOAD_TEMPLATE_XL: '/templates/xl-sheets/library_book.xlsx',
}

// ─── Date Utils ───────────────────────────────────────────────────────────────

const toISODate = (dateStr: string): string => {
  if (!dateStr) return ''
  const parts = dateStr.split('/')
  if (parts.length === 3)
    return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`
  return dateStr
}

const toBackendDate = (dateStr: string): string => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (item: any): BookList => ({
  id:          item.listBookId?.toString() ?? '',
  bookTitle:   item.bookTitle   ?? '',
  bookNo:      item.bookNo      ?? '',
  isbnNumber:  item.isbnNumber  ?? '',
  publisher:   item.publisher   ?? '',
  author:      item.author      ?? '',
  subject:     item.subject     ?? '',
  rackNumber:  item.rackNumber  ?? '',
  quantity:    item.quantity    ?? '',
  available:   item.available   ?? '',
  price:       item.price       ?? '',
  postDate:    toISODate(item.postDate ?? ''),
  description: item.description ?? '',
})

const toBackend = (data: Partial<BookList>) => ({
  bookTitle:   data.bookTitle?.trim(),
  bookNo:      data.bookNo?.trim()      || null,
  isbnNumber:  data.isbnNumber?.trim()  || null,
  publisher:   data.publisher?.trim()   || null,
  author:      data.author?.trim()      || null,
  subject:     data.subject?.trim()     || null,
  rackNumber:  data.rackNumber?.trim()  || null,
  quantity:    data.quantity?.trim()    || null,
  available:   data.available?.trim().toLowerCase() || null,
  price:       data.price?.trim()       || null,
  postDate:    toBackendDate(data.postDate ?? '') || null,
  description: data.description?.trim() ?? '',
})

// ─── Service ─────────────────────────────────────────────────────────────────

export const listBookService = {

  getAll: async (): Promise<BookList[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_ALL), { page: 0, size: 1000 })
      const data = response?.data?.data
      if (!data) return []

      const raw: any[] =
        Array.isArray(data.books)    ? data.books    :
        Array.isArray(data.content)  ? data.content  :
        Array.isArray(data.listBook) ? data.listBook :
        Array.isArray(data)          ? data          : []

      return raw.map(toFrontend)
    } catch (error: any) {
      console.error('Error fetching all books:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<BookList | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)))
      if (response.data?.status !== 200) return null
      return toFrontend(response.data.data)
    } catch (error: any) {
      console.error('Error fetching book by ID:', error)
      throw error
    }
  },

  filter: async (
    params: BookListSearchParams,
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<BookListResponse> => {
    const body: Record<string, any> = {}
    if (params.bookTitle?.trim())  body.bookTitle  = params.bookTitle.trim()
    if (params.author?.trim())     body.author     = params.author.trim()
    if (params.subject?.trim())    body.subject    = params.subject.trim()
    if (params.isbnNumber?.trim()) body.isbnNumber = params.isbnNumber.trim()
    if (params.publisher?.trim())  body.publisher  = params.publisher.trim()
    if (params.search?.trim())     body.search     = params.search.trim()

    const url = `${buildUrl(EP.FILTER)}?page=${page}&size=${size}&sortDirection=${sortDirection}`

    try {
      const response = await AxiosFunc.Post(url, body)

      if (!response?.data)
        throw new Error('No response data received from server')
      if (response.data.status !== 200)
        throw new Error(response.data.message ?? 'Failed to fetch books')

      const raw = response.data?.data
      return {
        books:       (raw?.books ?? []).map(toFrontend),
        totalItems:  raw?.totalItems  ?? 0,
        totalPages:  raw?.totalPages  ?? 0,
        currentPage: raw?.currentPage ?? page,
      }
    } catch (error: any) {
      console.error('Error filtering books:', error)
      throw error
    }
  },

  create: async (data: Partial<BookList>): Promise<BookList> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data))

    if (response.data?.status !== 200 && response.data?.status !== 201)
      throw new Error(response.data?.message ?? 'Failed to create book')

    return toFrontend(response.data.data)
  },

  update: async (id: string, data: BookList): Promise<BookList> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update book')

    return toFrontend(response.data.data)
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete book')
    } catch (error: any) {
      if (error?.response?.status === 500) return
      throw new Error(error?.response?.data?.message ?? error?.message ?? 'Failed to delete book')
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), ids)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete books')
  },

  getStats: async (): Promise<BookListStats[]> => {
    const books = await listBookService.getAll()
    const availableCount = books.filter(b => b.available?.toLowerCase() === 'yes').length
    return [
      { title: 'Total Books',     value: books.length.toString(),   change: '+0%', icon: 'BookOpen'    },
      { title: 'Available Books', value: availableCount.toString(), change: '+0%', icon: 'CheckCircle' },
    ]
  },

  bulkUploadFromExcel: async (file: File): Promise<{
    success: number; failed: number; message: string; errors?: string[]; errorFile?: Blob
  }> => {
    if (!file) throw new Error('Excel file is required')

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ]
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i))
      throw new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)')

    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('accessToken') ?? ''
    const url = `${API_BASE_URL}${buildUrl(EP.BULK_UPLOAD_XL)}`

    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })

    const contentType        = response.headers.get('content-type')        ?? ''
    const contentDisposition = response.headers.get('content-disposition') ?? ''

    if (contentType.includes('application/octet-stream') || contentDisposition.includes('attachment')) {
      return {
        success: 0, failed: -1,
        message: 'Some records failed. Download the error file for details.',
        errorFile: await response.blob(),
      }
    }

    const json = await response.json()
    if (json?.status !== 200)
      throw new Error(json?.message ?? 'Failed to upload Book Excel sheet')

    return {
      success: json?.data?.successCount ?? 0,
      failed:  json?.data?.failureCount ?? 0,
      message: json?.message            ?? 'All records uploaded successfully',
      errors:  json?.data?.errors       ?? [],
    }
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(EP.DOWNLOAD_TEMPLATE_XL)
      if (!(response.data instanceof Blob))
        throw new Error('Invalid file response from server')
      return response.data
    } catch (error: any) {
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to download Excel template')
    }
  },
}