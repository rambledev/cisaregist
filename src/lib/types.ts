import { z } from 'zod'

// Define constants first
const PREFIX_VALUES = ['นาย', 'นาง', 'นางสาว'] as const
const ACADEMIC_POSITIONS = ['อาจารย์', 'ผู้ช่วยศาสตราจารย์', 'รองศาสตราจารย์', 'ศาสตราจารย์'] as const

// Validation Schema
export const registrationSchema = z.object({
  firstNameTh: z.string().min(1, 'กรุณาใส่ชื่อ (ภาษาไทย)'),
  lastNameTh: z.string().min(1, 'กรุณาใส่นามสกุล (ภาษาไทย)'),
  firstNameEn: z.string().min(1, 'กรุณาใส่ชื่อ (ภาษาอังกฤษ)'),
  lastNameEn: z.string().min(1, 'กรุณาใส่นามสกุล (ภาษาอังกฤษ)'),
  prefix: z.enum(PREFIX_VALUES, {
    message: 'กรุณาเลือกคำนำหน้า'
  }),
  nationalId: z.string()
    .min(13, 'เลขบัตรประชาชนต้องมี 13 หลัก')
    .max(13, 'เลขบัตรประชาชนต้องมี 13 หลัก')
    .regex(/^\d+$/, 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น'),
  email: z.string().email('รูปแบบอีเมลไม่ถูกต้อง'),
  phoneNumber: z.string()
    .min(9, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .max(10, 'เบอร์โทรศัพท์ไม่ถูกต้อง')
    .regex(/^\d+$/, 'เบอร์โทรศัพท์ต้องเป็นตัวเลขเท่านั้น'),
  faculty: z.string().min(1, 'กรุณาเลือกคณะ'),
  department: z.string().min(1, 'กรุณาใส่สาขาวิชา'),
  academicPosition: z.enum(ACADEMIC_POSITIONS, {
    message: 'กรุณาเลือกตำแหน่งวิชาการ'
  }),
  administrativePosition: z.string().optional(),
})

export type RegistrationFormData = z.infer<typeof registrationSchema>

// ตัวเลือกสำหรับ dropdown
export const prefixOptions = [
  { value: 'นาย', label: 'นาย' },
  { value: 'นาง', label: 'นาง' },
  { value: 'นางสาว', label: 'นางสาว' },
] as const

export const faculties = [
  { value: 'คณะวิทยาศาสตร์และเทคโนโลยี', label: '1. คณะวิทยาศาสตร์และเทคโนโลยี' },
  { value: 'คณะครุศาสตร์', label: '2. คณะครุศาสตร์' },
  { value: 'คณะวิทยาการจัดการ', label: '3. คณะวิทยาการจัดการ' },
  { value: 'คณะมนุษยศาสตร์และสังคมศาสตร์', label: '4. คณะมนุษยศาสตร์และสังคมศาสตร์' },
  { value: 'คณะเทคโนโลยีการเกษตร', label: '5. คณะเทคโนโลยีการเกษตร' },
  { value: 'คณะเทคโนโลยีสารสนเทศ', label: '6. คณะเทคโนโลยีสารสนเทศ' },
  { value: 'คณะรัฐศาสตร์และรัฐประศาสนศาสตร์', label: '7. คณะรัฐศาสตร์และรัฐประศาสนศาสตร์' },
  { value: 'คณะนิติศาสตร์', label: '8. คณะนิติศาสตร์' },
  { value: 'คณะวิศวกรรมศาสตร์', label: '9. คณะวิศวกรรมศาสตร์' },
  { value: 'บัณฑิตวิทยาลัย', label: '10. บัณฑิตวิทยาลัย' },
] as const

// ตำแหน่งวิชาการ - ตามข้อมูลที่ได้รับ
export const academicPositions = [
  { value: 'อาจารย์', label: 'อาจารย์' },
  { value: 'ผู้ช่วยศาสตราจารย์', label: 'ผู้ช่วยศาสตราจารย์' },
  { value: 'รองศาสตราจารย์', label: 'รองศาสตราจารย์' },
  { value: 'ศาสตราจารย์', label: 'ศาสตราจารย์' }
] as const