import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 Stats API called')
    console.log('🔗 Database URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***:***@'))
    
    const admin = await verifyAdminToken(request)
    console.log('👤 Admin verified:', !!admin)
    
    if (!admin) {
      console.log('❌ Admin verification failed')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 🔍 Test database connection
    console.log('🔍 Testing database connection...')
    const dbTest = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connected:', dbTest)

    // 🔍 Check table exists
    const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'cisa_registrations'
    `
    console.log('📋 Table check:', tableCheck)

    // 🔍 Raw count query
    const rawCount = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM cisa_registrations
    `
    console.log('🔢 Raw count:', rawCount)

    // 🔍 Test Prisma model
    console.log('🔍 Testing Prisma registration model...')
    const totalRegistrations = await prisma.registration.count()
    console.log('📊 Prisma count:', totalRegistrations)

    // 🔍 Check few records
    const sampleRecords = await prisma.registration.findMany({
      take: 2,
      select: {
        id: true,
        sequence: true,
        firstNameTh: true,
        status: true
      }
    })
    console.log('📝 Sample records:', sampleRecords)

    // สถิติตามสถานะ
    const statusStats = await prisma.registration.groupBy({
      by: ['status'],
      _count: true
    })
    console.log('📊 Status stats:', statusStats)

    // สถิติตามตำแหน่งวิชาการ
    const academicPositionStats = await prisma.registration.groupBy({
      by: ['academicPosition'],
      _count: true,
      orderBy: {
        _count: {
          academicPosition: 'desc'
        }
      }
    })

    // สถิติตามคณะ
    const facultyStats = await prisma.registration.groupBy({
      by: ['faculty'],
      _count: true,
      orderBy: {
        _count: {
          faculty: 'desc'
        }
      }
    })

    // รายการลงทะเบียนล่าสุด 5 คน
    const recentRegistrations = await prisma.registration.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sequence: true,
        firstNameTh: true,
        lastNameTh: true,
        faculty: true,
        academicPosition: true,
        status: true,
        createdAt: true
      }
    })

    // สถิติตามเดือน (6 เดือนล่าสุด)
    const monthlyStatsRaw = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as count
      FROM cisa_registrations 
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month DESC
    ` as Array<{ month: Date; count: bigint }>

    // Convert BigInt to Number
    const monthlyStats = monthlyStatsRaw.map(item => ({
      month: item.month,
      count: Number(item.count)
    }))

    const response = {
      totalRegistrations,
      statusStats: statusStats.reduce((acc, item) => {
        acc[item.status] = item._count
        return acc
      }, {} as Record<string, number>),
      academicPositionStats: academicPositionStats.map(item => ({
        position: item.academicPosition,
        count: item._count
      })),
      facultyStats: facultyStats.map(item => ({
        faculty: item.faculty,
        count: item._count
      })),
      recentRegistrations,
      monthlyStats
    }

    console.log('📤 Final response:', JSON.stringify(response, null, 2))

    return NextResponse.json(response)

  } catch (error) {
    console.error('💥 Stats error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสถิติ' },
      { status: 500 }
    )
  }
}