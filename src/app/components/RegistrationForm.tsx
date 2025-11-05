"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  RegistrationFormData, 
  registrationSchema,
  prefixOptions,
  academicPositions,
  roles,
  consentText
} from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  X
} from 'lucide-react'

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

    // Create headers
    const headers = selectedColumns.map(col => `"${col.label}"`).join(',');
    
    // Create rows
    const rows = data.map(item => 
      selectedColumns.map(col => {
        const value = item[col.id] || '';
        // Escape quotes and wrap in quotes
        return `"${String(value).replace(/"/g, '""')}"`;
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

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [selectedRole2, setSelectedRole2] = useState<string>('');
  
  // States สำหรับคณะและสาขา
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<string>('')
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([])
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(true)
  const [showDepartmentWarning, setShowDepartmentWarning] = useState(false)

  // States สำหรับ export
  const [showExportModal, setShowExportModal] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportColumns, setExportColumns] = useState<ExportColumn[]>(defaultExportColumns)
  const [exportData, setExportData] = useState<any[]>([])
  const [fileName, setFileName] = useState('registration_data')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      consentGiven: false,
      role2: null
    }
  })

  // Watch form values
  const consentGiven = watch('consentGiven')
  const role1Value = watch('role')
  const role2Value = watch('role2')

  // ดึงข้อมูลคณะเมื่อ component mount
  useEffect(() => {
    fetchFaculties()
  }, [])

  // Filter available roles for role2 (ไม่ให้ซ้ำกับ role1)
  const availableRole2Options = roles.filter(role => role.value !== role1Value)

  const fetchFaculties = async () => {
    try {
      setIsLoadingFaculties(true)
      const response = await fetch('/api/faculties')
      const result = await response.json()
      
      if (result.success) {
        setFaculties(result.data)
      } else {
        setSubmitStatus({
          type: 'error',
          message: 'ไม่สามารถโหลดข้อมูลคณะได้'
        })
      }
    } catch (error) {
      console.error('Error fetching faculties:', error)
      setSubmitStatus({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการโหลดข้อมูลคณะ'
      })
    } finally {
      setIsLoadingFaculties(false)
    }
  }

  // ฟังก์ชันดึงข้อมูลสำหรับ export
  const fetchExportData = async () => {
    try {
      const response = await fetch('/api/registrations')
      const result = await response.json()
      
      if (result.success) {
        setExportData(result.data)
      } else {
        throw new Error('ไม่สามารถดึงข้อมูลได้')
      }
    } catch (error) {
      console.error('Error fetching export data:', error)
      setSubmitStatus({
        type: 'error',
        message: 'ไม่สามารถดึงข้อมูลสำหรับ export'
      })
    }
  }

  // เปิด modal export
  const handleOpenExportModal = async () => {
    setShowExportModal(true)
    await fetchExportData()
  }

  // ปิด modal export
  const handleCloseExportModal = () => {
    setShowExportModal(false)
    setIsExporting(false)
  }

  // toggle การเลือกคอลัมน์
  const toggleColumnSelection = (columnId: string) => {
    setExportColumns(prev => 
      prev.map(col => 
        col.id === columnId ? { ...col, selected: !col.selected } : col
      )
    )
  }

  // Select all / Deselect all
  const toggleAllColumns = (selected: boolean) => {
    setExportColumns(prev => 
      prev.map(col => ({ ...col, selected }))
    )
  }

  // ฟังก์ชัน export CSV
  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const selectedCount = exportColumns.filter(col => col.selected).length
      if (selectedCount === 0) {
        setSubmitStatus({
          type: 'error',
          message: 'กรุณาเลือกอย่างน้อย 1 คอลัมน์'
        })
        return
      }

      await exportToCSV(
        exportData,
        exportColumns,
        fileName
      )

      setSubmitStatus({
        type: 'success',
        message: 'Export ข้อมูลเป็น CSV สำเร็จ'
      })
      
      handleCloseExportModal()
    } catch (error: any) {
      setSubmitStatus({
        type: 'error',
        message: `Export ล้มเหลว: ${error.message}`
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFacultyChange = (facultyId: string) => {
    setSelectedFaculty(facultyId)
    setShowDepartmentWarning(false)
    
    // หาคณะที่เลือกและดึงสาขาของคณะนั้น
    const faculty = faculties.find(f => f.id === facultyId)
    if (faculty) {
      setAvailableDepartments(faculty.departments)
      setValue('faculty', faculty.name)
    } else {
      setAvailableDepartments([])
    }
    
    // Reset department เมื่อเปลี่ยนคณะ
    setValue('department', '')
  }

  const handleDepartmentClick = () => {
    if (!selectedFaculty) {
      setShowDepartmentWarning(true)
      setTimeout(() => setShowDepartmentWarning(false), 3000)
    }
  }

  const handleDepartmentChange = (departmentId: string) => {
    const department = availableDepartments.find(d => d.id === departmentId)
    if (department) {
      setValue('department', department.name)
    }
  }

  const onSubmit = async (data: RegistrationFormData) => {
    console.log('=== Form Submit Started ===')
    console.log('Form data:', data)
    
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      console.log('Sending POST to /api/registrations...')
      
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)
      
      const result = await response.json()
      console.log('Response body:', result)

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: `ลงทะเบียนสำเร็จ! หมายเลขลำดับของคุณคือ ${result.data.sequence}`
        })
        reset()
        setSelectedRole('')
        setSelectedRole2('')
        setSelectedFaculty('')
        setAvailableDepartments([])
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'เกิดข้อผิดพลาดในการลงทะเบียน'
        })
      }
    } catch (error) {
      console.error('=== Submit Error ===')
      console.error('Error:', error)
      setSubmitStatus({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
      })
    } finally {
      console.log('=== Form Submit Ended ===')
      setIsSubmitting(false)
    }
  }

  const handleRoleChange = (value: string) => {
    setSelectedRole(value)
    setValue('role', value as RegistrationFormData['role'])
    
    // ถ้า role2 ซ้ำกับ role1 ที่เลือกใหม่ ให้ clear role2
    if (value === role2Value) {
      setSelectedRole2('')
      setValue('role2', null)
    }
  }

  const handleRole2Change = (value: string) => {
    setSelectedRole2(value)
    setValue('role2', value as RegistrationFormData['role2'])
  }

  const clearRole2 = () => {
    setSelectedRole2('')
    setValue('role2', null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="bg-gradient-to-r from-blue-50 via-white to-blue-50 p-8 rounded-2xl shadow-md border border-gray-200">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img 
                src="/100.png" 
                alt="มหาวิทยาลัยราชภัฏมหาสารคาม Logo" 
                className="h-24 md:h-32 lg:h-40 w-auto object-contain"
              />
            </div>

            <h1 className="text-2xl md:text-2xl font-extrabold text-blue-800 mb-3">
              ระบบลงทะเบียนเข้าใช้ระบบสารสนเทศฐานข้อมูลหลักสูตร (CISA) 
            </h1>
            <h2 className="text-lg md:text-xl font-semibold text-gray-700 mb-4">
              มหาวิทยาลัยราชภัฏมหาสารคาม
            </h2>
            <p className="text-gray-600 text-sm md:text-base">
              กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง
            </p>
          </div>
        </div>

        {/* Status Message */}
        {submitStatus.type && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            submitStatus.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {submitStatus.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <p>{submitStatus.message}</p>
          </div>
        )}

        {/* Department Warning */}
        {showDepartmentWarning && (
          <div className="mb-6 p-4 rounded-lg flex items-center gap-3 bg-yellow-50 border border-yellow-200 text-yellow-800">
            <AlertCircle className="h-5 w-5" />
            <p>กรุณาเลือกคณะก่อน</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Form Header with Export Button */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <h2 className="text-xl font-bold text-white">
                  แบบฟอร์มลงทะเบียน
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

          {/* Form Content */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* ส่วนข้อมูลส่วนตัว */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  ข้อมูลส่วนตัว
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* คำนำหน้า */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คำนำหน้า <span className="text-red-500">*</span>
                    </label>
                    <Select onValueChange={(value) => setValue('prefix', value as RegistrationFormData['prefix'])}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกคำนำหน้า" />
                      </SelectTrigger>
                      <SelectContent>
                        {prefixOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.prefix && (
                      <p className="mt-1 text-sm text-red-600">{errors.prefix.message}</p>
                    )}
                  </div>

                  {/* ชื่อ (ไทย) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('firstNameTh')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ชื่อ"
                    />
                    {errors.firstNameTh && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstNameTh.message}</p>
                    )}
                  </div>

                  {/* นามสกุล (ไทย) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล (ภาษาไทย) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('lastNameTh')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="นามสกุล"
                    />
                    {errors.lastNameTh && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastNameTh.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* ชื่อ (อังกฤษ) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('firstNameEn')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="First Name"
                    />
                    {errors.firstNameEn && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstNameEn.message}</p>
                    )}
                  </div>

                  {/* นามสกุล (อังกฤษ) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล (ภาษาอังกฤษ) <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('lastNameEn')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Last Name"
                    />
                    {errors.lastNameEn && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastNameEn.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  {/* เลขบัตรประชาชน */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เลขบัตรประชาชน <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('nationalId')}
                      type="text"
                      maxLength={13}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234567890123"
                    />
                    {errors.nationalId && (
                      <p className="mt-1 text-sm text-red-600">{errors.nationalId.message}</p>
                    )}
                  </div>

                  {/* อีเมล */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="example@university.ac.th"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>

                  {/* เบอร์โทร */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทรศัพท์ <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register('phoneNumber')}
                      type="tel"
                      maxLength={10}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0812345678"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ส่วนข้อมูลสังกัด */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  ข้อมูลสังกัด
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* คณะ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      คณะ/หน่วยงาน <span className="text-red-500">*</span>
                    </label>
                    <Select 
                      onValueChange={handleFacultyChange}
                      disabled={isLoadingFaculties}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingFaculties ? "กำลังโหลด..." : "เลือกคณะ"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {faculties.map((faculty) => (
                          <SelectItem key={faculty.id} value={faculty.id}>
                            {faculty.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.faculty && (
                      <p className="mt-1 text-sm text-red-600">{errors.faculty.message}</p>
                    )}
                  </div>

                  {/* สาขาวิชา */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      สาขาวิชา/ฝ่าย (ถ้าเป็นเจ้าหน้าที่สังกัดคณะไม่ต้องเลือก)
                    </label>
                    <Select 
                      onValueChange={handleDepartmentChange}
                      disabled={!selectedFaculty || availableDepartments.length === 0}
                      onOpenChange={(open) => {
                        if (open) handleDepartmentClick()
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedFaculty 
                            ? "เลือกคณะก่อน" 
                            : availableDepartments.length === 0
                            ? "ไม่มีสาขาในคณะนี้"
                            : "เลือกสาขาวิชา"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDepartments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            <div className="flex flex-col">
                              <span>{department.name}</span>
                              <span className="text-xs text-gray-500">
                                {department.degree} {department.duration && `(${department.duration})`}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                    )}
                    
                    {/* แสดงจำนวนสาขา */}
                    {selectedFaculty && availableDepartments.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">
                        มี {availableDepartments.length} สาขาในคณะนี้
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {/* ตำแหน่งวิชาการ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ตำแหน่งวิชาการ <span className="text-red-500">*</span>
                    </label>
                    <Select onValueChange={(value) => setValue('academicPosition', value as RegistrationFormData['academicPosition'])}>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกตำแหน่งวิชาการ" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicPositions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.academicPosition && (
                      <p className="mt-1 text-sm text-red-600">{errors.academicPosition.message}</p>
                    )}
                  </div>

                  {/* ตำแหน่งบริหาร */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ตำแหน่งบริหาร (ถ้ามี)
                    </label>
                    <input
                      {...register('administrativePosition')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="เช่น ประธานหลักสูตร, รองคณบดี"
                    />
                  </div>
                </div>
              </div>

              {/* ส่วนสิทธิ์ในการเข้าใช้ระบบ */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  สิทธิ์ในการเข้าใช้ระบบ
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    บทบาท <span className="text-red-500">*</span>
                  </label>
                  
                  <Select onValueChange={handleRoleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="เลือกบทบาท" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-gray-500 mt-1">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {errors.role && (
                    <p className="mt-2 text-sm text-red-600">{errors.role.message}</p>
                  )}
                  
                  {/* แสดงบทบาทที่เลือก */}
                  {selectedRole && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">บทบาทที่เลือก:</span> {selectedRole}
                      </p>
                    </div>
                  )}
                </div>

                {/* ตัวเลือกบทบาทที่ 2 (ไม่บังคับ) */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      บทบาทที่ 2 (ถ้ามี)
                    </label>
                    {selectedRole2 && (
                      <button
                        type="button"
                        onClick={clearRole2}
                        className="text-xs text-red-600 hover:text-red-800 transition-colors"
                      >
                        ลบบทบาทที่ 2
                      </button>
                    )}
                  </div>
                  
                  <Select 
                    onValueChange={handleRole2Change}
                    value={selectedRole2}
                    disabled={!role1Value || availableRole2Options.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        !role1Value 
                          ? "เลือกบทบาทที่ 1 ก่อน" 
                          : availableRole2Options.length === 0
                          ? "ไม่มีบทบาทอื่นให้เลือก"
                          : "เลือกบทบาทที่ 2 (ถ้ามี)"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRole2Options.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{role.label}</span>
                            <span className="text-xs text-gray-500 mt-1">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {errors.role2 && (
                    <p className="mt-2 text-sm text-red-600">{errors.role2.message}</p>
                  )}

                  {/* แสดงบทบาทที่ 2 ที่เลือก */}
                  {selectedRole2 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">บทบาทที่ 2:</span> {selectedRole2}
                      </p>
                    </div>
                  )}

                  {/* คำแนะนำ */}
                  {role1Value && availableRole2Options.length > 0 && !selectedRole2 && (
                    <p className="mt-2 text-xs text-gray-500">
                      สามารถเลือกบทบาทเพิ่มเติมได้ (ต้องไม่ซ้ำกับบทบาทที่ 1)
                    </p>
                  )}
                </div>
              </div>

              {/* ส่วน PDPA Consent */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  นโยบายความเป็นส่วนตัว
                </h3>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                    {consentText}
                  </p>
                </div>
                
                <div className="flex items-start gap-3">
                  <input
                    {...register('consentGiven')}
                    type="checkbox"
                    id="consentGiven"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="consentGiven" className="text-sm text-gray-700 cursor-pointer">
                    ข้าพเจ้ายอมรับนโยบายความเป็นส่วนตัวและข้อกำหนดการใช้งาน{' '}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                
                {errors.consentGiven && (
                  <p className="mt-2 text-sm text-red-600">{errors.consentGiven.message}</p>
                )}
                
                {consentGiven && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-700">
                      ขอบคุณที่ยอมรับนโยบายความเป็นส่วนตัว
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-md text-white font-medium transition-colors ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      กำลังดำเนินการ...
                    </>
                  ) : (
                    'ลงทะเบียน'
                  )}
                </button>
              </div>
            </form>
          </div>
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
                    ตัวอย่างข้อมูล ({exportData.length} รายการ)
                  </label>
                  <div className="border border-gray-200 rounded-md p-3 max-h-40 overflow-y-auto bg-white">
                    {exportData.length > 0 ? (
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
                          {exportData.slice(0, 3).map((item, index) => (
                            <tr key={index} className="border-b border-gray-100 last:border-b-0">
                              {exportColumns
                                .filter(col => col.selected)
                                .slice(0, 3)
                                .map(col => (
                                  <td key={col.id} className="px-2 py-1">
                                    {item[col.id] || '-'}
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
                        <Loader2 className="h-4 w-4 animate-spin" />
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
      </div>
    </div>
  )
}