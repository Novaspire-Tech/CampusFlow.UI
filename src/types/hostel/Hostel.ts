// types/hostel/hostel.ts

export interface Hostel {
  hostelId: number;
  hostelName: string;
  hostelType: string;
  address: string;
  intake: string;
  description: string;
  name?: string;
}

export interface HostelFormData {
  hostelName: string;
  hostelType: string;
  address: string;
  intake: string;
  description: string;
}
