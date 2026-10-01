export interface Session {
  sessionName: string;
  id: string;
  sessionId: string;
  session: string;
  isCurrent: boolean;
}

export interface SessionFormData {
  session: string;
}

export interface SessionStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}
