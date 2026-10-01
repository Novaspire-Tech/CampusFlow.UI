import AxiosFunc from '../../utils/axios'
import type { PickupPoint, PickupPointFormData } from '../../types/transport/pickupPoint'

const PICKUP_POINT_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/pick-up-points/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/pick-up-points/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/pick-up-points/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/pick-up-points/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/pick-up-points/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/pick-up-points/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (backendData: any): PickupPoint => {
  return {
    id: backendData.pickUpPointId?.toString() || backendData.id?.toString() || '',
    pickUpPointId: backendData.pickUpPointId?.toString() || backendData.id?.toString() || '',
    name: backendData.name || '',
    pickUpPointName: backendData.name || '',
  }
}

const transformFrontendToBackendDto = (frontendData: PickupPointFormData) => {
  return {
    name: frontendData.pickUpPointName.trim(),
  }
}

export const pickupPointService = {
  getAll: async (): Promise<PickupPoint[]> => {
    try {
      const endpoint = isAllSchools()
        ? PICKUP_POINT_ENDPOINTS.GET_ALL_SCHOOL
        : PICKUP_POINT_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch pickup points')

      const data = response.data?.data
      const list = data?.pickUpPoints || data?.source || []

      if (!Array.isArray(list)) {
        console.warn('Backend did not return an array of pickup points')
        return []
      }

      return list.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('Error fetching pickup points:', error)
      throw error
    }
  },

  create: async (data: PickupPointFormData): Promise<PickupPoint> => {
    try {
      const dto = transformFrontendToBackendDto(data)
      const response = await AxiosFunc.Post(PICKUP_POINT_ENDPOINTS.CREATE, dto)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create pickup point')

      return transformBackendToFrontend(response.data?.data)
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to create pickup point',
      )
    }
  },

  update: async (id: string, data: PickupPointFormData): Promise<PickupPoint> => {
    try {
      const dto = transformFrontendToBackendDto(data)
      const response = await AxiosFunc.Put(PICKUP_POINT_ENDPOINTS.UPDATE(id), dto)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update pickup point')

      return transformBackendToFrontend(response.data?.data)
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to update pickup point',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(PICKUP_POINT_ENDPOINTS.DELETE(id))

      if (response.data?.status === 200) return

      throw new Error(response.data?.message || 'Failed to delete pickup point')
    } catch (error: any) {
      if (error?.response?.status === 500) return
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to delete pickup point',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))

      if (numericIds.length === 0) throw new Error('No valid IDs to delete')

      const response = await AxiosFunc.Delete(PICKUP_POINT_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete pickup points')
    } catch (error: any) {
      console.error('Error deleting multiple pickup points:', error)
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to delete pickup points',
      )
    }
  },
}
