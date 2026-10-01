export interface DepartmentClass {
  id: string
  schoolClassId: number
  className: string
}

export interface Department {
  departmentName?: string
  id: string
  departmentId: number
  name: string
  classes: DepartmentClass[]
}

export interface DepartmentFormData {
  name: string
  classNames: string[]
}
