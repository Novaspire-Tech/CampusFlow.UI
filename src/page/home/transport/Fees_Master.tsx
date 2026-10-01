import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button, Error } from "../../../components/controlled";
import { IconField } from '../../../components';
import { useTranslation } from "react-i18next";
import { getPagesDataText} from "../../../helpers/useTranslations";
import { useFeesMaster, useUpsertFeesMaster } from "../../../hooks/queries/transport/useFeesMaster";
import type { FineType, TransportFeesMasterDto } from '../../../types/transport/feesMaster';
import { toast } from "react-toastify";



interface FeeField {
  month: string;
  fineType: FineType;
  percentageName: string;
  dueDateName: string;
  fixedAmountName: string;
}

type FormData = {
  [key: string]: string | number | undefined;
};

const Fees_Master: React.FC = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormData>();

  const { t } = useTranslation();

  const Transport_Fees_Master_Text = getPagesDataText(t);
  const Copy_First_Fees_Details_For_All_Month = getPagesDataText(t);
  const Due_Date_Text = getPagesDataText(t);
  const Fine_Type_Text = getPagesDataText(t);
  const Percentage_Text = getPagesDataText(t);
  const Fix_Amount_Text = getPagesDataText(t);
  const Save_Text = getPagesDataText(t);
  const January_Text = getPagesDataText(t);
  const February_Text = getPagesDataText(t);
  const March_Text = getPagesDataText(t);
  const April_Text = getPagesDataText(t);
  const May_Text = getPagesDataText(t);
  const June_Text = getPagesDataText(t);
  const July_Text = getPagesDataText(t);
  const August_Text = getPagesDataText(t);
  const september_Text = getPagesDataText(t);
  const October_Text= getPagesDataText(t);
  const November_Text = getPagesDataText(t);
  const December_Text = getPagesDataText(t);
  
  const MONTHS = [
    April_Text.April, May_Text.May, June_Text.June, July_Text.July, August_Text.August,september_Text.September,
    October_Text.October, November_Text.November, December_Text.December, January_Text.January,February_Text.February, March_Text.March
  ];

  
  const { data: fetchedFees, isLoading } = useFeesMaster();
  const { mutateAsync: upsertFeesMaster, isPending } = useUpsertFeesMaster();

  const [copyAll, setCopyAll] = useState<boolean>(false);
  const [fees, setFees] = useState<FeeField[]>(
    MONTHS.map((month) => ({
      month,
      fineType: "none",
      percentageName: `percentage-${month}`,
      dueDateName: `dueDate-${month}`,
      fixedAmountName: `fixedAmount-${month}`,
    }))
  );


  useEffect(() => {
    if (fetchedFees && fetchedFees.length > 0) {
        const initialFeeFields: FeeField[] = [];

       
        MONTHS.forEach((month) => {
            const fetchedItem = fetchedFees.find(f => f.month === month);

            const field: FeeField = {
                month,
                fineType: fetchedItem?.fineType || "none",
                percentageName: `percentage-${month}`,
                dueDateName: `dueDate-${month}`,
                fixedAmountName: `fixedAmount-${month}`,
            };
            initialFeeFields.push(field);

            // Set form values
            if (fetchedItem) {
                setValue(field.dueDateName, fetchedItem.dueDate);
                if (fetchedItem.percentage) {
                    setValue(field.percentageName, fetchedItem.percentage);
                }
                if (fetchedItem.fixAmount) {
                    setValue(field.fixedAmountName, fetchedItem.fixAmount);
                }
            }
        });

        setFees(initialFeeFields);
    }
  }, [fetchedFees, setValue]);


  const updateMonth = (i: number, changes: Partial<FeeField>) =>
    setFees((prev) =>
      prev.map((m, idx) => (idx === i ? { ...m, ...changes } : m))
    );

  const handleCopyAll = (checked: boolean) => {
    setCopyAll(checked);
    if (checked) {
      clearErrors("copyError");
      const base = fees[0];
      const basePercentage = getValues(base.percentageName);
      const baseDueDate = getValues(base.dueDateName);
      const baseFixedAmount = getValues(base.fixedAmountName);
      const baseFineType = base.fineType;

      let firstRowHasErrors = false;
      
      // Validation logic for first row (simplified for brevity, matching existing logic)
      if (!baseDueDate) {
        setError(base.dueDateName, { type: "manual", message: "Due date is required for the first month to copy." });
        firstRowHasErrors = true;
      } else { clearErrors(base.dueDateName); }

      if (baseFineType === "percentage") {
        if (basePercentage === undefined || basePercentage === "" || isNaN(Number(basePercentage)) || Number(basePercentage) <= 0 || Number(basePercentage) > 100) {
          setError(base.percentageName, { type: "manual", message: "Valid percentage (0-100) is required for the first month to copy." });
          firstRowHasErrors = true;
        } else { clearErrors(base.percentageName); }
      }

      if (baseFineType === "fixed") {
        if (baseFixedAmount === undefined || baseFixedAmount === "" || isNaN(Number(baseFixedAmount)) || Number(baseFixedAmount) <= 0) {
          setError(base.fixedAmountName, { type: "manual", message: "Amount greater than 0 is required for the first month to copy." });
          firstRowHasErrors = true;
        } else { clearErrors(base.fixedAmountName); }
      }

      if (firstRowHasErrors) {
        setError("copyError", {
          type: "manual",
          message: "Please fix errors in the first row before copying to all months.",
        });
        setCopyAll(false); 
        return; 
      }

      // Copy values to subsequent months
      fees.slice(1).forEach((_, idx) => {
        const target = fees[idx + 1];
        
        // Use setValue to update RHF state
        setValue(target.percentageName, basePercentage, { shouldValidate: true });
        setValue(target.dueDateName, baseDueDate, { shouldValidate: true });
        setValue(target.fixedAmountName, baseFixedAmount, { shouldValidate: true });
        
        // Use setFees to update local state (fineType)
        updateMonth(idx + 1, { fineType: baseFineType });
        
        // Clear potential previous errors on copied fields
        clearErrors(target.percentageName);
        clearErrors(target.dueDateName);
        clearErrors(target.fixedAmountName);
      });
    } else {
      clearErrors("copyError");
    }
  };

  const onSubmit = async (data: FormData) => {
    let hasError = false;

    // --- Frontend Validation (Client-Side) ---
    for (const fee of fees) {
      const fineType = fee.fineType;
      const percentage = data[fee.percentageName];
      const fixedAmount = data[fee.fixedAmountName];
      const dueDate = data[fee.dueDateName];

      if (!dueDate) {
        setError(fee.dueDateName, { type: "manual", message: "Due date is required." });
        hasError = true;
      } else { clearErrors(fee.dueDateName); }

      if (fineType === "percentage") {
        const numPercentage = Number(percentage);
        if (percentage === undefined || percentage === "" || isNaN(numPercentage) || numPercentage <= 0 || numPercentage > 100) {
          setError(fee.percentageName, { type: "manual", message: "Percentage must be between 0 and 100." });
          hasError = true;
        } else { clearErrors(fee.percentageName); }
        clearErrors(fee.fixedAmountName);
      } else if (fineType === "fixed") {
        const numFixedAmount = Number(fixedAmount);
        if (fixedAmount === undefined || fixedAmount === "" || isNaN(numFixedAmount) || numFixedAmount <= 0) {
          setError(fee.fixedAmountName, { type: "manual", message: "Amount must be greater than 0." });
          hasError = true;
        } else { clearErrors(fee.fixedAmountName); }
        clearErrors(fee.percentageName);
      } else { 
        clearErrors(fee.percentageName);
        clearErrors(fee.fixedAmountName);
      }
    }

    if (hasError) {
      console.log("Form has validation errors.");
      return;
    }
    // --- End Frontend Validation ---

    // 2. Prepare data for backend DTO array
    const dtoData: TransportFeesMasterDto[] = fees.map((fee) => ({
      month: fee.month,
      // Ensure date is a string and amount is either a string or null
      dueDate: data[fee.dueDateName] as string, 
      percentage: fee.fineType === "percentage" ? (data[fee.percentageName] as string).toString() : null,
      fixAmount: fee.fineType === "fixed" ? (data[fee.fixedAmountName] as string).toString() : null,
    }));

    // 3. Call the upsert API
    try {
        await upsertFeesMaster(dtoData);
        toast.success("Fees Master configuration saved successfully!");
    } catch (error: any) {
        toast.error(error.message || "Failed to save fees master configuration.");
    }
  };

  // Display loading state
  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fees master data...</p>
          </div>
        </div>
      );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 w-full mx-auto ml-2 m-2 bg-white shadow-sm text-xs">
      <h1 className="text-sm font-semibold pb-3 border-b border-gray-400 mb-4">
        {Transport_Fees_Master_Text.Transport_Fees_Master}
      </h1>

      <label className="inline-flex items-center mb-2 text-xs">
        <input
          type="checkbox"
          className="form-checkbox h-4 w-4 text-blue-600"
          checked={copyAll}
          onChange={(e) => handleCopyAll(e.target.checked)}
        />
        <span className="ml-2">{Copy_First_Fees_Details_For_All_Month.Copy_First_Fees_Details_For_All_Month}</span>
      </label>
  
      {errors.copyError && typeof errors.copyError.message === 'string' && (
        <Error error={{message: errors.copyError.message}}/>
      )}
      <hr className="text-gray-400 mb-3" />
      <div className="space-y-4">
        {fees.map((f, idx) => (
          <div
            key={f.month}
            className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start border-b border-gray-400 py-4"
          >
            <div className="lg:col-span-1 font-medium text-gray-900 pt-2">
              {f.month}
            </div>

            {/* Due Date */}
            <div className="lg:col-span-2">
              <label className="block text-xs mb-1">{Due_Date_Text.Due_Date}</label>
              <input
                type="date"
                {...register(f.dueDateName)}
                className={`w-full border ${errors[f.dueDateName] ? "border-red-500" : "border-gray-400"} rounded px-2 py-1 shadow-sm text-xs`}
                disabled={copyAll && idx > 0}
              />
              {errors[f.dueDateName] && (
                <p className="text-red-500 text-xs mt-1">{(errors[f.dueDateName] as import("react-hook-form").FieldError)?.message}</p>
              )}
            </div>

            {/* Fine Type - None */}
            <div className="lg:col-span-2 flex flex-col text-xs">
              <label className="mb-1">{Fine_Type_Text.Fine_Type}</label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name={`fine-${f.month}`} // Use f.month for unique name
                  className="form-radio text-blue-600"
                  checked={f.fineType === "none"}
                  onChange={() => updateMonth(idx, { fineType: "none" })}
                  disabled={copyAll && idx > 0}
                />
                <span className="ml-2">None</span>
              </label>
            </div>

            {/* Fine Type - Percentage */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center text-xs whitespace-nowrap">
                  <input
                    type="radio"
                    name={`fine-${f.month}`} // Use f.month for unique name
                    className="form-radio text-blue-600"
                    checked={f.fineType === "percentage"}
                    onChange={() => updateMonth(idx, { fineType: "percentage" })}
                    disabled={copyAll && idx > 0}
                  />
                  <span className="ml-2">{Percentage_Text.Percentage} (%)</span>
                </label>
                <div className="flex-1">
                  <input
                    type="number"
                    step="0.01"
                    {...register(f.percentageName)}
                    className={`w-full max-w-[90px] border ${errors[f.percentageName] ? "border-red-500" : "border-gray-400"} rounded px-2 py-1 shadow-sm text-xs`}
                    disabled={(copyAll && idx > 0) || f.fineType !== "percentage"}
                  />
                  {errors[f.percentageName] && (
                    <p className="text-red-500 text-xs mt-1">
                      {('message' in (errors[f.percentageName] as import("react-hook-form").FieldError) ? (errors[f.percentageName] as import("react-hook-form").FieldError).message : null)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fine Type - Fixed */}
            <div className="lg:col-span-3 flex items-start gap-2 whitespace-nowrap">
              <label className="inline-flex items-center text-xs">
                <input
                  type="radio"
                  name={`fine-${f.month}`} // Use f.month for unique name
                  className="form-radio text-blue-600"
                  checked={f.fineType === "fixed"}
                  onChange={() => updateMonth(idx, { fineType: "fixed" })}
                  disabled={copyAll && idx > 0}
                />
                <span className="ml-2">{Fix_Amount_Text.Fix_Amount}(₹)</span>
              </label>
              <div className="flex-1">
                <input
                  type="number"
                  step="0.01"
                  {...register(f.fixedAmountName)}
                  className={`w-full max-w-[100px] border ${errors[f.fixedAmountName] ? "border-red-500" : "border-gray-400"} rounded px-2 py-1 shadow-sm text-xs`}
                  disabled={(copyAll && idx > 0) || f.fineType !== "fixed"}
                />
                {errors[f.fixedAmountName] && (
                  <p className="text-red-500 text-xs mt-1">
                    {('message' in (errors[f.fixedAmountName] as import("react-hook-form").FieldError) ? (errors[f.fixedAmountName] as import("react-hook-form").FieldError).message : null)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-right">
        <Button 
          name={Save_Text.Save} 
          loading={isPending} // Use the loading state from the mutation hook
          icon={<IconField name="FaSave" size={16} />} 
          onClick={handleSubmit(onSubmit)} 
        />
      </div>
    </form>
  );
};

export default Fees_Master;