import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import { IconField, Label } from "../../../components";
import Dropdown from "../../../components/controlled/Dropdown";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { TextareaField, URLInput } from "../../../components/controlled";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";
import { toast } from "react-toastify";

import {
  useFilterUploadContents,
  useCreateUploadContent,
  useUpdateUploadContent,
  useUpdateUploadContentDocument,
  useDeleteUploadContent,
} from "../../../hooks/queries/downloadCenter/useUploadContent";
import { useContentTypes } from "../../../hooks/queries/downloadCenter/useContentType";

import type {
  UploadContent,
  UploadContentFormData,
} from "../../../types/downloadCenter/UploadContent";

import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSections } from "../../../hooks/queries/academics/useSections";
import FileUploadField from "../../../components/controlled/FileUploadField";
import { openDocument } from "../../../hooks/useBlobImage";
import { confirmToast } from "../../../helpers/confirmToast";
import { usePermissions } from "../../../hooks/queries/usePermissions";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

interface AppliedFilter {
  classId: number;
  sectionId: number;
  searchText: string;
}

interface FormValues {
  classId: string;
  sectionId: string;
  title: string;
  contentTypeId: string;
  filePath?: File | null;
  referenceLink: string;
  description: string;
}

const isYoutubeUrl = (url: string): boolean => {
  if (!url) return false;
  return url.includes("youtube.com") || url.includes("youtu.be");
};

const convertToEmbedUrl = (url: string): string => {
  if (!isYoutubeUrl(url)) return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) return url;
      const videoId = parsed.searchParams.get("v");
      if (videoId) return `https://www.youtube.com/embed/${videoId}`;
      if (parsed.pathname.startsWith("/shorts/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
      }
    }
    return url;
  } catch {
    return url;
  }
};

const getVideoThumbnail = (url: string): string | null => {
  if (!isYoutubeUrl(url)) return null;
  try {
    const parsed = new URL(url);
    let videoId = "";
    if (parsed.hostname.includes("youtu.be")) {
      videoId = parsed.pathname.slice(1);
    } else if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/"))       videoId = parsed.pathname.split("/")[2];
      else if (parsed.pathname.startsWith("/shorts/")) videoId = parsed.pathname.split("/")[2];
      else videoId = parsed.searchParams.get("v") || "";
    }
    return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
  } catch {
    return null;
  }
};

interface ContentCardProps {
  item: UploadContent;
  classes: any[];
  hasReadPermission: boolean;
  hasUpdatePermission: boolean;
  hasDeletePermission: boolean;
  onView: (item: UploadContent) => void;
  onEdit: (item: UploadContent) => void;
  onDelete: (id: number) => void;
}

const ContentCard = ({
  item,
  classes,
  hasReadPermission,
  hasUpdatePermission,
  hasDeletePermission,
  onView,
  onEdit,
  onDelete,
}: ContentCardProps) => {
  const { data: cardSections = [] } = useSections(item.classId || 0);

  const className =
    item.schoolClass?.name ||
    (() => {
      const classObj = classes.find(
        (c) =>
          c.schoolClassId === item.classId ||
          c.classId === item.classId ||
          c.id === item.classId
      );
      return classObj
        ? classObj.className || classObj.name || String(item.classId)
        : String(item.classId);
    })();

  const sectionName =
    item.section?.name ||
    (() => {
      if (!item.sectionId) return null;
      const sectionObj = cardSections.find(
        (s: any) => s.id === item.sectionId || s.sectionId === item.sectionId
      );
      return sectionObj ? sectionObj.sectionName || sectionObj.name || null : null;
    })();

  const isVideo   = isYoutubeUrl(item.referenceLink || "");
  const thumbnail = isVideo ? getVideoThumbnail(item.referenceLink || "") : null;
  const { t } = useTranslation();
  const Text = getPagesDataText(t);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      {(hasReadPermission || hasUpdatePermission || hasDeletePermission) && (
        <div className="flex justify-end gap-2 mb-3">
          {hasReadPermission && (
            <button onClick={() => onView(item)} className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="View">
              <IconField name="FaEye" />
            </button>
          )}
          {hasUpdatePermission && (
            <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full" title="Edit">
              <IconField name="FaEdit" />
            </button>
          )}
          {hasDeletePermission && (
            <button onClick={() => onDelete(item.uploadContentId)} className="p-2 text-red-600 hover:bg-red-50 rounded-full" title="Delete">
              <IconField name="FaTrashAlt" />
            </button>
          )}
        </div>
      )}

      {isVideo && thumbnail ? (
        <div className="mb-3 overflow-hidden rounded-md">
          <img src={thumbnail} alt={item.title} className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300" />
        </div>
      ) : item.contentType?.name ? (
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
          <IconField name="FaFileAlt" />
          <span>{item.contentType.name}</span>
        </div>
      ) : null}

      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.title}</h3>
      {item.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <span>Class - {className}</span>
        {item.sectionId && sectionName && <span>Section - {sectionName}</span>}
        {item.sectionId && !sectionName && <span>• Section {item.sectionId}</span>}
      </div>

      {item.filePath && (
        <button
          onClick={() => openDocument(item.filePath!)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <IconField name="FaDownload" />
          {Text.Download}
        </button>
      )}
    </div>
  );
};
interface ViewModalProps {
  item: UploadContent;
  classes: any[];
  onClose: () => void;
}

const ViewModal = ({ item, classes, onClose }: ViewModalProps) => {
  const { data: modalSections = [] } = useSections(item.classId || 0);

  const className =
    item.schoolClass?.name ||
    (() => {
      const classObj = classes.find(
        (c) =>
          c.schoolClassId === item.classId ||
          c.classId === item.classId ||
          c.id === item.classId
      );
      return classObj
        ? classObj.className || classObj.name || String(item.classId)
        : String(item.classId);
    })();

  const sectionName =
    item.section?.name ||
    (() => {
      if (!item.sectionId) return null;
      const sectionObj = modalSections.find(
        (s: any) => s.id === item.sectionId || s.sectionId === item.sectionId
      );
      return sectionObj ? sectionObj.sectionName || sectionObj.name || null : null;
    })();
    const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const Page = getPagesNameText(t);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">{item.title}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full">
            <IconField name="FaTimes" size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {item.referenceLink && isYoutubeUrl(item.referenceLink) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Video Content</h3>
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <iframe
                  src={convertToEmbedUrl(item.referenceLink)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  title={item.title}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">{Page.Content_Share_List}</h3>
              <div className="space-y-2">
                <div className="flex">
                  <span className="font-medium w-32">{Page.Class}:</span>
                  <span>{className}</span>
                </div>
                {item.sectionId && (
                  <div className="flex">
                    <span className="font-medium w-32">{Page.Section}:</span>
                    <span>{sectionName ?? `Section ${item.sectionId}`}</span>
                  </div>
                )}
                <div className="flex">
                  <span className="font-medium w-32">{Page.Content_Type}:</span>
                  <span>{item.contentType?.name || "N/A"}</span>
                </div>
                {item.referenceLink && (
                  <div className="flex">
                    <span className="font-medium w-32">Reference_Link:</span>
                    <a
                      href={item.referenceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {item.referenceLink}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {item.filePath && (
              <div>
                <h3 className="text-lg font-semibold mb-3">{Text.document}</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-3">'This_content_includes_a_downloadable_document'</p>
                  <button
                    onClick={() => openDocument(item.filePath!)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <IconField name="FaDownload" />
                    {Text.Download}
                  </button>
                </div>
              </div>
            )}
          </div>

          {item.description && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="text-lg font-semibold mb-3">{Text.Description}</h3>
              <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const UploadShareContent = () => {
  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const Page = getPagesNameText(t);

  const { canCreate, canUpdate, canDelete, canRead } = usePermissions();
  const PERMISSION_SCOPE = "DOWNLOAD_CENTRE";
  const hasCreatePermission = canCreate(PERMISSION_SCOPE);
  const hasUpdatePermission = canUpdate(PERMISSION_SCOPE);
  const hasDeletePermission = canDelete(PERMISSION_SCOPE);
  const hasReadPermission   = canRead(PERMISSION_SCOPE);

  const [page, setPage] = useState(0);
  const PAGE_SIZE = 12;
  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
  const {
    control:  filterControl,
    handleSubmit: handleFilterSubmit,
    reset:    filterReset,
    watch:    filterWatch,
  } = useForm<FieldValues>({
    defaultValues: {
      filterClassId:   "",
      filterSectionId: "",
      filterSearch:    "",
    },
  });

  const watchedFilterClassId = filterWatch("filterClassId");
  useEffect(() => {
    filterReset((prev) => ({ ...prev, filterSectionId: "" }));
  }, [watchedFilterClassId]);
  const { data: filterSectionsData = [] } = useSections(Number(watchedFilterClassId) || 0);

  const filterSectionOptions = filterSectionsData.map((s) => ({
    label: s.sectionName,
    value: String(s.id),
  }));
  const needsBackendFilter =
    appliedFilter !== null &&
    (appliedFilter.classId > 0 ||
      appliedFilter.sectionId > 0 ||
      appliedFilter.searchText.length > 0);

  const filterParams = {
    page,
    size: PAGE_SIZE,
    sortDirection: "asc" as const,
    ...(appliedFilter && appliedFilter.classId   > 0 ? { classId:   appliedFilter.classId }   : {}),
    ...(appliedFilter && appliedFilter.sectionId > 0 ? { sectionId: appliedFilter.sectionId } : {}),
    ...(appliedFilter && appliedFilter.searchText     ? { search: appliedFilter.searchText }   : {}),
  };
  const { data: filterResponse, isLoading, isFetching } =
    useFilterUploadContents(needsBackendFilter ? filterParams : { page, size: PAGE_SIZE, sortDirection: "asc" });

  const { data: contentTypes = [] } = useContentTypes();
  const { data: classes      = [] } = useSchoolClasses();

  const uploadContents: UploadContent[] = filterResponse?.uploadContents ?? [];
  const totalPages: number              = filterResponse?.totalPages      ?? 1;

  const classOptions = classes.map((c) => ({
    label: c.className,
    value: String(c.schoolClassId),
  }));

  const contentTypeOptions = contentTypes.map((ct) => ({
    label: ct.name,
    value: String(ct.contentTypeId),
  }));

  const isSearching = needsBackendFilter && isFetching;
  const isFilterActive = appliedFilter !== null;

  const handleApplyFilters = (data: FieldValues) => {
    const classId    = Number(data.filterClassId)   || 0;
    const sectionId  = Number(data.filterSectionId) || 0;
    const searchText = data.filterSearch?.trim()    || "";

    if (classId === 0 && sectionId === 0 && searchText === "") {
      setAppliedFilter(null);
      setPage(0);
      return;
    }

    setAppliedFilter({ classId, sectionId, searchText });
    setPage(0);
  };

  const handleClearFilters = () => {
    filterReset({
      filterClassId:   "",
      filterSectionId: "",
      filterSearch:    "",
    });
    setAppliedFilter(null);
    setPage(0);
  };
  const createMutation         = useCreateUploadContent();
  const updateMutation         = useUpdateUploadContent();
  const updateDocumentMutation = useUpdateUploadContentDocument();
  const deleteMutation         = useDeleteUploadContent();

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId,     setEditingId]     = useState<number | null>(null);
  const [selectedItem,  setSelectedItem]  = useState<UploadContent | null>(null);

  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      classId: "", sectionId: "", title: "", contentTypeId: "",
      filePath: null, referenceLink: "", description: "",
    },
  });

  const selectedFormClass  = watch("classId");
  const referenceLinkValue = watch("referenceLink");

  const { data: formSectionsData = [] } = useSections(
    selectedFormClass ? Number(selectedFormClass) : 0
  );

  const formSectionOptions = formSectionsData.map((s) => ({
    label: s.sectionName,
    value: String(s.id),
  }));

  useEffect(() => {
    if (selectedFormClass && !editingId) setValue("sectionId", "");
  }, [selectedFormClass, editingId, setValue]);

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (editingId && !hasUpdatePermission) {
      toast.error("You don't have permission to update content"); return;
    }
    if (!editingId && !hasCreatePermission) {
      toast.error("You don't have permission to create content"); return;
    }
    if (!formData.classId)       { toast.error("Please select a class");        return; }
    if (!formData.title?.trim()) { toast.error("Please enter a title");         return; }
    if (!formData.contentTypeId) { toast.error("Please select a content type"); return; }
    if (!formData.filePath && !formData.referenceLink) {
      toast.error("Either file or reference link is required"); return;
    }

    try {
      const payload: UploadContentFormData = {
        title:         formData.title,
        classId:       String(formData.classId),
        sectionId:     String(formData.sectionId),
        contentTypeId: String(formData.contentTypeId),
        referenceLink: formData.referenceLink,
        description:   formData.description,
        filePath:      null,
      };

      const documentFile =
        formData.filePath instanceof FileList
          ? formData.filePath[0]
          : formData.filePath;

      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        if (documentFile instanceof File) {
          await updateDocumentMutation.mutateAsync({ id: editingId, file: documentFile });
        }
        toast.success("Content updated successfully!");
      } else {
        await createMutation.mutateAsync({ ...payload, filePath: documentFile ?? null });
        toast.success("Content created successfully!");
      }
      resetForm();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        toast.error("This content already exists.");
      } else if (error?.response?.status === 400) {
        const msg = error?.response?.data?.message || error?.message || "";
        toast.error(
          msg.toLowerCase().includes("already exists") || msg.toLowerCase().includes("duplicate")
            ? "Duplicate title in the same class/section."
            : msg || "Invalid data. Please check all fields."
        );
      } else {
        toast.error(error?.message || "Operation failed. Please try again.");
      }
    }
  };

  const resetForm = () => {
    reset({
      classId: "", sectionId: "", title: "", contentTypeId: "",
      filePath: null, referenceLink: "", description: "",
    });
    setEditingId(null);
    setShowFormModal(false);
  };

  const handleEdit = (item: UploadContent) => {
    if (!hasUpdatePermission) { toast.error("You don't have permission to edit content"); return; }
    setEditingId(item.uploadContentId);
    setValue("classId", String(item.classId));
    setTimeout(() => {
      setValue("sectionId",     item.sectionId ? String(item.sectionId) : "");
      setValue("title",         item.title);
      setValue("contentTypeId", String(item.contentTypeId));
      setValue("referenceLink", item.referenceLink || "");
      setValue("description",   item.description  || "");
      setValue("filePath",      null);
    }, 100);
    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!hasDeletePermission) { toast.error("You don't have permission to delete content"); return; }
    if (await confirmToast("Do you want to delete this content?")) {
      try {
        await deleteMutation.mutateAsync({ ids: [id] });
        toast.success("Content deleted successfully!");
      } catch (error: any) {
        toast.error(error?.message || "Failed to delete content.");
      }
    }
  };

  const handleAddNew = () => {
    if (!hasCreatePermission) { toast.error("You don't have permission to create content"); return; }
    resetForm();
    setShowFormModal(true);
  };

  const handleView = (item: UploadContent) => {
    if (!hasReadPermission) { toast.error("You don't have permission to view content"); return; }
    setSelectedItem(item);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {Text.DC_Content_List || "Content List"}
        </h2>
        {hasCreatePermission && (
          <Button
            name={Text.Add || "Add Content"}
            onClick={handleAddNew}
            icon={<IconField name="FaPlus" className="mr-2" />}
            loading={false}
            showAlways={true}
          />
        )}
      </div>
    <AllSchoolDropdown onSubmit={handleFilterSubmit(handleApplyFilters)} queryKeys={['sections','schoolClasses']}>
  <div className="bg-white p-4 rounded-xl shadow mb-4">
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap lg:flex-nowrap">

      <div className="w-full sm:w-[calc(50%-8px)] lg:flex-1">
        <Dropdown
          name="filterClassId"
          label={Text.Class}
          control={filterControl}
          required={false}
          options={classOptions}
        />
      </div>

      <div className="w-full sm:w-[calc(50%-8px)] lg:flex-1">
        <Dropdown
          name="filterSectionId"
          label={Page.Section}
          control={filterControl}
          required={false}
          disabled={!watchedFilterClassId}
          options={filterSectionOptions}
        />
      </div>

      <div className="w-full lg:flex-1">
        <TextField
          name="filterSearch"
          label={Text.Search_By_Title || "Search by Title"}
          control={filterControl}
          placeholder='Enter_title'
        />
      </div>

    </div>
  </div>
  <div className="flex justify-end gap-3 mb-6">
    <Button
      onClick={handleClearFilters}
      name={Text.Clear_Filters || "Clear Filters"}
      loading={false}
      icon={<IconField name="FaTimes" />}
      type="button"
      showAlways = {true}
    />
    <Button
      name={Text.Search || "Search"}
      loading={isSearching}
      icon={<IconField name="FaSearch" />}
      type="submit"
      showAlways = {true}
    />
  </div>
</AllSchoolDropdown>

      <hr className="border-gray-300 mb-6" />
      <div className="relative">
        {isSearching && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
            <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-32 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {uploadContents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {isFilterActive ? "No content matches your search" : "No content found"}
                  </p>
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="mt-3 text-blue-600 hover:underline text-sm"
                    >
                      {Text.Clear_Filters || "Clear Filters"}
                    </button>
                  )}
                </div>
              ) : (
                uploadContents.map((item) => (
                  <ContentCard
                    key={item.uploadContentId}
                    item={item}
                    classes={classes}
                    hasReadPermission={hasReadPermission}
                    hasUpdatePermission={hasUpdatePermission}
                    hasDeletePermission={hasDeletePermission}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || isFetching}
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      disabled={isFetching}
                      className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1 || isFetching}
                  className="px-4 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
      {showFormModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "Edit Content" : "Add New Content"}
              </h2>
              <button onClick={resetForm} className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full">
                <IconField name="FaTimes" size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} queryKeys={['sections','schoolClasses']}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <Dropdown
                    name="classId"
                    label={Text.Class}
                    control={control}
                    required
                    options={classOptions}
                  />

                  <Dropdown
                    name="sectionId"
                    label={Page.Section}
                    control={control}
                    disabled={!selectedFormClass}
                    options={[
                      { label: selectedFormClass ? "All Sections" : "Select class first", value: "" },
                      ...formSectionOptions,
                    ]}
                  />

                  <div className="md:col-span-2">
                    <TextField
                      name="title"
                      label={Text.Title}
                      control={control}
                      required
                      placeholder='Enter_title'
                    />
                  </div>

                  <Dropdown
                    name="contentTypeId"
                    label={Page.Content_Type}
                    control={control}
                    required
                    options={contentTypeOptions}
                  />

                  <URLInput
                    name="referenceLink"
                    label= "Reference Link"
                    control={control}
                    required
                    placeholder="https://www.youtube.com/watch?v=..."
                  />

                  {referenceLinkValue && isYoutubeUrl(referenceLinkValue) && (
                    <div className="md:col-span-2">
                      <Label label={Text.Video_Preview || "Video Preview"} />
                      <div className="mt-2 bg-gray-100 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">
                           "This appears to be a YouTube link. It will be embedded as a video."
                        </p>
                        {getVideoThumbnail(referenceLinkValue) && (
                          <img
                            src={getVideoThumbnail(referenceLinkValue)!}
                            alt="YouTube thumbnail"
                            className="w-48 h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <FileUploadField
                      name="filePath"
                      label={Text.Upload_Document || "Upload Document (Optional)"}
                      control={control}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <TextareaField
                      name="description"
                      label={Text.Description}
                      control={control}
                      placeholder={Text.Description_Plaseholder}
                    />
                  </div>

                  <div className="md:col-span-2 flex justify-end gap-3 pt-4 border-t mt-4">
                    <Button name="Cancel" onClick={resetForm} loading={false} type="button" />
                    <Button
                      name={editingId ? "Update" : "Save"}
                      type="submit"
                      loading={createMutation.isPending || updateMutation.isPending}
                    />
                  </div>
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </div>
      )}
      {selectedItem && (
        <ViewModal
          item={selectedItem}
          classes={classes}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
};

export default UploadShareContent;