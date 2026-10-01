import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incomeGroupService } from '../../../services/income/incomeGroupService';
import type { IncomeGroup, IncomeGroupPayload } from '../../../types/income/incomeGroup';

const isAllSchools = (): boolean =>
  localStorage.getItem('isAllSchools') === 'true';

export const incomeGroupKeys = {
  all: ['incomeGroups'] as const,
  byHead: (headId: number, allSchools: boolean) =>
    ['incomeGroups', 'head', headId, allSchools] as const,
};

export const useIncomeGroups = (incomeHeadId: number) =>
  useQuery({
    queryKey: incomeGroupKeys.byHead(incomeHeadId, isAllSchools()),
    queryFn: () => incomeGroupService.getAll(incomeHeadId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: incomeHeadId > 0,
    retry: 1,
  });

export const useAddIncomeGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: IncomeGroupPayload) => incomeGroupService.create(payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({
        queryKey: incomeGroupKeys.byHead(vars.incomeHeadId, isAllSchools()),
      });
    },
  });
};

export const useUpdateIncomeGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      incomeGroupId,
      payload,
    }: {
      incomeGroupId: string;
      payload: IncomeGroupPayload;
    }) => incomeGroupService.update(incomeGroupId, payload),

    onMutate: async ({ incomeGroupId, payload }) => {
      const key = incomeGroupKeys.byHead(payload.incomeHeadId, isAllSchools());
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<IncomeGroup[]>(key);

      if (prev) {
        qc.setQueryData<IncomeGroup[]>(
          key,
          prev.map((g) =>
            g.id === incomeGroupId ? { ...g, groupName: payload.groupName } : g
          )
        );
      }
      return { prev, key };
    },

    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },

    onSettled: (_, __, vars) => {
      // FIXED: pass isAllSchools() to key
      qc.invalidateQueries({
        queryKey: incomeGroupKeys.byHead(vars.payload.incomeHeadId, isAllSchools()),
      });
    },
  });
};

export const useDeleteIncomeGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ incomeGroupId }: { incomeGroupId: string; incomeHeadId: number }) =>
      incomeGroupService.delete(incomeGroupId),

    onMutate: async ({ incomeGroupId, incomeHeadId }) => {
      // FIXED: pass isAllSchools() to key
      const key = incomeGroupKeys.byHead(incomeHeadId, isAllSchools());
      await qc.cancelQueries({ queryKey: key });
      const prev = qc.getQueryData<IncomeGroup[]>(key);
      if (prev) {
        qc.setQueryData<IncomeGroup[]>(
          key,
          prev.filter((g) => g.id !== incomeGroupId)
        );
      }
      return { prev, key };
    },

    onError: (_, __, ctx) => {
      if (ctx?.prev) qc.setQueryData(ctx.key, ctx.prev);
    },

    onSettled: (_, __, vars) => {
      // FIXED: pass isAllSchools() to key
      qc.invalidateQueries({
        queryKey: incomeGroupKeys.byHead(vars.incomeHeadId, isAllSchools()),
      });
    },
  });
};