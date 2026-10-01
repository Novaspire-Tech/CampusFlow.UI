import AxiosFunc from '../../utils/axios'
import type {
  GenerateAdmitCardFormData,
  AdmitCardTemplate,
} from '../../types/examination/DesignAdmitCard'
import type { GenerateStudentIdCardsDto } from '../../types/certificate/studentIdCard'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const ADMIT_CARD_ENDPOINTS = {
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/admit-card/template/save',

  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/admit-card/templates/get-all',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/admit-card/templates/get-all',

  GET_BY_CLASS_AND_EXAM: (schoolClassId: string | number, examGroupId: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/admit-card/templates/get-by/school-class/${schoolClassId}/exam-group/${examGroupId}`,

  DELETE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/admit-card/templates/${id}/delete`,

  VIEW: (id: string | number, mode: string = 'preview') =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/admit-card/templates/${id}/view?mode=${mode}`,

  GENERATE: (id: string | number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/admit-card/templates/${id}/generate`,
}

const transformTemplateFromBackend = (item: any): AdmitCardTemplate => ({
  id: item.id?.toString(),
  templateName: item.templateName,
  schoolName: item.schoolName,
  address: item.address,
})

const extractList = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.content)) return raw.content
  if (Array.isArray(raw?.templates)) return raw.templates
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

export const designAdmitCardService = {
  create: async (data: GenerateAdmitCardFormData): Promise<void> => {
    const formData = new FormData()
    formData.append('data', JSON.stringify(data.data))

    if (data.logo instanceof File) {
      formData.append('logo', data.logo)
    }

    if (data.principleSign instanceof File) {
      formData.append('principleSign', data.principleSign)
    }

    const response = await AxiosFunc.PostFormData(ADMIT_CARD_ENDPOINTS.CREATE, formData)

    if (response.data?.status !== 200 && response.data?.status !== 201) {
      throw new Error(response.data?.message || 'Failed to create admit card')
    }
  },
  getAll: async (): Promise<AdmitCardTemplate[]> => {
    try {
      const endpoint = isAllSchools()
        ? ADMIT_CARD_ENDPOINTS.GET_ALL_SCHOOL
        : ADMIT_CARD_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        params: {
          page: 0,
          size: 1000,
          sortDirection: 'asc',
        },
      })
      if (response.data?.status !== 200) {
        console.warn('getAll: unexpected status', response.data?.status)
        return []
      }
      const raw = response.data?.data
      const list = extractList(raw)

      return list.map(transformTemplateFromBackend)
    } catch (error: any) {
      console.error('getAll error:', error)
      return []
    }
  },
  getByClassAndExamGroup: async (
    schoolClassId: string | number,
    examGroupId: string | number,
  ): Promise<AdmitCardTemplate[]> => {
    try {
      const response = await AxiosFunc.Get(
        ADMIT_CARD_ENDPOINTS.GET_BY_CLASS_AND_EXAM(schoolClassId, examGroupId),
      )

      if (response.data?.status !== 200) return []
      const raw = response.data?.data
      const list = extractList(raw)

      return list.map(transformTemplateFromBackend)
    } catch (error: any) {
      console.error('❌ getByClassAndExamGroup error:', error)
      return []
    }
  },
  view: async (templateId: string, mode: 'preview' | 'download' = 'preview'): Promise<Blob> => {
    const response = await AxiosFunc.GetFile(ADMIT_CARD_ENDPOINTS.VIEW(templateId, mode))

    if (response.data instanceof Blob) {
      return response.data
    }

    throw new Error('Failed to fetch admit card template')
  },
  downloadZip: async (templateId: string, selectedIds?: number[]): Promise<Blob> => {
    try {
      const data: GenerateStudentIdCardsDto = {
        studentIds: selectedIds || [],
      }

      const response = await AxiosFunc.PostFile(ADMIT_CARD_ENDPOINTS.GENERATE(templateId), data)

      if (response.status !== 200) {
        throw new Error('Failed to download template PDF')
      }

      return response.data
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to download template',
      )
    }
  },
  viewInNewTab: async (templateId: string): Promise<void> => {
    const blob = await designAdmitCardService.view(templateId, 'preview')
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 100)
  },
  getImage: async (imagePath: string): Promise<Blob> => {
    const response = await AxiosFunc.GetFile(imagePath)

    if (!(response.data instanceof Blob)) {
      throw new Error('Invalid image response')
    }

    return response.data
  },
  delete: async (templateId: string): Promise<void> => {
    const response = await AxiosFunc.Delete(ADMIT_CARD_ENDPOINTS.DELETE(templateId))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message || 'Failed to delete admit card template')
    }
  },
}
