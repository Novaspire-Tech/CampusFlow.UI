import AxiosFunc from "../../utils/axios";
import type {
  IssuesItem,
  IssuesItemFormData,
  IssuesItemListResponse,
} from "../../types/inventory/IssuesItem";

const ENDPOINTS = {
  GET_ALL: "/school-group/{schoolGroupCode}/school/{schoolCode}/issues-item/all",
  GET_ALL_SCHOOL: "/school-group/{schoolGroupCode}/school/issues-item/getAll",
  FILTER: "/school-group/{schoolGroupCode}/school/{schoolCode}/issues-item/filter",
  CREATE: "/school-group/{schoolGroupCode}/school/{schoolCode}/issues-item/add",
  UPDATE: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/issues-item/update/${id}`,
  DELETE: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/issues-item/delete/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/issues-item/delete-multiple",
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

const transformToDTO = (data: IssuesItemFormData) => ({
  userType: "Staff",
  issueBy: "Admin",
  issueReturn: null,
  issueTo: data.issueTo,
  issueDate: formatDate(data.issueDate),
  note: data.note || "",
  quantity: String(data.quantity),
  itemCategoryId: Number(data.itemCategoryId),
  addItemsId: Number(data.addItemsId),
});

const mapItem = (item: any): IssuesItem => ({
  ...item,
  id: item.issuesItemId,
});

export const issuesItemService = {

  filter: async (
    search = "",
    page = 0,
    size = 10
  ): Promise<IssuesItemListResponse> => {
    try {
      const url = `${ENDPOINTS.FILTER}?page=${page}&size=${size}&sortDirection=asc${search.trim() ? `&search=${encodeURIComponent(search.trim())}` : ""}`;

      const res = await AxiosFunc.Post(url, {});

      if (!res?.data) throw new Error("No response data received");

      const raw = res.data?.data;

      let list: any[] = [];

      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.issuesItems)) list = raw.issuesItems;
      else if (Array.isArray(raw?.issueItems)) list = raw.issueItems;
      else if (Array.isArray(raw?.content)) list = raw.content;

      const mapped = list.map(mapItem);

      return {
        issuesItems: mapped,
        totalItems: raw?.totalElements ?? raw?.totalItems ?? mapped.length,
        totalPages: raw?.totalPages ?? 1,
        currentPage: raw?.currentPage ?? raw?.number ?? page,
      };
    } catch (error: any) {
      console.error("filter issues item error:", error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  getAll: async (): Promise<IssuesItem[]> => {
    try {
      let res;

      if (isAllSchools()) {
        res = await AxiosFunc.Get(ENDPOINTS.GET_ALL_SCHOOL, {
          params: {
            page: 0,
            size: 1000,
            sortDirection: "asc",
          },
        });
      } else {
        res = await AxiosFunc.Get(ENDPOINTS.GET_ALL, {
          params: {
            page: 0,
            size: 1000,
            sortDirection: "asc",
          },
        });
      }

      if (!res?.data) throw new Error("No response data received");

      const raw = res.data?.data;

      let list: any[] = [];

      if (Array.isArray(raw)) list = raw;
      else if (Array.isArray(raw?.issuesItems)) list = raw.issuesItems;
      else if (Array.isArray(raw?.issueItems)) list = raw.issueItems;
      else if (Array.isArray(raw?.content)) list = raw.content;

      return list.map(mapItem);
    } catch (error) {
      console.error("getAll issues item error:", error);
      return [];
    }
  },

  create: async (data: IssuesItemFormData) => {
    const res = await AxiosFunc.Post(
      ENDPOINTS.CREATE,
      transformToDTO(data)
    );

    if (!res?.data || res.data.status !== 200)
      throw new Error(res?.data?.message || "Failed to create issue item");

    return res.data;
  },

  update: async (id: number, data: IssuesItemFormData) => {
    const res = await AxiosFunc.Put(
      ENDPOINTS.UPDATE(id),
      transformToDTO(data)
    );

    if (!res?.data || res.data.status !== 200)
      throw new Error(res?.data?.message || "Failed to update issue item");

    return res.data;
  },

  delete: async (id: number) => {
    const res = await AxiosFunc.Delete(
      ENDPOINTS.DELETE(id)
    );

    if (!res?.data || res.data.status !== 200)
      throw new Error(res?.data?.message || "Failed to delete issue item");
  },

  deleteMultiple: async (ids: number[]) => {
    if (!ids?.length) throw new Error("No IDs provided");

    const res = await AxiosFunc.Delete(
      ENDPOINTS.DELETE_MULTIPLE,
      ids
    );

    if (!res?.data || res.data.status !== 200)
      throw new Error(res?.data?.message || "Failed to delete issue items");
  },
};