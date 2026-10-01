import { useMutation, useQuery } from "@tanstack/react-query";
import { academicYearService, balanceSheetService } from "../../../services/feesCollection/balancesheetService";
import type { BalanceSheetForm } from "../../../types/feesCollection/balancesheet";

const downloadBalanceSheet = (form: BalanceSheetForm) => {
    switch (form.basis) {
        case "session":
            return balanceSheetService.downloadBySession(Number(form.sessionId));

        case "year":
            return balanceSheetService.downloadByYear(Number(form.yearId));

        case "dateRange":
            return balanceSheetService.downloadByDateRange(form.fromDate, form.toDate);

        default:
            throw new Error("Invalid filter basis");
    }
};

export const useDownloadBalanceSheet = () =>
    useMutation({ mutationFn: downloadBalanceSheet });

export const useAcademicYears = () =>
    useQuery({
        queryKey: ["academic-years"],
        queryFn: academicYearService.getAcademicYears,
        staleTime: 5 * 60 * 1000, // cache for 5 minutes
    });