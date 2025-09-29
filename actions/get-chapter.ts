// Removed Prisma import - using MongoDB now
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'

type GetChapterArgs = {
  userId: string
  courseId: string
  chapterId: string
}

export async function getChapter({ userId, courseId, chapterId }: GetChapterArgs) {
  try {
    await connectDB()
    const enrollment = await db.enrollment.findOne({ userId: userId.toString(), courseId })
    const course = await db.course.findOne({ _id: courseId, isPublished: true })
    const chapter = await db.chapter.findOne({ _id: chapterId, isPublished: true })

    if (!chapter || !course) {
      throw new Error('Chapter or course not found!')
    }

    let attachments: any[] = []
    let nextChapter: any = null

    if (enrollment) {
      attachments = await db.attachment.find({ courseId })
    }

    if (chapter.isFree || enrollment) {
      nextChapter = await db.chapter.findOne({
        courseId,
        isPublished: true,
        position: { $gt: chapter.position }
      }).sort({ position: 1 })
    }

    const userProgress = await db.userProgress.findOne({ userId: userId.toString(), chapterId })

    // Serialize MongoDB objects to plain objects to avoid serialization warnings
    const serializedChapter = chapter ? {
      _id: chapter._id.toString(),
      title: chapter.title,
      position: chapter.position,
      isPublished: chapter.isPublished,
      isFree: chapter.isFree,
      courseId: chapter.courseId.toString(),
      createdAt: chapter.createdAt,
      updatedAt: chapter.updatedAt,
      description: chapter.description,
      videoUrl: chapter.videoUrl,
      videos: chapter.videos ? chapter.videos.map((video: any) => ({
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        position: video.position,
      })) : [],
    } : null

    const serializedCourse = course ? {
      _id: course._id.toString(),
      title: course.title,
      description: course.description,
      imageUrl: course.imageUrl,
      isPublished: course.isPublished,
      createdById: course.createdById.toString(),
      categoryId: course.categoryId?.toString(),
      categoryIds: course.categoryIds?.map((id: any) => id.toString()) || [],
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    } : null

    const serializedAttachments = attachments.map(attachment => ({
      _id: attachment._id.toString(),
      name: attachment.name,
      url: attachment.url,
      courseId: attachment.courseId.toString(),
      fileExtension: attachment.fileExtension || '',
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    }))

    const serializedNextChapter = nextChapter ? {
      _id: nextChapter._id.toString(),
      title: nextChapter.title,
      position: nextChapter.position,
      isPublished: nextChapter.isPublished,
      isFree: nextChapter.isFree,
      courseId: nextChapter.courseId.toString(),
      createdAt: nextChapter.createdAt,
      updatedAt: nextChapter.updatedAt,
      description: nextChapter.description,
      videoUrl: nextChapter.videoUrl,
      videos: nextChapter.videos ? nextChapter.videos.map((video: any) => ({
        title: video.title,
        youtubeUrl: video.youtubeUrl,
        position: video.position,
      })) : [],
    } : null

    const serializedUserProgress = userProgress ? {
      _id: userProgress._id.toString(),
      userId: userProgress.userId.toString(),
      chapterId: userProgress.chapterId.toString(),
      isCompleted: userProgress.isCompleted,
      createdAt: userProgress.createdAt,
      updatedAt: userProgress.updatedAt,
    } : null

    const serializedEnrollment = enrollment ? {
      _id: enrollment._id.toString(),
      userId: enrollment.userId.toString(),
      courseId: enrollment.courseId.toString(),
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    } : null

    return {
      chapter: serializedChapter,
      course: serializedCourse,
      attachments: serializedAttachments,
      nextChapter: serializedNextChapter,
      userProgress: serializedUserProgress,
      enrollment: serializedEnrollment,
    }
  } catch {
    return {
      chapter: null,
      course: null,
      attachments: [],
      nextChapter: null,
      userProgress: null,
      enrollment: null,
    }
  }
}
