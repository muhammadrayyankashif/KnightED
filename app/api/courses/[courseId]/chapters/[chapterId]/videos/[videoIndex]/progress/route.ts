import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string; videoIndex: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { courseId, chapterId, videoIndex } = resolvedParams
    const { isCompleted } = await req.json()

    // Verify the chapter exists and belongs to the course
    const chapter = await db.chapter.findOne({ 
      _id: chapterId, 
      courseId,
      isPublished: true 
    })
    
    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    // Verify the video index is valid
    const videoIndexNum = parseInt(videoIndex)
    if (isNaN(videoIndexNum) || videoIndexNum < 0 || videoIndexNum >= (chapter.videos?.length || 0)) {
      return NextResponse.json({ error: 'Invalid video index' }, { status: 400 })
    }

    // Check if user is enrolled in the course
    const enrollment = await db.enrollment.findOne({
      userId: user.userId,
      courseId,
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 })
    }

    // Create or update video progress
    const videoProgress = await db.videoProgress.findOneAndUpdate(
      { 
        userId: user.userId, 
        courseId,
        chapterId,
        videoIndex: videoIndexNum
      },
      {
        userId: user.userId,
        courseId,
        chapterId,
        videoIndex: videoIndexNum,
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      _id: videoProgress._id.toString(),
      userId: videoProgress.userId,
      courseId: videoProgress.courseId,
      chapterId: videoProgress.chapterId,
      videoIndex: videoProgress.videoIndex,
      isCompleted: videoProgress.isCompleted,
      completedAt: videoProgress.completedAt?.toISOString() || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; chapterId: string; videoIndex: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { courseId, chapterId, videoIndex } = resolvedParams

    const videoIndexNum = parseInt(videoIndex)
    if (isNaN(videoIndexNum)) {
      return NextResponse.json({ error: 'Invalid video index' }, { status: 400 })
    }

    const videoProgress = await db.videoProgress.findOne({
      userId: user.userId,
      courseId,
      chapterId,
      videoIndex: videoIndexNum,
    })

    if (!videoProgress) {
      return NextResponse.json({
        _id: null,
        userId: user.userId,
        courseId,
        chapterId,
        videoIndex: videoIndexNum,
        isCompleted: false,
        completedAt: null,
      })
    }

    return NextResponse.json({
      _id: videoProgress._id.toString(),
      userId: videoProgress.userId,
      courseId: videoProgress.courseId,
      chapterId: videoProgress.chapterId,
      videoIndex: videoProgress.videoIndex,
      isCompleted: videoProgress.isCompleted,
      completedAt: videoProgress.completedAt?.toISOString() || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
