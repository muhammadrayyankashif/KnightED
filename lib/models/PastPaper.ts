import mongoose, { Document, Schema } from 'mongoose'

export interface IPastPaper extends Document {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
  fileExtension?: string
  categoryId: string
  year: number
  isPublished: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const PastPaperSchema = new Schema<IPastPaper>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileExtension: {
    type: String,
    default: '',
  },
  categoryId: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1,
  },
  isPublished: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

// Create index for efficient queries
PastPaperSchema.index({ categoryId: 1, year: -1, createdAt: -1 })
PastPaperSchema.index({ createdBy: 1, createdAt: -1 })

export default (mongoose.models && mongoose.models.PastPaper) || mongoose.model<IPastPaper>('PastPaper', PastPaperSchema)
