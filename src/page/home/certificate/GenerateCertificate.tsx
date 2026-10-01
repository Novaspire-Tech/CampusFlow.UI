import { useState } from "react";
import { useForm, FormProvider, type SubmitHandler, useWatch } from "react-hook-form";
import TextField from "../../../components/controlled/TextField";
import TextAreaField from "../../../components/controlled/TextareaField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { confirmToast } from "../../../helpers/confirmToast";
import AllSchoolDropdown from "../../../components/uncontrolled/AllSchoolDropdown";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";

type CertificateFormData = {
  certificateName: string;
  organizationName: string;
  certificateTitle: string;
  achievementSubtitle: string;
  studentName: string;
  bodyText: string;
  principalName: string;
  principalPost: string;
  teacherName: string;
  teacherPost: string;
};

type CertificateRecord = CertificateFormData & {
  id: number;
};

export default function StudentCertificate() {
  const { t } = useTranslation()
  const Text = getPagesDataText(t)
  const [viewCert, setViewCert] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [certificateData, setCertificateData] = useState<CertificateRecord[]>([]);

  const methods = useForm<CertificateFormData>({
    defaultValues: {
      certificateName: "",
      organizationName: "TEXT01",
      certificateTitle: "CERTIFICATE",
      achievementSubtitle: "Of Achievement",
      studentName: "Student Name",
      bodyText: "Hopefully, this award can be a motivation to your abilities in the future.",
      principalName: "---------------",
      principalPost: "Principal",
      teacherName: "---------------",
      teacherPost: "Teacher",
    },
  });

  const { handleSubmit, control, reset } = methods;
  const formData = useWatch({ control });

  const onSubmit: SubmitHandler<CertificateFormData> = (data) => {
    if (editId !== null) {
      setCertificateData((prev) =>
        prev.map((item) => (item.id === editId ? { ...data, id: editId } : item))
      );
    } else {
      const newEntry: CertificateRecord = { ...data, id: Date.now() };
      setCertificateData((prev) => [...prev, newEntry]);
    }

    reset();
    setEditId(null);
  };

  const handleEdit = (id: string | number) => {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    const cert = certificateData.find((item) => item.id === numId);
    if (cert) {
      setEditId(numId);
      reset(cert);
    }
  };

  const handleDelete = async (id: string | number) => {
    const numId = typeof id === "string" ? parseInt(id, 10) : id;
    if (await confirmToast("Are you sure you want to delete this certificate?")) {
      setCertificateData((prev) => prev.filter((item) => item.id !== numId));
      if (editId === numId) {
        reset();
        setEditId(null);
      }
    }
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    if (await confirmToast(`Are you sure you want to delete ${ids.length} certificates?`)) {
      const numericIds = ids.map(id => typeof id === "string" ? parseInt(id, 10) : id);
      setCertificateData((prev) => prev.filter((item) => !numericIds.includes(item.id)));

      if (editId !== null && numericIds.includes(editId)) {
        reset();
        setEditId(null);
      }
    }
  };

  const handleCancel = () => {
    reset();
    setEditId(null);
  };

  const handleCloseView = () => {
    setViewCert(null);
  };

  const handlePrintDocument = () => {
    window.print();
  };

  const CertificatePreview = ({ data }: { data: Partial<CertificateFormData> }) => (
    <div className="relative w-full aspect-[1.414/1] bg-white shadow-lg overflow-hidden font-sans text-slate-800 border">
      <div className="absolute top-6 left-8 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
        {data.organizationName}
      </div>

      <div className="flex flex-col items-center justify-center h-full px-16 text-center pb-16">
        <h1 className="text-4xl font-bold tracking-tighter text-[#1a2e3e] mb-1 uppercase">
          {data.certificateTitle}
        </h1>
        <h2 className="text-lg font-bold text-orange-400 uppercase tracking-[0.2em] mb-8">
          {data.achievementSubtitle}
        </h2>

        <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-6">
          This certificate is proudly presented to
        </p>
        <div className="mb-6">
          <span className="text-5xl font-serif text-[#1a2e3e] italic">{data.studentName}</span>
        </div>
        <p className="max-w-xs text-[11px] leading-relaxed text-gray-600 whitespace-pre-line">
          {data.bodyText}
        </p>
      </div>

      <div className="absolute bottom-12 w-full px-12 flex justify-between items-end z-10">
        <div className="w-32 text-center">
          <div className="pt-1">
            <p className="text-xs font-bold text-[#1a2e3e]">{data.principalName}</p>
            <p className="text-[9px] font-semibold text-gray-800 uppercase">{data.principalPost}</p>
          </div>
        </div>
        <div className="w-32 text-center">
          <div className="pt-1">
            <p className="text-xs font-bold text-[#1a2e3e]">{data.teacherName}</p>
            <p className="text-[9px] font-semibold text-gray-800 uppercase">{data.teacherPost}</p>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 w-full h-1/2 pointer-events-none z-0">
        <svg viewBox="0 0 500 200" className="absolute bottom-0 right-0 w-full h-full" preserveAspectRatio="none">
          <path d="M0,200 C150,200 350,180 500,0 L500,200 Z" fill="#1a2e3e" />
          <path d="M0,200 C150,210 300,150 500,50 L500,180 C400,180 200,200 0,200 Z" fill="#fb923c" />
        </svg>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 p-6 bg-gray-50 min-h-screen print:hidden">
        {/* Form Section */}
        <div className="w-full lg:w-1/3 bg-white p-6 rounded-xl shadow-sm  overflow-y-auto max-h-[90vh]">
          <h2 className="text-xl font-bold mb-6 text-slate-700">{Text.Certificate_Editor || "Certificate Editor"}</h2>
          <FormProvider {...methods}>
            <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <TextField name="certificateName" label={Text.Template_Name || "Template Name"} control={control} placeholder={Text.Enter_Template_Name

              } required />

              <div className="grid grid-cols-2 gap-4 border-b pb-4 mb-4">
                <TextField name="certificateTitle" label={Text.Main_Title || "Main Title"} control={control} />
                <TextField name="achievementSubtitle" label={Text.Subtitle || "SubTitle"} control={control} />
              </div>

              <TextField name="organizationName" label={Text.Date || "Date"} control={control} />
              <TextField name="studentName" label={Text.Student_Name || "Student Name"} control={control} />
              <TextAreaField name="bodyText" label={Text.Achievement_Message || "Achievement Message"} control={control} rows={2} />

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <TextField name="principalName" label={Text.Left_Name || "Left Name"} control={control} />
                <TextField name="principalPost" label={Text.Designation || "Designation"} control={control} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <TextField name="teacherName" label={Text.Right_Name || "Right Name"} control={control} />
                <TextField name="teacherPost" label={Text.Designation || "Designation"} control={control} />
              </div>

              <div className="pt-4 flex gap-2">
                <Button
                  name={editId ? Text.Update || "Update" : Text.Save || "Save"}
                  clr="bg-blue-600"
                  onClick={handleSubmit(onSubmit)}
                  icon={<IconField name="FaSave" />}
                  loading={false}
                />
                {editId && (
                  <Button
                    name={Text.Cancel || "Cancel"}
                    clr="bg-gray-400"
                    onClick={handleCancel}
                    icon={<IconField name="FaTimes" />}
                    loading={false}
                  />
                )}
              </div>
            </AllSchoolDropdown>
          </FormProvider>
        </div>

        {/* Preview and Table Section */}
        <div className="w-full lg:w-2/3 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm ">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">{Text.Live_Preview || "Live Preview"}</h3>
            <div className="max-w-2xl mx-auto">
              <CertificatePreview data={formData} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm  overflow-hidden">
            <ControlledTable
              title={Text.Recent_Certificates || "Recent Certificates"}
              columns={[
                { key: "certificateName", label: Text.Template_Name || "Template Name" },
                { key: "studentName", label:Text.Recipient || "Recipient" },
              ]}
              data={certificateData}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDeleteMultiple={handleDeleteMultiple}
              onView={(id) => setViewCert(Number(id))}
              actionColumn={true}
              showSelectAll={true}
                   enablePermissions={true}
            permissionScope="CERTIFICATE"
            />
          </div>
        </div>
      </div>

      {/* View and Print Modal */}
      {viewCert && (
        <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-50 p-6 backdrop-blur-sm print:relative print:bg-white">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto print:max-w-full print:max-h-full print:shadow-none">
            <div className="p-6 print:p-8">
              {/* Action Buttons */}
              <div className="flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-gray-800">Certificate Preview</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handlePrintDocument}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <IconField name="FaPrint" size={16} />
                    Print
                  </button>
                  <button
                    onClick={handleCloseView}
                    className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center gap-2 transition-colors"
                  >
                    <IconField name="FaTimes" size={16} />
                    Close
                  </button>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden print:border-black">
                <CertificatePreview data={certificateData.find(c => c.id === viewCert) || {}} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:relative,
            .print\\:relative * {
              visibility: visible;
            }
            .print\\:relative {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
              background: white;
            }
            
            /* Adjust print layout */
            .print\\:p-8 {
              padding: 1rem !important;
            }
            
            /* Ensure certificate prints in landscape */
            @page {
              size: A4 landscape;
              margin: 0.5cm;
            }
            
            /* Ensure colors print correctly */
            * {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}
      </style>
    </>
  );
}