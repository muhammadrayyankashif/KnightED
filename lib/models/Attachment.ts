import mongoose, { Document, Schema } from 'mongoose'

export interface IAttachment extends Document {
  _id: string
  name: string
  url: string
  courseId: string
  fileExtension?: string
  resourceType: 'file' | 'url'
  createdAt: Date
  updatedAt: Date
}

const AttachmentSchema = new Schema<IAttachment>({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  fileExtension: {
    type: String,
    default: '',
  },
  resourceType: {
    type: String,
    enum: ['file', 'url'],
    default: 'file',
  },
}, {
  timestamps: true,
})

export default (mongoose.models && mongoose.models.Attachment) || mongoose.model<IAttachment>('Attachment', AttachmentSchema)
