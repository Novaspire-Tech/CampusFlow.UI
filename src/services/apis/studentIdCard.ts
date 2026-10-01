import AxiosFunc from '../../utils/axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface StudentIdCardFormData {
  templateName: string
  schoolName: string
  address: string
  logo: File | string | null
  sign: File | string | null
  backgroundImage: File | string | null
  name: boolean
  admissionNo: boolean
  dateOfBirth: boolean
  classField: boolean
  section: boolean
  photo: boolean
  signature: boolean
}

export const generateStudentIdCardTemplateApi = async (data: StudentIdCardFormData) => {
  const sendData = new FormData()

  sendData.append('templateName', data.templateName)
  sendData.append('schoolName', data.schoolName)
  sendData.append('address', data.address)

  if (data.logo instanceof File) {
    sendData.append('logo', data.logo)
  }

  if (data.sign instanceof File) {
    sendData.append('sign', data.sign)
  }

  if (data.backgroundImage instanceof File) {
    sendData.append('backgroundImage', data.backgroundImage)
  }

  sendData.append('name', String(data.name))
  sendData.append('admissionNo', String(data.admissionNo))
  sendData.append('dateOfBirth', String(data.dateOfBirth))
  sendData.append('classField', String(data.classField))
  sendData.append('section', String(data.section))
  sendData.append('photo', String(data.photo))
  sendData.append('signature', String(data.signature))

  return AxiosFunc.Post(
    `/school/${localStorage.getItem('schoolCode')}/student-id-card/generate`,
    sendData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      validateStatus: () => true,
    },
  )
}

export const getAllStudentIdCardTemplatesApi = async () => {
  const response = await AxiosFunc.Get(
    `${API_BASE_URL}/school/${localStorage.getItem(
      'schoolCode',
    )}/student-id-card/templates/get-all`,
  )

  return response
}

export const deleteStudentIdCardTemplateApi = async (id: number) => {
  const response = await AxiosFunc.Delete(
    `${API_BASE_URL}/school/${localStorage.getItem(
      'schoolCode',
    )}/student-id-card/templates/${id}/delete`,
    {
      headers: {},
      validateStatus: () => true,
    },
  )

  return response
}

export const viewStudentIdCardTemplateApi = async (id: number) => {
  const response = await AxiosFunc.Get(
    `${API_BASE_URL}/school/${localStorage.getItem(
      'schoolCode',
    )}/student-id-card/templates/${id}/view`,
    {
      headers: {},
      responseType: 'blob',
      validateStatus: () => true,
    },
  )

  return response
}
