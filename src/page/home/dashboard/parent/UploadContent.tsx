import { useEffect, useState } from "react";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { openDocument } from "../../../../hooks/useBlobImage";
import { useTranslation } from "react-i18next";
import { getParentDashboardText, getPagesDataText } from "../../../../helpers/useTranslations";

// ── Interfaces matching actual API response ─────────────────────────────────

interface ContentType {
  contentTypeId: number;
  name: string;
  description: string;
}

interface SchoolClass {
  schoolClassId: number;
  className: string;
  sections: null | any[];
}

interface Section {
  sectionId: number;
  sectionName: string;
}

interface UploadContentItem {
  uploadContentId: number;
  title: string;
  description: string;
  filePath: string | null;
  referenceLink: string | null;
  contentType: ContentType;
  schoolClass: SchoolClass;
  section: Section;
}

interface VideoTutorial {
  videoTutorialId: number;
  title: string;
  description: string;
  videoLink: string;
  schoolClass: SchoolClass;
  section: Section;
}

interface UploadContentData {
  uploadContents: UploadContentItem[];
  videoTutorials: VideoTutorial[];
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

// ── Tab type ────────────────────────────────────────────────────────────────
type ActiveTab = "uploadContents" | "videoTutorials";

// ── Component ───────────────────────────────────────────────────────────────
const UploadContent: React.FC = () => {
  const [data, setData] = useState<UploadContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveTab>("uploadContents");
  const [page, setPage] = useState<number>(0);
  const size = 10;

  const { t } = useTranslation()
      const texts = getParentDashboardText(t)
      const T = getPagesDataText(t);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    fetchUploadContent();
    setExpandedItems(new Set());
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

  const fetchUploadContent = async () => {
    try {
      setLoading(true);
      const schoolCode = localStorage.getItem("schoolCode") || "";
      const response = await parentDashboardService.getUploadContent(
        schoolCode,
        selectedStudentId,
        page,
        size,
      );
      // response.data holds { uploadContents, videoTutorials }
      setData(response as unknown as UploadContentData);
      setError(null);
    } catch {
      setError("Failed to load uploaded content.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpansion = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-800 font-medium">{error}</p>
        <button
          onClick={fetchUploadContent}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {texts.Retry}
        </button>
      </div>
    );
  }

  const uploadContents = data?.uploadContents ?? [];
  const videoTutorials = data?.videoTutorials ?? [];
  const hasNoData = uploadContents.length === 0 && videoTutorials.length === 0;

  if (hasNoData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {texts.No_Uploaded_Content_Available}
        </h3>
        <p className="text-gray-600">
          {texts.No_content_has_been_uploaded_yet_for_your_children}
        </p>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-900">{texts.Uploaded_Content}</h2>

        <div className="flex items-center gap-3">
          <select
            value={selectedStudentId}
            onChange={(e) => {
              setPage(0);
              setSelectedStudentId(Number(e.target.value));
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          >
            <option value={0}>All Students</option>
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.firstName} {child.lastName} – {child.className}{" "}
                {child.section}
              </option>
            ))}
          </select>

          <button
            onClick={fetchUploadContent}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {texts.Refresh}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("uploadContents")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "uploadContents"
              ? "bg-purple-600 text-white border border-b-white"
              : "text-gray-600 hover:text-purple-600"
          }`}
        >
          {texts.Documents_And_Links}
          {uploadContents.length > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {uploadContents.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("videoTutorials")}
          className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === "videoTutorials"
              ? "bg-purple-600 text-white border border-b-white"
              : "text-gray-600 hover:text-purple-600"
          }`}
        >
          {texts.Video_Tutorials}
          {videoTutorials.length > 0 && (
            <span className="ml-2 bg-purple-100 text-purple-700 text-xs font-semibold px-2 py-0.5 rounded-full">
              {videoTutorials.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Upload Contents tab ─────────────────────────────────────────── */}
      {activeTab === "uploadContents" && (
        <>
          {uploadContents.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">{texts.No_documents_or_links_available}</p>
            </div>
          ) : (
            uploadContents.map((content) => {
              const isExpanded = expandedItems.has(content.uploadContentId);
              return (
                <div
                  key={content.uploadContentId}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 cursor-pointer"
                    onClick={() => toggleExpansion(content.uploadContentId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {content.title}
                        </h3>
                        <p className="text-purple-100 text-sm">
                          Class: {content.schoolClass.className} | Section:{" "}
                          {content.section.sectionName}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-purple-100 text-xs uppercase mb-1">
                            {T.Type}
                          </p>
                          <p className="text-white font-bold text-lg">
                            {content.contentType.name}
                          </p>
                        </div>
                        <span className="text-white text-xl">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {isExpanded && (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Title */}
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-purple-700 text-sm font-medium mb-1">
                            {T.Title}
                          </p>
                          <p className="text-xl font-bold text-purple-900">
                            {content.title}
                          </p>
                        </div>

                        {/* Content Type */}
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-blue-700 text-sm font-medium mb-1">
                            {T.Content_Type}
                          </p>
                          <p className="text-xl font-bold text-blue-900">
                            {content.contentType.name}
                          </p>
                          {content.contentType.description && (
                            <p className="text-blue-600 text-xs mt-1">
                              {content.contentType.description}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        {content.description && (
                          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                            <p className="text-green-700 text-sm font-medium mb-1">
                              {T.Description}
                            </p>
                            <p className="text-lg font-semibold text-green-900">
                              {content.description}
                            </p>
                          </div>
                        )}

                        {/* Class */}
                        <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <p className="text-orange-700 text-sm font-medium mb-1">
                            {T.Class}
                          </p>
                          <p className="text-xl font-bold text-orange-900">
                            {content.schoolClass.className}
                          </p>
                        </div>

                        {/* Section */}
                        <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                          <p className="text-teal-700 text-sm font-medium mb-1">
                            {T.Section}
                          </p>
                          <p className="text-xl font-bold text-teal-900">
                            {content.section.sectionName}
                          </p>
                        </div>
                      </div>

                      {/* File Download */}
                      {content.filePath && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  {texts.File_Attachment}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {content.filePath.split("/").pop() ||
                                    "Document"}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  openDocument(content.filePath!)
                                }
                                className="inline-flex items-center px-5 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                  />
                                </svg>
                               {texts.Download_File}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Reference Link */}
                      {content.referenceLink && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                              <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">
                                  {texts.Reference_Link}
                                </p>
                                <p className="text-xs text-blue-500 break-all">
                                  {content.referenceLink}
                                </p>
                              </div>
                              <a
                                href={content.referenceLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5 mr-2"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                                {texts.Open_Link}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}

      {/* ── Video Tutorials tab ─────────────────────────────────────────── */}
      {activeTab === "videoTutorials" && (
        <>
          {videoTutorials.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">{texts.No_video_tutorials_available}.</p>
            </div>
          ) : (
            videoTutorials.map((video) => {
              const isExpanded = expandedItems.has(video.videoTutorialId);
              return (
                <div
                  key={video.videoTutorialId}
                  className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-5 cursor-pointer"
                    onClick={() => toggleExpansion(video.videoTutorialId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {video.title}
                        </h3>
                        <p className="text-indigo-100 text-sm">
                          {T.Class}: {video.schoolClass.className} | {T.Section}:{" "}
                          {video.section.sectionName}
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Play icon badge */}
                        <div className="bg-white bg-opacity-20 rounded-full p-2">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        <span className="text-white text-xl">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Body */}
                  {isExpanded && (
                    <div className="p-6">
                      {video.description && (
                        <p className="text-gray-600 text-sm mb-4">
                          {video.description}
                        </p>
                      )}

                      {/* Embedded YouTube Player */}
                      <div className="relative w-full rounded-lg overflow-hidden border border-gray-200"
                           style={{ paddingTop: "56.25%" }}>
                        <iframe
                          src={video.videoLink}
                          title={video.title}
                          className="absolute inset-0 w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                          <p className="text-indigo-700 text-sm font-medium mb-1">
                            {T.Class}
                          </p>
                          <p className="text-xl font-bold text-indigo-900">
                            {video.schoolClass.className}
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-purple-700 text-sm font-medium mb-1">
                            {T.Section}
                          </p>
                          <p className="text-xl font-bold text-purple-900">
                            {video.section.sectionName}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </>
      )}
    </div>
  );
};

export default UploadContent;