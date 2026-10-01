import AxiosFunc from '../../utils/axios'
import type { RoomType, RoomTypeFormData } from '../../types/hostel/RoomType'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const ROOM_TYPE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/room-types/all',
  GET_ALL_PAGINATED: '/school-group/{schoolGroupCode}/school/room-types/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/room-types/add',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/room-types/update/${id}`,
  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/room-types/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/room-types/delete-multiple',
}

const transformBackendToFrontend = (data: any): RoomType => ({
  roomTypeId: data.roomTypeId,
  roomType: data.roomType ?? '',
  description: data.description ?? '',
  name: '',
})

const transformFrontendToBackend = (data: RoomTypeFormData) => ({
  roomType: data.roomType,
  description: data.description,
})

export const roomTypeService = {
  getAll: async (): Promise<RoomType[]> => {
    try {
      const endpoint = isAllSchools()
        ? ROOM_TYPE_ENDPOINTS.GET_ALL_PAGINATED
        : ROOM_TYPE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, { page: 0, size: 1000 })

      if (!response?.data || response.data?.status !== 200) return []

      const raw = response.data?.data
      const items = raw?.roomTypes || (Array.isArray(raw) ? raw : [])

      return items.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('❌ getAll error:', error.message)
      return []
    }
  },

  create: async (data: RoomTypeFormData): Promise<RoomType> => {
    try {
      const response = await AxiosFunc.Post(
        ROOM_TYPE_ENDPOINTS.CREATE,
        transformFrontendToBackend(data),
      )
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to create room type')
      return transformBackendToFrontend(response.data.data)
    } catch (error: any) {
      console.error(' create error:', error.message)
      throw error
    }
  },

  update: async (id: number, data: RoomTypeFormData): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(
        ROOM_TYPE_ENDPOINTS.UPDATE(id),
        transformFrontendToBackend(data),
      )
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to update room type')
    } catch (error: any) {
      console.error(' update error:', error.message)
      throw error
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ROOM_TYPE_ENDPOINTS.DELETE(id))
      if (!response?.data || response.data?.status !== 200)
        throw new Error('Failed to delete room type')
    } catch (error: any) {
      console.error(' delete error:', error.message)
      throw error
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ROOM_TYPE_ENDPOINTS.DELETE_MULTIPLE, ids)
      if (!response?.data || response.data?.status !== 200)
        throw new Error('Failed to delete room types')
    } catch (error: any) {
      console.error(' deleteMultiple error:', error.message)
      throw error
    }
  },
}
