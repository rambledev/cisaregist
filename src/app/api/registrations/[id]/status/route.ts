import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const { status } = await request.json()

    if (!['active', 'inactive'].includes(status)) {
      return NextResponse.json(
        { error: 'สถานะไม่ถูกต้อง' },
        { status: 400 }
      )
    }

    const registration = await prisma.registration.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({
      success: true,
      registration
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' },
      { status: 500 }
    )
  }
}