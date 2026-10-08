import AxiosFunc from '../../utils/axios'
import type {
  Session,
  SessionRolloverReport,
  SessionRolloverRequest,
  SessionRolloverRequestInput,
  SessionRequest,
  SessionStats,
} from '../../types/systemSettinds/SessionSetting'

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
  ROLLOVER: '/school-group/{schoolGroupCode}/school/{schoolCode}/session/rollover',
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): Session => ({
  id: d.id?.toString() ?? d.sessionId?.toString() ?? '',
  sessionId: d.sessionId?.toString() ?? '',
  sessionName: d.sessionName ?? d.session ?? '',
  session: d.session ?? '',
  isCurrent: d.isCurrent ?? false,
  startDate: d.startDate ?? '',
  endDate: d.endDate ?? null,
})

const toBackendDate = (date: string | null): string | null => {
  if (!date) return null
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) throw new Error('Invalid session date')
  return `${match[3]}/${match[2]}/${match[1]}`
}

const extractList = (response: any): Session[] => {
  const data = response?.data?.data?.sessions ?? response?.data?.data ?? response?.data ?? []
  return Array.isArray(data) ? data.map(toFrontend) : []
}

const isSessionRolloverReport = (value: unknown): value is SessionRolloverReport => {
  if (typeof value !== 'object' || value === null) return false
  const report = value as Record<string, unknown>
  return (
    typeof report.fromSessionId === 'number' &&
    typeof report.fromSession === 'string' &&
    typeof report.toSessionId === 'number' &&
    typeof report.toSession === 'string' &&
    typeof report.dryRun === 'boolean' &&
    Array.isArray(report.copiedClasses) &&
    report.copiedClasses.every((entry) => typeof entry === 'string') &&
    Array.isArray(report.skippedClasses) &&
    report.skippedClasses.every((entry) => typeof entry === 'string') &&
    typeof report.sectionsCreated === 'number' &&
    typeof report.subjectGroupsCreated === 'number' &&
    typeof report.examGroupsCreated === 'number' &&
    typeof report.classFeesCreated === 'number' &&
    typeof report.message === 'string'
  )
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

  create: async (data: SessionRequest): Promise<Session> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), {
      session: data.session,
      startDate: toBackendDate(data.startDate),
      endDate: toBackendDate(data.endDate),
    })

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create session')

    return toFrontend(response.data?.data ?? {})
  },

  update: async (id: string, data: SessionRequest): Promise<Session> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), {
      session: data.session,
      startDate: toBackendDate(data.startDate),
      endDate: toBackendDate(data.endDate),
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

  rollover: async (request: SessionRolloverRequestInput): Promise<SessionRolloverReport> => {
    const fromSessionId = Number(request.fromSessionId)
    const toSessionId = Number(request.toSessionId)
    if (!Number.isFinite(fromSessionId) || !Number.isFinite(toSessionId)) {
      throw new Error('Invalid source or target session')
    }

    const payload: SessionRolloverRequest = {
      ...request,
      fromSessionId,
      toSessionId,
    }
    try {
      const response = await AxiosFunc.Post(buildUrl(EP.ROLLOVER), payload)
      const envelope = response.data as {
        status?: unknown
        message?: unknown
        data?: unknown
      }

      if (envelope?.status !== 200) {
        throw new Error(
          typeof envelope?.message === 'string'
            ? envelope.message
            : 'Failed to copy session structure',
        )
      }
      if (!isSessionRolloverReport(envelope.data)) {
        throw new Error('The server returned an invalid session rollover report')
      }
      return envelope.data
    } catch (error: unknown) {
      if (typeof error === 'object' && error !== null && 'response' in error) {
        const responseError = error.response
        if (
          typeof responseError === 'object' &&
          responseError !== null &&
          'data' in responseError
        ) {
          const responseData = responseError.data
          if (
            typeof responseData === 'object' &&
            responseData !== null &&
            'message' in responseData &&
            typeof responseData.message === 'string'
          ) {
            throw new Error(responseData.message)
          }
        }
      }
      throw error
    }
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
