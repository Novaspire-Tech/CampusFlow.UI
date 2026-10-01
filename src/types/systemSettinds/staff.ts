export interface Staff {
  id: number;
  staffId: string;
  staffCode: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  designation: string;
  department: string;
  status: "active" | "inactive";
  dateOfJoining?: string;
  photo?: string;
}
 
export interface StaffListResponse {
  staffList: Staff[];
  currentPage: number;
  totalElements: number;
  totalPages: number;
}