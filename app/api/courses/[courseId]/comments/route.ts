import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

// GET - Fetch comments for a specific course
export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use aggregation pipeline to fetch comments with user data in a single query
    const pipeline: any[] = [
      {
        $match: {
          courseId: resolvedParams.courseId,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      // Convert userId string to ObjectId for lookup
      {
        $addFields: {
          userIdObjectId: { $toObjectId: '$userId' },
        },
      },
      // Lookup comment user
      {
        $lookup: {
          from: 'users',
          localField: 'userIdObjectId',
          foreignField: '_id',
          as: 'commentUserData',
        },
      },
      // Project final response
      {
        $project: {
          _id: { $toString: '$_id' },
          content: 1,
          courseId: 1,
          createdAt: 1,
          updatedAt: 1,
          userId: {
            $cond: [
              { $gt: [{ $size: '$commentUserData' }, 0] },
              {
                _id: { $toString: { $arrayElemAt: ['$commentUserData._id', 0] } },
                firstName: { $arrayElemAt: ['$commentUserData.firstName', 0] },
                lastName: { $arrayElemAt: ['$commentUserData.lastName', 0] },
                email: { $arrayElemAt: ['$commentUserData.email', 0] },
                role: { $arrayElemAt: ['$commentUserData.role', 0] },
              },
              null,
            ],
          },
        },
      },
    ]

    const commentsWithUsers = await db.courseComment.aggregate(pipeline)

    return NextResponse.json(commentsWithUsers)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error fetching course comments:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new course comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string }> }) {
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

    // Check if user is enrolled in the course or is a teacher/admin
    const enrollment = await db.enrollment.findOne({
      userId: user.userId.toString(),
      courseId: resolvedParams.courseId,
    })

    // Allow teachers and admins to comment on any course
    const isTeacherOrAdmin = user.role === 'teacher' || user.role === 'admin'

    if (!enrollment && !isTeacherOrAdmin) {
      return NextResponse.json({ error: 'You must be enrolled in this course to comment' }, { status: 403 })
    }

    // Create the comment
    const comment = await db.courseComment.create({
      content: content.trim(),
      courseId: resolvedParams.courseId,
      userId: user.userId.toString(),
    })

    // Get user details
    const commentUser = await db.user.findById(comment.userId)

    // Create notification for the course teacher
    const course = await db.course.findById(resolvedParams.courseId)
    if (course && course.createdById && course.createdById !== user.userId.toString()) {
      await db.notification.create({
        userId: course.createdById,
        type: 'comment_reply',
        content: `${commentUser?.firstName} ${commentUser?.lastName} commented on ${course.title}`,
        commentId: comment._id.toString(),
        courseId: resolvedParams.courseId,
        repliedByUserId: user.userId.toString(),
        read: false,
      })
    }

    return NextResponse.json({
      _id: comment._id.toString(),
      content: comment.content,
      courseId: comment.courseId,
      userId: commentUser ? {
        _id: commentUser._id.toString(),
        firstName: commentUser.firstName,
        lastName: commentUser.lastName,
        email: commentUser.email,
        role: commentUser.role,
      } : null,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error creating course comment:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
