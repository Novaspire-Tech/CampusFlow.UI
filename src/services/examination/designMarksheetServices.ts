import AxiosFunc from '../../utils/axios'
import type {
  MarkSheetTemplate,
  MarkSheetTemplateFormData,
  GenerateMarkSheetDto,
} from '../../types/examination/DesignMarksheet'
const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const MARK_SHEET_ENDPOINTS = {
  CREATE_TEMPLATE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/design-mark-sheet/template/save',

  GET_ALL:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/design-mark-sheet/templates/get-all',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/design-mark-sheet/templates/get-all',

  GET_BY_CLASS_AND_EXAM: (schoolClassId: number, examGroupId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/design-mark-sheet/templates/get-by/school-class/${schoolClassId}/exam-group/${examGroupId}`,

  DELETE_TEMPLATE: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/design-mark-sheet/templates/${templateId}/delete`,

  VIEW_TEMPLATE: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/design-mark-sheet/templates/${templateId}/view`,

  GENERATE_MARKSHEETS: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/design-mark-sheet/templates/${templateId}/generate`,
}

const transformResponseToTemplate = (dto: any): MarkSheetTemplate => {
  const id = dto.id || dto.marksSheetTemplateId

  return {
    marksSheetTemplateId: Number(id),
    templateName: dto.templateName || '',
    schoolName: dto.schoolName || '',
    address: dto.address || '',
    session: dto.session || '',
    logo: dto.logo || null,
    principleSign: dto.principleSign || dto.principalSign || null,
    fatherName: dto.fatherName === true || dto.fatherName === 'true',
    motherName: dto.motherName === true || dto.motherName === 'true',
    admissionNo: dto.admissionNo === true || dto.admissionNo === 'true',
    dateOfBirth: dto.dateOfBirth === true || dto.dateOfBirth === 'true' || dto.dob === true,
    sign: dto.sign === true || dto.sign === 'true',
    stamp: dto.stamp === true || dto.stamp === 'true',
    schoolClassId: Number(dto.schoolClassId) || 0,
    examGroupId: Number(dto.examGroupId) || 0,
  }
}

export const markSheetService = {
  createTemplate: async (data: MarkSheetTemplateFormData): Promise<MarkSheetTemplate> => {
    try {
      const formData = new FormData()

      const templateData = {
        templateName: data.templateName,
        schoolName: data.schoolName,
        address: data.address,
        session: data.session,
        fatherName: data.fatherName,
        motherName: data.motherName,
        admissionNo: data.admissionNo,
        dateOfBirth: data.dateOfBirth,
        sign: data.sign,
        stamp: data.stamp,
        schoolClassId: Number(data.schoolClassId),
        examGroupId: Number(data.examGroupId),
      }

      formData.append('data', JSON.stringify(templateData))

      if (data.logo instanceof File) {
        formData.append('logo', data.logo)
      }

      if (data.principleSign instanceof File) {
        formData.append('principleSign', data.principleSign)
      }

      const response = await AxiosFunc.PostFormData(MARK_SHEET_ENDPOINTS.CREATE_TEMPLATE, formData)

      if (response.data?.status !== 200 && response.data?.status !== 201) {
        throw new Error(response.data?.message)
      }

      return transformResponseToTemplate(response.data?.data || {})
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  getAllTemplates: async (): Promise<MarkSheetTemplate[]> => {
    try {
      const endpoint = isAllSchools()
        ? MARK_SHEET_ENDPOINTS.GET_ALL_SCHOOL
        : MARK_SHEET_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
        sortDirection: 'asc',
      })

      if (response.data?.status !== 200) return []

      const list = response.data?.data || response.data?.data?.templates || []

      return list.map(transformResponseToTemplate)
    } catch (error: any) {
      console.error('Error:', error)
      return []
    }
  },
  getTemplatesByClassAndExam: async (
    schoolClassId: number,
    examGroupId: number,
  ): Promise<MarkSheetTemplate[]> => {
    try {
      const response = await AxiosFunc.Get(
        MARK_SHEET_ENDPOINTS.GET_BY_CLASS_AND_EXAM(schoolClassId, examGroupId),
      )

      if (response.data?.status !== 200) return []

      return (response.data?.data || []).map(transformResponseToTemplate)
    } catch (error) {
      console.error(error)
      return []
    }
  },
  deleteTemplate: async (templateId: number): Promise<void> => {
    const response = await AxiosFunc.Delete(MARK_SHEET_ENDPOINTS.DELETE_TEMPLATE(templateId))

    if (response.data?.status !== 200) {
      throw new Error(response.data?.message)
    }
  },
  viewTemplate: async (templateId: number): Promise<Blob> => {
    const response = await AxiosFunc.GetFile(
      MARK_SHEET_ENDPOINTS.VIEW_TEMPLATE(templateId) + '?mode=preview',
    )

    if (response.status !== 200) {
      throw new Error('Failed to fetch template')
    }

    return response.data
  },
  downloadTemplate: async (templateId: number): Promise<Blob> => {
    const response = await AxiosFunc.GetFile(
      MARK_SHEET_ENDPOINTS.VIEW_TEMPLATE(templateId) + '?mode=download',
    )

    if (response.status !== 200) {
      throw new Error('Failed to download template')
    }

    return response.data
  },
  generateMarkSheets: async (templateId: number, studentIds: number[]): Promise<Blob> => {
    const dto: GenerateMarkSheetDto = { studentIds }

    const response = await AxiosFunc.PostFile(
      MARK_SHEET_ENDPOINTS.GENERATE_MARKSHEETS(templateId),
      dto,
    )

    if (response.status !== 200) {
      throw new Error('Failed to generate marksheets')
    }

    return response.data
  },
}
