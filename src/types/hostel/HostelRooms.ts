export interface HostelRef {
  id: string;
  name: string;
}

export interface RoomTypeRef {
  id: string;
  name: string;
}

export interface HostelRoom {
  roomNumber: string;
  id: string;
  hostelRoomId: string;
  roomNo: string;
  noOfBeds: string;
  availableBeds: string;
  costPerBed: string;
  description: string;
  hostelId: string;
  hostel: HostelRef;
  hostelName: string;
  roomTypeId: string;
  roomType: RoomTypeRef;
  roomTypeName: string;
}

export interface HostelRoomFormData {
  roomNumber: any;
  availableBeds: any;
  roomNo: string;
  noOfBeds: string;
  costPerBed: string;
  description: string;
  hostelId: string;
  roomTypeId: string;
}

export interface HostelRoomSearchParams {
  search?: string;
  hostelId?: string;
  roomTypeId?: string;
}

export interface BedAvailabilityResponse {
  available: boolean;
  message: string;
  occupiedBeds: number;
  totalBeds: number;
  availableBeds: number;
  roomNumber: string;
}

export interface HostelRoomResponse {
  hostelRoom: HostelRoom[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}