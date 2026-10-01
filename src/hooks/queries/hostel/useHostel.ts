import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hostelService } from '../../../services/hostel/HostelService';
import type { HostelFormData } from '../../../types/hostel/Hostel';

export const hostelKeys = {
  all: ['hostels'] as const,
  detail: (id: number | string) => ['hostels', id] as const,
};


export const useHostels = () => {
  return useQuery({
    queryKey: hostelKeys.all,
    queryFn: hostelService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};


export const useAddHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: HostelFormData) => hostelService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
};


export const useUpdateHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HostelFormData }) =>
      hostelService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.all });
      queryClient.invalidateQueries({ queryKey: hostelKeys.detail(variables.id) });
    },
  });
};


export const useDeleteHostel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hostelService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
};


export const useDeleteMultipleHostels = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: hostelService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
  });
};


export const useDownloadHostelFeeTemplate = () => {
  return useMutation({
    mutationFn: () => hostelService.downloadExcelTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_hostel_fees_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      console.error('Hostel fee template download error:', error);
      throw error;
    },
  });
};


export const useBulkUploadHostelFees = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => hostelService.bulkUploadFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hostelKeys.all });
    },
    onError: (error: any) => {
      console.error('Hostel fee bulk upload error:', error);
      throw error;
    },
  });
};


export const useImportHostelFeesFromExcel = useBulkUploadHostelFees;