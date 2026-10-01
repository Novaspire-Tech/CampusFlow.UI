import React, { useMemo, useState } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import kidsData from "../parent/Kids";

interface Expense {
  id: number;
  name: string;
  expanse: string;
  amount: string;
  status: string;
  email: string;
  date: string;
  [key: string]: unknown;
}

const expensesData: Expense[] = [
  { id: 21, name: "Jessia Rose", expanse: "Exam Fees", amount: "₹150.00", status: "Paid", email: "school@gmail.com", date: "22/02/2019" },
  { id: 22, name: "Jack Steve", expanse: "Semester Fees", amount: "₹350.00", status: "Due", email: "school@gmail.com", date: "22/02/2019" },
  { id: 23, name: "Jessia Rose", expanse: "Bus Fees", amount: "₹200.00", status: "Due", email: "bus@gmail.com", date: "25/02/2019" },
  { id: 24, name: "Jack Steve", expanse: "Hostel Fees", amount: "₹500.00", status: "Paid", email: "hostel@gmail.com", date: "26/02/2019" },
  { id: 25, name: "Jessia Rose", expanse: "Library Fees", amount: "₹100.00", status: "Paid", email: "library@gmail.com", date: "27/02/2019" },
  { id: 26, name: "Jack Steve", expanse: "Lab Fees", amount: "₹250.00", status: "Due", email: "lab@gmail.com", date: "28/02/2019" },
  { id: 27, name: "Jessia Rose", expanse: "Sports Fees", amount: "₹180.00", status: "Paid", email: "sports@gmail.com", date: "01/03/2019" },
  { id: 28, name: "Jack Steve", expanse: "Activity Fees", amount: "₹300.00", status: "Due", email: "activity@gmail.com", date: "02/03/2019" }
];

const AllExpensesTable: React.FC = () => {
  const [nameSearch, setNameSearch] = useState("");
  const [expanseSearch, setExpanseSearch] = useState("");
  const [statusSearch, setStatusSearch] = useState("");
  const [tableData, setTableData] = useState(expensesData);

  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      { key: "expanse", label: "Expense" },
      { key: "amount", label: "Amount" },
      {
        key: "status",
        label: "Status",
        render: (value: unknown) => (
          <span
            className={`px-3 py-1 rounded-full text-white text-sm ${
              value === "Paid" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {value as string}
          </span>
        ),
      },
      { key: "email", label: "Email" },
      { key: "date", label: "Date" },
    ],
    []
  );

  const handleSearchClick = () => {
    const filtered = expensesData.filter(
      (exp) =>
        (nameSearch ? exp.name === nameSearch : true) &&
        exp.expanse.toLowerCase().includes(expanseSearch.toLowerCase()) &&
        (statusSearch ? exp.status === statusSearch : true)
    );

    setTableData(filtered);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full flex flex-col gap-6">

      <h2 className="text-2xl font-semibold">All Expenses</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">

  {/* Name */}
  <select
    value={nameSearch}
    onChange={(e) => setNameSearch(e.target.value)}
    className="py-2 px-3 border rounded w-full"
  >
    <option value="">Select Name</option>
    {kidsData.apply((kid : any) => (
      <option key={kid.name} value={kid.name}>
        {kid.name}
      </option>
    ))}
  </select>

  {/* Expense */}
  <input
    value={expanseSearch}
    onChange={(e) => setExpanseSearch(e.target.value)}
    placeholder="Search by Expense"
    className="py-2 px-3 border rounded w-full"
  />

  <select
    value={statusSearch}
    onChange={(e) => setStatusSearch(e.target.value)}
    className="py-2 px-3 border rounded w-full md:col-span-2 xl:col-span-1 "
  >
    <option value="">All Status</option>
    <option value="Paid">Paid</option>
    <option value="Due">Due</option>
  </select>


  <button
    onClick={handleSearchClick}
    className="
      bg-blue-500 text-white px-5 py-2 rounded w-full
      md:col-start-2 md:col-end-3
      xl:col-start-auto xl:col-end-auto
    "
  >
    Search
  </button>

</div>


      {/* TABLE */}
      <ControlledTable
        columns={columns}
        data={tableData}
        fullData={expensesData}
        btn={false}
        header={false}
        showSearch={false}
        showExport={false}
        showSelectAll={false}
        actionColumn={false}
      />
    </div>
  );
};

export default AllExpensesTable;
 