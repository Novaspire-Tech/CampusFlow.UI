import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addStudentMemberService } from "../../../services/library/addStudentService";
import type { AddStudentMemberDto } from "../../../types/library/addStudent";

export const addStudentMemberKeys = {
  all: ["addStudentMembers"] as const,
  detail: (id: string) => ["addStudentMembers", id] as const,
};

export const useAddStudentMembers = () => {
  return useQuery({
    queryKey: addStudentMemberKeys.all,
    queryFn: addStudentMemberService.getAll,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};

export const useCreateAddStudentMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudentMemberService.create,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStudentMemberKeys.all });
    },
  });
};

export const useUpdateAddStudentMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: AddStudentMemberDto;
    }) => addStudentMemberService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addStudentMemberKeys.all });
    },
  });
};

export const useDeleteAddStudentMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudentMemberService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStudentMemberKeys.all });
    },
  });
};

export const useDeleteMultipleAddStudentMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStudentMemberService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStudentMemberKeys.all });
    },
  });
};