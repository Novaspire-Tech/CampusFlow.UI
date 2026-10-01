import AxiosFunc from '../../utils/axios';
import type { IncomeGroup, IncomeGroupPayload, IncomeGroupStats } from '../../types/income/incomeGroup';

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const EP = {

  GET_ALL: (headId: number) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/income-group/all/${headId}`,

  
  GET_ALL_SCHOOL:
    `/school-group/{schoolGroupCode}/school/income-group/getAll`,

  CREATE:
    `/school-group/{schoolGroupCode}/school/{schoolCode}/income-group/add`,

  UPDATE: (groupId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/income-group/update/${groupId}`,

  DELETE: (groupId: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/income-group/delete/${groupId}`,
};

const transform = (b: any): IncomeGroup => ({
  id: b.incomeGroupId?.toString() || '',
  groupName: b.groupName || '',
});

const extractList = (response: any): IncomeGroup[] => {
  const raw = response?.data?.data;
  if (Array.isArray(raw)) return raw.map(transform);
  
  if (Array.isArray(raw?.incomeGroups)) return raw.incomeGroups.map(transform);
  return [];
};

export const incomeGroupService = {

  getAll: async (incomeHeadId: number): Promise<IncomeGroup[]> => {
    try {
      let res;

      if (isAllSchools()) {
        
       res = await AxiosFunc.Get((EP.GET_ALL_SCHOOL), {
  incomeHeadId,   // ← yeh add karo query param ke roop mein
  page: 0,
  size: 1000,
  sortDirection: 'asc',
});
      } else {
      
        res = await AxiosFunc.Get(EP.GET_ALL(incomeHeadId));
      }

      if (!res?.data || res.data?.status !== 200)
        return [];

      return extractList(res);
    } catch (err: any) {
      console.error(' getAll error:', err.message);
      return [];
    }
  },

  create: async (payload: IncomeGroupPayload): Promise<IncomeGroup> => {
    try {
      const res = await AxiosFunc.Post(EP.CREATE, payload);
      if (!res?.data || res.data?.status !== 200)
        throw new Error(res?.data?.message || 'Create failed');
      const d = res.data?.data;
      return {
        id: d?.incomeGroupId?.toString() || `tmp-${Date.now()}`,
        groupName: payload.groupName,
      };
    } catch (err: any) {
      console.error(' create error:', err.message);
      throw err;
    }
  },

  update: async (incomeGroupId: string, payload: IncomeGroupPayload): Promise<IncomeGroup> => {
    try {
      const res = await AxiosFunc.Put(EP.UPDATE(incomeGroupId), payload);
      if (!res?.data || res.data?.status !== 200)
        throw new Error(res?.data?.message || 'Update failed');
      return { id: incomeGroupId, groupName: payload.groupName };
    } catch (err: any) {
      console.error('update error:', err.message);
      throw err;
    }
  },

  delete: async (incomeGroupId: string): Promise<void> => {
    try {
      const res = await AxiosFunc.Delete(EP.DELETE(incomeGroupId));
      if (res.data?.status === 200) return;
      throw new Error(res.data?.message || 'Delete failed');
    } catch (err: any) {
      if (err.response?.status === 500) return;
      console.error(' delete error:', err.message);
      throw new Error(err.response?.data?.message || err.message || 'Delete failed');
    }
  },

  getStats: async (incomeHeadId: number): Promise<IncomeGroupStats[]> => {
    const groups = await incomeGroupService.getAll(incomeHeadId);
    return [{
      title: 'Total Income Groups',
      value: groups.length.toString(),
      change: '',
      icon: 'Package',
    }];
  },
};