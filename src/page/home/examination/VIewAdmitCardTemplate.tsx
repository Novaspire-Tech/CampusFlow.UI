// import { Button } from "../../../components/controlled";
// import AdmitCardUI from "./AdmitCardUI";

// // Add this component inside DesignAdmitCard or in a separate file
// export const ViewAdmitCardTemplate: React.FC<{
//   template: any;
//   isOpen: boolean;
//   onClose: () => void;
// }> = ({ template, isOpen, onClose }) => {
//   if (!isOpen || !template) return null;

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         {/* Header */}
//         <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//           <h2 className="text-xl font-bold text-gray-800">View Admit Card Template</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
//           >
//             &times;
//           </button>
//         </div>

//         {/* Content */}
//         <div className="p-6 space-y-6">
//           {/* Basic Information */}
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Template Name
//               </label>
//               <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
//                 {template.templateName}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 Exam Name
//               </label>
//               <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
//                 {template.examName}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 School Name
//               </label>
//               <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
//                 {template.schoolName}
//               </p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-600 mb-1">
//                 School Address
//               </label>
//               <p className="text-gray-800 bg-gray-50 p-3 rounded-md">
//                 {template.address}
//               </p>
//             </div>
//           </div>

//           {/* Field Visibility */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">
//               Field Visibility
//             </h3>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//               {[
//                 { label: "Mother's Name", key: "motherName" },
//                 { label: "Father's Name", key: "fatherName" },
//                 { label: "Roll Number", key: "rollNo" },
//                 { label: "Admission No.", key: "admissionNo" },
//                 { label: "Class", key: "className" },
//                 { label: "Section", key: "section" },
//                 { label: "Date of Birth", key: "dateOfBirth" },
//                 { label: "Gender", key: "gender" },
//                 { label: "Principal Signature", key: "sign" },
//               ].map((field) => (
//                 <div
//                   key={field.key}
//                   className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
//                 >
//                   <span className="text-sm text-gray-700">{field.label}</span>
//                   <span
//                     className={`px-2 py-1 text-xs font-medium rounded-full ${
//                       template[field.key]
//                         ? "bg-green-100 text-green-800"
//                         : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {template[field.key] ? "Visible" : "Hidden"}
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Images Preview */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">
//               Uploaded Images
//             </h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-2">
//                   School Logo
//                 </label>
//                 {template.logo ? (
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
//                     <img
//                       src={typeof template.logo === 'string' ? template.logo : URL.createObjectURL(template.logo)}
//                       alt="School Logo"
//                       className="max-h-32 object-contain"
//                     />
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic bg-gray-50 p-3 rounded-md">
//                     No logo uploaded
//                   </p>
//                 )}
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-600 mb-2">
//                   Principal Signature
//                 </label>
//                 {template.principleSign ? (
//                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center">
//                     <img
//                       src={typeof template.principleSign === 'string' ? template.principleSign : URL.createObjectURL(template.principleSign)}
//                       alt="Principal Signature"
//                       className="max-h-32 object-contain"
//                     />
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic bg-gray-50 p-3 rounded-md">
//                     No signature uploaded
//                   </p>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Preview Section */}
//           <div>
//             <h3 className="text-lg font-semibold text-gray-700 mb-3">
//               Template Preview
//             </h3>
//             <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
//               <div className="flex justify-center">
//                 <AdmitCardUI 
//                   data={template} 
//                   student={dummyStudents[0] || {}} 
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
//           <Button
//             name="Close"
//             loading={false}
//             onClick={onClose}
//           />
//           <Button
//             name="Use This Template"
//             loading={false}
//             onClick={() => {
//               onClose();
//             }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };