import { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import TextAreaField from "../../../components/controlled/TextareaField";
import Dropdown from "../../../components/controlled/Dropdown";
import DateField from "../../../components/controlled/DateField";
import FileUploadField from "../../../components/controlled/FileUploadField";
import NameField from "../../../components/controlled/NameField";
import MobileField from "../../../components/controlled/MobileField";
import TextField from "../../../components/controlled/TextField";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useFilterComplains,
  useCreateComplain,
  useUpdateComplain,
  useUpdateComplainDocument,
  useDeleteComplain,
  useDeleteMultipleComplains,
} from "../../../hooks/queries/frontOffice/useComplain";
import { useComplaintTypes } from "../../../hooks/queries/frontOffice/setupFrontOffice/useComplaintType";
import { useSources } from "../../../hooks/queries/frontOffice/setupFrontOffice/useSource";
import { openDocument } from "../../../hooks/useBlobImage";
import { toast } from "react-toastify";
import { confirmToast } from "../../../helpers/confirmToast";
import type { Complain as ComplainItem } from "../../../types/frontOffice/complain";
import {
  type ComplainSearchParams,
  EMPTY_COMPLAIN_SEARCH_PARAMS,
} from "../../../services/frontOffice/complainService";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";

//  Component

function ComplainPage() {
  const { t } = useTranslation();
  const texts = getPagesDataText(t) as any;

  const { data: complaintTypesData } = useComplaintTypes();
  const { data: sourcesData } = useSources();

  //  Pagination & sort
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy] = useState("date");
  const [sortDirection] = useState<"asc" | "desc">("asc");
  const [activeFilters, setActiveFilters] = useState<ComplainSearchParams>(
    EMPTY_COMPLAIN_SEARCH_PARAMS,
  );

  //  Filter form
  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      filterComplaintType: "",
      filterSource: "",
      filterSearch: "",
    },
  });

  //  Data fetching
  const {
    data: complainsResponse,
    isLoading: isLoadingComplains,
    isFetching,
  } = useFilterComplains(activeFilters, page, pageSize, sortBy, sortDirection);

  const createComplain = useCreateComplain();
  const updateComplain = useUpdateComplain();
  const updateComplainDoc = useUpdateComplainDocument();
  const deleteComplain = useDeleteComplain();
  const deleteMultipleComplains = useDeleteMultipleComplains();

  //  UI state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detailsView, setDetailsView] = useState<ComplainItem | null>(null);
  const [existingDocument, setExistingDocument] = useState<string | null>(null);

  //  Form
  const { control, handleSubmit, reset, setValue } = useForm<FieldValues>({
    defaultValues: {
      complaintType: "",
      source: "",
      complainBy: "",
      phone: "",
      date: "",
      description: "",
      actionTaken: "",
      assigned: "",
      note: "",
      document: null,
    },
  });

  //  Derived data
  const complains: ComplainItem[] = complainsResponse?.complains ?? [];
  const totalItems = complainsResponse?.totalItems ?? 0;
  const totalPages = complainsResponse?.totalPages ?? 0;

  //  Pagination 
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  //  Filter handlers
  const handleApplyFilters = (data: FieldValues) => {
    const params: ComplainSearchParams = {};
    if (data.filterComplaintType)
      params.complaintTypeId = Number(data.filterComplaintType);
    if (data.filterSource) params.sourceId = Number(data.filterSource);
    if (data.filterSearch?.trim()) params.search = data.filterSearch.trim();
    setActiveFilters(params);
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({
      filterComplaintType: "",
      filterSource: "",
      filterSearch: "",
    });
    setActiveFilters(EMPTY_COMPLAIN_SEARCH_PARAMS);
    setPage(0);
  };

  const resetForm = () => {
    reset({
      complaintType: "",
      source: "",
      complainBy: "",
      phone: "",
      date: "",
      description: "",
      actionTaken: "",
      assigned: "",
      note: "",
      document: null,
    });
    setEditingId(null);
    setExistingDocument(null);
  };

  //  Submit
  const onSubmit = async (data: FieldValues) => {
    try {
      const payload = {
        complainTypeId: data.complaintType.toString(),
        sourceId: data.source.toString(),
        complainBy: data.complainBy,
        phone: data.phone,
        date: data.date,
        description: data.description || "",
        actionTaken: data.actionTaken || "",
        assigned: data.assigned || "",
        note: data.note || "",
      };

      const documentFile =
        data.document instanceof FileList ? data.document[0] : data.document;

      if (editingId) {
        await updateComplain.mutateAsync({ id: editingId, data: payload });
        if (documentFile instanceof File)
          await updateComplainDoc.mutateAsync({
            id: editingId,
            file: documentFile,
          });
        toast.success("Complain updated successfully");
      } else {
        await createComplain.mutateAsync({
          ...payload,
          document: documentFile,
        });
        toast.success("Complain created successfully");
      }
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  //  CRUD handlers
  const handleEdit = (id: string | number) => {
    const item = complains.find((i) => i.id === id.toString());
    if (!item) {
      toast.error("Complain not found");
      return;
    }

    let formattedDate = item.date;
    if (item.date?.includes("/")) {
      const [d, m, y] = item.date.split("/");
      formattedDate = `${y}-${m}-${d}`;
    }

    setValue("complaintType", item.complainTypeId || "");
    setValue("source", item.sourceId || "");
    setValue("complainBy", item.complainBy || "");
    setValue("phone", item.phone || "");
    setValue("date", formattedDate);
    setValue("description", item.description || "");
    setValue("actionTaken", item.actionTaken || "");
    setValue("assigned", item.assigned || "");
    setValue("note", item.note || "");
    setValue("document", null);

    setExistingDocument(
      typeof item.document === "string" ? item.document : null,
    );
    setEditingId(id.toString());
    setShowForm(true);
  };

  const handleView = (id: string | number) => {
    const item = complains.find((c) => c.id === id.toString());
    if (item) setDetailsView(item);
    else toast.error("Complain not found");
  };

  const handleDelete = async (id: string | number) => {
    const confirmed = await confirmToast(
      texts.Do_you_want_to_delete_this_entry ||
        "Do you want to delete this entry?",
    );
    if (!confirmed) return;
    try {
      await deleteComplain.mutateAsync(id.toString());
      toast.success("Complaint deleted successfully!");
    } catch {
      toast.error("Failed to delete complain. Please try again.");
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmed = await confirmToast(
      texts.Delete_A || "Do you want to delete these entries?",
    );
    if (!confirmed) return;
    try {
      await deleteMultipleComplains.mutateAsync(ids.map((x) => x.toString()));
      toast.success("Complaints deleted successfully!");
    } catch {
      toast.error("Failed to delete complains. Please try again.");
    }
  };

  //  Table columns
  const columns = [
    {
      key: "complaintTypeName",
      label: texts.Complaint_Type || "Complaint Type",
    },
    { key: "sourceName", label: texts.Source || "Source" },
    { key: "complainBy", label: texts.Complain_By || "Complain By" },
    { key: "phone", label: texts.Phone || "Phone" },
    { key: "date", label: texts.Date || "Date" },
    { key: "actionTaken", label: texts.Action_Taken || "Action Taken" },
    { key: "assigned", label: texts.Assigned || "Assigned" },
  ];

  const isSubmitting = createComplain.isPending || updateComplain.isPending;

  //  Loading 
  if (isLoadingComplains) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading complains...</p>
        </div>
      </div>
    );
  }

  //  Render
  return (
    <div className="w-full px-4 py-4">
      {showForm && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl p-6 rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="absolute top-3 right-3 font-bold text-gray-700 hover:text-gray-900 text-2xl"
              >
                <IconField name="FaTimes" />
              </button>

              <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                {editingId
                  ? texts.Update_Complaint || "Update Complaint"
                  : texts.Add_Complaint || "Add Complaint"}
              </h2>

              <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} 
              queryKeys={['sources','complains','complaintTypes']}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Dropdown
                    label={texts.Complaint_Type || "Complaint Type"}
                    name="complaintType"
                    control={control}
                    required
                    options={
                      complaintTypesData?.map((ct: any) => ({
                        value: ct.id || ct.complaintTypeId,
                        label: ct.name || ct.complaintType,
                      })) || []
                    }
                  />
                  <Dropdown
                    name="source"
                    label={texts.Source || "Source"}
                    control={control}
                    required
                    options={
                      sourcesData?.map((s: any) => ({
                        value: s.id || s.sourceId,
                        label: s.name || s.source,
                      })) || []
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <NameField
                    name="complainBy"
                    label={texts.Complain_By || "Complain By"}
                    control={control}
                    placeholder={texts.Enter_name || "Enter name"}
                    required
                    disabled={!!editingId}
                  />
                  <MobileField
                    name="phone"
                    label={texts.Phone || "Phone"}
                    control={control}
                    placeholder={texts.Enter_Phone || "Enter phone"}
                    required
                    disabled={!!editingId}
                  />
                </div>

                <DateField
                  name="date"
                  label={texts.Date || "Date"}
                  control={control}
                  required
                  disabled={!!editingId}
                />

                <TextAreaField
                  name="description"
                  label={texts.Description || "Description"}
                  control={control}
                  rows={3}
                  placeholder={texts.Write_description || "Enter description"}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    name="actionTaken"
                    label={texts.Action_Taken || "Action Taken (Optional)"}
                    control={control}
                    placeholder="Enter action taken"
                  />
                  <NameField
                    name="assigned"
                    label={texts.Assigned || "Assigned (Optional)"}
                    control={control}
                    placeholder="Enter assigned person"
                  />
                </div>

                <TextAreaField
                  name="note"
                  label={texts.Note || "Note (Optional)"}
                  control={control}
                  rows={2}
                  placeholder="Enter note"
                />

                <FileUploadField
                  name="document"
                  label={texts.Attach_Document || "Attach Document"}
                  existingFileUrl={existingDocument}
                  control={control}
                />

                <div className="flex gap-2">
                  <Button
                    name={
                      editingId
                        ? texts.Update || "Update"
                        : texts.Save || "Save"
                    }
                    onClick={handleSubmit(onSubmit)}
                    loading={isSubmitting}
                    icon={<IconField name="FaSave" />}
                    permissionScope="FRONT_OFFICE"
                    permissionType={editingId ? "UPDATE" : "CREATE"}
                    enablePermissions={true}
                  />
                  <Button
                    name={texts.Cancel || "Cancel"}
                    loading={false}
                    icon={<IconField name="FaTimes" />}
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  />
                </div>
              </AllSchoolDropdown>
            </div>
          </div>
        </>
      )}

      {/*  Details modal */}
      {detailsView && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-40" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white p-6 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDetailsView(null)}
                className="absolute top-3 right-3 font-bold text-gray-700 hover:text-gray-900 text-2xl"
              >
                <IconField name="FaTimes" />
              </button>

              <h2 className="text-2xl font-bold mb-6 border-b pb-3">
                {texts.Complaint_Details || "Complaint Details"}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Complaint_Type || "Complaint Type"}
                    </p>
                    <p className="font-semibold">
                      {detailsView.complaintTypeName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Source || "Source"}
                    </p>
                    <p className="font-semibold">{detailsView.sourceName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Complain_By || "Complain By"}
                    </p>
                    <p className="font-semibold">{detailsView.complainBy}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Phone || "Phone"}
                    </p>
                    <p className="font-semibold">{detailsView.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Date || "Date"}
                    </p>
                    <p className="font-semibold">{detailsView.date}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Action_Taken || "Action Taken"}
                    </p>
                    <p className="font-semibold">
                      {detailsView.actionTaken || "N/A"}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">
                      {texts.Assigned || "Assigned"}
                    </p>
                    <p className="font-semibold">
                      {detailsView.assigned || "N/A"}
                    </p>
                  </div>
                </div>

                {detailsView.description && (
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Description || "Description"}
                    </p>
                    <p className="mt-1">{detailsView.description}</p>
                  </div>
                )}
                {detailsView.note && (
                  <div>
                    <p className="text-sm text-gray-600">
                      {texts.Note || "Note"}
                    </p>
                    <p className="mt-1">{detailsView.note}</p>
                  </div>
                )}
                {detailsView.document && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      {texts.document || "Document"}
                    </p>
                    <button
                      onClick={() =>
                        typeof detailsView.document === "string" &&
                        openDocument(detailsView.document)
                      }
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <IconField name="FaDownload" />
                      <span className="ml-2">
                        {texts.View_Docume || "Download Document"}
                      </span>
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button
                  name={texts.Close || "Close"}
                  loading={false}
                  onClick={() => setDetailsView(null)}
                  icon={<IconField name="FaTimes" />}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <div className="w-full bg-white shadow-md rounded p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {texts.Complaint_List || "Complaint List"}
          </h1>
        </div>

        <form onSubmit={handleFilterSubmit(handleApplyFilters)}>
          <section className="grid max-sm:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Dropdown
              name="filterComplaintType"
              label={texts.Complaint_Type || "Complaint Type"}
              control={filterControl}
              options={
                complaintTypesData?.map((ct: any) => ({
                  value: ct.id || ct.complaintTypeId,
                  label: ct.name || ct.complaintType,
                })) || []
              }
              required={false}
            />
            <Dropdown
              name="filterSource"
              label={texts.Source || "Source"}
              control={filterControl}
              options={
                sourcesData?.map((s: any) => ({
                  value: s.id || s.sourceId,
                  label: s.name || s.source,
                })) || []
              }
              required={false}
            />
            <TextField
              label={texts.Search || "Search"}
              name="filterSearch"
              placeholder="Name, phone, description…"
              control={filterControl}
            />
          </section>

          <div className="flex justify-end gap-2 mb-4">
            <Button
              onClick={handleClearFilters}
              name={texts.Clear || "Clear"}
              loading={false}
              icon={<IconField name="FaTimes" />}
              showAlways = {true}
            />
            <Button
              name={texts.Search || "Search"}
              loading={isFetching && !isLoadingComplains}
              icon={<IconField name="FaSearch" />}
              showAlways = {true}
            />
          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        <div className="relative">
          {isFetching && !isLoadingComplains && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
                Updating…
              </span>
            </div>
          )}

          <ControlledTable
            title={texts.Complaint_List || "Complaint List"}
            columns={columns}
            data={complains}
            fullData={complains}
            showSearch={false}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDeleteMultiple={handleDeleteMultiple}
            btn={true}
            btnName={texts.Add || "Add"}
            showForm={setShowForm}
            showSelectAll
            enablePermissions={true}
            permissionScope="FRONT_OFFICE"
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

export default ComplainPage;
