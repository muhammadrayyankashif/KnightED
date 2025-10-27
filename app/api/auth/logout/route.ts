import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' })
  
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: false, // Set to false for development
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })

  return response
}
