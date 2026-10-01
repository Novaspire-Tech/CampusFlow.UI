import type { GroupUserFormData } from '../../page/home/systemSettinds/GroupUser'
import type { GroupUserType } from '../../types/systemSettinds/SchoolGroup'
import AxiosFunc from '../../utils/axios'

const SCHOOL_GROUP_ENDPOINTS = {
  getAll: (schoolGroupCode: string) => `/school-group/${schoolGroupCode}/user/getAll`,
  filter: (schoolGroupCode: string) => `/school-group/${schoolGroupCode}/user/filter`,
  create: (schoolGroupCode: string) => `/school-group/${schoolGroupCode}/user/add`,
  update: (schoolGroupCode: string, userId: number) =>
    `/school-group/${schoolGroupCode}/user/${userId}/update`,
  delete: (schoolGroupCode: string, userId: number) =>
    `/school-group/${schoolGroupCode}/user/${userId}/delete`,
}

const transformBackendToFrontend = (data: any): GroupUserType => ({
  GroupUserId: data.userId,
  phoneNumber: data.phoneNumber ?? '',
  email: data.email ?? '',
  roleId: data.roleId ?? 0,
  roleName: data.roleName ?? '',
})

const transformFrontendToBackend = (data: GroupUserFormData) => ({
  phoneNumber: data.phoneNumber,
  email: data.email || null,
  password: data.password,
  confirmPassword: data.confirmPassword,
  roleId: data.roleId,
})

export const schoolGroupService = {
  getAll: async (schoolGroupCode: string): Promise<GroupUserType[]> => {
    try {
      const endpoint = SCHOOL_GROUP_ENDPOINTS.getAll(schoolGroupCode)
      const response = await AxiosFunc.Post(endpoint, { page: 0, size: 1000 })
      console.log('getAll response:', response)

      if (!response?.data || response.data?.status !== 200) return []

      const raw = response.data?.data
      const items: any[] = raw?.users ?? (Array.isArray(raw) ? raw : [])

      return items.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('getAll error:', error.message)
      return []
    }
  },

  create: async (schoolGroupCode: string, data: GroupUserFormData): Promise<void> => {
    try {
      const response = await AxiosFunc.Post(
        SCHOOL_GROUP_ENDPOINTS.create(schoolGroupCode),
        transformFrontendToBackend(data),
      )
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to create school group user')
    } catch (error: any) {
      console.error('create error:', error.message)
      throw error
    }
  },

  update: async (
    schoolGroupCode: string,
    userId: number,
    data: GroupUserFormData,
  ): Promise<void> => {
    try {
      const response = await AxiosFunc.Post(
        SCHOOL_GROUP_ENDPOINTS.update(schoolGroupCode, userId),
        transformFrontendToBackend(data),
      )
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to update school group user')
    } catch (error: any) {
      console.error('update error:', error.message)
      throw error
    }
  },

  delete: async (schoolGroupCode: string, userId: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Post(SCHOOL_GROUP_ENDPOINTS.delete(schoolGroupCode, userId))
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to delete school group user')
    } catch (error: any) {
      console.error('delete error:', error.message)
      throw error
    }
  },
}
