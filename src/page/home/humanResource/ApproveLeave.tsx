import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useStaffLeaves,
  useFilterStaffLeaves,
  useUpdateLeaveStatus,
  useDeleteStaffLeave,
} from "../../../hooks/queries/humanResource/useStaffLeave";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import type { FilterStaffLeaveDTO } from "../../../services/hr/staffLeaveService";
import type { StaffLeave } from "../../../types/humanResource/StaffLeave";

interface FilterForm {
  filterSearch: string;
}

const ApproveLeave: React.FC = () => {
  const { t } = useTranslation();
  const texts = getPagesDataText(t);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<FilterStaffLeaveDTO>({});
  const [isFiltering, setIsFiltering] = useState(false);
  const [viewData, setViewData] = useState<StaffLeave | null>(null);

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FilterForm>({ defaultValues: { filterSearch: "" } });

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: allData, isLoading: allLoading, isFetching: allFetching } =
    useStaffLeaves({ page, size: pageSize, sortDirection: "asc" });

  const { data: filteredData, isLoading: filterLoading, isFetching: filterFetching } =
    useFilterStaffLeaves(
      activeFilters,
      { page, size: pageSize, sortDirection: "asc" },
      isFiltering
    );

  const response   = isFiltering ? filteredData : allData;
  const leaves     = response?.leaves     ?? [];
  const totalItems = response?.totalItems ?? 0;
  const totalPages = response?.totalPages ?? 0;
  const isLoading  = isFiltering ? filterLoading  : allLoading;
  const isFetching = isFiltering ? filterFetching : allFetching;

  // ─── Mutations ────────────────────────────────────────────────────────────

  const { mutateAsync: updateLeaveStatus, isPending: isUpdating } = useUpdateLeaveStatus();
  const { mutateAsync: deleteStaffLeave, isPending: isDeleting }  = useDeleteStaffLeave();
  const isActioning = isUpdating || isDeleting;

  const stats = {
    total:    totalItems,
    pending:  leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  };

  const T = getPagesDataText(t)

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleApprove = async (leaveId: number) => {
    if (!(await confirmToast("Do_you_want_to_approve_this_leave_request"))) return;
    try {
      await updateLeaveStatus({ leaveId, status: "APPROVED" });
      toast.success( "Leave approved successfully");
      setViewData(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to approve leave.");
    }
  };

  const handleReject = async (leaveId: number) => {
    if (!(await confirmToast("Do_you_want_to_reject_this_leave_request"))) return;
    try {
      await updateLeaveStatus({ leaveId, status: "REJECTED" });
      toast.success( "Leave rejected successfully");
      setViewData(null);
    } catch (error: any) {
      toast.error(error?.message || "Failed to reject leave.");
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!(await confirmToast("Do you want to delete this entry?"))) return;
    try {
      await deleteStaffLeave(Number(id));
      toast.success( "Leave request deleted successfully");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete leave request.");
    }
  };

  const handleApplyFilters: SubmitHandler<FilterForm> = (data) => {
    const filters: FilterStaffLeaveDTO = {};
    if (data.filterSearch?.trim()) filters.search = data.filterSearch.trim();
    setActiveFilters(filters);
    setIsFiltering(true);
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({ filterSearch: "" });
    setActiveFilters({});
    setIsFiltering(false);
    setPage(0);
  };

  // ─── Table data ───────────────────────────────────────────────────────────

  const tableData = leaves.map((item) => ({
    id:            item.staffLeaveId?.toString() ?? item.id,
    staffLeaveId:  item.staffLeaveId,
    staffName:     item.staffName     || "Unknown Staff",
    staffCode:     item.staffCode     || "N/A",
    leaveType:     item.leaveType,
    leaveFromDate: item.leaveFromDate,
    leaveToDate:   item.leaveToDate,
    leaveDays:     item.leaveDays,
    reason:        item.reason        || "N/A",
    status:        item.status,
  }));

  type TableRow = (typeof tableData)[number];

  // ─── Columns ──────────────────────────────────────────────────────────────

  const columns = [
    { key: "staffName",     label: T.Staff_Name || "Staff Name" },
    { key: "staffCode",     label: T.Staff_Code },
    {
      key: "leaveType",
      label: T.Leave_Type,
      render: (value: string) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium whitespace-nowrap">
          {value.charAt(0) + value.slice(1).toLowerCase()}
        </span>
      ),
    },
    { key: "leaveFromDate", label: T.From_Date },
    { key: "leaveToDate",   label: T.To_Date },
    {
      key: "leaveDays",
      label: T.Days,
      render: (value: number) => (
        <span className="font-semibold text-gray-700">{value}</span>
      ),
    },
    {
      key: "reason",
      label: T.Reason,
      render: (value: string) => (
        <span className="text-sm text-gray-600" title={value}>
          {value.length > 30 ? value.substring(0, 30) + "…" : value}
        </span>
      ),
    },
    {
      key: "actions",
      label: T.Action,
      render: (_: any, row: TableRow) => {
        const openView = () => {
          const full = leaves.find((l) => l.staffLeaveId === row.staffLeaveId);
          if (full) setViewData(full);
        };

        if (row.status === "PENDING") {
          return (
            <div className="flex items-center gap-1.5 flex-nowrap">
              <button
                onClick={() => handleApprove(row.staffLeaveId)}
                disabled={isActioning}
                className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {T.Approve}
              </button>
              <button
                onClick={() => handleReject(row.staffLeaveId)}
                disabled={isActioning}
                className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {T.Reject}
              </button>
              <button
                onClick={openView}
                className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors whitespace-nowrap"
              >
                {T.View}
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center gap-1.5 flex-nowrap">
            <span
              className={`px-2.5 py-1 rounded text-xs font-semibold border whitespace-nowrap ${
                row.status === "APPROVED"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {row.status === "APPROVED" ? T.Approved : T.Rejected}
            </span>
            <button
              onClick={openView}
              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs font-semibold transition-colors whitespace-nowrap"
            >
              {T.View}
            </button>
          </div>
        );
      },
    },
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="w-full px-4 py-4">

      {/* ── Statistics Cards — using static classes (no dynamic Tailwind) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{T.Total_Requests}</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <IconField name="FaClipboardList" className="text-blue-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{T.Pending}</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <IconField name="FaClock" className="text-yellow-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{T.Approved}</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <IconField name="FaCheckCircle" className="text-green-600 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">{T.Rejected}</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <IconField name="FaTimesCircle" className="text-red-600 text-xl" />
            </div>
          </div>
        </div>

      </div>

      {/* ── View Details Modal ────────────────────────────────────────────── */}
      {viewData && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">
              {T.Leave_Requests}
            </h2>

            <div className="space-y-3">
              {(
                [
                  { label: T.Staff_Name, value: viewData.staffName },
                  { label: T.Staff_Code, value: viewData.staffCode },
                  { label: T.Leave_Type, value: viewData.leaveType },
                  { label: T.From_Date,  value: viewData.leaveFromDate },
                  { label: T.To_Date,    value: viewData.leaveToDate },
                  { label: T.Days,       value: String(viewData.leaveDays) },
                  { label: T.Reason,     value: viewData.reason || "N/A" },
                ] as { label: string; value: string }[]
              ).map(({ label, value }) => (
                <div key={label} className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-gray-700">{label}:</span>
                  <span className="text-gray-600">{value}</span>
                </div>
              ))}

              <div className="flex justify-between border-b pb-2">
                <span className="font-semibold text-gray-700">{T.Status}:</span>
                <span
                  className={`px-3 py-1 rounded-md text-xs font-semibold ${
                    viewData.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : viewData.status === "REJECTED"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {viewData.status}
                </span>
              </div>
            </div>

            {viewData.status === "PENDING" && (
              <div className="mt-6 pt-4 border-t flex gap-3">
                <button
                  onClick={() => handleApprove(viewData.staffLeaveId)}
                  disabled={isActioning}
                  className="flex-1 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {T.Approve_Leave}
                </button>
                <button
                  onClick={() => handleReject(viewData.staffLeaveId)}
                  disabled={isActioning}
                  className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {T.Reject}
                </button>
              </div>
            )}

            {viewData.status !== "PENDING" && (
              <div className="mt-6 pt-4 border-t">
                <div
                  className={`px-4 py-3 rounded-lg border text-center font-semibold ${
                    viewData.status === "APPROVED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  }`}
                >
                  This leave has been {viewData.status.toLowerCase()}
                </div>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setViewData(null)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {T.Approve_Leave_Request}
          </h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <TextField
              label={texts.Search || T.Search}
              name="filterSearch"
              control={filterControl}
              placeholder={T.Search_By_Staff_Name_Or_Status}
            />
          </section>
          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={T.Clear_Filters}
              loading={false}
              icon={<IconField name="FaTimes" />}
              type="button"
              showAlways = {true}
            />
            <Button
              name={texts.Search || T.Search}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" />}
              type="submit"
              showAlways = {true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating</span>
            </div>
          )}

          <ControlledTable
            title={T.Approve_Leave_Request}
            columns={columns}
            data={isLoading ? [] : tableData}
            fullData={tableData}
            showSearch={false}
            actionColumn={false}
            onDelete={handleDelete}
            showSelectAll={false}
            btn={false}
            enablePermissions
            permissionScope="HR"
            emptyMessage={T.No_Leave_Requests_Found}
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(0);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ApproveLeave;