import React, { useState } from "react";
import { useForm, type SubmitHandler, type Control } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { Button } from "../../../components/controlled";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";

 
interface PayrollFormValues {
  role: string;
  month: string;
  year: string;
}
 
interface StaffData {
  id: string;
  staffID: string;
  name: string;
  role: string;
  department: string;
  designation: string;
  phone: string;
  status: string;
  month: string;
  year: string;
}
 
const Payroll: React.FC = () => {
  const { control, handleSubmit } = useForm<PayrollFormValues>({
    defaultValues: { role: "", month: "", year: "" },
  });
 
  const [submittedData, setSubmittedData] = useState<PayrollFormValues | null>(null);
  const [filteredData, setFilteredData] = useState<StaffData[]>([]);
  const [search, setSearch] = useState<string>("");
 
  const dummyData: StaffData[] = [
    {
      id: "1",
      staffID: "123",
      name: "Neel",
      role: "Admin",
      department: "IT",
      designation: "Lead",
      phone: "7896543675",
      status: "Active",
      month: "January",
      year: "2021",
    },
  ];

 
  const searchData = filteredData.filter((item) =>
    item.staffID.toLowerCase().includes(search.toLowerCase())
  );
 
  const onSubmit: SubmitHandler<PayrollFormValues> = (data) => {
    setSubmittedData(data);
 
    const filtered = dummyData.filter(
      (item) =>
        item.role === data.role &&
        item.month === data.month &&
        item.year === data.year
    );
    setFilteredData(filtered);
  };
 
  const handleDeleteMultiple = (ids: (string | number)[]) => {
      if (ids.length > 0 && window.confirm(Delete_AText.Delete_A)) {
        const updated = dummyData.filter((item) => !ids.includes(item.id));
        setFilteredData(updated);
      }
    const updatedList = filteredData.filter((item) => !ids.includes(item.id));
    setFilteredData(updatedList);
  };
 

  const handleDelete = (id: string | number) => {
    const confirmed = window.confirm(Do_you_want_to_delete_this_entryText.Do_you_want_to_delete_this_entry);
    if (confirmed) {
      const updatedData = filteredData.filter((item) => item.id !== id);
      setFilteredData(updatedData);
    }
  };

  const {t} = useTranslation();
  const Role_Text = getPagesDataText(t);
  const Month_Text = getPagesDataText(t);
  const Year_Text = getPagesDataText(t);
  const Select_Criteria_Text = getPagesDataText(t);
  const Staff_List_Text = getPagesDataText(t);  
  const Staff_ID_Text = getPagesDataText(t);
  const Name_Text = getPagesDataText(t);
  const Department_Text = getPagesDataText(t);
  const Designation_Text = getPagesDataText(t);
  const Phone_Text = getPagesDataText(t);
  const Status_Text = getPagesDataText(t);
  const Search_Text = getPagesDataText(t);
  const Delete_AText = getPagesDataText(t);
  const Do_you_want_to_delete_this_entryText = getPagesDataText(t);


   
  const columns = [
    { key: "staffID", label: Staff_ID_Text.Staff_ID },
    { key: "name", label: Name_Text.Name },
    { key: "role", label: Role_Text.Role },
    { key: "department", label: Department_Text.Department },
    { key: "designation", label: Designation_Text.Designation },
    { key: "phone", label: Phone_Text.Phone },
    { key: "status", label: Status_Text.Status },
  ];
 
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className=" mx-auto px-4 py-6 sm:px-2 md:px-8 lg:px-10 md:py-10">
        <div className="bg-white rounded-lg border border-gray-300 shadow p-4 sm:p-2 md:p-8 lg:p-10">
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-2xl font-semibold text-gray-800 mb-4 sm:mb-5 md:mb-6">
            {Select_Criteria_Text.Select_Criteria}
          </h1>
          <hr className="border-gray-300 mb-4 sm:mb-5 md:mb-6" />
 
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6"
          >
            <Dropdown
              label={Role_Text.Role}
              name="role"
              control={control}
              required
              options={[
                "Admin",
                "Teacher",
                "Accountant",
                "Librarian",
                "Receptionist",
                "Super Admin",
                "Multi Admin",
                "HOD",
              ]}
            />
 
            <Dropdown
              label={Month_Text.Month}
              name="month"
              control={control as unknown as Control<any>}
              required
              options={[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ]}
            />
 
            <Dropdown
              label={Year_Text.Year}
              name="year"
              control={control as unknown as Control<any>}
              required
              options={["2021", "2022", "2023", "2024", "2025"]}
            />
 
            <div className="sm:col-span-2 md:col-span-3 flex justify-end mt-2">
              <Button
                name={Search_Text.Search}
                loading={false}
                onClick={handleSubmit(onSubmit)}
                icon={<IconField name="FaSearch" />}
              />
            </div>
          </form>
 
          {/* Table */}
          {submittedData && (
            <div className="w-full lg:w-[100%] mt-6">
              <ControlledTable
                title={Staff_List_Text.Staff_List}
                columns={columns}
                data={searchData}
                searchTerm={search}
                onDeleteMultiple={handleDeleteMultiple}
                onDelete={handleDelete} 
                onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSearch(e.target.value)
                }
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
 
export default Payroll;
 
 