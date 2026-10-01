 export interface ParentResponse {
  parentId: number;
  guardianName: string;
  guardianPhone: string | null;
  guardianRelation: string | null;
  isActive: boolean | null;
}
 
export interface ParentDashboardData {
  dueFees: number;
  totalResults: number;
  totalExpenses: number;
  students?: StudentInfo[];
}
 
export interface StudentInfo {
  studentId: number;
  name: string;
  class: string;
  section: string;
  rollNumber?: string;
}
 
export interface PaginatedParentsResponse {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  parents: ParentResponse[];
}
 
 