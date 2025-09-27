"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react'

const loginSchema = z.object({
  username: z.string().min(1, 'กรุณาใส่ชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณาใส่รหัสผ่าน'),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function AdminLogin() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  // เช็คว่า login อยู่แล้วหรือไม่
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Checking existing authentication...')
      try {
        const response = await fetch('/api/auth/verify')
        console.log('✅ Auth check response status:', response.status)
        
        if (response.ok) {
          console.log('✅ User already authenticated, redirecting to dashboard')
          router.push('/admin/dashboard')
        } else {
          console.log('ℹ️ User not authenticated, staying on login page')
        }
      } catch (error) {
        console.log('❌ Auth check failed:', error)
        // ไม่ได้ login อยู่ ให้อยู่หน้า login
      }
    }
    checkAuth()
  }, [router])

  const onSubmit = async (data: LoginFormData) => {
    console.log('🚀 Login attempt started')
    console.log('📝 Form data:', { username: data.username, password: '***' })
    console.log('🌍 Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A')
    console.log('🔧 Form submission triggered')
    
    setIsLoading(true)
    setError('')

    try {
      console.log('📡 Preparing fetch request...')
      console.log('📡 Sending login request to /api/auth/login')
      console.log('📡 Request body:', JSON.stringify({ username: data.username, password: '***' }))
      
      const fetchStart = Date.now()
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const fetchEnd = Date.now()

      console.log('📥 Login response received')
      console.log('⏱️ Fetch time:', fetchEnd - fetchStart, 'ms')
      console.log('📊 Response status:', response.status)
      console.log('📊 Response ok:', response.ok)
      console.log('📊 Response type:', response.type)
      console.log('📊 Response url:', response.url)
      console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

      let result
      let rawText = ''
      try {
        rawText = await response.text()
        console.log('📄 Raw response text:', rawText)
        result = JSON.parse(rawText)
        console.log('📄 Parsed response body:', result)
      } catch (parseError) {
        console.error('❌ Failed to parse response as JSON:', parseError)
        console.log('📄 Raw response length:', rawText.length)
        console.log('📄 Raw response preview:', rawText.substring(0, 200))
        throw new Error(`Invalid JSON response from server. Raw: ${rawText.substring(0, 100)}`)
      }

      if (response.ok) {
        console.log('✅ Login successful!')
        console.log('👤 Admin info:', result.admin)
        
        if (typeof window !== 'undefined') {
          console.log('🍪 Document cookies before:', document.cookie)
          console.log('🍪 Response headers Set-Cookie:', response.headers.get('set-cookie'))
          
          // Try to extract token from response and set manually
          const setCookieHeader = response.headers.get('set-cookie')
          if (setCookieHeader) {
            const tokenMatch = setCookieHeader.match(/admin-token=([^;]+)/)
            if (tokenMatch) {
              const token = tokenMatch[1]
              console.log('🍪 Extracted token:', token.substring(0, 20) + '...')
              
              // Set cookie manually as fallback
              document.cookie = `admin-token=${token}; path=/; max-age=86400; SameSite=Lax`
              console.log('🍪 Manually set cookie')
            }
          }
          
          // เช็ค cookies หลังจากได้ response
          setTimeout(() => {
            console.log('🍪 Document cookies after 100ms:', document.cookie)
            console.log('🍪 Available cookies:', document.cookie.split(';').map(c => c.trim()))
          }, 100)
          
          setTimeout(() => {
            console.log('🍪 Document cookies after 500ms:', document.cookie)
          }, 500)
        }
        
        // Login สำเร็จ redirect ไป dashboard
        console.log('🔄 Redirecting to dashboard...')
        
        // ลองรอให้ cookie set ก่อน redirect
        setTimeout(() => {
          router.push('/admin/dashboard')
          router.refresh()
        }, 1000) // รอ 1 วินาที
      } else {
        console.log('❌ Login failed with status:', response.status)
        console.log('❌ Login failed with error:', result.error)
        setError(result.error || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ')
      }
    } catch (error) {
      console.error('❌ Network/Fetch error during login:', error)
      console.error('❌ Error type:', typeof error)
      console.error('❌ Error constructor:', (error as any)?.constructor?.name)
      if (error instanceof Error) {
        console.error('❌ Error message:', error.message)
        console.error('❌ Error stack:', error.stack)
      }
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อ: ' + (error instanceof Error ? error.message : String(error)))
    } finally {
      console.log('🏁 Login attempt finished')
      setIsLoading(false)
    }
  }

  const testDirectLogin = async () => {
    console.log('🧪 Testing direct login...')
    try {
      const testData = { username: 'admin', password: 'admin123' } // ใส่ username/password จริง
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      })
      console.log('📡 Direct Login Response:', response.status, response.statusText)
      console.log('🍪 Response Set-Cookie header:', response.headers.get('set-cookie'))
      const data = await response.text()
      console.log('📄 Direct Login Data:', data)
      
      // Check cookies immediately
      if (typeof window !== 'undefined') {
        console.log('🍪 Cookies after login:', document.cookie)
      }
      
      alert(`Login test: ${response.status} - Check console for cookie details`)
    } catch (error) {
      console.error('❌ Direct Login Error:', error)
      alert('Direct login test failed: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  const checkCookies = () => {
    if (typeof window !== 'undefined') {
      console.log('🍪 Current cookies:', document.cookie)
      console.log('🍪 Cookie breakdown:', document.cookie.split(';').map(c => c.trim()))
      alert('Current cookies: ' + document.cookie)
    } else {
      alert('Window not available')
    }
  }

  const testVerifyAPI = async () => {
    console.log('🧪 Testing API accessibility...')
    try {
      const response = await fetch('/api/auth/verify')
      console.log('📡 Verify API Response:', response.status, response.statusText)
      const data = await response.text()
      console.log('📄 Verify API Data:', data)
    } catch (error) {
      console.error('❌ Verify API Error:', error)
    }
  }

  const testHealthCheck = async () => {
    console.log('🏥 Running health check...')
    try {
      const response = await fetch('/api/health')
      console.log('🏥 Health Check Response:', response.status, response.statusText)
      const data = await response.json()
      console.log('🏥 Health Check Data:', data)
      alert(`Health Status: ${data.status}\nDB: ${data.checks.database}\nJWT: ${data.checks.env_variables.JWT_SECRET}`)
    } catch (error) {
      console.error('❌ Health Check Error:', error)
      alert('Health check failed: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            ระบบจัดการ CISA
          </h1>
          <p className="text-gray-600 mt-2">
            เข้าสู่ระบบสำหรับผู้ดูแลระบบ
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อผู้ใช้
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username')}
                  type="text"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ใส่ชื่อผู้ใช้"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ใส่รหัสผ่าน"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center gap-2 py-3 px-4 rounded-md text-white font-medium transition-colors ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังเข้าสู่ระบบ...
                </>
              ) : (
                'เข้าสู่ระบบ'
              )}
            </button>
          </form>

          {/* Debug Info */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <p className="text-xs text-gray-600 mb-2">Debug Info:</p>
            <p className="text-xs text-gray-500">Environment: {process.env.NODE_ENV || 'development'}</p>
            <p className="text-xs text-gray-500">Current URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
            <p className="text-xs text-gray-500">User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
            
            {/* Test Buttons */}
            <div className="mt-2 space-x-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={testVerifyAPI}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700"
              >
                Test Verify API
              </button>
              
              <button
                type="button"
                onClick={testHealthCheck}
                className="px-3 py-1 text-xs bg-blue-200 hover:bg-blue-300 rounded text-blue-700"
              >
                Health Check
              </button>
              
              <button
                type="button"
                onClick={testDirectLogin}
                className="px-3 py-1 text-xs bg-green-200 hover:bg-green-300 rounded text-green-700"
              >
                Test Direct Login
              </button>
              
              <button
                type="button"
                onClick={checkCookies}
                className="px-3 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded text-yellow-700"
              >
                Check Cookies
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            ระบบลงทะเบียน CISA © 2025 
          </p>
        </div>
      </div>
    </div>
  )
}