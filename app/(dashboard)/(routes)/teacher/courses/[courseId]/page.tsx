import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { File, LayoutDashboard, ListChecks, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { IconBadge } from '@/components/icon-badge'
import { TitleForm } from './components/title-form'
import { DescriptionForm } from './components/description-form'
import { ImageForm } from './components/image-form'
import { CategoriesForm } from './components/categories-form'
import { AttachmentForm } from './components/attachment-form'
import { ChaptersForm } from './components/chapters-form'
import { Banner } from '@/components/banner'
import Actions from './components/actions'

type CourseIdPageProps = {
  params: Promise<{
    courseId: string
  }>
}

const CourseIdPage = async ({ params }: CourseIdPageProps) => {
  await connectDB()
  const resolvedParams = await params
  const user = await getCurrentUser()

  if (!user) {
    return redirect('/')
  }

  // Safely convert ObjectId to string
  const userId = safeObjectIdToString(user.userId)

  const course = await db.course.findOne({
    _id: resolvedParams.courseId,
    createdById: userId,
  })

  // Get attachments and chapters separately
  const attachments = await db.attachment.find({ courseId: resolvedParams.courseId })
  const chapters = await db.chapter.find({ courseId: resolvedParams.courseId }).sort({ position: 1 })

  if (!course) {
    return redirect('/')
  }

  // Convert MongoDB objects to plain objects to avoid serialization warnings
  const serializedAttachments = attachments.map(attachment => ({
    _id: attachment._id.toString(),
    name: attachment.name,
    url: attachment.url,
    courseId: attachment.courseId.toString(),
    createdAt: attachment.createdAt,
    updatedAt: attachment.updatedAt,
  }))

  const serializedChapters = chapters.map(chapter => ({
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
  }))

  // Create a clean course object to avoid circular references
  const courseWithRelations = {
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
    attachments: serializedAttachments,
    chapters: serializedChapters,
  }

  const categories = await db.category.find().sort({ name: 1 })
  const serializedCategories = categories.map(category => ({
    _id: category._id.toString(),
    name: category.name,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
  }))

  const requiredFields = [
    courseWithRelations.title,
    courseWithRelations.description,
    courseWithRelations.imageUrl,
    (courseWithRelations.categoryIds && courseWithRelations.categoryIds.length > 0) || courseWithRelations.categoryId,
    courseWithRelations.chapters.some((chapter: any) => chapter.isPublished),
  ]

  const totalFields = requiredFields.length
  const completedFields = requiredFields.filter(Boolean).length

  const completionText = `(${completedFields}/${totalFields})`

  const isComplete = requiredFields.every(Boolean)

  return (
    <>
      {!courseWithRelations.isPublished && <Banner label="This course is unpublished. It will not be visible to the students." />}
      <div className="p-6">
        <div className="mb-6">
          <Link
            href="/teacher/courses"
            className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all courses
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-2">
            <h1 className="text-2xl font-medium">Course setup</h1>
            <span className="text-sm text-slate-400">Complete all fields {completionText}</span>
          </div>
          <Actions disabled={!isComplete} courseId={resolvedParams.courseId} isPublished={courseWithRelations.isPublished} />
        </div>
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">Customize your course</h2>
            </div>
            <TitleForm initialData={courseWithRelations} courseId={courseWithRelations._id} />
            <DescriptionForm initialData={courseWithRelations} courseId={courseWithRelations._id} />
            <ImageForm initialData={courseWithRelations} courseId={courseWithRelations._id} />
            <CategoriesForm
              initialData={courseWithRelations}
              courseId={courseWithRelations._id}
              options={serializedCategories.map((category) => ({
                label: category.name,
                value: category._id,
              }))}
            />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm initialData={courseWithRelations} courseId={courseWithRelations._id} />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={File} />
                <h2 className="text-xl">Resources & Attachments (Optional)</h2>
              </div>
              <AttachmentForm initialData={courseWithRelations} courseId={courseWithRelations._id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default CourseIdPage
