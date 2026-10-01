import React, {useMemo,useState,useRef,useEffect} from "react";
import ReactDOMServer from "react-dom/server";
import { useForm, type SubmitHandler } from "react-hook-form";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import Dropdown from "../../../components/controlled/Dropdown";
import GenerateIdCardTemplate from "../../../templates/GenerateIdCardTemplate";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import {getPagesDataText,getPagesNameText} from "../../../helpers/useTranslations";
import PrintIdCardTemplate from "./PrintIdCardTemplate";
import { confirmToast } from "../../../helpers/confirmToast";
 
type Student = {
  id: number;
  admissionNo: string;
  studentName: string;
  class: string;
  fatherName: string;
  dob: string;
  gender: string;
  category: string;
  mobile: string;
  username: string;
  className: string;
};
 
type FormValues = {
  studentClass: string;
  section: string;
  certificate: string;
};
 
const dummyStudents: Student[] = [
  {
    id: 1,
    admissionNo: "865413",
    studentName: "NARASAPPA",
    class: "1st(A)",
    fatherName: "GANAPATI",
    dob: "01/05/2025",
    gender: "Male",
    category: "",
    mobile: "8495950143",
    username: "narasappa01",
    className: "1st(A)"
  },
  {
    id: 2,
    admissionNo: "865414",
    studentName: "Prasad",
    class: "1st(A)",
    fatherName: "GANAPATI",
    dob: "01/08/2025",
    gender: "Male",
    category: "",
    mobile: "8495950143",
    username: "prasad02",
    className: "1st(A)"
  },
  {
    id: 3,
    admissionNo: "861415",
    studentName: "Rohit",
    class: "1st(A)",
    fatherName: "Sanjay",
    dob: "17/07/2025",
    gender: "Male",
    category: "",
    mobile: "8420331433",
    username: "rohit03",
    className: "1st(A)"
  },
  {
    id: 4,
    admissionNo: "181918",
    studentName: "Maruti",
    class: "1st(A)",
    fatherName: "Ramesha",
    dob: "01/05/2025",
    gender: "Male",
    category: "",
    mobile: "8423450143",
    username: "maruti04",
    className: "1st(A)"
  },
 
];
 
const GenerateIdCard: React.FC = () => {
  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: { studentClass: "", section: "", certificate: "" }
  });
 
  const [filteredData, setFilteredData] = useState<Student[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const masterCheckboxRef = useRef<HTMLInputElement>(null);
 
  const { t } = useTranslation();
  const Text = getPagesDataText(t);
  const Page = getPagesNameText(t);
 
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [studentsForPrint, setStudentsForPrint] = useState<any[]>([]);
 
  useEffect(() => {
    if (masterCheckboxRef.current) {
      masterCheckboxRef.current.indeterminate =
        selectedIds.length > 0 &&
        selectedIds.length < filteredData.length;
    }
  }, [selectedIds, filteredData]);
 
  const handleCheckboxToggle = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };
 
  const allSelected =
    filteredData.length > 0 &&
    selectedIds.length === filteredData.length;
 
  const handleDeleteMultiple = async (ids: (string | number)[]) => {
    const confirmMessage =
      Text.Do_you_want_to_delete_this_entry?.replace(
        "${count}",
        ids.length.toString()
      ) || `Delete ${ids.length} selected record(s)?`;
 
    if (ids.length > 0 && await confirmToast(confirmMessage)) {
      const updated = filteredData.filter((item) => !ids.includes(item.id));
      setFilteredData(updated);
      setSelectedIds([]);
    }
  };
 
 
  const onSubmit: SubmitHandler<FormValues> = (formData) => {
    const formattedClass = `${formData.studentClass}(${formData.section})`;
 
    const filtered = dummyStudents.filter(
      (s) => s.class === formattedClass
    );
 
    setFilteredData(filtered);
    setHasSearched(true);
    setSelectedIds([]);
    setSearchTerm("");
  };
 
  const filteredAndSearchedData = useMemo(() => {
    if (!searchTerm) return filteredData;
 
    return filteredData.filter((student) =>
      Object.values(student)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [filteredData, searchTerm]);
 
  const printIDCard = (students: Student[]) => {
    const prepared = students.map((student) => ({
      ...student,
      rendered: ReactDOMServer.renderToStaticMarkup(
        <GenerateIdCardTemplate student={student} />
      )
    }));
 
    setStudentsForPrint(prepared);
    setIsPrintModalOpen(true);
  };
 
  const columns = [
    {
      key: "id",
      label: Text.Select,
      render: (_v: any, item: Student) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(item.id)}
          onChange={() => handleCheckboxToggle(item.id)}
        />
      ),
      headerRender: () => (
        <input
          type="checkbox"
          ref={masterCheckboxRef}
          checked={allSelected}
          onChange={() => {
            if (allSelected) setSelectedIds([]);
            else
              setSelectedIds(
                filteredAndSearchedData.map((s) => s.id)
              );
          }}
        />
      )
    },
    { key: "admissionNo", label: Text.Admission_No },
    { key: "studentName", label: Text.Student_Name },
    { key: "class", label: Text.Class },
    { key: "fatherName", label: Text.Father_Name },
    { key: "dob", label: Text.Date_Of_Birth },
    { key: "gender", label: Text.Gender },
    { key: "category", label: Text.Category },
    { key: "mobile", label: Text.Mobile_Number }
  ];
 
  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <div className="p-8 bg-white shadow-md rounded-md w-full mx-auto">
        <h2 className="text-lg font-semibold mb-4">
          {Text.Select_Criteria}
        </h2>
 
        <form
          className="space-y-6 border-t pt-4 border-gray-300"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Dropdown
              label={Text.Class}
              name="studentClass"
              control={control}
              required={true}
              options={["1st", "2nd", "3rd", "4th", "5th"]}
            />
 
            <Dropdown
              label={Page.Section}
              name="section"
              control={control}
              required={false}
              options={["A", "B", "C"]}
            />
 
            <Dropdown
              label={Text.ID_Card_Template}
              name="certificate"
              control={control}
              required={true}
              options={["Sample Student Identity Card Horizontal"]}
            />
          </div>
 
          <div className="flex justify-end">
            <Button
              name={Text.Search}
              loading={false}
              icon={<IconField name="FaSearch" />}
            />
          </div>
        </form>
      </div>
      {hasSearched && (
        <div className="mt-6">
          <div className="flex justify-start mb-2 mx-4">
            <Button
              name={Page.Generate_ID_Card}
              loading={false}
              isDisable={selectedIds.length === 0}
              onClick={() => {
                const selectedStudents =
                  filteredAndSearchedData.filter((s) =>
                    selectedIds.includes(s.id)
                  );
                if (selectedStudents.length > 0)
                  printIDCard(selectedStudents);
              }}
            />
          </div>
          <ControlledTable
            columns={columns}
            data={filteredAndSearchedData}
            fullData={filteredAndSearchedData}
            title={Text.Student_List}
            showSearch={true}
            showExport={false}
            onDeleteMultiple={handleDeleteMultiple}
            actionColumn={false}
          />
        </div>
      )}
 
      <PrintIdCardTemplate
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        students={studentsForPrint}
      />
    </div>
  );
};
 
export default GenerateIdCard;
 
 