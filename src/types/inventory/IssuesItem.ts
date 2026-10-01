export interface ItemCategoryRef {
  itemCategoryId: number;
  itemCategory: string;
}

export interface AddItemsRef {
  addItemId: number;
  item: string;
  itemCategory?: ItemCategoryRef;
}

export interface IssuesItem {
  id: number;
  issuesItemId: number;
  issueTo: string;
  issueDate: string;
  note?: string;
  quantity: string;
  itemCategory: ItemCategoryRef;
  addItem: AddItemsRef;
}

export interface IssuesItemFormData {
  issueTo: string;
  issueDate: string;
  note?: string;
  quantity: string;
  itemCategoryId: number;
  addItemsId: number;
}

export interface IssuesItemListResponse {
  issuesItems: IssuesItem[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}
 