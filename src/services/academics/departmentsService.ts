import AxiosFunc from '../../utils/axios'

import type {
  Department,
  DepartmentClass,
  DepartmentFormData,
} from '../../types/academics/departments'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const DEPARTMENT_ENDPOINTS = {
  GET_ALL: '/schoolGroup/{schoolGroupCode}/school/{schoolCode}/class-departments/all',
  GET_ALL_PAGINATED: '/schoolGroup/{schoolGroupCode}/school/class-departments/all',
  GET_BY_ID: (id: string) =>
    `/schoolGroup/{schoolGroupCode}/school/{schoolCode}/class-departments/${id}`,
  GET_BY_CLASS_ID: (classId: number) =>
    `/schoolGroup/{schoolGroupCode}/school/{schoolCode}/class/${classId}/all`,
  CREATE: '/schoolGroup/{schoolGroupCode}/school/{schoolCode}/class-departments/create',
  UPDATE: (id: string) =>
    `/schoolGroup/{schoolGroupCode}/school/{schoolCode}/class-departments/${id}/update`,
  DELETE: (id: string) =>
    `/schoolGroup/{schoolGroupCode}/school/{schoolCode}/class-departments/${id}/delete`,
}

const transformFromBackend = (item: any): Department => {
  const classes: DepartmentClass[] = Array.isArray(item.classNames)
    ? item.classNames.map((name: string) => ({
        id: name,

        schoolClassId: Number(name) || 0,

        className: name,
      }))
    : []

  const rawId = item.departmentId ?? item.classDepartmentId ?? item.id

  return {
    id: rawId?.toString() || '',
    departmentId: rawId,
    name: item.name || '',
    classes,
  }
}

export const departmentService = {
  getAll: async (page = 0, size = 10): Promise<{ data: Department[]; total: number }> => {
    try {
      const endpoint = isAllSchools()
        ? DEPARTMENT_ENDPOINTS.GET_ALL_PAGINATED
        : DEPARTMENT_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection: 'asc',
      })

      if (!response?.data || response.data?.status !== 200) return { data: [], total: 0 }
      const raw = response.data?.data
      const list = raw?.classDepartments ?? []
      const total = raw?.totalItems ?? list.length
      return {
        data: Array.isArray(list) ? list.map(transformFromBackend) : [],
        total,
      }
    } catch (error: any) {
      console.error('getAll error:', error.message)
      return { data: [], total: 0 }
    }
  },

  getById: async (id: string): Promise<Department | null> => {
    try {
      const response = await AxiosFunc.Get(DEPARTMENT_ENDPOINTS.GET_BY_ID(id))
      if (!response?.data || response.data?.status !== 200) return null
      const item = response.data?.data?.classDepartment || response.data?.data
      return item ? transformFromBackend(item) : null
    } catch (error: any) {
      console.error('getById error:', error.message)
      return null
    }
  },

  getByClassId: async (classId: number): Promise<Department[]> => {
    try {
      const response = await AxiosFunc.Get(DEPARTMENT_ENDPOINTS.GET_BY_CLASS_ID(classId))
      if (!response?.data || response.data?.status !== 200) return []
      const raw = response.data?.data
      const list = raw?.classDepartments ?? (Array.isArray(raw) ? raw : [])
      return Array.isArray(list) ? list.map(transformFromBackend) : []
    } catch (error: any) {
      console.error('getByClassId error:', error.message)
      return []
    }
  },

  create: async (data: DepartmentFormData): Promise<Department> => {
    try {
      const response = await AxiosFunc.Post(DEPARTMENT_ENDPOINTS.CREATE, {
        name: data.name,
        classNames: data.classNames,
      })
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to create department')

      const item = response.data?.data?.classDepartment || response.data?.data
      if (!item) {
        return {
          id: '',
          departmentId: 0,
          name: data.name,
          classes: [],
        } as unknown as Department
      }

      return transformFromBackend(item)
    } catch (error: any) {
      console.error('create error:', error.message)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create department',
      )
    }
  },

  update: async (id: string, data: DepartmentFormData): Promise<Department> => {
    try {
      const response = await AxiosFunc.Put(DEPARTMENT_ENDPOINTS.UPDATE(id), {
        name: data.name,
        classNames: data.classNames,
      })

      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to update department')

      return {
        id,
        departmentId: Number(id),
        name: data.name,
        classes: data.classNames.map((name) => ({
          id: name,
          schoolClassId: Number(name) || 0,
          className: name,
        })),
      }
    } catch (error: any) {
      console.error('update error:', error.message)

      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update department',
      )
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(DEPARTMENT_ENDPOINTS.DELETE(id))
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to delete department')
    } catch (error: any) {
      console.error('delete error:', error.message)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete department',
      )
    }
  },
}
