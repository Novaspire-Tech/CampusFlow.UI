import AxiosFunc from "../../utils/axios";
import type {
  AcademicTask,
  AcademicTaskFormData,
  AcademicTaskFilters,
  AcademicTaskResponse,
} from "../../types/homework/academicTask";
import { openDocument } from "../../hooks/useBlobImage";

export { openDocument };

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

const ENDPOINTS = {
  GET_ALL:"/school-group/{schoolGroupCode}/school/{schoolCode}/academic-task/get-all",
  GET_ALL_SCHOOL:"/school-group/{schoolGroupCode}/school/academic-task/getAll",
  CREATE:"/school-group/{schoolGroupCode}/school/{schoolCode}/academic-task/create",
  UPDATE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/academic-task/${id}/update`,
  DELETE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/academic-task/${id}/delete`,
  FILTER: "/school-group/{schoolGroupCode}/school/{schoolCode}/academic-task/filter",
  FILTER_SCHOOL:"/school-group/{schoolGroupCode}/school/academic-task/filter",
};

const emptyResponse = (page: number): AcademicTaskResponse => ({
  tasks: [],
  currentPage: page,
  totalItems: 0,
  totalPages: 0,
});

const formatDate = (date: string | Date | undefined | null): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const buildTaskDTO = (data: AcademicTaskFormData): Record<string, unknown> => {
  const dto: Record<string, unknown> = {
    title: data.title,
    description: data.description,
    taskType: data.taskType,
    assignedDate: formatDate(data.assignedDate),
    submissionDate: formatDate(data.submissionDate),
    maxMarks: Number(data.maxMarks),
    status: data.status,
    sectionId: Number(data.sectionId),
    subjectId: Number(data.subjectId),
    teacherId: Number(data.teacherId),
  };

  if (data.evaluationDate && data.evaluationDate.trim()) {
    dto.evaluationDate = formatDate(data.evaluationDate);
  }

  return dto;
};

const fromBackend = (item: any): AcademicTask => ({
  id: String(item.taskId ?? item.id ?? ""),
  taskId: String(item.taskId ?? item.id ?? ""),
  title: item.title ?? "",
  description: item.description ?? "",
  taskType: item.taskType ?? "",
  assignedDate: item.assignedDate ?? "",
  submissionDate: item.submissionDate ?? "",
  evaluationDate: item.evaluationDate ?? "",
  maxMarks: item.maxMarks ?? 0,
  status: item.status ?? "",
  attachmentPath: item.attachmentPath ?? "",
  classId: String(item.classId ?? ""),
  className: item.className ?? "",
  sectionId: String(item.sectionId ?? ""),
  sectionName: item.sectionName ?? "",
  subjectId: String(item.subjectId ?? ""),
  subjectName: item.subjectName ?? "",
  teacherId: String(item.teacherId ?? ""),
  teacherName: item.teacherName ?? "",
});

export const academicTaskService = {

  getAll: async (
    page = 0,
    size = 10,
    filters?: AcademicTaskFilters
  ): Promise<AcademicTaskResponse> => {
    try {
      const endpoint = isAllSchools()
        ? ENDPOINTS.GET_ALL_SCHOOL
        : ENDPOINTS.GET_ALL;

      const params = {
        page,
        size,
        sectionId: filters?.sectionId ? Number(filters.sectionId) : 0,
        subjectId: filters?.subjectId ? Number(filters.subjectId) : 0,
        teacherId: filters?.teacherId ? Number(filters.teacherId) : 0,
      };

      const response = await AxiosFunc.Get(endpoint, params);

      if (!response?.data || response.data?.status !== 200)
        return emptyResponse(page);

      const data = response.data?.data ?? {};
      return {
        tasks: (data.tasks ?? []).map(fromBackend),
        currentPage: data.currentPage ?? 0,
        totalItems: data.totalItems ?? 0,
        totalPages: data.totalPages ?? 0,
      };
    } catch (error: any) {
      console.error(" getAll error:", error.message);
      return emptyResponse(page);
    }
  },

  filter: async (
    filters: AcademicTaskFilters,
    page = 0,
    size = 10
  ): Promise<AcademicTaskResponse> => {
    try {
      const body = {
        sectionId: filters.sectionId ? Number(filters.sectionId) : null,
        subjectId: filters.subjectId ? Number(filters.subjectId) : null,
        teacherId: filters.teacherId ? Number(filters.teacherId) : null,
        search: filters.search?.trim() || null,
      };

      const baseEndpoint = isAllSchools()
        ? ENDPOINTS.FILTER_SCHOOL
        : ENDPOINTS.FILTER;

      const response = await AxiosFunc.Post(
        baseEndpoint,
        body,
        { params: { page, size } }
      );

      if (!response?.data || response.data?.status !== 200)
        return emptyResponse(page);

      const data = response.data?.data ?? {};
      return {
        tasks: (data.tasks ?? []).map(fromBackend),
        currentPage: data.currentPage ?? 0,
        totalItems: data.totalItems ?? 0,
        totalPages: data.totalPages ?? 0,
      };
    } catch (error: any) {
      console.error(" filter error:", error.message);
      return emptyResponse(page);
    }
  },

  create: async (data: AcademicTaskFormData): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(buildTaskDTO(data)));
      if (data.attachment instanceof File)
        formData.append("attachment", data.attachment);

      const response = await AxiosFunc.PostFormData(ENDPOINTS.CREATE, formData);

      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message ?? "Failed to create academic task");
    } catch (error: any) {
      console.error(" create error:", error.message);
      throw error;
    }
  },

  update: async (id: string, data: AcademicTaskFormData): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(buildTaskDTO(data)));
      if (data.attachment instanceof File)
        formData.append("attachment", data.attachment);

      const response = await AxiosFunc.PutFormData(
        ENDPOINTS.UPDATE(id),
        formData
      );

      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message ?? "Failed to update academic task");
    } catch (error: any) {
      console.error(" update error:", error.message);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(ENDPOINTS.DELETE(id));

      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message ?? "Failed to delete academic task");
    } catch (error: any) {
      console.error(" delete error:", error.message);
      throw error;
    }
  },
};