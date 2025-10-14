import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/auth'
import { encryptNationalId, decryptNationalId } from '@/lib/encryption'

// ===============================
// 🔹 GET - ดึงข้อมูลทั้งหมด
// ===============================
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const registrations = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        sequence: true,
        firstNameTh: true,
        lastNameTh: true,
        firstNameEn: true,
        lastNameEn: true,
        email: true,
        phoneNumber: true,
        faculty: true,
        department: true,
        academicPosition: true,
        administrativePosition: true,
        nationalId: true,
        prefix: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // 🔍 ถอดรหัสเลขบัตร (หากเป็นข้อมูลเข้ารหัส)
    const decryptedData = registrations.map((item) => {
      const rawValue = item.nationalId || ''
      let decryptedValue = rawValue

      try {
        // ถ้ามี ":" ให้ถือว่าเป็นข้อมูลที่เข้ารหัส
        if (rawValue.includes(':')) {
          decryptedValue = decryptNationalId(rawValue)
          console.log(`🔓 Decrypted nationalId (${item.id}):`, decryptedValue)
        } else {
          console.log(`⚠️ Plain nationalId (${item.id}):`, decryptedValue)
        }
      } catch (error) {
        console.error(`❌ Failed to decrypt nationalId (${item.id}):`, rawValue)
        decryptedValue = '[DECRYPTION_FAILED]'
      }

      return {
        ...item,
        nationalId: decryptedValue, // ✅ ส่งคืนเลขบัตรเต็ม 13 หลัก
      }
    })

    return NextResponse.json({ registrations: decryptedData })
  } catch (error) {
    console.error('GET registrations error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}

// ===============================
// 🔹 POST - เพิ่มข้อมูลใหม่
// ===============================
export async function POST(request: NextRequest) {
  try {
    const admin = await verifyAdminToken(request)
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      firstNameTh,
      lastNameTh,
      firstNameEn,
      lastNameEn,
      email,
      phoneNumber,
      faculty,
      role,
      department,
      academicPosition,
      administrativePosition,
      nationalId,
      prefix,
    } = body

    // 🔹 ตรวจสอบอีเมลซ้ำ
    const existingEmail = await prisma.registration.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 400 })
    }

    // 🔹 เข้ารหัสเลขบัตรประชาชนก่อนบันทึก
    const encryptedNationalId = encryptNationalId(nationalId)

    // 🔹 ตรวจสอบเลขบัตรซ้ำ (โดยการถอดรหัส)
    const existingAll = await prisma.registration.findMany()
    const duplicated = existingAll.find((r) => {
      try {
        const plainId = r.nationalId.includes(':')
          ? decryptNationalId(r.nationalId)
          : r.nationalId
        return plainId === nationalId
      } catch {
        return false
      }
    })

    if (duplicated) {
      return NextResponse.json(
        { error: 'เลขบัตรประชาชนนี้ถูกใช้งานแล้ว' },
        { status: 400 }
      )
    }

    // 🔹 หา sequence ล่าสุด
    const lastRegistration = await prisma.registration.findFirst({
      orderBy: { sequence: 'desc' },
      select: { sequence: true },
    })
    const nextSequence = (lastRegistration?.sequence || 0) + 1

    // 🔹 บันทึกข้อมูล
    const registration = await prisma.registration.create({
      data: {
        sequence: nextSequence,
        firstNameTh,
        lastNameTh,
        firstNameEn,
        lastNameEn,
        email,
        phoneNumber,
        faculty,
        role,
        department,
        academicPosition,
        administrativePosition: administrativePosition || null,
        nationalId: encryptedNationalId, // ✅ เก็บแบบเข้ารหัส
        prefix,
      },
    })

    return NextResponse.json({
      message: 'เพิ่มข้อมูลสำเร็จ',
      registration,
    })
  } catch (error) {
    console.error('POST registration error:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการเพิ่มข้อมูล' },
      { status: 500 }
    )
  }
}
