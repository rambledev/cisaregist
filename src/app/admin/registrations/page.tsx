"use client"

import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import { 
  Users, 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  X,
  Save,
  Eye
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
  nationalId: string
  prefix: string
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
  nationalId: '',
  prefix: ''
}

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [selectedPosition, setSelectedPosition] = useState('')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'view'>('add')
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null)
  const [formData, setFormData] = useState<RegistrationForm>(initialFormData)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Faculties and positions for filters
  const [faculties, setFaculties] = useState<string[]>([])
  const [positions, setPositions] = useState<string[]>([])

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    filterRegistrations()
  }, [registrations, searchTerm, selectedFaculty, selectedPosition])

  const fetchRegistrations = async () => {
    try {
      const response = await fetch('/api/admin/registrations')
      if (response.ok) {
        const data = await response.json()
        setRegistrations(data.registrations || [])
        
        // Extract unique faculties and positions for filters
        const uniqueFaculties = [...new Set(data.registrations?.map((r: Registration) => r.faculty).filter(Boolean) || [])] as string[]
        const uniquePositions = [...new Set(data.registrations?.map((r: Registration) => r.academicPosition).filter(Boolean) || [])] as string[]
        setFaculties(uniqueFaculties)
        setPositions(uniquePositions)
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

    // Position filter
    if (selectedPosition) {
      filtered = filtered.filter(reg => reg.academicPosition === selectedPosition)
    }

    setFilteredRegistrations(filtered)
  }

  const openModal = (mode: 'add' | 'edit' | 'view', registration?: Registration) => {
    setModalMode(mode)
    setSelectedRegistration(registration || null)
    
    if (mode === 'add') {
      setFormData(initialFormData)
    } else if (registration) {
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
        nationalId: registration.nationalId,
        prefix: registration.prefix
      })
    }
    
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRegistration(null)
    setFormData(initialFormData)
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
      }
    } catch (error) {
      console.error('Error saving registration:', error)
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
      }
    } catch (error) {
      console.error('Error deleting registration:', error)
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

            {/* Position Filter */}
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">ทุกตำแหน่ง</option>
              {positions.map(position => (
                <option key={position} value={position}>
                  {position}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedFaculty('')
                setSelectedPosition('')
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
                  ตำแหน่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  วันที่ลงทะเบียน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {registration.academicPosition}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(registration.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
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
                    />
                  </div>

                  {/* คณะ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      คณะ
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
                  </div>

                  {/* ภาควิชา/สาขา */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ภาควิชา/สาขา
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      disabled={modalMode === 'view'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      required
                    />
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
                      <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                      <option value="นักศึกษา">นักศึกษา</option>
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
                      placeholder="เช่น คณบดี หัวหน้าภาควิชา"
                    />
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