import React, { useMemo, useState } from "react";
import ExportIcons from "./ExportIcons";

interface Column<T> {
  key: keyof T;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface FeeTableProps<T> {
  columns: Column<T>[];
  data: T[];
  fullData?: T[]; 
  title?: string;

  actionColumn?: boolean;
  hiddenColumns?: (keyof T)[];
  pageSize?: number;

  customExportColumns?: Column<T>[];
  exportFilename?: string;
  exportTitle?: string;
  totals?: {
    [key in keyof T]?: (data: T[]) => React.ReactNode;
  };
}

function FeeTable<T extends { id: string | number }>({
  columns = [],
  data,
  fullData,
  title = "",

  actionColumn = true,
  hiddenColumns = [],
  pageSize = 10,

  customExportColumns = [],
  exportFilename,
  exportTitle,
  totals,
}: FeeTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, currentPage, pageSize]);

  const totalPages = Math.ceil(data.length / pageSize);

  return (
    <div className=" overflow-x-auto shadow-sm mt-6">
      <div className="flex justify-between px-4 py-2 ">
        <div>
          {" "}
          {title && <h2 className="text-xl font-semibold mb-4 ">{title}</h2>}
        </div>
        <ExportIcons
          data={fullData?.length ? fullData : data}
          columns={
            customExportColumns.length > 0 ? customExportColumns : columns
          }
          filename={exportFilename || title.toLowerCase().replace(/\s+/g, "_")}
          pdfTitle={exportTitle || `${title} Report`}
          className="flex-wrap gap-3 text-gray-700"
          iconSize={25}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="min-w-full divide-y divide-gray-200 text-sm text-gray-600 overflow-x-auto">
          <thead className="bg-gray-50">
            <tr className="text-center">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-2 ${
                    hiddenColumns.includes(col.key) ? "hidden" : ""
                  }`}
                >
                  {col.label}
                </th>
              ))}
              {actionColumn && <th className="px-4 py-2">Action</th>}
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((item) => (
              <tr
                key={item.id}
                className="text-center border-b hover:bg-gray-50"
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-2 ${
                      hiddenColumns.includes(col.key) ? "hidden" : ""
                    }`}
                  >
                    {col.render
                      ? col.render(item)
                      : (item[col.key] as React.ReactNode)}
                  </td>
                ))}
                {actionColumn && <td className="px-4 py-2">-</td>}
              </tr>
            ))}

            {totals && fullData && fullData?.length > 0 && (
              <tr className="font-semibold bg-gray-100 text-center">
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-2 ${
                      hiddenColumns.includes(col.key) ? "hidden" : ""
                    }`}
                  >
                    {fullData && totals[col.key]
                      ? totals[col.key]!(fullData)
                      : ""}
                  </td>
                ))}
                {actionColumn && <td className="px-4 py-2"></td>}
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 flex justify-end items-center space-x-2">
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-2 py-1 border rounded disabled:opacity-50"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default FeeTable;
