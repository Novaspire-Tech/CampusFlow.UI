// src/types/humanResource/StaffLeave.ts

export type LeaveTypeKey = "SICK" | "CASUAL" | "MATERNITY" | "ANNUAL";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface StaffLeave {
  staffLeaveId: number;
  id: string;
  staffId: number;
  staffCode: string;
  staffName: string;
  staffAssignedLeaveId: number;
  leaveType: LeaveTypeKey;
  leaveFromDate: string; 
  leaveToDate: string;
  leaveDays: number;
  reason?: string;
  status: LeaveStatus;
  sickLeaveCount: number;
  casualLeaveCount: number;
  maternityLeaveCount: number;
  annualLeaveCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffLeaveFormInputs {
  staffId: number;
  staffAssignedLeaveId: number;
  leaveType: LeaveTypeKey;
  leaveFromDate: string; 
  leaveToDate: string; 
  leaveDays: number;
  reason?: string;
  status?: LeaveStatus;
}

export interface StaffLeaveResponse {
  status: number;
  message: string;
  data: {
    leaves?: StaffLeave[];
    staffLeaves?: StaffLeave[];
    currentPage?: number;
    totalItems?: number;
    totalPages?: number;
  };
}

export interface LeaveBalanceResponse {
  staffId: number;
  leaveType: string;
  remainingBalance: number;
}

export interface StaffAssignedLeave {
  staffAssignedLeaveId: number;
  sickLeaveAssigned: number;
  sickLeaveCount: number;
  casualLeaveAssigned: number;
  casualLeaveCount: number;
  maternityLeaveAssigned: number;
  maternityLeaveCount: number;
  annualLeaveAssigned: number;
  annualLeaveCount: number;
  
}

export interface StaffWithLeaveAssignment {
  staffId: number;
  staffCode: string;
  firstName: string;
  lastName: string;
  staffAssignedLeave?: StaffAssignedLeave;
  staffAssignedLeaveId?: number;
}