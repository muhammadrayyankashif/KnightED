import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    await connectDB()
    const user = await getCurrentUser(req)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const { courseId } = resolvedParams

    // Check if user is enrolled in the course
    const enrollment = await db.enrollment.findOne({
      userId: user.userId,
      courseId,
    })

    if (!enrollment) {
      return NextResponse.json({ error: 'Not enrolled in course' }, { status: 403 })
    }

    // Get all published chapters for the course
    const chapters = await db.chapter.find({
      courseId,
      isPublished: true,
    }).sort({ position: 1 })

    // Get all video progress for this user and course
    const videoProgress = await db.videoProgress.find({
      userId: user.userId,
      courseId,
    })

    // Calculate progress for each chapter and overall course
    let totalVideos = 0
    let completedVideos = 0
    const chapterProgress: Array<{
      chapterId: string
      chapterTitle: string
      totalVideos: number
      completedVideos: number
      progressPercentage: number
      videos: Array<{
        videoIndex: number
        videoTitle: string
        isCompleted: boolean
        completedAt?: string
      }>
    }> = []

    chapters.forEach(chapter => {
      const chapterVideos = chapter.videos || []
      const chapterVideoProgress = videoProgress.filter(
        vp => vp.chapterId === chapter._id.toString()
      )

      const chapterCompletedVideos = chapterVideoProgress.filter(vp => vp.isCompleted).length
      const chapterProgressPercentage = chapterVideos.length > 0 
        ? (chapterCompletedVideos / chapterVideos.length) * 100 
        : 0

      const videos = chapterVideos.map((video: any, index: number) => {
        const progress = chapterVideoProgress.find(vp => vp.videoIndex === index)
        return {
          videoIndex: index,
          videoTitle: video.title,
          isCompleted: progress?.isCompleted || false,
          completedAt: progress?.completedAt?.toISOString() || undefined,
        }
      })

      chapterProgress.push({
        chapterId: chapter._id.toString(),
        chapterTitle: chapter.title,
        totalVideos: chapterVideos.length,
        completedVideos: chapterCompletedVideos,
        progressPercentage: chapterProgressPercentage,
        videos,
      })

      totalVideos += chapterVideos.length
      completedVideos += chapterCompletedVideos
    })

    const overallProgressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0

    return NextResponse.json({
      courseId,
      userId: user.userId,
      overallProgress: {
        totalVideos,
        completedVideos,
        progressPercentage: overallProgressPercentage,
      },
      chapterProgress,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
