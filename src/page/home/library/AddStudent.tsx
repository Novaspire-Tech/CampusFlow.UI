import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm, type SubmitHandler, type Control } from "react-hook-form";
import { Button, Dropdown, TextField } from "../../../components/controlled";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSections } from "../../../hooks/queries/academics/useSections";
import { useStudents } from "../../../hooks/queries/studentInformation/useStudents";
import { studentService } from "../../../services/studentInformation/studentService";
import {
  useCreateAddStudentMember,
  useAddStudentMembers,
  useUpdateAddStudentMember,
  useDeleteAddStudentMember,
  useDeleteMultipleAddStudentMember,
} from "../../../hooks/queries/library/useAddStudent";
import { confirmToast } from "../../../helpers/confirmToast";
import { toast } from "react-toastify";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

interface SearchFormInputs {
  searchClass: string | number;
  searchSection: string | number;
}

interface ModalFormInputs {
  cardNo: string;
}

interface Student {
  id: number | string;
  addStudentMemberId?: string | number;
  cardNo: string;
  admissionNo: string;
  studentName: string;
  class: string;
  classId?: string | number;
  section?: string;
  sectionId?: string | number;
  fatherName: string;
  dob: string;
  gender: string;
  mobile: string;
}

const AddStudent = () => {
  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const {
    control: searchControl,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch: watchSearch,
  } = useForm<SearchFormInputs>({
    defaultValues: { searchClass: "", searchSection: "" },
  });

  const {
    control: modalControl,
    handleSubmit: handleModalSubmit,
    reset: resetModalForm,
    setValue: setModalValue,
  } = useForm<ModalFormInputs>();

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [paginatedStudents, setPaginatedStudents] = useState<Student[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isBackendFiltering, setIsBackendFiltering] = useState(false);
  const [activeClassId, setActiveClassId] = useState("");
  const [activeSectionId, setActiveSectionId] = useState("");
  const [editStudentId, setEditStudentId] = useState<string | number | null>(null);
  const [editData, setEditData] = useState<Partial<Student>>({});
  const [showForm, setShowForm] = useState(false);
  const [tableKey, setTableKey] = useState(0);

  const { data: studentsData, isLoading } = useStudents(0, 100000, "asc");
  const { data: classesData } = useSchoolClasses();
  const {
    data: libraryMembers,
    refetch: refetchMembers,
    isLoading: isLoadingMembers,
  } = useAddStudentMembers();

  const { mutateAsync: createStudentMember, isPending: isCreating } = useCreateAddStudentMember();
  const { mutateAsync: updateStudentMember, isPending: isUpdating } = useUpdateAddStudentMember();
  const { mutateAsync: deleteStudentMember } = useDeleteAddStudentMember();
  const { mutateAsync: deleteMultipleStudentMember } = useDeleteMultipleAddStudentMember();

  const classOptions = useMemo(
    () =>
      classesData?.map((c: any) => ({
        label: c.name || c.className,
        value: c.id,
      })) || [],
    [classesData],
  );

  const selectedClassValue = watchSearch("searchClass");

  const selectedClassId = useMemo(() => {
    if (!selectedClassValue) return 0;
    return Number(selectedClassValue) || 0;
  }, [selectedClassValue]);

  const { data: sectionsData, isLoading: isLoadingSections } = useSections(
    selectedClassId > 0 ? selectedClassId : 0,
  );

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((s: any) => ({
        label: s.name || s.sectionName,
        value: s.id,
      })) || [],
    [sectionsData],
  );

  const buildLibraryCardMap = useCallback(() => {
    const map = new Map<string, any>();
    if (Array.isArray(libraryMembers)) {
      libraryMembers.forEach((member: any) => {
        if (member.studentId) {
          map.set(String(member.studentId), member);
        }
      });
    }
    return map;
  }, [libraryMembers]);

  const mapToStudent = useCallback(
    (s: any, libraryCardMap: Map<string, any>): Student => {
      const member = libraryCardMap.get(String(s.studentId || s.id));
      return {
        id: s.studentId || s.id,
        addStudentMemberId: member?.addStudentMemberId,
        cardNo: member?.libraryCardNo || "",
        admissionNo: s.admissionNo || "",
        studentName: `${s.firstName || ""} ${s.middleName || ""} ${s.lastName || ""}`.trim(),
        class: s.className || "",
        classId: s.classId,
        section: s.sectionName || "",
        sectionId: s.sectionId,
        fatherName: s.fatherName || "N/A",
        dob: s.dob || "",
        gender: s.gender || "",
        mobile: s.phoneNumber || "",
      };
    },
    [],
  );

  useEffect(() => {
    if (!studentsData?.students) return;
    const libraryCardMap = buildLibraryCardMap();
    const mapped = studentsData.students.map((s: any) => mapToStudent(s, libraryCardMap));
    setAllStudents(mapped);

    if (hasSearched && activeClassId) {
      let updated = [...mapped];
      updated = updated.filter((s) => String(s.classId) === String(activeClassId));
      if (activeSectionId) {
        updated = updated.filter((s) => String(s.sectionId) === String(activeSectionId));
      }
      setFilteredStudents(updated);
    }
  }, [studentsData, libraryMembers]);

  useEffect(() => {
    const start = page * pageSize;
    const end = start + pageSize;
    setPaginatedStudents(filteredStudents.slice(start, end));
  }, [filteredStudents, page, pageSize]);

  const onSearch: SubmitHandler<SearchFormInputs> = async (data) => {
    const classId = data.searchClass ? String(data.searchClass) : "";
    const sectionId = data.searchSection ? String(data.searchSection) : "";

    if (!classId) {
      toast.warning("Please select a class first");
      return;
    }

    setIsBackendFiltering(true);
    setHasSearched(true);
    setActiveClassId(classId);
    setActiveSectionId(sectionId);
    setPage(0);

    try {
      const params: any = {};
      if (classId) params.schoolClassId = Number(classId);
      if (sectionId) params.sectionId = Number(sectionId);

      const result = await studentService.search(params, 0, 100000, "admissionNo", "asc");

      if (result.students && result.students.length > 0) {
        const libraryCardMap = buildLibraryCardMap();
        const merged = result.students.map((s: any) => mapToStudent(s, libraryCardMap));
        setFilteredStudents(merged);
      } else {
        let fallback = [...allStudents];
        if (classId) fallback = fallback.filter((s) => String(s.classId) === String(classId));
        if (sectionId) fallback = fallback.filter((s) => String(s.sectionId) === String(sectionId));
        setFilteredStudents(fallback);
      }
    } catch {
      let fallback = [...allStudents];
      if (classId) fallback = fallback.filter((s) => String(s.classId) === String(classId));
      if (sectionId) fallback = fallback.filter((s) => String(s.sectionId) === String(sectionId));
      setFilteredStudents(fallback);
    } finally {
      setIsBackendFiltering(false);
    }
  };

  const handleClearFilters = () => {
    resetSearchForm({ searchClass: "", searchSection: "" });
    setFilteredStudents([]);
    setHasSearched(false);
    setActiveClassId("");
    setActiveSectionId("");
    setPage(0);
  };

  const handleEdit = (id: string | number) => {
    const student =
      filteredStudents.find((s) => String(s.id) === String(id)) ||
      allStudents.find((s) => String(s.id) === String(id));

    if (!student) {
      toast.error("Student not found");
      return;
    }

    setEditStudentId(id);
    setEditData(student);
    setModalValue("cardNo", student.cardNo || "");
    setShowForm(true);
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditStudentId(null);
    setEditData({});
    resetModalForm();
  };

  const handleUpdate: SubmitHandler<ModalFormInputs> = async (formData) => {
    if (!editStudentId || !formData.cardNo) {
      toast.error("Please enter a valid library card number");
      return;
    }

    const existingCard = allStudents.find(
      (s) =>
        String(s.cardNo) === String(formData.cardNo) &&
        String(s.id) !== String(editStudentId),
    );

    if (existingCard) {
      toast.error(`Library card number ${formData.cardNo} already exists`);
      return;
    }

    try {
      if (editData.cardNo && editData.addStudentMemberId) {
        await updateStudentMember({
          id: editData.addStudentMemberId,
          data: {
            studentId: Number(editStudentId),
            libraryCardNo: String(formData.cardNo),
            studentName: ""
          },
        });
        toast.success(`Library card updated for ${editData.studentName || "Student"} successfully!`);
      } else {
        await createStudentMember({
          studentId: Number(editStudentId),
          libraryCardNo: String(formData.cardNo),
          studentName: ""
        });
        toast.success(`Library card added for ${editData.studentName || "Student"} successfully!`);
      }

      await refetchMembers();
      handleCloseModal();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Operation failed. Please try again.";
      toast.error(msg);
    }
  };

  const handleDelete = async (id: string | number) => {
    const student =
      filteredStudents.find((s) => String(s.id) === String(id)) ||
      allStudents.find((s) => String(s.id) === String(id));

    if (!student?.addStudentMemberId) {
      toast.warning("This student doesn't have a library card to delete");
      return;
    }

    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return;

    try {
      await deleteStudentMember(student.addStudentMemberId);
      await refetchMembers();
      toast.success(`Library card deleted for ${student.studentName} successfully!`);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete library card.";
      toast.error(msg);
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const stringIds = ids.map(String);
    const memberIds = filteredStudents
      .filter((s) => stringIds.includes(String(s.id)) && s.addStudentMemberId != null)
      .map((s) => Number(s.addStudentMemberId));

    if (!memberIds.length) {
      toast.warning("Selected students don't have library cards to delete");
      return;
    }

    if (!(await confirmToast(Text.Do_you_want_to_delete_this_entry))) return;

    try {
      await deleteMultipleStudentMember(memberIds);
      await refetchMembers();
      toast.success(
        `${memberIds.length} library card${memberIds.length !== 1 ? "s" : ""} deleted successfully!`,
      );
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete library cards.");
    } finally {
      setTableKey((prev) => prev + 1);
    }
  };

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const columns = [
    { label: Text.Library_Card_No, key: "cardNo" },
    { label: Text.Admission_Number, key: "admissionNo" },
    { label: Text.Student_Name, key: "studentName" },
    { label: Text.Class, key: "class" },
    { label: Text.Father_Name, key: "fatherName" },
    { label: Text.Date_Of_Birth, key: "dob" },
    { label: Text.Gender, key: "gender" },
  ];

  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const isPageLoading = isLoading || isLoadingMembers;

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">{Text.Loading_student_library_data}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      <div className="p-4 bg-gray-100 border-b mb-2">
        <h2 className="text-lg font-medium">
          {Text.Select_Criteria || "Select Criteria"}
        </h2>
      </div>

      <AllSchoolDropdown
        queryKeys={['schoolClasses', 'sections']}
        onSubmit={handleSearchSubmit(onSearch)}
      >
        <div className="p-4 grid sm:grid-cols-2 gap-4">
          <Dropdown
            name="searchClass"
            label={Text.Class || "Class"}
            control={searchControl as Control<SearchFormInputs>}
            required
            options={classOptions}
          />
          <Dropdown
            name="searchSection"
            label={Text.Section}
            control={searchControl as Control<SearchFormInputs>}
            required={false}
            options={
              !selectedClassId
                ? [{ label: "Please select a class first", value: "" }]
                : isLoadingSections
                  ? [{ label: "Loading sections...", value: "" }]
                  : sectionOptions.length === 0
                    ? [{ label: "No sections available", value: "" }]
                    : sectionOptions
            }
          />
        </div>

        <div className="p-4 flex justify-end gap-2">
          {hasSearched && (
            <Button
              name={Text.Clear_Filters}
              icon={<IconField name="FaTimes" size={16} />}
              onClick={handleClearFilters}
              loading={false}
              showAlways={true}
            />
          )}
          <Button
            name={Text.Search }
            icon={<IconField name="FaSearch" />}
            loading={isBackendFiltering}
            showAlways={true}
          />
        </div>
      </AllSchoolDropdown>

      {isBackendFiltering && (
        <div className="mb-3 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
          <IconField name="FaSpinner" size={14} className="animate-spin" />
          <span>{Text.Loading}</span>
        </div>
      )}

      {hasSearched && !isBackendFiltering && (
        <div className="mt-4 p-4 rounded bg-white">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-medium text-gray-700">
              {Text.Student_List || "Student List"}
            </h2>
            <span className="text-sm text-gray-500">
              {Text.Show} {paginatedStudents.length} {Text.of} {filteredStudents.length}{" "}
              {Text.RESULT}
            </span>
          </div>
          <ControlledTable
            key={tableKey}
            columns={columns}
            data={paginatedStudents}
            fullData={filteredStudents}
            onAdd={handleEdit}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            title={Text.Student_List}
            btn={false}
            header={false}
            showSearch={false}
            showSelectAll={true}
            forceShowActions={true}
            enablePermissions={true}
            permissionScope="LIBRARY"
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={filteredStudents.length}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              {editData.cardNo ? Text.Edit_Library_Card : Text.Add_Library_Card}
            </h3>
            <div className="mb-4 bg-gray-50 p-3 rounded">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{Text.Student}:</span> {editData.studentName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">{Text.Class}:</span>{" "}
                {editData.class} - {editData.section}
              </p>
            </div>
            <AllSchoolDropdown onSubmit={handleModalSubmit(handleUpdate)}>
              <TextField
                name="cardNo"
                label={Text.Library_Card_No}
                control={modalControl}
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  name={Text.Cancel}
                  onClick={handleCloseModal}
                  loading={false}
                />
                <Button
                  name={editData.cardNo ? Text.Update : Text.Save}
                  icon={<IconField name="FaSave" />}
                  loading={isCreating || isUpdating}
                  permissionScope="LIBRARY"
                  permissionType={editData.cardNo ? "UPDATE" : "CREATE"}
                  enablePermissions={true}
                />
              </div>
            </AllSchoolDropdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddStudent;