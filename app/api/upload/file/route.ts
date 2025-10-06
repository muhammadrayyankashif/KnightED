import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { uploadFile } from '@/lib/cloudinary'
import { isTeacher, isAdmin } from '@/lib/teacher'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req)
    
    if (!user || (!isTeacher(user) && !isAdmin(user))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 20MB' }, { status: 400 })
    }

    const url = await uploadFile(file, 'KnightED/attachments')

    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 })
  }
}
