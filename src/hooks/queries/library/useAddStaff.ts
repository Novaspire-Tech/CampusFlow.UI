import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addStaffMemberService } from "../../../services/library/addStaffService";
import type { AddStaffMemberDto } from "../../../types/library/addStaff";

export const addStaffMemberKeys = {
  all: ["addStaffMembers"] as const,
  detail: (id: string) => ["addStaffMembers", id] as const,
};

export const useAddStaffMembers = () => {
  return useQuery({
    queryKey: addStaffMemberKeys.all,
    queryFn: addStaffMemberService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};

export const useCreateAddStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStaffMemberService.create,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStaffMemberKeys.all });
    },
  });
};

export const useUpdateAddStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string | number;
      data: AddStaffMemberDto;
    }) => addStaffMemberService.update(id, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStaffMemberKeys.all });
    },
  });
};

export const useDeleteAddStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStaffMemberService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStaffMemberKeys.all });
    },
  });
};

export const useDeleteMultipleAddStaffMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addStaffMemberService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: addStaffMemberKeys.all });
    },
  });
};