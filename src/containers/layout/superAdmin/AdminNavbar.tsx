import React, { useState, useEffect, useRef } from 'react'
import CampusFlowLogo from '@/assets/campusflow-logo-white.svg'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import type { SubmitHandler } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { menuItems } from '../menuData'
import { getHeaderText } from '../../../helpers/useTranslations'
import { schoolService } from '../../../services/apis/schoolApi'

interface NavbarProps {
  toggleSidebar?: () => void
}

interface FormValues {
  search: string
}

interface SchoolData {
  schoolId: number
  schoolName: string
  schoolCode: string
  address: string
  phoneNumber: string
  email: string
  session: string
  sessionStartMonth: string
  startDateOfWeek: string
}

const AdminNavbar: React.FC<NavbarProps> = () => {
  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { search: '' },
  })
  const navigate = useNavigate()
  const { i18n } = useTranslation()

  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false)
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const [email, setEmail] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768)
      if (window.innerWidth >= 768) setIsMobileSearchActive(false)
    }
    window.addEventListener('resize', handleResize)

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    fetchSchoolData()
    fetchUserRole()
    fetchUserEmail()
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchSchoolData = async () => {
    try {
      // First, try to get schoolName from localStorage (set during login)

      // Optionally fetch from API to update if needed (only if not already set)
      const schoolCode = localStorage.getItem('schoolCode') || sessionStorage.getItem('schoolCode')

      if (schoolCode) {
        const response = await schoolService.getSingleSchool(schoolCode)

        if (response.status === 200 && response.data) {
          const schoolData = response.data as SchoolData

          // Only set school email if user role is school/admin
          const role =
            localStorage.getItem('role') ||
            localStorage.getItem('userRole') ||
            localStorage.getItem('userType') ||
            localStorage.getItem('user_role')

          if (role?.toLowerCase() === 'school' || role?.toLowerCase() === 'admin') {
            setEmail(schoolData.email)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching school data:', error)
    }
  }

  const fetchUserEmail = async () => {
    try {
      // Try to get email from localStorage (if stored during login)
      let userEmail =
        localStorage.getItem('email') ||
        localStorage.getItem('userEmail') ||
        sessionStorage.getItem('email') ||
        sessionStorage.getItem('userEmail') ||
        ''

      // If no direct email, try to parse user object
      if (!userEmail) {
        const userString = localStorage.getItem('user') || sessionStorage.getItem('user')
        if (userString) {
          try {
            const userObj = JSON.parse(userString)
            // In your login response, email is stored in 'name' field
            userEmail =
              userObj.email || userObj.name || userObj.staffCode || userObj.studentCode || ''
          } catch (e) {
            console.error('Error parsing user object:', e)
          }
        }
      }

      // If email is found, set it
      if (userEmail) {
        setEmail(userEmail)
      }
    } catch (error) {
      console.error('Error fetching user email:', error)
    }
  }

  const fetchUserRole = () => {
    try {
      const role =
        localStorage.getItem('role') ||
        localStorage.getItem('userRole') ||
        localStorage.getItem('userType') ||
        localStorage.getItem('user_role') ||
        'User'

      setUserRole(role)
    } catch (error) {
      console.error('Error fetching user role:', error)
      setUserRole('User')
    }
  }

  const changeLanguage = (e: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(e.target.value)
  }

  const findPathByName = (query: string): string | null => {
    const lowerQuery = query.toLowerCase().trim()
    for (const menu of menuItems) {
      if (menu.title.toLowerCase() === lowerQuery && menu.path) {
        return menu.path
      }
      if (menu.items) {
        for (const item of menu.items) {
          if (typeof item === 'object' && item.name.toLowerCase() === lowerQuery) {
            return item.path || null
          } else if (typeof item === 'string' && item.toLowerCase() === lowerQuery) {
            return '/' + item.toLowerCase().replace(/\s+/g, '-')
          }
        }
      }
    }
    return null
  }

  const onSubmitSearch: SubmitHandler<FormValues> = (data) => {
    const path = findPathByName(data.search)
    if (path) {
      navigate(path)
    } else {
      navigate('/*')
    }
    reset()
  }

  const handleLogout = () => {
    navigate('/login')
    localStorage.clear()
    sessionStorage.clear()
  }

  const { t } = useTranslation()

  const Hello_User_Text = getHeaderText(t)
  const CampusFlow_Text = getHeaderText(t)
  const Logout_Text = getHeaderText(t)

  return (
    <nav className="campusflow-topbar bg-[#213448] text-white w-full px-3 sm:px-4 py-2 shadow-md relative">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <img
            src={CampusFlowLogo}
            alt="CampusFlow"
            className="w-24 sm:w-24 md:w-28 rounded-md p-1 h-auto cursor-pointer"
            onClick={() => {
              const sidebarCloseEvent = new CustomEvent('closeSidebar')
              window.dispatchEvent(sidebarCloseEvent)
              window.location.href = '/admin/dashboard/overview'
            }}
          />
          <button
            type="button"
            onClick={toggleSidebar}
            className="campusflow-topbar__menu-button"
            aria-label="Toggle navigation"
          >
            <IconField name="FaBars" size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 ml-auto">
          <div className="relative" ref={dropdownRef}>
            <IconField
              name="FaUserCircle"
              className="md:h-6 md:w-6 h-5 w-5 cursor-pointer hover:text-blue-400 transition-colors duration-200"
              onClick={() => setShowProfileMenu((prev) => !prev)}
            />
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-auto bg-white text-gray-800 rounded-xl shadow-lg overflow-hidden z-50 animate-fade-in min-w-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-semibold text-sm truncate">
                    {email ? `Hello ${email}` : Hello_User_Text.Hello_User}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{CampusFlow_Text.CampusFlow}</p>
                  <p className="text-xs font-medium text-[#213448] mt-1 bg-gray-100 px-2 py-1 rounded-md inline-block capitalize">
                    {userRole}
                  </p>
                </div>
                {/* {shouldShowProfileButton() && (
                  <button
                  type="button"
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-[#213448] hover:bg-gray-100 font-semibold"
                  >
                    <IconField name="FaUser" size={14} />
                    Profile
                  </button>
                )} */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 w-full text-left text-sm text-red-600 hover:bg-red-100 font-semibold border-t border-gray-200"
                >
                  <IconField name="FaSignOutAlt" size={14} />
                  {Logout_Text.Logout}
                </button>
              </div>
            )}
          </div>

          <select
            className="bg-[#213448] text-white text-sm md:text-base border border-white rounded-md px-1"
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

export default AdminNavbar
