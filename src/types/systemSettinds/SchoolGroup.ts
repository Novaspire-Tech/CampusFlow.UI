export interface GroupUserType {
  GroupUserId: number;
  phoneNumber: string;
  email: string;
  password ?: string;
  confirmPassword ?: string;
  roleId: number;
    roleName: string; // FIX: backend also returns roleName
}

export interface SchoolGroupFormData {
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
  roleId: number;
}
