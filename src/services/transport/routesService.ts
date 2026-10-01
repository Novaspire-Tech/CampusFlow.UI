import AxiosFunc from '../../utils/axios'
import type { Route, RouteFormData } from '../../types/transport/routes'

const ROUTES_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/routes/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/routes/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/routes/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/routes/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/routes/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/routes/delete-multiple',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (backendData: any): Route => {
  return {
    id: backendData.routeId?.toString() || backendData.id?.toString() || '',
    routeTitle: backendData.routeTitle || '',
  }
}

const extractRoutesFromResponse = (response: any): Route[] => {
  const backendData = response?.data?.data?.routes || response?.data?.routes || []
  return backendData.map(transformBackendToFrontend)
}

export const routesService = {
  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = 'asc',
  ): Promise<Route[]> => {
    const endpoint = isAllSchools() ? ROUTES_ENDPOINTS.GET_ALL_SCHOOL : ROUTES_ENDPOINTS.GET_ALL

    const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to fetch route pickup points')
    }

    return extractRoutesFromResponse(response)
  },

  create: async (data: RouteFormData): Promise<Route> => {
    try {
      const response = await AxiosFunc.Post(ROUTES_ENDPOINTS.CREATE, data)

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to create route'
        throw new Error(errorMessage)
      }

      const createdRoute: Route = {
        ...(data as Route),
        id: response.data?.data?.routeId?.toString() || `temp-${Date.now()}`,
      }

      return createdRoute
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to create route'
      throw new Error(errorMessage)
    }
  },

  update: async (id: string, data: RouteFormData): Promise<Route> => {
    try {
      const response = await AxiosFunc.Put(ROUTES_ENDPOINTS.UPDATE(id), data)

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to update route'
        throw new Error(errorMessage)
      }

      return { id, ...data }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to update route'
      throw new Error(errorMessage)
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ROUTES_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to delete route'
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Failed to delete route'
      throw new Error(errorMessage)
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => parseInt(id))
      const response = await AxiosFunc.Delete(ROUTES_ENDPOINTS.DELETE_MULTIPLE, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete routes')
      }
      if (
        response.data?.message &&
        response.data?.message.toLowerCase() !== 'success' &&
        response.data?.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message)
      }
    } catch (error: any) {
      console.error('Error deleting multiple routes:', error)
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to delete routes'
      throw new Error(errorMessage)
    }
  },
}
