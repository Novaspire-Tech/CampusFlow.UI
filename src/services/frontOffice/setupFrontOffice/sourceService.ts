import AxiosFunc from '../../../utils/axios'
import type { Source } from '../../../types/frontOffice/setupFrontOffice/source'

const SOURCE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/source/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/source/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/source/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/source/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/source/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/source/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/source/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'
const transformBackendToFrontend = (backendData: any): Source => {
  return {
    id: backendData.sourceId?.toString() || backendData.id?.toString() || '',
    sourceId: backendData.sourceId?.toString() || backendData.id?.toString(),
    source: backendData.source || '',
    description: backendData.description || '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: backendData.isActive ? 'Active' : 'Inactive',
  }
}

const transformFrontendToBackend = (frontendData: Partial<Source>): any => {
  const dto: any = {
    source: frontendData.source,
  }
  if (frontendData.description && frontendData.description.trim()) {
    dto.description = frontendData.description.trim()
  }
  return dto
}

const extractSourcesFromResponse = (response: any): Source[] => {
  const backendData =
    response?.data?.data?.sources ||
    response?.data?.sources ||
    response?.data?.data?.source ||
    response?.data?.source ||
    response?.data?.data ||
    []

  if (!Array.isArray(backendData)) {
    console.warn('Backend data is not an array:', backendData)
    return []
  }

  return backendData.map(transformBackendToFrontend)
}

export const sourceService = {
  getAll: async (): Promise<Source[]> => {
    try {
      const endpoint = isAllSchools() ? SOURCE_ENDPOINTS.GET_ALL_SCHOOL : SOURCE_ENDPOINTS.GET_ALL
      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 100,
        sortDirection: 'asc',
        sortBy: 'source',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch sources')
      }

      return extractSourcesFromResponse(response)
    } catch (error: any) {
      console.error('Error fetching sources:', error)
      return []
    }
  },

  getById: async (id: string): Promise<Source | null> => {
    try {
      const response = await AxiosFunc.Get(SOURCE_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) {
        return null
      }

      const backendData = response.data?.data
      if (!backendData) return null

      return transformBackendToFrontend(backendData)
    } catch (error: any) {
      console.error('Error fetching source:', error)
      return null
    }
  },

  create: async (data: Partial<Source>): Promise<Source> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(SOURCE_ENDPOINTS.CREATE, backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to create source')
      }

      const createdSource: Source = {
        ...(data as Source),
        id: response.data?.data?.sourceId?.toString() || `temp-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      }

      return createdSource
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create source'
      throw new Error(errorMessage)
    }
  },

  update: async (id: string, data: Source): Promise<Source> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Put(SOURCE_ENDPOINTS.UPDATE(id), backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update source')
      }

      return data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update source'
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(SOURCE_ENDPOINTS.DELETE(id))

      if (response.data?.status === 200) {
        return
      }

      const errorMessage = response.data?.message || 'Failed to delete source'
      throw new Error(errorMessage)
    } catch (error: any) {
      if (error.response?.status === 500) {
        return
      }
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete source'
      throw new Error(errorMessage)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id))
      const response = await AxiosFunc.Delete(SOURCE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete sources')
      }

      if (
        response.data?.message &&
        response.data?.message.toLowerCase() !== 'success' &&
        response.data?.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.error('Error deleting multiple sources:', error)
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete sources'
      throw new Error(errorMessage)
    }
  },
}
