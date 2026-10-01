import React, { useState, type ChangeEvent } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import ToggleButton from "../../../../components/controlled/ToggleButton";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";

interface Staff {
  id: number; 
  staffId: string;
  name: string;
  email: string;
  role: string;
  designation: string;
  department: string;
  phone: string;
}

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: Staff) => React.JSX.Element; 
}

const Staff: React.FC = () => {
  const [admissions, setAdmissions] = useState<Staff[]>([
    {
      id: 1, 
      staffId: "01",
      name: "Ravi Kumar",
      email: "ravi.kumar@example.com",
      role: "Teacher",
      designation: "Senior Instructor",
      department: "IT",
      phone: "9876543210",
    },
    {
      id: 2, 
      staffId: "02",
      name: "Anita Sharma",
      email: "anita.sharma@example.com",
      role: "Admin",
      designation: "Office Assistant",
      department: "IT",
      phone: "9123456780",
    },
  ]);

  const [toggles, setToggles] = useState<Record<number, boolean>>(() =>
    admissions.reduce((acc, staff) => {
      acc[staff.id] = false; 
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
    if (window.confirm((Delete_Text.Delete_A))) {
      setAdmissions((prev) => prev.filter((staff) => !numericIds.includes(staff.id)));
      setToggles((prev) => {
        const newToggles = { ...prev };
        numericIds.forEach(id => delete newToggles[id]); 
        return newToggles;
      });
      console.log(`Deleted multiple records with IDs: ${numericIds.join(', ')}`);
    }
  };

  const filteredData: Staff[] = admissions
    .filter((item) =>
      `${item.name} ${item.email} ${item.role} ${item.designation} ${item.department} ${item.phone}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );


    const {t} = useTranslation();
    const Staff_Text = getPagesDataText(t);
    const Staff_Id_Text = getPagesDataText(t);
    const Name_Text = getPagesDataText(t);
    const Email_Text = getPagesDataText(t);
    const Role_Text = getPagesDataText(t);
    const Designation_Text = getPagesDataText(t);
    const Department_Text = getPagesDataText(t);
    const Phone_Text = getPagesDataText(t);
    const Action_Text = getPagesDataText(t);
    const Account_Text = getPagesDataText(t);
    const Delete_Text = getPagesDataText(t);


  const columns: Column[] = [
    { key: "staffId", label: Staff_Id_Text.Staff_Id },
    { key: "name", label: Name_Text.Name},
    { key: "email", label: Email_Text.Email },
    { key: "role", label: Role_Text.Role },
    { key: "designation", label: Designation_Text.Designation},
    { key: "department", label: Department_Text.Department},
    { key: "phone", label: Phone_Text.Phone},
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
        title={Staff_Text.Staff}
        columns={columns}
        data={filteredData}
        searchTerm={search}
        onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
        onDeleteMultiple={handleDeleteMultiple} 
        showSelectAll={true}
        btn={false}
        showForm={() => {}}
        actionColumn={false}
      />
    </div>
  );
};

export default Staff;