import AxiosFunc from '../../utils/axios'
import type { PostalReceive, PostalReceiveFormData } from '../../types/frontOffice/postalReceive'
import { openDocument } from '../../hooks/useBlobImage'

export interface PostalReceiveListResponse {
  receives: PostalReceive[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
}

export interface PostalReceiveSearchParams {
  search?: string
}

export const EMPTY_POSTAL_RECEIVE_SEARCH_PARAMS: PostalReceiveSearchParams = {}

const POSTAL_RECEIVE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/poster-receive/getAll',
  GET_BY_ID: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/update/${id}`,
  UPDATE_DOCUMENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/update-document/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/delete-multiple',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/poster-receive/filter',
  openDocument,
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

const transformToDTO = async (data: PostalReceiveFormData) => {
  const dto: any = { fromTitle: data.fromTitle, toTitle: data.toTitle }
  if (data.referenceNo?.trim()) dto.referenceNo = data.referenceNo.trim()
  if (data.address?.trim()) dto.address = data.address.trim()
  if (data.note?.trim()) dto.note = data.note.trim()
  if (data.date?.trim()) dto.date = formatDate(data.date)
  return dto
}

const transformFromBackend = (item: any): PostalReceive => ({
  id: item.posterReceiveId?.toString() || item.id?.toString(),
  postalReceiveId: item.posterReceiveId?.toString() || item.id?.toString(),
  fromTitle: item.fromTitle || '',
  referenceNo: item.referenceNo || '',
  address: item.address || '',
  note: item.note || '',
  toTitle: item.toTitle || '',
  date: item.date,
  document: item.document,
})

export const postalReceiveService = {
  getAll: async (
    page = 0,
    size = 10,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PostalReceiveListResponse> => {
    const endpoint = isAllSchools()
      ? POSTAL_RECEIVE_ENDPOINTS.GET_ALL_SCHOOL
      : POSTAL_RECEIVE_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, {
      page,
      size,
      sortDirection,
    })
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch postal receives')

    const raw = response.data?.data
    return {
      receives: (raw?.posterReceives || []).map(transformFromBackend),
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? 0,
      totalPages: raw?.totalPages ?? 0,
      pageSize: raw?.pageSize ?? size,
    }
  },

  filter: async (
    params: PostalReceiveSearchParams,
    page = 0,
    size = 10,
    sortBy = 'date',
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PostalReceiveListResponse> => {
    const body: Record<string, any> = {}
    if (params.search?.trim()) body.search = params.search.trim()

    const baseUrl = POSTAL_RECEIVE_ENDPOINTS.FILTER
    const url = `${baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

    const response = await AxiosFunc.Post(url, body)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to filter postal receives')

    const raw = response.data?.data
    return {
      receives: (raw?.posterReceives || []).map(transformFromBackend),
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? 0,
      totalPages: raw?.totalPages ?? 0,
      pageSize: raw?.pageSize ?? size,
    }
  },

  getById: async (id: string): Promise<PostalReceive | null> => {
    const response = await AxiosFunc.Get(POSTAL_RECEIVE_ENDPOINTS.GET_BY_ID(id))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch postal receive')
    const item = response.data?.data
    return item ? transformFromBackend(item) : null
  },

  create: async (data: PostalReceiveFormData): Promise<PostalReceive> => {
    const formData = new FormData()
    const dto = await transformToDTO(data)
    formData.append('data', JSON.stringify(dto))
    if (data.document instanceof File) formData.append('document', data.document)

    const response = await AxiosFunc.PostFormData(POSTAL_RECEIVE_ENDPOINTS.CREATE, formData)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to create postal receive')
    return transformFromBackend(response.data?.data)
  },

  update: async (id: string, data: PostalReceiveFormData): Promise<PostalReceive> => {
    const dto = await transformToDTO(data)
    const response = await AxiosFunc.Put(POSTAL_RECEIVE_ENDPOINTS.UPDATE(id), dto)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update postal receive')
    return transformFromBackend(response.data?.data)
  },

  updateDocument: async (postalReceiveId: string, file: File): Promise<void> => {
    if (!(file instanceof File)) throw new Error('Invalid document file')
    const formData = new FormData()
    formData.append('document', file)
    const response = await AxiosFunc.PutFormData(
      POSTAL_RECEIVE_ENDPOINTS.UPDATE_DOCUMENT(postalReceiveId),
      formData,
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update postal receive document')
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(POSTAL_RECEIVE_ENDPOINTS.DELETE(id))
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete postal receive')
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      POSTAL_RECEIVE_ENDPOINTS.DELETE_MULTIPLE,
      ids.map(Number),
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete postal receives')
  },
}
