import AxiosFunc from '../../utils/axios';
import type { ItemSupplier } from '../../types/inventory/ItemSupplier';

const ITEM_SUPPLIER_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/item-supplier/all',
  GET_ALL_SCHOOL:'/school-group/{schoolGroupCode}/school/item-supplier/getAll',
  GET_BY_ID: (id: string | number) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/item-supplier/${id}`,
  CREATE:'/school-group/{schoolGroupCode}/school/{schoolCode}/item-supplier/add',
  UPDATE: (id: string | number) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/item-supplier/update/${id}`,
  DELETE: (id: string | number) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/item-supplier/delete/${id}`,
  DELETE_MULTIPLE:'/school-group/{schoolGroupCode}/school/{schoolCode}/item-supplier/delete-multiple',
};

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const transformBackendToFrontend = (data: any): ItemSupplier => ({
  itemSupplierId: data.itemSupplierId,
  name: data.name || '',
  phoneNumber: data.phoneNumber || '',
  email: data.email || '',
  address: data.address || '',
  description: data.description || '',
  supplierName: undefined,
});

const transformFrontendToBackend = (data: Partial<ItemSupplier>) => ({
  name: data.name,
  phoneNumber: data.phoneNumber || null,
  email: data.email || null,
  address: data.address || null,
  description: data.description || null,
});

const extractSuppliers = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.suppliers)) return raw.suppliers;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.items)) return raw.items;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
};

export const itemSupplierService = {
  getAll: async (): Promise<ItemSupplier[]> => {
    try {
      let response;

      if (isAllSchools()) {
        response = await AxiosFunc.Get(
          ITEM_SUPPLIER_ENDPOINTS.GET_ALL_SCHOOL,
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
          ITEM_SUPPLIER_ENDPOINTS.GET_ALL
        );
      }

      console.log('ITEM SUPPLIER RESPONSE:', response.data);

      if (response.data?.status !== 200) return [];

      const raw = response.data?.data;

      const list = extractSuppliers(raw);

      return list.map(transformBackendToFrontend);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      return [];
    }
  },
  getById: async (id: string | number): Promise<ItemSupplier | null> => {
    try {
      const response = await AxiosFunc.Get(
        ITEM_SUPPLIER_ENDPOINTS.GET_BY_ID(id)
      );

      if (response.data?.status !== 200) return null;

      return transformBackendToFrontend(response.data?.data);
    } catch (error) {
      console.error(' Error fetching supplier:', error);
      return null;
    }
  },
  create: async (data: Partial<ItemSupplier>): Promise<ItemSupplier> => {
    try {
      const response = await AxiosFunc.Post(
        ITEM_SUPPLIER_ENDPOINTS.CREATE,
        transformFrontendToBackend(data)
      );

      if (response.data?.status !== 200)
        throw new Error(response.data?.message);

      return transformBackendToFrontend(response.data?.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create supplier'
      );
    }
  },
  update: async (
    id: string | number,
    data: ItemSupplier
  ): Promise<ItemSupplier> => {
    try {
      const response = await AxiosFunc.Put(
        ITEM_SUPPLIER_ENDPOINTS.UPDATE(id),
        transformFrontendToBackend(data)
      );

      if (response.data?.status !== 200)
        throw new Error(response.data?.message);

      return transformBackendToFrontend(response.data?.data);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update supplier'
      );
    }
  },
  delete: async (id: string | number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        ITEM_SUPPLIER_ENDPOINTS.DELETE(id)
      );

      if (response.data?.status !== 200)
        throw new Error('Failed to delete supplier');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete supplier'
      );
    }
  },
  deleteMultiple: async (ids: (string | number)[]): Promise<void> => {
    try {
      const numericIds = ids.map((id) => Number(id));

      const response = await AxiosFunc.Delete(
        ITEM_SUPPLIER_ENDPOINTS.DELETE_MULTIPLE,
        numericIds
      );

      if (response.data?.status !== 200)
        throw new Error(
          response.data?.message || 'Failed to delete multiple suppliers'
        );

      if (
        response.data?.message &&
        response.data.message.toLowerCase() !== 'success' &&
        response.data.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error(' Error deleting suppliers:', error);
      throw error;
    }
  },
};