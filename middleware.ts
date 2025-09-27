import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('🔍 Middleware called for:', pathname)

  // ✅ ให้ API routes ผ่านไปโดยไม่ต้องตรวจสอบ
  if (pathname.startsWith('/api/')) {
    console.log('✅ API route detected, allowing to pass through')
    return NextResponse.next()
  }

  // ถ้าเป็นหน้า login ให้ผ่านไปได้
  if (pathname === '/admin/login') {
    console.log('✅ Login page, allowing access')
    return NextResponse.next()
  }

  // ถ้าเป็น path ที่ขึ้นต้นด้วย /admin (ยกเว้น /admin/login)
  if (pathname.startsWith('/admin')) {
    console.log('🔐 Admin route detected, checking authentication')
    
    const token = request.cookies.get('admin-token')?.value
    console.log('🍪 Token exists:', !!token)

    if (!token) {
      console.log('❌ No token found, redirecting to login')
      // ไม่มี token ให้ redirect ไป login
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // ตรวจสอบ token
      const decoded = jwt.verify(token, JWT_SECRET)
      console.log('✅ Token verified successfully')
      
      // ถ้าเป็น /admin ให้ redirect ไป /admin/dashboard
      if (pathname === '/admin') {
        console.log('🔄 Redirecting /admin to /admin/dashboard')
        const dashboardUrl = new URL('/admin/dashboard', request.url)
        return NextResponse.redirect(dashboardUrl)
      }

      // token ถูกต้อง ให้ผ่านไปได้
      console.log('✅ Authentication successful, allowing access')
      return NextResponse.next()
    } catch (error) {
      console.log('❌ Token verification failed:', error)
      // token ไม่ถูกต้อง ให้ redirect ไป login
      const loginUrl = new URL('/admin/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin-token')
      return response
    }
  }

  console.log('✅ Non-admin route, allowing to pass through')
  return NextResponse.next()
}

export const config = {
  // ✅ ปรับ matcher ให้ไม่รวม API routes
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    // Only apply to /admin routes
    '/admin/:path*'
  ]
}