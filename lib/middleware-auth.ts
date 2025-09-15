import { jwtVerify, JWTPayload as JoseJWTPayload } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key')

export interface CustomJWTPayload extends JoseJWTPayload {
  userId: string
  email: string
  role: string
}

export async function verifyToken(token: string): Promise<CustomJWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload as CustomJWTPayload
  } catch (error) {
    return null
  }
}
