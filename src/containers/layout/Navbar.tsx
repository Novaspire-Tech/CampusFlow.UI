import React, { useState, useEffect, useRef } from 'react'
import { IconField } from '../../components'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { menuItems } from './menuData'
import { getHeaderText } from '../../helpers/useTranslations'
import { useSchool } from '../../hooks/queries/superAdmin/useSchool'
import { useStaffPhoto } from '../../hooks/queries/humanResource/useStaffPhoto'
import { useSchoolsByGroup } from '../../hooks/queries/superAdmin/useschoolGroup'
import { useAuth } from '../../contexts/AuthContext'

interface NavbarProps {
  toggleSidebar: () => void
}

interface FormValues {
  search: string
  navDropdown: string
}

const ls = (key: string) => localStorage.getItem(key) ?? ''

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { search: '', navDropdown: '' },
  })
  const navigate = useNavigate()
  const { i18n, t } = useTranslation()

  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(() => ls('schoolCode'))
  const [pendingSchoolName, setPendingSchoolName] = useState(() => ls('schoolName'))

  const dropdownRef = useRef<HTMLDivElement | null>(null)

  // Normalize role ONCE
  const role = (ls('role') || '').toUpperCase()
  const staffCode = ls('staffCode')
  const schoolGroupCode = ls('schoolGroupCode')
  const userType = ls('userType')

  const isSchoolGroup = role === 'SCHOOL_GROUP' || userType === 'GROUP_USER'

  const isAllSchools = ls('isAllSchools') === 'true'

  const shouldFetchSchool = Boolean(selectedSchool && selectedSchool !== '' && !isAllSchools)

  const { data: schoolData, isLoading: isSchoolLoading } = useSchool(
    shouldFetchSchool ? schoolGroupCode : '',
    shouldFetchSchool ? selectedSchool : '',
  )

  // Only fetch schools list for group roles
  const { data: schoolsData, isLoading: isSchoolsLoading } = useSchoolsByGroup(
    isSchoolGroup ? schoolGroupCode : '',
  )

  const schools = schoolsData?.schools ?? []

  // Auto-select first school once schools list loads
  useEffect(() => {
    if (!isSchoolGroup) return
    if (selectedSchool) return
    if (pendingSchoolName === 'All Schools') return
    if (isSchoolsLoading || schools.length === 0) return

    const first = schools[0]
    localStorage.setItem('schoolCode', first.schoolCode)
    localStorage.setItem('schoolName', first.schoolName)
    if (first.type) localStorage.setItem('type', first.type)
    localStorage.setItem('isAllSchools', 'false')
    setSelectedSchool(first.schoolCode)
    setPendingSchoolName(first.schoolName)
  }, [isSchoolsLoading, schools, selectedSchool, isSchoolGroup, pendingSchoolName])

  const selectedSchoolObj = schools.find((s) => s.schoolCode === selectedSchool)
  const schoolName =
    selectedSchoolObj?.schoolName ??
    schoolData?.schoolName ??
    pendingSchoolName ??
    ls('schoolName') ??
    ''
  const logoPath = schoolData?.logo ?? ''
  const packageName = schoolData?.planName ?? ''
  const userRole = ls('role') || 'User'

  // Write session/type only when data actually arrives
  useEffect(() => {
    if (schoolData?.session) localStorage.setItem('session', schoolData.session)
    if (schoolData?.type) localStorage.setItem('type', schoolData.type)
  }, [schoolData])

  const email = (() => {
    if ((role === 'SCHOOL' || role === 'ADMIN') && schoolData?.email) return schoolData.email
    return ls('email')
  })()

  const {
    photoUrl,
    loading: photoLoading,
    error: photoError,
  } = useStaffPhoto(logoPath || undefined)

  // Sync language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language')
    if (savedLanguage && savedLanguage !== i18n.language) {
      i18n.changeLanguage(savedLanguage)
    }
  }, [])

  // Resize & click-outside listeners
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsMobileSearchActive(false)
    }
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    window.addEventListener('resize', handleResize)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSchoolCode = e.target.value
    if (!newSchoolCode) return

    if (newSchoolCode === 'ALL') {
      localStorage.removeItem('schoolCode')
      localStorage.setItem('schoolName', 'All Schools')
      localStorage.setItem('isAllSchools', 'true')
      setSelectedSchool('')
      setPendingSchoolName('All Schools')
      setTimeout(() => window.location.reload(), 0)
      return
    }

    const selected = schools.find((s) => s.schoolCode === newSchoolCode)
    if (!selected) return

    localStorage.setItem('schoolCode', selected.schoolCode)
    localStorage.setItem('schoolName', selected.schoolName)
    if (selected.type) localStorage.setItem('type', selected.type)
    localStorage.setItem('isAllSchools', 'false')
    setSelectedSchool(selected.schoolCode)
    setPendingSchoolName(selected.schoolName)
    window.location.reload()
  }

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = e.target.value
    i18n.changeLanguage(lang)
    localStorage.setItem('language', lang)
  }

  const findPathByName = (query: string): string | null => {
    const lowerQuery = query.toLowerCase().trim()
    for (const menu of menuItems) {
      if (menu.title.toLowerCase() === lowerQuery && menu.path) return menu.path
      if (menu.items) {
        for (const item of menu.items) {
          if (typeof item === 'object' && item.name.toLowerCase() === lowerQuery)
            return item.path || null
          if (typeof item === 'string' && item.toLowerCase() === lowerQuery)
            return '/' + item.toLowerCase().replace(/\s+/g, '-')
        }
      }
    }
    return null
  }

  const onSubmitSearch: SubmitHandler<FormValues> = (data) => {
    const path = findPathByName(data.search)
    navigate(path ?? '/*')
    reset()
  }

  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleProfileClick = () => {
    setShowProfileMenu(false)
    if (staffCode) navigate(`/staff/view/${staffCode}`)
  }

  const shouldShowProfileButton = () => role !== 'SCHOOL' && role !== 'PARENT'

  const school_college_name_Text = getHeaderText(t)
  const Hello_User_Text = getHeaderText(t)
  const CampusFlow_Text = getHeaderText(t)
  const Logout_Text = getHeaderText(t)

  const dropdownValue = selectedSchool
    ? selectedSchool
    : pendingSchoolName === 'All Schools'
      ? 'ALL'
      : ''

  return (
    <nav className="campusflow-topbar bg-[#213448] text-white w-full px-3 sm:px-4 py-2 shadow-md relative">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {role !== 'PARENT' && (
            <button
              onClick={toggleSidebar}
              className="campusflow-topbar__menu-button"
              aria-label="Toggle navigation"
            >
              <IconField name="FaBars" size={20} />
            </button>
          )}

          {isSchoolLoading || photoLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 shrink-0" />
          ) : photoUrl && !photoError ? (
            <img
              src={photoUrl}
              alt="school logo"
              className="h-8 sm:h-9 md:h-10 w-auto max-w-20 sm:max-w-25 md:max-w-30 object-contain rounded-md shrink-0 cursor-pointer"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('closeSidebar'))
                window.location.href = '/school-dashboard'
              }}
            />
          ) : (
            <IconField name="FaUserCircle" className="text-gray-400 shrink-0" size={36} />
          )}

          <h1 className="text-base sm:text-lg lg:text-xl font-bold capitalize font-['inter']">
            {schoolName || school_college_name_Text.school_college_name}
          </h1>
        </div>

        {/* ── Right: School Selector + Language ── */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto">
          {isSchoolGroup && (
            <div className="flex flex-col items-start">
              {isSchoolsLoading ? (
                <div className="flex items-center gap-2 bg-[#213448] border border-white rounded-md px-3 py-0.5 text-sm text-gray-300">
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white" />
                  Loading schools...
                </div>
              ) : schools.length === 0 ? (
                <span className="text-xs text-red-300 border border-red-400 rounded-md px-2 py-0.5">
                  No schools found
                </span>
              ) : (
                <select
                  className="bg-[#213448] text-white text-sm md:text-base border border-white rounded-md px-2 py-0.5 cursor-pointer hover:border-blue-400 transition-colors max-w-40 sm:max-w-50 md:max-w-60 truncate"
                  value={dropdownValue}
                  onChange={handleSchoolChange}
                >
                  <option value="ALL">All Schools</option>
                  {schools.map((school) => (
                    <option key={school.schoolCode} value={school.schoolCode}>
                      {school.schoolName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Language Selector */}
          <div className="flex flex-col items-start">
            <select
              className="bg-[#213448] text-white text-sm md:text-base border border-white rounded-md px-1 py-0.5 cursor-pointer hover:border-blue-400 transition-colors"
              onChange={changeLanguage}
              value={i18n.language}
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="mr">मराठी</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="te">తెలుగు</option>
              <option value="ur">مخصوص زبان</option>
            </select>
          </div>
        </div>

        {/* ── Profile Icon + Dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <IconField
            name="FaUserCircle"
            className="md:h-6 md:w-6 h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors duration-200"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          />

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-auto bg-white text-gray-800 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in min-w-[200px]">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="font-semibold text-sm truncate">
                  {email ? `Hello ${email}` : Hello_User_Text.Hello_User}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {packageName || CampusFlow_Text.CampusFlow}
                </p>

                {isSchoolGroup && selectedSchool && (
                  <p className="text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded-md inline-block truncate max-w-40">
                    {pendingSchoolName ?? schoolName}
                  </p>
                )}

                <p className="text-xs font-medium text-[#213448] mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block capitalize">
                  {userRole}
                </p>
              </div>

              {shouldShowProfileButton() && (
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-[#213448] hover:bg-gray-100 font-semibold"
                >
                  <IconField name="FaUser" size={14} />
                  Profile
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-100 font-semibold border-t border-gray-200"
              >
                <IconField name="FaSignOutAlt" size={14} />
                {Logout_Text.Logout}
              </button>
            </div>
          )}
        </div>
      </div>

      {isMobileSearchActive && isMobileView && (
        <form onSubmit={handleSubmit(onSubmitSearch)} className="mt-2 md:hidden">
          <input
            type="text"
            {...register('search')}
            placeholder="Search tab..."
            className="py-1 pr-10 pl-4 rounded-full text-black font-semibold bg-gray-500 w-full border border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </form>
      )}
    </nav>
  )
}

export default Navbar
