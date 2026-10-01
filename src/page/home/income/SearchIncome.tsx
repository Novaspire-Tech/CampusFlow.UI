import React, { useState } from "react";
import { useForm, type FieldValues } from "react-hook-form";
import Dropdown from "../../../components/controlled/Dropdown";
import TextFields from "../../../components/controlled/TextField";
import ControlledTable from "../../../components/uncontrolled/ControlledTable";
import { Button } from "../../../components/controlled";
import { IconField } from "../../../components";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../helpers/useTranslations";
import {
  useSearchAddIncomes,
  useFilterAddIncomes,
} from "../../../hooks/queries/income/useAddIncome";
import { useIncomeHeads } from "../../../hooks/queries/income/useIncomeHeads";
import { useIncomeGroups } from "../../../hooks/queries/income/useIncomeGroups";
import type { SearchIncomesParams, AddIncomeSearchParams } from "../../../services/income/addIncomeService ";

const PERIOD_OPTIONS = [
  { value: "today",      label: "Today" },
  { value: "this_week",  label: "This Week" },
  { value: "last_week",  label: "Last Week" },
  { value: "this_month", label: "This Month" },
  { value: "last_month", label: "Last Month" },
];

const PERIOD_MAP: Record<string, string> = {
  today:      "Today",
  this_week:  "This Week",
  last_week:  "Last Week",
  this_month: "This Month",
  last_month: "Last Month",
};

type ActiveMode = "none" | "search" | "filter";

function SearchIncome() {
  const { t } = useTranslation();
  const texts = getPagesDataText(t);

  const { control, getValues, reset, watch } = useForm<FieldValues>({
    defaultValues: {
      searchType:    "",
      searchText:    "",
      incomeHeadId:  "",
      incomeGroupId: "",
    },
  });

  const watchedHeadId = watch("incomeHeadId");
  const { data: incomeHeadsData } = useIncomeHeads();
  const { data: incomeGroupsData } = useIncomeGroups(Number(watchedHeadId) || 0);

  const incomeHeadOptions =
    incomeHeadsData?.map((h: any) => ({
      value: h.id || h.incomeHeadId,
      label: h.name || h.incomeHead,
    })) || [];

  const incomeGroupOptions =
    incomeGroupsData?.map((g: any) => ({
      value: g.incomeGroupId || g.id,
      label: g.groupName || g.name,
    })) || [];

  const [currentPage, setCurrentPage]   = useState(0);
  const [pageSize,    setPageSize]       = useState(10);

  const [activeMode,    setActiveMode]    = useState<ActiveMode>("none");
  const [searchParams,  setSearchParams]  = useState<SearchIncomesParams>({});
  const [filterParams,  setFilterParams]  = useState<AddIncomeSearchParams>({});
  const [tableSearch,   setTableSearch]   = useState<string>("");

  const {
    data:       allResult,
    isLoading:  isLoadingAll,
    isFetching: isFetchingAll,
  } = useFilterAddIncomes(
    {},
    currentPage,
    pageSize,
    "date",
    "asc",
  );

  const {
    data:       searchResult,
    isLoading:  isLoadingSearch,
    isFetching: isFetchingSearch,
  } = useSearchAddIncomes(
    searchParams,
    currentPage,
    pageSize,
    "date",
    "asc",
    activeMode === "search",
  );

  const {
    data:       filterResult,
    isLoading:  isLoadingFilter,
    isFetching: isFetchingFilter,
  } = useFilterAddIncomes(
    filterParams,
    currentPage,
    pageSize,
    "date",
    "asc",
  );
  const activeData =
    activeMode === "search"
      ? searchResult
      : activeMode === "filter"
      ? filterResult
      : allResult;

  const incomes    = activeData?.addIncomes  ?? [];
  const totalItems = activeData?.totalItems  ?? 0;
  const totalPages = activeData?.totalPages  ?? 0;

  const isBusy =
    (activeMode === "search" && (isLoadingSearch || isFetchingSearch)) ||
    (activeMode === "filter" && (isLoadingFilter || isFetchingFilter)) ||
    (activeMode === "none"   && (isLoadingAll    || isFetchingAll));

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(0);
  };
  const handleSearch = () => {
    const period   = getValues("searchType");
    const text     = getValues("searchText")?.trim();
    const headId   = getValues("incomeHeadId");
    const groupId  = getValues("incomeGroupId");

    const hasSearch = !!period || !!text;
    const hasFilter = !!headId || !!groupId;

    if (!hasSearch && !hasFilter) {
      setActiveMode("none");
      setCurrentPage(0);
      return;
    }
    if (hasFilter) {
      const params: AddIncomeSearchParams = {};
      if (headId)  params.incomeHeadId  = headId;
      if (groupId) params.incomeGroupId = groupId;
      if (text)    params.search        = text;
      setFilterParams(params);
      setActiveMode("filter");
      setTableSearch("");
      setCurrentPage(0);
      return;
    }

    const params: SearchIncomesParams = {};
    if (period) params.period = PERIOD_MAP[period] || period;
    if (text)   params.search = text;
    setSearchParams(params);
    setActiveMode("search");
    setTableSearch("");
    setCurrentPage(0);
  };

  const handleClear = () => {
    reset({ searchType: "", searchText: "", incomeHeadId: "", incomeGroupId: "" });
    setSearchParams({});
    setFilterParams({});
    setActiveMode("none");
    setTableSearch("");
    setCurrentPage(0);
    setPageSize(10);
  };

  const tableData = incomes.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(tableSearch.toLowerCase()),
    ),
  );

  const grandTotal = tableData.reduce((sum, item) => sum + (item.amount || 0), 0);

  const columns = [
    { label: texts.Name           || "Name",           key: "name" },
    { label: texts.Invoice_Number || "Invoice Number", key: "invoiceNumber" },
    { label: texts.Income_Head    || "Income Head",    key: "incomeHeadName" },
    { label: (texts as any).Income_Group || "Income Group", key: "groupName" },
    { label: texts.Date           || "Date",           key: "date" },
    {
      label: texts.Amount || "Amount",
      key: "amount",
      render: (value: number) => `₹${value.toLocaleString()}`,
    },
  ];

  if (isLoadingAll && activeMode === "none") {
    return (
      <div className="w-full min-h-screen bg-gray-100 p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading incomes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="text-black text-xl sm:text-2xl font-semibold mb-4">
        {texts.Select_Criteria || "Select Criteria"}
      </div>
      <hr className="mb-6 border-gray-400" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <Dropdown
          label={texts.Search_Type || "Search Type"}
          name="searchType"
          control={control}
          required={false}
          options={PERIOD_OPTIONS}
        />
        <TextFields
          required={false}
          label={texts.Search_By_Name || "Search By Name"}
          name="searchText"
          control={control}
          placeholder={texts.Name_Plaseholder || "Enter name"}
        />
        <Dropdown
          label={texts.Income_Head || "Income Head"}
          name="incomeHeadId"
          control={control}
          required={false}
          options={incomeHeadOptions}
        />
        <Dropdown
          label={(texts as any).Income_Group || "Income Group"}
          name="incomeGroupId"
          control={control}
          required={false}
          options={incomeGroupOptions}
        />

      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button
          name="Clear"
          loading={false}
          onClick={handleClear}
          icon={<IconField name="FaTimes" />}
          showAlways = {true}
        />
        <Button
          name={texts.Search || "Search"}
          loading={isBusy}
          onClick={handleSearch}
          icon={<IconField name="FaSearch" />}
          showAlways = {true}
        />
      </div>

      {isBusy && (
        <div className="mt-3 flex items-center gap-2 text-sky-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sky-500" />
          <span className="text-sm">Searching...</span>
        </div>
      )}
      <div className="mt-6">
        <div className="relative">
          {isBusy && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
                Updating...
              </span>
            </div>
          )}

          <ControlledTable
            title={texts.Income_List || "Income List"}
            columns={columns}
            data={tableData}
            fullData={incomes}
            searchTerm={tableSearch}
            onSearchChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTableSearch(e.target.value)
            }
            actionColumn={false}
            showSelectAll={false}
            grandTotal={grandTotal}
            showGrandTotal={true}
            grandTotalLabel={texts.Grand_Total || "Grand Total"}
            enablePermissions={true}
            permissionScope="INCOME"
            serverPage={currentPage}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={handlePageChange}
            onServerPageSizeChange={handlePageSizeChange}
          />
        </div>

        <div className="mt-4 text-right text-lg font-semibold text-black">
          {texts.Grand_Total || "Grand Total"}: ₹{grandTotal.toLocaleString()}
        </div>
      </div>

    </div>
  );
}

export default SearchIncome;