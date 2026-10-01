import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomTypeService } from '../../../services/hostel/roomTypeService';
import type {  RoomTypeFormData } from '../../../types/hostel/RoomType';

export const roomTypeKeys = {
  all: ['roomTypes'] as const,
};

export const useRoomTypes = () =>
  useQuery({
    queryKey: roomTypeKeys.all,
    queryFn: roomTypeService.getAll,
    staleTime: 5 * 60 * 1000,
  });

export const useAddRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: RoomTypeFormData) => roomTypeService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all });
    },
  });
};

export const useUpdateRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoomTypeFormData }) =>
      roomTypeService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all });
    },
  });
};

export const useDeleteRoomType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roomTypeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all });
    },
  });
};

export const useDeleteMultipleRoomTypes = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: number[]) => roomTypeService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomTypeKeys.all });
    },
  });
};
