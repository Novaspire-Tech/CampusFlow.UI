
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timetableService } from '../../../services/academics/timetableService';
import type { ClassTimetable } from '../../../types/academics/timetabletypes';

export const timetableKeys = {
  all: ['timetables'] as const,
  bySection: (sectionId: number) => ['timetables', 'section', sectionId] as const,
  detail: (id: string) => ['timetables', id] as const,
  stats: (sectionId?: number) => ['timetables', 'stats', sectionId] as const,
};

// Hook to get all timetables
export const useTimetables = (page: number = 0, size: number = 100, sortDirection: string = 'asc') => {
  return useQuery({
    queryKey: [...timetableKeys.all, page, size, sortDirection],
    queryFn: () => timetableService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
};

export const useTimetablesBySection = (sectionId: number) => {
  return useQuery({
    queryKey: timetableKeys.bySection(sectionId),
    queryFn: () => timetableService.getBySection(sectionId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!sectionId && sectionId > 0,
    retry: 1,
  });
};

export const useTimetableStats = (sectionId?: number) => {
  return useQuery({
    queryKey: timetableKeys.stats(sectionId),
    queryFn: () => timetableService.getStats(sectionId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hook to add a new timetable
export const useAddTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => timetableService.create(data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      
      if (result.sectionId) {
        queryClient.invalidateQueries({ 
          queryKey: timetableKeys.bySection(result.sectionId) 
        });
      }
      
      // Invalidate stats
      queryClient.invalidateQueries({ 
        queryKey: timetableKeys.stats() 
      });
    },
    onError: (error: any) => {
      console.error('Error adding timetable:', error);
    },
  });
};

export const useUpdateTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      timetableId, 
      data 
    }: { 
      timetableId: string; 
      data: any 
    }) => timetableService.update(timetableId, data),
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      
      queryClient.invalidateQueries({ 
        queryKey: timetableKeys.detail(variables.timetableId) 
      });
      
      if (result.sectionId) {
        queryClient.invalidateQueries({ 
          queryKey: timetableKeys.bySection(result.sectionId) 
        });
      }
      
      queryClient.invalidateQueries({ 
        queryKey: timetableKeys.stats() 
      });
    },
    onError: (error: any) => {
      console.error('Error updating timetable:', error);
    },
  });
};

export const useDeleteTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      timetableId    }: { 
      timetableId: string;
      sectionId?: number;
    }) => timetableService.delete(timetableId),
    onMutate: async ({ sectionId, timetableId }) => {
      // Cancel outgoing refetches
      if (sectionId) {
        await queryClient.cancelQueries({ 
          queryKey: timetableKeys.bySection(sectionId) 
        });

        const previousTimetables = queryClient.getQueryData<ClassTimetable[]>(
          timetableKeys.bySection(sectionId)
        );

        if (previousTimetables) {
          queryClient.setQueryData<ClassTimetable[]>(
            timetableKeys.bySection(sectionId),
            previousTimetables.filter(timetable => timetable.id !== timetableId)
          );
        }

        return { previousTimetables, sectionId };
      }
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousTimetables && context?.sectionId) {
        queryClient.setQueryData(
          timetableKeys.bySection(context.sectionId),
          context.previousTimetables
        );
      }
      console.error('Error deleting timetable:', error);
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      
      if (variables.sectionId) {
        queryClient.invalidateQueries({ 
          queryKey: timetableKeys.bySection(variables.sectionId) 
        });
      }
      
      queryClient.invalidateQueries({ 
        queryKey: timetableKeys.stats() 
      });
    },
  });
};

export const useDeleteMultipleTimetables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      timetableIds    }: { 
      timetableIds: string[];
      sectionId?: number;
    }) => timetableService.deleteMultiple(timetableIds),
    onMutate: async ({ sectionId, timetableIds }) => {
      if (sectionId) {
        await queryClient.cancelQueries({ 
          queryKey: timetableKeys.bySection(sectionId) 
        });

        const previousTimetables = queryClient.getQueryData<ClassTimetable[]>(
          timetableKeys.bySection(sectionId)
        );

        if (previousTimetables) {
          queryClient.setQueryData<ClassTimetable[]>(
            timetableKeys.bySection(sectionId),
            previousTimetables.filter(timetable => !timetableIds.includes(timetable.id))
          );
        }

        return { previousTimetables, sectionId };
      }
    },
    onError: (error: any, _variables, context) => {
      if (context?.previousTimetables && context?.sectionId) {
        queryClient.setQueryData(
          timetableKeys.bySection(context.sectionId),
          context.previousTimetables
        );
      }
      console.error('Error deleting timetables:', error);
    },
    onSettled: (_result, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      
      if (variables.sectionId) {
        queryClient.invalidateQueries({ 
          queryKey: timetableKeys.bySection(variables.sectionId) 
        });
      }
      
      queryClient.invalidateQueries({ 
        queryKey: timetableKeys.stats() 
      });
    },
  });
};

export const useDeleteAllTimetables = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => timetableService.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: timetableKeys.all });
      queryClient.invalidateQueries({ queryKey: timetableKeys.stats() });
    },
    onError: (error: any) => {
      console.error('Error deleting all timetables:', error);
    },
  });
};