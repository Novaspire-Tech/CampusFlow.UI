import AxiosFunc from "../../utils/axios";
import type { MarkDivision, MarkDivisionFormData } from "../../types/examination/MarkDivision";

const getSchoolCode = (): string => {
  return localStorage.getItem("schoolCode") || "default";
};

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

const MARK_DIVISION_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/mark-division/all',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/mark-division/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/mark-division/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/mark-division/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/mark-division/delete-multiple',
};

const transformBackendToFrontend = (item: any): MarkDivision => ({
  id: item.markDivisionId?.toString() || "",
  markDivisionId: item.markDivisionId?.toString() || "",
  divisionName: item.divisionName || "",
  percentFrom: item.percentFrom || "",
  percentUpTo: item.percentUpTo || "",
});

const transformFrontendToBackend = (data: MarkDivisionFormData) => ({
  divisionName: data.divisionName,
  percentFrom: data.percentFrom,
  percentUpTo: data.percentUpTo,
});

export const markDivisionService = {
  getAll: async (
    page: number = 0,
    size: number = 1000,
    sortDirection: string = "asc"
  ): Promise<{
    markDivisions: MarkDivision[];
    currentPage: number;
    totalItems: number;
    totalPages: number;
  }> => {
    try {
      const response = await AxiosFunc.Get(
        buildUrl(MARK_DIVISION_ENDPOINTS.GET_ALL),
        {
          page,
          size,
          sortDirection,
        }
      );

      const backendData = response.data?.data || {};
      const backendList = backendData.markDivisions || [];

      return {
        markDivisions: backendList.map(transformBackendToFrontend),
        currentPage: backendData.currentPage || 0,
        totalItems: backendData.totalItems || 0,
        totalPages: backendData.totalPages || 0,
      };
    } catch (error: any) {
      console.error("Error fetching mark divisions:", error);
      return {
        markDivisions: [],
        currentPage: 0,
        totalItems: 0,
        totalPages: 0,
      };
    }
  },

  create: async (data: MarkDivisionFormData): Promise<MarkDivision> => {
    try {
      const payload = transformFrontendToBackend(data);

      const response = await AxiosFunc.Post(
        buildUrl(MARK_DIVISION_ENDPOINTS.CREATE),
        payload
      );

      if (!response?.data?.data) {
        throw new Error("Invalid create response");
      }

      return transformBackendToFrontend(response.data.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to create mark division"
      );
    }
  },

  update: async (id: string, data: MarkDivisionFormData): Promise<MarkDivision> => {
    try {
      const payload = transformFrontendToBackend(data);

      const response = await AxiosFunc.Put(
        buildUrl(MARK_DIVISION_ENDPOINTS.UPDATE(id)),
        payload
      );

      if (!response?.data?.data) {
        throw new Error("Invalid update response");
      }

      return transformBackendToFrontend(response.data.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to update mark division"
      );
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await AxiosFunc.Delete(buildUrl(MARK_DIVISION_ENDPOINTS.DELETE(id)));
    } catch (error: any) {
      if (error.response?.status === 500) return;

      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete mark division"
      );
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      await AxiosFunc.Delete(
        buildUrl(MARK_DIVISION_ENDPOINTS.DELETE_MULTIPLE),
        ids
      );
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        "Failed to delete mark divisions"
      );
    }
  },
};

