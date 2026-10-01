import React, { useState } from "react";
import { useForm, type FieldValues, type SubmitHandler } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Dropdown from "../../../components/controlled/Dropdown";
import { Button } from "../../../components/controlled";
import IconField from "../../../components/controlled/IconField";

import {
  getPagesDataText,
  getPagesNameText,
} from "../../../helpers/useTranslations";

import {
  useAddTopic,
  useDeleteMultipleTopics,
  useDeleteTopic,
  useTopics,
  useUpdateTopic,
  useFilterTopics,
} from "../../../hooks/queries/lessonPlan/useTopics";
import type { FilterTopicDto } from "../../../services/lessonPlan/topicService";

import { useSchoolClasses } from "../../../hooks/queries/academics/useClasses";
import { useSections } from "../../../hooks/queries/academics/useSections";
import {
  useSubjectGroupsByClass,
  useSubjectsByGroup,
} from "../../../hooks/queries/academics/useSubjectGroup";
import type { Topic } from "../../../types/lessonPlan/topic";
import type { TopicFormData } from "../../../types/lessonPlan/topic";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

interface ExtendedFormData extends TopicFormData {
  formClassId?: string;
}

type TopicItem = {
  id: number;
  topicName: string;
};

const TopicPage: React.FC = () => {
  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const NameText = getPagesNameText(t);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [activeFilters, setActiveFilters] = useState<FilterTopicDto>({});
  const [isFiltering, setIsFiltering] = useState(false);

  const [editId, setEditId] = useState<string | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const [filterClassId, setFilterClassId] = useState<number>(0);
  const [formClassId, setFormClassId] = useState<number>(0);
  const [formSubjectGroupId, setFormSubjectGroupId] = useState<string>("");
  const [filterSubjectGroupId, setFilterSubjectGroupId] = useState<string>("");

  const [topicItems, setTopicItems] = useState<TopicItem[]>([
    { id: Date.now(), topicName: "" },
  ]);

  const { data: classList = [] } = useSchoolClasses();
  const { data: filterSections = [] } = useSections(filterClassId);
  const { data: formSections = [] } = useSections(formClassId);

  const { data: formSubjectGroups = [] } = useSubjectGroupsByClass(
    formClassId ? formClassId.toString() : undefined
  );
  const { data: filterSubjectGroups = [] } = useSubjectGroupsByClass(
    filterClassId ? filterClassId.toString() : undefined
  );

  const { data: formSubjects = [] } = useSubjectsByGroup(formSubjectGroupId || undefined);
  const { data: filterSubjects = [] } = useSubjectsByGroup(filterSubjectGroupId || undefined);

  const {
    data: allTopicsResponse,
    isLoading: allLoading,
    isFetching: allFetching,
  } = useTopics(page, pageSize, "asc", { enabled: !isFiltering });

  const {
    data: filteredTopicsResponse,
    isLoading: filterLoading,
    isFetching: filterFetching,
  } = useFilterTopics(activeFilters, page, pageSize, undefined, "asc", isFiltering);

  const response = isFiltering ? filteredTopicsResponse : allTopicsResponse;
  const topics: Topic[] = response?.topics ?? [];
  const totalItems = response?.totalItems ?? 0;
  const totalPages = response?.totalPages ?? 0;
  const isLoading = isFiltering ? filterLoading : allLoading;
  const isFetching = isFiltering ? filterFetching : allFetching;

  const { mutateAsync: addTopic, isPending: isAdding } = useAddTopic();
  const { mutateAsync: updateTopic, isPending: isUpdating } = useUpdateTopic();
  const { mutateAsync: deleteTopic } = useDeleteTopic();
  const { mutateAsync: deleteMultipleTopics } = useDeleteMultipleTopics();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch: watchForm,
  } = useForm<ExtendedFormData>({
    defaultValues: {
      topicName: "",
      schoolClassId: "",
      sectionId: "",
      subjectGroupId: "",
      subjectId: "",
      formClassId: "",
    },
  });


  React.useEffect(() => {
    const sub = watchForm((value, { name }) => {
      if (name === "schoolClassId" && value.schoolClassId) {
        setFormClassId(Number(value.schoolClassId));
        if (!editId) {
          setValue("sectionId", "");
          setValue("subjectGroupId", "");
          setValue("subjectId", "");
          setFormSubjectGroupId("");
        }
      }
      if (name === "subjectGroupId") {
        setFormSubjectGroupId(value.subjectGroupId ?? "");
        if (!editId) setValue("subjectId", "");
      }
    });
    return () => sub.unsubscribe();
  }, [watchForm, setValue, editId]);


  React.useEffect(() => {
    if (editId && formSections.length > 0) {
      const current = watchForm("sectionId");
      if (current) setValue("sectionId", current);
    }
  }, [formSections, editId, setValue, watchForm]);


  React.useEffect(() => {
    if (editId && formSubjectGroups.length > 0) {
      const topic = topics.find((t) => t.topicId === editId);
      if (topic) {
        const sgId = topic.subjectGroupId ?? "";
        setValue("subjectGroupId", sgId);
        setFormSubjectGroupId(sgId);
      }
    }
  }, [formSubjectGroups, editId]);

  React.useEffect(() => {
    if (editId && formSubjects.length > 0) {
      const topic = topics.find((t) => t.topicId === editId);
      if (topic) {
        setValue("subjectId", topic.subjectId ?? "");
      }
    }
  }, [formSubjects, editId]);

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
    watch: watchFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterClassId: "",
      filterSectionId: "",
      filterSubjectGroupId: "",
      filterSubjectId: "",
      filterSearch: "",
    },
  });

  React.useEffect(() => {
    const sub = watchFilter((value, { name }) => {
      if (name === "filterClassId") {
        setFilterClassId(Number(value.filterClassId) || 0);
        setFilterSubjectGroupId("");
      }
      if (name === "filterSubjectGroupId") {
        setFilterSubjectGroupId(value.filterSubjectGroupId ?? "");
      }
    });
    return () => sub.unsubscribe();
  }, [watchFilter]);

  const classOptions = React.useMemo(
    () => classList.map((c: any) => ({ value: c.id?.toString(), label: c.className })),
    [classList]
  );
  const filterSectionOptions = React.useMemo(
    () => filterSections.map((s: any) => ({ value: s.id?.toString(), label: s.sectionName })),
    [filterSections]
  );
  const formSectionOptions = React.useMemo(
    () => formSections.map((s: any) => ({ value: s.id?.toString(), label: s.sectionName })),
    [formSections]
  );
  const formSubjectGroupOptions = React.useMemo(
    () => formSubjectGroups.map((g: any) => ({
      value: g.id?.toString() ?? g.subjectGroupId?.toString(),
      label: g.subjectGroup,
    })),
    [formSubjectGroups]
  );
  const filterSubjectGroupOptions = React.useMemo(
    () => filterSubjectGroups.map((g: any) => ({
      value: g.id?.toString() ?? g.subjectGroupId?.toString(),
      label: g.subjectGroup,
    })),
    [filterSubjectGroups]
  );
  const formSubjectOptions = React.useMemo(
    () => formSubjects.map((s: any) => ({
      value: s.id?.toString() ?? s.subjectId?.toString(),
      label: s.subjectName,
    })),
    [formSubjects]
  );
  const filterSubjectOptions = React.useMemo(
    () => filterSubjects.map((s: any) => ({
      value: s.id?.toString() ?? s.subjectId?.toString(),
      label: s.subjectName,
    })),
    [filterSubjects]
  );

  const resetFormModal = () => {
    reset({
      topicName: "",
      schoolClassId: "",
      sectionId: "",
      subjectGroupId: "",
      subjectId: "",
      formClassId: "",
    });
    setEditId(null);
    setFormClassId(0);
    setFormSubjectGroupId("");
    setTopicItems([{ id: Date.now(), topicName: "" }]);
  };

  const handleTopicChange = (index: number, value: string) => {
    setTopicItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], topicName: value };
      return updated;
    });
  };

  const addMoreTopic = () => {
    if (editId) return;
    setTopicItems((prev) => [...prev, { id: Date.now(), topicName: "" }]);
  };

  const removeTopic = (index: number) => {
    if (editId) return;
    setTopicItems((prev) =>
      prev.length > 1 ? prev.filter((_, i) => i !== index) : prev
    );
  };

  const onSubmit: SubmitHandler<ExtendedFormData> = async (data) => {
    try {
      const { ...rest } = data;
      const basePayload = {
        ...rest,
        schoolClassId: rest.schoolClassId,
      } as Omit<TopicFormData, "topicName">;

      const validNames = topicItems
        .map((t) => t.topicName.trim())
        .filter((n) => n.length > 0);

      if (!validNames.length) {
        toast.error("Please enter at least one topic name");
        return;
      }

      if (editId) {
        await updateTopic({ id: editId, data: { ...basePayload, topicName: validNames[0] } });
        toast.success("Topic updated successfully");
      } else {
        for (const name of validNames) {
          await addTopic({ ...basePayload, topicName: name });
        }
        toast.success(validNames.length === 1 ? "Topic added successfully" : "Topics added successfully");
      }

      resetFormModal();
      setShowFormModal(false);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to save topic(s). Please try again.");
    }
  };

  const handleEdit = (id: string | number) => {
    const topic = topics.find((t) => t.topicId === id.toString());
    if (!topic) return;

    setFormClassId(Number(topic.schoolClassId));
    setFormSubjectGroupId(""); 

    setValue("schoolClassId", topic.schoolClassId);
    setValue("sectionId",     topic.sectionId);
    setValue("formClassId",   topic.schoolClassId);

    setTopicItems([{ id: Date.now(), topicName: topic.topicName || "" }]);
    setEditId(id.toString());
    setShowFormModal(true);
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      Text.Do_you_want_to_delete_this_entry ?? "Do you want to delete this topic?"
    );
    if (!confirmed) return;
    try {
      await deleteTopic(id.toString());
      toast.success("Topic deleted successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete topic.");
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(
      Text.Delete_A ?? `Do you want to delete ${ids.length} selected topic(s)?`
    );
    if (!confirmed) return;
    try {
      await deleteMultipleTopics(ids.map(String));
      toast.success("Topics deleted successfully");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete topics.");
    }
  };

  const handleApplyFilters: SubmitHandler<FieldValues> = (data) => {
    const filters: FilterTopicDto = {};
    if (data.filterSectionId) filters.sectionId = Number(data.filterSectionId);
    if (data.filterSubjectGroupId) filters.subjectGroupId = Number(data.filterSubjectGroupId);
    if (data.filterSubjectId) filters.subjectId = Number(data.filterSubjectId);
    if (data.filterClassId) filters.schoolClassId = Number(data.filterClassId);
    if (data.filterSearch?.trim()) filters.search = data.filterSearch.trim();
    setActiveFilters(filters);
    setIsFiltering(true);
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({
      filterClassId: "",
      filterSectionId: "",
      filterSubjectGroupId: "",
      filterSubjectId: "",
      filterSearch: "",
    });
    setFilterClassId(0);
    setFilterSubjectGroupId("");
    setActiveFilters({});
    setIsFiltering(false);
    setPage(0);
  };

  const isSubmitting = isAdding || isUpdating;

  const columns = [
    { key: "className", label: Text.Class ?? "Class" },
    { key: "section", label: NameText.Section ?? "Section" },
    { key: "subjectGroup", label: Text.Subject_Group ?? "Subject Group" },
    { key: "subject", label: Text.Subject ?? "Subject" },
    { key: "topicName", label: Text.Topic ?? "Topic" },
  ];

  return (
    <div className="w-full px-4 py-4">
      {showFormModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 cursor-pointer z-10"
                onClick={() => { setShowFormModal(false); resetFormModal(); }}
              >
                <IconField name="FaTimes" size={20} />
              </button>

              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                <IconField name={editId ? "FaEdit" : "FaPlus"} className="inline mr-2" />
                {editId ? Text.Edit_Topic ?? "Edit Topic" : Text.Add_Topic ?? "Add Topic"}
              </h2>

              <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="space-y-4" queryKeys={['subjectGroups','sections','schoolClasses','topics']}>
                <Dropdown
                  label={Text.Class ?? "Class"}
                  name="schoolClassId"
                  control={control}
                  options={classOptions}
                  required
                  disabled={!!editId}
                  key={`form-class-${editId ?? "new"}`}
                />
                <Dropdown
                  label={NameText.Section ?? "Section"}
                  name="sectionId"
                  control={control}
                  options={formSectionOptions}
                  required
                  disabled={!!editId}
                  key={`form-section-${editId ?? "new"}-${formClassId}`}
                />
                <Dropdown
                  label={Text.Subject_Group ?? "Subject Group"}
                  name="subjectGroupId"
                  control={control}
                  options={formSubjectGroupOptions}
                  required
                  key={`form-subject-group-${formClassId}`}
                />
                <Dropdown
                  label={Text.Subject ?? "Subject"}
                  name="subjectId"
                  control={control}
                  options={formSubjectOptions}
                  required
                  key={`form-subject-${formSubjectGroupId}`}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {Text.Topic ?? "Topic"}
                  </label>
                  {topicItems.map((item, index) => (
                    <div key={item.id} className="flex gap-2 mb-2">
                      <input
                        className="w-full px-3 py-2 border rounded"
                        value={item.topicName}
                        onChange={(e) => handleTopicChange(index, e.target.value)}
                        placeholder={`${Text.Topic ?? "Topic"} ${index + 1}`}
                        required
                      />
                      {topicItems.length > 1 && !editId && (
                        <Button
                          type="button"
                          name={Text.Remove ?? "Remove"}
                          onClick={() => removeTopic(index)}
                          icon={<IconField name="FaMinusCircle" size={14} />}
                          loading={false}
                        />
                      )}
                    </div>
                  ))}
                  {!editId && (
                    <Button
                      type="button"
                      name={Text.Add_More ?? "Add More"}
                      onClick={addMoreTopic}
                      icon={<IconField name="FaPlusCircle" size={14} />}
                      loading={false}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    name={Text.Cancel ?? "Cancel"}
                    loading={false}
                    onClick={() => { setShowFormModal(false); resetFormModal(); }}
                  />
                  <Button
                    type="submit"
                    name={editId ? Text.Update ?? "Update" : Text.Save ?? "Save"}
                    loading={isSubmitting}
                    icon={<IconField name="FaSave" />}
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {Text.Topic_List ?? "Topic List"}
          </h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
            <Dropdown
              label={Text.Class ?? "Class"}
              name="filterClassId"
              control={filterControl}
              options={classOptions}
            />
            <Dropdown
              label={NameText.Section ?? "Section"}
              name="filterSectionId"
              control={filterControl}
              options={filterSectionOptions}
              key={`filter-section-${filterClassId}`}
            />
            <Dropdown
              label={Text.Subject_Group ?? "Subject Group"}
              name="filterSubjectGroupId"
              control={filterControl}
              options={filterSubjectGroupOptions}
              key={`filter-subject-group-${filterClassId}`}
            />
            <Dropdown
              label={Text.Subject ?? "Subject"}
              name="filterSubjectId"
              control={filterControl}
              options={filterSubjectOptions}
              key={`filter-subject-${filterSubjectGroupId}`}
            />
          </section>

          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={Text.Clear ?? "Clear"}
              loading={false}
              icon={<IconField name="FaTimes" />}
              showAlways={true}
            />
            <Button
              name={Text.Search ?? "Search"}
              loading={isFetching && !isLoading}
              icon={<IconField name="FaSearch" />}
              showAlways={true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">Updating…</span>
            </div>
          )}
          <ControlledTable
            title={Text.Topic_List ?? "Topic List"}
            columns={columns}
            data={isLoading ? [] : topics}
            fullData={topics}
            showSearch={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            showForm={() => { resetFormModal(); setShowFormModal(true); }}
            btn={true}
            btnName={Text.Add_Topic ?? "Add Topic"}
            showSelectAll
            enablePermissions={true}
            permissionScope="LESSON_PLAN"
            emptyMessage="No topics found matching your criteria."
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={setPage}
            onServerPageSizeChange={(newSize) => { setPageSize(newSize); setPage(0); }}
          />
        </div>
      </div>
    </div>
  );
};

export default TopicPage;