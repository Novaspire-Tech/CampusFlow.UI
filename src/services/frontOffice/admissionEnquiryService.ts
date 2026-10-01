import AxiosFunc from "../../utils/axios";
import type {
  AdmissionEnquiry,
  AdmissionEnquiryFormData,
  AdmissionEnquiryListResponse,
  AdmissionEnquirySearchParams,
} from "../../types/frontOffice/admissionEnquiry";

const ADMISSION_ENQUIRY_ENDPOINTS = {
  GET_ALL:"/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/all",
  GET_ALL_School:"/school-group/{schoolGroupCode}/school/admission-enquiry/getAll",
  GET_BY_ID: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/${id}`,
  CREATE:"/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/add",
  UPDATE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/update/${id}`,
  DELETE: (id: string) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/delete/${id}`,
  DELETE_MULTIPLE:"/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/delete-multiple",
  FILTER:"/school-group/{schoolGroupCode}/school/{schoolCode}/admission-enquiry/filter",
  FILTER_PAGINATED:"/school-group/{schoolGroupCode}/school/admission-enquiry/filter",
};

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

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

const cleanValue = (value: any): any => {
  if (
    value === "N/A" ||
    value === "n/a" ||
    value === null ||
    value === undefined
  )
    return "";
  return value;
};

const transformToDTO = (data: AdmissionEnquiryFormData) => {
  const dto: any = {
    name: data.studentName.trim(),
    phoneNo: data.phone.trim(),
    enquiryDate: formatDate(data.enquiryDate),
    sourceId: Number(data.sourceId),
    classId: Number(data.classId),
    status: data.status || "Active",
  };

  if (data.email?.trim()) dto.email = data.email.trim();
  if (data.address?.trim()) dto.address = data.address.trim();
  if (data.description?.trim()) dto.description = data.description.trim();
  if (data.note?.trim()) dto.note = data.note.trim();
  if (data.nextFollowUpDate?.trim())
    dto.nextFollowUpDate = formatDate(data.nextFollowUpDate);
  if (data.numberOfChild?.trim()) dto.noOfChildren = data.numberOfChild.trim();
  if (data.assigned?.trim()) dto.assigned = data.assigned.trim();
  if (data.reference && String(data.reference).trim())
    dto.referenceId = Number(data.reference);

  return dto;
};

const transformFromBackend = (item: any): AdmissionEnquiry => {
  const schoolClassId = item.schoolClass?.schoolClassId?.toString() || "";
  const className = item.schoolClass?.className || "";
  const sourceId = item.source?.sourceId?.toString() || "";
  const sourceName = item.source?.source || "";
  const referenceId = item.reference?.referenceId?.toString() || "";
  const referenceName = cleanValue(item.reference?.reference);

  return {
    id: item.admissionEnquiryId?.toString() || "",
    admissionEnquiryId: item.admissionEnquiryId?.toString() || "",
    studentName: item.name || "",
    phone: item.phoneNo || "",
    email: cleanValue(item.email),
    address: cleanValue(item.address),
    description: cleanValue(item.description),
    note: cleanValue(item.note),
    enquiryDate: formatDisplayDate(item.enquiryDate || ""),
    nextFollowUpDate: cleanValue(formatDisplayDate(item.nextFollowUpDate)),
    numberOfChild: cleanValue(item.noOfChildren),
    assigned: cleanValue(item.assigned),
    reference: referenceId
      ? { id: referenceId, referenceId, referenceName }
      : undefined,
    referenceName,
    class: schoolClassId
      ? { id: schoolClassId, schoolClassId, className }
      : undefined,
    classId: schoolClassId,
    className,
    source: { id: sourceId, sourceId, sourceName },
    sourceId,
    sourceName,
    status: item.status || "Active",
  };
};

export const admissionEnquiryService = {

  getAll: async (
    page = 0,
    size = 10,
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<AdmissionEnquiryListResponse> => {
    try {
      const endpoint = isAllSchools()
        ? ADMISSION_ENQUIRY_ENDPOINTS.GET_ALL_School
        : ADMISSION_ENQUIRY_ENDPOINTS.GET_ALL;

      const response = await AxiosFunc.Get(endpoint, {
        page,
        size,
        sortDirection,
      });

      if (!response?.data)
        return { admissionEnquiries: [], currentPage: page, totalItems: 0, totalPages: 0 };

      if (response.data.status !== 200)
        return { admissionEnquiries: [], currentPage: page, totalItems: 0, totalPages: 0 };

      const raw = response.data?.data;
      return {
        admissionEnquiries: (raw?.admissionEnquiries || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      };
    } catch (error: any) {
      console.error(" getAll error:", error.message);
      return { admissionEnquiries: [], currentPage: page, totalItems: 0, totalPages: 0 };
    }
  },

  filter: async (
    params: AdmissionEnquirySearchParams,
    page = 0,
    size = 10,
    sortBy = "enquiryDate",
    sortDirection: "asc" | "desc" = "desc"
  ): Promise<AdmissionEnquiryListResponse> => {
    try {
      const body: Record<string, any> = {};
      if (params.classId) body.schoolClassId = Number(params.classId);
      if (params.sourceId) body.sourceId = Number(params.sourceId);
      if (params.reference) body.referenceId = Number(params.reference);
      if (params.search?.trim()) body.search = params.search.trim();

      // same isAllSchools logic for filter
      const baseEndpoint = isAllSchools()
        ? ADMISSION_ENQUIRY_ENDPOINTS.FILTER_PAGINATED
        : ADMISSION_ENQUIRY_ENDPOINTS.FILTER;

      const url = `${baseEndpoint}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`;

      const response = await AxiosFunc.Post(url, body);

      if (!response?.data)
        return { admissionEnquiries: [], currentPage: page, totalItems: 0, totalPages: 0 };

      if (response.data.status !== 200)
        return { admissionEnquiries: [], currentPage: page, totalItems: 0, totalPages: 0 };

      const raw = response.data?.data;
      return {
        admissionEnquiries: (raw?.admissionEnquiries || []).map(transformFromBackend),
        currentPage: raw?.currentPage ?? page,
        totalItems: raw?.totalItems ?? 0,
        totalPages: raw?.totalPages ?? 0,
      };
    } catch (error: any) {
      console.error(" filter error:", error.message);
      return { admissionEnquiries: [], currentPage: page, totalItems: 0, totalPages: 0 };
    }
  },

  getById: async (id: string): Promise<AdmissionEnquiry | null> => {
    try {
      const response = await AxiosFunc.Get(
        ADMISSION_ENQUIRY_ENDPOINTS.GET_BY_ID(id)
      );
      if (!response?.data) throw new Error("No response data received");
      if (response.data.status !== 200)
        throw new Error(
          response.data.message || "Failed to fetch admission enquiry"
        );
      const item = response.data?.data;
      return item ? transformFromBackend(item) : null;
    } catch (error: any) {
      console.error(" getById error:", error.message);
      throw error;
    }
  },

  create: async (data: AdmissionEnquiryFormData): Promise<AdmissionEnquiry> => {
    try {
      const dto = transformToDTO(data);
      const response = await AxiosFunc.Post(
        ADMISSION_ENQUIRY_ENDPOINTS.CREATE,
        dto
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(
          response?.data?.message || "Failed to create admission enquiry"
        );
      return transformFromBackend(response.data?.data);
    } catch (error: any) {
      console.error(" create error:", error.message);
      throw error;
    }
  },

  update: async (
    id: string,
    data: AdmissionEnquiryFormData
  ): Promise<AdmissionEnquiry> => {
    try {
      const dto = transformToDTO(data);
      const response = await AxiosFunc.Put(
        ADMISSION_ENQUIRY_ENDPOINTS.UPDATE(id),
        dto
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(
          response?.data?.message || "Failed to update admission enquiry"
        );
      return transformFromBackend(response.data?.data);
    } catch (error: any) {
      console.error(" update error:", error.message);
      throw error;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        ADMISSION_ENQUIRY_ENDPOINTS.DELETE(id)
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(
          response?.data?.message || "Failed to delete admission enquiry"
        );
    } catch (error: any) {
      console.error(" delete error:", error.message);
      throw error;
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      if (!ids?.length) throw new Error("No IDs provided for deletion");
      const response = await AxiosFunc.Delete(
        ADMISSION_ENQUIRY_ENDPOINTS.DELETE_MULTIPLE,
        ids.map(Number)
      );
      if (!response?.data || response.data.status !== 200)
        throw new Error(
          response?.data?.message || "Failed to delete admission enquiries"
        );
    } catch (error: any) {
      console.error(" deleteMultiple error:", error.message);
      throw error;
    }
  },
};