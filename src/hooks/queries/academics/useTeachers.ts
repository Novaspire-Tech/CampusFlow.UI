import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherService } from "../../../services/academics/teacherService";
import type { Teacher, TeacherFormData } from "../../../types/academics/teacher";

// Get school code from localStorage
const getSchoolCode = (): string => {
  return localStorage.getItem("schoolCode") || "";
};

// Fetch all teachers with pagination
export const useTeachers = (page = 0, size = 100, sortDirection = "asc") => {
  const schoolCode = getSchoolCode();

  return useQuery<Teacher[], Error>({
    queryKey: ["teachers", schoolCode, page, size, sortDirection],
    queryFn: () => teacherService.getAll(page, size, sortDirection),
    enabled: !!schoolCode,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch teacher by ID
export const useTeacher = (teacherId: string) => {
  const schoolCode = getSchoolCode();

  return useQuery<Teacher | null, Error>({
    queryKey: ["teacher", schoolCode, teacherId],
    queryFn: () => teacherService.getById(teacherId),
    enabled: !!schoolCode && !!teacherId,
  });
};

// Fetch teacher by name
export const useTeacherByName = (name: string) => {
  const schoolCode = getSchoolCode();

  return useQuery<Teacher | null, Error>({
    queryKey: ["teacher-name", schoolCode, name],
    queryFn: () => teacherService.getByName(name),
    enabled: !!schoolCode && !!name,
  });
};

// Fetch teacher by teacher code
export const useTeacherByCode = (teacherCode: string) => {
  const schoolCode = getSchoolCode();

  return useQuery<Teacher | null, Error>({
    queryKey: ["teacher-code", schoolCode, teacherCode],
    queryFn: () => teacherService.getByCode(teacherCode),
    enabled: !!schoolCode && !!teacherCode,
  });
};

// Add teacher mutation
export const useAddTeacher = () => {
  const queryClient = useQueryClient();
  const schoolCode = getSchoolCode();

  return useMutation<Teacher | null, Error, TeacherFormData>({
    mutationFn: (data: TeacherFormData) => teacherService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers", schoolCode] });
    },
  });
};

// Update teacher mutation
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();
  const schoolCode = getSchoolCode();

  return useMutation<Teacher | null, Error, { teacherId: string; data: TeacherFormData }>({
    mutationFn: ({ teacherId, data }) => teacherService.update(teacherId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["teachers", schoolCode] });
      queryClient.invalidateQueries({ 
        queryKey: ["teacher", schoolCode, variables.teacherId] 
      });
    },
  });
};

// Delete teacher mutation
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();
  const schoolCode = getSchoolCode();

  return useMutation<void, Error, string>({
    mutationFn: (teacherId: string) => teacherService.delete(teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers", schoolCode] });
    },
  });
};

// Delete multiple teachers mutation
export const useDeleteMultipleTeachers = () => {
  const queryClient = useQueryClient();
  const schoolCode = getSchoolCode();

  return useMutation<void, Error, string[]>({
    mutationFn: (teacherIds: string[]) => teacherService.deleteMultiple(teacherIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers", schoolCode] });
    },
  });
};