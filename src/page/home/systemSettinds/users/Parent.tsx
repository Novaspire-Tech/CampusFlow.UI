import React, { useState, useMemo, useEffect, type ChangeEvent } from "react";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";
import { useFilterUsers } from "../../../../hooks/queries/role/useUser";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.JSX.Element;
}

const Parent: React.FC = () => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const { t } = useTranslation();
  const translations = getPagesDataText(t);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isLoading, isFetching, isError, error, refetch } =
    useFilterUsers({
      dto: {
        roleTitle: "PARENT",
        search: debouncedSearch || undefined,
      },
      page,
      size,
    });

  const users = data?.users ?? [];

  const tableData = useMemo(() => {
    return users.map((user) => ({
      id: user.userId,
      name: user.name,
      phoneNumber: user.phoneNumber,
    }));
  }, [users]);

  const columns: Column[] = [
    { key: "name", label: translations?.Name || "Name" },
    { key: "phoneNumber", label: translations?.Phone || "Phone" },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-white rounded-lg shadow p-4">
        {isError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p className="font-semibold">Error loading Parents:</p>
            <p className="text-sm mt-1">
              {(error as Error)?.message || "Something went wrong."}
            </p>
            <button
              onClick={() => refetch()}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        )}

        <div className="relative">
          {isFetching && !isLoading && (
            <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center rounded">
              <span className="text-sm text-gray-500 animate-pulse">
                Updating…
              </span>
            </div>
          )}

          <ControlledTable
            title={translations?.Parent || "Parents"}
            columns={columns}
            data={tableData}
            loading={isLoading}
            emptyMessage="No Parents found."
            searchTerm={search}
            onSearchChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            showSelectAll={false}
            actionColumn={false}
            enablePermissions={true}
            permissionScope="STAFF"
            serverPage={page}
            serverTotalPages={data?.totalPages ?? 0}
            serverTotalItems={data?.totalItems ?? 0}
            serverPageSize={size}
            onServerPageChange={(newPage) => setPage(newPage)}
            onServerPageSizeChange={(newSize) => {
              setSize(newSize);
              setPage(0);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Parent;
