import AxiosFunc from "../utils/axios";

export const fetchDocumentBlob = async (documentPath: string) => {
  if (!documentPath) {
    throw new Error("Document path is missing");
  }

  const response = await AxiosFunc.GetFile(`/${documentPath}`);

  const contentType =
    response.headers["content-type"] || "application/octet-stream";

  return new Blob([response.data], { type: contentType });
};