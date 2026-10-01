import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import RadioButton from "../../../components/controlled/RadioButton";
import Dropdown from "../../../components/controlled/Dropdown";
import DateField from "../../../components/controlled/DateField";
import { PastDateField } from "../../../components/controlled";
import Button from "../../../components/controlled/Button";
import { IconField } from "../../../components";
import { useSessions } from "../../../hooks/queries/systemSettinds/useSessionSetting";
import type { Session } from "../../../types/systemSettinds/SessionSetting";
import { useDownloadBalanceSheet } from "../../../hooks/queries/feesCollection/useBalancesheet";
import { useAcademicYears } from "../../../hooks/queries/feesCollection/useBalancesheet"; 
import type { BalanceSheetForm } from "../../../types/feesCollection/balancesheet";
import { useTranslation } from "react-i18next";
import { getPagesDataText, getPagesNameText } from "../../../helpers/useTranslations";


function BalanceSheet() {
  const { data: sessions = [] } = useSessions();
  const { data: academicYears = [], isLoading: yearsLoading } = useAcademicYears(); 
  const downloadMutation = useDownloadBalanceSheet();

  const { t } = useTranslation();
    const Text = getPagesDataText(t);
    const NameText = getPagesNameText(t);

    const BASIS_OPTIONS = [
  { label: Text.Session, value: "session" },
  { label: Text.Date, value: "dateRange" },
  { label: Text.Year, value: "year" },
];

  const { control, watch, handleSubmit } = useForm<BalanceSheetForm>({
    defaultValues: {
      basis: "session",
      sessionId: "",
      yearId: "",
      fromDate: "",
      toDate: "",
    },
  });

  const SESSION_OPTIONS = sessions.map((s: Session) => ({
    label: s.session || s.sessionName,
    value: String(s.sessionId),
  }));
  const YEAR_OPTIONS = academicYears.map(({ year }) => ({
    label: String(year),
    value: String(year),
  }));

  const [basis, sessionId, yearId, fromDate, toDate] = watch([
    "basis", "sessionId", "yearId", "fromDate", "toDate",
  ]);

  const isDisabled = (): boolean => {
    if (downloadMutation.isPending) return true;
    if (basis === "session") return !sessionId;
    if (basis === "year") return !yearId || yearsLoading;
    if (basis === "dateRange") return !fromDate || !toDate;
    return true;
  };

  const onDownload = async (data: BalanceSheetForm) => {
    try {
      const result = await downloadMutation.mutateAsync(data);
      if (result.downloaded) {
        toast.success("Balance sheet downloaded successfully!");
      } else {
        toast.info(result.message);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to download balance sheet.");
    }
  };

  return (
    <div className="mx-auto my-4 w-[95%] max-w-3xl rounded-xl border border-gray-100 bg-white shadow-lg sm:my-10 p-4 sm:p-6 md:p-8">
      <div className="mb-6 border-b pb-4">
        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{NameText.Balance_Sheet}</h1>
        <p className="text-sm text-slate-500 mt-1">
          {Text.Download_Balance_Sheet_Report}
        </p>
      </div>

      <form onSubmit={handleSubmit(onDownload)} className="space-y-6">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:p-5">
          <RadioButton
            name="basis"
            label={Text.Select_Filter_Type}
            control={control}
            options={BASIS_OPTIONS}
            required
          />
        </div>

        <div className="min-h-[120px]">
          {basis === "session" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Dropdown
                name="sessionId"
                label={Text.Select_Session}
                control={control}
                options={SESSION_OPTIONS}
                required
              />
            </div>
          )}

          {basis === "year" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <Dropdown
                name="yearId"
                label={Text.Select_Year}
                control={control}
                options={YEAR_OPTIONS}
                required
              />
            </div>
          )}

          {basis === "dateRange" && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <PastDateField name="fromDate" label={Text.From_Date} control={control} required />
              <DateField name="toDate" label={Text.To_Date} control={control} required />
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-end border-t pt-5 sm:flex-row">
          <div className="w-full sm:w-auto">
            <Button
              name={Text.Download_Report}
              loading={downloadMutation.isPending}
              type="submit"
              icon={<IconField name="FaDownload" size={18} color="white" />}
              isDisable={isDisabled()}
            />
          </div>
        </div>
      </form>
    </div>
  );
}

export default BalanceSheet;