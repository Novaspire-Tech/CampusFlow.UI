export interface SchoolGroup {
  schoolGroupId: number;
  schoolGroupName: string;
  schoolGroupCode: string;
  phoneNumber: string;
  email: string;
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
  webSite: string;
  managedBy: string;
}

export interface CreateSchoolGroupJsonPayload {
  packageId: number;
  schoolGroupName: string;
  phoneNumber: string;
  email: string;
  databaseName: string;
  defaultConnectionString: boolean;
  dbAddress: string;
  username: string;
  password: string;
  databaseType: string;
}

export interface CreateSchoolGroupRequest {
  packageId: number;
  schoolGroupName: string;
  phoneNumber: string;
  email: string;
  databaseName: string;
  defaultConnectionString: boolean;
  groupLogo: File;
  dbAddress: string;
  username: string;
  password: string;
  databaseType: string;
}

export interface UpdateSchoolGroupRequestDto {
  schoolGroupName: string;
  phoneNumber?: string;
  email?: string;
}

export interface SchoolGroupsPaginatedResponse {
  schoolGroups: SchoolGroup[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface FilterSchoolGroupRequestDTO {
  search?: string;
  isActive?: boolean | null;
  startDate?: string | null;
  endDate?: string | null;
  packageCategories?: string | null;
}

export interface SchoolGroupAnalytics {
  totalSchoolGroups: number;
  activeSchoolGroups: number;
  inActiveSchoolGroups: number;
}

export interface SummaryCardResponse {
  title: string;
  value: number;
  percentage: number;
}

export interface SuperAdminDashboard {
  newSchoolGroupJoinToday: number;
  dashboardCardDTOList: SummaryCardResponse[];
}

export interface SchoolGroupsByYear {
  monthCountMap: Record<string, number>;
  increment: number;
  totalThisYear: number;
}

export type SchoolGroupSummary = SummaryCardResponse[];

export interface AssignSubscriptionRequestDto {
  transactionId: string;
  invoiceNumber: string;
  amountPaid: number;
  paidThrough: string;
  paidAt: string;
}

export interface SubscribePackagePayload {
  schoolGroupCode: string;
  packageId: number;
  isPaid?: boolean;
  dto: AssignSubscriptionRequestDto;
}

export interface SchoolGroupFilterState {
  search: string;
  isActive: string;
  startDate: string;
  endDate: string;
}

export interface SchoolGroupForm {
  packageId: string;
  schoolGroupName: string;
  phoneNumber: string;
  webSite: string;
  managedBy: string;
  email: string;
  logo: File | null;
  databaseName: string;
  defaultConnectionString: "yes" | "no";
  dbAddress: string;
  username: string;
  password: string;
  databaseType: string;
}

export interface SchoolGroupLogoProps {
  logoPath: string | null | undefined;
  schoolGroupName: string;
}

export interface ViewSchoolGroupModalProps {
  schoolGroupCode: string;
  onClose: () => void;
}

export interface SchoolGroupFilterBarProps {
  control: any;
  onReset: () => void;
  activeCount: number;
}