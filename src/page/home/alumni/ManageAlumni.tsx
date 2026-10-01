import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";

import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { Dropdown } from "../../../components/controlled";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { getPagesDataText } from "../../../helpers/useTranslations";
import { useSessions } from "../../../hooks/queries/systemSettinds/useSessionSetting";
import {
  useFilterManageAlumni,
  useDeleteAlumni,
  useDeleteMultipleAlumni,
} from "../../../hooks/queries/alumni/useManageAlumni";
import type { ManageAlumniSearchParams } from "../../../services/alumni/manageAlumniService";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";

export default function ManageAlu() {
  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [activeFilters, setActiveFilters] = useState<ManageAlumniSearchParams>(
    {},
  );

  const {
    data: alumniResponse,
    isLoading,
    isFetching,
    error,
  } = useFilterManageAlumni(activeFilters, page, pageSize);
  const alumniList = alumniResponse?.alumni ?? [];
  const totalItems = alumniResponse?.totalItems ?? 0;
  const totalPages = alumniResponse?.totalPages ?? 0;

  const { data: sessions } = useSessions();

  const deleteAlumni = useDeleteAlumni();
  const deleteMultipleAlumni = useDeleteMultipleAlumni();

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterSessionId: "",
      filterSearch: "",
    },
  });

  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleSearch = (data: FieldValues) => {
    const params: ManageAlumniSearchParams = {};
    if (data.filterSessionId) params.sessionId = Number(data.filterSessionId);
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim();
    setActiveFilters(params);
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({ filterSessionId: "", filterSearch: "" });
    setActiveFilters({});
    setPage(0);
  };

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast("Do you want to delete this entry?"))) return;
    try {
      await deleteAlumni.mutateAsync(id.toString());
      toast.success("Alumni deleted successfully.");
    } catch (error) {
      console.error("Error deleting alumni:", error);
      toast.error("Failed to delete alumni. Please try again.");
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (!(await confirmToast("Do you want to delete these entries?"))) return;
    try {
      await deleteMultipleAlumni.mutateAsync(ids.map((x) => x.toString()));
      toast.success("Selected alumni deleted successfully.");
    } catch (error) {
      console.error("Error deleting multiple alumni:", error);
      toast.error("Failed to delete alumni. Please try again.");
    }
  };

  const tableData = alumniList.map((alumni) => ({
    id: alumni.manageAlumniId,
    admissionNo: alumni.studentSession.admissionNo || "N/A",
    studentName: alumni.studentSession.studentName || "N/A",
    class: alumni.studentSession.schoolClassName || "N/A",
    section: alumni.studentSession.sectionName || "N/A",
    gender: alumni.studentSession.gender || "N/A",
    passOutSession: alumni.studentSession.sessionName || "N/A",
  }));

  const columns = [
    { label: Text.Admission_No, key: "admissionNo" },
    { label: Text.Name, key: "studentName" },
    { label: Text.Class, key: "class" },
    { label: Text.Section, key: "section" },
    { label: Text.Gender, key: "gender" },
    { label: Text.Pass_Out_Session, key: "passOutSession" },
  ];

  return (
    <div className="min-h-screen w-full bg-white shadow-lg p-4">
      <div className="border-b p-4">
        <form onSubmit={handleFilterSubmit(handleSearch)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Dropdown
              name="filterSessionId"
              label={Text.Session}
              control={filterControl}
              required={false}
              options={
                sessions?.map((s: any) => ({
                  value: String(s.sessionId || s.id),
                  label: s.session || s.sessionName,
                })) || []
              }
            />

            <TextField
              name="filterSearch"
              label={Text.Name}
              control={filterControl}
              placeholder={Text.Enter_Name}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={handleClearFilters}
              name={Text.Clear}
              loading={false}
              icon={<IconField name="FaTimes" />}
              showAlways = {true}
            />
            <Button
              name={Text.Search}
              loading={isFetching}
              icon={<IconField name="FaSearch" />}
              showAlways = {true}
            />
          </div>
        </form>
      </div>

      <div className="p-2">
        {error && (
          <div className="text-red-500 p-4 mb-4 bg-red-50 rounded">
            Error loading alumni data. Please try again.
          </div>
        )}

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
                Updating…
              </span>
            </div>
          )}

          <ControlledTable
            data={tableData}
            columns={columns}
            title={Text.Student_List}
            showSearch={false}
            actionColumn={true}
            showSelectAll={true}
            loading={isLoading}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            enablePermissions={true}
            permissionScope="ALUMNI"
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>
      </div>
    </div>
  );
}
