import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: Request) {
  console.log('🚀 Login API endpoint called')
  console.log('📅 Timestamp:', new Date().toISOString())
  console.log('🌍 Environment:', process.env.NODE_ENV)
  console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET)
  
  try {
    console.log('📥 Parsing request body...')
    const body = await request.json()
    console.log('📝 Request body received:', { 
      username: body.username, 
      password: body.password ? '***' : 'missing',
      hasUsername: !!body.username,
      hasPassword: !!body.password
    })

    const { username, password } = body

    if (!username || !password) {
      console.log('❌ Missing credentials')
      return NextResponse.json(
        { error: 'กรุณาใส่ชื่อผู้ใช้และรหัสผ่าน' },
        { status: 400 }
      )
    }

    // Find admin user
    console.log('🔍 Searching for admin user:', username)
    const admin = await prisma.admin.findUnique({
      where: { username }
    })

    console.log('👤 Admin search result:', {
      found: !!admin,
      isActive: admin?.isActive,
      id: admin?.id,
      role: admin?.role
    })

    if (!admin) {
      console.log('❌ Admin user not found')
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    if (!admin.isActive) {
      console.log('❌ Admin user is not active')
      return NextResponse.json(
        { error: 'บัญชีผู้ใช้ถูกระงับ' },
        { status: 401 }
      )
    }

    // Verify password
    console.log('🔐 Verifying password...')
    const isValidPassword = await bcrypt.compare(password, admin.password)
    console.log('🔐 Password verification result:', isValidPassword)

    if (!isValidPassword) {
      console.log('❌ Invalid password')
      return NextResponse.json(
        { error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      )
    }

    // Update last login
    console.log('📝 Updating last login time...')
    try {
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() }
      })
      console.log('✅ Last login time updated')
    } catch (updateError) {
      console.error('⚠️ Warning: Failed to update last login:', updateError)
    }

    // Create JWT token
    console.log('🎫 Creating JWT token...')
    const tokenPayload = { 
      adminId: admin.id, 
      username: admin.username, 
      role: admin.role 
    }
    console.log('🎫 Token payload:', tokenPayload)

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' })
    console.log('✅ JWT token created successfully')

    // Prepare response
    const responseData = {
      message: 'เข้าสู่ระบบสำเร็จ',
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    }
    console.log('📤 Response data prepared:', responseData)

    // Set cookie
    console.log('🍪 Setting cookie...')
    const response = NextResponse.json(responseData)

    // Try different cookie settings for production
    const cookieOptions = {
      httpOnly: true,
      secure: false, // Try without secure first
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
      domain: undefined // Let browser decide
    }
    
    console.log('🍪 Cookie options:', cookieOptions)
    response.cookies.set('admin-token', token, cookieOptions)
    
    // Also try setting via Set-Cookie header
    response.headers.set('Set-Cookie', 
      `admin-token=${token}; Path=/; Max-Age=${24 * 60 * 60}; HttpOnly; SameSite=Lax`
    )
    console.log('✅ Cookie set successfully')

    console.log('🎉 Login successful!')
    return response

  } catch (error) {
    console.error('💥 Unexpected error in login API:', error)
    console.error('📍 Error details:', error instanceof Error ? error.message : String(error))
    
    return NextResponse.json(
      { 
        error: 'เกิดข้อผิดพลาดในระบบ',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  console.log('🚪 Logout API endpoint called')
  
  try {
    const response = NextResponse.json({ message: 'ออกจากระบบสำเร็จ' })
    response.cookies.delete('admin-token')
    console.log('✅ Logout successful')
    return response
  } catch (error) {
    console.error('❌ Error during logout:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    )
  }
}