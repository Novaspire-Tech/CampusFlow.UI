export interface DisableReason {
  schoolCode: any;
  id: string;
  reason: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface DisableReasonFormData {
  reason: string;
  status: 'Active' | 'Inactive';
}

export interface DisableReasonStats {
  title: string;
  value: string;
  change: string;
  icon: string;

}