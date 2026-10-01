import { useState, useEffect, useMemo, useCallback } from "react";
import { useStudents } from "../../queries/studentInformation/useStudents";
import { attendanceService } from "../../../services/attendence/attendanceservice";
import type {
  StudentAttendanceStatus,
  AttendanceRecord,
  BulkAttendanceDto,
} from "../../../types/attendence/attendancetypes";
import { toast } from "react-toastify";

export interface StudentForAttendance {
  id: number;
  studentId: number;
  studentAttendanceId?: number;
  studentName: string;
  rollNo: string;
  admissionNo: string;
  className: string;
  classId: number;
  sectionName: string;
  sectionId: number;
  attendance: StudentAttendanceStatus | "";
  note: string;
}

interface SearchFormData {
  classId: number | "";
  sectionId: number | "";
  attendanceDate: string;
}

interface UseStudentAttendanceOptions {
  page?: number;
  size?: number;
  autoLoadStudents?: boolean;
}

export const useStudentAttendance = (
  options: UseStudentAttendanceOptions = {}
) => {
  const { page = 0, size = 1000000, autoLoadStudents = true } = options;

  const { data: studentsResponse, isLoading: isLoadingStudents } = useStudents(
    page,
    size,
    "asc"
  );

  const [allStudents, setAllStudents] = useState<StudentForAttendance[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentForAttendance[]>([]);
  const [attendanceData, setAttendanceData] = useState<StudentForAttendance[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<SearchFormData>({
    classId: "",
    sectionId: "",
    attendanceDate: "",
  });

  useEffect(() => {
    if (autoLoadStudents && studentsResponse?.students) {
      const transformedStudents: StudentForAttendance[] = studentsResponse.students.map(
        (student: any) => ({
          id: student.studentId,
          studentId: student.studentId,
          studentName: `${student.firstName || ""} ${student.middleName ? student.middleName + " " : ""}${student.lastName || ""}`.trim(),
          rollNo: student.rollNo || "",
          admissionNo: student.admissionNo || "",
          className: student.className || "",
          classId: student.classId,
          sectionName: student.sectionName || "",
          sectionId: student.sectionId,
          attendance: "",
          note: "",
        })
      );
      setAllStudents(transformedStudents);
      setFilteredStudents(transformedStudents);
    }
  }, [studentsResponse, autoLoadStudents]);

  const availableClasses = useMemo(() => {
    const uniqueClasses = Array.from(
      new Map(
        allStudents.map((s) => [s.classId, { id: s.classId, name: s.className }])
      ).values()
    ).filter((c) => c.id && c.name);
    return uniqueClasses.sort((a, b) => a.name.localeCompare(b.name));
  }, [allStudents]);

  const availableSections = useMemo(() => {
    const studentsInClass = selectedFilters.classId
      ? allStudents.filter((s) => s.classId === selectedFilters.classId)
      : allStudents;
    const uniqueSections = Array.from(
      new Map(
        studentsInClass.map((s) => [
          s.sectionId,
          { id: s.sectionId, name: s.sectionName },
        ])
      ).values()
    ).filter((s) => s.id && s.name);
    return uniqueSections.sort((a, b) => a.name.localeCompare(b.name));
  }, [allStudents, selectedFilters.classId]);

  const searchStudents = useCallback(
    async (filters: SearchFormData) => {
      try {
        if (!filters.classId || !filters.sectionId || !filters.attendanceDate) {
          toast.error("Please fill in all fields (Class, Section, and Date)");
          setShowTable(false);
          return [];
        }

        const filtered = allStudents.filter(
          (student) =>
            student.classId === filters.classId &&
            student.sectionId === filters.sectionId
        );

        if (filtered.length === 0) {
          toast.warning("No students found for the selected class and section");
          setShowTable(false);
          return [];
        }

        try {
          const existingAttendance = await attendanceService.getByClassSectionAndDate(
            Number(filters.classId),
            Number(filters.sectionId),
            filters.attendanceDate
          );

          const studentsWithAttendance = filtered.map((student) => {
            const existing = existingAttendance.find(
              (att) => att.studentId === student.studentId
            );
            return {
              ...student,
              studentAttendanceId: existing?.studentAttendanceId,
              attendance: existing?.attendance || ("" as StudentAttendanceStatus | ""),
              note: existing?.note || "",
            };
          });

          setAttendanceData(studentsWithAttendance);
          setSelectedFilters(filters);
          setShowTable(true);

          if (existingAttendance.length > 0) {
            const hasPartialAttendance = existingAttendance.length < filtered.length;
            if (hasPartialAttendance) {
              toast.info(
                `Found attendance for ${existingAttendance.length} of ${filtered.length} students. You can add missing attendance or update existing ones.`,
                { autoClose: 5000 }
              );
            } else {
              toast.info(
                `All ${existingAttendance.length} students have attendance records. You can update them if needed.`,
                { autoClose: 4000 }
              );
            }
          } else {
            toast.success(`Loaded ${filtered.length} students. Please mark attendance.`, {
              autoClose: 3000
            });
          }

          return studentsWithAttendance;
        } catch (error: any) {
          const studentsWithEmptyAttendance = filtered.map((student) => ({
            ...student,
            studentAttendanceId: undefined,
            attendance: "" as StudentAttendanceStatus | "",
            note: "",
          }));
          setAttendanceData(studentsWithEmptyAttendance);
          setSelectedFilters(filters);
          setShowTable(true);
          toast.success(`Loaded ${filtered.length} students. Please mark attendance.`, {
            autoClose: 3000
          });
          return studentsWithEmptyAttendance;
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load students");
        setShowTable(false);
        return [];
      }
    },
    [allStudents]
  );

  const handleAttendanceChange = useCallback(
    (studentId: number, value: StudentAttendanceStatus) => {
      const updatedData = attendanceData.map((student) =>
        student.studentId === studentId
          ? { ...student, attendance: value }
          : student
      );
      setAttendanceData(updatedData);
    },
    [attendanceData]
  );

  const handleNoteChange = useCallback(
    (studentId: number, note: string) => {
      const updatedData = attendanceData.map((student) =>
        student.studentId === studentId ? { ...student, note } : student
      );
      setAttendanceData(updatedData);
    },
    [attendanceData]
  );

  const setAttendanceForAll = useCallback(
    (value: StudentAttendanceStatus) => {
      const updatedData = attendanceData.map((student) => ({
        ...student,
        attendance: value,
      }));
      setAttendanceData(updatedData);
      toast.info(`Attendance set to "${value}" for all ${attendanceData.length} students`, {
        autoClose: 3000
      });
    },
    [attendanceData]
  );

  // Helper to extract the most meaningful error message from an API error
  const extractErrorMessage = (error: any, fallback: string): string => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.response?.data ||
      error?.message ||
      fallback
    );
  };

  const saveAttendance = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const unmarked = attendanceData.filter((s) => !s.attendance);
      if (unmarked.length > 0) {
        toast.error(
          `Please mark attendance for all students. ${unmarked.length} student(s) unmarked.`,
          { autoClose: 5000 }
        );
        setIsSubmitting(false);
        return false;
      }

      const studentsToCreate = attendanceData.filter((s) => !s.studentAttendanceId);
      const studentsToUpdate = attendanceData.filter((s) => s.studentAttendanceId);

      let createSuccessCount = 0;
      let updateSuccessCount = 0;

      // CREATE
      if (studentsToCreate.length > 0) {
        try {
          const attendanceRecords: AttendanceRecord[] = studentsToCreate.map(
            (student) => ({
              studentId: student.studentId,
              attendance: student.attendance as StudentAttendanceStatus,
              note: student.note || "",
            })
          );
          const bulkData: BulkAttendanceDto = {
            attendanceDate: selectedFilters.attendanceDate,
            classId: Number(selectedFilters.classId),
            sectionId: Number(selectedFilters.sectionId),
            attendanceRecords,
          };
          const createResponse = await attendanceService.addBulk(bulkData);
          createSuccessCount = createResponse.length;
        } catch (error: any) {
          const msg = extractErrorMessage(error, "Failed to create attendance records");
          toast.error(msg, { autoClose: 6000 });
          setIsSubmitting(false);
          return false;
        }
      }

      // UPDATE
      if (studentsToUpdate.length > 0) {
        try {
          const recordsToUpdate = studentsToUpdate.map((student) => ({
            id: student.studentAttendanceId!,
            data: {
              studentId: student.studentId,
              attendance: student.attendance as StudentAttendanceStatus,
              note: student.note || "",
              attendanceDate: selectedFilters.attendanceDate,
              studentName: student.studentName,
              admissionNo: student.admissionNo,
              rollNo: student.rollNo,
              classId: student.classId,
              className: student.className,
              sectionId: student.sectionId,
              sectionName: student.sectionName,
            },
          }));
          const updateResponse = await attendanceService.updateBulk(recordsToUpdate);
          updateSuccessCount = updateResponse.length;
        } catch (error: any) {
          const msg = extractErrorMessage(error, "Failed to update attendance records");
          if (createSuccessCount === 0) {
            toast.error(msg, { autoClose: 6000 });
            setIsSubmitting(false);
            return false;
          } else {
            toast.warning(
              `Created ${createSuccessCount} records but failed to update: ${msg}`,
              { autoClose: 6000 }
            );
          }
        }
      }

      if (createSuccessCount > 0 && updateSuccessCount > 0) {
        toast.success(
          `Successfully created ${createSuccessCount} and updated ${updateSuccessCount} attendance records!`,
          { autoClose: 4000 }
        );
      } else if (createSuccessCount > 0) {
        toast.success(
          `Attendance saved successfully for ${createSuccessCount} student(s)!`,
          { autoClose: 3000 }
        );
      } else if (updateSuccessCount > 0) {
        toast.success(
          `Attendance updated successfully for ${updateSuccessCount} student(s)!`,
          { autoClose: 3000 }
        );
      }

      await searchStudents(selectedFilters);
      setIsSubmitting(false);
      return true;
    } catch (error: any) {
      const msg = extractErrorMessage(error, "Failed to save attendance. Please try again.");
      toast.error(msg, { autoClose: 6000 });
      setIsSubmitting(false);
      return false;
    }
  }, [attendanceData, selectedFilters, searchStudents]);

  const updateAttendance = useCallback(
    async () => {
      return await saveAttendance();
    },
    [saveAttendance]
  );

  const resetForm = useCallback(() => {
    setShowTable(false);
    setAttendanceData([]);
    setSelectedFilters({
      classId: "",
      sectionId: "",
      attendanceDate: "",
    });
    toast.info("Form has been reset", { autoClose: 2000 });
  }, []);

  return {
    allStudents,
    filteredStudents,
    attendanceData,
    availableClasses,
    availableSections,
    selectedFilters,
    showTable,
    isLoading: isLoadingStudents,
    isSubmitting,
    searchStudents,
    handleAttendanceChange,
    handleNoteChange,
    setAttendanceForAll,
    saveAttendance,
    updateAttendance,
    resetForm,
    totalStudents: allStudents.length,
    totalLoaded: studentsResponse?.students?.length || 0,
    totalAvailable: studentsResponse?.totalItems || 0,
    studentsInTable: attendanceData.length,
  };
};