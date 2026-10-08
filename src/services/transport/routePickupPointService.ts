import AxiosFunc from '../../utils/axios'
import type {
  RoutePickupPoint,
  RoutePickupPointFormData,
} from '../../types/transport/routePickupPoint'

export interface FilterRoutePickupPointDto {
  search?: string | null
  routeId?: number
}

export interface PaginatedRoutePickupPointsResponse {
  length?: number
  filter?: (arg0: (rpp: any) => boolean) => any
  routePickupPoints: RoutePickupPoint[]
  currentPage: number
  totalItems: number
  totalPages: number
}

const ROUTE_PICKUP_POINT_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/route-pickup-point/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/route-pickup-point/getAll',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/route-pickup-point/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/route-pickup-point/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/route-pickup-point/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/route-pickup-point/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/route-pickup-point/delete/${id}`,
  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/route-pickup-point/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (item: any): RoutePickupPoint => {
  return {
    id: String(item.routePickupPointId ?? item.id ?? ''),
    routeId: String(item.routes?.routeId ?? ''),
    routeName: item.routes?.routeTitle ?? '',
    pickupPointId: String(item.pickUpPoint?.pickUpPointId ?? ''),
    pickUpPoint: item.pickUpPoint?.name ?? '',

    vehicleId: String(item.vehicles?.vehiclesId ?? ''),
    vehicleNumber: item.vehicles?.vehicleNumber ?? '',
    totalFees: String(item.monthlyFees ?? ''),
    distance: String(item.distance ?? ''),
    pickupTime: item.pickUpTime ?? '',
    dropOffTime: item.dropOffTime ?? '',
  }
}

const transformFrontendToBackend = (data: RoutePickupPointFormData) => {
  return {
    routeId: Number(data.routeId),
    pickUpPointId: Number(data.pickupPointId),
    vehicleId: Number(data.vehicleId),

    monthlyFees: Number(data.totalFees),
    distance: data.distance ? Number(data.distance) : 0,
    pickUpTime: data.pickupTime,
    dropOffTime: data.dropOffTime,
  }
}

const extractPaginated = (response: any): PaginatedRoutePickupPointsResponse => {
  const data = response?.data?.data
  const items = data?.routePickupPoints

  if (!Array.isArray(items)) {
    console.warn('Route pickup points array not found in response')
    return { routePickupPoints: [], currentPage: 0, totalItems: 0, totalPages: 0 }
  }

  return {
    routePickupPoints: items.map(transformBackendToFrontend),
    currentPage: data.currentPage ?? 0,
    totalItems: data.totalItems ?? 0,
    totalPages: data.totalPages ?? 0,
  }
}

export const routePickupPointService = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<PaginatedRoutePickupPointsResponse> => {
    const endpoint = isAllSchools()
      ? ROUTE_PICKUP_POINT_ENDPOINTS.GET_ALL_SCHOOL
      : ROUTE_PICKUP_POINT_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to fetch route pickup points')
    }

    return extractPaginated(response)
  },

  getAllPages: async (sortDirection: 'asc' | 'desc' = 'asc'): Promise<PaginatedRoutePickupPointsResponse> => {
    const pageSize = 10
    const firstPage = await routePickupPointService.getAll(0, pageSize, sortDirection)
    const routePickupPoints = [...firstPage.routePickupPoints]
    for (let page = 1; page < firstPage.totalPages; page += 1) {
      const response = await routePickupPointService.getAll(page, pageSize, sortDirection)
      routePickupPoints.push(...response.routePickupPoints)
    }
    return { ...firstPage, routePickupPoints, currentPage: 0 }
  },

  filter: async (
    dto: FilterRoutePickupPointDto,
    page = 0,
    size = 10,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<PaginatedRoutePickupPointsResponse> => {
    const url = new URL(ROUTE_PICKUP_POINT_ENDPOINTS.FILTER, window.location.origin)
    url.searchParams.set('page', String(page))
    url.searchParams.set('size', String(size))
    url.searchParams.set('sortDirection', sortDirection)
    if (sortBy) url.searchParams.set('sortBy', sortBy)

    const response = await AxiosFunc.Post(
      `${ROUTE_PICKUP_POINT_ENDPOINTS.FILTER}?page=${page}&size=${size}&sortDirection=${sortDirection}${sortBy ? `&sortBy=${sortBy}` : ''}`,
      dto,
    )

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to filter route pickup points')
    }

    return extractPaginated(response)
  },

  create: async (data: RoutePickupPointFormData): Promise<void> => {
    console.log('Creating route pickup point with data:', transformFrontendToBackend(data))
    const response = await AxiosFunc.Post(
      ROUTE_PICKUP_POINT_ENDPOINTS.CREATE,
      transformFrontendToBackend(data),
    )

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to create route pickup point')
    }
  },

  update: async (id: string, data: RoutePickupPointFormData): Promise<void> => {
    const response = await AxiosFunc.Put(
      ROUTE_PICKUP_POINT_ENDPOINTS.UPDATE(id),
      transformFrontendToBackend(data),
    )

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to update route pickup point')
    }
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(ROUTE_PICKUP_POINT_ENDPOINTS.DELETE(id))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to delete route pickup point')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      ROUTE_PICKUP_POINT_ENDPOINTS.DELETE_MULTIPLE,
      ids.map(Number),
    )

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to delete route pickup points')
    }
  },
}
