import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const faculties = await prisma.faculty.findMany({
      include: {
        departments: {
          orderBy: {
            name: 'asc'
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      data: faculties 
    })
  } catch (error) {
    console.error('Error fetching faculties:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'ไม่สามารถดึงข้อมูลคณะได้' 
      },
      { status: 500 }
    )
  }
}