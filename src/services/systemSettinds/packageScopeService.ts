import AxiosFunc from '../../utils/axios'

export interface PackageScopePermission {
  scope: string
  operations: string[]
}

export const packageScopeService = {
  getForSchoolGroup: async (schoolGroupCode: string): Promise<PackageScopePermission[]> => {
    if (!schoolGroupCode.trim()) throw new Error('School group code is required to load package permissions')

    const response = await AxiosFunc.Get(
      `/school-group/${encodeURIComponent(schoolGroupCode)}/package-scopes`,
    )

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to fetch package permissions')

    const data: unknown = response.data?.data
    if (!Array.isArray(data)) throw new Error('Invalid package permissions response')

    return data.map((item: unknown) => {
      if (item === null || typeof item !== 'object')
        throw new Error('Invalid package permission entry')

      const permission = item as Record<string, unknown>
      if (typeof permission.scope !== 'string' || !Array.isArray(permission.operations))
        throw new Error('Invalid package permission entry')

      if (!permission.operations.every((operation) => typeof operation === 'string'))
        throw new Error('Invalid package permission operations')

      return {
        scope: permission.scope,
        operations: permission.operations as string[],
      }
    })
  },
}
