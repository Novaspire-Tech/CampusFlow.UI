import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { admissionEnquiryService } from "../../../services/frontOffice/admissionEnquiryService";
import type {
  AdmissionEnquiryFormData,
  AdmissionEnquirySearchParams,
} from "../../../types/frontOffice/admissionEnquiry";

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

export const admissionEnquiryKeys = {
  all: ["admissionEnquiries"] as const,

  list: (page: number, size: number, sortDirection: string, allSchools: boolean) =>
    ["admissionEnquiries", "list", { page, size, sortDirection, allSchools }] as const,

  filter: (
    params: AdmissionEnquirySearchParams,
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
    allSchools: boolean
  ) =>
    [
      "admissionEnquiries",
      "filter",
      { ...params, page, size, sortBy, sortDirection, allSchools },
    ] as const,

  detail: (id: string) => ["admissionEnquiries", id] as const,
};

export const useAdmissionEnquiries = (
  page = 0,
  size = 10,
  sortDirection: "asc" | "desc" = "desc"
) => {
  return useQuery({
    queryKey: admissionEnquiryKeys.list(page, size, sortDirection, isAllSchools()),
    queryFn: () => admissionEnquiryService.getAll(page, size, sortDirection),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useFilterAdmissionEnquiries = (
  params: AdmissionEnquirySearchParams,
  page = 0,
  size = 10,
  sortBy = "enquiryDate",
  sortDirection: "asc" | "desc" = "desc"
) => {
  const hasFilters = !!(
    params.classId ||
    params.sourceId ||
    params.reference ||
    params.search
  );

  return useQuery({
    queryKey: admissionEnquiryKeys.filter(
      params, page, size, sortBy, sortDirection, isAllSchools()
    ),
    queryFn: () =>
      hasFilters
        ? admissionEnquiryService.filter(params, page, size, sortBy, sortDirection)
        : admissionEnquiryService.getAll(page, size, sortDirection as "asc" | "desc"),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useAdmissionEnquiry = (id?: string) => {
  return useQuery({
    queryKey: id ? admissionEnquiryKeys.detail(id) : ["admissionEnquiries", "empty"],
    queryFn: () => (id ? admissionEnquiryService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

export const useCreateAdmissionEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: AdmissionEnquiryFormData) =>
      admissionEnquiryService.create(data),
    onSuccess: (newEnquiry) => {
      queryClient.invalidateQueries({ queryKey: ["admissionEnquiries"] });
      queryClient.setQueryData(
        admissionEnquiryKeys.detail(newEnquiry.id),
        newEnquiry
      );
    },
    onError: (error: any) => {
      console.error("Error creating admission enquiry:", error);
    },
  });
};

export const useUpdateAdmissionEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdmissionEnquiryFormData }) =>
      admissionEnquiryService.update(id, data),
    onSuccess: (updatedEnquiry) => {
      queryClient.invalidateQueries({ queryKey: ["admissionEnquiries"] });
      queryClient.setQueryData(
        admissionEnquiryKeys.detail(updatedEnquiry.id),
        updatedEnquiry
      );
    },
    onError: (error: any) => {
      console.error("Error updating admission enquiry:", error);
    },
  });
};

export const useDeleteAdmissionEnquiry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: admissionEnquiryService.delete,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["admissionEnquiries"] });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: ["admissionEnquiries"],
      });
      return { snapshot };
    },
    onError: (_error, _id, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: ["admissionEnquiries"] });
      queryClient.removeQueries({ queryKey: admissionEnquiryKeys.detail(id) });
    },
  });
};

export const useDeleteMultipleAdmissionEnquiries = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: admissionEnquiryService.deleteMultiple,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["admissionEnquiries"] });
      const snapshot = queryClient.getQueriesData<any>({
        queryKey: ["admissionEnquiries"],
      });
      return { snapshot };
    },
    onError: (_error, _ids, context) => {
      context?.snapshot?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: (_data, _error, ids) => {
      queryClient.invalidateQueries({ queryKey: ["admissionEnquiries"] });
      ids.forEach((id) => {
        queryClient.removeQueries({ queryKey: admissionEnquiryKeys.detail(id) });
      });
    },
  });
};