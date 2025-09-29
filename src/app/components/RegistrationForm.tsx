"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  RegistrationFormData, 
  registrationSchema,
  prefixOptions,
  academicPositions,
  roles
} from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

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

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [selectedRole, setSelectedRole] = useState<string>('')
  
  // States สำหรับคณะและสาขา
  const [faculties, setFaculties] = useState<Faculty[]>([])
  const [selectedFaculty, setSelectedFaculty] = useState<string>('')
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([])
  const [isLoadingFaculties, setIsLoadingFaculties] = useState(true)
  const [showDepartmentWarning, setShowDepartmentWarning] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  })

  // ดึงข้อมูลคณะเมื่อ component mount
  useEffect(() => {
    fetchFaculties()
  }, [])

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
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ระบบลงทะเบียนเข้าใช้ระบบสารสนเทศฐานข้อมูลหลักสูตร (CISA)
            </h1>
            <p className="text-gray-600">
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* ส่วนข้อมูลส่วนตัว */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ข้อมูลส่วนตัว
              </h2>
              
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ข้อมูลสังกัด
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* คณะ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คณะ <span className="text-red-500">*</span>
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
                    สาขาวิชา <span className="text-red-500">*</span>
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
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                สิทธิ์ในการเข้าใช้ระบบ
              </h2>
              
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
    </div>
  )
}