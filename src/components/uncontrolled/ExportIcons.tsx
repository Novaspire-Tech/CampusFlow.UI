import React from "react";
import IconField from "../IconField";

export type Column<T> = {
  key: keyof T;
  label?: string;
  emptyValue?: string;
};

type ExportIconsProps<T> = {
  data?: T[];
  columns?: Column<T>[];
  filename?: string;
  iconSize?: number;
  className?: string;
  showCopy?: boolean;
  showExcel?: boolean;
  showCSV?: boolean;
  showPDF?: boolean;
  showPrint?: boolean;
  pdfTitle?: string;
  pdfOptions?: Record<string, any>;
  grandTotal?: number;
  grandTotalLabel?: string;
};

function ExportIcons<T>({
  data,
  columns,
  filename = "export",
  iconSize = 25,
  className = "",
  showCopy = true,
  showExcel = true,
  showCSV = true,
  showPDF = true,
  showPrint = true,
  pdfTitle = "Report",
  pdfOptions = {},
  grandTotal,
  grandTotalLabel = "Grand Total",
}: ExportIconsProps<T>): React.ReactElement {
  console.log(data)
  const getNestedValue = (obj: any, path: string): any => {
    if (!obj || typeof obj !== "object" || !path) return undefined;
    return path.split(".").reduce((acc, part) => {
      if (acc && typeof acc === "object" && part in acc) {
        return acc[part];
      }
      return undefined;
    }, obj);
  };

  const prepareExportData = (
    includeGrandTotal: boolean = false,
  ): Record<string, string>[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    let effectiveColumns: Column<T>[] = [];

    if (columns && columns.length > 0) {
      effectiveColumns = columns;
    } else if (data.length > 0) {
      const firstItem = data[0];
      if (firstItem && typeof firstItem === "object") {
        effectiveColumns = Object.keys(firstItem as object).map((key) => ({
          key: key as keyof T,
          label: key,
        }));
      }
    }

    const exportData: Record<string, string>[] = data.map((item) => {
      const exportItem: Record<string, string> = {};

      effectiveColumns.forEach((col) => {
        const columnKey = col.key as string;
        const columnLabel = col.label || columnKey;

        try {
          let value: any = "";

          if (columnKey.includes(".") && typeof item === "object") {
            value = getNestedValue(item, columnKey);
          } else if (columnKey && item && typeof item === "object") {
            value = item[columnKey as keyof T];
          }

          exportItem[columnLabel] =
            value !== undefined && value !== null
              ? String(value)
              : col.emptyValue || "";
        } catch (error) {
          console.error(
            `Error getting value for column ${columnLabel}:`,
            error,
          );
          exportItem[columnLabel] = col.emptyValue || "";
        }
      });

      return exportItem;
    });

    if (
      includeGrandTotal &&
      grandTotal !== undefined &&
      grandTotal !== null &&
      exportData.length > 0
    ) {
      const totalRow: Record<string, string> = {};
      const firstRowKeys = Object.keys(exportData[0]);

      let amountColumnLabel = "";

      for (let i = 0; i < firstRowKeys.length; i++) {
        const key = firstRowKeys[i];
        const lowerKey = key.toLowerCase();

        if (
          lowerKey.includes("amount") ||
          lowerKey.includes("total") ||
          lowerKey.includes("price") ||
          lowerKey.includes("value") ||
          lowerKey.includes("cost") ||
          lowerKey.includes("₹") ||
          lowerKey.includes("$")
        ) {
          amountColumnLabel = key;
          break;
        }
      }

      if (!amountColumnLabel && firstRowKeys.length > 0) {
        amountColumnLabel = firstRowKeys[firstRowKeys.length - 1];
      }

      // Fill the total row
      firstRowKeys.forEach((key, index) => {
        if (index === 0) {
          totalRow[key] = grandTotalLabel;
        } else if (key === amountColumnLabel) {
          let formattedTotal = grandTotal.toLocaleString();

          if (exportData.length > 0 && exportData[0][key]) {
            const firstValue = exportData[0][key];
            if (firstValue.includes("₹")) {
              formattedTotal = `₹${formattedTotal}`;
            } else if (firstValue.includes("$")) {
              formattedTotal = `$${formattedTotal}`;
            }
          } else {
            formattedTotal = `₹${formattedTotal}`;
          }

          totalRow[key] = formattedTotal;
        } else {
          totalRow[key] = "";
        }
      });

      exportData.push(totalRow);
    }

    return exportData;
  };

  const handleCopy = async () => {
    const exportData = prepareExportData(false);
    if (exportData.length === 0) return alert("No data to copy");

    try {
      const headers = Object.keys(exportData[0]).join("\t");
      const rows = exportData
        .map((row) => Object.values(row).join("\t"))
        .join("\n");

      await navigator.clipboard.writeText(`${headers}\n${rows}`);
      alert("Data copied to clipboard!");
    } catch (error) {
      console.error("Copy error:", error);
      alert("Failed to copy data to clipboard");
    }
  };

  const handleExcelExport = () => {
    import("xlsx")
      .then((XLSX) => {
        const exportData = prepareExportData(true);
        if (exportData.length === 0) return alert("No data to export");

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
        XLSX.writeFile(workbook, `${filename}.xlsx`);
      })
      .catch((error) => {
        console.error("Excel export error:", error);
        alert("Failed to export Excel file");
      });
  };

  const handleCSVExport = () => {
    import("xlsx")
      .then((XLSX) => {
        const exportData = prepareExportData(true);
        if (exportData.length === 0) return alert("No data to export");

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const csv = XLSX.utils.sheet_to_csv(worksheet);
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((error) => {
        console.error("CSV export error:", error);
        alert("Failed to export CSV file");
      });
  };

  const handlePDFExport = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const exportData = prepareExportData(true);

      if (exportData.length === 0) return alert("No data to export");

      const doc = new jsPDF({ orientation: "portrait", unit: "mm" });
      doc.setFontSize(16);
      doc.text(pdfTitle, 14, 10);

      const headers = Object.keys(exportData[0]);
      const bodyData = exportData.map((row) =>
        headers.map((header) => String(row[header] ?? "")),
      );

      autoTable(doc, {
        head: [headers],
        body: bodyData,
        startY: 20,
        styles: {
          fontSize: 10,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
          lineColor: [0, 0, 0],
          lineWidth: 0.1,
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        didDrawCell: (data: any) => {
          if (
            grandTotal !== undefined &&
            data.row.index === bodyData.length - 1
          ) {
            doc.setFillColor(240, 240, 240);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              "F",
            );
            doc.setTextColor(0, 0, 0);
            doc.setFont("helvetica", "bold");
          }
        },
        ...pdfOptions,
      });

      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to generate PDF");
    }
  };

  const handlePrint = () => {
    const exportData = prepareExportData(true);
    if (exportData.length === 0) return alert("No data to print");

    const headers = Object.keys(exportData[0]);
    const printContent = `
      <html>
        <head>
          <title>${pdfTitle}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px; 
              margin: 0;
            }
            h1 { 
              text-align: center; 
              margin-bottom: 20px;
              color: #333;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 10px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px 12px; 
              text-align: left; 
            }
            th { 
              background-color: #2980b9; 
              color: white; 
              font-weight: bold;
            }
            .grand-total-row { 
              background-color: #f3f4f6; 
              font-weight: bold; 
              border-top: 2px solid #333;
            }
            @media print {
              body { padding: 10px; }
              table { font-size: 12px; }
            }
          </style>
        </head>
        <body>
          <h1>${pdfTitle}</h1>
          <table>
            <thead>
              <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
            </thead>
            <tbody>
              ${exportData
                .map((row, index) => {
                  const isGrandTotalRow =
                    grandTotal !== undefined && index === exportData.length - 1;
                  const rowClass = isGrandTotalRow ? "grand-total-row" : "";
                  return `
                    <tr class="${rowClass}">
                      ${headers.map((h) => `<td>${row[h] || ""}</td>`).join("")}
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() {
                window.close();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      alert("Please allow popups to print the report.");
    }
  };

  return (
    <div className={`flex flex-wrap py-2 border-b ${className}`}>
      {showCopy && (
        <button
          onClick={handleCopy}
          title="Copy to clipboard"
          className="hover:text-blue-500 p-1"
        >
          <IconField name="FaCopy" size={iconSize} />
        </button>
      )}
      {showExcel && (
        <button
          onClick={handleExcelExport}
          title="Export to Excel"
          className="hover:text-green-600 p-1"
        >
          <IconField name="FaFileExcel" size={iconSize} />
        </button>
      )}
      {showCSV && (
        <button
          onClick={handleCSVExport}
          title="Export to CSV"
          className="hover:text-green-600 p-1"
        >
          <IconField name="FaFileAlt" size={iconSize} />
        </button>
      )}
      {showPDF && (
        <button
          onClick={handlePDFExport}
          title="Export to PDF"
          className="hover:text-red-500 p-1"
        >
          <IconField name="FaFilePdf" size={iconSize} />
        </button>
      )}
      {showPrint && (
        <button
          onClick={handlePrint}
          title="Print"
          className="hover:text-gray-600 p-1"
        >
          <IconField name="FaPrint" size={iconSize} />
        </button>
      )}
    </div>
  );
}

export default ExportIcons;
