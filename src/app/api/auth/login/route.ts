import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      )
    }

    // Find admin user (เปลี่ยนเป็นชื่อ table ที่ถูกต้อง)
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() }
    })

    // Create JWT token
    const token = jwt.sign(
      { 
        adminId: admin.id, 
        username: admin.username, 
        role: admin.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Set HTTP-only cookie
    const response = NextResponse.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    })

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 // 24 hours
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในระบบ' },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  // Logout endpoint
  const response = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' })
  response.cookies.delete('admin-token')
  return response
}