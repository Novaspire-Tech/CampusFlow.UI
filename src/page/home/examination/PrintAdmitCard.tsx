import { useForm, type SubmitHandler } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { useEffect, useState, type ChangeEvent } from "react";
import Button from "../../../components/controlled/Button"; 
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";

interface FormValues {
  searchExamGroup: string;
  searchExam: string;
  searchAdmitCardTemplate: string;
  searchSection: string;
  searchSession: string;
  searchClass: string;
}

interface Student {
  id: number;
  admissionNo: string;
  dob: string;
  gender: string;
  catgory: string;
  fatherName: string;
  studentName: string;
  mobile: string;
  searchExamGroup: string;
  searchExam: string;
  searchAdmitCardTemplate: string;
  searchSection: string;
  searchSession: string;
  searchClass: string;
}

const PrintAdmitCard: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [result, setResult] = useState<boolean>(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredData, setFilteredData] = useState<Student[]>([]);

  const { handleSubmit, control } = useForm<FormValues>({
    defaultValues: {
      searchExamGroup: "",
      searchExam: "",
      searchAdmitCardTemplate: "",
      searchSection: "",
      searchSession: "",
      searchClass: "",
    },
  });

  const fetchData = (): Student[] => [
    {
      id: 1,
      admissionNo: "101",
      dob: "01-02-2004",
      gender: "Male",
      catgory: "2025-05-15",
      fatherName: "xyz",
      studentName: "pqr",
      mobile: "1234567890",
      searchExamGroup: "Class 1",
      searchExam: "Advertisement",
      searchAdmitCardTemplate: "sample admit card",
      searchSection: "all",
      searchSession: "2024-2025",
      searchClass: "1ST",
    },
    {
      id: 2,
      admissionNo: "102",
      dob: "01-02-2004",
      gender: "Male",
      catgory: "2025-05-15",
      studentName: "asd",
      fatherName: "xyz",
      mobile: "1234567890",
      searchExamGroup: "TERM 1",
      searchExam: "Advertisement",
      searchAdmitCardTemplate: "Admit Card Template",
      searchSection: "all",
      searchSession: "2024-25",
      searchClass: "1ST",
    },
    {
      id: 3,
      admissionNo: "103",
      dob: "01-02-2004",
      gender: "Male",
      catgory: "2025-05-15",
      studentName: "qwe",
      fatherName: "xyz",
      mobile: "1234567890",
      searchExamGroup: "Class 1",
      searchExam: "Advertisement",
      searchAdmitCardTemplate: "Admit Card Template",
      searchSection: "all",
      searchSession: "2024-25",
      searchClass: "1ST",
    },
    {
      id: 4,
      admissionNo: "104",
      dob: "01-02-2004",
      gender: "Male",
      catgory: "2025-05-16",
      studentName: "lmn",
      fatherName: "sqr",
      mobile: "1234567890",
      searchExamGroup: "TERM 1",
      searchExam: "Online Front Site",
      searchAdmitCardTemplate: "sample admit card",
      searchSection: "Active",
      searchSession: "2017-18",
      searchClass: "2ND",
    },
  ];

  useEffect(() => {
    const data = fetchData();
    setStudents(data);
    setFilteredData(data);
  }, []);

  const handleSearch: SubmitHandler<FormValues> = (formValues) => {
    setResult(true);

    const {
      searchExam,
      searchExamGroup,
      searchSession,
      searchClass,
      searchAdmitCardTemplate,
      searchSection,
    } = formValues;

    if (
      !searchExam &&
      !searchExamGroup &&
      !searchSession &&
      !searchClass &&
      !searchAdmitCardTemplate &&
      !searchSection
    ) {
      setFilteredData(students);
      return;
    }

    const filtered = students.filter((item) => {
      return (
        (!searchExam || item.searchExam?.toLowerCase() === searchExam.toLowerCase()) &&
        (!searchClass || item.searchClass?.toLowerCase() === searchClass.toLowerCase()) &&
        (!searchAdmitCardTemplate ||
          item.searchAdmitCardTemplate?.toLowerCase() === searchAdmitCardTemplate.toLowerCase()) &&
        (!searchExamGroup ||
          item.searchExamGroup?.toLowerCase() === searchExamGroup.toLowerCase()) &&
        (!searchSession || item.searchSession?.toLowerCase() === searchSession.toLowerCase()) &&
        (!searchSection || item.searchSection?.toLowerCase() === searchSection.toLowerCase())
      );
    });

    setFilteredData(filtered);
  };

  const {t} = useTranslation();
  const Select_CriteriaText = getPagesDataText(t);
  const Exam_GroupText = getPagesDataText(t);
  const ExamText = getPagesDataText(t);
  const AdmitCardTemplateText = getPagesDataText(t);
  const SectionText = getPagesNameText(t);
  const SessionText = getPagesDataText(t);
  const ClassText = getPagesDataText(t);
  const SearchText = getPagesDataText(t);
  const Admission_NoText = getPagesDataText(t);
  const Student_NameText = getPagesDataText(t);
  const Father_NameText = getPagesDataText(t);
  const Birth_DateText = getPagesDataText(t);
  const GenderText = getPagesDataText(t);
  const CategoryText = getPagesDataText(t);
  const MobileText = getPagesDataText(t);
  const Student_ListText = getPagesDataText(t);

  const columns = [
    { key: "admissionNo", label: Admission_NoText.Admission_No },
    { key: "studentName", label: Student_NameText.Student_Name },
    { key: "fatherName", label: Father_NameText.Father_Name },
    { key: "dob", label: Birth_DateText.Date_Of_Birth },
    { key: "gender", label: GenderText.Gender },
    { key: "catgory", label: CategoryText.Category },
    { key: "mobile", label: MobileText.Mobile_Number },
  ];

  return (
    <div className="min-h-screen bg-gray-50 sm:p-4 w-full">
      <h1 className="text-2xl p-1">{Select_CriteriaText.Select_Criteria}</h1>
      <div className="m-2">
        <form className="space-y-6" onSubmit={handleSubmit(handleSearch)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 sm:grid-cols-2 justify-between gap-2 mb-4">
            <Dropdown
              label={Exam_GroupText.Exam_Group}
              name="searchExamGroup"
              control={control}
              required
              options={[
                "JHIJ", "TERM 1", "Abx", "December test", "Class 1", "Class", "10th",
                "Half Yearlly Exam", "YEARLLY EXAM", "WEAKLLY TEST", "FA1", "FA2", "Test1",
              ]}
            />
            <Dropdown
              label={ExamText.Exam}
              name="searchExam"
              control={control}
              required
              options={[
                "Advertisement", "Online Front Site", "Google Ads", "Admission Campaign", "Front Office", "6th",
              ]}
            />
            <Dropdown
              label={AdmitCardTemplateText.Admit_Card_Template}
              name="searchAdmitCardTemplate"
              control={control}
              required
              options={["sample admit card"]}
            />
            <Dropdown
              label={SectionText.Section}
              name="searchSection"
              control={control}
              required
              options={["All", "Active", "Passive", "Dead", "Won", "Lost"]}
            />
            <Dropdown
              label={ClassText.Class}
              name="searchClass"
              control={control}
              required
              options={["1ST", "2ND", "5TH", "SSLC", "PUC IST", "PUC 2ND"]}
            />
            <Dropdown
              label={SessionText.Session}
              name="searchSession"
              control={control}
              required
              options={[
                "2016-17", "2017-18", "2018-19", "2019-20", "2020-21", "2021-22", "2022-23",
                "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30",
              ]}
            />
          </div>

          <div className="flex justify-end">
            <Button
              name={SearchText.Search}
              loading={false}
              clr="bg-slate-700"
              isDisable={false}
              icon={<IconField name="FaSearch" />} 
            />
          </div>
        </form>

        {result && (
          <ControlledTable
            title={Student_ListText.Student_List}
            columns={columns}
            data={filteredData}
            searchTerm={search}
            onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            actionColumn={false}
            header={true}
            enablePermissions={true}
            permissionScope="ADMIT_CARD"
          />
        )}
      </div>
    </div>
  );
};

export default PrintAdmitCard;
