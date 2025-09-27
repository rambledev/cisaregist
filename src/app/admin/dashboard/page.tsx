"use client"

import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { 
  Users, 
  TrendingUp,
  Calendar,
  Building2,
  GraduationCap,
  Eye,
  BarChart3,
  ChevronRight,
  X
} from 'lucide-react'

interface DashboardStats {
  totalRegistrations: number
  academicPositionStats: Array<{ position: string; count: number }>
  facultyStats: Array<{ faculty: string; count: number }>
  recentRegistrations: Array<{
    id: string
    sequence: number
    firstNameTh: string
    lastNameTh: string
    faculty: string
    academicPosition: string
    createdAt: string
  }>
  monthlyStats: Array<{ month: Date; count: number }>
}

interface DetailedStats {
  faculty?: string
  position?: string
  registrations: Array<{
    id: string
    sequence: number
    firstNameTh: string
    lastNameTh: string
    faculty: string
    academicPosition: string
    department?: string
    createdAt: string
  }>
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDetail, setSelectedDetail] = useState<DetailedStats | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  const fetchDetailedStats = async (type: 'faculty' | 'position', value: string) => {
    setIsLoadingDetail(true)
    try {
      const response = await fetch(`/api/admin/stats/details?type=${type}&value=${encodeURIComponent(value)}`)
      if (response.ok) {
        const data = await response.json()
        setSelectedDetail(data)
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching detailed stats:', error)
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedDetail(null)
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            ภาพรวมข้อมูลการลงทะเบียน CISA
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      ผู้ลงทะเบียนทั้งหมด
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalRegistrations || 0} คน
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      จำนวนคณะที่เข้าร่วม
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.facultyStats?.length || 0} คณะ
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      การลงทะเบียนเดือนนี้
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.monthlyStats?.[0]?.count || 0} คน
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Academic Position Stats */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  จำนวนตามตำแหน่งวิชาการ
                </h3>
              </div>
              <div className="space-y-3">
                {stats?.academicPositionStats?.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors"
                    onClick={() => fetchDetailedStats('position', item.position)}
                  >
                    <span className="text-sm text-gray-600">{item.position}</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${stats.totalRegistrations ? (item.count / stats.totalRegistrations) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {item.count}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                ))}
                {isLoadingDetail && (
                  <div className="text-center text-sm text-gray-500">กำลังโหลด...</div>
                )}
              </div>
            </div>
          </div>

          {/* Faculty Stats */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Building2 className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  จำนวนตามคณะ (Top 5)
                </h3>
              </div>
              <div className="space-y-3">
                {stats?.facultyStats?.slice(0, 5).map((item, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded cursor-pointer transition-colors"
                    onClick={() => fetchDetailedStats('faculty', item.faculty)}
                  >
                    <span className="text-sm text-gray-600 truncate max-w-xs">
                      {item.faculty.replace('คณะ', '')}
                    </span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ 
                            width: `${stats.totalRegistrations ? (item.count / stats.totalRegistrations) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">
                        {item.count}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Stats */}
        {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-indigo-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">
                  สถิติการลงทะเบียนรายเดือน
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {stats.monthlyStats.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-xs text-gray-500 mb-1">
                      {new Date(item.month).toLocaleDateString('th-TH', { 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      {item.count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Registrations */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-purple-600 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">
                การลงทะเบียนล่าสุด
              </h3>
            </div>
          </div>
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ลำดับ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ชื่อ-นามสกุล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คณะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ตำแหน่ง
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่ลงทะเบียน
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats?.recentRegistrations?.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{registration.sequence}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.firstNameTh} {registration.lastNameTh}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {registration.faculty.replace('คณะ', '')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.academicPosition}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.createdAt).toLocaleDateString('th-TH')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!stats?.recentRegistrations?.length && (
              <div className="text-center py-8">
                <p className="text-gray-500">ยังไม่มีข้อมูลการลงทะเบียน</p>
              </div>
            )}
          </div>
          
          {stats?.recentRegistrations?.length ? (
            <div className="px-6 py-3 bg-gray-50 text-right">
              <a 
                href="/admin/registrations"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-end"
              >
                ดูทั้งหมด
                <Eye className="ml-1 h-4 w-4" />
              </a>
            </div>
          ) : null}
        </div>

        {/* Detail Modal */}
        {isModalOpen && selectedDetail && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  รายละเอียด{selectedDetail.faculty ? 'คณะ' : 'ตำแหน่งวิชาการ'}: {selectedDetail.faculty || selectedDetail.position}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  จำนวนผู้ลงทะเบียน: <span className="font-medium">{selectedDetail.registrations.length} คน</span>
                </p>
              </div>

              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ลำดับ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ชื่อ-นามสกุล
                      </th>
                      {selectedDetail.faculty && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ตำแหน่ง
                        </th>
                      )}
                      {selectedDetail.position && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          คณะ
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        วันที่ลงทะเบียน
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedDetail.registrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{registration.sequence}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {registration.firstNameTh} {registration.lastNameTh}
                        </td>
                        {selectedDetail.faculty && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {registration.academicPosition}
                          </td>
                        )}
                        {selectedDetail.position && (
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {registration.faculty.replace('คณะ', '')}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.createdAt).toLocaleDateString('th-TH')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}