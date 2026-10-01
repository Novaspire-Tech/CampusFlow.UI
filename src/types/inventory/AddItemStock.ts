export interface ItemCategoryRef {
  itemCategoryId: number;
  itemCategory: string;
}

export interface AddItemsRef {
  addItemId: number;
  item: string;
}

export interface ItemStoreRef {
  itemStoreId: number;
  itemStoreName: string;
}

export interface ItemSupplierRef {
  itemSupplierId: number;
  name: string;
}

export interface AddItemStock {
  id: number;                 
  addItemStockId: number;
  quantity: string;
  parchesPrice: string;
  date: string; 
  document?: string | null; 
  description?: string;
  itemCategory: ItemCategoryRef;
  addItems: AddItemsRef;
  itemStore?: ItemStoreRef | null;
  itemSupplier?: ItemSupplierRef | null;
}
export interface AddItemStockFormData {
  itemCategoryId: number;
  addItemsId: number;
  itemStoreId?: number;
  itemSupplierId?: number;
  quantity: string;
  parchesPrice: string;
  date: string; 
  document?: File | null; 
  description?: string;
}