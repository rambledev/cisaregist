import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'faculty' หรือ 'position'
    const value = searchParams.get('value') // ค่าที่ต้องการกรอง

    if (!type || !value) {
      return NextResponse.json(
        { error: 'Missing type or value parameter' },
        { status: 400 }
      )
    }

    let registrations
    let responseData

    if (type === 'faculty') {
      // ดึงข้อมูลตามคณะ
      registrations = await prisma.registration.findMany({
        where: {
          faculty: value
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          sequence: true,
          firstNameTh: true,
          lastNameTh: true,
          faculty: true,
          academicPosition: true,
          createdAt: true
        }
      })

      responseData = {
        faculty: value,
        registrations
      }
    } else if (type === 'position') {
      // ดึงข้อมูลตามตำแหน่งวิชาการ
      registrations = await prisma.registration.findMany({
        where: {
          academicPosition: value
        },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          sequence: true,
          firstNameTh: true,
          lastNameTh: true,
          faculty: true,
          academicPosition: true,
          createdAt: true
        }
      })

      responseData = {
        position: value,
        registrations
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid type parameter' },
        { status: 400 }
      )
    }

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Details API error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงรายละเอียด' },
      { status: 500 }
    )
  }
}