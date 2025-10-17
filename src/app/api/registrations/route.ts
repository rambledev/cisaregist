import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registrationSchema } from '@/lib/types'
import { encryptNationalId, decryptNationalId } from '@/lib/encryption'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received registration data:', body)
    
    // ✅ ตรวจสอบความถูกต้องของข้อมูลด้วย Zod
    const validatedData = registrationSchema.parse(body)
    console.log('Validated data:', validatedData)
    
    // ✅ เข้ารหัสเลขบัตรประชาชน
    const encryptedNationalId = encryptNationalId(validatedData.nationalId)
    
    // ✅ ตรวจสอบว่าเลขบัตรหรืออีเมลซ้ำหรือไม่
    const allRegistrations = await prisma.registration.findMany({
      select: {
        id: true,
        nationalId: true,
        email: true
      }
    })
    
    for (const reg of allRegistrations) {
      try {
        const decryptedId = decryptNationalId(reg.nationalId)
        if (decryptedId === validatedData.nationalId) {
          return NextResponse.json(
            { error: 'เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('Error decrypting national ID for comparison:', error)
        continue
      }

      if (reg.email === validatedData.email) {
        return NextResponse.json(
          { error: 'อีเมลนี้ได้ลงทะเบียนแล้ว' },
          { status: 400 }
        )
      }
    }

    // ✅ บันทึกข้อมูลการลงทะเบียนใหม่
    const registration = await prisma.registration.create({
      data: {
        prefix: validatedData.prefix,
        firstNameTh: validatedData.firstNameTh,
        lastNameTh: validatedData.lastNameTh,
        firstNameEn: validatedData.firstNameEn,
        lastNameEn: validatedData.lastNameEn,
        nationalId: encryptedNationalId, // เก็บแบบเข้ารหัส
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        faculty: validatedData.faculty,
        department: validatedData.department ?? null, // ✅ แก้ตรงนี้
        academicPosition: validatedData.academicPosition,
        administrativePosition: validatedData.administrativePosition ?? null,
        role: validatedData.role,
        role2: validatedData.role2 ?? null, // ✅ เพิ่ม role2 แบบปลอดภัย
        status: 'pending',
        consentGiven: true, // ผู้ใช้ยินยอมเมื่อลงทะเบียน
        consentDate: new Date(),
        consentVersion: '1.0'
      }
    })
    
    console.log('Registration created successfully:', registration.id)
    
    return NextResponse.json({
      success: true,
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        id: registration.id,
        sequence: registration.sequence
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Registration error:', error)

    if (error instanceof ZodError) {
      console.error('Zod validation errors:', error.issues)
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // ✅ ดึงข้อมูล IP และ User Agent
    const ipAddress =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // ✅ ดึงข้อมูลผู้ลงทะเบียนทั้งหมด
    const registrations = await prisma.registration.findMany({
      orderBy: { sequence: 'asc' },
      select: {
        id: true,
        sequence: true,
        prefix: true,
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        nationalId: true,
        email: true,
        phoneNumber: true,
        faculty: true,
        department: true,
        academicPosition: true,
        administrativePosition: true,
        role: true,
        role2: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    // ✅ ถอดรหัสเลขบัตรประชาชนก่อนส่งกลับ
    const decryptedRegistrations = registrations.map((reg) => {
      try {
        return {
          ...reg,
          nationalId: decryptNationalId(reg.nationalId),
        }
      } catch (error) {
        console.error('Error decrypting national ID:', error)
        return {
          ...reg,
          nationalId: 'ERROR_DECRYPTING',
        }
      }
    })

    // ✅ บันทึก Access Log
    await prisma.accessLog.create({
      data: {
        action: 'VIEW_ALL_REGISTRATIONS',
        reason: 'Admin viewing all registrations',
        ipAddress: ipAddress,
        userAgent: userAgent,
        timestamp: new Date(),
      },
    })

    return NextResponse.json(decryptedRegistrations)
  } catch (error) {
    console.error('Get registrations error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}
