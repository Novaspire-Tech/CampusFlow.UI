import AxiosFunc from '../../utils/axios'
import type {
  ExamSchedule,
  CreateExamScheduleRequestDTO,
  ExamScheduleFilters,
} from '../../types/examination/examSchedule'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const EXAM_SCHEDULE_ENDPOINTS = {
  GET_ALL: (schoolClassId: number, examGroupId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/${schoolClassId}/exam-group/${examGroupId}/exam-schedule/get-all`,
  GET_ALL_SCHOOL:
    '/school-group/{schoolGroupCode}/school/school-class/{schoolClassId}/exam-group/{examGroupId}/exam-schedule/get-all',

  CREATE: (schoolClassId: number, examGroupId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/${schoolClassId}/exam-group/${examGroupId}/exam-schedule/add`,

  UPDATE: (schoolClassId: number, examGroupId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/${schoolClassId}/exam-group/${examGroupId}/exam-schedule/update`,

  DELETE: (schoolClassId: number, examGroupId: number, examScheduleId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/school-class/${schoolClassId}/exam-group/${examGroupId}/exam-schedule/${examScheduleId}/delete`,
}

const transformToDTO = (data: CreateExamScheduleRequestDTO) => ({
  schedules: data.subjectDTOList.map((subject) => ({
    subjectId: Number(subject.subjectId),
    examDate: subject.examDate,
    startTime: subject.startTime,
    duration: Number(subject.duration),
    roomNo: subject.roomNo || '',
    totalMarks: Number(subject.totalMarks),
    ...(subject.examScheduleId && {
      examScheduleId: Number(subject.examScheduleId),
    }),
  })),
})

const transformBackendToFrontend = (item: any): ExamSchedule => ({
  examScheduleId: item.examScheduleId?.toString() || item.id?.toString(),
  subjectId: item.subjectId?.toString() || item.subject?.subjectId?.toString(),
  subjectName: item.subjectName || item.subject?.subjectName || '',
  examDate: item.examDate,
  startTime: item.startTime,
  duration: item.duration?.toString() || '',
  roomNo: item.roomNo || '',
  totalMarks: item.totalMarks?.toString() || '',
  subject: item.subject
    ? {
        subjectId: item.subject.subjectId?.toString(),
        subjectName: item.subject.subjectName,
      }
    : undefined,
})

export const examScheduleService = {
  getAll: async (filters?: ExamScheduleFilters): Promise<ExamSchedule[]> => {
    try {
      const { examGroupId, schoolClassId } = filters || {}

      if (!examGroupId || !schoolClassId) return []

      const endpoint = isAllSchools()
        ? EXAM_SCHEDULE_ENDPOINTS.GET_ALL_SCHOOL
        : EXAM_SCHEDULE_ENDPOINTS.GET_ALL(Number(schoolClassId), Number(examGroupId))

      const response = await AxiosFunc.Get(endpoint)

      if (response.data?.status !== 200) return []

      const raw = response.data?.data || response.data?.data?.schedules || []

      if (!Array.isArray(raw)) return []

      return raw.map(transformBackendToFrontend)
    } catch (error: any) {
      console.error('Error fetching schedules:', error)
      return []
    }
  },

  create: async (data: CreateExamScheduleRequestDTO): Promise<void> => {
    try {
      const response = await AxiosFunc.Post(
        EXAM_SCHEDULE_ENDPOINTS.CREATE(Number(data.schoolClassId), Number(data.examGroupId)),
        transformToDTO(data),
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  update: async (data: CreateExamScheduleRequestDTO): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(
        EXAM_SCHEDULE_ENDPOINTS.UPDATE(Number(data.schoolClassId), Number(data.examGroupId)),
        transformToDTO(data),
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message)
    }
  },
  delete: async (
    schoolClassId: number,
    examGroupId: number,
    examScheduleId: number,
  ): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        EXAM_SCHEDULE_ENDPOINTS.DELETE(Number(schoolClassId), Number(examGroupId), examScheduleId),
      )

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message)
      }
    } catch (error: any) {
      if (error.response?.status === 500) return
      throw new Error(error.response?.data?.message || error.message)
    }
  },
}
