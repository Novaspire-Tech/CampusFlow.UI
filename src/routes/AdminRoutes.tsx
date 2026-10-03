import { useState, type JSX } from 'react'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import AdminNavbar from '../containers/layout/superAdmin/AdminNavbar'
import AdminSidebar from '../containers/layout/superAdmin/AdminSidebar'
import Footer from '../containers/layout/Footer'

//  Page Imports
import SuperAdminLoginPage from '../page/auth/SuperAdminLogin'

import PageNotFound from '../common/PageNotFound'
import LoginPage from '../page/auth/LoginPage'
import SchoolRegistration from '../page/home/superAdmin/SchoolRegistration'
import PackageManagement from '../page/home/superAdmin/PackageManagement'
import SuperAdminDashboard from '../page/home/dashboard/superAdmin/SuperAdminDashboard'
import SubscriptionTable from '../page/home/superAdmin/SubscriptionTable'
import SchoolGroup from '../page/home/superAdmin/SchoolGroup'
import SingleSchoolGroup from '../page/home/superAdmin/SingleSchoolGroup'

//  Permission Helpers
const isSuperAdmin = (): boolean => localStorage.getItem('role') === 'SUPER_ADMIN'

const hasAdminPermission = (scope?: string): boolean => {
  if (isSuperAdmin()) return true
  if (!scope) return true

  try {
    const storedPermissions = localStorage.getItem('adminPermissions')
    if (storedPermissions) {
      const permissions = JSON.parse(storedPermissions)
      if (Array.isArray(permissions)) {
        return permissions.some((p) => p.scope === scope && p.operations.length > 0)
      }
    }
  } catch (error) {
    console.error('Error checking admin permissions:', error)
  }

  return false
}

//  Route Permission Map
interface AdminRoutePermission {
  path: string
  scope?: string
  roles?: string[]
}

const adminRoutePermissions: AdminRoutePermission[] = [
  { path: '/admin/dashboard/overview', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/schools', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/school-registration/new', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/subscriptions/plans', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/subscriptions/create-plan', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/school-group/new', roles: ['SUPER_ADMIN', 'ADMIN'] },
  { path: '/admin/school-group/:schoolGroupId', roles: ['SUPER_ADMIN', 'ADMIN'] },
]

//  Protected Route
interface AdminProtectedRouteProps {
  element: JSX.Element
  path: string
  roles?: string[]
  scope?: string
}

const AdminProtectedRoute = ({ element, path, roles, scope }: AdminProtectedRouteProps) => {
  const { isAuthenticated, loading } = useAuth()
  const role = localStorage.getItem('role')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-xl text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) return <Navigate to="/super-admin/login" replace />
  if (roles && (!role || !roles.includes(role)))
    return <Navigate to="/admin/unauthorized" replace />
  if (scope && !hasAdminPermission(scope)) return <Navigate to="/admin/unauthorized" replace />

  const routePermission = adminRoutePermissions.find((rp) => path.startsWith(rp.path))
  if (routePermission) {
    if (routePermission.scope && !hasAdminPermission(routePermission.scope))
      return <Navigate to="/admin/unauthorized" replace />
    if (routePermission.roles && (!role || !routePermission.roles.includes(role)))
      return <Navigate to="/admin/unauthorized" replace />
  }

  return element
}

//  Main Layout
const AdminMainLayout = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const location = useLocation()
  const isAuthPage = location.pathname === '/super-admin/login' || location.pathname === '/login'
  const closeSidebar = () => {
    if (window.matchMedia('(max-width: 767px)').matches) setIsSidebarOpen(false)
  }

  return (
    <div className="campusflow-shell flex flex-col h-screen">
      {!isAuthPage && <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />}

      <div className="flex flex-1 overflow-hidden">
        {!isAuthPage && (
          <AdminSidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        )}

        <div
          className={`campusflow-content flex-1 ${isAuthPage ? 'campusflow-content--auth' : 'campusflow-page-content'}`}
        >
          <Routes>
            <Route path="/super-admin/login" element={<SuperAdminLoginPage />} />
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/admin/dashboard/overview"
              element={
                <AdminProtectedRoute
                  element={<SuperAdminDashboard />}
                  path="/admin/dashboard/overview"
                  roles={['SUPER_ADMIN']}
                />
              }
            />

            <Route
              path="/admin/school-registration/new"
              element={
                <AdminProtectedRoute
                  element={<SchoolRegistration />}
                  path="/admin/school-registration/new"
                  // scope="SCHOOL_MANAGEMENT"
                  roles={['SUPER_ADMIN', 'ADMIN']}
                />
              }
            />
            <Route
              path="/admin/school-group/:schoolGroupId"
              element={
                <AdminProtectedRoute
                  element={<SingleSchoolGroup />}
                  path="/admin/school-group/:schoolGroupId" // scope="SCHOOL_MANAGEMENT"
                  roles={['SUPER_ADMIN', 'ADMIN']}
                />
              }
            />

            <Route
              path="/admin/school-group/new"
              element={
                <AdminProtectedRoute
                  element={<SchoolGroup />}
                  path="/admin/school-group/new"
                  // scope="SCHOOL_MANAGEMENT"
                  roles={['SUPER_ADMIN', 'ADMIN']}
                />
              }
            />

            {/* <Route
              path="/admin/schools/details/:id"
              element={
                <AdminProtectedRoute
                  element={<SchoolDetails />}
                  path="/admin/schools/details"
                  // scope="SCHOOL_MANAGEMENT"
                />
              }
            /> */}

            <Route
              path="/admin/subscriptions/plans"
              element={
                <AdminProtectedRoute
                  element={<SubscriptionTable />}
                  path="/admin/subscriptions/plans"
                  // scope="SUBSCRIPTION_MANAGEMENT"
                />
              }
            />

            <Route
              path="/packages/all"
              element={
                <AdminProtectedRoute
                  element={<PackageManagement />}
                  path="/packages/all"
                  // scope="SUPER_ADMIN"
                />
              }
            />

            <Route
              path="/admin/unauthorized"
              element={
                <div className="flex items-center justify-center h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-xl text-gray-600">
                      You don't have permission to access this page.
                    </p>
                  </div>
                </div>
              }
            />

            <Route path="*" element={<AdminProtectedRoute element={<PageNotFound />} path="*" />} />
          </Routes>
        </div>
      </div>

      {!isAuthPage && <Footer />}
    </div>
  )
}

//  App Content (exported)
const AdminAppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    () => window.matchMedia('(min-width: 768px)').matches,
  )
  return <AdminMainLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
}

export default AdminAppContent
