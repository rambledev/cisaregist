import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - สร้างคณะใหม่
export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    const faculty = await prisma.faculty.create({
      data: { name }
    })

    return NextResponse.json({
      success: true,
      data: faculty
    })
  } catch (error) {
    console.error('Error creating faculty:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถสร้างคณะได้' },
      { status: 500 }
    )
  }
}