export interface Topic {
  id: string;             
  topicId: string;       
  topicName: string;

  // Display name
  className: string;
  section: string;
  subjectGroup: string;
  subject: string;

  // IDs (for edit form population)
  schoolClassId: string;
  sectionId: string;
  subjectGroupId: string;
  subjectId: string;
}

export interface TopicFormData {
  topicName: string;

  // Required IDs sent to backend
  schoolClassId: string;
  sectionId: string;
  subjectGroupId: string;
  subjectId: string;
}