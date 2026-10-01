import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { designAdmitCardService } from "../../../services/examination/designAdmitCardService";
import type {
  GenerateAdmitCardFormData,
  AdmitCardTemplate,
} from "../../../types/examination/DesignAdmitCard";
  
export const admitCardKeys = {
  all: ["admitCardTemplates"] as const,
  byClassAndExam: (schoolClassId: string | number, examGroupId: string | number) =>
    ["admitCardTemplates", "class", schoolClassId, "exam", examGroupId] as const,
  detail: (id: string) => ["admitCardTemplates", id] as const,
};
 
 
// GET ALL
export const useAdmitCardTemplates = () => {
  return useQuery({
    queryKey: admitCardKeys.all,
    queryFn: designAdmitCardService.getAll,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
 
// GET BY CLASS AND EXAM GROUP
export const useAdmitCardTemplatesByClassAndExam = (
  schoolClassId?: string | number,
  examGroupId?: string | number
) => {
  return useQuery({
    queryKey: schoolClassId && examGroupId
      ? admitCardKeys.byClassAndExam(schoolClassId, examGroupId)
      : ["admitCardTemplates", "empty"],
    queryFn: () =>
      schoolClassId && examGroupId
        ? designAdmitCardService.getByClassAndExamGroup(schoolClassId, examGroupId)
        : Promise.resolve([]),
    enabled: !!schoolClassId && !!examGroupId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
 
export const useAdmitCardTemplatePDF = (
  templateId?: string,
  mode: "preview" | "download" = "preview"
) => {
  return useQuery({
    queryKey: templateId
      ? [...admitCardKeys.detail(templateId), mode]
      : ["admitCardTemplates", "empty"],
    queryFn: () =>
      templateId ? designAdmitCardService.view(templateId, mode) : null,
    enabled: !!templateId,
    staleTime: 0, // Don't cache PDF blobs
    gcTime: 0, // Don't keep in cache
  });
};
 
 
// CREATE
export const useCreateAdmitCardTemplate = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (data: GenerateAdmitCardFormData) =>
      designAdmitCardService.create(data),
 
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: admitCardKeys.all });
      // Also invalidate class/exam specific queries
      queryClient.invalidateQueries({
        queryKey: ["admitCardTemplates", "class"]
      });
    },
 
    onError: (error: any) => {
      console.error("Error creating admit card template:", error);
      throw error; // Re-throw for the component to handle
    },
  });
};
 
// DELETE
export const useDeleteAdmitCardTemplate = () => {
  const queryClient = useQueryClient();
 
  return useMutation({
    mutationFn: (templateId: string) =>
      designAdmitCardService.delete(templateId),
 
    // optimistic update
    onMutate: async (templateId: string) => {
      await queryClient.cancelQueries({ queryKey: admitCardKeys.all });
 
      const previousTemplates =
        queryClient.getQueryData<AdmitCardTemplate[]>(admitCardKeys.all);
 
      queryClient.setQueryData<AdmitCardTemplate[]>(
        admitCardKeys.all,
  (old = []) => old.filter((t) => Number(t.id) !== Number(templateId))
      );
 
      return { previousTemplates };
    },
 
    onError: (error: any, _id, context) => {
      if (context?.previousTemplates) {
        queryClient.setQueryData(
          admitCardKeys.all,
          context.previousTemplates
        );
      }
 
      console.error("Error deleting admit card template:", error);
      throw error; // Re-throw for the component to handle
    },
 
    onSuccess: () => {
      // Also invalidate class/exam specific queries
      queryClient.invalidateQueries({
        queryKey: ["admitCardTemplates", "class"]
      });
    },
 
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: admitCardKeys.all });
    },
  });
};
 
 
// Hook to view PDF in new tab
export const useViewAdmitCardInNewTab = () => {
  return useMutation({
    mutationFn: (templateId: string) =>
      designAdmitCardService.viewInNewTab(templateId),
   
    onError: (error: any) => {
      console.error("Error viewing admit card:", error);
      throw error;
    },
  });
};
 
// Hook to download PDF
export const useDownloadAdmitCard = () => {
  return useMutation({
    mutationFn: ({ templateId, selectedIds }: { templateId: string; selectedIds?: number[] }) =>
      designAdmitCardService.downloadZip(templateId, selectedIds),
   
    onError: (error: any) => {
      console.error("Error downloading admit card:", error);
      throw error;
    },
  });
};