import { useQuery } from '@tanstack/react-query';
import { userService } from '../../../services/role/userService';
import type { FilterUsersDto } from '../../../types/role/user';

export const userKeys = {
  all: ['users'] as const,
  filtered: (dto: FilterUsersDto, page: number, size: number, sortBy?: string, sortDirection?: string) =>
    ['users', 'filter', dto, page, size, sortBy, sortDirection] as const,
};

interface UseFilterUsersParams {
  dto: FilterUsersDto;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  enabled?: boolean;
}

export const useFilterUsers = ({
  dto,
  page = 0,
  size = 10,
  sortBy,
  sortDirection = 'asc',
  enabled = true,
}: UseFilterUsersParams) => {
  return useQuery({
    queryKey: userKeys.filtered(dto, page, size, sortBy, sortDirection),
    queryFn: () => userService.filterUsers(dto, page, size, sortBy, sortDirection),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    enabled,
  });
};