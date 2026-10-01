import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentTypeService } from '../../../services/downloadCenter/contentTypeServices';
import type { ContentType } from '../../../types/downloadCenter/contentType';


export const contentTypeKeys = {
  all: ['contentTypes'] as const,
  detail: (id: string) => ['contentTypes', id] as const,
  stats: ['contentTypes', 'stats'] as const,
};


export const useContentTypes = () => {
  return useQuery({
    queryKey: contentTypeKeys.all,
    queryFn: contentTypeService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useContentType = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? contentTypeKeys.detail(id) : ['contentTypes', 'empty'],
    queryFn: () => (id ? contentTypeService.getAll().then(list => list.find(c => c.contentTypeId === id) || null) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useContentTypeStats = () => {
  return useQuery({
    queryKey: contentTypeKeys.stats,
    queryFn: contentTypeService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};


export const useAddContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ContentType, 'contentTypeId' | 'createdDate'>) =>
      contentTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.stats });
    },
  });
};

export const useUpdateContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ContentType;
    }) => contentTypeService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.all });
      queryClient.invalidateQueries({
        queryKey: contentTypeKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.stats });
    },
  });
};

export const useDeleteContentType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contentTypeService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.stats });
    },
  });
};

export const useDeleteMultipleContentTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contentTypeService.deleteMultiple,
   onSettled: () => {
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.all });
      queryClient.invalidateQueries({ queryKey: contentTypeKeys.stats });
    },
  });
};
 