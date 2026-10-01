// import React, { useState } from "react";
// import { useLocation } from "react-router-dom";
// import { useForm } from "react-hook-form";
// import ControlledTable from "../../components/uncontrolled/ControlledTable";
// import Button from "../../components/controlled/Button";
// import SearchFeesPaymentTable from "../../components/uncontrolled/SearchFeesPaymentTable";
// import TextField from "../../components/controlled/TextField";
// import Dropdown from "../../components/controlled/Dropdown";
// import AmountField from "../../components/controlled/AmountField";
// import type { StudentData } from "../../page/home/feesCollection/SearchDueFees";

// interface TransactionFormData {
//   feeType: string;
//   paymentId: string;
//   paymentDate: string;
//   paymentMode: string;
//   amountToAdd: string;
//   discount: string;
// }

// const DueFeeDetails: React.FC = () => {
//   const { state } = useLocation();
//   const [student, setStudent] = useState<StudentData>(state);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const { control, handleSubmit, watch, reset } = useForm<TransactionFormData>({
//     defaultValues: {
//       feeType: "",
//       paymentId: "",
//       paymentDate: new Date().toISOString().split('T')[0],
//       paymentMode: "Cash",
//       amountToAdd: "",
//       discount: ""
//     }
//   });

//   const feeType = watch("feeType") as "tuition" | "hostel" | "transport" | "";
//   const amountToAdd = Number(watch("amountToAdd")) || 0;
//   const discount = Number(watch("discount")) || 0;

//   const [transactions, setTransactions] = useState([
//     {
//       id: 1,
//       paymentId: "PAY-999",
//       date: "2025-01-01",
//       feeType: "Initial",
//       mode: "Cash",
//       paid: "100",
//       discount: "0"
//     }
//   ]);

//   const feeSummary = [
//     {
//       id: 'f1',
//       type: "Tuition Fee",
//       ...student.fees.tuition,
//       pending: student.fees.tuition.total - student.fees.tuition.paid,
//       fine: student.fees.tuition.fine || 0
//     },
//     {
//       id: 'f2',
//       type: "Hostel Fee",
//       ...student.fees.hostel,
//       pending: student.fees.hostel.total - student.fees.hostel.paid,
//       fine: student.fees.hostel.fine || 0
//     },
//     {
//       id: 'f3',
//       type: "Transport Fee",
//       ...student.fees.transport,
//       pending: student.fees.transport.total - student.fees.transport.paid,
//       fine: student.fees.transport.fine || 0
//     },
//   ];

//   const summaryColumns = [
//     { key: "type", label: "Fee Type" },
//     { key: "total", label: "Total Amount" },
//     { key: "paid", label: "Paid Amount" },
//     { key: "pending", label: "Pending Amount" },
//     { key: "fine", label: "Fine" },
//   ];

//   const selectedFeeInfo = feeType ? student.fees[feeType] : null;
//   const currentPending = selectedFeeInfo ? selectedFeeInfo.total - selectedFeeInfo.paid : 0;
//   const currentFine = selectedFeeInfo ? (selectedFeeInfo.fine || 0) : 0;

//   const resetForm = () => {
//     reset({
//       feeType: "",
//       paymentId: "",
//       paymentDate: new Date().toISOString().split('T')[0],
//       paymentMode: "Cash",
//       amountToAdd: "",
//       discount: ""
//     });
//   };

//   const onSubmit = (data: TransactionFormData) => {
//     const amount = Number(data.amountToAdd);
//     const discountAmount = Number(data.discount) || 0;

//     if (!data.feeType || amount <= 0 || amount > currentPending) return;

//     const updatedStudent = { ...student };
//     updatedStudent.fees[data.feeType as "tuition" | "hostel" | "transport"].paid += amount;
//     setStudent(updatedStudent);

//     const newTx = {
//       id: Date.now(),
//       paymentId: data.paymentId.trim(),
//       date: data.paymentDate,
//       feeType: data.feeType.charAt(0).toUpperCase() + data.feeType.slice(1),
//       mode: data.paymentMode,
//       paid: `${amount}`,
//       discount: `${discountAmount}`
//     };
//     setTransactions([newTx, ...transactions]);

//     setIsModalOpen(false);
//     resetForm();
//   };

//   const handleModalClose = () => {
//     setIsModalOpen(false);
//     resetForm();
//   };

//   const feeTypeOptions = [
//     { label: "Tuition Fee", value: "tuition" },
//     { label: "Hostel Fee", value: "hostel" },
//     { label: "Transport Fee", value: "transport" }
//   ];

//   const paymentModeOptions = [
//     { label: "Cash", value: "Cash" },
//     { label: "Online", value: "Online" },
//     { label: "Cheque", value: "Cheque" },
//     { label: "Card", value: "Card" },
//     { label: "UPI", value: "UPI" }
//   ];

//   return (
//     <div className="p-6 bg-gray-50 min-h-screen">
//       <div className="bg-white rounded-lg shadow p-6 space-y-6">
//         <div className="flex justify-between items-center border-b pb-4">
//           <div>
//             <h2 className="text-xl font-bold text-gray-800">{student.studentName}</h2>
//             <p className="text-sm text-gray-500">
//               Adm: {student.admissionNo} | Class: {student.class} | Section: {student.section}
//             </p>
//           </div>
//           <div onClick={() => setIsModalOpen(true)}>
//             <Button name="Add Transaction" loading={false} />
//           </div>
//         </div>

//         <ControlledTable
//           columns={summaryColumns}
//           data={feeSummary}
//           actionColumn={false}
//           showSearch={false}
//           title="Fee Structure Breakdown"
//         />

//         <SearchFeesPaymentTable transactions={transactions} />

//         {/* Enhanced Transaction Modal */}
//         {isModalOpen && (
//           <div className="fixed inset-0 backdrop-blur-md flex justify-center items-center z-50 p-4">
//             <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
//               <h3 className="text-xl font-bold mb-4">New Payment Transaction</h3>

//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//                 {/* Fee Summary Display */}
//                 {feeType && (
//                   <div className="bg-blue-50 p-4 rounded-lg grid grid-cols-4 gap-4 text-center">
//                     <div>
//                       <p className="text-xs font-semibold text-gray-600">Total Amount</p>
//                       <p className="text-lg font-bold text-gray-800">{selectedFeeInfo?.total}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs font-semibold text-gray-600">Paid Amount</p>
//                       <p className="text-lg font-bold text-green-600">{selectedFeeInfo?.paid}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs font-semibold text-gray-600">Pending Amount</p>
//                       <p className="text-lg font-bold text-red-600">{currentPending}</p>
//                     </div>
//                     <div>
//                       <p className="text-xs font-semibold text-gray-600">Fine Amount</p>
//                       <p className="text-lg font-bold text-orange-600">{selectedFeeInfo?.fine || 0}</p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Form Grid */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {/* Fee Type */}
//                   <Dropdown
//                     name="feeType"
//                     label="Fee Type"
//                     control={control}
//                     options={feeTypeOptions}
//                     required={true}
//                   />

//                   {/* Payment ID */}
//                   <TextField
//                     name="paymentId"
//                     label="Payment ID"
//                     control={control}
//                     placeholder="Enter payment ID"
//                   />

//                   {/* Payment Date
//                   <DateField
//                     name="paymentDate"
//                     label="Payment Date"
//                     control={control}
//                     required={true}
//                   /> */}

//                   {/* Payment Mode */}
//                   <Dropdown
//                     name="paymentMode"
//                     label="Payment Mode"
//                     control={control}
//                     options={paymentModeOptions}
//                     required={true}
//                   />

//                   {/* Payment Amount */}
//                   <div>
//                     <AmountField
//                       name="amountToAdd"
//                       label="Payment Amount"
//                       control={control}
//                       required={true}
//                       placeholder="Enter amount"
//                     />
//                     {amountToAdd > currentPending && (
//                       <p className="text-red-500 text-xs mt-1">
//                         Cannot exceed pending amount of {currentPending}
//                       </p>
//                     )}
//                   </div>

//                   {/* Discount */}
//                   <AmountField
//                     name="discount"
//                     label="Discount"
//                     control={control}
//                     required={false}
//                     placeholder="Enter discount"
//                   />
//                 </div>

//                 {/* Net Amount Display */}
//                 {amountToAdd > 0 && (
//                   <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-2">
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-600">Payment Amount:</span>
//                       <span className="font-semibold">{amountToAdd}</span>
//                     </div>
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-600">Discount:</span>
//                       <span className="font-semibold text-green-600">- {discount}</span>
//                     </div>
//                     <div className="flex justify-between items-center text-sm">
//                       <span className="text-gray-600">Fine (if any):</span>
//                       <span className="font-semibold text-orange-600">+ {currentFine}</span>
//                     </div>
//                     <div className="border-t pt-2 flex justify-between items-center">
//                       <span className="text-sm font-medium">Total Amount Due:</span>
//                       <span className="text-lg font-bold text-blue-600">
//                         {amountToAdd - discount + currentFine}
//                       </span>
//                     </div>
//                   </div>
//                 )}

//                 {/* Action Buttons */}
//                 <div className="flex gap-3 mt-6 pt-4 border-t">
//                   <div className="flex-1" onClick={handleModalClose}>
//                     <Button
//                       name="Cancel"
//                       loading={false}
//                     />
//                   </div>
//                   <div className="flex-1">
//                     <Button
//                       name="Confirm Payment"
//                       loading={false}
//                       isDisable={amountToAdd > currentPending}
//                     />
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DueFeeDetails;
