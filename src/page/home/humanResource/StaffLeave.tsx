import { useState, useEffect } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Dropdown from "../../../components/controlled/Dropdown";
import NumberField from "../../../components/controlled/NumberField";
import DateField from "../../../components/controlled/DateField";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useStaffLeaves,
  useCreateStaffLeave,
  useUpdateLeaveStatus,
  useDeleteStaffLeave,
} from "../../../hooks/queries/humanResource/useStaffLeave";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";

interface StaffLeaveItem {
  id: string;
  staffLeaveId: number;
  staffName: string;
  leaveType: string;
  leaveFromDate: string;
  leaveToDate: string;
  leaveDays: number;
  reason: string;
  status: string;
}

function StaffLeave() {
  const { t } = useTranslation();
  const texts = getPagesDataText(t);
  const { data: staffLeavesData, } = useStaffLeaves();
  const createStaffLeave = useCreateStaffLeave();
  const updateLeaveStatus = useUpdateLeaveStatus();
  const deleteStaffLeave = useDeleteStaffLeave();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  console.log("Staff Leaves Data:", staffLeavesData);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FieldValues>({
    defaultValues: {
      staffId: "",
      staffAssignedLeaveId: "",
      leaveType: "",
      leaveFromDate: "",
      leaveToDate: "",
      leaveDays: "",
      reason: "",
    }
  });

  const [localStaffLeaves, setLocalStaffLeaves] = useState<StaffLeaveItem[]>([]);

  // Watch date fields to auto-calculate leave days
  const leaveFromDate = watch("leaveFromDate");
  const leaveToDate = watch("leaveToDate");

  useEffect(() => {
    if (leaveFromDate && leaveToDate) {
      const from = new Date(leaveFromDate);
      const to = new Date(leaveToDate);
      
      if (to >= from) {
        const diffTime = Math.abs(to.getTime() - from.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setValue("leaveDays", diffDays);
      }
    }
  }, [leaveFromDate, leaveToDate, setValue]);

  useEffect(() => {
    if (staffLeavesData && Array.isArray(staffLeavesData)) {
      const formatted: StaffLeaveItem[] = staffLeavesData.map((item: any) => ({
        id: item.staffLeaveId?.toString() || '',
        staffLeaveId: item.staffLeaveId,
        staffName: item.staffName,
        leaveType: item.leaveType,
        leaveFromDate: item.leaveFromDate,
        leaveToDate: item.leaveToDate,
        leaveDays: Number(item.leaveDays),
        reason: item.reason || '',
        status: item.status,
      }));
      setLocalStaffLeaves(formatted);
    }
  }, [staffLeavesData]);

  const onSubmit = async (data: FieldValues) => {
    try {
      const payload = {
        staffId: Number(data.staffId),
        staffAssignedLeaveId: Number(data.staffAssignedLeaveId),
        leaveType: data.leaveType as "SICK" | "CASUAL" | "MATERNITY" | "ANNUAL",
        leaveFromDate: data.leaveFromDate,
        leaveToDate: data.leaveToDate,
        leaveDays: Number(data.leaveDays),
        reason: data.reason || "",
      };

      await createStaffLeave.mutateAsync(payload, {
        onSuccess: () => {
          resetForm();
          toast.success("Leave application submitted successfully");
        },
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save staff leave. Please try again.");
    }
  };

  const resetForm = () => {
    reset({
      staffId: "",
      staffAssignedLeaveId: "",
      leaveType: "",
      leaveFromDate: "",
      leaveToDate: "",
      leaveDays: "",
      reason: "",
    });
    setEditingId(null);
  };

  const handleApprove = async (id: number) => {
    const confirmApprove = window.confirm(
       "Do you want to approve this leave request?"
    );
    if (!confirmApprove) return;

    try {
      await updateLeaveStatus.mutateAsync({ leaveId: id, status: "APPROVED" });
      toast.success("Leave approved successfully");
    } catch (error) {
      console.error("Error approving leave:", error);
      toast.error("Failed to approve leave. Please try again.");
    }
  };

  const handleReject = async (id: number) => {
    const confirmReject = window.confirm(
      "Do you want to reject this leave request?"
    );
    if (!confirmReject) return;

    try {
      await updateLeaveStatus.mutateAsync({ leaveId: id, status: "REJECTED" });
      toast.success("Leave rejected successfully");
    } catch (error) {
      console.error("Error rejecting leave:", error);
      toast.error("Failed to reject leave. Please try again.");
    }
  };

  const handleDelete = async (id: string | number) => {
    const numericId = typeof id === 'string' ? parseInt(id) : id;
    const confirmDelete = await confirmToast(
      texts.Do_you_want_to_delete_this_entry || "Do you want to delete this entry?"
    );
    if (!confirmDelete) return;

    try {
      await deleteStaffLeave.mutateAsync(numericId);
      toast.success("Leave request deleted successfully");
    } catch (error) {
      console.error("Error deleting staff leave:", error);
      toast.error("Failed to delete staff leave. Please try again.");
    }
  };

  const handleCancel = () => {
    resetForm();
  };

  const filteredStaffLeaves = localStaffLeaves.filter((item) =>
    Object.values(item).join(" ").toLowerCase().includes(search.toLowerCase())
  );

  const leaveTypeOptions = [
    { value: "SICK", label: "Sick Leave" },
    { value: "CASUAL", label: "Casual Leave" },
    { value: "MATERNITY", label: "Maternity Leave" },
    { value: "ANNUAL", label: "Annual Leave" },
  ];

  const columns = [
    { key: "staffName", label: texts.Staff_Name || "Staff Name" },
    { 
      key: "leaveType", 
      label: texts.Leave_Type || "Leave Type",
      render: (value: string) => value.charAt(0) + value.slice(1).toLowerCase()
    },
    { key: "leaveFromDate", label:  "From Date" },
    { key: "leaveToDate", label:  "To Date" },
    { key: "leaveDays", label: "Days" },
    { key: "reason", label: texts.Reason || "Reason" },
    { 
      key: "status", 
      label: texts.Status || "Status",
      render: (value: string) => (
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          value === 'APPROVED' ? 'bg-green-100 text-green-800' :
          value === 'REJECTED' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {value.charAt(0) + value.slice(1).toLowerCase()}
        </span>
      )
    },
    {
      key: "actions",
      label:"Actions",
      render: (_: any, row: StaffLeaveItem) => (
        <div className="flex gap-2">
          {row.status === 'PENDING' && (
            <>
              <button
                onClick={() => handleApprove(row.staffLeaveId)}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                Approve
              </button>
              <button
                onClick={() => handleReject(row.staffLeaveId)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Reject
              </button>
            </>
          )}
        </div>
      )
    }
  ];

  const isLoading = createStaffLeave.isPending || updateLeaveStatus.isPending;

  return (
    <div className="w-full px-4 py-4">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Form Section */}
        <div className="w-full lg:w-1/3 p-4 bg-white shadow-md rounded">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h1 className="text-xl font-semibold">
              {"Apply For Leave"}
            </h1>

            <NumberField 
              name="staffId" 
              label={texts.Staff_ID || "Staff ID"} 
              control={control} 
              required 
            />

            <NumberField 
              name="staffAssignedLeaveId" 
              label={"Staff Assigned Leave ID"} 
              control={control} 
              required 
            />

            <Dropdown
              label={texts.Leave_Type || "Leave Type"}
              name="leaveType"
              control={control}
              required
              options={leaveTypeOptions} 
            />

            <DateField 
              name="leaveFromDate" 
              label={"From Date"} 
              control={control} 
              required 
            />

            <DateField 
              name="leaveToDate" 
              label={"To Date"} 
              control={control} 
              required 
            />

            <NumberField 
              name="leaveDays" 
              label={"Leave Days"} 
              control={control} 
              required
              disabled
            />

            <TextField
              name="reason"
              label={texts.Reason || "Reason (Optional)"}
              control={control}
            />

            <div className="flex gap-2">
              <Button
                name={"Apply"}
                loading={isLoading}
                icon={<IconField name="FaSave" />}
              />
              {editingId && (
                <Button
                  name={texts.Cancel || "Cancel"}
                  loading={false}
                  icon={<IconField name="FaTimes" />}
                  onClick={handleCancel}
                />
              )}
            </div>
          </form>
        </div>

        {/* Table Section */}
        <div className="w-full lg:w-2/3 p-2 bg-white shadow-md rounded overflow-auto">
          <ControlledTable
            title={"Staff Leave List"}
            columns={columns}
            data={filteredStaffLeaves}
            fullData={localStaffLeaves}
            searchTerm={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            onDelete={handleDelete}
            showSelectAll={false}
            btn={false}
          />
        </div>
      </div>
    </div>
  );
}

export default StaffLeave;