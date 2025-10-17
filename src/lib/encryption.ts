// lib/encryption.ts
import crypto from 'crypto'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!
const ALGORITHM = 'aes-256-gcm'

export function encryptNationalId(nationalId: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set')
  }
  
  console.log('Encrypting national ID:', nationalId)
  
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  )
  
  let encrypted = cipher.update(nationalId, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  // รวม iv + authTag + encrypted data
  const encryptedData = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted
  console.log('Encrypted national ID:', encryptedData)
  return encryptedData
}

export function decryptNationalId(encryptedData: string): string {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY is not set')
  }
  
  console.log('Decrypting national ID:', encryptedData)
  
  try {
    const parts = encryptedData.split(':')
    if (parts.length !== 3) {
      console.error('Invalid encrypted data format')
      throw new Error('Invalid encrypted data format')
    }
    
    const iv = Buffer.from(parts[0], 'hex')
    const authTag = Buffer.from(parts[1], 'hex')
    const encrypted = parts[2]
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY, 'hex'),
      iv
    )
    
    decipher.setAuthTag(authTag)
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    
    console.log('Decrypted national ID:', decrypted)
    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt national ID')
  }
}

// ฟังก์ชันสำหรับ masking เลขบัตร
export function maskNationalId(nationalId: string): string {
  if (nationalId.length < 4) return nationalId
  return nationalId.slice(0, -4).replace(/\d/g, 'X') + nationalId.slice(-4)
}