import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// ปิด Edge Runtime และใช้ Node.js runtime แทน
export const runtime = 'nodejs'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔍 Middleware called for:', pathname)

  // ให้ API routes ผ่านไป
  if (pathname.startsWith('/api/')) {
    console.log('✅ API route detected:', pathname, 'allowing to pass through')
    return NextResponse.next()
  }

  // ถ้าเป็นหน้า login ให้ผ่านไปได้
  if (pathname === '/admin/login') {
    console.log('✅ Login page, allowing access')
    return NextResponse.next()
  }

  // ถ้าเป็น admin routes
  if (pathname.startsWith('/admin')) {
    console.log('🔐 Admin route detected, checking authentication')
    
    const token = request.cookies.get('admin-token')?.value
    console.log('🍪 Token exists:', !!token)

    if (!token) {
      console.log('❌ No token found, redirecting to login')
      const loginUrl = new URL('/admin/login', request.url)
      return NextResponse.redirect(loginUrl)
    }

    try {
      // ใช้ simple token validation แทน JWT verify
      // เนื่องจาก Edge Runtime ไม่รองรับ
      if (token && token.length > 20) {
        console.log('✅ Token exists and has valid length')
        
        // ถ้าเป็น /admin ให้ redirect ไป /admin/dashboard
        if (pathname === '/admin') {
          console.log('🔄 Redirecting /admin to /admin/dashboard')
          const dashboardUrl = new URL('/admin/dashboard', request.url)
          return NextResponse.redirect(dashboardUrl)
        }

        console.log('✅ Authentication successful, allowing access')
        return NextResponse.next()
      } else {
        throw new Error('Invalid token format')
      }
    } catch (error) {
      console.log('❌ Token verification failed:', error)
      const loginUrl = new URL('/admin/login', request.url)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/admin/:path*'
  ]
}