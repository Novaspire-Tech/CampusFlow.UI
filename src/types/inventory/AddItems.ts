export interface AddItemsFormData {
  item: string;
  unit: string;
  quantity: string;
  description?: string;
}

export interface AddItems {
 

  addItemId: number;
  item: string;
  unit: string;
  quantity: string;
  description?: string;
}
