import AxiosFunc from '../../../utils/axios'
import type { Reference } from '../../../types/frontOffice/setupFrontOffice/reference'

const REFERENCE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/reference/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/reference/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/reference/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/reference/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/reference/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/reference/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/reference/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (backendData: any): Reference => {
  return {
    id: backendData.referenceId?.toString() || backendData.id?.toString() || '',
    referenceId: backendData.referenceId?.toString() || backendData.id?.toString(),
    reference: backendData.reference || '',
    description: backendData.description || '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: backendData.isActive ? 'Active' : 'Inactive',
  }
}

const transformFrontendToBackend = (frontendData: Partial<Reference>): any => {
  const dto: any = {
    reference: frontendData.reference,
  }
  if (frontendData.description && frontendData.description.trim()) {
    dto.description = frontendData.description.trim()
  }
  return dto
}

const extractReferencesFromResponse = (response: any): Reference[] => {
  const backendData =
    response?.data?.data?.references ||
    response?.data?.references ||
    response?.data?.data?.reference ||
    response?.data?.reference ||
    response?.data?.data ||
    []

  if (!Array.isArray(backendData)) {
    console.warn('Backend data is not an array:', backendData)
    return []
  }

  return backendData.map(transformBackendToFrontend)
}

export const referenceService = {
  getAll: async (): Promise<Reference[]> => {
    try {
      const endpoint = isAllSchools()
        ? REFERENCE_ENDPOINTS.GET_ALL_SCHOOL
        : REFERENCE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch references')
      }

      return extractReferencesFromResponse(response)
    } catch (error: any) {
      console.error('Error fetching references:', error)
      return []
    }
  },

  getById: async (id: string): Promise<Reference | null> => {
    try {
      const response = await AxiosFunc.Get(REFERENCE_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) {
        return null
      }

      const backendData = response.data?.data
      if (!backendData) return null

      return transformBackendToFrontend(backendData)
    } catch (error: any) {
      console.error('Error fetching reference:', error)
      return null
    }
  },

  create: async (data: Partial<Reference>): Promise<Reference> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(REFERENCE_ENDPOINTS.CREATE, backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to create reference')
      }

      const createdReference: Reference = {
        ...(data as Reference),
        id: response.data?.data?.referenceId?.toString() || `temp-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      }

      return createdReference
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create reference'
      throw new Error(errorMessage)
    }
  },

  update: async (id: string, data: Reference): Promise<Reference> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Put(REFERENCE_ENDPOINTS.UPDATE(id), backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to update reference')
      }

      return data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update reference'
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(REFERENCE_ENDPOINTS.DELETE(id))

      if (response.data?.status === 200) {
        return
      }

      const errorMessage = response.data?.message || 'Failed to delete reference'
      throw new Error(errorMessage)
    } catch (error: any) {
      if (error.response?.status === 500) {
        return
      }
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete reference'
      throw new Error(errorMessage)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id))
      const response = await AxiosFunc.Delete(REFERENCE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete references')
      }
      if (
        response.data?.message &&
        response.data?.message.toLowerCase() !== 'success' &&
        response.data?.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.error('Error deleting multiple references:', error)
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete references'
      throw new Error(errorMessage)
    }
  },
}
