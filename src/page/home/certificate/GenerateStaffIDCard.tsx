import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import ReactDOMServer from "react-dom/server";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import IdCardTemplateVertical from "../../../templates/IdCardTemplateVertical";
import IdCardTemplateHorizontal from "../../../templates/IdCardTemplateHorizontal";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";
import { confirmToast } from "../../../helpers/confirmToast";
import { toast } from "react-toastify";

type Staff = {
  id: number;
  staffId: string;
  staffName: string;
  role: string;
  fatherName: string;
  motherName: string;
  dob: string;
  department: string;
  dateOfJoining: string;
  mobile: string;
  address: string;
  designation?: string;
};

type FormValues = {
  role: string;
  templete: string;
};

const dummyStaff: Staff[] = [
  {
    id: 2,
    staffId: "istc2024/1",
    staffName: "waquas ahmad",
    role: "Admin",
    fatherName: "jamsed",
    motherName: "md jamil",
    dob: "20/09/1998",
    department: "Male",
    dateOfJoining: "01-01-2025",
    mobile: "6392515245",
    address: "kurlap",
  },
  {
    id: 3,
    staffId: "00279",
    staffName: "NIHAL SHAIK",
    role: "Admin",
    fatherName: "jamil",
    motherName: "md jamil",
    dob: "15/05/2003",
    department: "Male",
    dateOfJoining: "01-01-2025",
    mobile: "95115585144",
    address: "kurlap",
  },
];

const GenerateStaffIDCard: React.FC = () => {
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      role: "",
      templete: "",
    },
  });

  const [filteredData, setFilteredData] = useState<Staff[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [temp, setTemp] = useState<string>("");
  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const Page = getPagesNameText(t);

  const handleCheckboxToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const onSubmit: SubmitHandler<FormValues> = (formData) => {
    setTemp(formData.templete);
    const filtered = dummyStaff.filter((s) => s.role === formData.role);
    setFilteredData(filtered);
    setHasSearched(true);
    setSelectedIds([]);
  };

  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmMessage = Text.Do_you_want_to_delete_this_entry?.replace('${count}', ids.length.toString()) || 
                          `Delete ${ids.length} selected record(s)?`;
    
    if (ids.length > 0 && await confirmToast(confirmMessage)) {
      const updated = dummyStaff.filter((item) => !ids.includes(item.id));
      setFilteredData(updated);
    }
  };

  const handleGenerate = () => {
    if (selectedIds.length === 0) {
      toast.error("Please_select_at_least_one_staff");
      return;
    }

    const selectedStaff = filteredData.filter((s) => selectedIds.includes(s.id));

    const htmlContent = selectedStaff
      .map((staff) =>
        ReactDOMServer.renderToStaticMarkup(
          <>
            {temp === "Vertical Staff ID card" && (
              <IdCardTemplateVertical data={staff} />
            )}
            {temp === "Horizontal Staff ID card" && (
              <IdCardTemplateHorizontal data={staff} />
            )}
          </>
        )
      )
      .join("<div style='page-break-after: always;'></div>");

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${Text.ID_Card}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: 'Times New Roman', serif;
            }
            @media print {
              div {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>${htmlContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const columns = [
    {
      key: "checkbox",
      label: "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_value: any, item: Staff) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => handleCheckboxToggle(item.id)}
        />
      ),
    },
    { key: "staffId", label: Text.Staff_Id },
    { key: "staffName", label: Text.Staff_Name },
    { key: "role", label: Text.Role },
    { key: "fatherName", label: Text.Father_Name },
    { key: "dob", label: Text.Date_Of_Birth },
    { key: "department", label: Text.Department },
    { key: "motherName", label: Text.Mother_Name },
    { key: "dateOfJoining", label: Text.Date_Of_Joining },
    { key: "mobile", label: Text.Mobile_Number },
    { key: "designation", label: Text.Designation },
  ];

  return (
    <div className="mt-8">
      <div className="p-8 bg-white shadow-md rounded-md w-full mx-auto">
        <h2 className="text-lg font-semibold mb-4">{Text.Select_Criteria}</h2>

        <form
          className="space-y-6 border-t pt-4 border-gray-300"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Dropdown
              label={Text.Role}
              name="role"
              control={control}
              required={false}
              options={[
                "Teacher",
                "Admin",
                "Accountant",
                "Librarian",
                "Receptionist",
                "Super Admin",
              ]}
            />
            <Dropdown
              label={Text.ID_Card_Template}
              name="templete"
              control={control}
              required={true}
              options={["Horizontal Staff ID card", "Vertical Staff ID card"]}
            />
          </div>

          <div className="flex justify-end">
            <Button
              name={Text.Search}
              loading={false}
              onClick={handleSubmit(onSubmit)}
              icon={<IconField name="FaSearch" />}
            />
          </div>
        </form>
      </div>

      {hasSearched && (
        <div className="mt-6">
          {filteredData.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                name={Page.Generate_ID_Card}
                loading={false}
                onClick={handleGenerate}
              />
            </div>
          )}
          <ControlledTable
            columns={columns}
            data={filteredData}
            fullData={filteredData}
            title={Text.Staff_List}
            actionColumn={false}
            onDeleteMultiple={handleDeleteMultiple}
            showSearch={true}
            showExport={true}
            emptyMessage={"No_staff_found_for_selected_criteria"}
          />
        </div>
      )}
    </div>
  );
};

export default GenerateStaffIDCard;