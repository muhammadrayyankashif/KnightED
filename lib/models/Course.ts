import mongoose, { Document, Schema } from 'mongoose'

export interface ICourse extends Document {
  _id: string
  title: string
  description?: string
  imageUrl?: string
  isPublished: boolean
  isFeatured: boolean
  createdById: string
  categoryId?: string // Keep for backward compatibility
  categoryIds?: string[] // New multiple categories support
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  createdById: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
  },
  categoryIds: [{
    type: String,
  }],
}, {
  timestamps: true,
})

export default (mongoose.models && mongoose.models.Course) || mongoose.model<ICourse>('Course', CourseSchema)
