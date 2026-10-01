import AxiosFunc from '../../../utils/axios'
import type { Purpose } from '../../../types/frontOffice/setupFrontOffice/purpose'

const PURPOSE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/purpose/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/purpose/getAll', // NEW
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/purpose/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/purpose/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/purpose/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/purpose/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/purpose/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (backendData: any): Purpose => {
  return {
    id: backendData.purposeId?.toString() || backendData.id?.toString() || '',
    purposeId: backendData.purposeId?.toString() || backendData.id?.toString(),
    purpose: backendData.purpose || '',
    description: backendData.description || '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: backendData.isActive ? 'Active' : 'Inactive',
  }
}

const transformFrontendToBackend = (frontendData: Partial<Purpose>): any => {
  const dto: any = {
    purpose: frontendData.purpose,
  }
  if (frontendData.description && frontendData.description.trim()) {
    dto.description = frontendData.description.trim()
  }
  return dto
}

const extractPurposesFromResponse = (response: any): Purpose[] => {
  const backendData =
    response?.data?.data?.purposes ||
    response?.data?.purposes ||
    response?.data?.data?.purpose ||
    response?.data?.purpose ||
    response?.data?.data ||
    []

  if (!Array.isArray(backendData)) {
    console.warn('Backend data is not an array:', backendData)
    return []
  }

  return backendData.map(transformBackendToFrontend)
}

export const purposeService = {
  getAll: async (): Promise<Purpose[]> => {
    try {
      const endpoint = isAllSchools() ? PURPOSE_ENDPOINTS.GET_ALL_SCHOOL : PURPOSE_ENDPOINTS.GET_ALL
      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
        sortBy: 'purpose',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch purposes')
      }

      return extractPurposesFromResponse(response)
    } catch (error: any) {
      console.error('Error fetching purposes:', error)
      return []
    }
  },

  getById: async (id: string): Promise<Purpose | null> => {
    try {
      const response = await AxiosFunc.Get(PURPOSE_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) {
        return null
      }

      const backendData = response.data?.data
      if (!backendData) return null

      return transformBackendToFrontend(backendData)
    } catch (error: any) {
      console.error('Error fetching purpose:', error)
      return null
    }
  },

  create: async (data: Partial<Purpose>): Promise<Purpose> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(PURPOSE_ENDPOINTS.CREATE, backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to create purpose')
      }

      const createdPurpose: Purpose = {
        ...(data as Purpose),
        id: response.data?.data?.purposeId?.toString() || `temp-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      }

      return createdPurpose
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create purpose'
      throw new Error(errorMessage)
    }
  },

  update: async (id: string, data: Purpose): Promise<Purpose> => {
    try {
      const backendData = transformFrontendToBackend(data)

      const response = await AxiosFunc.Put(PURPOSE_ENDPOINTS.UPDATE(id), backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update purpose')
      }

      return data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update purpose'
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(PURPOSE_ENDPOINTS.DELETE(id))

      if (response.data?.status === 200) {
        return
      }

      throw new Error(response.data?.message || 'Failed to delete purpose')
    } catch (error: any) {
      if (error.response?.status === 500) {
        return
      }
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete purpose'
      throw new Error(errorMessage)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id))
      const response = await AxiosFunc.Delete(PURPOSE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete purposes')
      }

      if (
        response.data?.message &&
        response.data?.message.toLowerCase() !== 'success' &&
        response.data?.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.error('Error deleting multiple purposes:', error)
      const errorMessage =
        error?.message || error?.response?.data?.message || 'Failed to delete purposes'
      throw new Error(errorMessage)
    }
  },
}
