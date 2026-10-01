import AxiosFunc from "../../utils/axios";
import type { PostalDispatch, PostalDispatchFormData } from "../../types/frontOffice/postalDispatch";

export interface PostalDispatchListResponse {
  dispatches: PostalDispatch[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

export interface PostalDispatchSearchParams {
  search?: string;
}

export const EMPTY_POSTAL_SEARCH_PARAMS: PostalDispatchSearchParams = {};

const POSTAL_DISPATCH_ENDPOINTS = {
  GET_ALL: "/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/all",
  GET_ALL_SCHOOL: "/school-group/{schoolGroupCode}/school/poster-dispatch/getAll",
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/${id}`,
  CREATE: "/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/add",
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/update/${id}`,
  UPDATE_DOCUMENT: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/update-document/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/delete/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/delete-multiple",
  FILTER: "/school-group/{schoolGroupCode}/school/{schoolCode}/poster-dispatch/filter",
};

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

const emptyResponse = (page: number, size: number): PostalDispatchListResponse => ({
  dispatches: [],
  currentPage: page,
  totalItems: 0,
  totalPages: 0,
  pageSize: size,
});

const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const transformToDTO = async (data: PostalDispatchFormData) => {
  const dto: any = { toTitle: data.title };
  if (data.referenceNo?.trim()) dto.referenceNo = data.referenceNo.trim();
  if (data.address?.trim()) dto.address = data.address.trim();
  if (data.fromTitle?.trim()) dto.fromTitle = data.fromTitle.trim();
  if (data.phone?.trim()) dto.phone = data.phone.trim();
  if (data.date?.trim()) dto.date = formatDate(data.date);
  if (data.description?.trim()) dto.description = data.description.trim();
  if (data.note?.trim()) dto.note = data.note.trim();
  return dto;
};

const transformFromBackend = (item: any): PostalDispatch => ({
  id: item.posterDispatchId?.toString() || item.id?.toString() || "",
  postalDispatchId: item.posterDispatchId?.toString() || item.id?.toString() || "",
  title: item.toTitle || "",
  referenceNo: item.referenceNo || "",
  address: item.address || "",
  fromTitle: item.fromTitle || "",
  phone: item.phone || "",
  date: item.date || "",
  description: item.description || "",
  note: item.note || "",
  document: item.document || null,
});
const extractArray = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  return raw?.phoneCalls || raw?.posterDispatches || raw?.dispatches || [];
};

export const postalDispatchService = {

  getAll: async (
    page = 0,
    size = 10,
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<PostalDispatchListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? POSTAL_DISPATCH_ENDPOINTS.GET_ALL_SCHOOL
        : POSTAL_DISPATCH_ENDPOINTS.GET_ALL;

      const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection });

      if (!response?.data || response.data?.status !== 200)
        return emptyResponse(page, size);

      const raw = response.data?.data;
      const dispatchArray = extractArray(raw);

      return {
        dispatches: dispatchArray.map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? dispatchArray.length,
        totalPages: raw?.totalPages ?? 1,
        pageSize: raw?.pageSize ?? size,
      };
    } catch (error: any) {
      console.error("getAll error:", error.message);
      return emptyResponse(page, size);
    }
  },

  filter: async (
    params: PostalDispatchSearchParams,
    page = 0,
    size = 10,
    sortBy = "date",
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<PostalDispatchListResponse> => {
    try {
      const body: Record<string, any> = {};
      if (params.search?.trim()) body.search = params.search.trim();

      const url = `${POSTAL_DISPATCH_ENDPOINTS.FILTER}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
      const response = await AxiosFunc.Post(url, body);

      if (!response?.data || response.data?.status !== 200)
        return emptyResponse(page, size);

      const raw = response.data?.data;
      const dispatchArray = extractArray(raw);

      return {
        dispatches: dispatchArray.map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? dispatchArray.length,
        totalPages: raw?.totalPages ?? 1,
        pageSize: raw?.pageSize ?? size,
      };
    } catch (error: any) {
      console.error("filter error:", error.message);
      return emptyResponse(page, size);
    }
  },

  getById: async (id: string): Promise<PostalDispatch | null> => {
    try {
      const response = await AxiosFunc.Get(POSTAL_DISPATCH_ENDPOINTS.GET_BY_ID(id));
      if (!response?.data || response.data?.status !== 200) return null;
      return response.data?.data ? transformFromBackend(response.data.data) : null;
    } catch (error: any) {
      console.error("getById error:", error.message);
      return null;
    }
  },

  create: async (data: PostalDispatchFormData): Promise<PostalDispatch> => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(await transformToDTO(data)));
      if (data.document instanceof File) formData.append("document", data.document);

      const response = await AxiosFunc.PostFormData(POSTAL_DISPATCH_ENDPOINTS.CREATE, formData);
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to create postal dispatch");
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      console.error("create error:", error.message);
      throw error;
    }
  },

  update: async (id: string, data: PostalDispatchFormData): Promise<PostalDispatch> => {
    try {
      const dto = await transformToDTO(data);
      const response = await AxiosFunc.Put(POSTAL_DISPATCH_ENDPOINTS.UPDATE(id), dto);
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to update postal dispatch");
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      console.error("update error:", error.message);
      throw error;
    }
  },

  updateDocument: async (postalDispatchId: string, file: File): Promise<void> => {
    try {
      if (!(file instanceof File)) throw new Error("Invalid document file");
      const formData = new FormData();
      formData.append("document", file);
      const response = await AxiosFunc.PutFormData(
        POSTAL_DISPATCH_ENDPOINTS.UPDATE_DOCUMENT(postalDispatchId),
        formData
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to update postal dispatch document");
    } catch (error: any) {
      console.error("updateDocument error:", error.message);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(POSTAL_DISPATCH_ENDPOINTS.DELETE(id));
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to delete postal dispatch");
    } catch (error: any) {
      console.error("delete error:", error.message);
      throw error;
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        POSTAL_DISPATCH_ENDPOINTS.DELETE_MULTIPLE,
        ids.map(Number)
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to delete postal dispatches");
    } catch (error: any) {
      console.error("deleteMultiple error:", error.message);
      throw error;
    }
  },
};