export interface SchoolClassRef {
  id: string;
  name: string;
}

export interface SectionRef {
  id: string;
  name: string;
}

export interface FeeTypeRef {
  id: string;
  feeTypeName: string;
}

export interface StudentCategoryRef {
  id: string;
  name: string;
}

export interface StudentHouseRef {
  id: string;
  name: string;
}

// Fee details interface
export interface FeeDetails {
  classFeesId: boolean;
  feesId?: string;
  feeTypeId: string;
  feeTypeName?: string;
  totalFees: string;
  paid: string;
  pending: string;
}



// Sibling interface — backend uses siblingName + siblingClassName
export interface SiblingDetails {
  className: string;
  siblingsId?: string;
  siblingName: string;
  siblingClassName: string; // was siblingUid — matches backend Siblings.siblingClassName
}

// Transport details interface
export interface TransportDetails {
  transportId?: string;
  routeId: string;
  routeName?: string;
  vehicleId: string;
  vehicleNumber?: string;
  pickupPointId: string;
  pickupPointName?: string;
  fareAmount?: string;
}

// Hostel details interface
export interface HostelDetails {
  hostelId?: string;
  hostelName?: string;
  roomId: string;
  roomNumber?: string;
  roomTypeId: string;
  roomTypeName?: string;
  costPerBed?: string;
}

// SSLC (10th) marks
export interface SSLCMarks {
  subjectName: string;
  maxMarks: string;
  obtainMarks: string;
}

// SSLC details for college type
export interface SSLCData {
  schoolNameWithAddress: string;
  registrationNo: string;
  firstLanguage: string;
  secondLanguage: string;
  thirdLanguage: string;
  percentage: string;
  result: string;
  sslcHallTicket?: string;
  sslcMarksSheetFile?: string;
  marksList: SSLCMarks[];
}

// Student Session interface
export interface StudentSession {
  id?: string;
  sessionId?: string;
  studentId?: string;
  sessionData?: {
    id?: string;
    sessionId?: string;
    session?: string;
    sessionName?: string;
    name?: string;
    [key: string]: any;
  };
  sessionName?: string;
  session?: string;
  status?: string;
  isActive?: boolean;
  rollNo?: string;
  [key: string]: any;
}

// Student Response from API
export interface Student {
  id: string;
  data: any;
  studentId: string;
  admissionNo: string;
  rollNo?: string;
  stsNumber?: string;         // NEW — backend: stsNumber
  grNumber?: string;          // NEW — backend: grNumber
  udiseNumber?:string;        // NEW — backend: udiseNumber
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  session: string;
  sessionId?: string;
  startSession?: string;      // NEW — backend: startSession
  studentSessions?: StudentSession[];

  // Related entities
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  departmentId?: string;      // NEW — backend: departmentId (required on add)
  departmentName?: string;   // NEW
  studentCategoryId?: string | null;
  studentCategoryName?: string | null;
  studentHouseId?: string | null;
  studentHouseName?: string | null;
  photo?: string | null;

  // Aadhaar / identity docs
  aadhaarNumber?: string;     // NEW
  aadhaarFile?: string;       // NEW (URL after save)
  birthCertificateFile?: string; // NEW
  bankPassbook?: string;        // NEW (URL after save)
  incomeCasteCertificate?: string; // NEW (URL after save)
  migrationBonafide?: string;      // NEW (URL after save)
  transferCertificate?: string;    // NEW (URL after save)
  sslcHallTicket?: string;        // NEW (URL after save)
  sslcMarksSheet?: string;        // NEW (URL after save)

  // Contact info
  phoneNumber?: string;
  email?: string;
  religion?: string;
  castName?: string;
  admissionDate?: string;

  // Physical details
  bloodGroup?: string;
  height?: string;
  weight?: string;
  measurementDate?: string;

  // Birth / location info
  placeOfBirth?: string;      // NEW
  taluk?: string;             // NEW
  district?: string;          // NEW
  state?: string;             // NEW
  nationality?: string;       // NEW

  // Address
  currentAddress?: string;
  permanentAddress?: string;
  previousSchool?: string;
  previousSchoolClass?: string;
  uid?: string;
  rte?: string;

  // Parent details
  fatherName: string;
  fatherAadhaar: string; 
  parentPhone: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  motherName?: string;
  motherAadhaar?: string;
  motherOccupation?: string;
  motherPhone?: string;

  // Parent extra fields
  parentName?: string;        // NEW — backend: Parent.name
  parentAadhaarNumber?: string; // NEW
  parentAdhaar?:string;
  parentQualification?: string; // NEW
  parentOccupation?: string;  // NEW
  parentAnnualIncome?: string; // NEW
  parentIncomeCertificateNumber?: string; // NEW
  parentNoOfDependents?: string; // NEW
  parentAlternatePhoneNumber?: string; // NEW
  parentEmail?: string;       // NEW
  parentDefaultParent?: string; // NEW

  // Guardian details
  guardianName?: string;
  guardianRelation?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianOccupation?: string;
  guardianAddress?: string;

  // Siblings
  siblingsList?: SiblingDetails[];

  // Disable Status
  isDisabled?: boolean;
  disableReasonId?: string | null;
  disableReasonName?: string | null;

  // Transport details
  routeId?: string | null;
  routeName?: string | null;
  pickupPointId?: string | null;
  pickupPointName?: string | null;
  vehicleId?: string | null;
  vehicleNumber?: string | null;

  // Hostel details
  hostelId?: string | null;
  hostelName?: string | null;
  roomId?: string | null;
  roomNumber?: string | null;
  roomTypeId?: string | null;
  roomTypeName?: string | null;

  // Additional
  description?: string;
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  nationalIdentification?: string;
  localIdentification?: string;
  note?: string;
  documentTitle?: string;
  document?: string | null;

  // SSLC (college only)
  sslcData?: SSLCData;

  // Fees list
  feesList?: FeeDetails[];

  // Transport and Hostel nested objects
  transport?: TransportDetails;
  hostel?: HostelDetails;
}

// Form data for creating/updating student
export interface StudentFormData {
  
  fees(arg0: string, fees: any): unknown;
  parentType: any;
  parent: any;
  admissionNo?: string;
  rollNo?: string;
  stsNumber?: string;         // NEW
  grNumber?: string;          // NEW
  udiseNumber?:string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;


  // Academic
  departmentId: string | number;
  classId: string;
  sectionId: string;
  session: string;
  sessionId?: string;
  startSession?: string;      
  studentCategoryId?: string;
  studentHouseId?: string;
  religion?: string;
  castName?: string;
  phoneNumber?: string;
  email?: string;
  admissionDate: string | Date;
  photo?: File | null;
  aadhaarNumber?: string;     
  studentAadhaar?: File | null; 
  parentAadhaar?: File | null;  
  birthCertificate?: File | null; 
  bloodGroup?: string;
  height?: string;
  weight?: string;
  measurementDate?: string | Date;
  placeOfBirth?: string;      
  taluk?: string;             // NEW
  district?: string;          // NEW
  state?: string;             // NEW
  nationality?: string;       // NEW
  currentAddress?: string;
  permanentAddress?: string;
  previousSchool?: string;
  previousSchoolClass?: string; // NEW
  uid?: string;

  // Disable Status
  isDisabled?: boolean;
  disableReasonId?: string | number;

  // Parent core
  fatherName: string;
  parentPhone: string;
  fatherOccupation?: string;
  fatherPhone?: string;
  fatherPhoto?: File | null;
  motherName?: string;
  motherOccupation?: string;
  motherPhone?: string;
  motherPhoto?: File | null;

  // Parent extra
  parentName?: string;        
  parentAadhaarNumber?: string; 
  parentQualification?: string; 
  parentOccupation?: string;  
  parentAnnualIncome?: string; 
  parentIncomeCertificateNumber?: string; 
  parentNoOfDependents?: string; 
  parentAlternatePhoneNumber?: string; 
  parentEmail?: string;       
  parentDefaultParent?: string; 

  // Guardian details
  guardianName?: string;
  guardianRelation?: string;
  guardianEmail?: string;
  guardianPhone?: string;
  guardianPhoto?: File | null;
  guardianOccupation?: string;
  guardianAddress?: string;

  // Siblings
  siblingsList?: SiblingDetails[];

  // Transport details
  hasTransport?: boolean;
  routeId?: string;
  pickupPointId?: string;
  vehicleId?: string;

  // Hostel details
  hasHostel?: boolean;
  hostelId?: string;
  roomId?: string;
  roomTypeId?: string;

  description?: string;
  nationalIdentification?: string;
  localIdentification?: string;
  rte?: string;
  note?: string;
  documentTitle?: string;
  document?: File | null;

  // SSLC (college only)
  sslcData?: SSLCData;

  // Fees
  feesList?: FeeDetails[];

  // Transport and Hostel nested objects
  transport?: TransportDetails;
  hostel?: HostelDetails;

  //Bank details
  bankDetails?: {
  bankAccountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  bankPassbookFile?: File | null; 
}
}


// DTO for API request
export interface StudentDto {
  admissionNo?: string;
  rollNo?: string;
  stsNumber?: string;
  grNumber?: string;
  udiseNumber?:string;
  firstName: string;
  middleName?: string;
  lastName: string;
  gender: string;
  dob: string;
  classId: number;
  sectionId: number;
  departmentId?: number;
  session?: string;
  sessionId?: number;
  startSession?: string;
  studentCategoryId?: number;
  studentHouseId?: number;
  religion?: string;
  castName?: string;
  phoneNumber?: string;
  email?: string;
  admissionDate?: string;
  photo?: string | null;
  aadhaarNumber?: string;
  bloodGroup?: string;
  height?: string;
  weight?: string;
  measurementDate?: string;
  placeOfBirth?: string;
  taluk?: string;
  district?: string;
  state?: string;
  nationality?: string;
  currentAddress?: string;
  permanentAddress?: string;
  previousSchool?: string;
  previousSchoolClass?: string;
  uid?: string;

  // Disable Status
  isDisabled?: boolean;
  disableReasonId?: number;

  // Transport details
  routeId?: number;
  pickupPointId?: number;
  vehiclesId?: number;

  // Hostel details
  hostelId?: number;
  hostelRoomId?: number;
  roomTypeId?: number;

  // Parent
  parent?: {
    parentPhone: string;
    fatherName: string;
    name?: string;
    aadhaarNumber?: string;
    qualification?: string;
    occupation?: string;
    annualIncome?: string;
    incomeCertificateNumber?: string;
    noOfDependents?: string;
    alternatePhoneNumber?: string;
    email?: string;
    defaultParent?: string;
    fatherOccupation?: string;
    fatherPhone?: string;
    motherName?: string;
    motherOccupation?: string;
    motherPhone?: string;
    guardianName?: string;
    guardianRelation?: string;
    guardianEmail?: string;
    guardianPhone?: string;
    guardianPhoto?: string | null;
    guardianOccupation?: string;
    guardianAddress?: string;
  };

  // Bank details
  bankDetails?: {
    bankAccountNumber?: string;
    bankName?: string;
    ifscCode?: string;
  };

  // Siblings — backend uses siblingName + className
  siblingsList?: Array<{
    siblingName: string;
    className: string;
  }>;

  description?: string;
  nationalIdentification?: string;
  localIdentification?: string;
  rte?: string;
  note?: string;
  documentTitle?: string;
  document?: string | null;

  // SSLC (college only)
  sslcData?: SSLCData;

  // Fees list
  feesList?: Array<{
    feeTypeId: number;
    totalFees: string;
    paid: string;
    pending?: string;
    classFeesId?: number;
    feesId?: number;
  }>;
}

export interface UpdateCurrentStudentSessionRequestDTO {
  departmentId?: any;
  classId: number;
  sectionId: number;
  sessionId?: number;
  rollNumber:number
}

// Paginated response
export interface StudentsPaginatedResponse {
  data?: any;
  students: Student[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface StudentSearchAndFilterDto {
  schoolClassId?: number;
  sectionId?: number;
  searchQuery?: string;
  sessionStatus?: string;
}

export interface StudentSearchParams {
  schoolClassId?: string;
  sectionId?: string;
  searchQuery?: string;
  sessionStatus?: string;
}

export const EMPTY_SEARCH_PARAMS: StudentSearchParams = {};