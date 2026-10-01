import { fetchDocumentBlob } from "./fetchDocumentBlob";

export const downloadDocument = async (
  documentPath: string,
  fileName?: string
) => {
  const blob = await fetchDocumentBlob(documentPath);
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download =
    fileName || documentPath.split("/").pop() || "file";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};
