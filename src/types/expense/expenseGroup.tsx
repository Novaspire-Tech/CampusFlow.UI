export interface ExpenseGroup {
  id: string;
  expenseGroupId: string;
  groupName: string;
  expenseHeadId: number;
  expenseHeadName?: string;
}

export interface ExpenseGroupPayload {
  expenseHeadId: number;
  groupName: string;
}

export interface ExpenseGroupStats {
  title: string;
  value: string;
  change: string;
  icon: string;
}

export interface ExpenseGroupFormData {
  groupName: string;
  expenseHeadId: number;
}

export interface CreateExpenseGroupRequestDTO {
  expenseHeadId: number;
  groupName: string;
}

export interface ExpenseGroupResponseDTO {
  expanseGroupId: number;
  expanseGroupName: string;
}

export interface ExpenseGroupTableRow {
  id: string;
  expenseHeadName: string;
  groupName: string;
  expenseHeadId: number;
}