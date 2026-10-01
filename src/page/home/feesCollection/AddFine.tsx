import React, { type ChangeEvent, useMemo, useState, useEffect } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import {
  Dropdown,
  AmountField,
  TextField,
} from "../../../components/controlled";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import {
  getPagesDataText,
  getPagesNameText,
} from "../../../helpers/useTranslations";
import { useAddFine } from "../../../hooks/queries/feesCollection/useAddFine";
import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSections } from "../../../hooks/queries/academics/useSections";
import type {
  SearchFormData,
  FineFormData,
  StudentData,
} from "../../../types/feesCollection/addFineType";
import type { FeeType as FeeTypeFromHook } from "../../../types/feesCollection/feeType";
import { toast } from "react-hot-toast";
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

const AddFine: React.FC = () => {
  const {
    control,
    handleSubmit: handleSearchSubmit,
    reset: resetSearchForm,
    watch,
    setValue: setSearchValue,
  } = useForm<FieldValues>({
    defaultValues: {
      class: "",
      section: "",
      search: "",
      rollNo: "",
    },
  });

  const {
    control: fineControl,
    handleSubmit,
    reset: resetFineForm,
    setValue,
  } = useForm<FineFormData>({
    defaultValues: { amount: 0, reason: "", feeTypeId: 0, feeTypeName: "" },
  });

  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const NameText = getPagesNameText(t);

  const { data: classesData } = useSchoolClasses();
  const [selectedClassForSections, setSelectedClassForSections] = useState<number>(0);
  const { data: sectionsData } = useSections(selectedClassForSections);

  const watchClass = watch("class");
  useEffect(() => {
    if (watchClass) {
      setSelectedClassForSections(Number(watchClass));
      setSearchValue("section", ""); 
    } else {
      setSelectedClassForSections(0);
      setSearchValue("section", "");
    }
  }, [watchClass, setSearchValue]);

  const classOptions = useMemo(
    () =>
      classesData?.map((cls: any) => ({
        value: String(cls.id || cls.schoolClassId),
        label: cls.name || cls.className,
      })) || [],
    [classesData],
  );

  const sectionOptions = useMemo(
    () =>
      sectionsData?.map((sec: any) => ({
        value: String(sec.id || sec.sectionId),
        label: sec.name || sec.sectionName,
      })) || [],
    [sectionsData],
  );

  const {
    filteredStudents,
    feeTypes,
    page,
    pageSize,
    totalItems,
    totalPages,
    isBackendFiltering,
    handlePageChange,
    handlePageSizeChange,
    isLoading,
    isSubmitting,
    modal,
    searchTerm,
    updateSearchTerm,
    searchStudents,
    resetSearch,
    openModal,
    closeModal,
    addFine,
  } = useAddFine({
    page: 0,
    size: 10,
    autoLoadStudents: true,
    showOnlyWithFees: false,
  });

  const [applicableFeeTypes, setApplicableFeeTypes] = useState<
    Array<{ label: string; value: string }>
  >([]);

  useEffect(() => {
    if (!modal.isOpen || !modal.selectedStudent?.feesList) {
      setApplicableFeeTypes([]);
      return;
    }

    const options = modal.selectedStudent.feesList
      .map((fee) => {
        const allFeeTypes = feeTypes as unknown as Array<
          FeeTypeFromHook & {
            id?: string | number;
            feeTypeId?: string | number;
          }
        >;
        const ft = allFeeTypes.find((f) => {
          const ftId = Number(f.id || f.feeTypeId);
          const feeId = Number(fee.feeTypeId || fee.feesId);
          return !isNaN(ftId) && !isNaN(feeId) && ftId === feeId;
        });

        if (!ft) return null;

        const label =
          fee.feeTypeName || ft.name || ft.feeTypeName || "Unknown Fee Type";
        const value = fee.feeTypeId
          ? String(fee.feeTypeId)
          : fee.feesId
          ? String(fee.feesId)
          : "";
        return value ? { label, value } : null;
      })
      .filter(Boolean) as Array<{ label: string; value: string }>;

    setApplicableFeeTypes(options);

    if (options.length > 0) {
      setValue("feeTypeId", Number(options[0].value));
      setValue("feeTypeName", options[0].label);
    } else {
      setValue("feeTypeId", 0);
      setValue("feeTypeName", "");
    }
  }, [modal.isOpen, modal.selectedStudent, feeTypes, setValue]);

  const studentsWithStatus = useMemo(
    () =>
      filteredStudents.map((s) => ({
        ...s,
        feeStatus:
          s.feesId || (s.feesList && s.feesList.length > 0)
            ? "Has Fees"
            : "No Fees",
      })),
    [filteredStudents],
  );

  const onSearchSubmit: SubmitHandler<FieldValues> = (data) => {
    const filters: SearchFormData = {};
    if (data.class) filters.class = String(data.class);
    if (data.section) filters.section = String(data.section);
    if (data.search?.trim()) filters.search = data.search.trim();
    if (data.rollNo?.trim()) filters.rollNo = data.rollNo.trim();

    
    searchStudents(filters);
  };

  const handleReset = () => {
    resetSearchForm();
    setSelectedClassForSections(0);
    resetSearch();
  };

  const handleRowClick = (row: StudentData) => {
    const hasFees = row.feesId || (row.feesList && row.feesList.length > 0);
    if (!hasFees) {
      toast.error(
        `Cannot add fine: ${row.studentName} does not have fees assigned.`,
      );
      return;
    }
    openModal(row);
    resetFineForm({ amount: 0, reason: "", feeTypeId: 0, feeTypeName: "" });
  };

  const handleCloseModal = () => {
    closeModal();
    resetFineForm();
    setApplicableFeeTypes([]);
  };

  const onFineSubmit: SubmitHandler<FineFormData> = async (data) => {
    if (!modal.selectedStudent) {
      toast.error("No student selected");
      return;
    }
    const selected = applicableFeeTypes.find(
      (ft) => Number(ft.value) === data.feeTypeId,
    );
    const success = await addFine({
      ...data,
      feeTypeName: selected?.label || "",
    });
    if (success) {
      resetFineForm();
      setApplicableFeeTypes([]);
    }
  };

  const columns = [
    { label: Text.Class || "Class", key: "class" as keyof StudentData },
    { label: Text.Admission_No || "Admission No", key: "admissionNo" as keyof StudentData },
    { label: Text.Student_Name || "Student Name", key: "studentName" as keyof StudentData },
    { label: Text.Roll_Number, key: "rollNo" as keyof StudentData },
    { label: NameText.Section || "Section", key: "section" as keyof StudentData },
    { label: Text.Fee_Status|| "Fee Status", key: "feeStatus" as any },
    { label: Text.Fine, key: "fine" as keyof StudentData },
  ];

  return (
    <div className="w-full bg-gray-50 p-6">
      <div className="bg-white rounded-lg p-6 shadow space-y-6">
        <h1 className="text-2xl font-medium">
          {Text.Select_Criteria || "Select Criteria"}
        </h1>

        {/*  Search Form  */}
        <div className="space-y-4">
          <AllSchoolDropdown
  onSubmit={handleSearchSubmit(onSearchSubmit)}
  queryKeys={['sections', 'schoolClasses']}
  onSchoolChange={resetSearchForm}
>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Dropdown
              label={Text.Class || "Class"}
              name="class"
              control={control}
              options={classOptions}
            />
            <Dropdown
              label={NameText.Section || "Section"}
              name="section"
              control={control}
              options={sectionOptions}
            />
            <TextField
              label={Text.Name_Admission_No}
              name="search"
              control={control}
              placeholder={Text.Enter_Name_Or_Admission_No}
            />
            <TextField
              label={Text.Roll_Number}
              name="rollNo"
              control={control}
              placeholder={Text.Enter_Roll_Number}
            />
          </div>

          <div className="flex items-end justify-end gap-2">
            <Button name={Text.Cancel } loading={false} onClick={handleReset} showAlways = {true}/>
            <Button
              name={Text.Search || "Search"}
              icon={<IconField name="FaSearch" />}
              loading={isLoading}
              onClick={handleSearchSubmit(onSearchSubmit)}
              showAlways = {true}
            />
          </div>
          </AllSchoolDropdown>
        </div>

        {/* Backend-filtering indicator */}
        {isBackendFiltering && (
          <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md px-4 py-2">
            <IconField name="FaSpinner" size={14} className="animate-spin" />
            <span>{Text.Searching_Records_On_Server}</span>
          </div>
        )}

        {/*  Student Table  */}
        <div className="relative">
          {isLoading && !isBackendFiltering && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
               {Text.Loading}
              </span>
            </div>
          )}

          <ControlledTable
            data={studentsWithStatus}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
              updateSearchTerm(e.target.value)
            }
            title={Text.Student_List}
            actionColumn={false}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer hover:bg-gray-100"
            showSearch={false}
            btn={false}
            showSelectAll={false}
            enablePermissions={true}
            permissionScope="FEES"
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>

      {modal.isOpen && modal.selectedStudent && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 backdrop-blur-md bg-black/20 z-40"
            onClick={handleCloseModal}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
              {/* Header */}
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                     {Text.Add_Fine || "Add Fine"}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {modal.selectedStudent.studentName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {modal.selectedStudent.class} —{" "}
                      {modal.selectedStudent.section} | Roll:{" "}
                      {modal.selectedStudent.rollNo} | Adm:{" "}
                      {modal.selectedStudent.admissionNo}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="text-gray-400 hover:text-gray-600 ml-4"
                  >
                    <IconField name="FaTimes" size={18} />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                <Dropdown
                  label={Text.Fee_Type}
                  name="feeTypeId"
                  control={fineControl}
                  options={applicableFeeTypes}
                  required
                  onChange={(value) => {
                    const sel = applicableFeeTypes.find(
                      (ft) => Number(ft.value) === Number(value),
                    );
                    if (sel) setValue("feeTypeName", sel.label);
                  }}
                />

                {applicableFeeTypes.length === 0 && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
                    This student doesn't have any assigned fees. Please assign
                    fees first.
                  </div>
                )}

                <AmountField
                  label={Text.Fine_Amount}
                  name="amount"
                  control={fineControl}
                  placeholder="Enter fine amount"
                  required
                  disabled={applicableFeeTypes.length === 0}
                />

                <TextField
                  label={Text.Reason}
                  name="reason"
                  control={fineControl}
                  placeholder={Text.Enter_Reason_For_Fine}
                  required
                  disabled={applicableFeeTypes.length === 0}
                />

                <div className="flex gap-3 pt-2">
                  <div className="flex-1">
                    <Button
                      name={Text.Cancel}
                      loading={false}
                      onClick={handleCloseModal}
                    />
                  </div>
                  <div className="flex-1">
                    <Button
                      name={Text.Add_Fine || "Add Fine"}
                      icon={<IconField name="FaPlus" />}
                      loading={isSubmitting}
                      isDisable={applicableFeeTypes.length === 0}
                      onClick={handleSubmit(onFineSubmit)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AddFine;