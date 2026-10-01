import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaExclamationTriangle,
  FaUserCheck,
  FaBoxOpen,
  FaInbox,
} from "react-icons/fa";

import {
  useVisitorBooks,
  useUpdateVisitorBook,
} from "../../../../hooks/queries/frontOffice/useVisitorBook";
import { useAdmissionEnquiries } from "../../../../hooks/queries/frontOffice/useAdmissionEnquiry";
import { usePhoneCallLogs } from "../../../../hooks/queries/frontOffice/usePhoneCallLog";
import { useComplains } from "../../../../hooks/queries/frontOffice/useComplain";
import { usePostalDispatches } from "../../../../hooks/queries/frontOffice/usePostalDispatch";
import { usePostalReceives } from "../../../../hooks/queries/frontOffice/usePostalReceives";
import { usePurposes } from "../../../../hooks/queries/frontOffice/setupFrontOffice/usePurpose";
import { useSources } from "../../../../hooks/queries/frontOffice/setupFrontOffice/useSource";
import { useComplaintTypes } from "../../../../hooks/queries/frontOffice/setupFrontOffice/useComplaintType";
import { IconField } from "../../../../components";
import Button from "../../../../components/controlled/Button";

import { StatsGrid } from "../../../home/dashboard/receptionist/StatsCard";
import ActivityFeed from "../../../home/dashboard/receptionist/ActivityFeed";
import ChartsSection from "../../../home/dashboard/receptionist/ChartsSection";

import type {
  ActivityItem,
  ChartDataPoint,
  VisitorStats,
  EnquiryStats,
  CallStats,
  ComplaintStats,
} from "../../../home/dashboard/receptionist/receptiontypes";
import { useTranslation } from "react-i18next";
import {  getPagesDataText } from "../../../../helpers/useTranslations";

function ReceptionistDashboard() {
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);

  const { data: visitorsRaw } = useVisitorBooks();
  const { data: enquiriesRaw } = useAdmissionEnquiries();
  const { data: callsRaw } = usePhoneCallLogs();
  const { data: complaintsRaw } = useComplains();
  const { data: dispatchesRaw } = usePostalDispatches();
  const { data: receivesRaw } = usePostalReceives();
  usePurposes();
  useSources();
  useComplaintTypes();

  const updateVisitor = useUpdateVisitorBook();

  const visitorsData = useMemo(
    () => (visitorsRaw as any)?.visitors ?? [],
    [visitorsRaw],
  );
  const visitorsTotal = useMemo(
    () => (visitorsRaw as any)?.totalItems ?? visitorsData.length,
    [visitorsRaw, visitorsData],
  );

  const enquiriesData = useMemo(
    () => (enquiriesRaw as any)?.admissionEnquiries ?? [],
    [enquiriesRaw],
  );
  const enquiriesTotal = useMemo(
    () => (enquiriesRaw as any)?.totalItems ?? enquiriesData.length,
    [enquiriesRaw, enquiriesData],
  );

  const callsData = useMemo(
    () => (callsRaw as any)?.phoneCalls ?? [],
    [callsRaw],
  );
  const callsTotal = useMemo(
    () => (callsRaw as any)?.totalItems ?? callsData.length,
    [callsRaw, callsData],
  );

  const complaintsData = useMemo(
    () => (complaintsRaw as any)?.complains ?? [],
    [complaintsRaw],
  );
  const complaintsTotal = useMemo(
    () => (complaintsRaw as any)?.totalItems ?? complaintsData.length,
    [complaintsRaw, complaintsData],
  );

  const dispatchesData = useMemo(
    () => (dispatchesRaw as any)?.dispatches ?? [],
    [dispatchesRaw],
  );
  const dispatchesTotal = useMemo(
    () => (dispatchesRaw as any)?.totalItems ?? dispatchesData.length,
    [dispatchesRaw, dispatchesData],
  );

  const receivesData = useMemo(
    () => (receivesRaw as any)?.receives ?? [],
    [receivesRaw],
  );
  const receivesTotal = useMemo(
    () => (receivesRaw as any)?.totalItems ?? receivesData.length,
    [receivesRaw, receivesData],
  );

  const [stats, setStats] = useState({
    visitors: {} as VisitorStats,
    enquiries: {} as EnquiryStats,
    calls: {} as CallStats,
    complaints: {} as ComplaintStats,
    totalDispatches: 0,
    totalReceives: 0,
  });

  const [chartData, setChartData] = useState({
    purposeDistribution: [] as ChartDataPoint[],
    sourceDistribution: [] as ChartDataPoint[],
    complaintTypes: [] as ChartDataPoint[],
    callTypes: [] as ChartDataPoint[],
  });

  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const today = useMemo(
    () =>
      new Date()
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "/"),
    [],
  );

  //  Visitors stats 
  useEffect(() => {
    const todayV = visitorsData.filter((v: any) => v.date === today);
    setStats((prev) => ({
      ...prev,
      visitors: {
        total: visitorsTotal,
        today: todayV.length,
        active: visitorsData.filter((v: any) => v.inTime && !v.outTime).length,
        checkedOut: todayV.filter((v: any) => v.outTime).length,
        pending: todayV.filter((v: any) => !v.inTime).length,
        averageStay: calculateAverageStay(visitorsData),
        peakHour: findPeakHour(visitorsData),
      },
    }));
  }, [visitorsData, visitorsTotal, today]);

  //  Enquiries stats 
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      enquiries: {
        total: enquiriesTotal,
        today: enquiriesData.filter((e: any) => e.enquiryDate === today).length,
        pending: enquiriesData.filter((e: any) => e.status === "Pending").length,
        completed: enquiriesData.filter((e: any) => e.status === "Completed").length,
        active: enquiriesData.filter((e: any) => e.status === "Active").length,
        bySource: groupBySource(enquiriesData),
      },
    }));
  }, [enquiriesData, enquiriesTotal, today]);

  //  Calls stats 
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      calls: {
        total: callsTotal,
        today: callsData.filter((c: any) => c.date === today).length,
        incoming: callsData.filter((c: any) => c.callType?.toUpperCase() === "INCOMING").length,
        outgoing: callsData.filter((c: any) => c.callType?.toUpperCase() === "OUTGOING").length,
        avgDuration: calculateAvgCallDuration(callsData),
      },
    }));
  }, [callsData, callsTotal, today]);

  //  Complaints stats 
  useEffect(() => {
    setStats((prev) => ({
      ...prev,
      complaints: {
        total: complaintsTotal,
        today: complaintsData.filter((c: any) => c.date === today).length,
        resolved: complaintsData.filter((c: any) => c.actionTaken).length,
        pending: complaintsData.filter((c: any) => !c.actionTaken).length,
        byType: groupByComplaintType(complaintsData),
      },
    }));
  }, [complaintsData, complaintsTotal, today]);

  //  Postal stats 
  useEffect(() => {
    setStats((prev) => ({ ...prev, totalDispatches: dispatchesTotal }));
  }, [dispatchesTotal]);

  useEffect(() => {
    setStats((prev) => ({ ...prev, totalReceives: receivesTotal }));
  }, [receivesTotal]);

  //  Charts 
  useEffect(() => {
    generateChartData(visitorsData, enquiriesData, callsData, complaintsData);
  }, [visitorsData, enquiriesData, callsData, complaintsData]);

  //  Activity Feed 
  useEffect(() => {
    const list: ActivityItem[] = [];

    visitorsData.slice(0, 10).forEach((v: any) =>
      list.push({
        id: `v-${v.id}`,
        type: "visitor",
        title: `${v.visitorName || "Unknown"} visited`,
        description: `Meeting with ${v.meetingWith || "Unknown"} • ${v.purposeName || "General"}`,
        time: v.date || "",
        status: v.outTime ? "Completed" : v.inTime ? "Ongoing" : "Scheduled",
        icon: <FaUserCheck />,
      }),
    );
    enquiriesData.slice(0, 8).forEach((e: any) =>
      list.push({
        id: `e-${e.id}`,
        type: "enquiry",
        title: `Enquiry: ${e.studentName || "Unknown"}`,
        description: `Source: ${e.sourceName || "N/A"} • Class: ${e.className || "N/A"}`,
        time: e.enquiryDate || "",
        status: e.status,
        icon: <FaEnvelope />,
      }),
    );
    callsData.slice(0, 8).forEach((c: any) =>
      list.push({
        id: `c-${c.id}`,
        type: "call",
        title: `Call: ${c.name || "Unknown"}`,
        description: `Duration: ${c.callDuration || "N/A"} • ${c.callType || "N/A"}`,
        time: c.date || "",
        status: c.callType,
        icon: <FaPhoneAlt />,
      }),
    );
    complaintsData.slice(0, 6).forEach((c: any) =>
      list.push({
        id: `co-${c.id}`,
        type: "complaint",
        title: `Complaint: ${c.complainBy || "Unknown"}`,
        description: `Type: ${c.complaintTypeName || "N/A"}`,
        time: c.date || "",
        status: c.actionTaken ? "Resolved" : "Pending",
        icon: <FaExclamationTriangle />,
      }),
    );
    dispatchesData.slice(0, 5).forEach((d: any) =>
      list.push({
        id: `d-${d.id}`,
        type: "dispatch",
        title: `Dispatch: ${d.title || "Unknown"}`,
        description: `Ref: ${d.referenceNo || "N/A"}`,
        time: d.date || "",
        status: "Completed",
        icon: <FaBoxOpen />,
      }),
    );
    receivesData.slice(0, 5).forEach((r: any) =>
      list.push({
        id: `r-${r.id}`,
        type: "receive",
        title: `Received: ${r.fromTitle || "Unknown"}`,
        description: `Ref: ${r.referenceNo || "N/A"}`,
        time: r.date || "",
        status: "Received",
        icon: <FaInbox />,
      }),
    );

    list.sort((a, b) => {
      const t = (s: string) => {
        if (!s) return 0;
        const [d, m, y] = s.split("/");
        return new Date(`${y}-${m}-${d}`).getTime();
      };
      return t(b.time) - t(a.time);
    });

    setActivities(list.slice(0, 20));
  }, [visitorsData, enquiriesData, callsData, complaintsData, dispatchesData, receivesData]);

  //  Helpers 
  const calculateAverageStay = (data: any[]) => {
    const stays = data
      .filter((v) => v.inTime && v.outTime)
      .map(
        (v) =>
          (new Date(`1970/01/01 ${v.outTime}`).getTime() -
            new Date(`1970/01/01 ${v.inTime}`).getTime()) /
          60000,
      );
    if (!stays.length) return 0;
    return Math.round(stays.reduce((a, b) => a + b, 0) / stays.length);
  };

  const findPeakHour = (data: any[]) => {
    const hours = data
      .filter((v) => v.inTime)
      .map((v) => parseInt(v.inTime.split(":")[0]));
    if (!hours.length) return "N/A";
    const mode = hours
      .sort(
        (a, b) =>
          hours.filter((v) => v === a).length -
          hours.filter((v) => v === b).length,
      )
      .pop();
    return `${mode}:00`;
  };

  const groupBySource = (data: any[]) => {
    const g: Record<string, number> = {};
    data.forEach((e) => {
      const s = e.sourceName || "Unknown";
      g[s] = (g[s] || 0) + 1;
    });
    return g;
  };

  const groupByComplaintType = (data: any[]) => {
    const g: Record<string, number> = {};
    data.forEach((c) => {
      const t = c.complaintTypeName || "Unknown";
      g[t] = (g[t] || 0) + 1;
    });
    return g;
  };

  const calculateAvgCallDuration = (data: any[]) => {
    const d = data
      .filter((c) => c.callDuration)
      .map((c) => {
        const t = c.callDuration.match(/(\d+)/g);
        return t?.length >= 2 ? parseInt(t[0]) * 60 + parseInt(t[1]) : 0;
      })
      .filter(Boolean);
    if (!d.length) return "N/A";
    const avg = d.reduce((a, b) => a + b, 0) / d.length;
    return `${Math.floor(avg / 60)}:${String(Math.floor(avg % 60)).padStart(2, "0")}`;
  };

  const generateChartData = (
    visitors: any[],
    enquiries: any[],
    calls: any[],
    complaints: any[],
  ) => {
    const count = (arr: any[], key: string) =>
      arr.reduce((acc: Record<string, number>, item) => {
        const k = item[key] || "Other";
        acc[k] = (acc[k] || 0) + 1;
        return acc;
      }, {});
    const toChartArr = (obj: Record<string, number>): ChartDataPoint[] =>
      Object.entries(obj).map(([name, value]) => ({ name, value }));
    setChartData({
      purposeDistribution: toChartArr(count(visitors, "purposeName")),
      sourceDistribution: toChartArr(count(enquiries, "sourceName")),
      complaintTypes: toChartArr(count(complaints, "complaintTypeName")),
      callTypes: [
        {
          name: "Incoming",
          value: calls.filter((c) => c.callType?.toUpperCase() === "INCOMING").length,
        },
        {
          name: "Outgoing",
          value: calls.filter((c) => c.callType?.toUpperCase() === "OUTGOING").length,
        },
      ],
    });
  };

  const now = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const handleCheckIn = async (id: string) => {
    const visitor = visitorsData.find((x: any) => x.id === id);
    if (!visitor) return;
    try {
      await updateVisitor.mutateAsync({ id, data: { ...visitor, inTime: now() } });
      toast.success(`${visitor.visitorName} checked in successfully!`);
      setSelectedVisitor(null);
    } catch {
      toast.error("Check-in failed");
    }
  };

  const handleCheckOut = async (id: string) => {
    const visitor = visitorsData.find((x: any) => x.id === id);
    if (!visitor) return;
    const outTime = now();
    try {
      await updateVisitor.mutateAsync({ id, data: { ...visitor, outTime } });
      const minutes = Math.round(
        (new Date(`1970/01/01 ${outTime}`).getTime() -
          new Date(`1970/01/01 ${visitor.inTime}`).getTime()) /
          60000,
      );
      toast.success(`${visitor.visitorName} checked out! Stay: ${minutes} minutes`);
      setSelectedVisitor(null);
    } catch {
      toast.error("Check-out failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {selectedVisitor && (
          <VisitorDetailsModal
            visitor={selectedVisitor}
            onClose={() => setSelectedVisitor(null)}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        )}

        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            Front Office Dashboard
          </h2>
        </div>

        <StatsGrid
          totalVisitors={stats.visitors.total || 0}
          totalEnquiries={stats.enquiries.total || 0}
          totalCalls={stats.calls.total || 0}
          totalComplaints={stats.complaints.total || 0}
          totalDispatches={stats.totalDispatches || 0}
          totalReceives={stats.totalReceives || 0}
        />

        <ChartsSection
          purposeDistribution={chartData.purposeDistribution}
          sourceDistribution={chartData.sourceDistribution}
          complaintTypes={chartData.complaintTypes}
          callTypes={chartData.callTypes}
        />

        <div className="mb-6">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}

const VisitorDetailsModal = ({ visitor, onClose, onCheckIn, onCheckOut }: any) => {
  const { t } = useTranslation();
  const T = getPagesDataText(t);
  return (
    <>
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">{T.Visitor_Details}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{visitor.date}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <IconField name="FaTimes" size={16} />
          </button>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 gap-3 mb-4">
            {(
              [
                [T.Visitor_Name, visitor.visitorName],
                [T.Mobile_Number, visitor.phone],
                [T.Purpose, visitor.purpose],
                [T.Meeting_With, visitor.meetingWith],
                [T.In_Time, visitor.inTime || "—"],
                [T.Out_Time, visitor.outTime || "Not checked out"],
                [T.Number_Of_Person, visitor.numberOfPerson || "1"],
                [T.ID_Card, visitor.idCard || "N/A"],
              ] as [string, string][]
            ).map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">
                  {label}
                </p>
                <p className="text-sm font-semibold text-gray-800 break-words">
                  {val || "N/A"}
                </p>
              </div>
            ))}
          </div>

          {visitor.note && (
            <div className="mb-4">
              <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1">{T.Note}</p>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{visitor.note}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            {!visitor.outTime && (
              <Button
                name={visitor.inTime ? "Check Out" : "Check In"}
                onClick={() =>
                  visitor.inTime ? onCheckOut(visitor.id) : onCheckIn(visitor.id)
                }
                type="button"
                loading={false}
              />
            )}
            <Button name="Close" onClick={onClose} type="button" loading={false} />
          </div>
        </div>
      </div>
    </div>
  </>
  );
};

export default ReceptionistDashboard;