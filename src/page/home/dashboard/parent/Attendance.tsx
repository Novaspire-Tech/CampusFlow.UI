import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { getParentDashboardText, getPagesDataText } from "../../../../helpers/useTranslations";

import DropDown from "../../../../components/controlled/Dropdown";
import DateField from "../../../../components/controlled/DateField";
import { Button } from "../../../../components/controlled";
import { IconField } from "../../../../components";

// ── Interfaces matching actual API response ─────────────────────────────────

interface Child {
  studentId: number;
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  religion?: string;
  castName?: string;
  phoneNumber?: string;
  email?: string;
  photo?: string;
  admissionDate: string;
  className: string;
  section: string;
  rollNo: string;
}

interface AttendanceRecord {
  date: string; // "DD/MM/YYYY"
  attendanceStatus: string; // PRESENT / ABSENT / LEAVE / HOLIDAY / HALF_DAY
}

interface StudentAttendance {
  studentName: string;
  className: string;
  section: string;
  rollNumber: string;
  attendance: AttendanceRecord[];
}

interface FilterFormData {
  studentId: string;
  startDate: string;
  endDate: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

const toDateObj = (ddmmyyyy: string): Date => {
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(y, m - 1, d);
};

const defaultRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const toISO = (dt: Date) => dt.toISOString().slice(0, 10);
  return { start: toISO(start), end: toISO(today) };
};

const STATUS_STYLES: Record<string, string> = {
  PRESENT: "bg-emerald-100 text-emerald-700",
  ABSENT: "bg-red-100 text-red-700",
  LEAVE: "bg-amber-100 text-amber-700",
  HOLIDAY: "bg-gray-100 text-gray-600",
  HALF_DAY: "bg-blue-100 text-blue-700",
};

const statusStyle = (status: string) =>
  STATUS_STYLES[status?.toUpperCase()] || "bg-gray-100 text-gray-600";

const summarize = (records: AttendanceRecord[]) => {
  const total = records.length;
  const present = records.filter((r) => r.attendanceStatus?.toUpperCase() === "PRESENT").length;
  const absent = records.filter((r) => r.attendanceStatus?.toUpperCase() === "ABSENT").length;
  const leave = records.filter((r) => r.attendanceStatus?.toUpperCase() === "LEAVE").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
  return { total, present, absent, leave, percentage };
};

// ── Component ────────────────────────────────────────────────────────────────
const Attendance: React.FC = () => {
  const initialRange = defaultRange();
  const [records, setRecords] = useState<StudentAttendance[]>([]);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const texts = getParentDashboardText(t);
  const T = getPagesDataText(t);

  const { control, watch, getValues } = useForm<FilterFormData>({
    defaultValues: {
      studentId: "0",
      startDate: initialRange.start,
      endDate: initialRange.end,
    },
  });
  const selectedStudentId = watch("studentId");

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId]);

  const fetchChildren = async () => {
    try {
      const schoolCode = localStorage.getItem("schoolCode") || "";
      if (!schoolCode) return;
      const childrenData = await parentDashboardService.getChildren(schoolCode);
      setChildren(Array.isArray(childrenData) ? childrenData : []);
    } catch {
      setChildren([]);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getValues();
      const response = await parentDashboardService.getAttendance(startDate, endDate);
      setRecords((response as unknown as StudentAttendance[]) ?? []);
      setError(null);
    } catch {
      setError("Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyRange = () => {
    const { startDate, endDate } = getValues();
    if (new Date(startDate) > new Date(endDate)) {
      setError("Start date must be before end date.");
      return;
    }
    fetchAttendance();
  };

  const studentOptions = [
    { value: "0", label: texts.All_Students || "All Students" },
    ...children.map((child) => ({
      value: String(child.studentId),
      label: `${child.firstName} ${child.lastName} – ${child.className} ${child.section}`,
    })),
  ];

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <div className="mt-4 flex justify-center">
          <Button
            name={texts.Retry}
            loading={false}
            onClick={fetchAttendance}
            icon={<IconField name="FaSyncAlt" />}
          />
        </div>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <TopBar
          texts={texts}
          control={control}
          studentOptions={studentOptions}
          onApply={handleApplyRange}
          onRefresh={fetchAttendance}
        />
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <IconField name="FaCalendarCheck" />
            <h3 className="text-lg font-semibold text-gray-900">
              {"No attendance records"}
            </h3>
            <p className="text-gray-600">No attendance has been recorded for this range.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <TopBar
        texts={texts}
        control={control}
        studentOptions={studentOptions}
        onApply={handleApplyRange}
        onRefresh={fetchAttendance}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {records.map((child) => {
          const stats = summarize(child.attendance);
          const sorted = [...child.attendance].sort(
            (a, b) => toDateObj(a.date).getTime() - toDateObj(b.date).getTime(),
          );

          return (
            <div
              key={child.studentName + child.rollNumber}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
            >
              <div className="h-2 w-full bg-emerald-500" />

              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-gray-900 font-bold text-lg leading-snug">
                      {child.studentName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {T.Class} {child.className} – {child.section} · Roll {child.rollNumber}
                    </p>
                  </div>
                  
                </div>

                {/* Summary pills */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold text-emerald-700">{stats.present}</div>
                    <div className="text-xs text-emerald-600">{T.Present ?? "Present"}</div>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-lg p-2.5 text-center">
                    <div className="text-lg font-bold text-red-700">{stats.absent}</div>
                    <div className="text-xs text-red-600">{T.Absent ?? "Absent"}</div>
                  </div>
                 
                </div>

                {/* Daily log */}
                <div className="border border-gray-100 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
                  {sorted.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No daily records in this range.
                    </p>
                  ) : (
                    sorted.map((rec, idx) => (
                      <div key={`${rec.date}-${idx}`} className="flex items-center justify-between px-3 py-2">
                        <span className="text-sm text-gray-700">{rec.date}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyle(rec.attendanceStatus)}`}>
                          {rec.attendanceStatus}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Top bar (title + student filter + date range + refresh) ────────────────

interface TopBarProps {
  texts: any;
  control: any;
  studentOptions: { value: string; label: string }[];
  onApply: () => void;
  onRefresh: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ texts, control, studentOptions, onApply, onRefresh }) => (
  <div className="flex items-center justify-between flex-wrap gap-4">
    <h2 className="text-2xl font-bold text-gray-900">{texts.Attendance ?? "Attendance"}</h2>

    <div className="flex items-end gap-3 flex-wrap">
      <div className="w-64">
        <DropDown
          label={texts.Select_Student || "Student"}
          name="studentId"
          control={control}
          options={studentOptions}
        />
      </div>

      <DateField name="startDate" label={texts.From || "From"} control={control} />
      <DateField name="endDate" label={texts.To || "To"} control={control} />

      <Button
        name={texts.Apply || "Apply"}
        loading={false}
        onClick={onApply}
        icon={<IconField name="FaCheck" />}
      />

      <Button
        name={texts.Refresh}
        loading={false}
        onClick={onRefresh}
        icon={<IconField name="FaSyncAlt" />}
      />
    </div>
  </div>
);

export default Attendance;