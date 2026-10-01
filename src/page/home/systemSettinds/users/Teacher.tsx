import React, { useState, useMemo, useEffect, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import ControlledTable from "../../../../components/uncontrolled/ControlledTable";
import { useTranslation } from "react-i18next";
import { getPagesDataText } from "../../../../helpers/useTranslations";
import { useFilterUsers } from "../../../../hooks/queries/role/useUser";
import type { RoleTitle } from "../../../../types/role/user";

interface Column {
  key: string;
  label: string;
  render?: (value: any, item: any) => React.JSX.Element;
}

interface TeacherProps {
  role?: RoleTitle;
}

const Teacher: React.FC<TeacherProps> = ({ role = "TEACHER" }) => {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const translations = getPagesDataText(t);

  // Proper debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const getRoleDisplayText = () => {
    switch (role) {
      case "HOD":        return "HOD";
      case "PRINCIPAL":  return "Principal";
      case "ADMIN":      return "Admin";
      case "PARENT":     return "Parent";
      case "ACCOUNTANT": return "Accountant";
      default:           return translations?.Teacher || "Teacher";
    }
  };

  const { data, isLoading, isError, error, refetch } = useFilterUsers({
    dto: {
      roleTitle: role,
      search: debouncedSearch || undefined,
    },
    page,
    size,
  });

  const users = data?.users ?? [];

  const tableData = useMemo(() => {
    return users.map((user) => ({
      id: user.userId,
      userId: user.userId,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      roleName: user.roleName,
    }));
  }, [users]);

  const handleRowClick = (item: (typeof tableData)[number]) => {
    const params = new URLSearchParams({
      user: item.name,
      role: item.roleName || getRoleDisplayText(),
    });
    navigate(`/user-activity?${params.toString()}`);
  };

  const columns: Column[] = [
    { key: "userId", label: translations?.Staff_Id || "User ID" },
    {
      key: "name",
      label: translations?.Name || "Name",
      render: (val: string) => (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-800">{val}</span>
        </div>
      ),
    },
    { key: "email",       label: translations?.Email || "Email" },
    { key: "phoneNumber", label: translations?.Phone || "Phone" },
    { key: "roleName",    label: translations?.Role  || "Role"  },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="bg-white rounded-lg shadow p-4">

        {isError && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            <p className="font-semibold">Error loading {getRoleDisplayText()}:</p>
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

        <ControlledTable
          title={getRoleDisplayText()}
          columns={columns}
          data={tableData}
          loading={isLoading}
          emptyMessage={`No ${getRoleDisplayText()} found.`}
          searchTerm={search}
          onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          showSelectAll={false}
          actionColumn={false}
          enablePermissions={true}
          permissionScope="STAFF"
          serverPage={page}
          serverTotalPages={data?.totalPages ?? 0}
          serverTotalItems={data?.totalItems ?? 0}
          serverPageSize={size}
          onServerPageChange={(newPage) => setPage(newPage)}
          onServerPageSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
          onRowClick={handleRowClick}
          rowClassName="cursor-pointer hover:bg-blue-50 transition-colors duration-150"
        />
      </div>
    </div>
  );
};

export default Teacher;