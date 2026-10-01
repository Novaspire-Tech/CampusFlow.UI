export interface Role {
  roleId: string;
  name: string;
  description: string;
  title: string;
  crudPermissions: RoleCrudPermission[];
}

export interface RoleFormData {
  name: string;
  description: string;
  title: string;
  crudPermissions: Array<{
    scope: string;
    operations: string[];
  }>;
}

export interface RoleCrudPermission {
  scope: string;
  operations: string[];
}

export interface RoleStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}