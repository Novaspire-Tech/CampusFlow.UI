// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { staffAttendanceService } from '../../../services/hr/';
// import type { StaffAttendance} from '../../../types/humanResource/staffAttendance';

// export const StaffAttendaceKeys = {
//   all: ['staffAttendance'] as const,
//   detail: (id: string) => ['staffAttendance', id] as const,
//   stats: ['staffAttendance', 'stats'] as const,
// };

// export const useStaffAttendances = () => {
//   return useQuery({
//     queryKey: StaffAttendaceKeys.all,
//     queryFn: staffAttendanceService.getAll,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// export const useStaffAttendance = (id: string | undefined) => {
//   return useQuery({
//     queryKey: id ? StaffAttendaceKeys.detail(id) : ['staffAttendance', 'empty'],
//     queryFn: () => (id ? staffAttendanceService.getById(id) : null),
//     enabled: !!id,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// export const useStaffAttendancestats = () => {
//   return useQuery({
//     queryKey: StaffAttendaceKeys.stats,
//     queryFn: staffAttendanceService.getStats,
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   });
// };

// // Mutations
// export const useAddStaffAttendance = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: Omit<StaffAttendance, 'id' | 'createdDate'>) => staffAttendanceService.create(data),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.all });
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.stats });
//     },
//   });
// };

// export const useUpdateStaffAttendance = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, data }: { id: string; data: StaffAttendance }) => staffAttendanceService.update(id, data),
//     onSuccess: (_data, variables) => {
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.all });
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.detail(variables.id) });
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.stats });
//     },
//   });
// };

// export const useDeleteStaffAttendance = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: staffAttendanceService.delete,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.all });
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.stats });
//     },
//   });
// };

// export const useDeleteMultipleStaffAttendances = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: staffAttendanceService.deleteMultiple,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.all });
//       queryClient.invalidateQueries({ queryKey: StaffAttendaceKeys.stats });
//     },
//   });
// };
