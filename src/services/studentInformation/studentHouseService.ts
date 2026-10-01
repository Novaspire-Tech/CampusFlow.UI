import AxiosFunc from '../../utils/axios';
import type { StudentHouse, StudentHouseStats } from '../../types/studentInformation/studentHouse';

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
  GET_ALL:         '/school-group/{schoolGroupCode}/school/{schoolCode}/student-house/all',
  GET_PAGINATED:   '/school-group/{schoolGroupCode}/school/student-house/getAll',
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-house/${id}`,
  CREATE:          '/school-group/{schoolGroupCode}/school/{schoolCode}/student-house/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-house/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/student-house/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/student-house/delete-multiple',
};

// ─── Transform ───────────────────────────────────────────────────────────────

const toFrontend = (d: any): StudentHouse => ({
  id: d.studentHouseId?.toString() ?? d.id?.toString() ?? '',
  name: d.houseName ?? '',
  description: d.description ?? '',
  createdDate: d.createdDate
    ? new Date(d.createdDate).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0],
  status: d.isActive ? 'Active' : 'Inactive',
});

const toBackend = (d: Partial<StudentHouse>) => ({
  houseName: d.name,
  description: d.description?.trim() ?? '',
});

const extractList = (response: any): StudentHouse[] => {
  const data =
    response?.data?.data?.studentHouses ??
    response?.data?.studentHouses ??
    response?.data?.data ??
    [];

  if (!Array.isArray(data)) {
    console.warn('Expected array, got:', data);
    return [];
  }
  return data.map(toFrontend);
};

// ─── Service ─────────────────────────────────────────────────────────────────

export const studentHouseService = {

  getAll: async (): Promise<StudentHouse[]> => {
    try {
      const url = isAllSchools()
        ? buildUrl(EP.GET_PAGINATED)
        : buildUrl(EP.GET_ALL);

      const response = await AxiosFunc.Get(url, {
        page: 0, size: 1000, sortDirection: 'asc', sortBy: 'houseName',
      });

      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to fetch student houses');

      return extractList(response);
    } catch (error: any) {
      console.error('Error fetching student houses:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<StudentHouse | null> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(EP.GET_BY_ID(id)));
      if (response.data?.status !== 200 || !response.data?.data) return null;
      return toFrontend(response.data.data);
    } catch (error: any) {
      console.error('Error fetching student house:', error);
      return null;
    }
  },

  create: async (data: Partial<StudentHouse>): Promise<StudentHouse> => {
    const response = await AxiosFunc.Post(buildUrl(EP.CREATE), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to create student house');

    return {
      ...(data as StudentHouse),
      id: response.data?.data?.studentHouseId?.toString() ?? `temp-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
  },

  update: async (id: string, data: StudentHouse): Promise<StudentHouse> => {
    const response = await AxiosFunc.Put(buildUrl(EP.UPDATE(id)), toBackend(data));

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to update student house');

    return data;
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(buildUrl(EP.DELETE(id)));
      if (response.data?.status !== 200)
        throw new Error(response.data?.message ?? 'Failed to delete student house');
    } catch (error: any) {
      if (error.response?.status === 500) return;
      throw new Error(error.response?.data?.message ?? error.message ?? 'Failed to delete student house');
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    const response = await AxiosFunc.Delete(
      buildUrl(EP.DELETE_MULTIPLE),
      ids.map(Number)
    );

    if (response.data?.status !== 200)
      throw new Error(response.data?.message ?? 'Failed to delete student houses');
  },

  getStats: async (): Promise<StudentHouseStats[]> => {
    try {
      const houses = await studentHouseService.getAll();
      const activeCount = houses.filter(h => h.status === 'Active').length;

      return [
        { title: 'Total Houses',  value: houses.length.toString(), change: '+0%', icon: 'Home' },
        { title: 'Active Houses', value: activeCount.toString(),    change: '+0%', icon: 'CheckCircle' },
      ];
    } catch (error: any) {
      console.error('Error fetching student house stats:', error);
      return [
        { title: 'Total Houses',  value: '0', change: '+0%', icon: 'Home' },
        { title: 'Active Houses', value: '0', change: '+0%', icon: 'CheckCircle' },
      ];
    }
  },
};