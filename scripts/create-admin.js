const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const username = 'admin'
    const password = 'admin55'
    const email = 'admin@cisa.rmu.ac.th'
    const name = 'System Administrator'

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Check if admin already exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    })

    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }

    // Create admin user
    const admin = await prisma.admin.create({
      data: {
        username,
        password: hashedPassword,
        email,
        name,
        role: 'admin',
        isActive: true
      }
    })

    console.log('Admin user created successfully!')
    console.log('Username:', username)
    console.log('Password:', password)
    console.log('Email:', email)
    console.log('ID:', admin.id)

  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()