import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listBookService } from "../../../services/library/bookListService";
import type {
  BookList,
  BookListSearchParams,
} from "../../../types/library/bookList";

export const listBookKeys = {
  all: ["listBooks"] as const,

  filter: (
    params: BookListSearchParams,
    page: number,
    size: number,
    sortDirection: string,
  ) =>
    ["listBooks", "filter", { ...params, page, size, sortDirection }] as const,

  detail: (id: string) => ["listBooks", id] as const,
  stats: ["listBooks", "stats"] as const,
};

export const useFilterListBooks = (
  params: BookListSearchParams,
  page = 0,
  size = 10,
  sortDirection: "asc" | "desc" = "asc",
) => {
  return useQuery({
    queryKey: listBookKeys.filter(params, page, size, sortDirection),
    queryFn: () => listBookService.filter(params, page, size, sortDirection),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};

export const useListBooks = () => {
  return useQuery({
    queryKey: listBookKeys.all,
    queryFn: listBookService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useListBook = (id: string | undefined) => {
  return useQuery({
    queryKey: id ? listBookKeys.detail(id) : ["listBooks", "empty"],
    queryFn: () => (id ? listBookService.getById(id) : null),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useListBookStats = () => {
  return useQuery({
    queryKey: listBookKeys.stats,
    queryFn: listBookService.getStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAddListBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<BookList, "id">) => listBookService.create(data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listBooks"] });
    },
  });
};

export const useUpdateListBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: BookList }) =>
      listBookService.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["listBooks"] });
      queryClient.invalidateQueries({
        queryKey: listBookKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteListBook = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listBookService.delete,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listBooks"] });
    },
  });
};

export const useDeleteMultipleListBooks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: listBookService.deleteMultiple,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["listBooks"] });
    },
  });
};


export const useDownloadBookListTemplate = () => {
  return useMutation({
    mutationFn: () => listBookService.downloadExcelTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Book_List_Template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (error: any) => {
      console.error('Book List download error:', error);
      throw error;
    },
  });
};


export const useImportBookListFromExcel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => listBookService.bulkUploadFromExcel(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: listBookKeys.all });
    },
    onError: (error: any) => {
      console.error('Book List bulk upload error:', error);
      throw error;
    },
  });
};
