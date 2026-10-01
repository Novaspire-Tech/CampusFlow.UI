import AxiosFunc from '../../utils/axios'
import type { ContentType, ContentTypeStats } from '../../types/downloadCenter/contentType'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const CONTENT_TYPE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/content-type/getAll',
  FIND_BY_NAME: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/find',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/delete-multiple',
  DELETE_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/content-type/delete-all',
}

const DEFAULT_ZERO_STATS: ContentTypeStats[] = [
  { title: 'Total Content Types', value: '0', change: '+0%', icon: 'Package' },
]

const transformBackendToFrontend = (backendData: any): ContentType => ({
  contentTypeId: backendData.contentTypeId?.toString() || '',
  name: backendData.name || '',
  description: backendData.description || '',
  createdDate: new Date().toISOString().split('T')[0],
  status: 'Active',
})

const transformFrontendToBackend = (frontendData: Partial<ContentType>): any => ({
  name: frontendData.name,
  description: frontendData.description || '',
})

const extractContentTypesFromResponse = (response: any): ContentType[] => {
  const raw = response?.data?.data

  const list =
    raw?.ContentType || raw?.contentTypes || raw?.content || (Array.isArray(raw) ? raw : [])
  return list.map(transformBackendToFrontend)
}

export const contentTypeService = {
  getAll: async (): Promise<ContentType[]> => {
    try {
      
      const endpoint = isAllSchools()
        ? CONTENT_TYPE_ENDPOINTS.GET_ALL_SCHOOL
        : CONTENT_TYPE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, { page: 0, size: 1000 })

      if (response.data?.status !== 200) throw new Error('Failed to fetch content types')

      return extractContentTypesFromResponse(response)
    } catch (error: any) {
      console.error('Error fetching content types:', error)
      return []
    }
  },

  findByName: async (name: string): Promise<ContentType[]> => {
    try {
      const response = await AxiosFunc.Get(CONTENT_TYPE_ENDPOINTS.FIND_BY_NAME, { name })
      if (response.data?.status !== 200) return []
      return extractContentTypesFromResponse(response)
    } catch (error: any) {
      console.error('Error finding content type:', error)
      return []
    }
  },

  create: async (data: Partial<ContentType>): Promise<ContentType> => {
    try {
      const response = await AxiosFunc.Post(
        CONTENT_TYPE_ENDPOINTS.CREATE,
        transformFrontendToBackend(data),
      )
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create content type')

      return {
        contentTypeId: response.data?.data?.contentTypeId?.toString() || `temp-${Date.now()}`,
        name: data.name || '',
        description: data.description || '',
        createdDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to create content type',
      )
    }
  },

  update: async (id: string, data: ContentType): Promise<ContentType> => {
    try {
      const response = await AxiosFunc.Put(
        CONTENT_TYPE_ENDPOINTS.UPDATE(id),
        transformFrontendToBackend(data),
      )
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update content type')
      return data
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to update content type',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(CONTENT_TYPE_ENDPOINTS.DELETE(id))
      if (response.data?.status === 200) return
      throw new Error(response.data?.message || 'Failed to delete content type')
    } catch (error: any) {
      if (error?.response?.status === 500) return
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to delete content type',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))
      const response = await AxiosFunc.Delete(CONTENT_TYPE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete content types')

      if (
        response.data?.message &&
        response.data?.message.toLowerCase() !== 'success' &&
        response.data?.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to delete content types',
      )
    }
  },

  getStats: async (): Promise<ContentTypeStats[]> => {
    try {
      const contentTypes = await contentTypeService.getAll()
      return [
        {
          title: 'Total Content Types',
          value: contentTypes.length.toString(),
          change: '+0%',
          icon: 'Package',
        },
      ]
    } catch (error: any) {
      return DEFAULT_ZERO_STATS
    }
  },
}
