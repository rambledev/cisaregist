import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'

// GET - ดึงข้อมูลการลงทะเบียนรายบุคคล
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const admin = await verifyAdminToken(request)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const registration = await prisma.registration.findUnique({
      where: { id }
    })

    if (!registration) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลการลงทะเบียน' }, { status: 404 })
    }

    return NextResponse.json({ registration })
  } catch (error) {
    console.error('GET registration detail error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' }, { status: 500 })
  }
}

// PUT - แก้ไขข้อมูลการลงทะเบียน
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const admin = await verifyAdminToken(request)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
      department,
      academicPosition,
      administrativePosition,
      nationalId,
      prefix
    } = body

    const existingRegistration = await prisma.registration.findUnique({
      where: { id }
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลการลงทะเบียน' }, { status: 404 })
    }

    if (email !== existingRegistration.email) {
      const emailExists = await prisma.registration.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 })
      }
    }

    if (nationalId !== existingRegistration.nationalId) {
      const nationalIdExists = await prisma.registration.findUnique({ where: { nationalId } })
      if (nationalIdExists) {
        return NextResponse.json({ error: 'เลขบัตรประชาชนนี้ถูกใช้งานแล้ว' }, { status: 400 })
      }
    }

    const updatedRegistration = await prisma.registration.update({
      where: { id },
      data: {
        firstNameTh,
        lastNameTh,
        firstNameEn,
        lastNameEn,
        email,
        phoneNumber,
        faculty,
        department,
        academicPosition,
        administrativePosition: administrativePosition || null,
        nationalId,
        prefix,
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      message: 'แก้ไขข้อมูลสำเร็จ',
      registration: updatedRegistration
    })
  } catch (error) {
    console.error('PUT registration error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแก้ไขข้อมูล' }, { status: 500 })
  }
}

// DELETE - ลบข้อมูลการลงทะเบียน
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const admin = await verifyAdminToken(request)

    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: { id }
    })

    if (!existingRegistration) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลการลงทะเบียน' }, { status: 404 })
    }

    await prisma.registration.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'ลบข้อมูลสำเร็จ' })
  } catch (error) {
    console.error('DELETE registration error:', error)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการลบข้อมูล' }, { status: 500 })
  }
}
