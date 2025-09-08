import mongoose, { Document, Schema } from 'mongoose'

export interface INote extends Document {
  _id: string
  title: string
  fileUrl: string
  fileName: string
  fileSize: number
  fileExtension?: string
  categoryId: string
  isPublished: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

const NoteSchema = new Schema<INote>({
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
NoteSchema.index({ categoryId: 1, createdAt: -1 })
NoteSchema.index({ createdBy: 1, createdAt: -1 })

export default (mongoose.models && mongoose.models.Note) || mongoose.model<INote>('Note', NoteSchema)