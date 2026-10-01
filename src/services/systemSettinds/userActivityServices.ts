import AxiosFunc from '../../utils/axios'
import type {
  AuditLog,
  AuditLogListResponse,
  AuditLogQueryParams,
  FilterAuditLogsDto,
  AuditLogFilterOptions,
} from '../../types/systemSettinds/userActivity'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback)

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'))

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true'

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/audit-logs/getAll',
  GET_ALL_Schools: '/school-group/{schoolGroupCode}/school/audit-logs/getAll',
  GET_BY_STAFF: (staffId: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/audit-logs/staff/${staffId}`,
  FILTER:          '/school-group/{schoolGroupCode}/school/{schoolCode}/audit-logs/filter',
  FILTER_Schools:  '/school-group/{schoolGroupCode}/school/audit-logs/filter',
  FILTER_OPTIONS:  '/school-group/{schoolGroupCode}/school/{schoolCode}/audit-logs/filter-options',
}

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): AuditLog => ({
  id:           d.id,
  userId:       d.userId,
  action:       d.action,
  module:       d.module,
  role:         d.role,
  entityId:     d.entityId      ?? undefined,
  description:  d.description,
  oldValue:     d.oldValue      ?? null,
  newValue:     d.newValue      ?? null,
  ipAddress:    d.ipAddress     ?? undefined,
  createdBy:    d.createdBy     ?? undefined,
  createdDate:  d.createdDate   ?? undefined,
  isActive:     d.isActive      ?? undefined,
  modifiedBy:   d.modifiedBy    ?? null,
  modifiedDate: d.modifiedDate  ?? null,
})

const extractList = (raw: any): any[] =>
  Array.isArray(raw?.Logs)      ? raw.Logs      :
  Array.isArray(raw?.logs)      ? raw.logs       :
  Array.isArray(raw?.auditLogs) ? raw.auditLogs  :
  Array.isArray(raw?.content)   ? raw.content    :
  Array.isArray(raw?.source)    ? raw.source     :
  Array.isArray(raw?.data)      ? raw.data       :
  Array.isArray(raw)            ? raw            : []

const extractPageMeta = (
  raw: any,
  page: number,
  size: number,
  total: number,
): Omit<AuditLogListResponse, 'auditLogs'> => ({
  currentPage:   raw?.currentPage ?? page,
  totalElements: raw?.totalItems ?? raw?.totalElements ?? raw?.totalCount ?? total,
  totalPages:    raw?.totalPages ?? Math.ceil((raw?.totalItems ?? total) / size) ?? 1,
})

const buildQS = (params: AuditLogQueryParams): string => {
  const { page = 0, size = 10, sortBy, sortDirection = 'asc' } = params
  const qs = new URLSearchParams({ page: String(page), size: String(size), sortDirection })
  if (sortBy) qs.set('sortBy', sortBy)
  return qs.toString()
}

const buildFilterBody = (dto: FilterAuditLogsDto): Record<string, any> => {
  const body: Record<string, any> = {}
  if (dto.search?.trim())    body.search    = dto.search.trim()
  if (dto.action?.trim())    body.action    = dto.action.trim()
  if (dto.module?.trim())    body.module    = dto.module.trim()
  if (dto.startDate?.trim()) body.startDate = dto.startDate.trim()
  if (dto.endDate?.trim())   body.endDate   = dto.endDate.trim()
  return body
}

const parsePaginated = async (
  response: any,
  params: AuditLogQueryParams,
): Promise<AuditLogListResponse> => {
  const raw = response.data?.data
  const auditLogs = extractList(raw).map(toFrontend)
  return { auditLogs, ...extractPageMeta(raw, params.page ?? 0, params.size ?? 10, auditLogs.length) }
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const auditLogService = {

  getAll: async (params: AuditLogQueryParams = {}): Promise<AuditLogListResponse> => {
    const url = `${isAllSchools() ? buildUrl(EP.GET_ALL_Schools) : buildUrl(EP.GET_ALL)}?${buildQS(params)}`
    const response = await AxiosFunc.Get(url)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to fetch audit logs')

    return parsePaginated(response, params)
  },

  getByStaffId: async (staffId: number, params: AuditLogQueryParams = {}): Promise<AuditLogListResponse> => {
    const url = `${buildUrl(EP.GET_BY_STAFF(staffId))}?${buildQS(params)}`
    const response = await AxiosFunc.Get(url)

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to fetch staff audit logs')

    return parsePaginated(response, params)
  },

  filter: async (dto: FilterAuditLogsDto, params: AuditLogQueryParams = {}): Promise<AuditLogListResponse> => {
    const base = isAllSchools() ? buildUrl(EP.FILTER_Schools) : buildUrl(EP.FILTER)
    const response = await AxiosFunc.Post(`${base}?${buildQS(params)}`, buildFilterBody(dto))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to filter audit logs')

    return parsePaginated(response, params)
  },

  getFilterOptions: async (): Promise<AuditLogFilterOptions> => {
    const response = await AxiosFunc.Get(buildUrl(EP.FILTER_OPTIONS))

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to fetch filter options')

    return {
      auditActions: response.data.data?.auditActions ?? [],
      auditModules: response.data.data?.auditModules ?? [],
    }
  },
}