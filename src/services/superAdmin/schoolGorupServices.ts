// import AxiosFunc from "../../utils/axios";
// import type {
//   SchoolGroup,
//   CreateSchoolGroupRequest,
//   UpdateSchoolGroupRequestDto,
//   SchoolGroupsPaginatedResponse,
//   CreateSchoolGroupJsonPayload,
//   FilterSchoolGroupRequestDTO,
//   SchoolGroupAnalytics,
//   SuperAdminDashboard,
//   SchoolGroupsByYear,
//   SchoolGroupSummary,
//   AssignSubscriptionRequestDto,
// } from "../../types/superAdmin/SchoolGroup";

// // ─── Endpoints ────────────────────────────────────────────────────────────────

// const EP = {
//   REGISTER:       "/school-group/register",
//   GET:            (code: string)               => `/school-group/${code}/get`,
//   UPDATE_NAME:    (code: string)               => `/school-group/${code}/update/name`,
//   UPDATE_LOGO:    (code: string)               => `/school-group/${code}/update/logo`,
//   FEATURE_CODES:  (code: string)               => `/school-group/${code}/get/featureCodes`,
//   GET_ALL:        "/school-group/getAll",
//   FILTER:         "/school-group/filter",
//   ANALYTICS:      "/school-group/analytics",
//   DASHBOARD:      "/school-group/dashboard",
//   BY_YEAR:        (year: number)               => `/school-group/by-year/${year}`,
//   SUMMARY:        "/school-group/summery",
//   SUBSCRIBE:      (code: string, pkgId: number) =>
//                     `/school-group/${code}/subscribe/package/${pkgId}`,
// };

// // ─── Transform helpers ────────────────────────────────────────────────────────

// const toSchoolGroup = (item: any): SchoolGroup => {
//   if (!item || typeof item !== "object") {
//     return {
//       schoolGroupId: 0, schoolGroupName: "", schoolGroupCode: "",
//       phoneNumber: "", email: "", logo: null, tenantId: "",
//       databaseName: "", defaultConnectionString: true,
//       dbAddress: "", username: "", databaseType: "",
//       isActive: false, createdDate: "", planName: "", billingPeriod: null,
//     };
//   }
//   return {
//     schoolGroupId:           Number(item.schoolGroupId           ?? 0),
//     schoolGroupName:         String(item.schoolGroupName         ?? ""),
//     schoolGroupCode:         String(item.schoolGroupCode         ?? ""),
//     phoneNumber:             String(item.phoneNumber             ?? ""),
//     email:                   String(item.email                   ?? ""),
//     logo:                    item.logo                           ?? null,
//     tenantId:                String(item.tenantId                ?? ""),
//     databaseName:            String(item.databaseName            ?? ""),
//     defaultConnectionString: Boolean(item.defaultConnectionString ?? true),
//     dbAddress:               item.dbAddress                      ?? "",
//     username:                item.username                       ?? "",
//     databaseType:            item.databaseType                   ?? "",
//     isActive:                Boolean(item.isActive               ?? false),
//     createdDate:             String(item.createdDate             ?? ""),
//     planName:                String(item.planName                ?? ""),
//     billingPeriod:           item.billingPeriod                  ?? null,
//   };
// };

// const toPaginatedResponse = (data: any): SchoolGroupsPaginatedResponse => ({
//   schoolGroups: (data?.schoolGroups ?? []).map(toSchoolGroup),
//   currentPage:  Number(data?.currentPage ?? 0),
//   totalItems:   Number(data?.totalItems  ?? 0),
//   totalPages:   Number(data?.totalPages  ?? 0),
// });

// // ─── Build FormData for register ──────────────────────────────────────────────

// const buildRegisterFormData = (data: CreateSchoolGroupRequest): FormData => {
//   const fd = new FormData();
//   const jsonPayload: CreateSchoolGroupJsonPayload = {
//     packageId:               data.packageId,
//     schoolGroupName:         data.schoolGroupName,
//     phoneNumber:             data.phoneNumber,
//     email:                   data.email,
//     databaseName:            data.databaseName.toLowerCase(),
//     defaultConnectionString: data.defaultConnectionString,
//     dbAddress:               data.dbAddress    ?? "",
//     username:                data.username     ?? "",
//     password:                data.password     ?? "",
//     databaseType:            data.databaseType ?? "",
//   };
//   fd.append("schoolGroupData", JSON.stringify(jsonPayload));
//   fd.append("groupLogo", data.groupLogo);
//   return fd;
// };

// // ─── Pagination / sort query params ──────────────────────────────────────────

// interface PageParams {
//   page?:          number;
//   size?:          number;
//   sortBy?:        string;
//   sortDirection?: "asc" | "desc";
// }

// const pageQuery = ({ page = 0, size = 10, sortBy, sortDirection }: PageParams): string => {
//   const params = new URLSearchParams();
//   params.set("page", String(page));
//   params.set("size", String(size));
//   if (sortBy)        params.set("sortBy",        sortBy);
//   if (sortDirection) params.set("sortDirection", sortDirection);
//   return params.toString();
// };

// // ─── Error extractor ──────────────────────────────────────────────────────────

// const extractError = (error: any, fallback: string): never => {
//   throw new Error(
//     error?.response?.data?.message ?? error?.message ?? fallback,
//   );
// };

// // ─── Service ──────────────────────────────────────────────────────────────────

// export const schoolGroupService = {

//   // POST /school-group/register  (multipart/form-data)
//   register: async (data: CreateSchoolGroupRequest): Promise<SchoolGroup | null> => {
//     try {
//       const res = await AxiosFunc.PostFormData(EP.REGISTER, buildRegisterFormData(data));
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Registration failed");
//       return res.data?.data ? toSchoolGroup(res.data.data) : null;
//     } catch (e: any) { return extractError(e, "Failed to register school group"); }
//   },

//   // GET /school-group/{code}/get
//   getByCode: async (code: string): Promise<SchoolGroup> => {
//     try {
//       const res = await AxiosFunc.Get(EP.GET(code));
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return toSchoolGroup(res.data?.data);
//     } catch (e: any) { return extractError(e, "Failed to fetch school group"); }
//   },

//   // PUT /school-group/{code}/update/name
//   updateName: async (code: string, dto: UpdateSchoolGroupRequestDto): Promise<SchoolGroup> => {
//     try {
//       const res = await AxiosFunc.Put(EP.UPDATE_NAME(code), dto);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Update failed");
//       return toSchoolGroup(res.data?.data);
//     } catch (e: any) { return extractError(e, "Failed to update school group name"); }
//   },

//   // PUT /school-group/{code}/update/logo  (multipart/form-data)
//   updateLogo: async (code: string, logo: File): Promise<void> => {
//     try {
//       const fd = new FormData();
//       fd.append("logo", logo);
//       const res = await AxiosFunc.PutFormData(EP.UPDATE_LOGO(code), fd);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Logo update failed");
//     } catch (e: any) { extractError(e, "Failed to update school group logo"); }
//   },

//   // GET /school-group/{code}/get/featureCodes
//   getFeatureCodes: async (code: string): Promise<string[]> => {
//     try {
//       const res = await AxiosFunc.Get(EP.FEATURE_CODES(code));
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return (res.data?.data as string[]) ?? [];
//     } catch (e: any) { return extractError(e, "Failed to fetch feature codes"); }
//   },

//   // GET /school-group/getAll?page=&size=&sortBy=&sortDirection=
//   getAll: async (params: PageParams = {}): Promise<SchoolGroupsPaginatedResponse> => {
//     try {
//       const res = await AxiosFunc.Get(`${EP.GET_ALL}?${pageQuery(params)}`);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return toPaginatedResponse(res.data?.data);
//     } catch (e: any) { return extractError(e, "Failed to fetch school groups"); }
//   },

//   // POST /school-group/filter?page=&size=&sortBy=&sortDirection=
//   filter: async (
//     dto: FilterSchoolGroupRequestDTO,
//     params: PageParams = {},
//   ): Promise<SchoolGroupsPaginatedResponse> => {
//     try {
//       const res = await AxiosFunc.Post(`${EP.FILTER}?${pageQuery(params)}`, dto);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Filter failed");
//       return toPaginatedResponse(res.data?.data);
//     } catch (e: any) { return extractError(e, "Failed to filter school groups"); }
//   },

//   // GET /school-group/analytics
//   getAnalytics: async (): Promise<SchoolGroupAnalytics> => {
//     try {
//       const res = await AxiosFunc.Get(EP.ANALYTICS);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return res.data?.data as SchoolGroupAnalytics;
//     } catch (e: any) {
//       return extractError(e, "Failed to fetch analytics");
//     }
//   },

//   // GET /school-group/dashboard
//   getDashboard: async (): Promise<SuperAdminDashboard> => {
//     try {
//       const res = await AxiosFunc.Get(EP.DASHBOARD);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return res.data?.data as SuperAdminDashboard;
//     } catch (e: any) { return extractError(e, "Failed to fetch dashboard"); }
//   },

//   // GET /school-group/by-year/{year}
//   getByYear: async (year: number): Promise<SchoolGroupsByYear> => {
//     try {
//       const res = await AxiosFunc.Get(EP.BY_YEAR(year));
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return res.data?.data as SchoolGroupsByYear;
//     } catch (e: any) { return extractError(e, "Failed to fetch school groups by year"); }
//   },

//   // GET /school-group/summery
//   getSummary: async (): Promise<SchoolGroupSummary> => {
//     try {
//       const res = await AxiosFunc.Get(EP.SUMMARY);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Fetch failed");
//       return res.data?.data as SchoolGroupSummary;
//     } catch (e: any) { return extractError(e, "Failed to fetch summary"); }
//   },

//   // PUT /school-group/{code}/subscribe/package/{packageId}?isPaid=
//   subscribePackage: async (
//     code: string,
//     packageId: number,
//     dto: AssignSubscriptionRequestDto,
//     isPaid?: boolean,
//   ): Promise<void> => {
//     try {
//       const query = isPaid !== undefined ? `?isPaid=${isPaid}` : "";
//       const res = await AxiosFunc.Put(`${EP.SUBSCRIBE(code, packageId)}${query}`, dto);
//       if (res.data?.status !== 200) throw new Error(res.data?.message ?? "Subscribe failed");
//     } catch (e: any) { extractError(e, "Failed to subscribe package"); }
//   },

//   // Fetch logo as Blob for <img> rendering
//   getLogo: async (logoPath: string): Promise<Blob> => {
//     if (!logoPath) throw new Error("Logo path is required");
//     let fullPath: string;
//     if      (logoPath.startsWith("/"))             fullPath = logoPath;
//     else if (logoPath.startsWith("uploads/"))      fullPath = `/${logoPath}`;
//     else                                           fullPath = `/uploads/${logoPath}`;
//     const res = await AxiosFunc.GetFile(fullPath);
//     if (!(res.data instanceof Blob)) throw new Error("Invalid image response");
//     return res.data;
//   },
// };