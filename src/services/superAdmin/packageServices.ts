import AxiosFunc from "../../utils/axios";
import type {
  Package,
  CreatePackageRequestDTO,
  FilterPackageRequestDTO,
  PackagesPaginatedResponse,
  SubscriptionSummary,
  PackageSummary,
  PackageDropdownOptions,
} from "../../types/superAdmin/Package";

const PACKAGE_ENDPOINTS = {
  CREATE:               "/packages/create",
  GET:   (id: number) => `/packages/${id}/get`,
  UPDATE:(id: number) => `/packages/${id}/update`,
  DELETE:(id: number) => `/packages/${id}/delete`,
  GET_ALL:              "/packages/getAll",
  FILTER:               "/packages/filter-packages",
  SUBSCRIPTION_SUMMARY: "/packages/subscriptions-summary",
  PACKAGE_SUMMARY:      "/packages/package-summery",
  ENUM_VALUES:          "/packages/enum-values",
};

const isErrorStatus = (status: any): boolean => {
  if (status === undefined || status === null) return false;
  const code = Number(status);
  return code < 200 || code >= 300;
};

const transformResponseToPackage = (item: any): Package => {
  const packageId = Number(item.packageId);
  return {
    id:               packageId,
    packageId:        packageId,
    category:         item.category      ?? "",
    name:             item.name          ?? "",
    description:      item.description   ?? "",
    // Backend sends "amount" in list APIs, "basePrice" in detail API — handle both
    basePrice:        Number(item.basePrice ?? item.amount ?? 0),
    billingPeriod:    item.billingPeriod  ?? "",
    packageDays:      Number(item.packageDays  ?? 0),
    trialDays:        Number(item.trialDays    ?? 0),
    setupFee:         item.setupFee      ?? null,
    displayOrder:     item.displayOrder  ?? 0,
    recommended:      item.recommended   ?? false,
    totalSubscribers: Number(item.totalSubscribers ?? 0),
    isActive:         item.isActive      ?? true,
    features: Array.isArray(item.features)
      ? item.features.map((f: any) => ({
          packageFeatureId:   f.packageFeatureId   ?? undefined,
          packageFeatureCode: f.packageFeatureCode ?? "",
          featureName:        f.featureName        ?? "",
          description:        f.description        ?? "",
          scope:              f.scope              ?? "",
          operations:         Array.isArray(f.operations) ? f.operations : [],
          limitType:          f.limitType          ?? "NONE",
          limitValue:         Number(f.limitValue  ?? 0),
          unit:               f.unit               ?? "",
          isEnabled:          f.isEnabled          ?? true,
          displayOrder:       f.displayOrder       ?? 0,
        }))
      : [],
    scopes:     Array.isArray(item.scopes)     ? item.scopes     : [],
    operations: Array.isArray(item.operations) ? item.operations : [],
    createdAt:  item.createdDate ?? item.createdAt ?? undefined,
    updatedAt:  item.updatedAt   ?? undefined,
  };
};

const transformDropdownOptions = (data: any): PackageDropdownOptions => ({
  billingPeriods: Array.isArray(data?.billingPeriods) ? data.billingPeriods : [],
  operations: Array.isArray(data?.operations) ? data.operations : [],
  limitTypes: Array.isArray(data?.limitTypes) ? data.limitTypes : [],
  scopes: Array.isArray(data?.scopes) ? data.scopes : [],
});

const extractPaginated = (raw: any, items: Package[]): PackagesPaginatedResponse => ({
  packages:    items,
  currentPage: raw?.currentPage ?? raw?.number        ?? 0,
  size:        raw?.size        ?? items.length,
  totalItems:  raw?.totalItems  ?? raw?.totalElements ?? 0,
  totalPages:  raw?.totalPages  ?? 0,
});

const extractPackageList = (raw: any): any[] =>
  raw?.employees ?? raw?.packages ?? raw?.content ?? [];

export const packageService = {

  // Step 1: fetch page=0,size=1 to get totalItems
  // Step 2: caller uses totalItems to fetch all records
  getAll: async (
    page = 0,
    size = 10,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PackagesPaginatedResponse> => {
    try {
      const params: Record<string, any> = { page, size };
      if (sortBy)        params.sortBy        = sortBy;
      if (sortDirection) params.sortDirection = sortDirection;

      const response = await AxiosFunc.Get(PACKAGE_ENDPOINTS.GET_ALL, params);
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to fetch packages");
      }
      const raw      = response.data?.data ?? response.data;
      // Use "employees" key from backend response
      const packages = extractPackageList(raw).map(transformResponseToPackage);
      return extractPaginated(raw, packages);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch packages");
    }
  },

  filterPackages: async (
    filter: FilterPackageRequestDTO,
    page = 0,
    size = 10,
    sortBy?: string,
    sortDirection?: string,
  ): Promise<PackagesPaginatedResponse> => {
    try {
      const qp = new URLSearchParams();
      qp.set("page", String(page));
      qp.set("size", String(size));
      if (sortBy)        qp.set("sortBy",        sortBy);
      if (sortDirection) qp.set("sortDirection", sortDirection);

      const body: FilterPackageRequestDTO = {};
      if (filter.billingPeriod?.trim())                          body.billingPeriod = filter.billingPeriod.trim();
      if (filter.category?.trim())                               body.category      = filter.category.trim();
      if (filter.isActive === true || filter.isActive === false) body.isActive      = filter.isActive;
      if (filter.startDate?.trim()) body.startDate = filter.startDate.trim();
      if (filter.endDate?.trim())   body.endDate   = filter.endDate.trim();
      if (filter.search?.trim())                                 body.search        = filter.search.trim();

      const response = await AxiosFunc.Post(
        `${PACKAGE_ENDPOINTS.FILTER}?${qp.toString()}`,
        body
      );
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to filter packages");
      }
      const raw      = response.data?.data ?? response.data;
      // Use "employees" key from backend response
      const packages = extractPackageList(raw).map(transformResponseToPackage);
      return extractPaginated(raw, packages);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to filter packages");
    }
  },

  getById: async (packageId: number): Promise<Package> => {
    try {
      const response = await AxiosFunc.Get(
        `${PACKAGE_ENDPOINTS.GET(packageId)}?packageId=${packageId}`
      );
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to fetch package");
      }
      return transformResponseToPackage(response.data?.data ?? response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch package");
    }
  },

  create: async (data: CreatePackageRequestDTO): Promise<Package> => {
    try {
      const response = await AxiosFunc.Post(PACKAGE_ENDPOINTS.CREATE, data);
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to create package");
      }
      return transformResponseToPackage(response.data?.data ?? response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to create package");
    }
  },

  update: async (packageId: number, data: CreatePackageRequestDTO): Promise<void> => {
    try {
      const response = await AxiosFunc.Put(
        `${PACKAGE_ENDPOINTS.UPDATE(packageId)}?packageId=${packageId}`,
        data
      );
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to update package");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to update package");
    }
  },

  delete: async (packageId: number): Promise<void> => {
    try {
      const response = await AxiosFunc.Delete(
        `${PACKAGE_ENDPOINTS.DELETE(packageId)}?packageId=${packageId}`
      );
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to delete package");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to delete package");
    }
  },

  getSubscriptionSummary: async (): Promise<SubscriptionSummary> => {
    try {
      const response = await AxiosFunc.Get(PACKAGE_ENDPOINTS.SUBSCRIPTION_SUMMARY);
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to fetch subscription summary");
      }
      return (response.data?.data ?? response.data) as SubscriptionSummary;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch subscription summary");
    }
  },

  getPackageSummary: async (): Promise<PackageSummary> => {
    try {
      const response = await AxiosFunc.Get(PACKAGE_ENDPOINTS.PACKAGE_SUMMARY);
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to fetch package summary");
      }
      return (response.data?.data ?? response.data) as PackageSummary;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch package summary");
    }
  },

  getDropdownOptions: async (): Promise<PackageDropdownOptions> => {
    try {
      const response = await AxiosFunc.Get(PACKAGE_ENDPOINTS.ENUM_VALUES);
      if (isErrorStatus(response.data?.status)) {
        throw new Error(response.data?.message || "Failed to fetch dropdown options");
      }
      return transformDropdownOptions(response.data?.data ?? response.data);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || "Failed to fetch dropdown options");
    }
  },
};