import { AlertCircle, Ban, CheckCircle } from 'lucide-react';
import React, { useState } from 'react';
import { useForm, type FieldValues } from 'react-hook-form';
import { IconField } from '../../../components';
import Button from '../../../components/controlled/Button';
import Dropdown from '../../../components/controlled/Dropdown';
import TextField from '../../../components/controlled/TextField';
import ControlledTable from '../../../components/uncontrolled/ControlledTable';
import { usePackages } from '../../../hooks/queries/superAdmin/usePackage';
import {
  useFilterSubscriptions,
  useSubscriptionFilterOptions,
  useSuspendSubscription,
} from '../../../hooks/queries/superAdmin/useSubscription';
import type {
  FilterSubscriptionsBody,
  Subscription,
} from '../../../types/superAdmin/Subscription';

const formatDate = (raw: string | null): string => {
  if (!raw) return '—';

  const [datePart] = raw.split(' ');
  const [dd, mm, yyyy] = datePart.split('-');

  const d = new Date(`${yyyy}-${mm}-${dd}`);

  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

interface PackageApiItem {
  packageId: number;
  category: string;
  name: string;
  billingPeriod: string;
  totalSubscribers: number;
  amount: number;
  createdDate: string;
  isActive: boolean;
}

const SubscriptionTable: React.FC = () => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [activeFilters, setActiveFilters] =
    useState<FilterSubscriptionsBody>({});

  const [, setHasFiltered] = useState(false);

  const [confirmId, setConfirmId] =
    useState<number | null>(null);

  const [confirmName, setConfirmName] = useState('');

  const {
    control: filterControl,
    handleSubmit: handleFilterSubmit,
    reset: resetFilter,
  } = useForm<FieldValues>({
    defaultValues: {
      packageCategories: '',
      billingPeriod: '',
      subscriptionStatus: '',
      startDate: '',
      endDate: '',
      search: '',
    },
  });

  const {
    data: paginatedData,
    isLoading,
    isFetching,
    isError,
  } = useFilterSubscriptions(
    activeFilters,
    { page, size: pageSize },
    true,
  );

  const {
    data: filterOptions,
    isLoading: isFilterLoading,
  } = useSubscriptionFilterOptions();

  const {
    mutate: suspendSub,
    isPending: isSuspending,
  } = useSuspendSubscription();

  const { data: packagesData } = usePackages();

  const allPackages: PackageApiItem[] =
    (packagesData?.packages ?? []) as unknown as PackageApiItem[];

  const subscriptions =
    paginatedData?.subscriptions ?? [];

  const totalItems =
    paginatedData?.totalItems ?? 0;

  const totalPages =
    paginatedData?.totalPages ?? 0;

  const statusOptions =
    filterOptions?.status ?? [];

  const normalizedData = subscriptions.map((s) => ({
    ...s,
    id: s.subscriptionId,
  }));

  const packageOptions = allPackages
    .filter(
      (p) =>
        !!p.name &&
        p.name.trim() !== '' &&
        !!p.category &&
        p.category.trim() !== '',
    )
    .map((p) => ({
      value: p.category,
      label: p.name,
    }));

  const uniquePackageOptions = Array.from(
    new Map(
      packageOptions.map((option) => [
        option.value,
        option,
      ]),
    ).values(),
  );


  const packageCategoryToName: Record<
    string,
    string
  > = {};

  allPackages.forEach((p) => {
    if (p.category && p.name) {
      packageCategoryToName[p.category] = p.name;
    }
  });

  const handleApplyFilters = (data: FieldValues) => {
    const body: FilterSubscriptionsBody = {};

    if (data.packageCategories) {
      body.packageCategories =
        String(data.packageCategories).trim();
    }

    if (data.billingPeriod) {
      body.billingPeriod = data.billingPeriod;
    }

    if (data.subscriptionStatus) {
      body.subscriptionStatus =
        data.subscriptionStatus;
    }

    if (data.startDate) {
      body.startDate = data.startDate;
    }

    if (data.endDate) {
      body.endDate = data.endDate;
    }

    if (data.search?.trim()) {
      body.search = data.search.trim();
    }

    setActiveFilters(body);
    setHasFiltered(true);
    setPage(0);
  };

  const handleClearFilters = () => {
    resetFilter({
      packageCategories: '',
      billingPeriod: '',
      subscriptionStatus: '',
      startDate: '',
      endDate: '',
      search: '',
    });

    setActiveFilters({});
    setHasFiltered(false);
    setPage(0);
  };

  const handleSuspendClick = (
    row: Subscription,
  ) => {
    setConfirmId(row.subscriptionId);
    setConfirmName(row.schoolGroupName);
  };

  const handleConfirmSuspend = () => {
    if (confirmId == null) return;

    suspendSub(confirmId, {
      onSuccess: () => setConfirmId(null),
      onError: () => setConfirmId(null),
    });
  };

  const columns = [
    {
      key: 'schoolGroupName',
      label: 'Subscriber',
      render: (v: string) => v || '—',
    },
    {
      key: 'packageCategory',
      label: 'Packages',
      render: (v: string) =>
        v
          ? packageCategoryToName[v] ?? v
          : '—',
    },
    {
      key: 'billingPeriod',
      label: 'Billing Cycle',
      render: (v: string) => v || '—',
    },
    {
      key: 'paymentMethod',
      label: 'Payment Method',
      render: (v: string | null) =>
        v || 'N/A',
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (v: number | null) =>
        v != null
          ? `₹${v.toLocaleString('en-IN')}`
          : '—',
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (v: string) =>
        formatDate(v),
    },
    {
      key: 'endDate',
      label: 'Expiring On',
      render: (v: string) =>
        formatDate(v),
    },
    {
      key: 'subscriptionStatus',
      label: 'Status',
      render: (v: string) => {
        const isActive =
          v === 'ACTIVE' ||
          v === 'TRIALING';

        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
              isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-600'
            }`}
          >
            {isActive ? (
              <CheckCircle size={12} />
            ) : (
              <AlertCircle size={12} />
            )}

            {v}
          </span>
        );
      },
    },
    {
      key: 'actions',
      render: (
        _: any,
        row: Subscription,
      ) => {
        const isSuspended =
          row.subscriptionStatus ===
          'SUSPENDED';

        const isThisOne =
          isSuspending &&
          confirmId === row.subscriptionId;

        return (
          <button
            onClick={() =>
              handleSuspendClick(row)
            }
            disabled={
              isSuspended || isThisOne
            }
            title={
              isSuspended
                ? 'Already suspended'
                : 'Suspend subscription'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isSuspended
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isThisOne
                ? 'bg-red-50 text-red-400 cursor-wait'
                : 'bg-red-50 text-red-600 hover:bg-red-100 active:bg-red-200 cursor-pointer'
            }`}
          >
            <Ban size={13} />

            {isSuspended
              ? 'Suspended'
              : isThisOne
              ? 'Suspending…'
              : 'Suspend'}
          </button>
        );
      },
      label: 'Actions',
    },
  ];


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">
          Loading subscriptions…
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg text-red-600">
          Error loading subscriptions.
          Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-4">
      <div className="w-full bg-white shadow-md rounded p-4">

        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Subscription
          </h1>
        </div>
        <form
          onSubmit={handleFilterSubmit(
            handleApplyFilters,
          )}
        >
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">

            <Dropdown
              name="packageCategories"
              label="Packages"
              control={filterControl}
              options={uniquePackageOptions}
              disabled={isFilterLoading}
              required={false}
            />

            <Dropdown
              name="billingPeriod"
              label="Billing Period"
              control={filterControl}
              options={[
                {
                  value: 'MONTHLY',
                  label: 'Monthly',
                },
                {
                  value: 'QUARTERLY',
                  label: 'Quarterly',
                },
                {
                  value: 'YEARLY',
                  label: 'Yearly',
                },
              ]}
              required={false}
            />

            <Dropdown
              name="subscriptionStatus"
              label="Status"
              control={filterControl}
              options={statusOptions.map(
                (s: string) => ({
                  value: s,
                  label: s,
                }),
              )}
              disabled={isFilterLoading}
              required={false}
            />
            <TextField
              label="Search"
              name="search"
              placeholder="Name, phone, email…"
              control={filterControl}
            />

          </section>
          <div className="flex justify-end gap-2 mb-4">

            <Button
              onClick={handleClearFilters}
              name="Clear"
              loading={false}
              showAlways={true}
              icon={
                <IconField name="FaTimes" />
              }
            />

            <Button
              name="Search"
              loading={isFetching}
              showAlways={true}
              icon={
                <IconField name="FaSearch" />
              }
            />

          </div>
        </form>

        <hr className="border-gray-300 mb-4" />

        {/* table */}
        <div className="relative">

          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
                Updating…
              </span>
            </div>
          )}

          <ControlledTable
            title="Subscription List"
            columns={columns}
            data={normalizedData}
            fullData={normalizedData}
            showSearch={false}
            serverPage={page}
            serverTotalPages={totalPages}
            serverTotalItems={totalItems}
            serverPageSize={pageSize}
            onServerPageChange={(p) =>
              setPage(p)
            }
            onServerPageSizeChange={(s) => {
              setPageSize(s);
              setPage(0);
            }}
          />

        </div>

      </div>

      {confirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6 space-y-5">

            <div className="flex flex-col items-center text-center gap-3">

              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <Ban
                  size={28}
                  className="text-red-600"
                />
              </div>

              <div>

                <h3 className="text-lg font-bold text-gray-800">
                  Suspend Subscription
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to suspend{' '}
                  <span className="font-semibold text-gray-700">
                    {confirmName}
                  </span>
                  ?

                  This action will deactivate their subscription immediately.
                </p>

              </div>

            </div>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setConfirmId(null)
                }
                disabled={isSuspending}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmSuspend}
                disabled={isSuspending}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 active:bg-red-800 transition-colors disabled:opacity-60"
              >
                {isSuspending
                  ? 'Suspending…'
                  : 'Yes, Suspend'}
              </button>

            </div>

          </div>

        </div>
      )}
    </div>
  );
};

export default SubscriptionTable;