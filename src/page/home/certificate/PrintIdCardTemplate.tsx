import React from "react";
import Button  from "../../../components/controlled/Button";
 
type PrintIdCardTemplateProps = {
  isOpen: boolean;
  onClose: () => void;
  students: { rendered: string }[];
};
 
const PrintIdCardTemplate: React.FC<PrintIdCardTemplateProps> = ({
  isOpen,
  onClose,
  students,
}) => {
  if (!isOpen) return null;
 
 
  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex justify-center items-centerp-2 sm:p-4 md:p-6" >
      <div
        className="
          bg-white rounded-xl shadow-2xl
          w-full max-w-[650px]
          max-h-[90vh]
          overflow-y-auto
          p-4 sm:p-6
          relative
          print:w-full print:h-full print:rounded-none print:shadow-none
        "
      >
        <div className="flex justify-between items-center mb-4 print:hidden">
         <Button
            name="Print"
            loading={false}
            clr="bg-gray-600"
            onClick={() => window.print()}
          />
 
       <Button
            name="Close"
            loading={false}
            clr="bg-white text-black border border-gray-400"
            onClick={onClose}
          />
        </div>
 
     
        <div
          className="
            grid
            grid-cols-1
            place-items-center
            sm:grid-cols-1
            md:grid-cols-1
            gap-4
            print:grid-cols-1
          "
        >
          {students.map((student, index) => (
            <div
              key={index}
              className="
                border rounded-lg p-4
                flex justify-center items-center
                shadow-sm bg-white
                print:shadow-none print:border-none
              "
            >
              <div
                className="w-full flex justify-center"
                dangerouslySetInnerHTML={{ __html: student.rendered }}
              />
            </div>
          ))}
        </div>
 
      </div>
    </div>
  );
};
 
export default PrintIdCardTemplate;