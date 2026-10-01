import React, { useState, type ChangeEvent } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import ToggleButton from "../../../../components/controlled/ToggleButton";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";

interface Student {
  admissionNo: string;
  studentName: string;
  fatherName: string;
  username: string;
  className: string;
  mobile: string;
}

interface StudentWithId extends Student {
  id: number;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: StudentWithId) => React.JSX.Element;
}

const Student: React.FC = () => {
  const [admissions, setAdmissions] = useState<StudentWithId[]>([
    {
      id: 1, 
      admissionNo: "01",
      studentName: "Ravi Kumar",
      fatherName: "Mahesh Kumar",
      username: "ravi",
      className: "10",
      mobile: "9876543210",
    },
    {
      id: 2, 
      admissionNo: "02",
      studentName: "Anjali Sharma",
      fatherName: "Ramesh Sharma",
      username: "anjali.s",
      className: "9",
      mobile: "9123456780",
    },
  ]);

  const [toggles, setToggles] = useState<Record<number, boolean>>(() =>
    admissions.reduce((acc, student) => {
      acc[student.id] = false; 
      return acc;
    }, {} as Record<number, boolean>)
  );

  const [search, setSearch] = useState<string>("");

  const handleToggle = (id: number): void => {
    setToggles((prev) => ({ ...prev, [id]: !prev[id] }));
    window.alert(Account_Text.Account_status_changed_successfully);
  };

  const handleDeleteMultiple = (ids: (string | number)[]): void => {
    const numericIds = ids.map(id => typeof id === 'string' ? parseInt(id, 10) : id);
    if (window.confirm(Delete_Text.Delete_A)) {
      setAdmissions((prev) => prev.filter((student) => !numericIds.includes(student.id)));
      setToggles((prev) => {
        const newToggles = { ...prev };
        numericIds.forEach(id => delete newToggles[id]); 
        return newToggles;
      });
      console.log(`Deleted multiple records with IDs: ${numericIds.join(', ')}`);
    }
  };

  const filteredData: StudentWithId[] = admissions
    .filter((item) =>
      `${item.studentName} ${item.fatherName} ${item.className} ${item.mobile} ${item.username}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );


    const {t}= useTranslation();
    const Admission_No_Text = getPagesDataText(t);
    const Student_Name_Text = getPagesDataText(t);
    const Username_Text = getPagesDataText(t);
    const ClassName_Text = getPagesDataText(t);
    const fatherName_Text = getPagesDataText(t);
    const Mobile_Text = getPagesDataText(t);
    const Action_Text = getPagesDataText(t);
    const Delete_Text = getPagesDataText(t);
    const Student_Text = getPagesDataText(t);
    const Account_Text = getPagesDataText(t);

  const columns: Column[] = [
    { key: "admissionNo", label: Admission_No_Text.Admission_No },
    { key: "studentName", label: Student_Name_Text.Student_Name },
    { key: "username", label: Username_Text.Username },
    { key: "className", label: ClassName_Text.Class },
    { key: "fatherName", label: fatherName_Text.Father_Name },
    { key: "mobile", label: Mobile_Text.Mobile_Number },
    {
      key: "action",
      label: Action_Text.Action,
      render: (_value, item) => (
        <ToggleButton
          name={`toggle-${item.id}`}
          value={toggles[item.id] || false} 
          onChange={() => handleToggle(item.id)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full overflow-x-auto">
      <ControlledTable
        title={Student_Text.Student}
        columns={columns}
        data={filteredData}
        searchTerm={search}
        onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
          setSearch(e.target.value)
        }
        onDeleteMultiple={handleDeleteMultiple}
        showSelectAll={true}
        btn={false} 
        showForm={() => {}} 
        actionColumn={false} 
      />
    </div>
  );
};

export default Student;