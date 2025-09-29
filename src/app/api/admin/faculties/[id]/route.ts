import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - แก้ไขคณะ
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { name } = await request.json()

    const faculty = await prisma.faculty.update({
      where: { id: params.id },
      data: { name }
    })

    return NextResponse.json({
      success: true,
      data: faculty
    })
  } catch (error) {
    console.error('Error updating faculty:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถแก้ไขคณะได้' },
      { status: 500 }
    )
  }
}

// DELETE - ลบคณะ
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    await prisma.faculty.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'ลบคณะสำเร็จ'
    })
  } catch (error) {
    console.error('Error deleting faculty:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถลบคณะได้' },
      { status: 500 }
    )
  }
}