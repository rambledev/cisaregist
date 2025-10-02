import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ระบบลงทะเบียน CISA มหาวิทยาลัยราชภัฏมหาสารคาม',
  description: 'ระบบลงทะเบียนสำหรับองค์กร CISA มหาวิทยาลัยราชภัฏมหาสารคาม',
  icons: {
    icon: "/100.svg",       // ไอคอนหลัก
    shortcut: "/100.svg",   // สำหรับ browser เก่า
    apple: "/100.svg",      // สำหรับ iOS
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${inter.className} bg-gray-50`}>
        {children}
      </body>
    </html>
  )
}