export interface StudentHouse {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface StudentHouseFormData {
  houseName: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface StudentHouseStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}