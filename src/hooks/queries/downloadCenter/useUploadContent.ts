import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  uploadContentService,
  contentTypeService,
} from '../../../services/downloadCenter/uploadContentService'
import type {
  UploadContent,
  UploadContentFormData,
  ContentType,
  ContentTypeFormData,
} from '../../../types/downloadCenter/UploadContent'
import type {
  UploadContentFilterParams,
  UploadContentFilterResponse,
} from '../../../services/downloadCenter/uploadContentService'

/*  QUERY KEYS  */
export const uploadContentKeys = {
  all: ['uploadContents'] as const,
  filter: (params: UploadContentFilterParams) => ['uploadContents', 'filter', params] as const,
}

export const contentTypeKeys = {
  all: ['contentTypes'] as const,
}

export const useUploadContents = () =>
  useQuery<UploadContent[], Error>({
    queryKey: uploadContentKeys.all,
    queryFn: uploadContentService.getAll,
  })

export const useFilterUploadContents = (params: UploadContentFilterParams, enabled = true) =>
  useQuery<UploadContentFilterResponse, Error>({
    queryKey: uploadContentKeys.filter(params),
    queryFn: () => uploadContentService.filter(params),
    enabled,
  })

export const useCreateUploadContent = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, UploadContentFormData>({
    mutationFn: uploadContentService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: uploadContentKeys.all })
    },
  })
}

type UpdateUploadContentPayload = {
  id: number
  data: UploadContentFormData
}

export const useUpdateUploadContent = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, UpdateUploadContentPayload>({
    mutationFn: ({ id, data }) => uploadContentService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: uploadContentKeys.all })
    },
  })
}

type UpdateUploadContentDocumentPayload = {
  id: number
  file: File
}

export const useUpdateUploadContentDocument = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, UpdateUploadContentDocumentPayload>({
    mutationFn: ({ id, file }) => uploadContentService.updateDocument(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: uploadContentKeys.all })
    },
  })
}

type DeleteUploadContentPayload = {
  ids?: number[]
  deleteAll?: boolean
}

export const useDeleteUploadContent = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, DeleteUploadContentPayload>({
    mutationFn: ({ ids = [], deleteAll = false }) => uploadContentService.delete(ids, deleteAll),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: uploadContentKeys.all })
    },
  })
}
export const useContentTypes = () =>
  useQuery<ContentType[], Error>({
    queryKey: contentTypeKeys.all,
    queryFn: contentTypeService.getAll,
  })

export const useCreateContentType = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, ContentTypeFormData>({
    mutationFn: contentTypeService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentTypeKeys.all })
    },
  })
}

type UpdateContentTypePayload = {
  id: number
  data: ContentTypeFormData
}

export const useUpdateContentType = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, UpdateContentTypePayload>({
    mutationFn: ({ id, data }) => contentTypeService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentTypeKeys.all })
    },
  })
}

/*  DELETE  */
export const useDeleteContentType = () => {
  const qc = useQueryClient()
  return useMutation<void, Error, number>({
    mutationFn: contentTypeService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contentTypeKeys.all })
    },
  })
}
