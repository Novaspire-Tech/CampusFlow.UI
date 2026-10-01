import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { studentHostelFeesService } from '../../../services/hostel/Studenthostelfeesservice'
import type {
  StudentHostelFeeDTO,
  UpdateStudentHostelFeeDTO,
  FilterStudentHostelFee,
} from '../../../types/hostel/HostelfeesType'

export const studentHostelFeeKeys = {
  all: ['studentHostelFees'] as const,
  byId: (id: number) => ['studentHostelFees', id] as const,
}

const getMsg = (error: any, fallback: string): string =>
  error?.response?.data?.message || error?.message || fallback

export const useStudentHostelFees = (page = 0, size = 10) =>
  useQuery({
    queryKey: [...studentHostelFeeKeys.all, page, size],
    queryFn: () => studentHostelFeesService.getAll(page, size),
    staleTime: 5 * 60 * 1000,
  })

export const useStudentHostelFeeById = (id: number) =>
  useQuery({
    queryKey: studentHostelFeeKeys.byId(id),
    queryFn: () => studentHostelFeesService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })

export const useAddStudentHostelFee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: StudentHostelFeeDTO) => studentHostelFeesService.add(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHostelFeeKeys.all })
    },
    onError: (error: any) => {
      toast.error(getMsg(error, 'Failed to add hostel fee'))
    },
  })
}

export const useUpdateStudentHostelFee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ allocationId, dto }: { allocationId: number; dto: UpdateStudentHostelFeeDTO }) =>
      studentHostelFeesService.update(allocationId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHostelFeeKeys.all })
    },
    onError: (error: any) => {
      toast.error(getMsg(error, 'Failed to update hostel fee'))
    },
  })
}

export const useRecordHostelPayment = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ allocationId, fee }: { allocationId: number; fee: number }) =>
      studentHostelFeesService.updateFee(allocationId, fee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHostelFeeKeys.all })
    },
    onError: (error: any) => {
      toast.error(getMsg(error, 'Failed to record fee payment'))
    },
  })
}

export const useCheckoutStudent = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (allocationId: number) => studentHostelFeesService.checkout(allocationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHostelFeeKeys.all })
    },
    onError: (error: any) => {
      toast.error(getMsg(error, 'Failed to checkout student'))
    },
  })
}

export const useDeleteStudentHostelFee = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => studentHostelFeesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHostelFeeKeys.all })
    },
    onError: (error: any) => {
      toast.error(getMsg(error, 'Failed to delete hostel fee'))
    },
  })
}

export const useFilterStudentHostelFees = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      dto,
      page = 0,
      size = 10,
    }: {
      dto: FilterStudentHostelFee
      page?: number
      size?: number
    }) => studentHostelFeesService.filter(dto, page, size),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studentHostelFeeKeys.all })
    },
    onError: (error: any) => {
      toast.error(getMsg(error, 'Failed to filter hostel fees'))
    },
  })
}
