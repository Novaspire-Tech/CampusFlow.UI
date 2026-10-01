import AxiosFunc from '../../utils/axios'
import type { Vehicle, VehicleFormData } from '../../types/transport/vehicle'
import { openDocument } from '../../hooks/useBlobImage'

const VEHICLE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/vehicles/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/vehicles/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/vehicles/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/vehicles/update/${id}`,
  UPDATE_DOCUMENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/vehicles/update-document/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/vehicles/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/vehicles/delete-multiple',
  openDocument,
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (backendData: any): Vehicle => {
  return {
    id: backendData.vehiclesId?.toString() || backendData.id?.toString() || '',
    vehicleNumber: backendData.vehicleNumber || '',
    vehicleModel: backendData.vehicleModel || '',
    yearMade: backendData.yearMade || '',
    registrationNumber: backendData.registrationNumber || 'null',
    chassisNumber: backendData.chasesNumber || backendData.chassisNumber || 'null',
    maxSeatingCapacity: backendData.maxSeatingCapacity || '',
    driverLicence: backendData.driverLicence || '',
    driverContact: backendData.driverContact || '',
    driverName: backendData.driverName || '',
    adhaarNumber: backendData.adhaarNumber || '',
    document: backendData.document || null,
  }
}

const transformFrontendToBackendDto = (frontendData: VehicleFormData): any => {
  return {
    vehicleNumber: frontendData.vehicleNumber?.trim() || null,
    vehicleModel: frontendData.vehicleModel?.trim() || null,
    yearMade: frontendData.yearMade?.trim() || null,
    registrationNumber: frontendData.registrationNumber?.trim() || null,
    chasesNumber: frontendData.chassisNumber?.trim() || null,
    maxSeatingCapacity: frontendData.maxSeatingCapacity?.trim() || null,
    driverLicence: frontendData.driverLicence?.trim() || null,
    driverContact: frontendData.driverContact?.trim() || null,
    driverName: frontendData.driverName?.trim() || null,
    adhaarNumber: frontendData.adhaarNumber?.trim() || null,
  }
}

const validateVehicleData = (data: VehicleFormData): string | null => {
  if (!data.vehicleNumber?.trim()) return 'Vehicle number is required'
  if (!data.driverName?.trim()) return 'Driver name is required'
  if (!data.driverLicence?.trim()) return 'Driver licence is required'
  if (!data.adhaarNumber?.trim()) return 'Aadhaar number is required'

  const adhaarRegex = /^\d{12}$/
  if (!adhaarRegex.test(data.adhaarNumber.trim())) return 'Aadhaar number must be exactly 12 digits'

  if (data.yearMade) {
    const year = parseInt(data.yearMade)
    const currentYear = new Date().getFullYear()
    if (isNaN(year) || year < 1900 || year > currentYear + 1)
      return `Year made must be between 1900 and ${currentYear + 1}`
  }

  if (data.maxSeatingCapacity) {
    const capacity = parseInt(data.maxSeatingCapacity)
    if (isNaN(capacity) || capacity < 1 || capacity > 100)
      return 'Max seating capacity must be between 1 and 100'
  }

  if (data.driverContact) {
    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(data.driverContact.trim()))
      return 'Driver contact must be a 10-digit number'
  }

  return null
}

export const vehicleService = {
  getAll: async (): Promise<Vehicle[]> => {
    try {
      const endpoint = isAllSchools() ? VEHICLE_ENDPOINTS.GET_ALL_SCHOOL : VEHICLE_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch vehicles')

      const data = response.data?.data
      const list = data?.vehicles || data?.source || []

      if (!Array.isArray(list)) {
        console.warn('Backend did not return an array of vehicles')
        return []
      }

      return list.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('Error fetching vehicles:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch vehicles')
    }
  },

  create: async (data: VehicleFormData): Promise<Vehicle> => {
    try {
      const validationError = validateVehicleData(data)
      if (validationError) throw new Error(validationError)

      const formData = new FormData()
      const dto = transformFrontendToBackendDto(data)
      formData.append('data', JSON.stringify(dto))

      if (data.document instanceof File) {
        if (data.document.size > 5 * 1024 * 1024)
          throw new Error('Document size must not exceed 5MB')
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if (!allowedTypes.includes(data.document.type))
          throw new Error('Only PDF, JPG, JPEG, and PNG files are allowed')
        formData.append('document', data.document)
      }

      const response = await AxiosFunc.Post(VEHICLE_ENDPOINTS.CREATE, formData)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create vehicle')

      return transformBackendToFrontend(response.data?.data)
    } catch (error: any) {
      console.error('Create vehicle error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to create vehicle')
    }
  },

  update: async (id: string, data: VehicleFormData): Promise<Vehicle> => {
    try {
      const validationError = validateVehicleData(data)
      if (validationError) throw new Error(validationError)

      const dto = transformFrontendToBackendDto(data)
      console.log('Updating vehicle with DTO:', dto)

      const response = await AxiosFunc.Put(VEHICLE_ENDPOINTS.UPDATE(id), dto)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update vehicle')

      return transformBackendToFrontend(response.data?.data)
    } catch (error: any) {
      console.error('Update vehicle error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to update vehicle')
    }
  },

  updateDocument: async (id: string, file: File): Promise<void> => {
    try {
      if (!(file instanceof File)) throw new Error('Invalid document file')
      if (file.size > 5 * 1024 * 1024) throw new Error('Document size must not exceed 5MB')
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!allowedTypes.includes(file.type))
        throw new Error('Only PDF, JPG, JPEG, and PNG files are allowed')

      const formData = new FormData()
      formData.append('document', file)

      const response = await AxiosFunc.PutFormData(VEHICLE_ENDPOINTS.UPDATE_DOCUMENT(id), formData)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update driver document')
    } catch (error: any) {
      console.error('Update document error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to update document')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      if (!id) throw new Error('Vehicle ID is required')

      const response = await AxiosFunc.Delete(VEHICLE_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete vehicle')
    } catch (error: any) {
      console.error('Delete vehicle error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete vehicle')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      if (!ids || ids.length === 0) throw new Error('No vehicle IDs provided for deletion')

      const numericIds = ids.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
      if (numericIds.length === 0) throw new Error('No valid vehicle IDs to delete')

      const response = await AxiosFunc.Delete(VEHICLE_ENDPOINTS.DELETE_MULTIPLE, {
        ids: numericIds,
      })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete vehicles')
    } catch (error: any) {
      console.error('Delete multiple vehicles error:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete vehicles')
    }
  },
}
