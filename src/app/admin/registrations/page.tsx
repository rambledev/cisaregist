"use client"

import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { roles } from '@/lib/types'
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  Eye,
  AlertCircle
} from 'lucide-react'

interface Registration {
  id: string
  sequence: number
  firstNameTh: string
  lastNameTh: string
  firstNameEn: string
  lastNameEn: string
  email: string
  phoneNumber: string
  faculty: string
  department: string
  academicPosition: string
  administrativePosition?: string
  role: string
  role2: string
  nationalId: string
  prefix: string
  status: string
  createdAt: string
  updatedAt: string
}

interface RegistrationForm {
  firstNameTh: string
  lastNameTh: string
  firstNameEn: string
  lastNameEn: string
  email: string
  phoneNumber: string
  faculty: string
  department: string
  academicPosition: string
  administrativePosition: string
  role: string
  role2: string
  nationalId: string
  prefix: string
}

interface Department {
  id: string
  code: string
  name: string
  degree: string
  duration: string | null
  specializations: string[]
}

interface Faculty {
  id: string
  name: string
  departments: Department[]
}

const initialFormData: RegistrationForm = {
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  email: '',
  phoneNumber: '',
  faculty: '',
  department: '',
  academicPosition: '',
  administrativePosition: '',
  role: '',
  role2: '',
  nationalId: '',
  prefix: ''
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [formData, setFormData] = useState<RegistrationForm>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Faculties and roles for filters
  const [faculties, setFaculties] = useState<string[]>([])
  const [rolesList, setRolesList] = useState<string[]>([])

  // Faculty and Department data from database
  const [facultiesData, setFacultiesData] = useState<Faculty[]>([])
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('')
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([])
  const [showDepartmentWarning, setShowDepartmentWarning] = useState(false)
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(false)

  useEffect(() => {
    fetchRegistrations()
    fetchFacultiesData()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, selectedFaculty, selectedRole])

  const fetchFacultiesData = async () => {
    try {
      setIsLoadingFaculties(true)
      const response = await fetch('/api/faculties')
      const result = await response.json()
      
      if (result.success) {
        setFacultiesData(result.data)
      }
    } catch (error) {
      console.error('Error fetching faculties:', error)
    } finally {
      setIsLoadingFaculties(false)
    }
  }

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/registrations')
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched registrations:', data.registrations) // Debug log
        setRegistrations(data.registrations || [])
        
        // Extract unique faculties and roles for filters
        const uniqueFaculties = [...new Set(data.registrations?.map((r: Registration) => r.faculty).filter(Boolean) || [])] as string[]
        const uniqueRoles = [...new Set(data.registrations?.map((r: Registration) => r.role).filter(Boolean) || [])] as string[]
        setFaculties(uniqueFaculties)
        setRolesList(uniqueRoles)
      }
    } catch (error) {
      console.error('Error fetching registrations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRegistrations = () => {
    let filtered = [...registrations]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reg => 
        reg.firstNameTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.lastNameTh.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.nationalId.includes(searchTerm)
      )
    }

    // Faculty filter
    if (selectedFaculty) {
      filtered = filtered.filter(reg => reg.faculty === selectedFaculty)
    }

    // Role filter
    if (selectedRole) {
      filtered = filtered.filter(reg => reg.role === selectedRole)
    }

    setFilteredRegistrations(filtered)
  }

  const handleStatusToggle = async (registration: Registration) => {
    const newStatus = registration.status === 'active' ? 'inactive' : 'active'
    
    try {
      const response = await fetch(`/api/registrations/${registration.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await fetchRegistrations()
      } else {
        console.error('Failed to update status')
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ')
      }
    } catch (error) {
      console.error('Error updating status:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const openModal = (mode: 'add' | 'edit' | 'view', registration?: Registration) => {
    setModalMode(mode)
    setSelectedRegistration(registration || null)
    
    if (mode === 'add') {
      setFormData(initialFormData)
      setSelectedFacultyId('')
      setAvailableDepartments([])
      setShowDepartmentWarning(false)
    } else if (registration) {
      // Debug: log registration data
      console.log('Registration data:', registration)
      console.log('Role2 value:', registration.role2)
      
      setFormData({
        firstNameTh: registration.firstNameTh,
        lastNameTh: registration.lastNameTh,
        firstNameEn: registration.firstNameEn,
        lastNameEn: registration.lastNameEn,
        email: registration.email,
        phoneNumber: registration.phoneNumber,
        faculty: registration.faculty,
        department: registration.department,
        academicPosition: registration.academicPosition,
        administrativePosition: registration.administrativePosition || '',
        role: registration.role,
        role2: registration.role2 || '',
        nationalId: registration.nationalId,
        prefix: registration.prefix
      })

      // หา faculty id และตั้งค่า departments
      const faculty = facultiesData.find(f => f.name === registration.faculty)
      if (faculty) {
        setSelectedFacultyId(faculty.id)
        setAvailableDepartments(faculty.departments)
      }
    }
    
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRegistration(null)
    setFormData(initialFormData)
    setSelectedFacultyId('')
    setAvailableDepartments([])
    setShowDepartmentWarning(false)
  }

  const handleFacultyChange = (facultyId: string) => {
    setSelectedFacultyId(facultyId)
    setShowDepartmentWarning(false)
    
    const faculty = facultiesData.find(f => f.id === facultyId)
    if (faculty) {
      setAvailableDepartments(faculty.departments)
      setFormData(prev => ({
        ...prev,
        faculty: faculty.name,
        department: '' // Reset department เมื่อเปลี่ยนคณะ
      }))
    } else {
      setAvailableDepartments([])
    }
  }

  const handleDepartmentClick = () => {
    if (!selectedFacultyId) {
      setShowDepartmentWarning(true)
      setTimeout(() => setShowDepartmentWarning(false), 3000)
    }
  }

  const handleDepartmentChange = (departmentId: string) => {
    const department = availableDepartments.find(d => d.id === departmentId)
    if (department) {
      setFormData(prev => ({
        ...prev,
        department: department.name
      }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = modalMode === 'add' 
        ? '/api/admin/registrations'
        : `/api/admin/registrations/${selectedRegistration?.id}`
      
      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchRegistrations()
        closeModal()
      } else {
        console.error('Failed to save registration')
        alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    } catch (error) {
      console.error('Error saving registration:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (registration: Registration) => {
    if (!confirm(`คุณต้องการลบข้อมูลของ ${registration.firstNameTh} ${registration.lastNameTh} หรือไม่?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/registrations/${registration.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchRegistrations()
      } else {
        console.error('Failed to delete registration')
        alert('เกิดข้อผิดพลาดในการลบข้อมูล')
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">จัดการข้อมูลการลงทะเบียน</h1>
            <p className="mt-1 text-sm text-gray-600">
              เพิ่ม แก้ไข ลบ ข้อมูลผู้ลงทะเบียน CISA
            </p>
          </div>
          <button
            onClick={() => openModal('add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มข้อมูลใหม่
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, อีเมล, เลขบัตรประชาชน..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Faculty Filter */}
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกคณะ</option>
              {faculties.map(faculty => (
                <option key={faculty} value={faculty}>
                  {faculty.replace('คณะ', '')}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกบทบาท</option>
              {rolesList.map(role => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedFaculty('')
                setSelectedRole('')
              }}
              className="px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              ล้างตัวกรอง
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            แสดง {filteredRegistrations.length} จาก {registrations.length} รายการ
          </p>
        </div>

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
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
                    อีเมล
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    คณะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สิทธิ์การใช้งาน
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    วันที่ลงทะเบียน
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    จัดการ
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRegistrations.map((registration) => (
                  <tr key={registration.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{registration.sequence}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {registration.prefix} {registration.firstNameTh} {registration.lastNameTh}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {registration.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {registration.faculty.replace('คณะ', '')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate" title={registration.role}>
                        {registration.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleStatusToggle(registration)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          registration.status === 'active' ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                        title={registration.status === 'active' ? 'คลิกเพื่อปิดการใช้งาน' : 'คลิกเพื่อเปิดการใช้งาน'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            registration.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      <div className="mt-1 text-xs text-gray-500">
                        {registration.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(registration.createdAt).toLocaleDateString('th-TH')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => openModal('view', registration)}
                          className="text-blue-600 hover:text-blue-800"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', registration)}
                          className="text-green-600 hover:text-green-800"
                          title="แก้ไข"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(registration)}
                          className="text-red-600 hover:text-red-800"
                          title="ลบ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบข้อมูลการลงทะเบียน</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalMode === 'add' && 'เพิ่มข้อมูลการลงทะเบียน'}
                  {modalMode === 'edit' && 'แก้ไขข้อมูลการลงทะเบียน'}
                  {modalMode === 'view' && 'รายละเอียดการลงทะเบียน'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Department Warning */}
              {showDepartmentWarning && modalMode !== 'view' && (
                <div className="mb-4 p-3 rounded-lg flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm">กรุณาเลือกคณะก่อน</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* คำนำหน้า */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คำนำหน้า
                    </label>
                    <select
                      name="prefix"
                      value={formData.prefix}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    >
                      <option value="">เลือกคำนำหน้า</option>
                      <option value="นาย">นาย</option>
                      <option value="นางสาว">นางสาว</option>
                      <option value="นาง">นาง</option>
                      <option value="ดร.">ดร.</option>
                      <option value="ศ.ดร.">ศ.ดร.</option>
                      <option value="รศ.ดร.">รศ.ดร.</option>
                      <option value="ผศ.ดร.">ผศ.ดร.</option>
                    </select>
                  </div>

                  {/* ชื่อ (ไทย) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ (ไทย)
                    </label>
                    <input
                      type="text"
                      name="firstNameTh"
                      value={formData.firstNameTh}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* นามสกุล (ไทย) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล (ไทย)
                    </label>
                    <input
                      type="text"
                      name="lastNameTh"
                      value={formData.lastNameTh}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* ชื่อ (อังกฤษ) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อ (อังกฤษ)
                    </label>
                    <input
                      type="text"
                      name="firstNameEn"
                      value={formData.firstNameEn}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* นามสกุล (อังกฤษ) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      นามสกุล (อังกฤษ)
                    </label>
                    <input
                      type="text"
                      name="lastNameEn"
                      value={formData.lastNameEn}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* อีเมล */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* เบอร์โทร */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เบอร์โทรศัพท์
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* เลขบัตรประชาชน */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      เลขบัตรประชาชน
                    </label>
                    <input
                      type="text"
                      name="nationalId"
                      value={formData.nationalId}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                      maxLength={13}
                    />
                  </div>

                  {/* คณะ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คณะ
                    </label>
                    {modalMode === 'view' ? (
                      <input
                        type="text"
                        value={formData.faculty}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    ) : (
                      <select
                        value={selectedFacultyId}
                        onChange={(e) => handleFacultyChange(e.target.value)}
                        disabled={isLoadingFaculties}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">
                          {isLoadingFaculties ? "กำลังโหลด..." : "เลือกคณะ"}
                        </option>
                        {facultiesData.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* สาขาวิชา */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สาขาวิชา
                    </label>
                    {modalMode === 'view' ? (
                      <input
                        type="text"
                        value={formData.department}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    ) : (
                      <>
                        <select
                          value={availableDepartments.find(d => d.name === formData.department)?.id || ''}
                          onChange={(e) => handleDepartmentChange(e.target.value)}
                          disabled={!selectedFacultyId || availableDepartments.length === 0}
                          onClick={handleDepartmentClick}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed"
                          required
                        >
                          <option value="">
                            {!selectedFacultyId 
                              ? "เลือกคณะก่อน" 
                              : availableDepartments.length === 0
                              ? "ไม่มีสาขาในคณะนี้"
                              : "เลือกสาขาวิชา"}
                          </option>
                          {availableDepartments.map((department) => (
                            <option key={department.id} value={department.id}>
                              {department.name} ({department.degree})
                            </option>
                          ))}
                        </select>
                        {selectedFacultyId && availableDepartments.length > 0 && (
                          <p className="mt-1 text-xs text-gray-500">
                            มี {availableDepartments.length} สาขาในคณะนี้
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* ตำแหน่งวิชาการ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ตำแหน่งวิชาการ
                    </label>
                    <select
                      name="academicPosition"
                      value={formData.academicPosition}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    >
                      <option value="">เลือกตำแหน่งวิชาการ</option>
                      <option value="อาจารย์">อาจารย์</option>
                      <option value="ผู้ช่วยศาสตราจารย์">ผู้ช่วยศาสตราจารย์</option>
                      <option value="รองศาสตราจารย์">รองศาสตราจารย์</option>
                      <option value="ศาสตราจารย์">ศาสตราจารย์</option>
                    </select>
                  </div>

                  {/* ตำแหน่งบริหาร */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ตำแหน่งบริหาร (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      name="administrativePosition"
                      value={formData.administrativePosition}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="เช่น ประธานหลักสูตร, รองคณบดี, คณบดี"
                    />
                  </div>

                  {/* สิทธิ์ในการใช้งานระบบ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สิทธิ์ในการใช้งานระบบ
                    </label>
                    {modalMode === 'view' ? (
                      <input
                        type="text"
                        value={roles.find(r => r.value === formData.role)?.label || formData.role}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    ) : (
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">เลือกบทบาท</option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* สิทธิ์ในการใช้งานระบบ (บทบาทที่ 2) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      สิทธิ์ในการใช้งานระบบ (บทบาทที่ 2)
                    </label>
                    {modalMode === 'view' ? (
                      <input
                        type="text"
                        value={
                          formData.role2 
                            ? (roles.find(r => r.value === formData.role2)?.label || formData.role2) 
                            : 'ไม่มี'
                        }
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                      />
                    ) : (
                      <select
                        name="role2"
                        value={formData.role2 || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">เลือกบทบาทที่ 2 (ถ้ามี)</option>
                        {roles.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                </div>

                {/* Form Actions */}
                {modalMode !== 'view' && (
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {modalMode === 'add' ? 'เพิ่มข้อมูล' : 'บันทึกการแก้ไข'}
                    </button>
                  </div>
                )}

                {modalMode === 'view' && (
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                    >
                      ปิด
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}