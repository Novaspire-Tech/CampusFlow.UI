import AxiosFunc from '../../utils/axios'
import type {
  UploadContent,
  UploadContentFormData,
  ContentType,
  ContentTypeFormData,
} from '../../types/downloadCenter/UploadContent'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const UPLOAD_CONTENT_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/upload-content/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/upload-content/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/add',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/update/${id}`,
  UPDATE_DOCUMENT: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/update-document/${id}`,
  DELETE_SINGLE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/delete-multiple',
  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/delete-all',
  FIND: '/school-group/{schoolGroupCode}/school/{schoolCode}/upload-content/find',
}

const CONTENT_TYPE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/all',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/add',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/update/${id}`,
  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/delete/${id}`,
  FIND: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/find',
}

const toUploadContentDTO = (data: UploadContentFormData) => ({
  title: data.title,
  referenceLink: data.referenceLink || '',
  description: data.description || '',
  classId: Number(data.classId),
  sectionId: data.sectionId ? Number(data.sectionId) : null,
  contentTypeId: Number(data.contentTypeId),
})

const toContentTypeDTO = (data: ContentTypeFormData) => ({
  contentTypeName: data.contentTypeName,
  description: data.description || '',
})

export interface UploadContentFilterParams {
  page?: number
  size?: number
  sortDirection?: 'asc' | 'desc'
  classId?: number
  sectionId?: number | null
  search?: string
}

export interface UploadContentFilterResponse {
  uploadContents: UploadContent[]
  totalElements: number
  totalPages: number
  currentPage: number
}

export const uploadContentService = {
  async getAll(): Promise<UploadContent[]> {
   
    const endpoint = isAllSchools()
      ? UPLOAD_CONTENT_ENDPOINTS.GET_ALL_SCHOOL
      : UPLOAD_CONTENT_ENDPOINTS.GET_ALL

    const res = await AxiosFunc.Get(endpoint, { page: 0, size: 1000 })
    if (res.data?.status !== 200)
      throw new Error(res.data?.message || 'Failed to fetch upload content')

    return res.data.data?.uploadContents ?? res.data.data ?? []
  },

  async filter(params: UploadContentFilterParams): Promise<UploadContentFilterResponse> {
    const { page = 0, size = 10, sortDirection = 'asc', classId, sectionId, search } = params

    const body: Record<string, unknown> = {}
    if (classId !== undefined) body.classId = classId
    if (sectionId !== undefined) body.sectionId = sectionId
    if (search !== undefined) body.search = search

    
    const baseEndpoint = isAllSchools()
      ? UPLOAD_CONTENT_ENDPOINTS.FILTER_SCHOOL
      : UPLOAD_CONTENT_ENDPOINTS.FILTER

    const res = await AxiosFunc.Post(
      `${baseEndpoint}?page=${page}&size=${size}&sortDirection=${sortDirection}`,
      body,
    )

    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Filter failed')

    return res.data.data
  },

  async create(data: UploadContentFormData): Promise<void> {
    const formData = new FormData()
    formData.append('data', JSON.stringify(toUploadContentDTO(data)))
    if (data.filePath instanceof File) formData.append('file', data.filePath)

    const res = await AxiosFunc.PostFormData(UPLOAD_CONTENT_ENDPOINTS.CREATE, formData)
    if (![200, 201].includes(res.data?.status))
      throw new Error(res.data?.message || 'Create failed')
  },

  async update(id: number, data: UploadContentFormData): Promise<void> {
    const res = await AxiosFunc.Put(UPLOAD_CONTENT_ENDPOINTS.UPDATE(id), toUploadContentDTO(data))
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Update failed')
  },

  async updateDocument(uploadContentId: number, file: File): Promise<void> {
    if (!(file instanceof File)) throw new Error('Invalid document file')
    const formData = new FormData()
    formData.append('document', file)
    const res = await AxiosFunc.PutFormData(
      UPLOAD_CONTENT_ENDPOINTS.UPDATE_DOCUMENT(uploadContentId),
      formData,
    )
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Document update failed')
  },

  async delete(ids: number[] = [], deleteAll = false): Promise<void> {
    let res
    if (deleteAll) {
      res = await AxiosFunc.Delete(UPLOAD_CONTENT_ENDPOINTS.DELETE_ALL)
    } else if (ids.length === 1) {
      res = await AxiosFunc.Delete(UPLOAD_CONTENT_ENDPOINTS.DELETE_SINGLE(ids[0]))
    } else {
      res = await AxiosFunc.Delete(UPLOAD_CONTENT_ENDPOINTS.DELETE_MULTIPLE, null, ids)
    }
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Delete failed')
  },

  async findByName(name: string): Promise<UploadContent[]> {
    const res = await AxiosFunc.Get(UPLOAD_CONTENT_ENDPOINTS.FIND, { name })
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Search failed')
    return res.data.data
  },
}

export const contentTypeService = {
  async getAll(): Promise<ContentType[]> {
    const res = await AxiosFunc.Get(CONTENT_TYPE_ENDPOINTS.GET_ALL, { page: 0, size: 1000 })
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Fetch failed')
    return res.data.data?.contentTypes ?? res.data.data ?? []
  },

  async create(data: ContentTypeFormData): Promise<void> {
    const res = await AxiosFunc.Post(CONTENT_TYPE_ENDPOINTS.CREATE, toContentTypeDTO(data))
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Create failed')
  },

  async update(id: number, data: ContentTypeFormData): Promise<void> {
    const res = await AxiosFunc.Put(CONTENT_TYPE_ENDPOINTS.UPDATE(id), toContentTypeDTO(data))
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Update failed')
  },

  async delete(id: number): Promise<void> {
    const res = await AxiosFunc.Delete(CONTENT_TYPE_ENDPOINTS.DELETE(id))
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Delete failed')
  },

  async findByName(name: string): Promise<ContentType[]> {
    const res = await AxiosFunc.Get(CONTENT_TYPE_ENDPOINTS.FIND, { name })
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Search failed')
    return res.data.data
  },
}
