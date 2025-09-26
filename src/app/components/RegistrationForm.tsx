"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  RegistrationFormData, 
  registrationSchema,
  prefixOptions,
  faculties,
  academicPositions
} from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function RegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema)
  })

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true)
    setSubmitStatus({ type: null, message: '' })

    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: `ลงทะเบียนสำเร็จ! หมายเลขลำดับของคุณคือ ${result.data.sequence}`
        })
        reset()
      } else {
        setSubmitStatus({
          type: 'error',
          message: result.error || 'เกิดข้อผิดพลาดในการลงทะเบียน'
        })
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ระบบลงทะเบียน CISA
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
                  <Select onValueChange={(value) => setValue('prefix', value as any)}>
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

            {/* ส่วนข้อมูลการศึกษา/งาน */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                ข้อมูลการศึกษาและงาน
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* คณะ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คณะ <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setValue('faculty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคณะ" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty.value} value={faculty.value}>
                          {faculty.label}
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
                  <input
                    {...register('department')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="สาขาวิชา"
                  />
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600">{errors.department.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* ตำแหน่งวิชาการ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ตำแหน่งวิชาการ <span className="text-red-500">*</span>
                  </label>
                  <Select onValueChange={(value) => setValue('academicPosition', value as any)}>
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
                    placeholder="เช่น หัวหน้าสาขา, รองคณบดี"
                  />
                </div>
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