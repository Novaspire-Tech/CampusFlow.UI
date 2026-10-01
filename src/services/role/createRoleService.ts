import AxiosFunc from '../../utils/axios';
import type { Role, RoleFormData, RoleStats } from '../../types/role/createRole';


const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

const ROLE_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/{roleId}/getAll',
  GET_ALL_SCHOOL: '/school-group/{schoolGroupCode}/school/role/getAll',
  CREATE: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/create',
  UPDATE: (roleId: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/role/${roleId}/update`,
  DELETE: (roleId: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/role/${roleId}/delete`,
  GET_SINGLE: (roleId: string) => `/school-group/{schoolGroupCode}/school/{schoolCode}/role/${roleId}/get`,
  ASSIGN_TO_STAFF: (roleId: string, staffCode: string) =>
    `/school-group/{schoolGroupCode}/school/{schoolCode}/role/${roleId}/assign/staff/${staffCode}`,
  GET_TITLES: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/titles',
  GET_SCOPES: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/scopes',
  GET_OPERATIONS: '/school-group/{schoolGroupCode}/school/{schoolCode}/role/operations',
};

const USER_ENDPOINTS = {
  GET_ALL: '/school-group/{schoolGroupCode}/school/{schoolCode}/user/getAll',
  FILTER: '/school-group/{schoolGroupCode}/school/{schoolCode}/user/filter',
};

export interface User {
  userId: string | number;
  name?: string;
  phoneNumber?: string;
  email?: string | null;
  roleName?: string | null;
  staffCode?: string | null;
  [key: string]: any;
}

export interface PaginatedUsers {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  users: User[];
}

export interface UserFilterParams {
  roleTitle?: string;
  search?: string;
  page?: number;
  size?: number;
  sortDirection?: 'asc' | 'desc';
}

const DEFAULT_ZERO_STATS: RoleStats[] = [
  { title: "Total Roles", value: "0", change: "+0%", icon: "Shield" },
  { title: "Active Roles", value: "0", change: "+0%", icon: "CheckCircle" },
  { title: "Custom Roles", value: "0", change: "+0%", icon: "Settings" },
];

const transformBackendToFrontend = (backendData: any): Role => {
  const roleId = backendData.roleId || backendData.id;
  if (!roleId) console.error('Missing role ID in backend data:', backendData);
  return {
    roleId: roleId?.toString() || `temp-${Date.now()}-${Math.random()}`,
    name: backendData.name || '',
    description: backendData.description || '',
    title: backendData.title || '',
    crudPermissions: backendData.crudPermissions?.map((perm: any) => ({
      scope: perm.scope || '',
      operations: perm.operations || [],
    })) || [],
  };
};

const transformFrontendToBackend = (frontendData: RoleFormData): any => ({
  name: frontendData.name,
  description: frontendData.description,
  title: frontendData.title,
  crudPermissions: frontendData.crudPermissions,
});

export const roleService = {

 getAll: async (): Promise<Role[]> => {
  try {
    let response;

    if (isAllSchools()) {
      response = await AxiosFunc.Get((ROLE_ENDPOINTS.GET_ALL_SCHOOL), {
        page: 0,
        size: 100,
        sortDirection: 'asc',
      });
    } else {
      response = await AxiosFunc.Get((ROLE_ENDPOINTS.GET_ALL), {
        page: 0,
        size: 100,
        sortDirection: 'asc',
      });
    }

    if (response.data?.status !== 200)
      throw new Error(response.data?.message || 'Failed to fetch roles');

    const roles = response.data?.data || [];

    return roles
      .filter((role: any) => role.roleId || role.id)
      .map(transformBackendToFrontend);
  } catch (error: any) {
    console.error('Error fetching roles:', error);
    return [];
  }
},

  getSingle: async (roleId: string): Promise<Role | null> => {
    try {
      const response = await AxiosFunc.Get((ROLE_ENDPOINTS.GET_SINGLE(roleId)));
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to fetch role');
      return transformBackendToFrontend(response.data?.data);
    } catch (error: any) {
      console.error('Error fetching role:', error);
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch role'
      );
    }
  },

  create: async (data: RoleFormData): Promise<Role> => {
    try {
      const response = await AxiosFunc.Post(
       (ROLE_ENDPOINTS.CREATE),
        transformFrontendToBackend(data)
      );
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to create role');
      const createdData = response.data?.data;
      if (!createdData)
        return {
          roleId: 'temp-' + Date.now(),
          name: data.name,
          description: data.description,
          title: data.title,
          crudPermissions: data.crudPermissions,
        };
      return transformBackendToFrontend(createdData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to create role'
      );
    }
  },

  update: async (roleId: string, data: RoleFormData): Promise<Role> => {
    try {
      const response = await AxiosFunc.Put(
       (ROLE_ENDPOINTS.UPDATE(roleId)),
        transformFrontendToBackend(data)
      );
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to update role');
      const updatedData = response.data?.data;
      if (!updatedData)
        return {
          roleId,
          name: data.name,
          description: data.description,
          title: data.title,
          crudPermissions: data.crudPermissions,
        };
      return transformBackendToFrontend(updatedData);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to update role'
      );
    }
  },

  delete: async (roleId: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete((ROLE_ENDPOINTS.DELETE(roleId)));
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to delete role');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to delete role'
      );
    }
  },

  assignToStaff: async (roleId: string, staffCode: string): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(
        (ROLE_ENDPOINTS.ASSIGN_TO_STAFF(roleId, staffCode)),
        {}
      );
      if (response.data?.status !== 200)
        throw new Error(response.data?.message || 'Failed to assign role to staff');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to assign role to staff'
      );
    }
  },

  getTitles: async (): Promise<string[]> => {
    try {
      const response = await AxiosFunc.Get((ROLE_ENDPOINTS.GET_TITLES));
      if (response.data?.status !== 200) throw new Error('Failed to fetch role titles');
      return response.data?.data || [];
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  getScopes: async (): Promise<string[]> => {
    try {
      const response = await AxiosFunc.Get((ROLE_ENDPOINTS.GET_SCOPES));
      if (response.data?.status !== 200) throw new Error('Failed to fetch role scopes');
      return response.data?.data || [];
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  getOperations: async (): Promise<string[]> => {
    try {
      const response = await AxiosFunc.Get((ROLE_ENDPOINTS.GET_OPERATIONS));
      if (response.data?.status !== 200) throw new Error('Failed to fetch role operations');
      return response.data?.data || [];
    } catch (error: any) {
      console.error(error);
      return [];
    }
  },

  getStats: async (): Promise<RoleStats[]> => {
    try {
      const roles = await roleService.getAll();
      return [
        { title: "Total Roles", value: roles.length.toString(), change: "+0%", icon: "Shield" },
        { title: "Active Roles", value: roles.length.toString(), change: "+0%", icon: "CheckCircle" },
        { title: "Custom Roles", value: roles.length.toString(), change: "+0%", icon: "Settings" },
      ];
    } catch (error: any) {
      console.error(error);
      return DEFAULT_ZERO_STATS;
    }
  },
};

export const userService = {

  getAll: async (): Promise<User[]> => {
    try {
      const first = await AxiosFunc.Get((USER_ENDPOINTS.GET_ALL), {
        page: 0, size: 10, sortDirection: 'asc',
      });
      if (first.data?.status !== 200)
        throw new Error(first.data?.message || 'Failed to fetch users');

      const firstData = first.data?.data;
      const firstUsers: User[] = firstData?.users ?? [];
      const totalItems: number = firstData?.totalItems ?? firstUsers.length;

      if (totalItems <= 10) return firstUsers;

      const totalPages = Math.ceil(totalItems / 10);
      const allUsers: User[] = [...firstUsers];

      const results = await Promise.allSettled(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 1).map((page) =>
          AxiosFunc.Get((USER_ENDPOINTS.GET_ALL), {
            page, size: 10, sortDirection: 'asc',
          })
        )
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data?.status === 200)
          allUsers.push(...(result.value.data?.data?.users ?? []));
      });

      return allUsers;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      return [];
    }
  },

  filterUsers: async (params: UserFilterParams = {}): Promise<User[]> => {
    try {
      const {
        roleTitle,
        search,
        page = 0,
        size = 10,
        sortDirection = 'asc',
      } = params;

      const queryString = `?page=${page}&size=${size}&sortDirection=${sortDirection}`;

      const body: Record<string, any> = {};
      if (roleTitle?.trim()) body.roleTitle = roleTitle.trim();
      if (search?.trim()) body.search = search.trim();

      const url = (USER_ENDPOINTS.FILTER) + queryString;

      const first = await AxiosFunc.Post(url, body);

      if (first.data?.status !== 200)
        throw new Error(first.data?.message || 'Failed to filter users');

      const firstData = first.data?.data;
      const firstUsers: User[] = firstData?.users ?? [];
      const totalItems: number = firstData?.totalItems ?? firstUsers.length;

      if (totalItems <= size) return firstUsers;

      const totalPages = Math.ceil(totalItems / size);
      const allUsers: User[] = [...firstUsers];

      const results = await Promise.allSettled(
        Array.from({ length: totalPages - 1 }, (_, i) => i + 1).map((p) => {
          const pagedUrl =
            (USER_ENDPOINTS.FILTER) +
            `?page=${p}&size=${size}&sortDirection=${sortDirection}`;
          return AxiosFunc.Post(pagedUrl, body);
        })
      );

      results.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.data?.status === 200)
          allUsers.push(...(result.value.data?.data?.users ?? []));
      });

      return allUsers;
    } catch (error: any) {
      console.error('Error filtering users:', error);
      return [];
    }
  },
};