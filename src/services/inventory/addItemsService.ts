import AxiosFunc from '../../utils/axios';
import type { AddItems, AddItemsFormData } from '../../types/inventory/AddItems';


const ADD_ITEMS_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-item/all',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/add-item/getAll',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-item/filter',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-item/add',
  UPDATE: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/add-item/update/${id}`,
  DELETE: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/add-item/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/add-item/delete-multiple',
};


const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';


export interface AddItemsFilterParams {
  search?: string;
}

const transformBackendToFrontend = (data: any): AddItems => ({
  addItemId: data.addItemId,
  item: data.item,
  unit: data.unit || null,
  quantity: data.quantity,
  description: data.description ?? '',
});

const transformFrontendToBackend = (data: AddItemsFormData) => ({
  item: data.item,
  unit: data.unit || null,
  quantity: data.quantity,
  description: data.description,
});


export const addItemsService = {
  getAll: async (): Promise<AddItems[]> => {
    try {
      let response;

      if (isAllSchools()) {
        response = await AxiosFunc.Get(
          ADD_ITEMS_ENDPOINTS.GET_ALL_SCHOOL,
          {
            params: {
              page: 0,
              size: 1000,
              sortDirection: 'asc',
            },
          }
        );
      } else {
        response = await AxiosFunc.Get(ADD_ITEMS_ENDPOINTS.GET_ALL);
      }

      console.log('ADD ITEMS RESPONSE:', response.data);

      if (response.data?.status !== 200) return [];

      const raw = response.data?.data;

      let items: any[] = [];

      if (Array.isArray(raw)) {
        items = raw;
      } else if (Array.isArray(raw?.items)) {
        items = raw.items;
      } else if (Array.isArray(raw?.addItems)) {
        items = raw.addItems;
      } else if (Array.isArray(raw?.content)) {
        items = raw.content;
      } else if (Array.isArray(raw?.source)) {
        items = raw.source;
      }

      return items.map(transformBackendToFrontend);
    } catch (error: any) {
      console.error('getAll error:', error);
      return [];
    }
  },

  filter: async (params: AddItemsFilterParams): Promise<AddItems[]> => {
    try {
      const body: Record<string, any> = {};
      if (params.search?.trim()) body.search = params.search.trim();

      const response = await AxiosFunc.Post(
        ADD_ITEMS_ENDPOINTS.FILTER,
        body,
        {
          params: {
            page: 0,
            size: 10000,
            sortDirection: 'asc',
          },
        }
      );

      if (response.data?.status !== 200)
        throw new Error(response.data.message);

      const raw = response.data?.data;

      if (Array.isArray(raw)) return raw.map(transformBackendToFrontend);
      if (raw?.content) return raw.content.map(transformBackendToFrontend);
      if (raw?.source) return raw.source.map(transformBackendToFrontend);
      if (raw?.items) return raw.items.map(transformBackendToFrontend);
      if (raw?.addItems) return raw.addItems.map(transformBackendToFrontend);

      return [];
    } catch (error: any) {
      console.error('filter error:', error);
      throw new Error(error.response?.data?.message || error.message);
    }
  },

  create: async (data: AddItemsFormData): Promise<AddItems> => {
    const response = await AxiosFunc.Post(
      ADD_ITEMS_ENDPOINTS.CREATE,
      transformFrontendToBackend(data)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message);

    return transformBackendToFrontend(response.data.data);
  },

  update: async (id: number, data: AddItemsFormData): Promise<void> => {
    const response = await AxiosFunc.Put(
      ADD_ITEMS_ENDPOINTS.UPDATE(id),
      transformFrontendToBackend(data)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message);
  },

  delete: async (id: number): Promise<void> => {
    const response = await AxiosFunc.Delete(
      ADD_ITEMS_ENDPOINTS.DELETE(id)
    );

    if (response.data?.status !== 200)
      throw new Error('Failed to delete item');
  },
  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        ADD_ITEMS_ENDPOINTS.DELETE_MULTIPLE,
        ids
      );

      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete items');
    } catch (error) {
      console.error('deleteMultiple error:', error);
      throw error;
    }
  },
};