import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminPayload {
  adminId: string
  username: string
  role: string
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminPayload | null> {
  console.log('🔍 verifyAdminToken called')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  try {
    // Get token from cookies
    const cookieHeader = request.headers.get('cookie')
    console.log('🍪 Cookie header exists:', !!cookieHeader)
    console.log('🍪 Full cookie header:', cookieHeader)
    
    const token = request.cookies.get('admin-token')?.value
    console.log('🎫 Token from NextRequest.cookies:', !!token)

    if (!token) {
      console.log('❌ No token found in cookies')
      return null
    }

    console.log('🔐 Verifying JWT token...')
    let payload: any
    try {
      payload = jwt.verify(token, JWT_SECRET) as any
      console.log('✅ JWT verification successful')
      console.log('🎫 Token payload:', {
        adminId: payload.adminId,
        username: payload.username,
        role: payload.role,
        exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'no expiry'
      })
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', jwtError)
      return null
    }

    // Check if admin exists in database and is active
    console.log('👤 Checking admin in database...')
    try {
      await prisma.$connect()
      console.log('✅ Database connected in verifyAdminToken')
      
      const admin = await prisma.admin.findUnique({
        where: { id: payload.adminId },
        select: {
          id: true,
          username: true,
          role: true,
          isActive: true
        }
      })

      console.log('👤 Database admin check result:', {
        found: !!admin,
        isActive: admin?.isActive,
        id: admin?.id
      })

      if (!admin || !admin.isActive) {
        console.log('❌ Admin not found or inactive in database')
        return null
      }

      const result: AdminPayload = {
        adminId: admin.id,
        username: admin.username,
        role: admin.role
      }

      console.log('✅ verifyAdminToken successful')
      return result

    } catch (dbError) {
      console.error('❌ Database error in verifyAdminToken:', dbError)
      return null
    } finally {
      try {
        await prisma.$disconnect()
        console.log('🔌 Database disconnected from verifyAdminToken')
      } catch (disconnectError) {
        console.error('⚠️ Failed to disconnect in verifyAdminToken:', disconnectError)
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error in verifyAdminToken:', error)
    console.error('📍 Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return null
  }
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest) => {
    console.log('🛡️ requireAdmin middleware called')
    
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      console.log('❌ requireAdmin: No valid admin found')
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('✅ requireAdmin: Admin authorized, proceeding to handler')
    return handler(request, admin)
  }
}