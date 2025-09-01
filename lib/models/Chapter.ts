import mongoose, { Document, Schema } from 'mongoose'

export interface IVideo {
  title: string
  youtubeUrl: string
  position: number
}

export interface IChapter extends Document {
  _id: string
  title: string
  description?: string
  videoUrl?: string // Keep for backward compatibility
  videos?: IVideo[] // New multiple videos support
  position: number
  isPublished: boolean
  isFree: boolean
  courseId: string
  createdAt: Date
  updatedAt: Date
}

const ChapterSchema = new Schema<IChapter>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  videoUrl: {
    type: String,
  },
  videos: [{
    title: {
      type: String,
      required: true,
    },
    youtubeUrl: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
    },
  }],
  position: {
    type: Number,
    required: true,
  },
  isPublished: {
    type: Boolean,
    default: false,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
  courseId: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
})

export default (mongoose.models && mongoose.models.Chapter) || mongoose.model<IChapter>('Chapter', ChapterSchema)
