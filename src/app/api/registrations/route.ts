import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registrationSchema } from '@/lib/types'
import { ZodError } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('Received registration data:', body)
    
    // Validate data with Zod
    const validatedData = registrationSchema.parse(body)
    console.log('Validated data:', validatedData)
    
    // Check if national ID or email already exists
    const existingUser = await prisma.registration.findFirst({
      where: {
        OR: [
          { nationalId: validatedData.nationalId },
          { email: validatedData.email }
        ]
      }
    })
    
    if (existingUser) {
      if (existingUser.nationalId === validatedData.nationalId) {
        return NextResponse.json(
          { error: 'เลขบัตรประชาชนนี้ได้ลงทะเบียนแล้ว' },
          { status: 400 }
        )
      }
      if (existingUser.email === validatedData.email) {
        return NextResponse.json(
          { error: 'อีเมลนี้ได้ลงทะเบียนแล้ว' },
          { status: 400 }
        )
      }
    }
    
    // Create new registration
    const registration = await prisma.registration.create({
      data: {
        prefix: validatedData.prefix,
        firstNameTh: validatedData.firstNameTh,
        lastNameTh: validatedData.lastNameTh,
        firstNameEn: validatedData.firstNameEn,
        lastNameEn: validatedData.lastNameEn,
        nationalId: validatedData.nationalId,
        email: validatedData.email,
        phoneNumber: validatedData.phoneNumber,
        faculty: validatedData.faculty,
        department: validatedData.department,
        academicPosition: validatedData.academicPosition,
        administrativePosition: validatedData.administrativePosition || null,
        role: validatedData.role,
        status: 'pending'
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

export async function GET() {
  try {
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
    status: true,
    createdAt: true,
    updatedAt: true,
  }
})


    
    return NextResponse.json(registrations)
  } catch (error) {
    console.error('Get registrations error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}