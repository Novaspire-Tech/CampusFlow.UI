import AxiosFunc from '../../utils/axios'
import type { VideoTutorial, VideoTutorialFormData } from '../../types/downloadCenter/VideoTutorial'

const isAllSchools = (): boolean => localStorage.getItem('isAllSchools') === 'true'

const VIDEO_TUTORIAL_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/video-tutorial/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/video-tutorial/all',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/video-tutorial/filter',
  FILTER_SCHOOL: '/school-group/{schoolGroupCode}/school/video-tutorial/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/video-tutorial/add',
  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/video-tutorial/update/${id}`,
  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/video-tutorial/delete/${id}`,
}

export interface VideoTutorialFilterParams {
  classId?: number
  sectionId?: number
  search?: string
  page?: number
}

const transformToDTO = (data: VideoTutorialFormData) => ({
  title: data.title,
  videoLink: data.videoLink,
  description: data.description || '',
  classId: Number(data.classId),
  sectionId: Number(data.sectionId) || null,
})

export const videoTutorialService = {
  getAll: async (): Promise<VideoTutorial[]> => {
   
    const endpoint = isAllSchools()
      ? VIDEO_TUTORIAL_ENDPOINTS.GET_ALL_SCHOOL
      : VIDEO_TUTORIAL_ENDPOINTS.GET_ALL

    const res = await AxiosFunc.Get(endpoint, { page: 0, size: 1000 })
    if (res.data?.status !== 200)
      throw new Error(res.data?.message || 'Failed to fetch video tutorials')

    return res.data?.data?.videoTutorials ?? []
  },

  filter: async (params: VideoTutorialFilterParams = {}): Promise<VideoTutorial[]> => {
   
    const baseEndpoint = isAllSchools()
      ? VIDEO_TUTORIAL_ENDPOINTS.FILTER_SCHOOL
      : VIDEO_TUTORIAL_ENDPOINTS.FILTER

    const body: Record<string, any> = {
      search: params.search?.trim() || '',
    }
    if (params.classId && params.classId !== 0) body.classId = params.classId
    if (params.sectionId && params.sectionId !== 0) body.sectionId = params.sectionId

    const res = await AxiosFunc.Post(`${baseEndpoint}?page=${params.page ?? 0}&size=1000`, body)

    if (res.data?.status !== 200)
      throw new Error(res.data?.message || 'Failed to filter video tutorials')

    return res.data?.data?.videoTutorials ?? []
  },

  create: async (data: VideoTutorialFormData): Promise<void> => {
    const res = await AxiosFunc.Post(VIDEO_TUTORIAL_ENDPOINTS.CREATE, transformToDTO(data))
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Create failed')
  },

  update: async (id: number | string, data: VideoTutorialFormData): Promise<void> => {
    const numericId = Number(id)
    if (isNaN(numericId)) throw new Error(`Invalid ID for update: ${id}`)
    const res = await AxiosFunc.Put(
      VIDEO_TUTORIAL_ENDPOINTS.UPDATE(numericId),
      transformToDTO(data),
    )
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Update failed')
  },

  delete: async (id: number | string): Promise<void> => {
    const numericId = Number(id)
    if (isNaN(numericId)) throw new Error(`Invalid ID for delete: ${id}`)
    const res = await AxiosFunc.Delete(VIDEO_TUTORIAL_ENDPOINTS.DELETE(numericId))
    if (res.data?.status !== 200) throw new Error(res.data?.message || 'Delete failed')
  },
}
