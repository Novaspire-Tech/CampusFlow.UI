import AxiosFunc from '../../utils/axios'
import type { Section, SectionStats } from '../../types/academics/section'

const SECTION_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/{classId}/section/all',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/school-class/{classId}/section/getAll',

  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/{classId}/section',

  UPDATE: (sectionId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/{classId}/section/${sectionId}`,

  DELETE: (sectionId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/{classId}/section/${sectionId}`,

  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/{classId}/section',
}

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const transformBackendToFrontend = (
  item: any,
  className?: string,
  schoolClassId?: number,
): Section => ({
  id: item.sectionId?.toString() || '',
  sectionId: item.sectionId?.toString() || '',
  name: item.sectionName || '',
  sectionName: item.sectionName || '',
  className: className || '',
  schoolClassId: schoolClassId || 0,
  createdDate: item.createdDate
    ? new Date(item.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
})

const transformFrontendToBackend = (data: any) => ({
  sectionName: data.sectionName,
})

const extractSections = (response: any): Section[] => {
  const data = response?.data?.data

  const className = data?.className || ''
  const schoolClassId = data?.schoolClassId || 0

  let sections: any[] = []

  if (Array.isArray(data?.sections)) {
    sections = data.sections
  } else if (Array.isArray(data)) {
    sections = data
  }

  return sections.map((item: any) => transformBackendToFrontend(item, className, schoolClassId))
}

export const sectionService = {
  getAll: async (classId: number): Promise<Section[]> => {
    if (!classId) return []

    try {
      let response

      if (isAllSchools()) {
        const endpoint = SECTION_ENDPOINTS.GET_ALL_SCHOOL.replace('{classId}', String(classId))

        response = await AxiosFunc.Get(endpoint, {
          params: {
            sortDirection: 'asc',
            page: 0,
            size: 1000,
          },
        })
      } else {
        const endpoint = SECTION_ENDPOINTS.GET_ALL.replace('{classId}', String(classId))

        response = await AxiosFunc.Get(endpoint)
      }

      console.log('SECTION RESPONSE:', response.data)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }

      return extractSections(response)
    } catch (error: any) {
      console.error('Error fetching sections:', error)
      return []
    }
  },
  create: async (classId: number, data: any): Promise<Section> => {
    try {
      const url = SECTION_ENDPOINTS.CREATE.replace('{classId}', String(classId))

      const response = await AxiosFunc.Post(url, transformFrontendToBackend(data))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }

      return transformBackendToFrontend(response.data?.data, data.className, classId)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  update: async (classId: number, sectionId: string, data: any): Promise<Section> => {
    try {
      const url = SECTION_ENDPOINTS.UPDATE(sectionId).replace('{classId}', String(classId))

      const response = await AxiosFunc.Put(url, transformFrontendToBackend(data))

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }

      return transformBackendToFrontend(response.data?.data, data.className, classId)
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  delete: async (classId: number, sectionId: string): Promise<void> => {
    try {
      const url = SECTION_ENDPOINTS.DELETE(sectionId).replace('{classId}', String(classId))

      const response = await AxiosFunc.Delete(url)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  deleteMultiple: async (classId: number, ids: string[]): Promise<void> => {
    try {
      const url = SECTION_ENDPOINTS.DELETE_MULTIPLE.replace('{classId}', String(classId))

      const numericIds = ids.map(Number)

      const response = await AxiosFunc.Delete(url, numericIds)

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  getStats: async (classId: number): Promise<SectionStats[]> => {
    try {
      const sections = await sectionService.getAll(classId)

      return [
        {
          title: 'Total Sections',
          value: sections.length.toString(),
          change: '+0%',
          icon: 'Package',
        },
      ]
    } catch {
      return [
        {
          title: 'Total Sections',
          value: '0',
          change: '+0%',
          icon: 'Package',
        },
      ]
    }
  },
}
