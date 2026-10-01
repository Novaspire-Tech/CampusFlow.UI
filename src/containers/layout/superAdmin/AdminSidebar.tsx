import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { IconField } from '../../../components'

interface SubMenuItem {
  name: string
  path: string
  icon?: string
  badge?: string | number
}

interface MenuItem {
  scope?: string
  title: string
  path?: string
  icon?: string
  items?: SubMenuItem[]
  badge?: string | number
}

interface AdminSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})
  const [activeItem, setActiveItem] = useState<string>('')

  const navigate = useNavigate()
  const location = useLocation()

  // Menu items configuration
  const menuItems: MenuItem[] = [
    {
      title: 'Main Dashboard',
      icon: 'FaTachometerAlt',
      items: [
        {
          name: 'Overview',
          path: '/admin/dashboard/overview',
          icon: 'FaChartPie',
        },
      ],
    },
    {
      title: 'School',
      icon: 'FaSchool',

      items: [
        {
          name: 'School Group',
          path: '/admin/school-group/new',
          icon: 'FaPlusCircle',
        },
      ],
    },
    {
      title: 'Subscription',
      icon: 'FaCreditCard',
      items: [
        {
          name: 'Plans & Pricing',
          path: '/admin/subscriptions/plans',
          icon: 'FaTags',
        },
      ],
    },
    {
      title: 'Packages',
      icon: 'FaCube',
      items: [
        {
          name: 'All Packages',
          path: '/packages/all',
          icon: 'FaBoxes',
        },
      ],
      scope: 'SUPER_ADMIN',
    },
  ]

  const toggleSection = (section: string) => {
    setOpenSections((prev) => {
      const newState: Record<string, boolean> = {}
      newState[section] = !prev[section]
      return newState
    })
  }

  const handleNavigation = (item: SubMenuItem) => {
    setActiveItem(item.name)
    navigate(item.path)
    onClose()
  }

  useEffect(() => {
    menuItems.forEach((menu) => {
      if (menu.items) {
        menu.items.forEach((item) => {
          if (location.pathname === item.path) {
            setActiveItem(item.name)
            setOpenSections((prev) => ({ ...prev, [menu.title]: true }))
          }
        })
      }
    })
  }, [location.pathname])

  return (
    <>
      {isOpen && (
        <button
          type="button"
          className="campusflow-sidebar-backdrop md:hidden"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside
        className={`campusflow-sidebar ${isOpen ? 'campusflow-sidebar--open' : ''}`}
        aria-label="Admin navigation"
      >
        <div className="campusflow-sidebar__header">
          <div className="campusflow-sidebar__identity">
            <span className="campusflow-sidebar__identity-mark">
              <IconField name="FaSchool" size={17} />
            </span>
            <div>
              <p className="campusflow-sidebar__overline">Platform workspace</p>
              <h2>Quick Links</h2>
            </div>
          </div>
          <button
            type="button"
            className="campusflow-sidebar__close md:hidden"
            aria-label="Close navigation"
            onClick={onClose}
          >
            <IconField name="FaTimes" size={20} />
          </button>
        </div>

        <nav className="campusflow-sidebar__nav">
          <p className="campusflow-sidebar__section-label">Modules</p>
          {menuItems.map((menu) => {
            const hasActiveItem = menu.items?.some((item) => item.path === location.pathname)
            const isExpanded = Boolean(openSections[menu.title])

            return (
              <div className="campusflow-sidebar__group" key={menu.title}>
                {menu.path ? (
                  <button
                    onClick={() => {
                      navigate(menu.path!)
                      onClose()
                    }}
                    aria-current={location.pathname === menu.path ? 'page' : undefined}
                    className={`campusflow-sidebar__item ${location.pathname === menu.path ? 'campusflow-sidebar__item--active' : ''}`}
                  >
                    <span className="campusflow-sidebar__item-label">
                      {menu.icon && <IconField name={menu.icon} size={16} />}
                      <span>{menu.title}</span>
                    </span>
                  </button>
                ) : (
                  <div className="campusflow-sidebar__section">
                    <button
                      onClick={() => toggleSection(menu.title)}
                      className={`campusflow-sidebar__item ${hasActiveItem ? 'campusflow-sidebar__item--section-active' : ''}`}
                      aria-expanded={isExpanded}
                    >
                      <span className="campusflow-sidebar__item-label">
                        {menu.icon && <IconField name={menu.icon} size={16} />}
                        <span>{menu.title}</span>
                      </span>
                      <span
                        className={`campusflow-sidebar__chevron ${isExpanded ? 'campusflow-sidebar__chevron--open' : ''}`}
                      >
                        <IconField name="FaAngleDown" size={13} />
                      </span>
                    </button>

                    {isExpanded && menu.items && (
                      <ul className="campusflow-sidebar__submenu">
                        {menu.items.map((item) => (
                          <li key={item.path}>
                            <button
                              type="button"
                              className={`campusflow-sidebar__subitem ${
                                activeItem === item.name ? 'campusflow-sidebar__subitem--active' : ''
                              }`}
                              aria-current={item.path === location.pathname ? 'page' : undefined}
                              onClick={() => handleNavigation(item)}
                            >
                              <span className="campusflow-sidebar__subitem-dot" />
                              {item.icon && <IconField name={item.icon} size={14} />}
                              <span className="flex-1">{item.name}</span>
                              {item.badge && (
                                <span className="campusflow-sidebar__badge">{item.badge}</span>
                              )}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
        <div className="campusflow-sidebar__footer">
          <span className="campusflow-sidebar__status-dot" />
          <span>Administration</span>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
