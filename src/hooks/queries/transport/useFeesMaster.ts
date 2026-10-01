import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { feesMasterService } from '../../../services/transport/feesMasterService';
import type { TransportFeesMasterDto } from '../../../types/transport/feesMaster';

export const feesMasterKeys = {
  all: ['transportFeesMaster'] as const,
};

// Fetch all fees master configurations (12 months)
export const useFeesMaster = () => {
  return useQuery({
    queryKey: feesMasterKeys.all,
    queryFn: feesMasterService.getAll,
    // Configuration is likely static once set, so can be cached aggressively
    staleTime: 10 * 60 * 1000, 
    gcTime: 15 * 60 * 1000,
  });
};

// Mutation for creating/updating the entire fees master configuration
export const useUpsertFeesMaster = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // The mutation function takes the array of DTOs
    mutationFn: (data: TransportFeesMasterDto[]) => feesMasterService.upsertAll(data),
    onSuccess: () => {
      // Invalidate the cache to re-fetch the new configuration
      queryClient.invalidateQueries({ queryKey: feesMasterKeys.all });
    },
  });
};