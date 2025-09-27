import { NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Authenticated',
      admin: {
        adminId: admin.adminId,
        username: admin.username,
        role: admin.role
      }
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}