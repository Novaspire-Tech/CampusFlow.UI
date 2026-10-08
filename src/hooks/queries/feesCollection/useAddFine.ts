import { useState, useEffect, useMemo, useCallback } from "react";
import { useFeeTypes } from "../../../hooks/queries/feesCollection/useFeeTypes";
import {
  fineTransactionService,
  studentFilterService,
} from "../../../services/feesCollection/fineTransactionService";
import type {
  StudentData,
  SearchFormData,
  FineFormData,
  FineTransactionCreateRequest,
  ModalState,
  RawStudentRecord,
  FilterStudentDto,
} from "../../../types/feesCollection/addFineType";
import { toast } from "react-toastify";

//  Options
interface UseAddFineOptions {
  page?: number;
  size?: number;
  autoLoadStudents?: boolean;
  showOnlyWithFees?: boolean;
}

//  Helpers
const formatDate = (): string => {
  const now = new Date();
  return `${String(now.getDate()).padStart(2, "0")}/${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}/${now.getFullYear()}`;
};

function transformStudent(raw: RawStudentRecord): StudentData {
  return {
    id: raw.studentId,
    studentId: raw.studentId,
    class: raw.className || "",
    classId: raw.classId,
    section: raw.sectionName || "",
    sectionId: raw.sectionId,
    admissionNo: raw.admissionNo || "",
    studentName: `${raw.firstName || ""} ${raw.lastName || ""}`.trim(),
    rollNo: raw.rollNo || "",
    email: raw.email,
    phoneNumber: raw.phoneNumber,
    feeType: "",
    fine: 0,
    reason: "",
    feesId: raw.feesList?.find((f) => f.feesId != null)?.feesId,
    feesList: (raw.feesList || []).map((f) => ({
      ...f,
      fine: Number(f.fine ?? 0),
    })),
  };
}

function applyLocalFilters(
  list: StudentData[],
  f: SearchFormData,
): StudentData[] {
  return list.filter((s) => {
    if (f.class && String(s.classId) !== String(f.class)) return false;
    if (f.section && String(s.sectionId) !== String(f.section)) return false;
    if (f.rollNo && !s.rollNo.toLowerCase().includes(f.rollNo.toLowerCase()))
      return false;
    if (f.search) {
      const q = f.search.toLowerCase();
      const matches =
        s.studentName.toLowerCase().includes(q) ||
        s.admissionNo.toLowerCase().includes(q) ||
        s.rollNo.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });
}

//  Hook
export const useAddFine = (options: UseAddFineOptions = {}) => {
  const {
    page: initialPage = 0,
    size: initialSize = 10,
    autoLoadStudents = true,
    showOnlyWithFees = false,
  } = options;

  const { data: feeTypes, isLoading: isLoadingFeeTypes } = useFeeTypes();

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);

  const [, setActiveFilters] = useState<SearchFormData>({});
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [isBackendFiltering, setIsBackendFiltering] = useState(false);

  const [allStudents, setAllStudents] = useState<StudentData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    selectedStudent: null,
  });

  const applyShowOnlyWithFees = useCallback(
    (list: StudentData[]) =>
      showOnlyWithFees ? list.filter((s) => s.feesId != null) : list,
    [showOnlyWithFees],
  );

  //  Load all students on mount
  const loadAllStudents = useCallback(async () => {
    if (!autoLoadStudents) return;
    setIsLoadingStudents(true);
    try {
      const res = await studentFilterService.getAllPages("asc");
      const transformed = applyShowOnlyWithFees(
        res.students.map(transformStudent),
      );
      setAllStudents(transformed);
      setFilteredStudents(transformed);
    } catch (err) {
      console.error("Failed to load students:", err);
      toast.error("Failed to load students");
    } finally {
      setIsLoadingStudents(false);
    }
  }, [autoLoadStudents, applyShowOnlyWithFees]);

  useEffect(() => {
    if (!isFilterActive) loadAllStudents();
  }, [loadAllStudents, isFilterActive]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(allStudents);
      return;
    }
    const q = searchTerm.toLowerCase();
    setFilteredStudents(
      allStudents.filter((s) =>
        Object.values(s).some((v) => String(v).toLowerCase().includes(q)),
      ),
    );
  }, [searchTerm, allStudents]);

  const totalItems = filteredStudents.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const searchStudents = useCallback(
    async (filters: SearchFormData) => {
      const hasAny = Object.values(filters).some(
        (v) => v !== undefined && v !== null && v !== "",
      );

      if (!hasAny) {
        setActiveFilters({});
        setIsFilterActive(false);
        setPage(0);
        setFilteredStudents(allStudents);
        return;
      }

      setActiveFilters(filters);
      setIsFilterActive(true);
      setIsBackendFiltering(true);
      setPage(0);

      try {
        const filterDto: FilterStudentDto = {};
        if (filters.search?.trim()) filterDto.search = filters.search.trim();
        if (filters.class) filterDto.schoolClassId = Number(filters.class);
        if (filters.section) filterDto.sectionId = Number(filters.section);

        console.log("searchStudents - filterDto:", JSON.stringify(filterDto, null, 2));

        const res = await studentFilterService.filterAllPages(filterDto, "asc");

        let transformed = applyShowOnlyWithFees(
          res.students.map(transformStudent),
        );

        if (filters.rollNo?.trim()) {
          const rq = filters.rollNo.trim().toLowerCase();
          transformed = transformed.filter((s) =>
            s.rollNo.toLowerCase().includes(rq),
          );
        }

        setFilteredStudents(transformed);

        if (transformed.length === 0) {
          toast.warning("No students found matching the search criteria");
        }
      } catch (err: any) {
        console.error("Backend search failed:", err);
        console.warn("Falling back to local filtering");
        const fallback = applyLocalFilters(allStudents, filters);
        setFilteredStudents(fallback);
        if (fallback.length === 0) {
          toast.warning("No students found matching the search criteria");
        }
      } finally {
        setIsBackendFiltering(false);
      }
    },
    [allStudents, applyShowOnlyWithFees],
  );

  const resetSearch = useCallback(() => {
    setActiveFilters({});
    setIsFilterActive(false);
    setIsBackendFiltering(false);
    setFilteredStudents(allStudents);
    setSearchTerm("");
    setPage(0);
  }, [allStudents]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  }, []);

  const openModal = useCallback((student: StudentData) => {
    setModal({ isOpen: true, selectedStudent: student });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, selectedStudent: null });
  }, []);

  const addFine = useCallback(
    async (fineData: FineFormData): Promise<boolean> => {
      if (!modal.selectedStudent) {
        toast.error("No student selected");
        return false;
      }
      if (!modal.selectedStudent.feesId) {
        toast.error("Student doesn't have assigned fees");
        return false;
      }
      if (fineData.amount <= 0) {
        toast.error("Fine amount must be greater than 0");
        return false;
      }

      setIsSubmitting(true);
      try {
        const request: FineTransactionCreateRequest = {
          amount: Number(fineData.amount),
          reason: fineData.reason.trim(),
          date: formatDate(),
          feesId: Number(modal.selectedStudent.feesId),
          studentId: Number(modal.selectedStudent.studentId),
          feeTypeId: Number(fineData.feeTypeId),
        };

        await fineTransactionService.create(request);

        const updater = (prev: StudentData[]) =>
          prev.map((s) =>
            s.id === modal.selectedStudent!.id
              ? {
                  ...s,
                  fine: s.fine + Number(fineData.amount),
                  reason: fineData.reason,
                }
              : s,
          );
        setAllStudents(updater);
        setFilteredStudents(updater);

        toast.success(`Fine of ₹${fineData.amount} added successfully`);
        closeModal();
        return true;
      } catch (err: any) {
        const msg =
          err.response?.data?.message || err.message || "Failed to add fine";
        toast.error(`Error: ${msg}`);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [modal.selectedStudent, closeModal],
  );

  const pagedFilteredStudents = useMemo(() => {
    const start = page * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, page, pageSize]);

  const updateSearchTerm = useCallback(
    (term: string) => setSearchTerm(term),
    [],
  );

  return {
    students: allStudents,
    filteredStudents: pagedFilteredStudents,
    feeTypes: feeTypes || [],


    page,
    pageSize,
    totalItems,
    totalPages,
    isFilterActive,
    isBackendFiltering,
    handlePageChange,
    handlePageSizeChange,

    isLoading: isLoadingStudents || isLoadingFeeTypes || isBackendFiltering,
    isSubmitting,

    modal,
    searchTerm,
    updateSearchTerm,
    searchStudents,
    resetSearch,
    openModal,
    closeModal,
    addFine,
  };
};