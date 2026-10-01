import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../../helpers/useTranslations'

const Setup = () => {
  const { t } = useTranslation()
  const texts = getPagesDataText(t)

  const menus = [
    { label: texts.Purpose, path: 'purpose' },
    { label: texts.Complaint_Type, path: 'complaint-type' },
    { label: texts.Source, path: 'source' },
    { label: texts.Reference, path: 'reference' },
  ]

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      {/* LEFT MENU */}
      <div className="w-full sm:w-50 lg:w-55 bg-white shadow-lg rounded-xl p-3 sm:p-4">
        <div className="flex flex-row sm:flex-col gap-1 overflow-x-auto sm:overflow-x-visible">
          {menus.map((menu) => (
            <NavLink
              key={menu.path}
              to={menu.path}
              className={({ isActive }) =>
                `block whitespace-nowrap sm:whitespace-normal px-3 py-2 rounded-md font-medium text-sm sm:text-base shrink-0 sm:shrink ${
                  isActive
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`
              }
            >
              {menu.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* RIGHT CONTENT */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}

export default Setup
