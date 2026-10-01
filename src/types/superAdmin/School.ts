export interface School {
  schoolId: number;
  schoolName: string;
  schoolCode: string;
  email: string;
  phoneNumber: string;
  address: string;
  session: string;
  type: string;
  logo: string | null;
  tenantId: string;
  databaseName: string;
  defaultConnectionString: boolean;
  dbAddress?: string;
  username?: string;
  databaseType?: string;
  isActive: boolean;
  createdDate: string;
  planName: string;
  billingPeriod: string | null;
  packageId: number;
  managedBy: string;
  webSite: string;
}

export interface AddSchoolToGroupRequest {
  schoolName: string;
  address: string;
  email: string;
  phoneNumber: string;
  session: string;
  type: string;
  databaseName: string;
  logo?: File | null;
  managedBy: string;
  webSite: string;
}

export interface AddSchoolToGroupForm {
  schoolName: string;
  address: string;
  email: string;
  phoneNumber: string;
  session: string;
  type: string;
  databaseName: string;
  logo?: File | null;
  managedBy: string;
  webSite: string;
}

export interface SchoolCompleteRegistrationRequest {
  packageId: number;
  schoolName: string;
  address: string;
  phoneNumber: string;
  email: string;
  session: string;
  type: string;
  logo: File | null;
  databaseName: string;
  defaultConnectionString: boolean;
  dbAddress: string;
  username: string;
  password: string;
  databaseType: string;
  managedBy: string;
  webSite: string;
}

export interface UpdateSchoolRequestDto {
  schoolName: string;
  address: string;
  email: string;
  phoneNumber: string;
  session: string;
  type: string;
  databaseName: string;
  managedBy: string;
  webSite: string;
}

export interface SchoolsPaginatedResponse {
  schools: School[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface FilterSchoolRequest {
  search?: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
  packageCategories?: string;
}

export interface SchoolForm {
  packageId: string;
  schoolName: string;
  schoolCode: string;
  email: string;
  phoneNumber: string;
  address: string;
  session: string;
  type: string;
  logo: File | null;
  databaseName: string;
  defaultConnectionString: 'yes' | 'no';
  dbAddress: string;
  password: string;
  username: string;
  databaseType: string;
  managedBy: string;
  webSite: string;
}

export interface SchoolLogoProps {
  logoPath: string | null | undefined;
  schoolName: string;
}

export interface ViewModalProps {
  schoolCode: string;
  onClose: () => void;
}

export interface SchoolFilterState {
  startDate: string;
  endDate: string;
  packageCategories: string;
  isActive: string;
  search: string;
}

export interface FilterBarProps {
  control: any;
  packageOptions: { label: string; value: string }[];
  onReset: () => void;
  activeCount: number;
}