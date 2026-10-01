import AxiosFunc from '../../utils/axios';
import type { TransportFeesMaster, TransportFeesMasterDto } from '../../types/transport/feesMaster';
import type { FineType } from '../../types/transport/feesMaster';


const getSchoolCode = (): string => {
  const schoolCode = localStorage.getItem('schoolCode');
  if (!schoolCode) {
    console.error('School code not found');
    return 'default';
  }
  return schoolCode;
};

const getSchoolGroupCode = (): string => {
  const schoolGroupCode = localStorage.getItem('schoolGroupCode');
  if (!schoolGroupCode) {
    console.error('School group code not found');
    return 'default';
  }
  return schoolGroupCode;
};

const buildUrl = (endpoint: string): string => {
  const schoolCode = getSchoolCode();
  const schoolGroupCode = getSchoolGroupCode();
  return endpoint
    .replace('{schoolGroupCode}', schoolGroupCode)
    .replace('{schoolCode}', schoolCode);
};


const FEES_MASTER_ENDPOINTS = {
  UPSERT_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/fees-master/add',
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/fees-master/all',
};




const transformBackendToFrontend = (backendData: any): TransportFeesMaster => {
  const percentage = backendData.percentage || null;
  const fixAmount = backendData.fixAmount || null;
  
  let fineType: FineType = "none";
  if (percentage && Number(percentage) > 0) {
      fineType = "percentage";
  } else if (fixAmount && Number(fixAmount) > 0) {
      fineType = "fixed";
  }

  return {
    id: backendData.transportFeesMasterId?.toString() || null,
    month: backendData.month || '',
    dueDate: backendData.dueDate || undefined,
    percentage: percentage,
    fixAmount: fixAmount,
    fineType: fineType,
  };
};

const extractFeesMasterFromResponse = (response: any): TransportFeesMaster[] => {
 
  const backendData = response?.data?.data || response?.data?.feesMaster || [];
  if (!Array.isArray(backendData)) return [];
  
  return backendData.map(transformBackendToFrontend);
};



export const feesMasterService = {
  
 
  getAll: async (): Promise<TransportFeesMaster[]> => {
    try {
      const response = await AxiosFunc.Get(buildUrl(FEES_MASTER_ENDPOINTS.GET_ALL));

      if (response.data?.status !== 200) {
        throw new Error(response.data?.message || 'Failed to fetch fee master details');
      }

      return extractFeesMasterFromResponse(response);
    } catch (error: any) {
      console.error('Error fetching fee master details:', error);
      return [];
    }
  },

  
  upsertAll: async (data: TransportFeesMasterDto[]): Promise<void> => {
    try {
      
      const response = await AxiosFunc.Post(buildUrl(FEES_MASTER_ENDPOINTS.UPSERT_ALL), data);

      if (response.data?.status !== 200) {
        const errorMessage = response.data?.message || 'Failed to save fee master details';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save fee master details';
      throw new Error(errorMessage);
    }
  },
};