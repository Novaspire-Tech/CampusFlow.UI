import AxiosFunc from "../../utils/axios";
import type {
  VisitorBook,
  VisitorBookFormData,
  VisitorBookListResponse,
  VisitorBookSearchParams,
} from "../../types/frontOffice/visitorBook";

const VISITOR_BOOK_ENDPOINTS = {
  GET_ALL:"/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/all",
  GET_ALL_PAGINATED:"/school-group/{schoolGroupCode}/school/visitor-book/getAll",
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/${id}`,
  CREATE:"/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/add",
  UPDATE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/update/${id}`,
  DELETE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/delete/${id}`,
  DELETE_MULTIPLE:"/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/delete-multiple",
  FILTER:"/school-group/{schoolGroupCode}/school/{schoolCode}/visitor-book/filter",
  FILTER_PAGINATED:"/school-group/{schoolGroupCode}/school/visitor-book/filter",
};

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

const emptyResponse = (page: number, size: number): VisitorBookListResponse => ({
  visitors: [],
  currentPage: page,
  totalItems: 0,
  totalPages: 0,
  pageSize: size,
});

const formatDate = (date: string | Date): string => {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${d.getFullYear()}`;
};

const formatDisplayDate = (dateStr: string): string => {
  if (!dateStr) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

const cleanValue = (value: any): string => {
  if (value === "N/A" || value === "n/a" || value === null || value === undefined)
    return "";
  return value;
};

const transformToDTO = (data: VisitorBookFormData) => {
  const dto: any = {
    visitorName: data.visitorName.trim(),
    phone: data.phone.trim(),
    meetingWith: data.meetingWith.trim(),
    numberOfPerson: data.numberOfPerson,
    date: formatDate(data.date),
    inTime: data.inTime.trim(),
  };

  if (data.outTime?.trim()) dto.outTime = data.outTime.trim();
  if (data.note?.trim()) dto.note = data.note.trim();
  if (data.purposeId && String(data.purposeId).trim())
    dto.purposeId = Number(data.purposeId);

  return dto;
};

const transformFromBackend = (item: any): VisitorBook => {
  const purposeId =
    item.purposeId?.toString() ||
    item.purpose?.purposeId?.toString() ||
    "";
  const purposeName = cleanValue(
    item.purposeName || item.purpose?.purpose || item.purpose?.name
  );

  return {
    id: item.visitorBookId?.toString() || "",
    visitorBookId: item.visitorBookId?.toString() || "",
    visitorName: item.visitorName || "",
    phone: item.phone || "",
    meetingWith: item.meetingWith || "",
    numberOfPerson: item.numberOfPerson?.toString() || "",
    date: formatDisplayDate(item.date || ""),
    inTime: item.inTime || "",
    outTime: cleanValue(item.outTime),
    note: cleanValue(item.note),
    purpose: purposeId
      ? { id: purposeId, purposeId, purposeName }
      : undefined,
    purposeId,
    purposeName,
  };
};

export const visitorBookService = {

  getAll: async (
    page = 0,
    size = 10,
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<VisitorBookListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? VISITOR_BOOK_ENDPOINTS.GET_ALL_PAGINATED
        : VISITOR_BOOK_ENDPOINTS.GET_ALL;

      const response = await AxiosFunc.Get(endpoint, { page, size, sortDirection });

      if (!response?.data || response.data.status !== 200)
        return emptyResponse(page, size);

      const raw = response.data?.data;
      return {
        visitors: (raw?.visitors || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
        pageSize: raw?.pageSize ?? size,
      };
    } catch (error: any) {
      console.error("getAll error:", error.message);
      return emptyResponse(page, size);
    }
  },

  filter: async (
    params: VisitorBookSearchParams,
    page = 0,
    size = 10,
    sortBy = "date",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<VisitorBookListResponse> => {
    try {
      const body: Record<string, any> = {};
      if (params.purposeId) body.purposeId = Number(params.purposeId);
      if (params.search?.trim()) body.search = params.search.trim();

      const baseEndpoint = isAllSchools()
        ? VISITOR_BOOK_ENDPOINTS.FILTER_PAGINATED
        : VISITOR_BOOK_ENDPOINTS.FILTER;

      const url = `${baseEndpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;
      const response = await AxiosFunc.Post(url, body);

      if (!response?.data || response.data.status !== 200)
        return emptyResponse(page, size);

      const raw = response.data?.data;
      return {
        visitors: (raw?.visitors || []).map(transformFromBackend),
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

  getById: async (id: string): Promise<VisitorBook | null> => {
    try {
      const response = await AxiosFunc.Get(VISITOR_BOOK_ENDPOINTS.GET_BY_ID(id));
      if (!response?.data || response.data.status !== 200) return null;
      return response.data?.data ? transformFromBackend(response.data.data) : null;
    } catch (error: any) {
      console.error("getById error:", error.message);
      return null;
    }
  },

  create: async (data: VisitorBookFormData): Promise<VisitorBook> => {
    try {
      const response = await AxiosFunc.Post(
        VISITOR_BOOK_ENDPOINTS.CREATE,
        transformToDTO(data)
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(response?.data?.message || "Failed to create visitor book");
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      console.error("create error:", error.message);
      throw error;
    }
  },

  update: async (id: string, data: VisitorBookFormData): Promise<VisitorBook> => {
    try {
      const response = await AxiosFunc.Put(
        VISITOR_BOOK_ENDPOINTS.UPDATE(id),
        transformToDTO(data)
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(response?.data?.message || "Failed to update visitor book");
      return transformFromBackend(response.data.data);
    } catch (error: any) {
      console.error("update error:", error.message);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(VISITOR_BOOK_ENDPOINTS.DELETE(id));
      if (!response?.data || response.data.status !== 200)
        throw new Error(response?.data?.message || "Failed to delete visitor book");
    } catch (error: any) {
      console.error(" delete error:", error.message);
      throw error;
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      if (!ids?.length) throw new Error("No IDs provided for deletion");
      const response = await AxiosFunc.Delete(
        VISITOR_BOOK_ENDPOINTS.DELETE_MULTIPLE,
        ids.map(Number)
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(response?.data?.message || "Failed to delete visitor books");
    } catch (error: any) {
      console.error(" deleteMultiple error:", error.message);
      throw error;
    }
  },
};