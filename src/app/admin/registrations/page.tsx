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
  AlertCircle,
  Download
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

interface ExportColumn {
  id: string
  label: string
  selected: boolean
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

// เพิ่มฟังก์ชันนี้ก่อน return statement ของ component
const getRegistrationValue = (registration: Registration, key: string): string => {
  switch (key) {
    case 'sequence':
      return registration.sequence?.toString() || '';
    case 'prefix':
      return registration.prefix || '';
    case 'firstNameTh':
      return registration.firstNameTh || '';
    case 'lastNameTh':
      return registration.lastNameTh || '';
    case 'firstNameEn':
      return registration.firstNameEn || '';
    case 'lastNameEn':
      return registration.lastNameEn || '';
    case 'nationalId':
      return registration.nationalId || '';
    case 'email':
      return registration.email || '';
    case 'phoneNumber':
      return registration.phoneNumber || '';
    case 'faculty':
      return registration.faculty || '';
    case 'department':
      return registration.department || '';
    case 'academicPosition':
      return registration.academicPosition || '';
    case 'administrativePosition':
      return registration.administrativePosition || '';
    case 'role':
      return registration.role || '';
    case 'role2':
      return registration.role2 || '';
    case 'status':
      return registration.status || '';
    case 'createdAt':
      return registration.createdAt ? new Date(registration.createdAt).toLocaleDateString('th-TH') : '';
    default:
      return '';
  }
};

const defaultExportColumns: ExportColumn[] = [
  { id: 'sequence', label: 'ลำดับ', selected: true },
  { id: 'prefix', label: 'คำนำหน้า', selected: true },
  { id: 'firstNameTh', label: 'ชื่อ (ไทย)', selected: true },
  { id: 'lastNameTh', label: 'นามสกุล (ไทย)', selected: true },
  { id: 'firstNameEn', label: 'ชื่อ (อังกฤษ)', selected: true },
  { id: 'lastNameEn', label: 'นามสกุล (อังกฤษ)', selected: true },
  { id: 'nationalId', label: 'เลขบัตรประชาชน', selected: true },
  { id: 'email', label: 'อีเมล', selected: true },
  { id: 'phoneNumber', label: 'เบอร์โทรศัพท์', selected: true },
  { id: 'faculty', label: 'คณะ', selected: true },
  { id: 'department', label: 'สาขาวิชา', selected: true },
  { id: 'academicPosition', label: 'ตำแหน่งวิชาการ', selected: true },
  { id: 'administrativePosition', label: 'ตำแหน่งบริหาร', selected: true },
  { id: 'role', label: 'บทบาท', selected: true },
  { id: 'role2', label: 'บทบาทที่ 2', selected: true },
  { id: 'status', label: 'สถานะ', selected: true },
  { id: 'createdAt', label: 'วันที่ลงทะเบียน', selected: true },
]

const exportToCSV = (
  data: any[],
  columns: ExportColumn[],
  fileName: string = 'export.csv'
) => {
  try {
    const selectedColumns = columns.filter(col => col.selected);
    
    if (selectedColumns.length === 0) {
      throw new Error('ไม่มีคอลัมน์ถูกเลือกสำหรับการ export');
    }

    // Function to format values
    const formatValue = (value: any, columnId: string) => {
      if (value === null || value === undefined || value === '') {
        return '';
      }

      // Format nationalId to prevent scientific notation
      if (columnId === 'nationalId') {
        // Ensure it's treated as text by adding tab character at the beginning
        return `\t"${String(value)}"`;
      }

      // Format date
      if (columnId === 'createdAt' || columnId === 'updatedAt') {
        try {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            // Format to dd/mm/YYYY
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            return `"${day}/${month}/${year}"`;
          }
        } catch (error) {
          console.error('Error formatting date:', error);
        }
        return `"${String(value)}"`;
      }

      // For other columns, escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    };

    // Create headers
    const headers = selectedColumns.map(col => `"${col.label}"`).join(',');
    
    // Create rows with formatted values
    const rows = data.map(item => 
      selectedColumns.map(col => {
        return formatValue(item[col.id], col.id);
      }).join(',')
    );

    // Combine headers and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}_${new Date().getTime()}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

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

  // States สำหรับ export
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>(defaultExportColumns)
  const [fileName, setFileName] = useState('admin_registrations')

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

  // ฟังก์ชันสำหรับ Export CSV
  const handleOpenExportModal = () => {
    setShowExportModal(true)
  }

  const handleCloseExportModal = () => {
    setShowExportModal(false)
    setIsExporting(false)
  }

  const toggleColumnSelection = (columnId: string) => {
    setExportColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, selected: !col.selected } : col
      )
    )
  }

  const toggleAllColumns = (selected: boolean) => {
    setExportColumns(prev => 
      prev.map(col => ({ ...col, selected }))
    )
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const selectedCount = exportColumns.filter(col => col.selected).length
      if (selectedCount === 0) {
        alert('กรุณาเลือกอย่างน้อย 1 คอลัมน์')
        return
      }

      await exportToCSV(
        filteredRegistrations,
        exportColumns,
        fileName
      )

      alert('Export ข้อมูลเป็น CSV สำเร็จ')
      handleCloseExportModal()
    } catch (error: any) {
      alert(`Export ล้มเหลว: ${error.message}`)
    } finally {
      setIsExporting(false)
    }
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

        {/* Table Header with Export Button */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Table Header with Export Button */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-white">
                  รายการลงทะเบียน ({filteredRegistrations.length} รายการ)
                </h2>
              </div>
              
              {/* Export Button - ด้านซ้ายใน mobile, ด้านขวาใน desktop */}
              <div className="flex justify-start sm:justify-end">
                <button
                  type="button"
                  onClick={handleOpenExportModal}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors shadow-sm font-medium text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table Content */}
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

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Export ข้อมูลเป็น CSV</h3>
                  <button
                    onClick={handleCloseExportModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* File Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อไฟล์
                  </label>
                  <input
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ชื่อไฟล์"
                  />
                </div>

                {/* Column Selection */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      เลือกคอลัมน์ที่ต้องการ export
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAllColumns(true)}
                        className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                      >
                        เลือกทั้งหมด
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleAllColumns(false)}
                        className="text-xs px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                      >
                        ยกเลิกทั้งหมด
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-60 overflow-y-auto p-3 border border-gray-200 rounded-md bg-gray-50">
                    {exportColumns.map((column) => (
                      <div key={column.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`col-${column.id}`}
                          checked={column.selected}
                          onChange={() => toggleColumnSelection(column.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`col-${column.id}`}
                          className="ml-2 text-sm text-gray-700 cursor-pointer"
                        >
                          {column.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-500">
                    เลือกแล้ว {exportColumns.filter(col => col.selected).length} จาก {exportColumns.length} คอลัมน์
                  </p>
                </div>

                {/* Data Preview */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตัวอย่างข้อมูล ({filteredRegistrations.length} รายการ)
                  </label>
                  <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto bg-white">
                    {filteredRegistrations.length > 0 ? (
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="bg-gray-50">
                            {exportColumns
                              .filter(col => col.selected)
                              .slice(0, 3) // แสดงแค่ 3 คอลัมน์แรกใน preview
                              .map(col => (
                                <th key={col.id} className="px-2 py-1 text-left font-medium text-gray-700 border-b">
                                  {col.label}
                                </th>
                              ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRegistrations.slice(0, 3).map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0">
                              {exportColumns
  .filter(col => col.selected)
  .slice(0, 3)
  .map(col => (
    <td key={col.id} className="px-2 py-1">
      {getRegistrationValue(item, col.id) || '-'}
    </td>
  ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-gray-500 text-center py-2">ไม่มีข้อมูล</p>
                    )}
                  </div>
                </div>

                {/* CSV Format Info */}
                <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700">
                    <strong>รูปแบบไฟล์ CSV:</strong> ไฟล์จะถูกบันทึกในรูปแบบ CSV ที่สามารถเปิดด้วย Excel, Google Sheets, หรือโปรแกรม spreadsheet อื่นๆ ได้
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseExportModal}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExporting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        กำลัง Export...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Export CSV
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Existing Modal for Add/Edit/View */}
        {isModalOpen && (
          // ... existing modal code remains the same ...
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            {/* ... existing modal content ... */}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}