export interface IncomeGroup {
  id: string;        
  groupName: string; 
}


export interface IncomeGroupPayload {
  incomeHeadId: number;
  groupName: string;
}

export interface IncomeGroupStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}