import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ถ้าเป็นหน้า login ให้ผ่านไปได้
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // ถ้าเป็น path ที่ขึ้นต้นด้วย /admin (ยกเว้น /admin/login)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      // ไม่มี token ให้ redirect ไป login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // ตรวจสอบ token
      jwt.verify(token, JWT_SECRET)
      
      // ถ้าเป็น /admin ให้ redirect ไป /admin/dashboard
      if (pathname === '/admin') {
        const dashboardUrl = new URL('/admin/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
      }

      // token ถูกต้อง ให้ผ่านไปได้
      return NextResponse.next()
    } catch (error) {
      // token ไม่ถูกต้อง ให้ redirect ไป login
      const loginUrl = new URL('/admin/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}