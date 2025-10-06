import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

// PUT - Update a course comment
export async function PUT(req: NextRequest, { params }: { params: Promise<{ courseId: string, commentId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 })
    }

    // Find the comment and check ownership
    const comment = await db.courseComment.findById(resolvedParams.commentId)
    
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.userId.toString() !== user.userId.toString()) {
      return NextResponse.json({ error: 'Unauthorized to edit this comment' }, { status: 403 })
    }

    // Update the comment
    const updatedComment = await db.courseComment.findByIdAndUpdate(
      resolvedParams.commentId,
      { content: content.trim() },
      { new: true }
    )

    // Get user details
    const commentUser = await db.user.findById(updatedComment.userId)

    return NextResponse.json({
      _id: updatedComment._id.toString(),
      content: updatedComment.content,
      courseId: updatedComment.courseId,
      userId: commentUser ? {
        _id: commentUser._id.toString(),
        firstName: commentUser.firstName,
        lastName: commentUser.lastName,
        email: commentUser.email,
        role: commentUser.role,
      } : null,
      createdAt: updatedComment.createdAt,
      updatedAt: updatedComment.updatedAt,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
