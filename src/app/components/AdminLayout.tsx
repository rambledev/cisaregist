"use client"

import { useState, useEffect, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  BarChart3,
  Users,
  Menu,
  X,
  LogOut,
  Home,
} from "lucide-react"

interface AdminLayoutProps {
  children: ReactNode
}

interface MenuItem {
  name: string
  href: string
  icon: any
  current?: boolean
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const navigation: MenuItem[] = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: BarChart3,
      current: pathname === "/admin/dashboard",
    },
    {
      name: "ข้อมูลการลงทะเบียน",
      href: "/admin/registrations",
      icon: Users,
      current: pathname === "/admin/registrations",
    },
  ]

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch("/api/auth/verify")
        if (response.ok) {
          const data = await response.json()
          setAdmin(data.admin)
        } else {
          router.push("/admin/login")
        }
      } catch (error) {
        router.push("/admin/login")
      } finally {
        setIsLoading(false)
      }
    }
    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    if (isLoggingOut) return

    const confirmLogout = confirm("คุณต้องการออกจากระบบหรือไม่?")
    if (!confirmLogout) return

    setIsLoggingOut(true)

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        localStorage.removeItem("admin-token")
        router.push("/admin/login")
      } else {
        console.error("Logout failed")
        alert("เกิดข้อผิดพลาดในการออกจากระบบ")
      }
    } catch (error) {
      console.error("Logout error:", error)
      alert("เกิดข้อผิดพลาดในการออกจากระบบ")
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex flex-col w-64 bg-white h-full">
            <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  CISA Admin
                </span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-500 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      item.current
                        ? "bg-blue-100 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center mb-3">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {admin?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {admin?.username}
                  </p>
                  <p className="text-xs text-gray-500">{admin?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              CISA Admin
            </span>
          </div>
          
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    item.current
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {admin?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {admin?.username}
                </p>
                <p className="text-xs text-gray-500">{admin?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isLoggingOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Home className="h-4 w-4 mr-2" />
                หน้าลงทะเบียน
              </Link>
              
              <div className="lg:hidden">
                <span className="text-sm text-gray-600">
                  {admin?.username}
                </span>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="ml-2 text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
                  title="ออกจากระบบ"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}