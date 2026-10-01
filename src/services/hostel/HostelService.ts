import AxiosFunc from '../../utils/axios';
import { API_BASE_URL } from '../../utils/axios';
import type { Hostel, HostelFormData } from '../../types/hostel/Hostel';

// REMOVED: buildUrl — axios interceptor handles it

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const HOSTEL_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/hostels/all',
  GET_ALL_PAGINATED:'/school-group/{schoolGroupCode}/school/{schoolCode}/hostels/getAll',
  CREATE:'/school-group/{schoolGroupCode}/school/{schoolCode}/hostels/add',
  UPDATE: (id: number) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/hostels/update/${id}`,
  DELETE: (id: number) =>`/school-group/{schoolGroupCode}/school/{schoolCode}/hostels/delete/${id}`,
  DELETE_MULTIPLE:'/school-group/{schoolGroupCode}/school/{schoolCode}/hostels/delete-multiple',
  BULK_UPLOAD_XL:'/school-group/{schoolGroupCode}/school/{schoolCode}/student-hostel-fees/add/xl-sheet',
  DOWNLOAD_TEMPLATE_XL: '/templates/xl-sheets/hostel_fees.xlsx',
};

const transformBackendToFrontend = (data: any): Hostel => ({
  hostelId: data.hostelId,
  hostelName: data.hostelName ?? '',
  hostelType: data.hostelType ?? '',
  address: data.address ?? '',
  intake: data.intake ?? '',
  description: data.description ?? '',
});

const transformFrontendToBackend = (data: HostelFormData) => ({
  hostelName: data.hostelName,
  hostelType: data.hostelType,
  address: data.address || null,
  intake: data.intake || null,
  description: data.description || null,
});

export const hostelService = {

  getAll: async (): Promise<Hostel[]> => {
    try {
      const endpoint = isAllSchools()
        ? HOSTEL_ENDPOINTS.GET_ALL_PAGINATED
        : HOSTEL_ENDPOINTS.GET_ALL;

      const response = await AxiosFunc.Get(endpoint, {
        page: 0,
        size: 1000,
      });

      if (!response?.data || response.data?.status !== 200) return [];

      const raw = response.data?.data;
      const items =
        raw?.hostels ||
        raw?.source ||
        (Array.isArray(raw) ? raw : []);

      return items.map(transformBackendToFrontend);
    } catch (error: any) {
      console.error(' getAll error:', error.message);
      return [];
    }
  },

  create: async (data: HostelFormData): Promise<Hostel> => {
    try {
      const response = await AxiosFunc.Post(
        HOSTEL_ENDPOINTS.CREATE,
        transformFrontendToBackend(data)
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to create hostel');
      return transformBackendToFrontend(response.data.data);
    } catch (error: any) {
      console.error(' create error:', error.message);
      throw error;
    }
  },

  update: async (id: number, data: HostelFormData): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(
        HOSTEL_ENDPOINTS.UPDATE(id),
        transformFrontendToBackend(data)
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error(response?.data?.message || 'Failed to update hostel');
    } catch (error: any) {
      console.error(' update error:', error.message);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(HOSTEL_ENDPOINTS.DELETE(id));
      if (!response?.data || response.data?.status !== 200)
        throw new Error('Failed to delete hostel');
    } catch (error: any) {
      console.error(' delete error:', error.message);
      throw error;
    }
  },

  deleteMultiple: async (ids: number[]): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        HOSTEL_ENDPOINTS.DELETE_MULTIPLE,
        ids
      );
      if (!response?.data || response.data?.status !== 200)
        throw new Error('Failed to delete hostels');
      if (
        response.data?.message &&
        response.data.message.toLowerCase() !== 'success' &&
        response.data.message.toLowerCase() !== 'ok'
      ) {
        throw new Error(response.data.message);
      }
    } catch (error: any) {
      console.error(' deleteMultiple error:', error.message);
      throw error;
    }
  },

  bulkUploadFromExcel: async (file: File): Promise<{
    success: number;
    failed: number;
    message: string;
    errors?: string[];
    errorFile?: Blob;
  }> => {
    if (!file) throw new Error('Excel file is required');

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls)$/i))
      throw new Error('Invalid file type. Please upload an Excel file (.xlsx or .xls)');

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken') || '';
    const schoolCode = localStorage.getItem('schoolCode') || '';
    const schoolGroupCode = localStorage.getItem('schoolGroupCode') || '';

    const endpoint = HOSTEL_ENDPOINTS.BULK_UPLOAD_XL
      .replace('{schoolGroupCode}', schoolGroupCode)
      .replace('{schoolCode}', schoolCode);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const contentType = response.headers.get('content-type') || '';
    const contentDisposition = response.headers.get('content-disposition') || '';

    if (
      contentType.includes('application/octet-stream') ||
      contentDisposition.includes('attachment')
    ) {
      const blob = await response.blob();
      return {
        success: 0,
        failed: -1,
        message: 'Some records failed. Download the error file for details.',
        errorFile: blob,
      };
    }

    const json = await response.json();

    if (json?.status !== 200)
      throw new Error(json?.message || 'Failed to upload hostel fees Excel sheet');

    return {
      success: json?.data?.successCount ?? 0,
      failed: json?.data?.failureCount ?? 0,
      message: json?.message || 'All records uploaded successfully',
      errors: json?.data?.errors ?? [],
    };
  },

  downloadExcelTemplate: async (): Promise<Blob> => {
    try {
      const response = await AxiosFunc.GetFile(
        HOSTEL_ENDPOINTS.DOWNLOAD_TEMPLATE_XL
      );
      if (!(response.data instanceof Blob))
        throw new Error('Invalid file response from server');
      return response.data;
    } catch (error: any) {
      console.error(' downloadExcelTemplate error:', error.message);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to download Excel template'
      );
    }
  },
};