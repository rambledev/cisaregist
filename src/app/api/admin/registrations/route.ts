import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { NextRequest } from 'next/server'

// GET - ดึงข้อมูลการลงทะเบียนทั้งหมด
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // ดึงข้อมูลการลงทะเบียนทั้งหมด
    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sequence: true,
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        email: true,
        phoneNumber: true,
        faculty: true,
        department: true,
        academicPosition: true,
        administrativePosition: true,
        nationalId: true,
        prefix: true,
        role: true, 
        status: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      registrations
    })

  } catch (error) {
    console.error('GET registrations error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// POST - เพิ่มข้อมูลการลงทะเบียนใหม่
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,
      email,
      phoneNumber,
      faculty,
      role,
      department,
      academicPosition,
      administrativePosition,
      nationalId,
      prefix
    } = body

    // ตรวจสอบว่าอีเมลซ้ำหรือไม่
    const existingEmail = await prisma.registration.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'อีเมลนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // ตรวจสอบว่าเลขบัตรประชาชนซ้ำหรือไม่
    const existingNationalId = await prisma.registration.findUnique({
      where: { nationalId }
    })

    if (existingNationalId) {
      return NextResponse.json(
        { error: 'เลขบัตรประชาชนนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // หาลำดับล่าสุด
    const lastRegistration = await prisma.registration.findFirst({
      orderBy: { sequence: 'desc' },
      select: { sequence: true }
    })

    const nextSequence = (lastRegistration?.sequence || 0) + 1

    // สร้างข้อมูลใหม่
    const registration = await prisma.registration.create({
      data: {
        sequence: nextSequence,
        firstNameTh,
        lastNameTh,
        firstNameEn,
        lastNameEn,
        email,
        phoneNumber,
        faculty,
        role,
        department,
        academicPosition,
        administrativePosition: administrativePosition || null,
        nationalId,
        prefix
      }
    })

    return NextResponse.json({
      message: 'เพิ่มข้อมูลสำเร็จ',
      registration
    })

  } catch (error) {
    console.error('POST registration error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' },
      { status: 500 }
    )
  }
}