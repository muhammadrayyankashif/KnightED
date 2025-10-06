import { getCurrentUser, safeObjectIdToString } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import connectDB from '@/lib/mongodb'
import { isAdmin } from '@/lib/teacher'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await getCurrentUser(request)

    if (!user || !isAdmin(user)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name } = await request.json()

    if (!name) {
      return new NextResponse('Name is required', { status: 400 })
    }

    // Check if category already exists
    const existingCategory = await db.category.findOne({ name })
    if (existingCategory) {
      return new NextResponse('Category already exists', { status: 400 })
    }

    const category = await db.category.create({ name })

    return NextResponse.json(category)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET() {
  try {
    await connectDB()
    const categories = await db.category.find().sort({ name: 1 })
    
    // Serialize MongoDB objects to plain objects to avoid serialization issues
    const serializedCategories = categories.map(category => ({
      _id: category._id.toString(),
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }))
    
    return NextResponse.json(serializedCategories)
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
