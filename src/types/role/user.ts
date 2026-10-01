export type RoleTitle =
  | "ADMIN"
  | "TEACHER"
  | "PARENT"
  | "TRANSPORT"
  | "HOSTEL"       
  | "LIBRARIAN"
  | "ACCOUNTANT"
  | "RECEPTIONIST"
  | string;        

export interface FilterUsersDto {
  roleTitle?: RoleTitle;
  search?: string;
}

export interface SchoolUserResponseDto {
  userId: string | number;
  name: string;
  phoneNumber: string;
  email: string;
  roleName: string;
}

export interface FilterUsersResponse {
  users: SchoolUserResponseDto[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}