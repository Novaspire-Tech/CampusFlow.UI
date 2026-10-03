export interface PackageFeature {
  packageFeatureId?: number;
  packageFeatureCode?: string;
  featureName: string;
  description?: string;
  scope: string;
  operations: string[];
  limitType: string;
  limitValue: number;
  unit?: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface CreatePackageFeatureDTO {
  featureName: string;
  description: string;
  scope: string;
  operations: string[];
  limitType: string;
  limitValue: number;
  unit: string;
  isEnabled: boolean;
  displayOrder: number;
}

export interface Package {
  id:               number;
  packageId:        number;
  category:         string;
  name:             string;
  description:      string;
  basePrice:        number;
  billingPeriod:    string;
  packageDays:      number;
  trialDays:        number;
  setupFee:         number | null;
  displayOrder:     number;
  recommended:      boolean;
  totalSubscribers: number;
  isActive:         boolean;
  features:         PackageFeature[];
  scopes:           string[];
  operations:       string[];
  createdAt?:       string;
  updatedAt?:       string;
}

export interface CreatePackageRequestDTO {
  name: string;
  description: string;
  basePrice: number;
  billingPeriod: string;
  packageDays: number;
  trialDays: number;
  setupFee: number;
  displayOrder: number;
  recommended: boolean;
  features: CreatePackageFeatureDTO[];
}
export interface FilterPackageRequestDTO {
  billingPeriod?: string | null;
  category?:      string | null;
  isActive?:      boolean | null;
  startDate?:     string | null;
  endDate?:       string | null;
  search?:        string | null;
}

export interface PackagesPaginatedResponse {
  packages:    Package[];
  currentPage: number;
  size:        number;
  totalItems:  number;
  totalPages:  number;
}

export interface SubscriptionSummary {
  totalSubscriptions:   number;
  activeSubscriptions:  number;
  expiredSubscriptions: number;
  revenue?:             number;
}

export interface PackageSummary {
  totalPackages:  number;
  activePackages: number;
}

export interface PackageDropdownOptions {
  billingPeriods: string[];
  operations: string[];
  limitTypes: string[];
  scopes: string[];
}