import { JWTPayload } from './auth'

export function isTeacher(user: JWTPayload | null): boolean {
  return user?.role === 'teacher' || user?.role === 'admin'
}

export function isAdmin(user: JWTPayload | null): boolean {
  return user?.role === 'admin'
}

export function isStudent(user: JWTPayload | null): boolean {
  return user?.role === 'student'
}