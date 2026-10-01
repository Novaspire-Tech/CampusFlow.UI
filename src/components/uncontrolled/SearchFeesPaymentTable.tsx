import React, { useState, type ChangeEvent } from "react";
import ControlledTable from "./ControlledTable";
 
interface SearchFeesPaymentTableProps {
  transactions: any[];
}
 
const SearchFeesPaymentTable: React.FC<SearchFeesPaymentTableProps> = ({ transactions }) => {
  const [searchTerm, setSearchTerm] = useState("");
 
  const columns = [
    { key: "paymentId", label: "Payment ID" },
    { key: "date", label: "Date" },
    { key: "feeType", label: "Fees Type" },
    { key: "mode", label: "Mode" },
    { key: "paid", label: "Amount Paid" },
    { key: "discount", label: "Discount" },
  ];
 
  return (
    <div className="mt-6">
      <ControlledTable
        columns={columns}
        data={transactions}
        searchTerm={searchTerm}
        onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
        title="Latest Transactions"
        actionColumn={false}
        btn={false}
        showSelectAll={false}
      />
    </div>
  );
};
 
export default SearchFeesPaymentTable;
 