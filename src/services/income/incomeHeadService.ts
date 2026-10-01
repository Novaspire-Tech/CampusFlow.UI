import AxiosFunc from '../../utils/axios';
import type { IncomeHead, IncomeHeadStats } from '../../types/income/incomeHead';


const INCOME_HEAD_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/income-head/all',
  GET_ALL_SCHOOL:'/school-group/{schoolGroupCode}/school/income-head/getAll', 
  GET_BY_ID: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/income-head/${id}`,
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/income-head/add',
  UPDATE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/income-head/update/${id}`,
  DELETE: (id: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/income-head/delete/${id}`,
  DELETE_MULTIPLE: '/school-group/{schoolGroupCode}/school/{schoolCode}/income-head/delete-multiple',
};

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

//  DEFAULT STATS 
const DEFAULT_ZERO_STATS: IncomeHeadStats[] = [
  {
    title: "Total Income Heads",
    value: "0",
    change: "+0%",
    icon: "Package",
  },
  {
    title: "Active Heads",
    value: "0",
    change: "+0%",
    icon: "CheckCircle",
  },
];

//  DATA TRANSFORMATION 
const transformBackendToFrontend = (backendData: any): IncomeHead => {
  return {
    id: backendData.incomeHeadId?.toString() || backendData.id?.toString() || '',
    name: backendData.incomeHead || '',
    description: backendData.description || '',
    createdDate: backendData.createdDate
      ? new Date(backendData.createdDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    status: backendData.isActive ? 'Active' : 'Inactive',
  };
};

const transformFrontendToBackend = (frontendData: Partial<IncomeHead>): any => {
  return {
    incomeHead: frontendData.name,
    description: frontendData.description || '',
  };
};

const extractIncomeHeadsFromResponse = (response: any): IncomeHead[] => {
  const backendData = response?.data?.data?.incomeHead || response?.data?.incomeHead || [];
  return backendData.map(transformBackendToFrontend);
};

//Service
export const incomeHeadService = {
  
  getAll: async (): Promise<IncomeHead[]> => {
    try {
      const endpoint = isAllSchools()
        ? INCOME_HEAD_ENDPOINTS.GET_ALL_SCHOOL
        : INCOME_HEAD_ENDPOINTS.GET_ALL;

      const response = await AxiosFunc.Get(endpoint, {
        
        page: 0,
        size: 20,
        sortDirection: 'asc'
      });

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch income heads');
      }

      return extractIncomeHeadsFromResponse(response);
    } catch (error: any) {
      console.error('Error fetching income heads:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<IncomeHead | null> => {
    try {
      const response = await AxiosFunc.Get(INCOME_HEAD_ENDPOINTS.GET_BY_ID(id));

      if (response.data?.status !== 200) {
        return null;
      }

      const backendData = response.data?.data;
      if (!backendData) {
        return null;
      }

      return transformBackendToFrontend(backendData);
    } catch (error: any) {
      console.error('Error fetching income head:', error);
      return null;
    }
  },

  create: async (data: Partial<IncomeHead>): Promise<IncomeHead> => {
    try {
      const backendData = transformFrontendToBackend(data);
      const response = await AxiosFunc.Post((INCOME_HEAD_ENDPOINTS.CREATE), backendData);

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to create income head';
        throw new Error(errorMessage);
      }

      const createdIncomeHead: IncomeHead = {
        ...data as IncomeHead,
        id: response.data?.data?.incomeHeadId?.toString() || `temp-${Date.now()}`,
        createdDate: new Date().toISOString().split('T')[0],
      };
     
      return createdIncomeHead;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create income head';
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, data: IncomeHead): Promise<IncomeHead> => {
    try {
      const backendData = transformFrontendToBackend(data);
     
      const response = await AxiosFunc.Put(
       (INCOME_HEAD_ENDPOINTS.UPDATE(id)),
        backendData
      );

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to update income head';
        throw new Error(errorMessage);
      }

      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update income head';
      throw new Error(errorMessage);
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete((INCOME_HEAD_ENDPOINTS.DELETE(id)));

      if (response.data?.status === 200) {
        return;
      }

      const errorMessage = response.data?.message || 'Failed to delete income head';
      throw new Error(errorMessage);

    } catch (error: any) {
      if (error.response?.status === 500) {
        return;
      }
     
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete income head';
      throw new Error(errorMessage);
    }
  },

  deleteMultiple: async (ids: string[]): Promise<void> => {
    try {
      const numericIds = ids.map(id => parseInt(id));
      const response = await AxiosFunc.Delete(
        (INCOME_HEAD_ENDPOINTS.DELETE_MULTIPLE),
        numericIds
      );
 
      const message = response.data?.message || '';
 
      
      if (message.toLowerCase().includes('cannot')) {
        throw new Error(message);
      }
 
      if (response.data?.status !== 200) {
        throw new Error(message || 'Failed to delete income heads');
      }
 
    } catch (error: any) {
      throw error;
    }
  },

  getStats: async (): Promise<IncomeHeadStats[]> => {
    try {
      const incomeHeads = await incomeHeadService.getAll();
      const activeCount = incomeHeads.filter(h => h.status === 'Active').length;
      
      return [
        {
          title: "Total Income Heads",
          value: incomeHeads.length.toString(),
          change: "+0%",
          icon: "Package",
        },
        {
          title: "Active Heads",
          value: activeCount.toString(),
          change: "+0%",
          icon: "CheckCircle",
        },
      ];
    } catch (error: any) {
      console.error('Error fetching income head stats:', error);
      return DEFAULT_ZERO_STATS;
    }
  },
};