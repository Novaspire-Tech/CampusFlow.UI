// types/contentType.ts

export interface ContentType {
  contentTypeId: string;
  name: string;
  description: string;
  createdDate: string;
  status: 'Active' | 'Inactive';
}

export interface ContentTypeFormData {
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
}

export interface ContentTypeStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
 