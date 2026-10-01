import AxiosFunc from '../../utils/axios'
import type {
  HostelRoom,
  HostelRoomFormData,
  HostelRoomSearchParams,
  BedAvailabilityResponse,
  HostelRoomResponse,
} from '../../types/hostel/HostelRooms'

const HOSTEL_ROOM_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/hostel-rooms/getAll',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/hostel-rooms/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/delete-multiple',
  CHECK_AVAILABILITY:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/hostel-rooms/check-availability',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (item: any): HostelRoom => {
  return {
    id: item.hostelRoomId?.toString() || '',
    hostelRoomId: item.hostelRoomId?.toString() || '',
    roomNo: item.roomNo || '',
    roomNumber: item.roomNo || '',
    noOfBeds: item.noOfBeds || '',
    availableBeds: item.availableBeds || '',
    costPerBed: item.costPerBed || '',
    description: item.description || '',
    hostelId: item.hostel?.hostelId?.toString() || '',
    hostel: {
      id: item.hostel?.hostelId?.toString() || '',
      name: item.hostel?.hostelName || '',
    },
    hostelName: item.hostel?.hostelName || '',
    roomTypeId: item.roomType?.roomTypeId?.toString() || '',
    roomType: {
      id: item.roomType?.roomTypeId?.toString() || '',
      name: item.roomType?.roomType || '',
    },
    roomTypeName: item.roomType?.roomType || '',
  }
}

const transformFrontendToBackendDto = (data: HostelRoomFormData) => {
  return {
    roomNo: data.roomNo,
    noOfBeds: data.noOfBeds,
    availableBeds: data.availableBeds,
    costPerBed: data.costPerBed,
    description: data.description || '',
    hostelId: Number(data.hostelId),
    roomTypeId: Number(data.roomTypeId),
  }
}

export const hostelRoomService = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<HostelRoomResponse> => {
    const endpoint = isAllSchools()
      ? HOSTEL_ROOM_ENDPOINTS.GET_ALL_SCHOOL
      : HOSTEL_ROOM_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch hostel rooms')

    const data = response.data.data
    return {
      hostelRoom: (data.source || data.hostelRoom || data.hostelRooms || []).map(
        transformBackendToFrontend,
      ),
      currentPage: data.currentPage ?? page,
      totalItems: data.totalItems ?? 0,
      totalPages: data.totalPages ?? 0,
    }
  },

  filter: async (
    params: HostelRoomSearchParams,
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<HostelRoomResponse> => {
    const body: Record<string, any> = {}
    if (params.search?.trim()) body.search = params.search.trim()
    if (params.hostelId) body.hostelId = Number(params.hostelId)
    if (params.roomTypeId) body.roomTypeId = Number(params.roomTypeId)

    const baseEndpoint = isAllSchools()
      ? HOSTEL_ROOM_ENDPOINTS.FILTER_SCHOOL
      : HOSTEL_ROOM_ENDPOINTS.FILTER

    const url = `${baseEndpoint}?page=${page}&size=${size}&sortDirection=${sortDirection}`

    const response = await AxiosFunc.Post(url, body)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to filter hostel rooms')

    const data = response.data.data
    return {
      hostelRoom: (data.source || data.hostelRoom || data.hostelRooms || []).map(
        transformBackendToFrontend,
      ),
      currentPage: data.currentPage ?? page,
      totalItems: data.totalItems ?? 0,
      totalPages: data.totalPages ?? 0,
    }
  },

  create: async (data: HostelRoomFormData): Promise<HostelRoom> => {
    const dto = transformFrontendToBackendDto(data)
    const response = await AxiosFunc.Post(HOSTEL_ROOM_ENDPOINTS.CREATE, dto)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to create hostel room')
    return transformBackendToFrontend(response.data.data)
  },

  update: async (id: string, data: HostelRoomFormData): Promise<HostelRoom> => {
    const dto = transformFrontendToBackendDto(data)
    const response = await AxiosFunc.Put(HOSTEL_ROOM_ENDPOINTS.UPDATE(id), dto)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update hostel room')
    return transformBackendToFrontend(response.data.data)
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(HOSTEL_ROOM_ENDPOINTS.DELETE(id))
      if (response.data?.status === 200) return
      throw new Error(response.data?.message || 'Failed to delete hostel room')
    } catch (error: any) {
      if (error?.response?.status === 500) return
      throw new Error(
        error?.response?.data?.message || error?.message || 'Failed to delete hostel room',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const numericIds = ids.map((id) => Number(id))
    const response = await AxiosFunc.Delete(HOSTEL_ROOM_ENDPOINTS.DELETE_MULTIPLE, numericIds)
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to delete hostel rooms')
  },

  checkBedAvailability: async (
    hostelId: string,
    roomId: string,
    date: string,
    totalMonths: number,
    excludeStudentId?: string,
  ): Promise<BedAvailabilityResponse> => {
    const params: Record<string, any> = {
      hostelId: Number(hostelId),
      roomId: Number(roomId),
      date,
      totalMonths: Number(totalMonths),
    }
    if (excludeStudentId && excludeStudentId !== '' && excludeStudentId !== '0')
      params.excludeStudentId = Number(excludeStudentId)

    const response = await AxiosFunc.Get(HOSTEL_ROOM_ENDPOINTS.CHECK_AVAILABILITY, params)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to check bed availability')

    const data = response.data.data
    return {
      available: Boolean(data.available),
      message: data.message || 'Unknown availability status',
      occupiedBeds: Number(data.occupiedBeds) || 0,
      totalBeds: Number(data.totalBeds) || 0,
      availableBeds: Number(data.availableBeds) || 0,
      roomNumber: data.roomNumber || '',
    }
  },
}
