export interface MarkDivision {
  id: string;
  markDivisionId?: string;
  divisionName: string;
  percentFrom: string;
  percentUpTo: string;
}

export interface MarkDivisionFormData {
  divisionName: string;
  percentFrom: string;
  percentUpTo: string;
}