import { useEffect, useState } from "react";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { useTranslation } from "react-i18next";
import { getParentDashboardText, getPagesDataText } from "../../../../helpers/useTranslations";

// ── Interfaces matching actual API response ─────────────────────────────────

interface SchoolClass {
  schoolClassId: number;
  className: string;
  sections: null | any[];
}

interface Session {
  sessionId: number;
  sessionName: string;
}

interface EventItem {
  eventsId: number;
  eventTitle: string;
  fromDate: string;
  toDate: string;
  schoolClass: SchoolClass | null;
  session: Session | null;
}

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

// ── Helpers ─────────────────────────────────────────────────────────────────

const isSameDay = (from: string, to: string) => from === to;

const isUpcoming = (fromDate: string): boolean => {
  // fromDate is "DD/MM/YYYY"
  const [d, m, y] = fromDate.split("/").map(Number);
  return new Date(y, m - 1, d) >= new Date(new Date().setHours(0, 0, 0, 0));
};

// ── Component ────────────────────────────────────────────────────────────────
const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const size = 10;
  const { t } = useTranslation()
      const texts = getParentDashboardText(t)
      const T = getPagesDataText(t);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [selectedStudentId, page]);

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

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const schoolCode = localStorage.getItem("schoolCode") || "";
      const response = await parentDashboardService.getEvent(
        schoolCode,
        selectedStudentId,
        page,
        size,
      );
      // API returns data as a flat array
      setEvents((response as unknown as EventItem[]) ?? []);
      setError(null);
    } catch {
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

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
        <button
          onClick={fetchEvents}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {texts.Retry}
        </button>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (events.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900">{texts.No_Events_Available}</h3>
          <p className="text-gray-600">{texts.No_events_have_been_scheduled_yet}.</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{texts.Events}</h2>

        <div className="flex items-center gap-3">
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setPage(0);
              setSelectedStudentId(Number(e.target.value));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value={0}>{texts.All_Students}</option>
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.firstName} {child.lastName} – {child.className} {child.section}
              </option>
            ))}
          </select>

          <button
            onClick={fetchEvents}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {texts.Refresh}
          </button>
        </div>
      </div>

      {/* Event Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {events.map((event) => {
          const upcoming = isUpcoming(event.fromDate);
          const singleDay = isSameDay(event.fromDate, event.toDate);

          return (
            <div
              key={event.eventsId}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col"
            >
              {/* Coloured top stripe */}
              <div className={`h-2 w-full ${upcoming ? "bg-emerald-500" : "bg-gray-400"}`} />

              <div className="p-5 flex flex-col gap-4 flex-1">
                {/* Title row */}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-gray-900 font-bold text-lg leading-snug flex-1">
                    {event.eventTitle}
                  </h3>
                  <span
                    className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      upcoming
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {upcoming ? texts.UpComing : texts.Past}
                  </span>
                </div>

                {/* Date block */}
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <svg
                    className="w-5 h-5 text-emerald-600 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {singleDay ? (
                    <p className="text-emerald-800 font-semibold text-sm">
                      {event.fromDate}
                    </p>
                  ) : (
                    <p className="text-emerald-800 font-semibold text-sm">
                      {event.fromDate}
                      <span className="mx-2 text-emerald-400">→</span>
                      {event.toDate}
                    </p>
                  )}
                </div>

                {/* Class / Session pills — shown only when present */}
                {(event.schoolClass || event.session) && (
                  <div className="flex flex-wrap gap-2">
                    {event.schoolClass && (
                      <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full border border-blue-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {T.Class} {event.schoolClass.className}
                      </span>
                    )}
                    {event.session && (
                      <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full border border-purple-100">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {event.session.sessionName}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Events;