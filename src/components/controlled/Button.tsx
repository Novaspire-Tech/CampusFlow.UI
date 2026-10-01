// Button.tsx
import React, { useState, useEffect } from 'react'
import { usePermissions } from '../../hooks/queries/usePermissions'

interface ButtonProps {
  name: string
  loading: boolean
  clr?: string
  isDisable?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  icon?: React.ReactNode
  permissionScope?: string
  permissionType?: 'CREATE' | 'UPDATE' | 'DELETE' | 'READ'
  enablePermissions?: boolean
  showDisabledIfNoPermission?: boolean
  type?: 'button' | 'submit' | 'reset'
  showAlways?: boolean
}

const Button: React.FC<ButtonProps> = ({
  name,
  loading,
  clr,
  isDisable = false,
  onClick,
  icon,
  permissionScope,
  permissionType = 'CREATE',
  enablePermissions = false,
  showDisabledIfNoPermission = true,
  type = 'submit',
  showAlways = false,
}) => {
  const { canCreate, canUpdate, canDelete, canRead } = usePermissions()

  const [schoolCode, setSchoolCode] = useState<string>(
    () => localStorage.getItem('schoolCode') ?? ''
  )

  useEffect(() => {
    // showAlways=true → always visible, no need to track schoolCode at all
    if (showAlways) return

    const sync = () => {
      setSchoolCode(localStorage.getItem('schoolCode') ?? '')
    }

    // Sync once on mount in case value changed before this component mounted
    sync()

    // Listen for AllSchoolDropdown writing/restoring schoolCode
    window.addEventListener('schoolCodeChanged', sync)
    return () => window.removeEventListener('schoolCodeChanged', sync)
  }, [showAlways])

  // showAlways=true  → always render (all existing pages unaffected)
  // showAlways=false → only render when schoolCode exists
  if (!showAlways && !schoolCode) return null

  const hasPermission = () => {
    if (!enablePermissions || !permissionScope) return true
    switch (permissionType) {
      case 'CREATE': return canCreate(permissionScope)
      case 'UPDATE': return canUpdate(permissionScope)
      case 'DELETE': return canDelete(permissionScope)
      case 'READ':   return canRead(permissionScope)
      default:       return true
    }
  }

  const permissionGranted = hasPermission()

  if (enablePermissions && !permissionGranted && !showDisabledIfNoPermission) {
    return null
  }

  const permissionDisabled = enablePermissions && !permissionGranted
  const isButtonDisabled = isDisable || loading || permissionDisabled

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (permissionDisabled) {
      event.preventDefault()
      alert(`You don't have ${permissionType} permission for ${permissionScope}`)
      return
    }
    if (onClick) onClick(event)
  }

  return (
    <div>
      <button
        type={type}
        disabled={isButtonDisabled}
        onClick={handleClick}
        title={permissionDisabled ? `No ${permissionType} permission` : ''}
        style={isButtonDisabled ? { backgroundColor: 'gray' } : { backgroundColor: clr }}
        className={`w-auto flex justify-center items-center gap-2
          font-semibold shadow-md transition duration-300
          bg-slate-700 px-4 py-2 text-white rounded-md
          ${isButtonDisabled
            ? 'cursor-not-allowed opacity-60'
            : 'cursor-pointer hover:shadow-lg hover:bg-slate-900'
          }`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && <span>{icon}</span>}
            {name}
          </>
        )}
      </button>
    </div>
  )
}

export default Button