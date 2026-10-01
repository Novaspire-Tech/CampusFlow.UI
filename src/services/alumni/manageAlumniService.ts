import AxiosFunc from "../../utils/axios";
import type { ManageAlumni } from "../../types/alumni/manageAlumniTypes";


const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

const MANAGE_ALUMNI_ENDPOINTS = {
  GET_ALL:"/school-group/{schoolGroupCode}/school/{schoolCode}/manage-alumni",
  GET_ALL_SCHOOL: "/school-group/{schoolGroupCode}/school/manage-alumni/getAll",  
  FILTER: "/school-group/{schoolGroupCode}/school/{schoolCode}/manage-alumni/filter",
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/manage-alumni/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/manage-alumni/batch",
};

export interface ManageAlumniListResponse {
  alumni: ManageAlumni[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ManageAlumniSearchParams {
  sessionId?: number;
  search?: string;
}

const transformFromBackend = (item: any): ManageAlumni => ({
  manageAlumniId:   item.manageAlumniId?.toString() || "",
  studentSessionId: item.studentId?.toString() || "",
  studentSession: {
    studentSessionId: item.studentId?.toString() || "",
    sessionName:      item.sessionName || "",
    studentName:      item.name || "",
    admissionNo:      item.admissionNo || "",
    gender:           item.gender || "",
    schoolClassId:    item.schoolClassId?.toString() || "",
    schoolClassName:  item.schoolClassName || "",
    sectionId:        item.sectionId?.toString() || "",
    sectionName:      item.sectionName || "",
    sessionId:        item.sessionId?.toString() || "",
  },
});

export const manageAlumniService = {

  getAll: async (
    page: number = 0,
    size: number = 10,
    sortDirection: string = "asc",
  ): Promise<ManageAlumniListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? MANAGE_ALUMNI_ENDPOINTS.GET_ALL_SCHOOL
        : MANAGE_ALUMNI_ENDPOINTS.GET_ALL

      const response = await AxiosFunc.Get((endpoint), { page, size, sortDirection });

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || "Failed to fetch alumni");

      const raw = response.data?.data || {};
      const alumniList = Array.isArray(raw) ? raw : (raw.alumni || []);

      return {
        alumni:      alumniList.map(transformFromBackend),
        currentPage: raw.currentPage ?? page,
        totalItems:  raw.totalItems  ?? alumniList.length,
        totalPages:  raw.totalPages  ?? 1,
      };
    } catch (error: any) {
      console.error("Error fetching alumni:", error);
      throw error;
    }
  },

  filter: async (
    params: ManageAlumniSearchParams,
    page: number = 0,
    size: number = 10,
    sortDirection: string = "asc",
  ): Promise<ManageAlumniListResponse> => {
    try {
      const body: Record<string, any> = {};
      if (params.sessionId)      body.sessionId = params.sessionId;
      if (params.search?.trim()) body.search    = params.search.trim();

      const baseUrl = (MANAGE_ALUMNI_ENDPOINTS.FILTER);
      const url = `${baseUrl}?page=${page}&size=${size}&sortDirection=${sortDirection}`;

      const response = await AxiosFunc.Post(url, body);

      if (!response?.data) throw new Error("No response data received");
      if (response.data.status !== 200)
        throw new Error(response.data.message || "Failed to filter alumni");

      const raw = response.data?.data || {};
      const alumniList = raw.alumni || [];

      return {
        alumni:      alumniList.map(transformFromBackend),
        currentPage: raw.currentPage ?? page,
        totalItems:  raw.totalItems  ?? 0,
        totalPages:  raw.totalPages  ?? 0,
      };
    } catch (error: any) {
      console.error("Error filtering alumni:", error);
      throw new Error(error.response?.data?.message || error.message || "Failed to filter alumni");
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete((MANAGE_ALUMNI_ENDPOINTS.DELETE(id)));
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || "Failed to delete alumni");
    } catch (error: any) {
      console.error("Error deleting alumni:", error);
      throw error;
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id));
      const response = await AxiosFunc.Delete(
        (MANAGE_ALUMNI_ENDPOINTS.DELETE_MULTIPLE),
        numericIds,
      );
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || "Failed to delete alumni");
    } catch (error: any) {
      console.error("Error deleting multiple alumni:", error);
      throw error;
    }
  },
};