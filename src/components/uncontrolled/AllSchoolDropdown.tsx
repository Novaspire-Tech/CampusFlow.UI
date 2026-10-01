import React from 'react'
import { useForm } from 'react-hook-form'
import Dropdown from '../controlled/Dropdown'
import { useSchoolsByGroup } from '../../hooks/queries/superAdmin/useschoolGroup'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../helpers/useTranslations'
import { useQueryClient } from '@tanstack/react-query'

const ls = (key: string) => localStorage.getItem(key) ?? ''

const SNAPSHOT_KEYS = ['schoolCode', 'schoolName', 'isAllSchools'] as const

interface AllSchoolDropdownProps {
  children: React.ReactNode
  onSubmit: (e: React.FormEvent) => void | Promise<void>
  onSchoolChange?: () => void 
  queryKeys?: string[]    
  className?: string      
}

const AllSchoolDropdown: React.FC<AllSchoolDropdownProps> = ({
  children,
  onSubmit,
  onSchoolChange,
  queryKeys = [],
  className = '',
}) => {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)
  const queryClient = useQueryClient() 

  const isAllSchools = React.useRef<boolean>(ls('isAllSchools') === 'true').current
  const schoolGroupCode = React.useRef<string>(ls('schoolGroupCode')).current

  const { data: schoolsData } = useSchoolsByGroup(schoolGroupCode)
  const schools = schoolsData?.schools ?? []

  const persistedSchoolCode = ls('schoolCode')

  const { control: schoolControl, watch, reset: resetSchool } = useForm<{ schoolCode: string }>({
    defaultValues: { schoolCode: persistedSchoolCode || '' },
  })
  const targetSchoolCode = watch('schoolCode')

  const snapshotRef = React.useRef<Record<string, string | null>>({})
  const snapshotSaved = React.useRef(false)
  const hasPreviouslySelected = React.useRef(false)
  const [schoolError, setSchoolError] = React.useState(false)
  const isMounted = React.useRef(false)
  const isRestoring = React.useRef(false)

  const saveSnapshot = () => {
    if (snapshotSaved.current) return
    SNAPSHOT_KEYS.forEach((key) => {
      snapshotRef.current[key] = localStorage.getItem(key)
    })
    snapshotSaved.current = true
  }

  const applyTargetSchool = (schoolCode: string) => {
    const found = schools.find((s) => s.schoolCode === schoolCode)
    localStorage.setItem('schoolCode', schoolCode)
    localStorage.setItem('isAllSchools', 'false')
    if (found) localStorage.setItem('schoolName', found.schoolName)
    window.dispatchEvent(new Event('schoolCodeChanged'))
  }

  const restoreSnapshot = () => {
    isRestoring.current = true
    SNAPSHOT_KEYS.forEach((key) => {
      const prev = snapshotRef.current[key]
      if (prev != null) {
        localStorage.setItem(key, prev)
      } else {
        localStorage.removeItem(key)
      }
    })
    snapshotRef.current = {}
    snapshotSaved.current = false
    resetSchool({ schoolCode: '' })
    hasPreviouslySelected.current = false
    setSchoolError(false)
    window.dispatchEvent(new Event('schoolCodeChanged'))
  }

  const handleSchoolChange = () => {
    if (queryKeys.length > 0) {
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: [key] })
      })
    } else {
      queryClient.invalidateQueries()
    }
    onSchoolChange?.() 
  }

  React.useEffect(() => {
    if (!isAllSchools) return

    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    if (isRestoring.current) {
      isRestoring.current = false
      return
    }

    if (targetSchoolCode) {
      hasPreviouslySelected.current = true
      setSchoolError(false)
      saveSnapshot()
      applyTargetSchool(targetSchoolCode)
      handleSchoolChange() 
    } else {
      if (hasPreviouslySelected.current) {
        setSchoolError(true)
      }
      if (snapshotSaved.current) {
        restoreSnapshot()
      }
    }
  }, [targetSchoolCode])

  React.useEffect(() => {
    if (schools.length > 0 && persistedSchoolCode) {
      resetSchool({ schoolCode: persistedSchoolCode })
    }
  }, [schools])

  React.useEffect(() => {
    return () => {
      if (snapshotSaved.current) {
        restoreSnapshot()
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isAllSchools && !targetSchoolCode) {
      setSchoolError(true)
      return
    }

    try {
      await onSubmit(e)
    } finally {
      if (isAllSchools && snapshotSaved.current) {
        restoreSnapshot()
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-3 ${className}`}>
      {isAllSchools && (
        <>
          <Dropdown
            name="schoolCode"
            label={texts.School_Name || 'Select School'}
            control={schoolControl}
            required
            options={schools.map((s) => ({
              label: s.schoolName,
              value: s.schoolCode,
            }))}
          />
          {schoolError && (
            <p className="text-red-500 text-sm mt-1">
              Please select a school
            </p>
          )}
        </>
      )}
      {children}
    </form>
  )
}

export default AllSchoolDropdown
