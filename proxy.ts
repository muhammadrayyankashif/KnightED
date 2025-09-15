import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const publicRoutes = ['/api/webhook', '/api/auth/login', '/api/auth/register']
const authRoutes = ['/api/auth/login', '/api/auth/register', '/sign-in', '/sign-up', '/']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for auth token
  const token = req.cookies.get('auth-token')?.value

  // If no token and trying to access protected route, redirect to sign-in
  if (!token && !authRoutes.some((route) => pathname.startsWith(route))) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }

  // If token exists, verify it
  if (token) {
    const payload = await verifyToken(token)
    if (!payload) {
      // Invalid token, clear cookie and redirect
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        : NextResponse.redirect(new URL('/sign-in', req.url))

      response.cookies.set('auth-token', '', { maxAge: 0 })
      return response
    }

    // Role-based access control
    const userRole = payload.role

    // Teachers can only access teacher routes
    if (userRole === 'teacher') {
      // Allow teacher routes
      if (pathname.startsWith('/teacher')) {
        return NextResponse.next()
      }
      // Redirect teachers away from student routes
      if (pathname.startsWith('/student') || pathname.startsWith('/courses') || pathname === '/') {
        return NextResponse.redirect(new URL('/teacher/courses', req.url))
      }
    }

    // Admins can access admin routes
    if (userRole === 'admin') {
      if (pathname.startsWith('/admin')) {
        return NextResponse.next()
      }
      // Admins can also access teacher routes
      if (pathname.startsWith('/teacher')) {
        return NextResponse.next()
      }
    }

    // Students can access student routes and course pages
    if (userRole === 'student') {
      // Allow student routes and course pages
      if (pathname.startsWith('/student') || pathname.startsWith('/courses') || pathname === '/') {
        return NextResponse.next()
      }
      // Redirect students away from teacher/admin routes
      if (pathname.startsWith('/teacher') || pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/student/search', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
