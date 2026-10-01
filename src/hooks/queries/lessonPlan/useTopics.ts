import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { topicService } from "../../../services/lessonPlan/topicService";
import type { FilterTopicDto } from "../../../services/lessonPlan/topicService";
import type { TopicFormData } from "../../../types/lessonPlan/topic";

export const topicKeys = {
  all: ["topics"] as const,
  list: (page: number, size: number, sortDirection: string) =>
    ["topics", "list", { page, size, sortDirection }] as const,
  filter: (dto: FilterTopicDto, page: number, size: number, sortBy?: string, sortDirection?: string) =>
    ["topics", "filter", { dto, page, size, sortBy, sortDirection }] as const,
};

// GET ALL (paginated)
export const useTopics = (
page = 0, size = 10, _p0: string, _p1: { enabled: boolean; }, sortDirection: "asc" | "desc" = "asc") => {
  return useQuery({
    queryKey: topicKeys.list(page, size, sortDirection),
    queryFn: () => topicService.getAll(page, size, sortDirection),
  });
};

// FILTER
export const useFilterTopics = (
  dto: FilterTopicDto,
  page = 0,
  size = 10,
  sortBy?: string,
  sortDirection: "asc" | "desc" = "asc",
  enabled = true
) => {
  return useQuery({
    queryKey: topicKeys.filter(dto, page, size, sortBy, sortDirection),
    queryFn: () => topicService.filter(dto, page, size, sortBy, sortDirection),
    enabled,
  });
};

// ADD
export const useAddTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TopicFormData) => topicService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
};

// UPDATE
export const useUpdateTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopicFormData }) =>
      topicService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
};

// DELETE SINGLE
export const useDeleteTopic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
};

// DELETE MULTIPLE
export const useDeleteMultipleTopics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => topicService.deleteMultiple(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicKeys.all });
    },
  });
};