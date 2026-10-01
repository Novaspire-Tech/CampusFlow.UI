import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { schoolGroupService } from '../../../services/systemSettinds/SchoolGroupService';
import type { GroupUserFormData } from '../../../page/home/systemSettinds/GroupUser';

export const schoolGroupKeys = {
  all: (schoolGroupCode: string) => ['schoolGroupUsers', schoolGroupCode] as const,
};

export const useGroup = (schoolGroupCode: string) =>
  useQuery({
    queryKey: schoolGroupKeys.all(schoolGroupCode),
    queryFn: () => schoolGroupService.getAll(schoolGroupCode),
    enabled: !!schoolGroupCode,   // don't fire if code is empty
    staleTime: 5 * 60 * 1000,
  });

export const useAddSchoolGroup = (schoolGroupCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GroupUserFormData) =>
      schoolGroupService.create(schoolGroupCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolGroupKeys.all(schoolGroupCode) });
    },
  });
};

export const useUpdateSchoolGroup = (schoolGroupCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GroupUserFormData }) =>
      schoolGroupService.update(schoolGroupCode, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolGroupKeys.all(schoolGroupCode) });
    },
  });
};

export const useDeleteSchoolGroup = (schoolGroupCode: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: number) =>
      schoolGroupService.delete(schoolGroupCode, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: schoolGroupKeys.all(schoolGroupCode) });
    },
  });
};