export interface Section {
  id: string
  name: string
  sectionId: string
  sectionName: string
  className: string
  schoolClassId: number
  createdDate: string
}

export interface SectionStats {
  title: string
  value: string
  change: string
  icon: string
}

export interface SectionFormData {
  sectionName: string
  schoolClassId: number
}

export interface SchoolClass {
  id: string
  schoolClassId: number
  className: string
  sections: Section[]
  sectionIds: string[]
}

export interface SchoolClassFormData {
  className: string
  sectionIds: string[]
}

export interface SectionDto {
  sectionName: string
}

export interface SectionResponseDto {
  sectionId: number
  sectionName: string
}

export interface SchoolClassDto {
  className: string
  sectionIds: number[]
}

export interface SchoolClassResponseDto {
  schoolClassId: number
  className: string
  sections: SectionResponseDto[]
}

export interface SectionTableRow {
  id: string
  className: string
  sectionName: string
  schoolClassId: number
}
