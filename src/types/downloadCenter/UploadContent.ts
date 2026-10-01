// REFERENCE TYPES 

export interface SchoolClassRef {
  id: number;
  name: string;
}

export interface SectionRef {
  id: number;
  name: string;
}

export interface ContentTypeRef {
  id: number;
  name: string;
}

// BACKEND ENTITY 
/* What the API RETURNS */

export interface UploadContent {
  uploadContentId: number;
  title: string;

  filePath?: string | null;
  referenceLink?: string;
  description?: string;

  classId: number;
  sectionId?: number;
  contentTypeId: number;

  schoolClass?: SchoolClassRef;
  section?: SectionRef;
  contentType?: ContentTypeRef;
}

// FORM DATA 
/* What the UI SENDS */

export interface UploadContentFormData {
  uploadContentId?: number;
  title: string;

  filePath: File | null;   // USER FILE ONLY
  referenceLink?: string;
  description?: string;

  classId: string;          // dropdown values
  sectionId?: string;
  contentTypeId: string;
}

// CONTENT TYPE 

export interface ContentType {
  contentTypeId: number;
  name: string;
  description?: string;
}

export interface ContentTypeFormData {
  contentTypeName: string;
  description?: string;
}
