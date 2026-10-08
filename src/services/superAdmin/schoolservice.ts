import AxiosFunc from '../../utils/axios'
import type {
  School,
  SchoolCompleteRegistrationRequest,
  UpdateSchoolRequestDto,
  SchoolsPaginatedResponse,
  FilterSchoolRequest,
  AddSchoolToGroupRequest,
} from '../../types/superAdmin/School'

const EP = {
  ADD_TO_GROUP: (groupCode: string) => `/school-group/${groupCode}/school/add`,
  GET_ALL_BY_GROUP: (groupCode: string) => `/school-group/${groupCode}/school/getAll`,
  GET: (groupCode: string, code: string) => `/school-group/${groupCode}/school/${code}/get`,
  UPDATE: (groupCode: string, code: string) => `/school-group/${groupCode}/school/${code}/update`,
  REGISTER: '/school/register',
  GET_ALL: '/school/getAll',
  FILTER: '/school/filter',
}

const toSchool = (item: any): School => {
  if (!item || typeof item !== 'object') {
    return {
      schoolId: 0,
      schoolName: '',
      schoolCode: '',
      email: '',
      phoneNumber: '',
      address: '',
      session: '',
      startDate: '',
      endDate: null,
      type: '',
      logo: null,
      tenantId: '',
      databaseName: '',
      defaultConnectionString: true,
      dbAddress: '',
      username: '',
      databaseType: '',
      isActive: false,
      createdDate: '',
      planName: '',
      billingPeriod: null,
      packageId: 0,
      managedBy: '',
      webSite: '',
    }
  }
  return {
    schoolId: Number(item.schoolId ?? 0),
    schoolName: String(item.schoolName ?? ''),
    schoolCode: String(item.schoolCode ?? ''),
    email: String(item.email ?? ''),
    phoneNumber: String(item.phoneNumber ?? ''),
    address: String(item.address ?? ''),
    session: String(item.session ?? ''),
    startDate: String(item.startDate ?? ''),
    endDate: item.endDate ?? null,
    type: String(item.type ?? ''),
    logo: item.logo ?? null,
    tenantId: String(item.tenantId ?? ''),
    databaseName: String(item.databaseName ?? ''),
    defaultConnectionString: Boolean(item.defaultConnectionString ?? true),
    dbAddress: item.dbAddress ?? '',
    username: item.username ?? '',
    databaseType: item.databaseType ?? '',
    isActive: Boolean(item.isActive ?? false),
    createdDate: String(item.createdDate ?? ''),
    planName: String(item.planName ?? ''),
    billingPeriod: item.billingPeriod ?? null,
    packageId: Number(item.packageId ?? 0),
    managedBy: String(item.managedBy ?? ''),
    webSite: String(item.webSite ?? ''),
  }
}

const toPaginatedResponse = (data: any): SchoolsPaginatedResponse => ({
  schools: (data?.schools ?? data?.content ?? []).map(toSchool),
  currentPage: Number(data?.currentPage ?? data?.number ?? 0),
  totalItems: Number(data?.totalItems ?? data?.totalElements ?? 0),
  totalPages: Number(data?.totalPages ?? 0),
})

const extractError = (error: any, fallback: string): never => {
  throw new Error(error?.response?.data?.message ?? error?.message ?? fallback)
}

const toBackendDate = (date: string | null | undefined): string | null => {
  if (!date) return null
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) throw new Error('Invalid school date')
  return `${match[3]}/${match[2]}/${match[1]}`
}

export const schoolService = {
  addToGroup: async (
    schoolGroupCode: string,
    data: AddSchoolToGroupRequest,
  ): Promise<School | null> => {
    try {
      const fd = new FormData()
      const { logo, ...schoolFields } = data as AddSchoolToGroupRequest & { logo?: File | null }
      fd.append(
        'schoolData',
        JSON.stringify({
          ...schoolFields,
          startDate: toBackendDate(schoolFields.startDate),
          endDate: toBackendDate(schoolFields.endDate),
        }),
      )
      if (logo) fd.append('logo', logo)
      const res = await AxiosFunc.PostFormData(EP.ADD_TO_GROUP(schoolGroupCode), fd)
      if (res.data?.status !== 200 && res.data?.status !== 201)
        throw new Error(res.data?.message ?? 'Failed to add school')
      return res.data?.data ? toSchool(res.data.data) : null
    } catch (e: any) {
      return extractError(e, 'Failed to add school to group')
    }
  },

  getAllByGroup: async (schoolGroupCode: string): Promise<SchoolsPaginatedResponse> => {
    try {
      const res = await AxiosFunc.Get(EP.GET_ALL_BY_GROUP(schoolGroupCode))
      if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Fetch failed')
      return toPaginatedResponse(res.data?.data)
    } catch (e: any) {
      return extractError(e, 'Failed to fetch schools for group')
    }
  },

  register: async (data: SchoolCompleteRegistrationRequest): Promise<School | null> => {
    try {
      const fd = new FormData()
      const { logo, ...rest } = data
      fd.append('schoolData', JSON.stringify(rest))
      if (logo) fd.append('logo', logo)
      const res = await AxiosFunc.PostFormData(EP.REGISTER, fd)
      if (res.data?.status !== 200 && res.data?.status !== 201)
        throw new Error(res.data?.message ?? 'Registration failed')
      return res.data?.data ? toSchool(res.data.data) : null
    } catch (e: any) {
      return extractError(e, 'Failed to register school')
    }
  },

  getByCode: async (groupCode: string, code: string): Promise<School> => {
    try {
      const res = await AxiosFunc.Get(EP.GET(groupCode, code))
      if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Fetch failed')
      return toSchool(res.data?.data)
    } catch (e: any) {
      return extractError(e, 'Failed to fetch school')
    }
  },

  update: async (
    groupCode: string,
    schoolCode: string,
    dto: UpdateSchoolRequestDto,
  ): Promise<School> => {
    try {
      console.log(dto)
      const res = await AxiosFunc.Put(EP.UPDATE(groupCode, schoolCode), {
        ...dto,
        ...(dto.startDate !== undefined
          ? { startDate: toBackendDate(dto.startDate) }
          : {}),
        ...(dto.endDate !== undefined ? { endDate: toBackendDate(dto.endDate) } : {}),
      })
      if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Update failed')
      return toSchool(res.data?.data)
    } catch (e: any) {
      return extractError(e, 'Failed to update school')
    }
  },

  getAll: async (): Promise<SchoolsPaginatedResponse> => {
    try {
      const res = await AxiosFunc.Get(EP.GET_ALL)
      if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Fetch failed')
      return toPaginatedResponse(res.data?.data)
    } catch (e: any) {
      return extractError(e, 'Failed to fetch schools')
    }
  },

  filter: async (dto: FilterSchoolRequest): Promise<SchoolsPaginatedResponse> => {
    try {
      const res = await AxiosFunc.Post(EP.FILTER, dto)
      if (res.data?.status !== 200) throw new Error(res.data?.message ?? 'Filter failed')
      return toPaginatedResponse(res.data?.data)
    } catch (e: any) {
      return extractError(e, 'Failed to filter schools')
    }
  },
}
