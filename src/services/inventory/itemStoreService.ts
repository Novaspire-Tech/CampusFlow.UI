import AxiosFunc from '../../utils/axios';
import type { ItemStore, ItemStoreFormData } from '../../types/inventory/ItemStore';

const ITEM_STORE_ENDPOINTS = {
  GET_ALL:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/item-store/all',

  GET_ALL_SCHOOL:
    '/school-group/{schoolGroupCode}/school/item-store/getAll',

  CREATE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/item-store/add',

  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/item-store/update/${id}`,

  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/item-store/delete/${id}`,

  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/item-store/delete-multiple',
};

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const transformBackendToFrontend = (data: any): ItemStore => ({
  itemStoreId: data.itemStoreId,
  itemStoreName: data.itemStoreName,
  itemStoreCode: data.itemStoreCode || '',
  description: data.description || '',
});

const transformFrontendToBackend = (data: ItemStoreFormData) => ({
  itemStoreName: data.itemStoreName,
  itemStoreCode: data.itemStoreCode || null,
  description: data.description || null,
});

export const itemStoreService = {
  getAll: async (): Promise<ItemStore[]> => {
    try {
      let response;

      if (isAllSchools()) {
        response = await AxiosFunc.Get(
          ITEM_STORE_ENDPOINTS.GET_ALL_SCHOOL,
          {
            params: {
              page: 0,
              size: 1000,
              sortDirection: 'asc',
            },
          }
        );
      } else {
        response = await AxiosFunc.Get(
          ITEM_STORE_ENDPOINTS.GET_ALL
        );
      }

      console.log('ITEM STORE RESPONSE:', response.data);

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
      } else if (Array.isArray(raw?.itemStores)) {
        list = raw.itemStores;
      }

      return list.map(transformBackendToFrontend);
    } catch (error) {
      console.error(' Error fetching item stores:', error);
      return [];
    }
  },
  create: async (data: ItemStoreFormData): Promise<ItemStore> => {
    try {
      const response = await AxiosFunc.Post(
        ITEM_STORE_ENDPOINTS.CREATE,
        transformFrontendToBackend(data)
      );

      if (response.data?.status !== 200)
        throw new Error(response.data?.message);

      return transformBackendToFrontend(response.data?.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create item store'
      );
    }
  },
  update: async (id: number, data: ItemStoreFormData): Promise<ItemStore> => {
    try {
      const response = await AxiosFunc.Put(
        ITEM_STORE_ENDPOINTS.UPDATE(id),
        transformFrontendToBackend(data)
      );

      if (response.data?.status !== 200)
        throw new Error(response.data?.message);

      return transformBackendToFrontend(response.data?.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update item store'
      );
    }
  },
  delete: async (id: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        ITEM_STORE_ENDPOINTS.DELETE(id)
      );

      if (response.data?.status !== 200)
        throw new Error('Failed to delete item store');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete item store'
      );
    }
  },
  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        ITEM_STORE_ENDPOINTS.DELETE_MULTIPLE,
        ids
      );

      if (response.data?.status !== 200)
        throw new Error('Failed to delete multiple item stores');

      if (
        response.data?.message &&
        response.data.message.toLowerCase() !== 'success' &&
        response.data.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error deleting item stores:', error);
      throw error;
    }
  },
};