import AxiosFunc from "../../utils/axios";
import type { PhoneCallLog, PhoneCallLogFormData } from "../../types/frontOffice/phoneCallLog";

export type CallType = "INCOMING" | "OUTGOING";

export interface PhoneCallLogListResponse {
  phoneCalls: PhoneCallLog[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  pageSize: number;
}

export interface PhoneCallLogSearchParams {
  callType?: CallType;
  search?: string;
}

export const EMPTY_PHONE_SEARCH_PARAMS: PhoneCallLogSearchParams = {};

const PHONE_CALL_LOG_ENDPOINTS = {
  GET_ALL: "/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/all",
   GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/phone-call-log/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/${id}`,
  CREATE: "/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/add",
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/delete/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/delete-multiple",
  FILTER: "/school-group/{schoolGroupCode}/school/{schoolCode}/phone-call-log/filter",
};

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

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

const transformToDTO = (data: PhoneCallLogFormData) => {
  const dto: any = {
    name: data.name.trim(),
    phone: data.phone.trim(),
    callType: data.callType,
  };
  if (data.date?.trim()) dto.date = formatDate(data.date);
  if (data.description?.trim()) dto.description = data.description.trim();
  if (data.nextFollowUpDate?.trim()) dto.nextFollowUpDate = formatDate(data.nextFollowUpDate);
  if (data.callDuration?.trim()) dto.callDuration = data.callDuration.trim();
  if (data.note?.trim()) dto.note = data.note.trim();
  return dto;
};

const transformFromBackend = (item: any): PhoneCallLog => ({
  id: item.phoneCallLogId?.toString() || item.id?.toString() || "",
  phoneCallLogId: item.phoneCallLogId?.toString() || item.id?.toString() || "",
  name: item.name || "",
  phone: item.phone || "",
  date: formatDisplayDate(item.date || ""),
  description: item.description || "",
  nextFollowUpDate: formatDisplayDate(item.nextFollowUpDate || ""),
  callDuration: item.callDuration || "",
  note: item.note || "",
  callType: item.callType || "INCOMING",
});

//  Service 

export const phoneCallLogService = {

  getAll: async (
    page = 0,
    size = 10,
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PhoneCallLogListResponse> => {
 const endpoint = isAllSchools()
        ? PHONE_CALL_LOG_ENDPOINTS.GET_ALL_SCHOOL
        : PHONE_CALL_LOG_ENDPOINTS.GET_ALL;

      const response = await AxiosFunc.Get(endpoint, {       page,
      size,
      sortDirection,
    });
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to fetch phone call logs");

    const raw = response.data?.data;
    return {
      phoneCalls: (raw?.phoneCalls || []).map(transformFromBackend),
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? 0,
      totalPages: raw?.totalPages ?? 0,
      pageSize: raw?.pageSize ?? size,
    };
  },

  filter: async (
    params: PhoneCallLogSearchParams,
    page = 0,
    size = 10,
    sortBy = "date",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<PhoneCallLogListResponse> => {
    const body: Record<string, any> = {};
    if (params.callType) body.callType = params.callType;
    if (params.search?.trim()) body.search = params.search.trim();

    const baseUrl = (PHONE_CALL_LOG_ENDPOINTS.FILTER);
    const url = `${baseUrl}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;

    const response = await AxiosFunc.Post(url, body);
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to filter phone call logs");

    const raw = response.data?.data;
    return {
      phoneCalls: (raw?.phoneCalls || []).map(transformFromBackend),
      currentPage: raw?.currentPage ?? page,
      totalItems: raw?.totalItems ?? 0,
      totalPages: raw?.totalPages ?? 0,
      pageSize: raw?.pageSize ?? size,
    };
  },

  getById: async (id: string): Promise<PhoneCallLog | null> => {
    const response = await AxiosFunc.Get((PHONE_CALL_LOG_ENDPOINTS.GET_BY_ID(id)));
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to fetch phone call log");
    const item = response.data?.data;
    return item ? transformFromBackend(item) : null;
  },

  create: async (data: PhoneCallLogFormData): Promise<PhoneCallLog> => {
    const response = await AxiosFunc.Post((PHONE_CALL_LOG_ENDPOINTS.CREATE), transformToDTO(data));
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to create phone call log");
    return transformFromBackend(response.data?.data);
  },

  update: async (id: string, data: PhoneCallLogFormData): Promise<PhoneCallLog> => {
    const response = await AxiosFunc.Put((PHONE_CALL_LOG_ENDPOINTS.UPDATE(id)), transformToDTO(data));
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to update phone call log");
    return transformFromBackend(response.data?.data);
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete((PHONE_CALL_LOG_ENDPOINTS.DELETE(id)));
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to delete phone call log");
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      (PHONE_CALL_LOG_ENDPOINTS.DELETE_MULTIPLE),
      ids.map(Number)
    );
    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to delete phone call logs");
  },
};