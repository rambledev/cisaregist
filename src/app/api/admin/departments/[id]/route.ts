import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PUT - แก้ไขสาขา
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const { code, name, degree, duration, specializations } = await request.json()

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
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
    console.error('Error updating department:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถแก้ไขสาขาได้' },
      { status: 500 }
    )
  }
}

// DELETE - ลบสาขา
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    
    await prisma.department.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'ลบสาขาสำเร็จ'
    })
  } catch (error) {
    console.error('Error deleting department:', error)
    return NextResponse.json(
      { success: false, error: 'ไม่สามารถลบสาขาได้' },
      { status: 500 }
    )
  }
}