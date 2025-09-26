import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registrationSchema } from '@/lib/types'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate data with Zod
    const validatedData = registrationSchema.parse(body)
    
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
      data: validatedData
    })
    
    return NextResponse.json({
      message: 'ลงทะเบียนสำเร็จ',
      data: {
        id: registration.id,
        sequence: registration.sequence
      }
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Registration error:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'ข้อมูลไม่ถูกต้อง', details: error.errors },
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
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        prefix: true,
        email: true,
        faculty: true,
        department: true,
        academicPosition: true,
        administrativePosition: true,
        status: true,
        createdAt: true
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