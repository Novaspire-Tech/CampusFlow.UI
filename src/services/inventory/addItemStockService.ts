import AxiosFunc from "../../utils/axios";
import type {
  AddItemStock,
  AddItemStockFormData,
} from "../../types/inventory/AddItemStock";

const ENDPOINTS = {
  GET_ALL: "/school-group/{schoolGroupCode}/school/{schoolCode}/item-stock/all",
  GET_ALL_SCHOOL: "/school-group/{schoolGroupCode}/school/item-stock/getAll",
  CREATE: "/school-group/{schoolGroupCode}/school/{schoolCode}/item-stock/add",
  UPDATE: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/item-stock/update/${id}`,
  UPDATE_DOCUMENT: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/item-stock/update-document/${id}`,
  DELETE: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/item-stock/delete/${id}`,
  DELETE_MULTIPLE: "/school-group/{schoolGroupCode}/school/{schoolCode}/item-stock/delete-multiple",
};

const isAllSchools = (): boolean =>
  localStorage.getItem("isAllSchools") === "true";

const formatDate = (date: string | Date): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const transformToDTO = (data: AddItemStockFormData) => ({
  quantity: data.quantity,
  parchesPrice: data.parchesPrice,
  date: formatDate(data.date),
  description: data.description || "",
  itemCategoryId: Number(data.itemCategoryId),
  addItemsId: Number(data.addItemsId),
  itemStoreId: data.itemStoreId ? Number(data.itemStoreId) : null,
  itemSupplierId: data.itemSupplierId ? Number(data.itemSupplierId) : null,
});

const mapItem = (item: any): AddItemStock => ({
  id: item.addItemStockId,
  addItemStockId: item.addItemStockId,
  itemCategory: {
    itemCategoryId: item.itemCategory?.itemCategoryId,
    itemCategory: item.itemCategory?.itemCategory,
  },
  addItems: {
    addItemId: item.addItems?.addItemId,
    item: item.addItems?.item,
  },
  itemStore: item.itemStore
    ? {
      itemStoreId: item.itemStore.itemStoreId,
      itemStoreName: item.itemStore.itemStoreName,
    }
    : null,
  itemSupplier: item.itemSupplier
    ? {
      itemSupplierId: item.itemSupplier.itemSupplierId,
      name: item.itemSupplier.name,
    }
    : null,
  quantity: item.quantity,
  parchesPrice: item.parchesPrice,
  date: item.date,
  document: item.document ?? null,
  description: item.description || "",
});

export const addItemStockService = {
  getAll: async (): Promise<AddItemStock[]> => {
    try {
      let response;

      if (isAllSchools()) {
        response = await AxiosFunc.Get(ENDPOINTS.GET_ALL_SCHOOL, {
          params: {
            page: 0,
            size: 1000,
            sortDirection: "asc",
          },
        });
      } else {
        response = await AxiosFunc.Get(ENDPOINTS.GET_ALL);
      }

      console.log("ITEM STOCK RESPONSE:", response.data);

      if (response.data?.status !== 200) return [];

      const raw = response.data?.data;

      let list: any[] = [];

      if (Array.isArray(raw)) {
        list = raw;
      } else if (Array.isArray(raw?.content)) {
        list = raw.content;
      } else if (Array.isArray(raw?.source)) {
        list = raw.source;
      } else if (Array.isArray(raw?.items)) {
        list = raw.items;
      } else if (Array.isArray(raw?.itemStocks)) {
        list = raw.itemStocks;
      }

      return list.map(mapItem);
    } catch (error) {
      console.error("getAll item stock error:", error);
      return [];
    }
  },

  create: async (data: AddItemStockFormData): Promise<AddItemStock> => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(transformToDTO(data)));

    if (data.document instanceof File) {
      formData.append("document", data.document);
    }

    const response = await AxiosFunc.PostFormData(
      ENDPOINTS.CREATE,
      formData
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to create item stock");

    return mapItem(response.data.data);
  },

  update: async (
    id: number,
    data: AddItemStockFormData
  ): Promise<AddItemStock> => {
    const response = await AxiosFunc.Put(
      ENDPOINTS.UPDATE(id),
      transformToDTO(data)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to update item stock");

    return mapItem(response.data.data);
  },
  updateDocument: async (id: number, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("document", file);

    const response = await AxiosFunc.PostFormData(
      ENDPOINTS.UPDATE_DOCUMENT(id),
      formData
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to update document");
  },
  delete: async (id: number): Promise<void> => {
    const response = await AxiosFunc.Delete(
      ENDPOINTS.DELETE(id)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to delete item stock");
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      ENDPOINTS.DELETE_MULTIPLE,
      ids
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || "Failed to delete item stocks");
  },
};