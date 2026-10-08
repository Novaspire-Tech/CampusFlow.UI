export interface Session {
  sessionName: string;
  id: string;
  sessionId: string;
  session: string;
  isCurrent: boolean;
  startDate: string;
  endDate: string | null;
}

export interface SessionRequest {
  session: string;
  startDate: string;
  endDate: string | null;
}

export interface SessionFormData {
  session: string;
  startDate: string;
  endDate: string;
}

export interface SessionStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export interface SessionRolloverRequest {
  fromSessionId: number;
  toSessionId: number;
  classIds?: number[];
  dryRun: boolean;
  copySections: boolean;
  copySubjectGroups: boolean;
  copyExamGroups: boolean;
  copyClassFees: boolean;
}

export type SessionRolloverRequestInput = Omit<
  SessionRolloverRequest,
  'fromSessionId' | 'toSessionId'
> & {
  fromSessionId: string | number;
  toSessionId: string | number;
};

export interface SessionRolloverReport {
  fromSessionId: number;
  fromSession: string;
  toSessionId: number;
  toSession: string;
  dryRun: boolean;
  copiedClasses: string[];
  skippedClasses: string[];
  sectionsCreated: number;
  subjectGroupsCreated: number;
  examGroupsCreated: number;
  classFeesCreated: number;
  message: string;
}
