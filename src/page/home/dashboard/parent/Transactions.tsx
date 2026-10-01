import React, { useMemo, useState, useEffect } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import { parentDashboardService } from "../../../../services/dashboard/parentDashboardServices";
import { useTranslation } from "react-i18next";
import { getParentDashboardText, getPagesDataText } from "../../../../helpers/useTranslations";

interface Transaction {
  id: string | number;
  studentId: number;
  studentName: string;
  feeTransactionId: number;
  amount: string;
  discountAmount: string;
  fine: string;
  date: string;
  receiptNo: string;
  mode: string;
}

interface Child {
  studentId: number;
  admissionNo: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  religion?: string;
  castName?: string;
  phoneNumber?: string;
  email?: string;
  photo?: string;
  admissionDate: string;
  className: string;
  section: string;
  rollNo: string;
}

const Transactions: React.FC = () => {
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [children, setChildren] = useState<Child[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fullTransactions, setFullTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setPagination] = useState({
    page: 0,
    size: 100,
    totalElements: 0,
    totalPages: 0,
  });

  const { t } = useTranslation()
  const texts = getParentDashboardText(t)
  const T = getPagesDataText(t);

  const fetchChildren = async () => {
    try {
      const schoolCode = localStorage.getItem("schoolCode") || "";
      if (!schoolCode) {
        console.error("School code not found in localStorage");
        return;
      }

      const childrenData = await parentDashboardService.getChildren(schoolCode);
      if (Array.isArray(childrenData)) {
        setChildren(childrenData);
      } else {
        console.error("Invalid children data format:", childrenData);
        setChildren([]);
      }
    } catch (error: any) {
      console.error("Error fetching children:", error);
      setChildren([]);
    }
  };

  const fetchTransactions = async (studentId: number = 0, page: number = 0) => {
    try {
      setLoading(true);
      setError(null);

      const schoolCode = localStorage.getItem("schoolCode") || "";
      if (!schoolCode) {
        throw new Error("School code not found. Please login again.");
      }

      const response = await parentDashboardService.getTransactions(
        studentId,  
        page,
        100          
      )

      if (!response || typeof response !== 'object') {
        throw new Error("Invalid response from server");
      }

      const transactionsData = Array.isArray(response.transactions) 
        ? response.transactions.map((txn: any) => ({
            ...txn,
            id: txn.feeTransactionId || txn.id
          }))
        : [];

      setTransactions(transactionsData);
      setFullTransactions(transactionsData);
      setPagination({
        page: response.page || 0,
        size: response.size || 100,
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
      });
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      const errorMessage = error?.response?.data?.message 
        || error?.message 
        || "Failed to load transactions";
      setError(errorMessage);
      setTransactions([]);
      setFullTransactions([]);
      setPagination({
        page: 0,
        size: 100,
        totalElements: 0,
        totalPages: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchChildren();
      await fetchTransactions();
    };

    initializeData();
  }, []);

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const studentId = Number(e.target.value);
    setSelectedStudentId(studentId);
    fetchTransactions(studentId);
  };

  const columns = useMemo(
    () => [
      { key: "studentName", label: T.Student_Name, width: "150px" },
      { key: "receiptNo", label: T.Receipt_No, width: "120px" },
      {
        key: "amount",
        label: T.Amount,
        width: "100px",
        render: (value: unknown) => `₹${value || "0.00"}`,
      },
      {
        key: "discountAmount",
        label: T.Discount,
        width: "100px",
        render: (value: unknown) => `₹${value || "0.00"}`,
      },
      {
        key: "fine",
        label: T.Fine ,
        width: "100px",
        render: (value: unknown) => `₹${value || "0.00"}`,
      },
      { key: "date", label: T.Date , width: "120px" },
      { key: "mode", label: T.Payment_Mode , width: "120px" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow w-full">
        <h2 className="text-2xl font-semibold mb-4">{T.Transactions}</h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow w-full flex flex-col gap-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
          <div className="flex items-center text-red-700">
            <span className="mr-2"></span>
            <span>{error}</span>
          </div>
          <button
            onClick={() => fetchTransactions(selectedStudentId)}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
          >
            {texts.Retry}
          </button>
        </div>
      )}

      <h2 className="text-2xl font-semibold">{T.Transactions}</h2>

      {/* Filter by Student */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4">
        <select
          value={selectedStudentId}
          onChange={handleStudentChange}
          className="py-2 px-3 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="0">{texts.All_Students}</option>
          {children.map((child) => {
            const fullName = [child.firstName, child.middleName, child.lastName]
              .filter(Boolean)
              .join(" ");
            return (
              <option key={child.studentId} value={child.studentId}>
                {fullName}
              </option>
            );
          })}
        </select>
      </div>

      {/* TABLE */}
      <ControlledTable
        columns={columns}
        data={transactions}
        fullData={fullTransactions}
        btn={false}
        header={false}
        showSearch={false}
        showExport={true}
        showSelectAll={false}
        showPaginationFooter={true}
        actionColumn={false}
      />
    </div>
  );
};

export default Transactions;