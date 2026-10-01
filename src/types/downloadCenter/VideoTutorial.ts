export interface SchoolClassRef {
  id: number;
  name: string;
}

export interface SectionRef {
  id: number;
  name: string;
}
export interface VideoTutorial {
  name: number;
  videoTutorialId: number;

  title: string;
  videoLink: string;
  description?: string;

  classId: number;
  sectionId: number;

  schoolClass?: SchoolClassRef;
  section?: SectionRef;
}


export interface VideoTutorialFormData {
  title: string;
  videoLink: string;
  description?: string;
  classId: string;   
  sectionId: string;
}
