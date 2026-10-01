import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { lessonService } from "../../../services/lessonPlan/lessonService";
import type {
  LessonFormData,
  FilterLessonParams,
} from "../../../types/lessonPlan/lesson";


export interface FilterLessonDto {
  sectionId?: number;
  subjectGroupId?: number;
  subjectId?: number;
  schoolClassId?: number;
  search?: string;
}



const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

export const lessonKeys = {
  all: ["lessons"] as const,

  list: (page: number, size: number, sortDirection: string) =>
    ["lessons", "list", { page, size, sortDirection }] as const,

  filtered: (dto: FilterLessonDto, page: number, size: number, sortDirection: string) =>
    ["lessons", "filter", { dto, page, size, sortDirection }] as const,
};


export const useLessons = (
  page: number = 0,
  size: number = 10,
  sortDirection: string = "asc",
  options: { enabled?: boolean } = {},
) =>
  useQuery({
    queryKey: [...lessonKeys.list(page, size, sortDirection), isAllSchools()],
    queryFn: () => lessonService.getAll(page, size, sortDirection),
    enabled: options.enabled !== false, // default true; pass false to suspend
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    placeholderData: (prev: any) => prev,
  });

export const useFilterLessons = (
  dto: FilterLessonDto,
  page: number = 0,
  size: number = 10,
  sortBy: string | undefined = undefined,
  sortDirection: "asc" | "desc" = "asc",
  enabled: boolean = false,          // <-- only run when isFiltering is true
) => {
  // Build the FilterLessonParams object that lessonService.filter expects
  const params: FilterLessonParams = {
    dto,
    page,
    size,
    sortBy,
    sortDirection,
  };

  return useQuery({
    queryKey: lessonKeys.filtered(dto, page, size, sortDirection),
    queryFn: () => lessonService.filter(params),
    enabled,                          // controlled by isFiltering flag from page
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    placeholderData: (prev: any) => prev,
  });
};



const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: lessonKeys.all });
};

export const useAddLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: LessonFormData) => lessonService.create(data),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useUpdateLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: LessonFormData }) =>
      lessonService.update(id, data),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useDeleteLesson = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => lessonService.delete(id),
    onSuccess: () => invalidateAll(queryClient),
  });
};

export const useDeleteMultipleLessons = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => lessonService.deleteMultiple(ids),
    onSuccess: () => invalidateAll(queryClient),
  });
};