import AxiosFunc from '../../utils/axios'
import type {
  StaffIdCardTemplate,
  StaffIdCardTemplateResponseDto,
  StaffIdCardTemplateFormData,
  GenerateStaffIdCardDto,
  CommonApiResponse,
} from '../../types/certificate/staffIdCard'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const STAFF_ID_CARD_ENDPOINTS = {
  CREATE_TEMPLATE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/template/save',
  GET_ALL_TEMPLATES:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/templates/get-all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/staff-id-card/templates/get-all',
  GET_TEMPLATE: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/templates/${templateId}/get`,
  DELETE_TEMPLATE: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/templates/${templateId}/delete`,
  VIEW_TEMPLATE: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/templates/${templateId}/view`,
  DOWNLOAD_TEMPLATE: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/templates/${templateId}/download`,
  GENERATE_CARDS: (templateId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/staff-id-card/templates/${templateId}/generate`,
}

const transformResponseToTemplate = (dto: StaffIdCardTemplateResponseDto): StaffIdCardTemplate => {
  return {
    staffIdCardTemplateId: dto.id,
    templateName: dto.templateName,
    schoolName: dto.schoolName,
    tagLine: dto.tagLine || '',
    address: dto.address,

    logo: dto.logo || null,
    sign: dto.sign || null,
    backgroundImage: dto.backgroundImage || null,
    backCardBackgroundImage: dto.backCardBackgroundImage || null,
    barcodeUrl: dto.barcodeUrl || null,

    headerTextColor: dto.headerTextColor || '#1e293b',
    keyTextColor: dto.keyTextColor || '#64748b',
    valueTextColor: dto.valueTextColor || '#0f172a',

    staffCode: dto.staffCode ?? false,
    designation: dto.designation ?? false,
    department: dto.department ?? false,
    dateOfJoining: dto.dateOfJoining ?? false,
    dateOfBirth: dto.dateOfBirth ?? false,
    staffAddress: dto.staffAddress ?? false,
    bloodGroup: dto.bloodGroup ?? false,
    barcode: dto.barcode ?? false,
    signature: dto.signature ?? false,
    circularProfilePicture: dto.circularProfilePicture ?? false,
    headerBodyDividerLine: dto.headerBodyDividerLine ?? false,
  }
}

export const staffIdCardService = {
  createTemplate: async (data: StaffIdCardTemplateFormData): Promise<StaffIdCardTemplate> => {
    try {
      const formData = new FormData()

      formData.append('templateName', data.templateName)
      formData.append('schoolName', data.schoolName)
      formData.append('tagLine', data.tagLine ?? '')
      formData.append('address', data.address)

      formData.append('headerTextColor', data.headerTextColor ?? '')
      formData.append('keyTextColor', data.keyTextColor ?? '')
      formData.append('valueTextColor', data.valueTextColor ?? '')

      formData.append('staffCode', String(data.staffCode))
      formData.append('designation', String(data.designation))
      formData.append('department', String(data.department))
      formData.append('dateOfJoining', String(data.dateOfJoining))
      formData.append('dateOfBirth', String(data.dateOfBirth))
      formData.append('staffAddress', String(data.staffAddress))
      formData.append('bloodGroup', String(data.bloodGroup))
      formData.append('barcode', String(data.barcode))
      formData.append('signature', String(data.signature))
      formData.append('circularProfilePicture', String(data.circularProfilePicture))
      formData.append('headerBodyDividerLine', String(data.headerBodyDividerLine))

      if (data.logo instanceof File) {
        formData.append('logo', data.logo, data.logo.name)
      } else {
        console.error('✗ Logo is required but not provided')
      }

      if (data.sign instanceof File) {
        formData.append('sign', data.sign, data.sign.name)
      }

      if (data.backgroundImage instanceof File) {
        formData.append('backgroundImage', data.backgroundImage, data.backgroundImage.name)
      }

      if (data.backCardBackgroundImage instanceof File) {
        formData.append(
          'backCardBackgroundImage',
          data.backCardBackgroundImage,
          data.backCardBackgroundImage.name,
        )
      }

      if (data.barcodeUrl instanceof File) {
        formData.append('barCodeImage', data.barcodeUrl, data.barcodeUrl.name)
      }

      const response = await AxiosFunc.PostFormData(
        STAFF_ID_CARD_ENDPOINTS.CREATE_TEMPLATE,
        formData,
      )

      const responseData = response.data as CommonApiResponse<StaffIdCardTemplateResponseDto>

      if (responseData?.status !== 200 && responseData?.status !== 201) {
        throw new Error(responseData?.message || 'Failed to create staff ID card template')
      }

      if (responseData.data) {
        return transformResponseToTemplate(responseData.data)
      }

      const createdTemplate: StaffIdCardTemplate = {
        staffIdCardTemplateId: Date.now(),
        templateName: data.templateName,
        schoolName: data.schoolName,
        tagLine: data.tagLine,
        address: data.address,
        logo: null,
        sign: null,
        backgroundImage: null,
        backCardBackgroundImage: null,
        barcodeUrl: null,
        headerTextColor: data.headerTextColor,
        keyTextColor: data.keyTextColor,
        valueTextColor: data.valueTextColor,
        staffCode: data.staffCode,
        designation: data.designation,
        department: data.department,
        dateOfJoining: data.dateOfJoining,
        dateOfBirth: data.dateOfBirth,
        staffAddress: data.staffAddress,
        bloodGroup: data.bloodGroup,
        barcode: data.barcode,
        signature: data.signature,
        circularProfilePicture: data.circularProfilePicture,
        headerBodyDividerLine: data.headerBodyDividerLine,
      }

      return createdTemplate
    } catch (error: any) {
      console.error('Error creating staff ID card template:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create staff ID card template',
      )
    }
  },

  getAllTemplates: async (): Promise<StaffIdCardTemplate[]> => {
    try {
      let response

      if (isAllSchools()) {
        response = await AxiosFunc.Get(STAFF_ID_CARD_ENDPOINTS.GET_ALL_SCHOOL, {
          page: 0,
          size: 1000,
          sortDirection: 'asc',
        })
      } else {
        response = await AxiosFunc.Get(STAFF_ID_CARD_ENDPOINTS.GET_ALL_TEMPLATES)
      }

      const responseData = response.data as CommonApiResponse<StaffIdCardTemplateResponseDto[]>

      if (responseData?.status !== 200) {
        throw new Error(responseData?.message || 'Failed to fetch staff ID card templates')
      }

      const templates = Array.isArray(responseData.data) ? responseData.data : []

      return templates.map(transformResponseToTemplate)
    } catch (error: any) {
      console.error('Error fetching staff ID card templates:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch templates')
    }
  },

  getTemplate: async (templateId: number): Promise<StaffIdCardTemplate> => {
    try {
      const response = await AxiosFunc.Get(STAFF_ID_CARD_ENDPOINTS.GET_TEMPLATE(templateId))

      const responseData = response.data as CommonApiResponse<StaffIdCardTemplateResponseDto>

      if (responseData?.status !== 200) {
        throw new Error(responseData?.message || 'Failed to fetch template')
      }

      return transformResponseToTemplate(responseData.data!)
    } catch (error: any) {
      console.error('Error fetching template:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch template')
    }
  },

  deleteTemplate: async (templateId: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(STAFF_ID_CARD_ENDPOINTS.DELETE_TEMPLATE(templateId))

      const responseData = response.data as CommonApiResponse

      if (responseData?.status !== 200) {
        throw new Error(responseData?.message || 'Failed to delete staff ID card template')
      }
    } catch (error: any) {
      console.error('Error deleting staff ID card template:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete template')
    }
  },

  viewTemplate: async (templateId: number): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(STAFF_ID_CARD_ENDPOINTS.VIEW_TEMPLATE(templateId))

      if (response.status !== 200) {
        throw new Error('Failed to fetch template PDF')
      }

      return response.data
    } catch (error: any) {
      console.error('Error viewing template:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to view template')
    }
  },

  downloadTemplate: async (templateId: number): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(
        STAFF_ID_CARD_ENDPOINTS.DOWNLOAD_TEMPLATE(templateId),
      )

      if (response.status !== 200) {
        throw new Error('Failed to download template PDF')
      }

      return response.data
    } catch (error: any) {
      console.error('Error downloading template:', error)
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to download template',
      )
    }
  },

  generateStaffIdCards: async (templateId: number, staffIds: number[]): Promise<Blob> => {
    try {
      const dto: GenerateStaffIdCardDto = {
        staffIds: staffIds,
      }

      const response = await AxiosFunc.PostFile(
        STAFF_ID_CARD_ENDPOINTS.GENERATE_CARDS(templateId),
        dto,
      )

      if (response.status !== 200) {
        throw new Error('Failed to generate staff ID cards')
      }

      return response.data
    } catch (error: any) {
      console.error('Error generating staff ID cards:', error)

      if (error.response?.status === 400) {
        throw new Error('Invalid staff IDs or template ID')
      } else if (error.response?.status === 404) {
        throw new Error('Template or staff members not found')
      }

      throw new Error(
        error.response?.data?.message || error.message || 'Failed to generate staff ID cards',
      )
    }
  },
}
