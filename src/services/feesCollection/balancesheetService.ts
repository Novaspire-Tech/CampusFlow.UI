import { axiosInstance } from "../../utils/axios";
import type { BalanceSheetResult } from "../../types/feesCollection/balancesheet";

export interface AcademicYear {
    year: number;
}

const ENDPOINTS = {
    BY_SESSION: (id: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/balance-sheet/session/${id}`,
    BY_DATE_RANGE: "/school-group/{schoolGroupCode}/school/{schoolCode}/balance-sheet/date-range",
    BY_YEAR: (year: number) => `/school-group/{schoolGroupCode}/school/{schoolCode}/balance-sheet/year/${year}`,
    GET_ACADEMIC_YEARS: `/school-group/{schoolGroupCode}/school/{schoolCode}/academic-years`
};

const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const fetchAndDownload = async (
    path: string,
    queryParams?: Record<string, string>,
): Promise<BalanceSheetResult> => {
    const response = await axiosInstance.get(path, {
        params: queryParams,
        responseType: "blob",
    });

    const contentTypeHeader = response.headers["content-type"];
    const contentDispositionHeader = response.headers["content-disposition"];
    const contentType =
        typeof contentTypeHeader === "string" ? contentTypeHeader : "";
    const contentDisposition =
        typeof contentDispositionHeader === "string"
            ? contentDispositionHeader
            : "";

    if (
        contentType.includes("application/octet-stream") ||
        contentDisposition.includes("attachment")
    ) {
        triggerDownload(response.data, "balance_sheet.xlsx");
        return { downloaded: true };
    }
    const text = await (response.data as Blob).text();
    const json = JSON.parse(text);
    return {
        downloaded: false,
        message: json?.message || "No data found for the selected filter.",
    };
};

export const balanceSheetService = {
    downloadBySession: (sessionId: number): Promise<BalanceSheetResult> =>
        fetchAndDownload(ENDPOINTS.BY_SESSION(sessionId)),

    downloadByDateRange: (
        fromDate: string,
        toDate: string,
    ): Promise<BalanceSheetResult> =>
        fetchAndDownload(ENDPOINTS.BY_DATE_RANGE, { fromDate, toDate }),

    downloadByYear: (year: number): Promise<BalanceSheetResult> =>
        fetchAndDownload(ENDPOINTS.BY_YEAR(year)),
};

export const academicYearService = {
    getAcademicYears: async (): Promise<AcademicYear[]> => {
        const response = await axiosInstance.get(ENDPOINTS.GET_ACADEMIC_YEARS);
        const years: number[] = response.data?.data ?? [];
        return years.map((y) => ({ year: y }));
    },
};