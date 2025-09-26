import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ระบบลงทะเบียน CISA',
  description: 'ระบบลงทะเบียนสำหรับองค์กร CISA',
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