import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import ToggleButton from "../controlled/ToggleButton";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../helpers/useTranslations";
 
interface Column<T> {
  key: keyof T;
  label: string;
}
 
interface CurrencyControlledTableProps<T> {
  columns: Column<T>[];
  data: T[];
  title?: string;
  lastColumn?: string;
  symbolColumn?: string;
  rateColumn?: string;
  currencyColumn?: string;
  activeColumn?: string;
}
 
const CurrencyControlledTable = <T extends { id: string | number }>({
  columns = [],
  data = [],
  title,
  lastColumn,
  symbolColumn,
  rateColumn,
  currencyColumn,
  activeColumn
}: CurrencyControlledTableProps<T>) => {
  const showToast = () => {
    toast.success("Record Updated Successfully!");
  };
 
  const {t}= useTranslation();
  const Are_You_Sure_Text = getPagesDataText(t);
  const Active_Text = getPagesDataText(t);
 
  const [showMessage, setShowMessage] = useState<string | number | null>(null);
  const [radiobtn, setRadiobtn] = useState<string | number | null>(null);
  const [togglebtn, setTogglebtn] = useState<string | number | null>(null);
  const [toggleState, setToggleState] = useState<Record<string | number, boolean>>({});
 
  return (
    <div className="p-4 bg-white rounded-xl shadow-2xl mt-5">
      <div>
        <div className="flex justify-between">
          <h1 className="text-xl font-semibold mb-4">{title}</h1>
        </div>
        <hr />
      </div>
 
      <div className="overflow-x-auto">
        <table className="table-auto w-full text-sm text-gray-600">
          <thead className="bg-gray-100">
            <tr>
              {columns.map((col) => (
                <th key={col.key as string} className="px-4 py-2 text-left font-semibold">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-2 text-left font-semibold">{symbolColumn}</th>
              <th className="px-4 py-2 text-left font-semibold">{rateColumn}</th>
              <th className="px-4 py-2 text-left font-semibold">{currencyColumn}</th>
              <th className="px-4 py-2 text-left font-semibold">{activeColumn}</th>
              <th className="px-4 py-2 text-right font-semibold">{lastColumn}</th>
            </tr>
          </thead>
 
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 5} className="text-center py-4">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="border-b">
                  {columns.map((col) => (
                    <td key={col.key as string} className="px-4 py-2">
                      {String(item[col.key])}
                    </td>
                  ))}
 
                  <td className="px-4 py-2">
                    <input className="border-1" />
                  </td>
 
                  <td className="px-4 py-2">
                    <input className="border-1" />
                  </td>
 
                  <td className="px-4 py-2">
                    {showMessage === item.id && (
                      <p className="bg-green-600 text-white font-medium px-2 py-1 rounded text-xs w-13">
                        {Active_Text.Active}
                      </p>
                    )}
                  </td>
 
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        const confirmed = window.confirm(
                          Are_You_Sure_Text.Are_you_sure_you_want_to_make_this_changes
                        );
                        if (confirmed) {
                          showToast();
                          setShowMessage((prev) => (prev === item.id ? null : item.id));
                          setTogglebtn((prev) => (prev === item.id ? null : item.id));
                        }
                      }}
                    >
                      {radiobtn === item.id && (
                        <input type="radio" className="cursor-pointer" />
                      )}
                    </button>
                  </td>
 
                  <td className="px-4 py-2">
                    <div className="flex justify-end space-x-2">
                      {togglebtn !== item.id && (
                        <ToggleButton
                          name={`toggle-${item.id}`}
                          value={toggleState[item.id] || false}
                          onChange={() => {
                            const confirmed = window.confirm(
                              Are_You_Sure_Text.Are_you_sure_you_want_to_make_this_changes
                            );
                            if (confirmed) {
                              showToast();
                              setRadiobtn((prev) => (prev === item.id ? null : item.id));
                              setToggleState((prev) => ({
                                ...prev,
                                [item.id]: !prev[item.id]
                              }));
                            }
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
 
      <ToastContainer />
    </div>
  );
};
 
export default CurrencyControlledTable;
 
 