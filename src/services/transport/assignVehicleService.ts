import AxiosFunc from '../../utils/axios'
import type { AssignVehicle, AssignVehicleFormData } from '../../types/transport/assignVehicle'

const ASSIGN_VEHICLE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-vehicles/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/assign-vehicles/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-vehicles/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/assign-vehicles/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/assign-vehicles/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/assign-vehicles/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformToDTO = (data: AssignVehicleFormData) => {
  return {
    routeId: Number(data.routeId),
    vehicleId: Number(data.vehicleId),
  }
}

const mapAssignVehicleItem = (item: any): AssignVehicle => ({
  id: item.assignVehiclesId?.toString(),
  assignVehiclesId: item.assignVehiclesId?.toString(),
  routeId: item.routes?.routeId?.toString() || '',
  route: {
    id: item.routes?.routeId?.toString() || '',
    name: item.routes?.routeTitle || item.routes?.routeName || '',
  },
  routeName: item.routes?.routeTitle || item.routes?.routeName || '',
  vehicleId: item.vehicles?.vehiclesId?.toString() || item.vehicles?.vehicleId?.toString() || '',
  vehicle: {
    id: item.vehicles?.vehiclesId?.toString() || item.vehicles?.vehicleId?.toString() || '',
    name: item.vehicles?.vehicleName || item.vehicles?.vehicleNumber || '',
    vehicleNumber: item.vehicles?.vehicleNumber || '',
  },
  vehicleName: item.vehicles?.vehicleName || item.vehicles?.vehicleNumber || '',
})

export const assignVehicleService = {
  getAll: async (): Promise<AssignVehicle[]> => {
    try {
      const endpoint = isAllSchools()
        ? ASSIGN_VEHICLE_ENDPOINTS.GET_ALL_SCHOOL
        : ASSIGN_VEHICLE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch assigned vehicles')

      const data = response.data?.data
      const list = Array.isArray(data) ? data : data?.assignVehicles || data?.source || []

      if (!Array.isArray(list)) {
        console.warn('Backend did not return an array of assigned vehicles')
        return []
      }

      const seen = new Set<string>()
      const unique = list.filter((item: any) => {
        const key = `${item.assignVehiclesId}-${item.routes?.routeId}-${item.vehicles?.vehiclesId}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      return unique.map(mapAssignVehicleItem)
    } catch (error: any) {
      console.error('Error fetching assigned vehicles:', error)
      throw error
    }
  },

  create: async (data: AssignVehicleFormData): Promise<AssignVehicle> => {
    try {
      const dto = transformToDTO(data)

      const response = await AxiosFunc.Post(ASSIGN_VEHICLE_ENDPOINTS.CREATE, dto)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to assign vehicle')

      return mapAssignVehicleItem(response.data?.data)
    } catch (error: any) {
      console.error('Error assigning vehicle:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to assign vehicle')
    }
  },

  update: async (id: string, data: AssignVehicleFormData): Promise<AssignVehicle> => {
    try {
      const dto = transformToDTO(data)

      const response = await AxiosFunc.Put(ASSIGN_VEHICLE_ENDPOINTS.UPDATE(id), dto)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update vehicle assignment')

      return mapAssignVehicleItem(response.data?.data)
    } catch (error: any) {
      console.error('Error updating vehicle assignment:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update vehicle assignment',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ASSIGN_VEHICLE_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete vehicle assignment')
    } catch (error: any) {
      console.error('Error deleting vehicle assignment:', error)
      throw error
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))

      const response = await AxiosFunc.Delete(ASSIGN_VEHICLE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete vehicle assignments')
    } catch (error: any) {
      console.error('Error deleting multiple vehicle assignments:', error)
      throw error
    }
  },
}
