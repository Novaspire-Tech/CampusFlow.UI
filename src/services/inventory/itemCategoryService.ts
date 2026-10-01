import AxiosFunc from '../../utils/axios';
import type { ItemCategory, ItemCategoryFormData } from '../../types/inventory/ItemCategory';

const ITEM_CATEGORY_ENDPOINTS = {
  GET_ALL:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/item-category/all',

  GET_ALL_SCHOOL:
    '/school-group/{schoolGroupCode}/school/item-category/getAll',

  CREATE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/item-category/add',

  UPDATE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/item-category/update/${id}`,

  DELETE: (id: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/item-category/delete/${id}`,

  DELETE_MULTIPLE:
    '/school-group/{schoolGroupCode}/school/{schoolCode}/item-category/delete-multiple',
};

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const transformBackendToFrontend = (data: any): ItemCategory => ({
  itemCategoryId: data.itemCategoryId,
  itemCategory: data.itemCategory ?? '',
  description: data.description ?? '',
  addItemId: undefined,
  item: undefined,
});

const transformFrontendToBackend = (data: ItemCategoryFormData) => ({
  itemCategory: data.itemCategory,
  description: data.description || null,
});

export const itemCategoryService = {
  getAll: async (): Promise<ItemCategory[]> => {
    try {
      let response;

      if (isAllSchools()) {
        response = await AxiosFunc.Get(
          ITEM_CATEGORY_ENDPOINTS.GET_ALL_SCHOOL,
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
          ITEM_CATEGORY_ENDPOINTS.GET_ALL
        );
      }

      console.log('ITEM CATEGORY RESPONSE:', response.data);

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
      } else if (Array.isArray(raw?.itemCategories)) {
        list = raw.itemCategories;
      }

      return list.map(transformBackendToFrontend);
    } catch (error) {
      console.error('Error fetching item categories:', error);
      return [];
    }
  },

  create: async (data: ItemCategoryFormData): Promise<ItemCategory> => {
    const response = await AxiosFunc.Post(
      ITEM_CATEGORY_ENDPOINTS.CREATE,
      transformFrontendToBackend(data)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to create Item Category');

    return transformBackendToFrontend(response.data.data);
  },
  update: async (id: number, data: ItemCategoryFormData): Promise<void> => {
    const response = await AxiosFunc.Put(
      ITEM_CATEGORY_ENDPOINTS.UPDATE(id),
      transformFrontendToBackend(data)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to update Item Category');
  },

  delete: async (id: number): Promise<void> => {
    const response = await AxiosFunc.Delete(
      ITEM_CATEGORY_ENDPOINTS.DELETE(id)
    );

    if (response.data?.status !== 200)
      throw new Error('Failed to delete Item Category');
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        ITEM_CATEGORY_ENDPOINTS.DELETE_MULTIPLE,
        ids
      );

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete Item Categories');

      if (
        response.data?.message &&
        response.data.message.toLowerCase() !== 'success' &&
        response.data.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(' deleteMultiple error:', error);
      throw error;
    }
  },
};