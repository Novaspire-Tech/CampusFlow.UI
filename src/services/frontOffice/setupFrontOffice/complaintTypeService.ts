import AxiosFunc from '../../../utils/axios'
import type { ComplaintType } from '../../../types/frontOffice/setupFrontOffice/complaintType'

// API ENDPOINTS
const COMPLAINT_TYPE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/complaint-type/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/complaint-type/getAll',
  GET_BY_ID: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/complaint-type/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/complaint-type/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/complaint-type/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/complaint-type/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/complaint-type/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

// DATA TRANSFORMATION HELPERS
const transformBackendToFrontend = (backendData: any): ComplaintType => {
  return {
    id: backendData.complaintTypeId?.toString() || backendData.id?.toString() || '',
    complaintTypeId: backendData.complaintTypeId?.toString() || backendData.id?.toString(),
    complaintType: backendData.complaintType || '',
    description: backendData.description || '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: backendData.isActive ? 'Active' : 'Inactive',
  }
}

const transformFrontendToBackend = (frontendData: Partial<ComplaintType>): any => {
  const dto: any = {
    complaintType: frontendData.complaintType,
  }

  // Only add description if it has content (not empty or whitespace)
  if (frontendData.description && frontendData.description.trim()) {
    dto.description = frontendData.description.trim()
  }

  return dto
}

const extractComplaintTypesFromResponse = (response: any): ComplaintType[] => {
  const backendData =
    response?.data?.data?.complaintTypes ||
    response?.data?.complaintTypes ||
    response?.data?.data ||
    []
  return backendData.map(transformBackendToFrontend)
}

// SERVICE METHODS
export const complaintTypeService = {
  getAll: async (): Promise<ComplaintType[]> => {
    try {
      const endpoint = isAllSchools()
        ? COMPLAINT_TYPE_ENDPOINTS.GET_ALL_SCHOOL
        : COMPLAINT_TYPE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch complaint types')
      }

      return extractComplaintTypesFromResponse(response)
    } catch (error: any) {
      console.error('Error fetching complaint types:', error)
      return []
    }
  },

  getById: async (id: string): Promise<ComplaintType | null> => {
    try {
      const response = await AxiosFunc.Get(COMPLAINT_TYPE_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) {
        return null
      }

      const backendData = response.data?.data
      if (!backendData) {
        return null
      }

      return transformBackendToFrontend(backendData)
    } catch (error: any) {
      console.error('Error fetching complaint type:', error)
      return null
    }
  },

  create: async (data: Partial<ComplaintType>): Promise<ComplaintType> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(COMPLAINT_TYPE_ENDPOINTS.CREATE, backendData)

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to create complaint type'
        throw new Error(errorMessage)
      }

      const createdComplaintType: ComplaintType = {
        ...(data as ComplaintType),
        id: response.data?.data?.complaintTypeId?.toString() || `temp-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      }

      return createdComplaintType
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create complaint type'
      throw new Error(errorMessage)
    }
  },

  update: async (id: string, data: ComplaintType): Promise<ComplaintType> => {
    try {
      const backendData = transformFrontendToBackend(data)

      const response = await AxiosFunc.Put(COMPLAINT_TYPE_ENDPOINTS.UPDATE(id), backendData)

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to update complaint type'
        throw new Error(errorMessage)
      }

      return data
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update complaint type'
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(COMPLAINT_TYPE_ENDPOINTS.DELETE(id))

      if (response.data?.status === 200) {
        return
      }

      const errorMessage = response.data?.message || 'Failed to delete complaint type'
      throw new Error(errorMessage)
    } catch (error: any) {
      if (error.response?.status === 500) {
        return
      }

      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete complaint type'
      throw new Error(errorMessage)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id))
      const response = await AxiosFunc.Delete(COMPLAINT_TYPE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete complaint types')
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
