import { useState, useEffect } from "react";
import { useForm, type SubmitHandler, type FieldValues } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { URLInput } from "../../../components/controlled";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";
import {
  useFilterVideoTutorials,
  useCreateVideoTutorial,
  useUpdateVideoTutorial,
  useDeleteVideoTutorial,
} from "../../../hooks/queries/downloadCenter/useVideoTutorial";
import type { VideoTutorial } from "../../../types/downloadCenter/VideoTutorial";
import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSections } from "../../../hooks/queries/academics/useSections";
import { confirmToast } from "../../../helpers/confirmToast";
import { usePermissions } from "../../../hooks/queries/usePermissions";
import { toast } from "react-toastify";
import type { VideoTutorialFilterParams } from "../../../services/downloadCenter/videoTutorialServices";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";
interface FormValues {
  classId: string;
  sectionId: string;
  title: string;
  description: string;
  videoLink: string;
}

interface AppliedFilter {
  classId: number;
  sectionId: number;
  searchText: string;
}

const convertToEmbedUrl = (url: string): string => {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${parsed.pathname.slice(1)}`;
    }

    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
      const videoId = parsed.searchParams.get("v");
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
      }
    }

    return url;
  } catch {
    return url;
  }
};

const VideoTutorialList = () => {
  const { t } = useTranslation();
  const View_Text = getPagesDataText(t);
  const Edit_Text = getPagesDataText(t);
  const Delete_Text = getPagesDataText(t);
  const Text = getPagesDataText(t);
  const Page = getPagesNameText(t);

  const { canCreate, canUpdate, canDelete, canRead } = usePermissions();
  const PERMISSION_SCOPE = "DOWNLOAD_CENTRE";

  const hasCreatePermission = canCreate(PERMISSION_SCOPE);
  const hasUpdatePermission = canUpdate(PERMISSION_SCOPE);
  const hasDeletePermission = canDelete(PERMISSION_SCOPE);
  const hasReadPermission = canRead(PERMISSION_SCOPE);

  const [appliedFilter, setAppliedFilter] = useState<AppliedFilter | null>(null);
  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: filterReset,
    watch: filterWatch,
  } = useForm<FieldValues>({
    defaultValues: {
      filterClassId: "",
      filterSectionId: "",
      filterSearch: "",
    },
  });

  const watchedFilterClassId = filterWatch("filterClassId");
  const { data: filterSectionsData, isLoading: isFilterSectionsLoading } = useSections(
    Number(watchedFilterClassId) || 0
  );

  const needsBackendFilter =
    appliedFilter !== null &&
    (appliedFilter.classId > 0 ||
      appliedFilter.sectionId > 0 ||
      appliedFilter.searchText.length > 0);

  const filterParams: VideoTutorialFilterParams = {
    ...(appliedFilter && appliedFilter.classId > 0 && { classId: appliedFilter.classId }),
    ...(appliedFilter && appliedFilter.sectionId > 0 && { sectionId: appliedFilter.sectionId }),
    search: appliedFilter?.searchText ?? "",
  };
  const { data: videos = [], isLoading: isVideosLoading } = useFilterVideoTutorials(
    needsBackendFilter ? filterParams : {}
  );
 const { data: classesData, isLoading: isClassesLoading } = useSchoolClasses();
  const isSearching = needsBackendFilter && isVideosLoading;
  const createMutation = useCreateVideoTutorial();
  const updateMutation = useUpdateVideoTutorial();
  const deleteMutation = useDeleteVideoTutorial();
  const { control, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      classId: "",
      sectionId: "",
      title: "",
      description: "",
      videoLink: "",
    },
  });

  const [selectedVideo, setSelectedVideo] = useState<VideoTutorial | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);

  const selectedFormClass = watch("classId");
  const { data: formSectionsData } = useSections(Number(selectedFormClass) || 0);

  useEffect(() => {
    if (selectedFormClass && !editingId) {
      setValue("sectionId", "");
    }
  }, [selectedFormClass, editingId, setValue]);
  const handleApplyFilters = (data: FieldValues) => {
    const classId = Number(data.filterClassId) || 0;
    const sectionId = Number(data.filterSectionId) || 0;
    const searchText = data.filterSearch?.trim() || "";
    if (classId === 0 && sectionId === 0 && searchText === "") {
      setAppliedFilter(null);
      return;
    }

    setAppliedFilter({ classId, sectionId, searchText });
  };

  const handleClearFilters = () => {
    filterReset({
      filterClassId: "",
      filterSectionId: "",
      filterSearch: "",
    });
    setAppliedFilter(null);
  };

  const isFilterActive = appliedFilter !== null;
 const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    if (editingId && !hasUpdatePermission) {
      toast.error("You don't have permission to update video tutorials");
      return;
    }
    if (!editingId && !hasCreatePermission) {
      toast.error("You don't have permission to create video tutorials");
      return;
    }
    if (!formData.classId) {
      toast.error("Please select a class");
      return;
    }
    if (!formData.sectionId) {
      toast.error("Please select a section");
      return;
    }
    if (!formData.title?.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!formData.videoLink?.trim()) {
      toast.error("Please enter a video link");
      return;
    }

    const isDuplicate = videos.some(
      (video) =>
        video.title.toLowerCase() === formData.title.toLowerCase() &&
        String(video.classId) === formData.classId &&
        String(video.sectionId) === formData.sectionId &&
        video.videoTutorialId !== editingId
    );

    if (isDuplicate) {
      toast.error(
        `A video tutorial with title "${formData.title}" already exists in this class and section`
      );
      return;
    }

    const payload = {
      ...formData,
      videoLink: convertToEmbedUrl(formData.videoLink),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Video tutorial updated successfully!");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Video tutorial added successfully!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error managing video tutorial:", error);

      if (error?.response?.status === 409) {
        toast.error(
          "This video tutorial already exists. Please check the title, class, and section."
        );
      } else if (error?.response?.status === 400) {
        const errorMessage = error?.response?.data?.message || error?.message;

        if (
          errorMessage?.toLowerCase().includes("already exists") ||
          errorMessage?.toLowerCase().includes("duplicate")
        ) {
          toast.error(
            "This video tutorial already exists in the system. Please use a different title."
          );
        } else if (errorMessage?.toLowerCase().includes("title")) {
          toast.error("Invalid or duplicate title");
        } else if (errorMessage?.toLowerCase().includes("video")) {
          toast.error("Invalid video link or video already exists");
        } else {
          toast.error(errorMessage || "Invalid data. Please check all fields and try again.");
        }
      } else {
        toast.error(error?.message || "Operation failed. Please try again.");
      }
    }
  };

  const resetForm = () => {
    reset({
      classId: "",
      sectionId: "",
      title: "",
      description: "",
      videoLink: "",
    });
    setEditingId(null);
    setShowFormModal(false);
  };

  const handleEdit = (video: VideoTutorial) => {
    if (!hasUpdatePermission) {
      toast.error("You don't have permission to edit video tutorials");
      return;
    }
    setEditingId(video.videoTutorialId);
    setValue("classId", String(video.classId));
    setValue("title", video.title);
    setValue("videoLink", video.videoLink);
    setValue("description", video.description || "");

    setTimeout(() => {
      setValue("sectionId", String(video.sectionId));
    }, 100);

    setShowFormModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!hasDeletePermission) {
      toast.error("You don't have permission to delete video tutorials");
      return;
    }
    if (await confirmToast("Do you want to delete this entry?")) {
      try {
        await deleteMutation.mutateAsync(id);
        toast.success("Video tutorial deleted successfully!");
      } catch (error: any) {
        console.error("Error deleting video tutorial:", error);
        toast.error(error?.message || "Failed to delete video tutorial.");
      }
    }
  };

  const handleAddNew = () => {
    if (!hasCreatePermission) {
      toast.error("You don't have permission to create video tutorials");
      return;
    }
    resetForm();
    setShowFormModal(true);
  };

  const handleView = (video: VideoTutorial) => {
    if (!hasReadPermission) {
      toast.error("You don't have permission to view video tutorials");
      return;
    }
    setSelectedVideo(video);
  };
  const isLoading = isClassesLoading || isFilterSectionsLoading;
  const isFormLoading = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading video tutorials...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">{Text.Video_Tutorial_List}</h2>
        {hasCreatePermission && (
          <Button
            name={Text.Add}
            loading={false}
            onClick={handleAddNew}
            showAlways={true}
          />
        )}
      </div>
      <AllSchoolDropdown onSubmit={handleFilterSubmit(handleApplyFilters)} queryKeys={['sections','schoolClasses']}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Dropdown
            label={Text.Class}
            name="filterClassId"
            control={filterControl}
            required={false}
            options={
              classesData?.map((c) => ({
                value: String(c.id),
                label: c.className,
              })) || []
            }
          />
          <Dropdown
            label={Page.Section}
            name="filterSectionId"
            control={filterControl}
            required={false}
            options={
              filterSectionsData?.map((s) => ({
                value: String(s.id),
                label: s.sectionName,
              })) || []
            }
          />
          <TextField
            label={Text.Search_By_Title}
            name="filterSearch"
            placeholder={Text.Search_By_Title}
            control={filterControl}
          />
        </div>
        <div className="flex justify-end gap-2 mb-4">
          <Button
            onClick={handleClearFilters}
            name={Text.Clear_Filters}
            loading={false}
            icon={<IconField name="FaTimes" />}
            type="button"
            showAlways = {true}
          />
          <Button
            name={Text.Search}
            loading={isSearching}
            icon={<IconField name="FaSearch" />}
            type="submit"
            showAlways = {true}
          />
        </div>
      </AllSchoolDropdown>

      <hr className="border-gray-300 mb-6" />
      {showFormModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-md w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={resetForm}
              className="absolute top-3 right-3 text-gray-700 hover:text-black"
            >
              <IconField name="FaTimes" />
            </button>
            <div className="p-6 mb-5">
              <h2 className="text-xl font-semibold mb-4">
                {editingId ? Text.Edit : Text.Add}
              </h2>
              <AllSchoolDropdown 
                onSubmit={handleSubmit(onSubmit)} queryKeys={['sections','schoolClasses']}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <Dropdown
                  name="classId"
                  label={Text.Class}
                  control={control}
                  required
                  options={
                    classesData?.map((c) => ({
                      label: c.className,
                      value: String(c.id),
                    })) || []
                  }
                />

                <Dropdown
                  name="sectionId"
                  label={Page.Section}
                  control={control}
                  required
                  options={
                    formSectionsData?.map((s) => ({
                      label: s.sectionName,
                      value: String(s.id),
                    })) || []
                  }
                />

                <TextField
                  name="title"
                  label={Text.title}
                  control={control}
                  placeholder="Enter title"
                  required
                />

                <URLInput
                  name="videoLink"
                  label={Text.Upload_Youtube_Video}
                  control={control}
                  required
                />

                <div className="sm:col-span-2">
                  <TextField
                    name="description"
                    label={Text.Description}
                    placeholder="Enter description"
                    control={control}
                  />
                </div>

                <div className="sm:col-span-2 flex gap-2 justify-end pt-4 border-t mt-4">
                  <Button
                    name={editingId ? Text.Update : Text.Save}
                    loading={isFormLoading}
                    icon={<IconField name="FaSave" />}
                    type="submit"
                  />
                  {editingId && (
                    <Button
                      name={Text.Cancel}
                      loading={false}
                      icon={<IconField name="FaTimes" />}
                      type="button"
                      onClick={resetForm}
                    />
                  )}
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </div>
      )}
      <div className="relative">
        {isSearching && (
          <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
            <span className="text-sm text-gray-500 animate-pulse">Updating</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                {isFilterActive
                  ? View_Text.No_video_tutorials_found_for_the_applied_filters
                  : View_Text.No_video_tutorials_found}
              </p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.videoTutorialId}
                className="border rounded p-4 bg-gray-100 shadow-sm"
              >
                {(hasReadPermission || hasUpdatePermission || hasDeletePermission) && (
                  <div className="mb-2 grid max-sm:grid-cols-2 md:grid-cols-2 gap-2 lg:grid-cols-3">
                    {hasReadPermission && (
                      <button
                        onClick={() => handleView(video)}
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm flex items-center justify-center hover:bg-green-600 transition-colors"
                      >
                        <IconField name="FaEye" className="mr-1" />
                        {View_Text.View}
                      </button>
                    )}
                    {hasUpdatePermission && (
                      <button
                        onClick={() => handleEdit(video)}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm flex items-center justify-center hover:bg-blue-600 transition-colors"
                      >
                        <IconField name="FaEdit" className="mr-1" />
                        {Edit_Text.Edit}
                      </button>
                    )}
                    {hasDeletePermission && (
                      <button
                        onClick={() => handleDelete(video.videoTutorialId)}
                        disabled={deleteMutation.isPending}
                        className="bg-red-600 text-white px-2 py-1 rounded text-sm flex items-center justify-center disabled:opacity-50 hover:bg-red-700 transition-colors"
                      >
                        <IconField name="FaTrashAlt" className="mr-1" />
                        {Delete_Text.Delete}
                      </button>
                    )}
                  </div>
                )}
                <h3 className="font-bold mb-1">{video.title}</h3>
                <p className="text-sm text-gray-700 mb-2">{video.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-3 right-3 text-lg text-gray-700 hover:text-black"
            >
              <IconField name="FaTimes" />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{selectedVideo.title}</h2>
              <p>
                <strong>{Text.class}:</strong>{" "}
                {selectedVideo.schoolClass?.name || selectedVideo.classId}
              </p>
              <p>
                <strong>{Page.Section}:</strong>{" "}
                {selectedVideo.section?.name || selectedVideo.sectionId}
              </p>
              <p>
                <strong>{Text.Description}:</strong> {selectedVideo.description}
              </p>
              <div className="mt-4">
                <p className="font-semibold mb-2">{Text.Video_Preview}:</p>
                <div className="aspect-video">
                  <iframe
                    src={selectedVideo.videoLink}
                    className="w-full h-full rounded"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    title={selectedVideo.title}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTutorialList;