export type CallType = "INCOMING" | "OUTGOING";

export interface PhoneCallLog {
  id: string;
  phoneCallLogId: string;
  name: string;
  phone: string;
  date: string;
  description?: string;
  nextFollowUpDate?: string;
  callDuration?: string;
  note?: string;
  callType: CallType;
}

export interface PhoneCallLogFormData {
  name: string;
  phone: string;
  date: string;
  description?: string;
  nextFollowUpDate?: string;
  callDuration?: string;
  note?: string;
  callType: CallType;
}