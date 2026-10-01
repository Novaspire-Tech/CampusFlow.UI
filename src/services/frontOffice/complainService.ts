import AxiosFunc from "../../utils/axios";
import type { Complain, ComplainFormData } from "../../types/frontOffice/complain";
import { openDocument } from "../../hooks/useBlobImage";

export interface ComplainListResponse {
  complains: Complain[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

export interface ComplainSearchParams {
  search?: string;
  complaintTypeId?: number;
  sourceId?: number;
}

export const EMPTY_COMPLAIN_SEARCH_PARAMS: ComplainSearchParams = {};
export { openDocument };

const COMPLAIN_ENDPOINTS = {
  GET_ALL: "/school-group/{schoolGroupCode}/school/{schoolCode}/complain/all",
  GET_ALL_SCHOOL:"/school-group/{schoolGroupCode}/school/complain/getAll",
  GET_BY_ID: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/complain/${id}`,
  CREATE:"/school-group/{schoolGroupCode}/school/{schoolCode}/complain/add",
  UPDATE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/complain/update/${id}`,
  UPDATE_DOCUMENT: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/complain/update-document/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/complain/delete/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/complain/delete-multiple",
  FILTER:"/school-group/{schoolGroupCode}/school/{schoolCode}/complain/filter",
  FILTER_PAGINATED:"/school-group/{schoolGroupCode}/school/complain/filter",
};

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

const emptyResponse = (page: number, size: number): ComplainListResponse => ({
  complains: [],
  currentPage: page,
  totalItems: 0,
  totalPages: 0,
  pageSize: size,
});

const parseDate = (dateStr: string): Date | null => {
  if (!dateStr) return null;
  if (dateStr.includes("-")) return new Date(dateStr);
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }
  return null;
};

const formatDate = (date: string | Date): string => {
  let d: Date;
  if (typeof date === "string") {
    const parsed = parseDate(date);
    d = parsed ?? new Date(date);
  } else {
    d = date;
  }
  if (isNaN(d.getTime())) throw new Error("Invalid date");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
};

const transformToDTO = async (data: ComplainFormData) => ({
  complainTypeId: Number(data.complainTypeId),
  sourceId: Number(data.sourceId),
  complainBy: data.complainBy,
  phoneNo: data.phone,
  date: formatDate(data.date),
  description: data.description || null,
  actionTaken: data.actionTaken || null,
  assigned: data.assigned || null,
  note: data.note || null,
});

const extractComplaintType = (item: any) => {
  if (item.complaintType && typeof item.complaintType === "object") {
    return {
      id: item.complaintType.id?.toString() || item.complaintType.complaintTypeId?.toString() || "",
      name: item.complaintType.name || item.complaintType.complaintType || "No Type",
    };
  }
  return {
    id: item.complainTypeId?.toString() || "",
    name: item.complaintTypeName || "No Type",
  };
};

const extractSource = (item: any) => {
  if (item.source && typeof item.source === "object") {
    return {
      id: item.source.id?.toString() || item.source.sourceId?.toString() || "",
      name: item.source.name || item.source.source || "No Source",
    };
  }
  return {
    id: item.sourceId?.toString() || "",
    name: item.sourceName || "No Source",
  };
};

const transformFromBackend = (item: any): Complain => {
  const complaintType = extractComplaintType(item);
  const source = extractSource(item);
  return {
    id: item.complainId?.toString() || item.id?.toString() || "",
    complainId: item.complainId?.toString() || item.id?.toString() || "",
    complainTypeId: complaintType.id,
    complaintType,
    complaintTypeName: complaintType.name,
    sourceId: source.id,
    source,
    sourceName: source.name,
    complainBy: item.complainBy || "",
    phone: item.phoneNo || item.phone || "",
    date: item.date || "",
    description: item.description || "",
    actionTaken: item.actionTaken || "",
    assigned: item.assigned || "",
    note: item.note || "",
    document: item.document || null,
  };
};

export const complainService = {

  getAll: async (page = 0, size = 10): Promise<ComplainListResponse> => {
  try {
    const endpoint = isAllSchools()
      ? COMPLAIN_ENDPOINTS.GET_ALL_SCHOOL
      : COMPLAIN_ENDPOINTS.GET_ALL;
    const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection: "desc" });

    if (!response?.data || response.data?.status !== 200)
      return emptyResponse(page, size);

    const raw = response.data?.data;

    const complainsArray = Array.isArray(raw)
      ? raw
      : (raw?.complains || []);

    return {
      complains: complainsArray.map(transformFromBackend),
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? complainsArray.length,
      totalPages: raw?.totalPages ?? 1,
      pageSize: raw?.pageSize ?? size,
    };
  } catch (error: any) {
    console.error("getAll error:", error.message);
    return emptyResponse(page, size);
  }
},
  filter: async (
    params: ComplainSearchParams,
    page = 0,
    size = 10,
    sortBy = "date",
    sortDirection: "asc" | "desc" = "asc"
  ): Promise<ComplainListResponse> => {
    try {
      const body: Record<string, any> = {};
      if (params.search?.trim()) body.search = params.search.trim();
      if (params.complaintTypeId) body.complaintTypeId = params.complaintTypeId;
      if (params.sourceId) body.sourceId = params.sourceId;

      const baseEndpoint = isAllSchools()
        ? COMPLAIN_ENDPOINTS.FILTER_PAGINATED
        : COMPLAIN_ENDPOINTS.FILTER;

      const url = `${baseEndpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
      const response = await AxiosFunc.Post(url, body);

      if (!response?.data || response.data?.status !== 200)
        return emptyResponse(page, size);

      const raw = response.data?.data;
      return {
        complains: (raw?.complains || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
        pageSize: raw?.pageSize ?? size,
      };
    } catch (error: any) {
      console.error("filter error:", error.message);
      return emptyResponse(page, size);
    }
  },

  getById: async (id: string): Promise<Complain | null> => {
    try {
      const response = await AxiosFunc.Get(COMPLAIN_ENDPOINTS.GET_BY_ID(id));
      if (!response?.data || response.data?.status !== 200) return null;
      return response.data?.data ? transformFromBackend(response.data.data) : null;
    } catch (error: any) {
      console.error("getById error:", error.message);
      return null;
    }
  },

  create: async (data: ComplainFormData): Promise<Complain> => {
    try {
      const formData = new FormData();
      formData.append("data", JSON.stringify(await transformToDTO(data)));
      if (data.document instanceof File) formData.append("document", data.document);

      const response = await AxiosFunc.PostFormData(COMPLAIN_ENDPOINTS.CREATE, formData);
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to create complain");
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      console.error("create error:", error.message);
      throw error;
    }
  },

  update: async (id: string, data: ComplainFormData): Promise<Complain> => {
    try {
      const dto = await transformToDTO(data);
      const response = await AxiosFunc.Put(COMPLAIN_ENDPOINTS.UPDATE(id), dto);
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to update complain");
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      console.error("update error:", error.message);
      throw error;
    }
  },

  updateDocument: async (complainId: string, file: File): Promise<void> => {
    try {
      if (!(file instanceof File)) throw new Error("Invalid document file");
      const formData = new FormData();
      formData.append("document", file);
      const response = await AxiosFunc.PutFormData(
        COMPLAIN_ENDPOINTS.UPDATE_DOCUMENT(complainId),
        formData
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to update complain document");
    } catch (error: any) {
      console.error("updateDocument error:", error.message);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(COMPLAIN_ENDPOINTS.DELETE(id));
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to delete complain");
    } catch (error: any) {
      console.error("delete error:", error.message);
      throw error;
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        COMPLAIN_ENDPOINTS.DELETE_MULTIPLE,
        ids.map(Number)
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || "Failed to delete complains");
    } catch (error: any) {
      console.error("deleteMultiple error:", error.message);
      throw error;
    }
  },
};