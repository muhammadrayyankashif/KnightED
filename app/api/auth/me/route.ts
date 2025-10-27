import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await connectDB()
    
    // Debug: Log cookies
    const cookies = req.cookies.get('auth-token')
    const user = await getCurrentUser(req)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Safely convert ObjectId to string
    const userId = safeObjectIdToString(user.userId)
    const userData = await db.user.findById(userId)
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        userId: userData._id.toString(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
      },
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
