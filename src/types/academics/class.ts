export interface Section {
  sectionId: number;
  sectionName: string;
}

export interface SchoolClass {
  name: string;
  id: string;
  schoolClassId: number;
  className: string;
  sections: Section[];
}

export interface SchoolClassFormData {
  className: string;
}