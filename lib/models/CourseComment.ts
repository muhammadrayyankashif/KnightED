import mongoose, { Document, Schema } from 'mongoose'

export interface ICourseComment extends Document {
  _id: string
  content: string
  courseId: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

const CourseCommentSchema = new Schema<ICourseComment>({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000, // Limit comment length
  },
  courseId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

// Create compound index for efficient queries
CourseCommentSchema.index({ courseId: 1, createdAt: -1 })
CourseCommentSchema.index({ userId: 1, createdAt: -1 })

export default (mongoose.models && mongoose.models.CourseComment) || mongoose.model<ICourseComment>('CourseComment', CourseCommentSchema)
