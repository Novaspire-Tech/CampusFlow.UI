export interface FeeType {
  id: string
  feeTypeId: string
  name: string
  feeTypeName: string
  feeCode: string
  description: string
  createdDate: string
  status: 'Active' | 'Inactive'
}
export interface FeeTypeCreateInput {
  name: string
  feeCode: string
  description: string
  status: 'Active' | 'Inactive'
}

// Partial form fields merged onto an existing FeeType for update calls
export type FeeTypeUpdateInput = Pick<FeeType, 'id'> & Partial<FeeTypeCreateInput>

export interface FeeTypeStats {
  title: string
  value: string
  change: string
  icon: string
}