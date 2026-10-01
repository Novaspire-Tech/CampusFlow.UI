import { type ReactNode } from "react";

export interface ActivityItem {
  id: string;
  type: 'visitor' | 'enquiry' | 'call' | 'complaint' | 'dispatch' | 'receive';
  title: string;
  description: string;
  time: string;
  status?: string;
  icon?: ReactNode;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export interface VisitorStats {
  total: number;
  today: number;
  active: number;
  checkedOut: number;
  pending: number;
  averageStay: number;
  peakHour: string;
}

export interface EnquiryStats {
  total: number;
  today: number;
  pending: number;
  completed: number;
  active: number;
  bySource: Record<string, number>;
}

export interface CallStats {
  total: number;
  today: number;
  incoming: number;
  outgoing: number;
  avgDuration: string;
}

export interface ComplaintStats {
  total: number;
  today: number;
  resolved: number;
  pending: number;
  byType: Record<string, number>;
}