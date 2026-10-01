import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hostelRoomService } from '../../../services/hostel/HostelRoomService'
import type {
  HostelRoom,
  HostelRoomFormData,
  HostelRoomSearchParams,
} from '../../../types/hostel/HostelRooms'
import { toast } from 'react-toastify'

export const hostelRoomKeys = {
  all: (page?: number, size?: number) => ['hostelRooms', page, size],
  filter: (params: HostelRoomSearchParams, page: number, size: number, sortDirection: string) => [
    'hostelRooms',
    'filter',
    { ...params, page, size, sortDirection },
  ],
  detail: (id: string) => ['hostelRooms', id],
  availability: (hostelId: string, roomId: string, excludeStudentId?: string) => {
    const key = ['hostelRooms', 'availability', hostelId, roomId]
    if (excludeStudentId) key.push(excludeStudentId)
    return key
  },
}

export const useHostelRooms = (
  page: number = 0,
  size: number = 10,
  sortDirection: string = 'asc',
) => {
  return useQuery({
    queryKey: hostelRoomKeys.all(page, size),
    queryFn: () => hostelRoomService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useFilterHostelRooms = (
  params: HostelRoomSearchParams,
  page: number = 0,
  size: number = 10,
  sortDirection: string = 'asc',
) => {
  const hasFilters = !!(params.search || params.hostelId || params.roomTypeId)

  return useQuery({
    queryKey: hostelRoomKeys.filter(params, page, size, sortDirection),
    queryFn: () =>
      hasFilters
        ? hostelRoomService.filter(params, page, size, sortDirection)
        : hostelRoomService.getAll(page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  })
}

export const useHostelRoom = (id?: string) => {
  return useQuery({
    queryKey: id ? hostelRoomKeys.detail(id) : ['hostelRooms', 'empty'],
    queryFn: () => {
      if (!id) return null
      return hostelRoomService
        .getAll(0, 1000)
        .then((response) => response.hostelRoom.find((room) => room.id === id) || null)
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export const useCheckBedAvailability = (
  hostelId?: string,
  roomId?: string,
  date?: string,
  totalMonths?: number,
  excludeStudentId?: string,
) => {
  return useQuery({
    queryKey: hostelRoomKeys.availability(hostelId || '', roomId || '', excludeStudentId),
    queryFn: () => {
      if (!hostelId || !roomId || !date || !totalMonths)
        throw new Error('Hostel ID, Room ID, date and totalMonths are required')
      return hostelRoomService.checkBedAvailability(
        hostelId,
        roomId,
        date,
        totalMonths,
        excludeStudentId,
      )
    },
    enabled: !!hostelId && !!roomId && !!date && !!totalMonths,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
  })
}

export const useCreateHostelRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: HostelRoomFormData) => hostelRoomService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] })
    },
    onError: (error: any) => {
      console.error('Error creating hostel room:', error)
    },
  })
}

export const useUpdateHostelRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: HostelRoomFormData }) =>
      hostelRoomService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] })
      queryClient.invalidateQueries({
        queryKey: hostelRoomKeys.detail(variables.id),
      })
    },
    onError: (error: any) => {
      console.error('Error updating hostel room:', error)
      toast.error(error.message || 'Failed to update hostel room')
    },
  })
}

export const useDeleteHostelRoom = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => hostelRoomService.delete(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['hostelRooms'] })
      const previousRooms = queryClient.getQueryData(['hostelRooms'])
      queryClient.setQueryData(['hostelRooms'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          hostelRoom: old.hostelRoom?.filter((room: HostelRoom) => room.id !== id) || [],
        }
      })
      return { previousRooms }
    },
    onError: (error: any, _id, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(['hostelRooms'], context.previousRooms)
      }
      console.error('Error deleting hostel room:', error)
      toast.error(error.message || 'Failed to delete hostel room')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] })
    },
  })
}

export const useDeleteMultipleHostelRooms = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => hostelRoomService.deleteMultiple(ids),
    onMutate: async (ids: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['hostelRooms'] })
      const previousRooms = queryClient.getQueryData(['hostelRooms'])
      queryClient.setQueryData(['hostelRooms'], (old: any) => {
        if (!old) return old
        return {
          ...old,
          hostelRoom: old.hostelRoom?.filter((room: HostelRoom) => !ids.includes(room.id)) || [],
        }
      })
      return { previousRooms }
    },
    onError: (error: any, _ids, context) => {
      if (context?.previousRooms) {
        queryClient.setQueryData(['hostelRooms'], context.previousRooms)
      }
      console.error('Error deleting hostel rooms:', error)
      toast.error(error.message || 'Failed to delete hostel rooms')
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['hostelRooms'] })
    },
  })
}
