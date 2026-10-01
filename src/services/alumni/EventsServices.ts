import AxiosFunc from '../../utils/axios'
import type { Events, EventsFormData } from '../../types/alumni/Events'


const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const EVENTS_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/events/all',
  GET_ALL_PAGINATED: '/school-group/{schoolGroupCode}/school/events/getAll', 
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/events/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/events/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/events/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/events/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/events/delete-multiple',
}

const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${d.getFullYear()}`
}

const transformToDTO = (data: EventsFormData) => {
  const dto: any = {
    eventTitle: data.eventTitle,
    fromDate: formatDate(data.fromDate),
    toDate: formatDate(data.toDate),
  }
  if (data.sessionId && data.sessionId !== '') dto.sessionId = Number(data.sessionId)
  if (data.classId && data.classId !== '') dto.schoolClassId = Number(data.classId)
  return dto
}

const mapItemToEvent = (item: any): Events => ({
  eventsId: item.eventsId?.toString() || item.id?.toString() || '',
  eventTitle: item.eventTitle || '',
  fromDate: item.fromDate || '',
  toDate: item.toDate || '',
  sessionId: item.session?.sessionId?.toString() || item.session?.id?.toString() || '',
  session: item.session
    ? {
        sessionId: item.session?.sessionId?.toString() || item.session?.id?.toString() || '',
        sessionName: item.session?.sessionName || item.session?.session || item.session?.name || '',
      }
    : undefined,
  schoolClass: item.schoolClass
    ? {
        id: item.schoolClass.classId?.toString() || item.schoolClass.id?.toString() || '',
        className: item.schoolClass.className || item.schoolClass.name || '',
      }
    : undefined,
  classSection:
    item.classSection?.sectionName || item.classSection?.name || item.classSection || '',
})

export const eventsService = {
  getAll: async (): Promise<Events[]> => {
    try {
      const endpoint = isAllSchools()
        ? EVENTS_ENDPOINTS.GET_ALL_PAGINATED
        : EVENTS_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get((endpoint), {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch events')

      const raw = response.data?.data
      const list = Array.isArray(raw) ? raw : raw?.events || raw?.event || []

      return list.map(mapItemToEvent)
    } catch (error: any) {
      console.error('Error fetching events:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<Events | null> => {
    try {
      const response = await AxiosFunc.Get((EVENTS_ENDPOINTS.GET_BY_ID(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch event')
      return mapItemToEvent(response.data?.data)
    } catch (error: any) {
      console.error('Error fetching event by ID:', error)
      throw error
    }
  },

  create: async (data: EventsFormData): Promise<Events> => {
    try {
      const dto = transformToDTO(data)
      const response = await AxiosFunc.Post((EVENTS_ENDPOINTS.CREATE), dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create event')
      return mapItemToEvent(response.data?.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create event')
    }
  },

  update: async (id: string, data: EventsFormData): Promise<Events> => {
    try {
      const dto = transformToDTO(data)
      const response = await AxiosFunc.Put((EVENTS_ENDPOINTS.UPDATE(id)), dto)
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update event')
      return mapItemToEvent(response.data?.data)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update event')
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete((EVENTS_ENDPOINTS.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete event')
    } catch (error: any) {
      console.error('Error deleting event:', error)
      throw error
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id))
      const response = await AxiosFunc.Delete(
        (EVENTS_ENDPOINTS.DELETE_MULTIPLE),
        numericIds,
      )
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete events')
    } catch (error: any) {
      console.error('Error deleting multiple events:', error)
      throw error
    }
  },
}
 