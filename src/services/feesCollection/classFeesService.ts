import AxiosFunc from '../../utils/axios'
import type {
  ClassFees,
  ClassFeesDTO,
  GetClassFeesParams,
} from '../../types/feesCollection/classFees'

export interface ClassFeesListResponse {
  classFees: ClassFees[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
}

export interface ClassFeesSearchParams {
  schoolClassId?: number
  feeTypeId?: number
}

export const EMPTY_CLASS_FEES_SEARCH_PARAMS: ClassFeesSearchParams = {}

const CLASS_FEES_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/get-all',
  GET: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/get',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/class-fees/getAll',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/class-fees/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/add',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/update/${id}`,
  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/class-fees/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (backendData: any): ClassFees => ({
  classFeesId: backendData.classFeesId || 0,
  schoolClassId: backendData.schoolClassId || 0,
  className: backendData.className || '',
  feesTypeId: backendData.feesTypeId || 0,
  feeTypeName: backendData.feeTypeName || '',
  fee: backendData.fee || 0,
  feeType: backendData.feeType || undefined,
  createdDate: backendData.createdDate
    ? new Date(backendData.createdDate).toISOString().split('T')[0]
    : undefined,
  updatedDate: backendData.updatedDate
    ? new Date(backendData.updatedDate).toISOString().split('T')[0]
    : undefined,
})

const transformFrontendToBackend = (data: ClassFeesDTO): any => ({
  schoolClassId: data.schoolClassId,
  feesTypeId: data.feesTypeId,
  fee: data.fee,
})

export const classFeesService = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<ClassFeesListResponse> => {
    const endpoint = isAllSchools()
      ? CLASS_FEES_ENDPOINTS.GET_ALL_SCHOOL
      : CLASS_FEES_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch class fees')

    const raw = response.data?.data
    const items = Array.isArray(raw?.classFees)
      ? raw.classFees.map(transformBackendToFrontend)
      : Array.isArray(raw)
        ? raw.map(transformBackendToFrontend)
        : []

    return {
      classFees: items,
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? items.length,
      totalPages: raw?.totalPages ?? Math.ceil(items.length / size),
      pageSize: raw?.pageSize ?? size,
    }
  },

  filter: async (
    params: ClassFeesSearchParams,
    page = 0,
    size = 10,
    sortBy = 'classFeesId',
    sortDirection = 'asc',
  ): Promise<ClassFeesListResponse> => {
    const body: Record<string, any> = {}
    if (params.schoolClassId) body.schoolClassId = params.schoolClassId
    if (params.feeTypeId) body.feeTypeId = params.feeTypeId

    const baseUrl = isAllSchools()
      ? CLASS_FEES_ENDPOINTS.FILTER_SCHOOL
      : CLASS_FEES_ENDPOINTS.FILTER

    const url = `${baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

    const response = await AxiosFunc.Post(url, body)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to filter class fees')

    const raw = response.data?.data
    return {
      classFees: (raw?.classFees || []).map(transformBackendToFrontend),
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? 0,
      totalPages: raw?.totalPages ?? 0,
      pageSize: raw?.pageSize ?? size,
    }
  },

  get: async (params: GetClassFeesParams): Promise<ClassFees[]> => {
    const baseUrl = CLASS_FEES_ENDPOINTS.GET
    const queryParams = new URLSearchParams()
    params.feeTypeIds.forEach((id) => queryParams.append('feeTypeIds', String(id)))
    queryParams.append('schoolClassId', String(params.schoolClassId))

    const response = await AxiosFunc.Get(`${baseUrl}?${queryParams.toString()}`)
    if (!response?.data) return []
    if (response.data?.status !== 200) return []

    const backendData = response.data?.data || []
    return Array.isArray(backendData) ? backendData.map(transformBackendToFrontend) : []
  },

  add: async (data: ClassFeesDTO): Promise<ClassFees> => {
    const response = await AxiosFunc.Post(
      CLASS_FEES_ENDPOINTS.CREATE,
      transformFrontendToBackend(data),
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to add class fee')

    return response.data?.data
      ? transformBackendToFrontend(response.data.data)
      : ({
          classFeesId: Date.now(),
          ...data,
          className: '',
          feeTypeName: '',
        } as ClassFees)
  },

  update: async (classFeeId: number, data: ClassFeesDTO): Promise<ClassFees> => {
    const response = await AxiosFunc.Put(
      CLASS_FEES_ENDPOINTS.UPDATE(classFeeId),
      transformFrontendToBackend(data),
    )
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update class fee')

    return response.data?.data
      ? transformBackendToFrontend(response.data.data)
      : ({
          classFeesId: classFeeId,
          ...data,
          className: '',
          feeTypeName: '',
        } as ClassFees)
  },

  delete: async (classFeeId: number): Promise<void> => {
    const response = await AxiosFunc.Delete(CLASS_FEES_ENDPOINTS.DELETE(classFeeId))
    if (response.data?.status !== 200 && response.data?.status !== 500)
      throw new Error(response.data?.message || 'Failed to delete class fee')
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(CLASS_FEES_ENDPOINTS.DELETE_MULTIPLE, ids)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete class fees')
    if (
      response.data?.message &&
      response.data?.message.toLowerCase() !== 'success' &&
      response.data?.message.toLowerCase() !== 'ok'
    ) {
      throw new Error(response.data.message)
    }
  },
}