import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  videoTutorialService,
  type VideoTutorialFilterParams,
} from '../../../services/downloadCenter/videoTutorialServices'
import type {
  VideoTutorial,
  VideoTutorialFormData,
} from '../../../types/downloadCenter/VideoTutorial'

export const videoTutorialKeys = {
  all: ['videoTutorials'] as const,
  filter: (params: VideoTutorialFilterParams) =>
    [
      'videoTutorials',
      'filter',
      params.classId ?? 0,
      params.sectionId ?? 0,
      params.search ?? '',
    ] as const,
}

export const useVideoTutorials = () =>
  useQuery<VideoTutorial[], Error>({
    queryKey: videoTutorialKeys.all,
    queryFn: videoTutorialService.getAll,
  })

export const useFilterVideoTutorials = (params: VideoTutorialFilterParams) =>
  useQuery<VideoTutorial[], Error>({
    queryKey: videoTutorialKeys.filter(params),
    queryFn: () => videoTutorialService.filter(params),
    staleTime: 0,
  })

export const useCreateVideoTutorial = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, VideoTutorialFormData>({
    mutationFn: videoTutorialService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoTutorialKeys.all })
      qc.invalidateQueries({ queryKey: ['videoTutorials', 'filter'] })
    },
  })
}

type UpdatePayload = {
  id: number
  data: VideoTutorialFormData
}

export const useUpdateVideoTutorial = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, UpdatePayload>({
    mutationFn: ({ id, data }) => videoTutorialService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoTutorialKeys.all })
      qc.invalidateQueries({ queryKey: ['videoTutorials', 'filter'] })
    },
  })
}

export const useDeleteVideoTutorial = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: (id) => videoTutorialService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: videoTutorialKeys.all })
      qc.invalidateQueries({ queryKey: ['videoTutorials', 'filter'] })
    },
  })
}
