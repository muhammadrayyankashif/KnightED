import mongoose, { Document, Schema } from 'mongoose'

export interface ICategory extends Document {
  _id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
}, {
  timestamps: true,
})

export default (mongoose.models && mongoose.models.Category) || mongoose.model<ICategory>('Category', CategorySchema)
