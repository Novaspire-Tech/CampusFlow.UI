import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  AllUserLogPageResponse,
  AllUserLogFilterOptions,
  FilterAllUserLogsDto,
  AllUserLogQueryParams,
} from "../../../types/systemSettinds/allUserLog";

const buildQueryString = (params: AllUserLogQueryParams) =>
  new URLSearchParams({
    page:          String(params.page),
    size:          String(params.size),
    sortDirection: params.sortDirection ?? "asc",
  }).toString();

export const useAllUserLogs = (params: AllUserLogQueryParams) =>
  useQuery<AllUserLogPageResponse>({
    queryKey: ["allUserLogs", params],
    queryFn: async () => {
      const { data } = await axios.get<AllUserLogPageResponse>(
        `/api/audit-logs/all?${buildQueryString(params)}`
      );
      return data;
    },
  });

export const useFilterAllUserLogs = (
  dto: FilterAllUserLogsDto,
  params: AllUserLogQueryParams,
  enabled: boolean
) =>
  useQuery<AllUserLogPageResponse>({
    queryKey: ["allUserLogsFiltered", dto, params],
    queryFn: async () => {
      const { data } = await axios.post<AllUserLogPageResponse>(
        `/api/audit-logs/filter?${buildQueryString(params)}`,
        dto
      );
      return data;
    },
    enabled,
  });

export const useAllUserLogFilterOptions = () =>
  useQuery<AllUserLogFilterOptions>({
    queryKey: ["allUserLogFilterOptions"],
    queryFn: async () => {
      const { data } = await axios.get<AllUserLogFilterOptions>(
        "/api/audit-logs/filter-options"
      );
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });