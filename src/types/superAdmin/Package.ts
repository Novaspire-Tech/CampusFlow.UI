export interface PackageFeature {
  packageFeatureId?:  number;
  packageFeatureCode: string;
  featureName:        string;
  description:        string;
  displayOrder:       number;
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
  category:      string;
  name:          string;
  description:   string;
  basePrice:     number;
  billingPeriod: string;
  packageDays:   number;
  trialDays:     number;
  setupFee?:     number | null;
  displayOrder?: number;
  recommended?:  boolean;
  isActive?:     boolean;
  features?:     PackageFeature[];
  scopes?:       string[];
  operations?:   string[];
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
  billingPeriods:    string[];
  packageCategories: string[];
  featureCodes:      string[];
  scopes:            string[];
  operations:        string[];
}