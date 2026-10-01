import AxiosFunc from '../../utils/axios'
import type {
  StudentIdCardTemplate,
  StudentIdCardTemplateFormData,
  CommonApiResponse,
  GenerateStudentIdCardsDto,
} from '../../types/certificate/studentIdCard'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const EP = {
  CREATE_TEMPLATE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/student-id-card/template/save',

  GET_ALL_TEMPLATES:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/student-id-card/templates/get-all',

  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/student-id-card/templates/get-all',

  DELETE_TEMPLATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-id-card/templates/${id}/delete`,

  VIEW_TEMPLATE: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-id-card/templates/${id}/view`,

  GENERATE_ID_CARDS: (id: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/student-id-card/templates/${id}/generate`,
}

const transformToDTO = (data: StudentIdCardTemplateFormData): Record<string, string> => {
  const boolStr = (v: unknown) => String(Boolean(v))

  const dto: Record<string, string | undefined> = {
    templateName: data.templateName,
    schoolName: data.schoolName,
    address: data.address,

    ...(data.tagLine ? { tagLine: data.tagLine } : {}),

    name: boolStr(data.name),
    admissionNo: boolStr(data.admissionNo),
    dateOfBirth: boolStr(data.dateOfBirth),
    section: boolStr(data.section),
    classField: boolStr(data.classField),
    photo: boolStr(data.photo),
    signature: boolStr(data.signature),
    fatherName: boolStr(data.fatherName),
    parentPhone: boolStr(data.parentPhone),
    gender: boolStr(data.gender),
    studentAddress: boolStr(data.studentAddress),
    bloodGroup: boolStr(data.bloodGroup),
    circularProfilePicture: boolStr(data.circularProfilePicture),
    headerBodyDividerLine: boolStr(data.headerBodyDividerLine),

    ...(data.headerTextColor ? { headerTextColor: data.headerTextColor } : {}),
    ...(data.keyTextColor ? { KeyTextColor: data.keyTextColor } : {}), 
    ...(data.valueTextColor ? { ValueTextColor: data.valueTextColor } : {}), 
  }

  return Object.fromEntries(
    Object.entries(dto).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  ) as Record<string, string>
}

const transformFromBackend = (item: any): StudentIdCardTemplate => {
  const templateId: string =
    item.studentIdCardTemplateId?.toString() ??
    item.id?.toString() ??
    item.templateId?.toString() ??
    `temp_${Date.now()}_${Math.random()}`

  return {
    studentIdCardTemplateId: templateId,
    id: templateId,
    templateName: item.templateName ?? item.name ?? 'Untitled Template',
    schoolName: item.schoolName ?? item.institutionName ?? '',
    tagLine: item.tagLine ?? null,
    address: item.address ?? item.department ?? '',

    logo: item.logo ?? item.logoImage ?? '',
    sign: item.sign ?? item.signatureImage ?? null,
    backgroundImage: item.backgroundImage ?? item.background ?? null,
    backCardBackgroundImage: item.backCardBackgroundImage ?? null,

    name: item.name === true || item.name === 'true',
    admissionNo: item.admissionNo === true || item.admissionNo === 'true',
    dateOfBirth: item.dateOfBirth === true || item.dateOfBirth === 'true',
    section: item.section === true || item.section === 'true',
    classField: item.classField === true || item.classField === 'true' || item.class === true,
    photo: item.photo === true || item.photo === 'true',
    signature: item.signature === true || item.signature === 'true',
    fatherName: item.fatherName === true || item.fatherName === 'true',
    parentPhone: item.parentPhone === true || item.parentPhone === 'true',
    gender: item.gender === true || item.gender === 'true',
    studentAddress: item.studentAddress === true || item.studentAddress === 'true',
    bloodGroup: item.bloodGroup === true || item.bloodGroup === 'true',
    circularProfilePicture:
      item.circularProfilePicture === true || item.circularProfilePicture === 'true',
    headerBodyDividerLine:
      item.headerBodyDividerLine === true || item.headerBodyDividerLine === 'true',

    headerTextColor: item.headerTextColor ?? null,
    keyTextColor: item.KeyTextColor ?? item.keyTextColor ?? null,
    valueTextColor: item.ValueTextColor ?? item.valueTextColor ?? null,

    createdAt: item.createdAt ?? item.createdDate ?? new Date().toISOString(),
    updatedAt: item.updatedAt ?? item.modifiedDate ?? new Date().toISOString(),
  }
}


const buildOptimisticTemplate = (data: StudentIdCardTemplateFormData): StudentIdCardTemplate => ({
  studentIdCardTemplateId: `temp_${Date.now()}`,
  id: `temp_${Date.now()}`,
  templateName: data.templateName,
  schoolName: data.schoolName,
  tagLine: data.tagLine ?? null,
  address: data.address,
  logo: '',
  sign: null,
  backgroundImage: null,
  backCardBackgroundImage: null,
  name: data.name,
  admissionNo: data.admissionNo,
  dateOfBirth: data.dateOfBirth,
  section: data.section,
  classField: data.classField,
  photo: data.photo,
  signature: data.signature,
  fatherName: data.fatherName,
  parentPhone: data.parentPhone,
  gender: data.gender,
  studentAddress: data.studentAddress,
  bloodGroup: data.bloodGroup,
  circularProfilePicture: data.circularProfilePicture,
  headerBodyDividerLine: data.headerBodyDividerLine,
  headerTextColor: data.headerTextColor ?? null,
  keyTextColor: data.keyTextColor ?? null,
  valueTextColor: data.valueTextColor ?? null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
})

export const studentIdCardService = {
  createTemplate: async (data: StudentIdCardTemplateFormData): Promise<StudentIdCardTemplate> => {
    const formData = new FormData()

    const dto = transformToDTO(data)
    Object.entries(dto).forEach(([key, value]) => formData.append(key, value))
    // Append file fields (only when a File object is provided)
    if (data.logo instanceof File) formData.append('logo', data.logo)
    if (data.sign instanceof File) formData.append('sign', data.sign)
    if (data.backgroundImage instanceof File)
      formData.append('backgroundImage', data.backgroundImage)
    if (data.backCardBackgroundImage instanceof File)
      formData.append('backCardBackgroundImage', data.backCardBackgroundImage)

    const response = await AxiosFunc.PostFormData(EP.CREATE_TEMPLATE, formData)
    const responseData = response.data as CommonApiResponse

    if (responseData?.status !== 200 && responseData?.status !== 201) {
      throw new Error(responseData?.message || 'Failed to create student ID card template')
    }
    const raw: any =
      responseData.data ?? responseData.template ?? responseData.studentIdCardTemplate

    if (raw && (raw.templateName || raw.studentIdCardTemplateId)) {
      return transformFromBackend(raw)
    }

    return buildOptimisticTemplate(data)
  },

  getAllTemplates: async (): Promise<StudentIdCardTemplate[]> => {
    const response = isAllSchools()
      ? await AxiosFunc.Get(EP.GET_ALL_SCHOOL, { page: 0, size: 1000, sortDirection: 'asc' })
      : await AxiosFunc.Get(EP.GET_ALL_TEMPLATES)

    const responseData = response.data as CommonApiResponse

    if (responseData?.status !== 200) {
      throw new Error(responseData?.message || 'Failed to fetch student ID card templates')
    }

    const templates: any[] = Array.isArray(responseData.data) ? responseData.data : []
    return templates.map(transformFromBackend)
  },

  deleteTemplate: async (templateId: string): Promise<void> => {
    const response = await AxiosFunc.Delete(EP.DELETE_TEMPLATE(templateId))
    const responseData = response.data as CommonApiResponse

    if (responseData?.status !== 200) {
      throw new Error(responseData?.message || 'Failed to delete student ID card template')
    }
  },

  viewTemplate: async (templateId: string): Promise<Blob> => {
    const response = await AxiosFunc.GetFile(EP.VIEW_TEMPLATE(templateId) + '?mode=preview')
    if (response.status !== 200) throw new Error('Failed to fetch template PDF')
    return response.data as Blob
  },

  downloadTemplate: async (templateId: string): Promise<Blob> => {
    const response = await AxiosFunc.GetFile(EP.VIEW_TEMPLATE(templateId) + '?mode=download')
    if (response.status !== 200) throw new Error('Failed to download template PDF')
    return response.data as Blob
  },
  generateIdCards: async (templateId: string, dto: GenerateStudentIdCardsDto): Promise<Blob> => {
    const response = await AxiosFunc.PostFile(EP.GENERATE_ID_CARDS(templateId), dto)
    if (response.status !== 200) throw new Error('Failed to generate student ID cards')
    return response.data as Blob
  },
}
