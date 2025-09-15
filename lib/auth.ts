import { SignJWT, jwtVerify, JWTPayload as JoseJWTPayload } from 'jose'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import { db } from './db'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export interface CustomJWTPayload extends JoseJWTPayload {
  userId: string
  email: string
  role: string
}

// Re-export for backward compatibility
export type JWTPayload = CustomJWTPayload

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function generateToken(payload: CustomJWTPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as CustomJWTPayload
  } catch (error) {
    return null
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<CustomJWTPayload | null> {
  if (req) {
    const token = req.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    return await verifyToken(token)
  } else {
    // For server components, we need to manually get the cookie from headers
    const { cookies } = await import('next/headers')
    const token = (await cookies()).get('auth-token')?.value
    if (!token) return null
    return await verifyToken(token)
  }
}

export async function getCurrentUserFromToken(token: string): Promise<CustomJWTPayload | null> {
  return await verifyToken(token)
}

// Helper function to safely convert ObjectId to string
export function safeObjectIdToString(obj: any): string {
  if (typeof obj === 'string') {
    return obj
  }
  if (typeof obj === 'object' && obj !== null) {
    return obj.toString()
  }
  return String(obj)
}
