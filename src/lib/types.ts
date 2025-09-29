import { z } from 'zod'

// Zod validation schema
export const registrationSchema = z.object({
  // ข้อมูลส่วนตัว
  prefix: z.enum(['นาย', 'นาง', 'นางสาว']),
  firstNameTh: z.string().min(1, 'กรุณากรอกชื่อภาษาไทย'),
  lastNameTh: z.string().min(1, 'กรุณากรอกนามสกุลภาษาไทย'),
  firstNameEn: z.string().min(1, 'กรุณากรอกชื่อภาษาอังกฤษ'),
  lastNameEn: z.string().min(1, 'กรุณากรอกนามสกุลภาษาอังกฤษ'),
  nationalId: z.string()
    .length(13, 'เลขบัตรประชาชนต้องมี 13 หลัก')
    .regex(/^\d+$/, 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น'),
  email: z.string()
    .email('รูปแบบอีเมลไม่ถูกต้อง')
    .min(1, 'กรุณากรอกอีเมล'),
  phoneNumber: z.string()
    .length(10, 'เบอร์โทรศัพท์ต้องมี 10 หลัก')
    .regex(/^0\d{9}$/, 'เบอร์โทรศัพท์ต้องขึ้นต้นด้วย 0 และมี 10 หลัก'),
  
  // ข้อมูลการศึกษา/งาน
  faculty: z.string().min(1, 'กรุณาเลือกคณะ'),
  department: z.string().min(1, 'กรุณากรอกสาขาวิชา'),
  academicPosition: z.enum(['อาจารย์', 'ผู้ช่วยศาสตราจารย์', 'รองศาสตราจารย์', 'ศาสตราจารย์']),
  administrativePosition: z.string().optional(),
  
  // สิทธิ์ในการเข้าใช้ระบบ
  role: z.enum([
    'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (หลัก)',
    'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (วิทยาเขต)',
    'นายทะเบียนหลักสูตรของสถาบันอุดมศึกษา',
    'เจ้าหน้าที่ของมหาวิทยาลัย',
    'อธิการบดี/รองอธิการบดี',
    'คณบดี/รองคณบดี',
    'เจ้าหน้าที่ของคณะ',
    'อาจารย์ผู้รับผิดชอบหลักสูตร',
    'เจ้าหน้าที่ของสาขาวิชา'
  ])
})

// Type inference from schema
export type RegistrationFormData = z.infer<typeof registrationSchema>

// Prefix options for UI
export const prefixOptions = [
  { value: 'นาย' as const, label: 'นาย' },
  { value: 'นาง' as const, label: 'นาง' },
  { value: 'นางสาว' as const, label: 'นางสาว' }
]

// Academic positions for UI
export const academicPositions = [
  { value: 'อาจารย์' as const, label: 'อาจารย์' },
  { value: 'ผู้ช่วยศาสตราจารย์' as const, label: 'ผู้ช่วยศาสตราจารย์' },
  { value: 'รองศาสตราจารย์' as const, label: 'รองศาสตราจารย์' },
  { value: 'ศาสตราจารย์' as const, label: 'ศาสตราจารย์' }
]

// Faculties - ปรับแต่งตามมหาวิทยาลัยของคุณ
export const faculties = [
  { value: 'วิทยาศาสตร์', label: 'คณะวิทยาศาสตร์' },
  { value: 'วิศวกรรมศาสตร์', label: 'คณะวิศวกรรมศาสตร์' },
  { value: 'มนุษยศาสตร์และสังคมศาสตร์', label: 'คณะมนุษยศาสตร์และสังคมศาสตร์' },
  { value: 'บริหารธุรกิจ', label: 'คณะบริหารธุรกิจ' },
  { value: 'ครุศาสตร์', label: 'คณะครุศาสตร์' },
  { value: 'เทคโนโลยี', label: 'คณะเทคโนโลยี' },
  { value: 'แพทยศาสตร์', label: 'คณะแพทยศาสตร์' },
  { value: 'พยาบาลศาสตร์', label: 'คณะพยาบาลศาสตร์' },
  { value: 'เภสัชศาสตร์', label: 'คณะเภสัชศาสตร์' },
  { value: 'สาธารณสุขศาสตร์', label: 'คณะสาธารณสุขศาสตร์' },
]

// Roles for UI - บทบาทในการเข้าใช้ระบบ
export const roles = [
  {
    value: 'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (หลัก)' as const,
    label: 'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (หลัก)',
    description: 'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (หลัก)'
  },
  {
    value: 'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (วิทยาเขต)' as const,
    label: 'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (วิทยาเขต)',
    description: 'ผู้ดูแลระบบระดับสถาบันอุดมศึกษา (วิทยาเขต)'
  },
  {
    value: 'นายทะเบียนหลักสูตรของสถาบันอุดมศึกษา' as const,
    label: 'นายทะเบียนหลักสูตรของสถาบันอุดมศึกษา',
    description: 'นายทะเบียนหลักสูตรของสถาบันอุดมศึกษา'
  },
  {
    value: 'เจ้าหน้าที่ของมหาวิทยาลัย' as const,
    label: 'เจ้าหน้าที่ของมหาวิทยาลัย',
    description: 'เจ้าหน้าที่ ที่ดำเนินการด้านหลักสูตรระดับมหาวิทยาลัย'
  },
  {
    value: 'อธิการบดี/รองอธิการบดี' as const,
    label: 'อธิการบดี/รองอธิการบดี',
    description: 'อธิการบดี/รองอธิการบดีที่รับผิดชอบการจัดทำหลักสูตร'
  },
  {
    value: 'คณบดี/รองคณบดี' as const,
    label: 'คณบดี/รองคณบดี',
    description: 'คณบดี/รองคณบดีที่รับผิดชอบการจัดทำหลักสูตรของคณะ'
  },
  {
    value: 'เจ้าหน้าที่ของคณะ' as const,
    label: 'เจ้าหน้าที่ของคณะ',
    description: 'เจ้าหน้าที่ของคณะ'
  },
  {
    value: 'อาจารย์ผู้รับผิดชอบหลักสูตร' as const,
    label: 'อาจารย์ผู้รับผิดชอบหลักสูตร',
    description: 'อาจารย์ผู้รับผิดชอบหลักสูตร'
  },
  {
    value: 'เจ้าหน้าที่ของสาขาวิชา' as const,
    label: 'เจ้าหน้าที่ของสาขาวิชา',
    description: 'เจ้าหน้าที่ของหลักสูตร หรือสาขาวิชา'
  }
]

// API Response types
export interface RegistrationResponse {
  success: boolean
  data?: {
    id: string
    sequence: number
  }
  error?: string
}