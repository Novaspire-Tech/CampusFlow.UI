export interface ItemStore {
  itemStoreId: number;           
  itemStoreName: string;         
  itemStoreCode?: string;        
  description?: string;          
}


export interface ItemStoreFormData {
  itemStoreName: string;
  itemStoreCode?: string;
  description?: string;
}
