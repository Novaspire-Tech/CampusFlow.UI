import AxiosFunc from '../../utils/axios'
import type { Session, SessionStats } from '../../types/systemSettinds/SessionSetting'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/session/all',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/session/all',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/session/add',
  UPDATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/session/update/${id}`,
  DELETE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/session/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/session/delete-multiple',
  CHANGE_CURRENT: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/session/${id}/change-current-session`,
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): Session => ({
  id: d.id?.toString() ?? d.sessionId?.toString() ?? '',
  sessionId: d.sessionId?.toString() ?? '',
  sessionName: d.sessionName ?? d.session ?? '',
  session: d.session ?? '',
  isCurrent: d.isCurrent ?? false,
})

const extractList = (response: any): Session[] => {
  const data = response?.data?.data?.sessions ?? response?.data?.data ?? response?.data ?? []
  return Array.isArray(data) ? data.map(toFrontend) : []
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const sessionService = {
  getAll: async (): Promise<Session[]> => {
    try {
      const url = isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)
      const response = await AxiosFunc.Get(url)

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch sessions')

      return extractList(response)
    } catch (error: any) {
      console.error('Error fetching sessions:', error)
      return []
    }
  },

  create: async (data: Partial<Session>): Promise<Session> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), {
      session: data.session ?? data.sessionName,
      sessionName: data.sessionName ?? data.session,
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create session')

    return toFrontend(response.data?.data ?? {})
  },

  update: async (id: string, data: Session): Promise<Session> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), {
      session: data.session,
      sessionName: data.sessionName,
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update session')

    return toFrontend(response.data?.data ?? data)
  },

  changeCurrentSession: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Put(buildUrl(EP.CHANGE_CURRENT(id)), {})

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to change current session')
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)))
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete session')
    } catch (error: any) {
      if (error.response?.status === 500) return
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete session')
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE_MULTIPLE), null, ids)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete sessions')
  },

  getStats: async (): Promise<SessionStats[]> => {
    try {
      const sessions = await sessionService.getAll()
      return [
        {
          title: 'Total Sessions',
          value: sessions.length.toString(),
          change: '+0%',
          icon: 'Calendar',
        },
      ]
    } catch (error: any) {
      console.error('Error fetching session stats:', error)
      return [{ title: 'Total Sessions', value: '0', change: '+0%', icon: 'Calendar' }]
    }
  },
}
