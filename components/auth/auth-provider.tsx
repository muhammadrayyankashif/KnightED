'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    const data = await response.json()
    setUser(data.user)
    
    // Redirect based on role
    if (data.user.role === 'admin') {
      window.location.href = '/admin'
    } else if (data.user.role === 'teacher') {
      window.location.href = '/teacher/courses'
    } else {
      window.location.href = '/student/search'
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role = 'student') => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Registration failed')
    }

    const data = await response.json()
    setUser(data.user)
    
    // Redirect based on role
    if (data.user.role === 'admin') {
      window.location.href = '/admin'
    } else if (data.user.role === 'teacher') {
      window.location.href = '/teacher/courses'
    } else {
      window.location.href = '/student/search'
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include',
    })
    setUser(null)
    router.push('/sign-in')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
