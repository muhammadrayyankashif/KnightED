import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { isAdmin } from '@/lib/teacher'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ paperId: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { paperId } = await params
    const pastPaper = await db.pastPaper.findById(paperId)

    if (!pastPaper) {
      return NextResponse.json({ error: 'Past paper not found' }, { status: 404 })
    }

    await db.pastPaper.findByIdAndDelete(paperId)

    return NextResponse.json({ message: 'Past paper deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
