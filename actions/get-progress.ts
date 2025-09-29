import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

export async function getProgress(userId: string, courseId: string): Promise<number> {
  try {
    await connectDB()
    
    // Get all published chapters for the course
    const publishedChapters = await db.chapter.find({ courseId, isPublished: true })
    
    // Calculate total videos across all chapters
    let totalVideos = 0
    publishedChapters.forEach(chapter => {
      totalVideos += (chapter.videos?.length || 0)
    })
    
    if (totalVideos === 0) return 0
    
    // Get completed videos for this course
    const completedVideos = await db.videoProgress.countDocuments({
      userId: userId.toString(),
      courseId: courseId,
      isCompleted: true,
    })
    
    const progressPercentage = (completedVideos / totalVideos) * 100
    return Math.round(progressPercentage)
  } catch {
    return 0
  }
}

export async function getProgressDetails(userId: string, courseId: string): Promise<{ completedVideos: number; totalVideos: number; progressPercentage: number }> {
  try {
    await connectDB()
    
    // Get all published chapters for the course
    const publishedChapters = await db.chapter.find({ courseId, isPublished: true })
    
    // Calculate total videos across all chapters
    let totalVideos = 0
    publishedChapters.forEach(chapter => {
      totalVideos += (chapter.videos?.length || 0)
    })
    
    if (totalVideos === 0) return { completedVideos: 0, totalVideos: 0, progressPercentage: 0 }
    
    // Get completed videos for this course
    const completedVideos = await db.videoProgress.countDocuments({
      userId: userId.toString(),
      courseId: courseId,
      isCompleted: true,
    })
    
    const progressPercentage = Math.round((completedVideos / totalVideos) * 100)
    return { completedVideos, totalVideos, progressPercentage }
  } catch {
    return { completedVideos: 0, totalVideos: 0, progressPercentage: 0 }
  }
}
