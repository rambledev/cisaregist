"use client"

import { useState, useEffect } from 'react'
import AdminLayout from '../../components/AdminLayout'
import {
  Plus,
  Edit,
  Trash2,
  Search,
  X,
  Save,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Department {
  id: string
  code: string
  name: string
  degree: string
  duration: string | null
  specializations: string[]
  createdAt: string
  updatedAt: string
}

interface Faculty {
  id: string
  name: string
  departments: Department[]
  createdAt: string
  updatedAt: string
}

interface FacultyForm {
  name: string
}

interface DepartmentForm {
  facultyId: string
  code: string
  name: string
  degree: string
  duration: string
  specializations: string[]
}

export default function AdminFaculties() {
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaculties, setExpandedFaculties] = useState<Set<string>>(new Set())

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'faculty' | 'department'>('faculty')
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
  
  const [facultyForm, setFacultyForm] = useState<FacultyForm>({ name: '' })
  const [departmentForm, setDepartmentForm] = useState<DepartmentForm>({
    facultyId: '',
    code: '',
    name: '',
    degree: '',
    duration: '',
    specializations: []
  })
  const [specializationInput, setSpecializationInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchFaculties()
  }, [])

  const fetchFaculties = async () => {
    try {
      const response = await fetch('/api/faculties')
      const result = await response.json()
      
      if (result.success) {
        setFaculties(result.data)
      }
    } catch (error) {
      console.error('Error fetching faculties:', error)
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูล')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFaculty = (facultyId: string) => {
    const newExpanded = new Set(expandedFaculties)
    if (newExpanded.has(facultyId)) {
      newExpanded.delete(facultyId)
    } else {
      newExpanded.add(facultyId)
    }
    setExpandedFaculties(newExpanded)
  }

  const openFacultyModal = (mode: 'add' | 'edit', faculty?: Faculty) => {
    setModalType('faculty')
    setModalMode(mode)
    setSelectedFaculty(faculty || null)
    
    if (mode === 'add') {
      setFacultyForm({ name: '' })
    } else if (faculty) {
      setFacultyForm({ name: faculty.name })
    }
    
    setIsModalOpen(true)
  }

  const openDepartmentModal = (mode: 'add' | 'edit', faculty: Faculty, department?: Department) => {
    setModalType('department')
    setModalMode(mode)
    setSelectedFaculty(faculty)
    setSelectedDepartment(department || null)
    
    if (mode === 'add') {
      setDepartmentForm({
        facultyId: faculty.id,
        code: '',
        name: '',
        degree: '',
        duration: '',
        specializations: []
      })
    } else if (department) {
      setDepartmentForm({
        facultyId: faculty.id,
        code: department.code,
        name: department.name,
        degree: department.degree,
        duration: department.duration || '',
        specializations: department.specializations
      })
    }
    
    setSpecializationInput('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalType('faculty')
    setModalMode('add')
    setSelectedFaculty(null)
    setSelectedDepartment(null)
    setFacultyForm({ name: '' })
    setDepartmentForm({
      facultyId: '',
      code: '',
      name: '',
      degree: '',
      duration: '',
      specializations: []
    })
    setSpecializationInput('')
  }

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = modalMode === 'add' 
        ? '/api/admin/faculties'
        : `/api/admin/faculties/${selectedFaculty?.id}`
      
      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facultyForm)
      })

      if (response.ok) {
        await fetchFaculties()
        closeModal()
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    } catch (error) {
      console.error('Error saving faculty:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDepartmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = modalMode === 'add' 
        ? '/api/admin/departments'
        : `/api/admin/departments/${selectedDepartment?.id}`
      
      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(departmentForm)
      })

      if (response.ok) {
        await fetchFaculties()
        closeModal()
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
      }
    } catch (error) {
      console.error('Error saving department:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteFaculty = async (faculty: Faculty) => {
    if (!confirm(`คุณต้องการลบ ${faculty.name} และสาขาทั้งหมด (${faculty.departments.length} สาขา) หรือไม่?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/faculties/${faculty.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFaculties()
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการลบข้อมูล')
      }
    } catch (error) {
      console.error('Error deleting faculty:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const handleDeleteDepartment = async (department: Department) => {
    if (!confirm(`คุณต้องการลบ ${department.name} หรือไม่?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/departments/${department.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchFaculties()
      } else {
        const error = await response.json()
        alert(error.error || 'เกิดข้อผิดพลาดในการลบข้อมูล')
      }
    } catch (error) {
      console.error('Error deleting department:', error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ')
    }
  }

  const addSpecialization = () => {
    if (specializationInput.trim()) {
      setDepartmentForm(prev => ({
        ...prev,
        specializations: [...prev.specializations, specializationInput.trim()]
      }))
      setSpecializationInput('')
    }
  }

  const removeSpecialization = (index: number) => {
    setDepartmentForm(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  const filteredFaculties = faculties.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.departments.some(dept => 
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

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
            <h1 className="text-2xl font-bold text-gray-900">จัดการคณะและสาขาวิชา</h1>
            <p className="mt-1 text-sm text-gray-600">
              เพิ่ม แก้ไข ลบ ข้อมูลคณะและสาขาวิชา
            </p>
          </div>
          <button
            onClick={() => openFacultyModal('add')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            เพิ่มคณะใหม่
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="ค้นหาคณะ หรือ สาขาวิชา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">จำนวนคณะ</p>
                <p className="text-2xl font-bold text-gray-900">{faculties.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">จำนวนสาขาวิชา</p>
                <p className="text-2xl font-bold text-gray-900">
                  {faculties.reduce((sum, f) => sum + f.departments.length, 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">ค่าเฉลี่ยสาขาต่อคณะ</p>
                <p className="text-2xl font-bold text-gray-900">
                  {faculties.length > 0 
                    ? (faculties.reduce((sum, f) => sum + f.departments.length, 0) / faculties.length).toFixed(1)
                    : 0
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Faculties List */}
        <div className="space-y-4">
          {filteredFaculties.map((faculty) => (
            <div key={faculty.id} className="bg-white rounded-lg shadow">
              {/* Faculty Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleFaculty(faculty.id)}
                      className="mr-3 text-gray-500 hover:text-gray-700"
                    >
                      {expandedFaculties.has(faculty.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                    <Building2 className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {faculty.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {faculty.departments.length} สาขาวิชา
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openDepartmentModal('add', faculty)}
                      className="text-green-600 hover:text-green-800 p-2"
                      title="เพิ่มสาขาใหม่"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openFacultyModal('edit', faculty)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="แก้ไขคณะ"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaculty(faculty)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="ลบคณะ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Departments List */}
              {expandedFaculties.has(faculty.id) && (
                <div className="p-4">
                  {faculty.departments.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">
                      ยังไม่มีสาขาวิชา
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {faculty.departments.map((department) => (
                        <div
                          key={department.id}
                          className="flex justify-between items-start p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                        >
                          <div className="flex-1">
                            <div className="flex items-center">
                              <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                              <h4 className="font-medium text-gray-900">
                                {department.name}
                              </h4>
                            </div>
                            <div className="mt-1 text-sm text-gray-600 ml-6">
                              <p>รหัส: {department.code}</p>
                              <p>ปริญญา: {department.degree} 
                                {department.duration && ` (${department.duration})`}
                              </p>
                              {department.specializations.length > 0 && (
                                <p className="mt-1">
                                  แขนงวิชา: {department.specializations.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <button
                              onClick={() => openDepartmentModal('edit', faculty, department)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="แก้ไขสาขา"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteDepartment(department)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="ลบสาขา"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {filteredFaculties.length === 0 && (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-gray-500">ไม่พบข้อมูลที่ค้นหา</p>
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {modalType === 'faculty' ? (
                    modalMode === 'add' ? 'เพิ่มคณะใหม่' : 'แก้ไขข้อมูลคณะ'
                  ) : (
                    modalMode === 'add' ? 'เพิ่มสาขาวิชาใหม่' : 'แก้ไขข้อมูลสาขาวิชา'
                  )}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {modalType === 'faculty' ? (
                <form onSubmit={handleFacultySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อคณะ
                    </label>
                    <input
                      type="text"
                      value={facultyForm.name}
                      onChange={(e) => setFacultyForm({ name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="เช่น คณะครุศาสตร์"
                      required
                    />
                  </div>

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
                      {modalMode === 'add' ? 'เพิ่มคณะ' : 'บันทึกการแก้ไข'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleDepartmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        รหัสสาขา
                      </label>
                      <input
                        type="text"
                        value={departmentForm.code}
                        onChange={(e) => setDepartmentForm(prev => ({ ...prev, code: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น 25561561104808"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ปริญญา
                      </label>
                      <input
                        type="text"
                        value={departmentForm.degree}
                        onChange={(e) => setDepartmentForm(prev => ({ ...prev, degree: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น คบ., วทบ., บธ.บ."
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ชื่อสาขาวิชา
                    </label>
                    <input
                      type="text"
                      value={departmentForm.name}
                      onChange={(e) => setDepartmentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="เช่น สาขาวิชาคอมพิวเตอร์ศึกษา"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ระยะเวลา (ถ้ามี)
                    </label>
                    <input
                      type="text"
                      value={departmentForm.duration}
                      onChange={(e) => setDepartmentForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="เช่น 4ปี"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      แขนงวิชา/วิชาเอก (ถ้ามี)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={specializationInput}
                        onChange={(e) => setSpecializationInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSpecialization()
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="เช่น แขนงดนตรีตะวันตก"
                      />
                      <button
                        type="button"
                        onClick={addSpecialization}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                      >
                        เพิ่ม
                      </button>
                    </div>
                    {departmentForm.specializations.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {departmentForm.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {spec}
                            <button
                              type="button"
                              onClick={() => removeSpecialization(index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

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
                      {modalMode === 'add' ? 'เพิ่มสาขา' : 'บันทึกการแก้ไข'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}