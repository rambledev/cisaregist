import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - สร้างสาขาใหม่
export async function POST(request: Request) {
  try {
    const { facultyId, code, name, degree, duration, specializations } = await request.json()

    const department = await prisma.department.create({
      data: {
        facultyId,
        code,
        name,
        degree,
        duration: duration || null,
        specializations: specializations || []
      }
    })

    return NextResponse.json({
      success: true,
      data: department
    })
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถสร้างสาขาได้' },
      { status: 500 }
    )
  }
}