import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studentPromotionService } from '../../../services/academics/promoteStudentService';
import type { PromoteStudentRequest } from '../../../types/academics/promoteStudentTypes';

export const studentPromotionKeys = {
  all: ['student-promotion'] as const,
};

export const usePromoteStudents = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PromoteStudentRequest) => 
      studentPromotionService.promoteStudents(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['students'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['student-sessions'] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['fees'] 
      });
      
      console.log(" Student promotion successful, related queries invalidated");
    },
    onError: (error: any) => {
      console.error("Promote students mutation error:", error);
    },
  });
};