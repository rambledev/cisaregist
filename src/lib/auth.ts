import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminPayload {
  adminId: string
  username: string
  role: string
}

export async function verifyAdminToken(request: NextRequest): Promise<AdminPayload | null> {
  try {
    const token = request.cookies.get('admin-token')?.value

    if (!token) {
      return null
    }

    const payload = jwt.verify(token, JWT_SECRET) as AdminPayload
    return payload
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest) => {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return handler(request, admin)
  }
}