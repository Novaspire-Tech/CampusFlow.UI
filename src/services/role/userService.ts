import AxiosFunc from '../../utils/axios';
import type { FilterUsersDto, FilterUsersResponse } from '../../types/role/user';

const getSchoolCode = (): string =>
  localStorage.getItem('schoolCode') || 'default';

const getSchoolGroupCode = (): string =>
  localStorage.getItem('schoolGroupCode') || 'default';

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const buildUrl = (endpoint: string): string =>
  endpoint
    .replace('{schoolGroupCode}', getSchoolGroupCode())
    .replace('{schoolCode}', getSchoolCode());

const USER_ENDPOINTS = {
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/user/filter',
  FILTER_ALL: '/school-group/{schoolGroupCode}/school/user/filter',
};

export const userService = {
  filterUsers: async (
    dto: FilterUsersDto,
    page: number = 0,
    size: number = 10,
    sortBy?: string,
    sortDirection: 'asc' | 'desc' = 'asc',
  ): Promise<FilterUsersResponse> => {
    try {
      const endpoint = isAllSchools()
        ? USER_ENDPOINTS.FILTER_ALL
        : USER_ENDPOINTS.FILTER;

      const queryParams = new URLSearchParams();
      queryParams.set('page', String(page));
      queryParams.set('size', String(size));
      queryParams.set('sortDirection', sortDirection);
      if (sortBy) queryParams.set('sortBy', sortBy);

      const url = `${buildUrl(endpoint)}?${queryParams.toString()}`;
      const body: Record<string, string> = {};

      if (dto.roleTitle?.trim()) {
        body['roleTitle'] = dto.roleTitle.trim();
      }

      if (dto.search?.trim()) {
        body['search'] = dto.search.trim();
      }

      const response = await AxiosFunc.Post(url, body);
      if (!response?.data) {
        throw new Error('No response received from server');
      }

      if (response.data?.status !== 200) {
        throw new Error(
          response.data?.message ||
          response.data?.error ||
          'Failed to fetch users'
        );
      }

      return response.data.data as FilterUsersResponse;

    } catch (error: any) {
      console.error('Error filtering users:', error);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Failed to fetch users'
      );
    }
  },
}
