// hooks/useBlobImage.ts
import { useEffect, useRef, useState } from "react";

type UseBlobImageResult = {
  src: string | null;
  loading: boolean;
  error: string | null;
};

export function useBlobImage(
  fetcher: () => Promise<Blob>,
  deps: React.DependencyList,
): UseBlobImageResult {
  const [src, ] = useState<string | null>(null);
  const [loading, ] = useState(false);
  const [error, ] = useState<string | null>(null);

  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    console.log("fetcher", fetcher,deps);




    // load();

    return () => {

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [deps]);

  return { src, loading, error };
}

// services/openDocument.ts
import AxiosFunc from "../utils/axios";

export const openDocument = async (documentPath: string) => {
  if (!documentPath) {
    throw new Error("Document path is missing");
  }

  const response = await AxiosFunc.GetFile(`/${documentPath}`);

  const responseContentType = response.headers["content-type"];
  const contentType =
    typeof responseContentType === "string"
      ? responseContentType
      : "application/pdf";

  const blob = new Blob([response.data], { type: contentType });
  const url = URL.createObjectURL(blob);

  const win = window.open();
  if (!win) {
    URL.revokeObjectURL(url);
    throw new Error("Popup blocked by browser");
  }

  win.location.href = url;

  setTimeout(() => URL.revokeObjectURL(url), 15000);
};
 