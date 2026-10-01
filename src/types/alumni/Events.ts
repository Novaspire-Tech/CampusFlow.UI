export interface Events {
  classSection: string;
  eventsId: string;
  eventTitle: string;
  fromDate: string;
  toDate: string;
  sessionId?: string; 
  session?: {
    sessionId: string;
    sessionName: string;
  };
  schoolClass?: { 
    id: string;
    className: string;
  };
}

export interface EventsFormData {
  eventTitle: string;
  fromDate: string;
  toDate: string;
  sessionId?: string; 
  classId?: string; 
}