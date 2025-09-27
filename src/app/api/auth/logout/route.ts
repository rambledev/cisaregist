import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // สร้าง response สำหรับ logout
    const response = NextResponse.json({
      message: 'ออกจากระบบสำเร็จ'
    })

    // ลบ cookie token
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0, // ตั้งให้หมดอายุทันที
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    )
  }
}