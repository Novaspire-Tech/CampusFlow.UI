import AxiosFunc from '../../utils/axios'
import type { FeeType, FeeTypeCreateInput, FeeTypeStats } from '../../types/feesCollection/feeType'

const FEE_TYPE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-type/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/fee-type/getAll',
  GET_BY_ID: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/fee-type/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/fee-type/add',
  UPDATE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/fee-type/update/${id}`,
  DELETE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/fee-type/delete/${id}`,
  DELETE_MULTIPLE:'/school-group/{schoolGroupCode}/school/{schoolCode}/fee-type/delete-multiple',
}

const getEndpoint = (allSchools: boolean): string =>
  allSchools ? FEE_TYPE_ENDPOINTS.GET_ALL_SCHOOL : FEE_TYPE_ENDPOINTS.GET_ALL

const DEFAULT_ZERO_STATS: FeeTypeStats[] = [
  { title: 'Total Fee Types', value: '0', change: '+0%', icon: 'Package' },
  { title: 'Active Types', value: '0', change: '+0%', icon: 'CheckCircle' },
]

const transformBackendToFrontend = (backendData: Record<string, any>): FeeType => {
  const feeTypeId = backendData.feeTypeId?.toString() ?? backendData.id?.toString() ?? ''
  const name = backendData.name ?? ''

  return {
    id: feeTypeId,
    feeTypeId,
    name,
    feeTypeName: name,
    feeCode: backendData.feeCode ?? '',
    description: backendData.description ?? '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: backendData.isActive ? 'Active' : 'Inactive',
  }
}

const transformFrontendToBackend = (input: FeeTypeCreateInput): Record<string, string> => ({
  name: input.name,
  feeCode: input.feeCode,
  description: input.description,
})

const extractFeeTypesFromResponse = (response: any): FeeType[] => {
  const backendData: Record<string, any>[] =
    response?.data?.data?.feeTypes ?? response?.data?.feeTypes ?? []
  return backendData.map(transformBackendToFrontend)
}

export const feeTypeService = {
  getAll: async (
    allSchools: boolean = localStorage.getItem('isAllSchools') === 'true',
    page: number = 0,
    size: number = 20,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<FeeType[]> => {
    try {
      const endpoint = getEndpoint(allSchools)
      const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection })

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message ?? 'Failed to fetch fee types')
      }

      return extractFeeTypesFromResponse(response)
    } catch (error) {
      console.error('Error fetching fee types:', error)
      return []
    }
  },

  getById: async (id: string): Promise<FeeType | null> => {
    try {
      const response = await AxiosFunc.Get(FEE_TYPE_ENDPOINTS.GET_BY_ID(id))

      if (response.data?.status !== 200) return null

      const backendData = response.data?.data
      if (!backendData) return null

      return transformBackendToFrontend(backendData)
    } catch (error) {
      console.error('Error fetching fee type:', error)
      return null
    }
  },

  create: async (data: FeeTypeCreateInput): Promise<FeeType> => {
    try {
      const backendData = transformFrontendToBackend(data)
      const response = await AxiosFunc.Post(FEE_TYPE_ENDPOINTS.CREATE, backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message ?? 'Failed to create fee type')
      }

      const feeTypeId = response.data?.data?.feeTypeId?.toString() ?? `temp-${Date.now()}`

      return {
        id: feeTypeId,
        feeTypeId,
        name: data.name,
        feeTypeName: data.name,
        feeCode: data.feeCode,
        description: data.description,
        createdDate: new Date().toISOString().split('T')[0],
        status: data.status,
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ?? error.message ?? 'Failed to create fee type',
      )
    }
  },

  update: async (id: string, data: FeeType): Promise<FeeType> => {
    try {
      const backendData = transformFrontendToBackend({
        name: data.name,
        feeCode: data.feeCode,
        description: data.description,
        status: data.status,
      })
      const response = await AxiosFunc.Put(FEE_TYPE_ENDPOINTS.UPDATE(id), backendData)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message ?? 'Failed to update fee type')
      }

      return data
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ?? error.message ?? 'Failed to update fee type',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(FEE_TYPE_ENDPOINTS.DELETE(id))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message ?? 'Failed to delete fee type')
      }
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ?? error.message ?? 'Failed to delete fee type',
      )
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const numericIds = ids.map((id) => parseInt(id, 10))
    const response = await AxiosFunc.Delete(FEE_TYPE_ENDPOINTS.DELETE_MULTIPLE, numericIds)

    const message: string = response.data?.message ?? ''

    if (message.toLowerCase().includes('cannot')) {
      throw new Error(message)
    }

    if (response.data?.status !== 200) {
      throw new Error(message || 'Failed to delete fee types')
    }
  },

  getStats: async (): Promise<FeeTypeStats[]> => {
    try {
      const feeTypes = await feeTypeService.getAll()
      const activeCount = feeTypes.filter((f) => f.status === 'Active').length

      return [
        {
          title: 'Total Fee Types',
          value: feeTypes.length.toString(),
          change: '+0%',
          icon: 'Package',
        },
        {
          title: 'Active Types',
          value: activeCount.toString(),
          change: '+0%',
          icon: 'CheckCircle',
        },
      ]
    } catch (error) {
      console.error('Error fetching fee type stats:', error)
      return DEFAULT_ZERO_STATS
    }
  },
}