export interface ComplaintType {
  id: string;
  complaintTypeId?: string;
  complaintType: string;
  description: string;
  createdDate?: string;
  status?: 'Active' | 'Inactive';
}

export interface ComplaintTypeFormData {
  complaintType: string;
  description: string;

}