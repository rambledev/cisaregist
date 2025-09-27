import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminPayload {
  adminId: string
  username: string
  role: string
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminPayload | null> {
  console.log('🔍 verifyAdminToken called at:', new Date().toISOString())
  console.log('🔑 JWT_SECRET exists:', !!process.env.JWT_SECRET)
  
  try {
    const token = request.cookies.get('admin-token')?.value
    console.log('🎫 Token found:', !!token)
    console.log('🍪 All cookies:', Object.fromEntries(
      (request.headers.get('cookie') || '').split('; ').map(c => c.split('='))
    ))

    if (!token) {
      console.log('❌ No token found, returning null')
      return null
    }

    console.log('🔐 Attempting JWT verification...')
    const payload = jwt.verify(token, JWT_SECRET) as AdminPayload
    console.log('✅ JWT verified successfully for user:', payload.username)
    console.log('🎫 Payload:', { adminId: payload.adminId, username: payload.username, role: payload.role })
    
    return payload
  } catch (error) {
    console.error('❌ Token verification error:', error)
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT Error type:', error.name, error.message)
    }
    return null
  }
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest) => {
    console.log('🛡️ requireAdmin called')
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      console.log('❌ requireAdmin: Unauthorized access attempt')
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ requireAdmin: Access granted to:', admin.username)
    return handler(request, admin)
  }
}