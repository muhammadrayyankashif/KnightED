import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

// GET - Fetch notifications for the current user
export async function GET(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only allow students and teachers to see notifications
    if (user.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot view notifications' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const filterRead = searchParams.get('read')
    const filterType = searchParams.get('type')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 per page
    const skip = Math.max(parseInt(searchParams.get('skip') || '0'), 0)

    // Build aggregation pipeline
    const pipeline: any[] = [
      {
        $match: {
          userId: user.userId.toString(),
          ...(filterRead !== null && { read: filterRead === 'true' }),
          ...(filterType && { type: filterType }),
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
      // Lookup repliedByUser
      {
        $lookup: {
          from: 'users',
          localField: 'repliedByUserId',
          foreignField: '_id',
          as: 'repliedByUserData',
        },
      },
      // Lookup comment - convert commentId to ObjectId first
      {
        $addFields: {
          commentIdObjectId: {
            $cond: [
              { $ne: ['$commentId', null] },
              { $toObjectId: '$commentId' },
              null,
            ],
          },
        },
      },
      // Lookup video comment (from comments collection)
      {
        $lookup: {
          from: 'comments',
          localField: 'commentIdObjectId',
          foreignField: '_id',
          as: 'videoCommentData',
        },
      },
      // Lookup course comment (from coursecomments collection)
      {
        $lookup: {
          from: 'coursecomments',
          localField: 'commentIdObjectId',
          foreignField: '_id',
          as: 'courseCommentData',
        },
      },
      // Merge both comment types - use whichever has data
      {
        $addFields: {
          commentData: {
            $cond: [
              { $gt: [{ $size: '$videoCommentData' }, 0] },
              '$videoCommentData',
              '$courseCommentData',
            ],
          },
        },
      },
      // Convert courseId to ObjectId for lookup
      {
        $addFields: {
          courseIdObjectId: {
            $cond: [
              { $ne: ['$courseId', null] },
              { $toObjectId: '$courseId' },
              null,
            ],
          },
          chapterIdObjectId: {
            $cond: [
              { $ne: ['$chapterId', null] },
              { $toObjectId: '$chapterId' },
              null,
            ],
          },
        },
      },
      // Lookup course
      {
        $lookup: {
          from: 'courses',
          localField: 'courseIdObjectId',
          foreignField: '_id',
          as: 'courseData',
        },
      },
      // Lookup chapter
      {
        $lookup: {
          from: 'chapters',
          localField: 'chapterIdObjectId',
          foreignField: '_id',
          as: 'chapterData',
        },
      },
      // Nested lookup for comment user - need to use a nested pipeline since commentData is an array
      {
        $lookup: {
          from: 'users',
          let: { commentUserId: { $arrayElemAt: ['$commentData.userId', 0] } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$_id', { $toObjectId: '$$commentUserId' }] },
              },
            },
          ],
          as: 'commentUserData',
        },
      },
      // Project and format response
      {
        $project: {
          _id: { $toString: '$_id' },
          userId: 1,
          type: 1,
          content: 1,
          read: 1,
          commentId: { $toString: { $ifNull: ['$commentId', null] } },
          originalCommentId: { $toString: { $ifNull: ['$originalCommentId', null] } },
          courseId: { $toString: { $ifNull: ['$courseId', null] } },
          chapterId: { $toString: { $ifNull: ['$chapterId', null] } },
          videoIndex: 1,
          videoTitle: 1,
          createdAt: 1,
          updatedAt: 1,
          repliedByUser: {
            $cond: [
              { $gt: [{ $size: '$repliedByUserData' }, 0] },
              {
                _id: { $toString: { $arrayElemAt: ['$repliedByUserData._id', 0] } },
                firstName: { $arrayElemAt: ['$repliedByUserData.firstName', 0] },
                lastName: { $arrayElemAt: ['$repliedByUserData.lastName', 0] },
                email: { $arrayElemAt: ['$repliedByUserData.email', 0] },
                role: { $arrayElemAt: ['$repliedByUserData.role', 0] },
              },
              null,
            ],
          },
          comment: {
            $cond: [
              { $gt: [{ $size: '$commentData' }, 0] },
              {
                _id: { $toString: { $arrayElemAt: ['$commentData._id', 0] } },
                content: { $arrayElemAt: ['$commentData.content', 0] },
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
              null,
            ],
          },
          course: {
            $cond: [
              { $gt: [{ $size: '$courseData' }, 0] },
              {
                _id: { $toString: { $arrayElemAt: ['$courseData._id', 0] } },
                title: { $arrayElemAt: ['$courseData.title', 0] },
              },
              null,
            ],
          },
          chapter: {
            $cond: [
              { $gt: [{ $size: '$chapterData' }, 0] },
              {
                _id: { $toString: { $arrayElemAt: ['$chapterData._id', 0] } },
                title: { $arrayElemAt: ['$chapterData.title', 0] },
              },
              null,
            ],
          },
        },
      },
    ]

    const notificationsWithDetails = await db.notification.aggregate(pipeline)

    return NextResponse.json(notificationsWithDetails)
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error fetching notifications:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create a new notification (internal use only)
export async function POST(req: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)

    // Only admin users can create notifications via API
    // Regular API calls should only create notifications via internal routes
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - only admins can create notifications' },
        { status: 403 }
      )
    }

    const body = await req.json()

    // Validate required fields
    const { userId, type, content } = body

    if (!userId || !type || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, type, content' },
        { status: 400 }
      )
    }

    // Validate notification type enum
    const validTypes = ['comment_reply', 'course_update', 'chapter_upload']
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid notification type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate content is a string and not empty
    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      )
    }

    const notification = await db.notification.create({
      userId,
      type,
      content: content.trim(),
      ...body,
    })

    return NextResponse.json({
      _id: notification._id.toString(),
      userId: notification.userId,
      type: notification.type,
      content: notification.content,
      read: notification.read,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error('Error creating notification:', error instanceof Error ? error.message : error)
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
