import AxiosFunc from "../../utils/axios";
import type { Teacher, TeacherFormData } from "../../types/academics/teacher";

const getSchoolCode = (): string => localStorage.getItem("schoolCode") || "default";
const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode');
  if (!schoolGroupCode) {
    console.error('School group code not found');
    return 'default';
  }
  return schoolGroupCode;
};

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode();
  const schoolGroupCode = getSchoolGroupCode();
  return endpoint
    .replace('{schoolGroupCode}', schoolGroupCode)
    .replace('{schoolCode}', schoolCode);
};

const TEACHER_ENDPOINTS = {
  GET_ALL: "/school-group/{schoolGroupCode}/school/{schoolCode}/teachers",
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/teachers/${id}`,
  GET_BY_NAME: (name: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/teachers/name/${encodeURIComponent(name)}`,
  GET_BY_CODE: (code: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/teachers/code/${encodeURIComponent(code)}`,
  CREATE: "/school-group/{schoolGroupCode}/school/{schoolCode}/teachers",
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/teachers/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/teachers/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/teachers/bulk",
};

const transformToDTO = (data: TeacherFormData) => {
  return {
    name: data.name.trim(),
    teacherCode: data.teacherCode.trim(),
    staffId: data.staffId ? Number(data.staffId) : undefined,
  };
};

const transformFromBackend = (item: any): Teacher => {
  return {
    id: item.teachersId?.toString(),
    teachersId: item.teacherId?.toString(),
    name: item.name,
    teacherCode: item.staffCode,
    staffId: item.staffId || item.staff?.staffId,
    staff: item.staff ? {
      staffId: item.staff.staffId,
      name: item.staff.name,
    } : undefined,
  };
};

export const teacherService = {
  getAll: async (page = 0, size = 100, sortDirection = "asc"): Promise<Teacher[]> => {
    try {
      const url = buildUrl(TEACHER_ENDPOINTS.GET_ALL);
      console.log("Fetching teachers from:", url);
      console.log("With params:", { page, size, sortDirection });
      
      const response = await AxiosFunc.Get(url, {
        page,
        size,
        sortDirection,
      });

      console.log("Teachers API Full Response:", response);
      console.log("Teachers API Response Data:", response.data);

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch teachers");
      }

      const teachers = response.data?.data?.teachers || [];
      console.log("Raw teachers from backend:", teachers);
      
      const transformed = teachers.map(transformFromBackend);
      console.log("Transformed teachers:", transformed);
      
      return transformed;
    } catch (error: any) {
      console.error("Error fetching teachers:", error);
      console.error("Error response:", error.response);
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch teachers");
    }
  },

  getById: async (id: string): Promise<Teacher | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(TEACHER_ENDPOINTS.GET_BY_ID(id)));

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to fetch teacher");
      }

      if (!response.data.data) return null;
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch teacher");
    }
  },

  getByName: async (name: string): Promise<Teacher | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(TEACHER_ENDPOINTS.GET_BY_NAME(name)));

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to find teacher by name");
      }

      if (!response.data.data) return null;
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to find teacher by name");
    }
  },

  getByCode: async (code: string): Promise<Teacher | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(TEACHER_ENDPOINTS.GET_BY_CODE(code)));

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to find teacher by code");
      }

      if (!response.data.data) return null;
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to find teacher by code");
    }
  },

  create: async (data: TeacherFormData): Promise<Teacher | null> => {
    try {
      const dto = transformToDTO(data);
      
      if (!dto.name || !dto.teacherCode) {
        throw new Error("Name and teacher code are required");
      }
      
      const response = await AxiosFunc.Post(buildUrl(TEACHER_ENDPOINTS.CREATE), dto);

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to create teacher");
      }

      if (!response.data.data) return null;
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message || "Failed to create teacher";
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, data: TeacherFormData): Promise<Teacher | null> => {
    try {
      const dto = transformToDTO(data);
      
      if (!dto.name || !dto.teacherCode) {
        throw new Error("Name and teacher code are required");
      }
      
      const response = await AxiosFunc.Put(buildUrl(TEACHER_ENDPOINTS.UPDATE(id)), dto);

      if (!response.data || response.data.status !== 200) {
        throw new Error(response.data?.message || "Failed to update teacher");
      }

      if (!response.data.data) return null;
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to update teacher";
      throw new Error(errorMessage);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(TEACHER_ENDPOINTS.DELETE(id)));

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || "Failed to delete teacher");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to delete teacher";
      throw new Error(errorMessage);
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map(id => parseInt(id));
      const response = await AxiosFunc.Delete(
        buildUrl(TEACHER_ENDPOINTS.DELETE_MULTIPLE),
        numericIds
      );

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to delete teachers');
      }
    } catch (error: any) {
      console.error('Error deleting multiple teachers:', error);
      throw error;
    }
  },
};