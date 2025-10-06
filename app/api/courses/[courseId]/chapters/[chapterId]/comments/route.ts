import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

// GET - Fetch comments for a specific video
export async function GET(req: NextRequest, { params }: { params: Promise<{ courseId: string, chapterId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const videoIndex = parseInt(searchParams.get('videoIndex') || '0')

    // Use aggregation pipeline to fetch comments with replies and user data in a single query
    const pipeline: any[] = [
      // Match top-level comments for this video
      {
        $match: {
          courseId: resolvedParams.courseId,
          chapterId: resolvedParams.chapterId,
          videoIndex,
          parentCommentId: null,
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
      // Lookup replies
      {
        $lookup: {
          from: 'comments',
          let: { commentIdStr: { $toString: '$_id' } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$parentCommentId', '$$commentIdStr'] },
              },
            },
            {
              $sort: { createdAt: 1 },
            },
            // Convert userId string to ObjectId for lookup
            {
              $addFields: {
                userIdObjectId: { $toObjectId: '$userId' },
              },
            },
            // Lookup reply user
            {
              $lookup: {
                from: 'users',
                localField: 'userIdObjectId',
                foreignField: '_id',
                as: 'replyUserData',
              },
            },
            // Project reply with user data
            {
              $project: {
                _id: { $toString: '$_id' },
                content: 1,
                videoIndex: 1,
                chapterId: 1,
                courseId: 1,
                parentCommentId: 1,
                createdAt: 1,
                updatedAt: 1,
                userId: {
                  $cond: [
                    { $gt: [{ $size: '$replyUserData' }, 0] },
                    {
                      _id: { $toString: { $arrayElemAt: ['$replyUserData._id', 0] } },
                      firstName: { $arrayElemAt: ['$replyUserData.firstName', 0] },
                      lastName: { $arrayElemAt: ['$replyUserData.lastName', 0] },
                      email: { $arrayElemAt: ['$replyUserData.email', 0] },
                      role: { $arrayElemAt: ['$replyUserData.role', 0] },
                    },
                    null,
                  ],
                },
              },
            },
          ],
          as: 'replies',
        },
      },
      // Project final response
      {
        $project: {
          _id: { $toString: '$_id' },
          content: 1,
          videoIndex: 1,
          chapterId: 1,
          courseId: 1,
          parentCommentId: 1,
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
          replies: 1,
        },
      },
    ]

    const commentsWithReplies = await db.comment.aggregate(pipeline)

    return NextResponse.json(commentsWithReplies)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error fetching comments:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ courseId: string, chapterId: string }> }) {
  try {
    await connectDB()
    const resolvedParams = await params
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, videoIndex, parentCommentId } = await req.json()

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 })
    }

    if (content.length > 1000) {
      return NextResponse.json({ error: 'Comment is too long (max 1000 characters)' }, { status: 400 })
    }

    // Create the comment
    const comment = await db.comment.create({
      content: content.trim(),
      videoIndex: parseInt(videoIndex) || 0,
      chapterId: resolvedParams.chapterId,
      courseId: resolvedParams.courseId,
      userId: user.userId.toString(),
      parentCommentId: parentCommentId || null,
    })

    // Get user details
    const commentUser = await db.user.findById(comment.userId)

    // Get chapter to find video title
    const chapter = await db.chapter.findById(resolvedParams.chapterId)
    const videoIndexNum = parseInt(videoIndex) || 0
    let videoTitle = 'Unknown Video'

    if (chapter && chapter.videos && chapter.videos[videoIndexNum]) {
      videoTitle = chapter.videos[videoIndexNum].title
    }

    // Create notifications for this comment
    if (parentCommentId) {
      // If this is a reply, notify the original comment author
      const originalComment = await db.comment.findById(parentCommentId)
      if (originalComment && originalComment.userId !== user.userId.toString()) {
        // Create notification for the original comment author
        await db.notification.create({
          userId: originalComment.userId,
          type: 'comment_reply',
          content: `${commentUser?.firstName} ${commentUser?.lastName} replied to your comment`,
          commentId: comment._id.toString(),
          originalCommentId: parentCommentId,
          repliedByUserId: user.userId.toString(),
          courseId: resolvedParams.courseId,
          chapterId: resolvedParams.chapterId,
          videoIndex: videoIndexNum,
          videoTitle,
          read: false,
        })
      }
    } else {
      // If this is a top-level comment on a video, notify the course teacher(s)
      const course = await db.course.findById(resolvedParams.courseId)
      if (course) {
        // Only notify the teacher who created the course
        if (course.createdById && course.createdById !== user.userId.toString()) {
          await db.notification.create({
            userId: course.createdById,
            type: 'comment_reply',
            content: `${commentUser?.firstName} ${commentUser?.lastName} commented on a video in ${course.title}`,
            commentId: comment._id.toString(),
            courseId: resolvedParams.courseId,
            chapterId: resolvedParams.chapterId,
            videoIndex: videoIndexNum,
            videoTitle,
            repliedByUserId: user.userId.toString(),
            read: false,
          })
        }
      }
    }

    return NextResponse.json({
      _id: comment._id.toString(),
      content: comment.content,
      videoIndex: comment.videoIndex,
      chapterId: comment.chapterId,
      courseId: comment.courseId,
      userId: commentUser ? {
        _id: commentUser._id.toString(),
        firstName: commentUser.firstName,
        lastName: commentUser.lastName,
        email: commentUser.email,
        role: commentUser.role,
      } : null,
      parentCommentId: comment.parentCommentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error creating comment:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
