import AxiosFunc from '../../utils/axios';
import type { StudentCategory, StudentCategoryStats } from '../../types/studentInformation/studentCategory';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getLocal = (key: string, fallback = 'default'): string =>
  localStorage.getItem(key) ?? (console.error(`${key} not found`), fallback);

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getLocal('schoolGroupCode'))
    .replace('{schoolCode}', getLocal('schoolCode'));

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

// ─── Endpoints ───────────────────────────────────────────────────────────────

const EP = {
  GET_ALL:       '/school-group/{schoolGroupCode}/school/{schoolCode}/student-category/all',
  GET_PAGINATED: '/school-group/{schoolGroupCode}/school/student-category/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-category/${id}`,
  CREATE:        '/school-group/{schoolGroupCode}/school/{schoolCode}/student-category/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-category/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-category/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-category/delete-multiple',
};

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): StudentCategory => ({
  id: d.studentCategoryId?.toString() ?? d.categoryId?.toString() ?? d.id?.toString() ?? '',
  name: d.categoryName ?? '',
  createdDate: d.createdDate
    ? new Date(d.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  status: d.isActive ? 'Active' : 'Inactive',
});

const toBackend = (d: Partial<StudentCategory>) => ({
  categoryName: d.name?.trim(),
});

const extractList = (response: any): StudentCategory[] => {
  const data =
    response?.data?.data?.studentCategories ??
    response?.data?.studentCategories ??
    response?.data?.data ??
    [];

  if (!Array.isArray(data)) {
    console.warn('Expected array, got:', data);
    return [];
  }
  return data.map(toFrontend);
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const studentCategoryService = {

  getAll: async (): Promise<StudentCategory[]> => {
    try {
      const url = isAllSchools()
        ? buildUrl(EP.GET_PAGINATED)
        : buildUrl(EP.GET_ALL);

      const response = await AxiosFunc.Get(url, {
        page: 0, size: 1000, sortDirection: 'asc', sortBy: 'categoryName',
      });

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch student categories');

      return extractList(response);
    } catch (error: any) {
      console.error('Error fetching student categories:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<StudentCategory | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)));
      if (response.data?.status !== 200 || !response.data?.data) return null;
      return toFrontend(response.data.data);
    } catch (error: any) {
      console.error('Error fetching student category:', error);
      return null;
    }
  },

  create: async (data: Partial<StudentCategory>): Promise<StudentCategory> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create student category');

    return {
      ...(data as StudentCategory),
      id: response.data?.data?.studentCategoryId?.toString() ?? `temp-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    };
  },

  update: async (id: string, data: StudentCategory): Promise<StudentCategory> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update student category');

    return data;
  },

  delete: async (id: string): Promise<void> => {
    const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete student category');
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      buildUrl(EP.DELETE_MULTIPLE),
      ids.map(Number)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete student categories');
  },

  getStats: async (): Promise<StudentCategoryStats[]> => {
    try {
      const categories = await studentCategoryService.getAll();
      const activeCount = categories.filter(c => c.status === 'Active').length;

      return [
        { title: 'Total Categories',  value: categories.length.toString(), change: '+0%', icon: 'Package' },
        { title: 'Active Categories', value: activeCount.toString(),        change: '+0%', icon: 'CheckCircle' },
      ];
    } catch (error: any) {
      console.error('Error fetching student category stats:', error);
      return [
        { title: 'Total Categories',  value: '0', change: '+0%', icon: 'Package' },
        { title: 'Active Categories', value: '0', change: '+0%', icon: 'CheckCircle' },
      ];
    }
  },
};