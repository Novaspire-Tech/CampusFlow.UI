export interface LeaveType {
  id: string;
  leaveType: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface LeaveTypeFormData {
  leaveType: string;
  status: 'Active' | 'Inactive';
}

export interface LeaveTypeStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}