'use client'

import * as z from 'zod'
import axios from 'axios'
import { PlusCircle, File, Loader2, X, Link as LinkIcon } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileUpload } from '@/components/file-upload'

interface Attachment {
  _id: string
  name: string
  url: string
  resourceType?: 'file' | 'url'
}

interface Course {
  _id: string
  title: string
  attachments: Attachment[]
}

interface AttachmentFormProps {
  initialData: Course
  courseId: string
}

const fileFormSchema = z.object({
  url: z.string().min(1),
  name: z.string().min(1),
  fileExtension: z.string().optional(),
  resourceType: z.literal('file'),
})

const urlFormSchema = z.object({
  url: z.string().url('Please enter a valid URL'),
  name: z.string().min(1, 'Resource name is required'),
  resourceType: z.literal('url'),
})

export const AttachmentForm = ({ initialData, courseId }: AttachmentFormProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [addMode, setAddMode] = useState<'file' | 'url'>('file')
  const [urlName, setUrlName] = useState('')
  const [urlValue, setUrlValue] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const toggleEdit = () => setIsEditing((current) => !current)

  const router = useRouter()

  const onSubmitFile = async (values: z.infer<typeof fileFormSchema>) => {
    try {
      fileFormSchema.parse(values)
      await axios.post(`/api/courses/${courseId}/attachments`, values)
      toast.success('Resource added')
      toggleEdit()
      router.refresh()
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const onSubmitUrl = async () => {
    try {
      urlFormSchema.parse({ url: urlValue, name: urlName, resourceType: 'url' })
      setIsSubmitting(true)
      await axios.post(`/api/courses/${courseId}/attachments`, {
        url: urlValue,
        name: urlName,
        resourceType: 'url',
      })
      toast.success('Resource added')
      setUrlName('')
      setUrlValue('')
      toggleEdit()
      router.refresh()
    } catch (error) {
      toast.error('Please enter a valid URL and name')
    } finally {
      setIsSubmitting(false)
    }
  }

  const onDelete = async (id: string) => {
    try {
      setDeletingId(id)
      await axios.delete(`/api/courses/${courseId}/attachments/${id}`)
      toast.success('Resource deleted')
      router.refresh()
    } catch {
      toast.error('Something went wrong')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="mt-6 rounded-md border bg-slate-100 dark:bg-slate-800 p-4">
      <div className="flex items-center justify-between font-medium">
        Course attachments
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add a file
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.attachments.length === 0 && (
            <p className="mt-2 text-sm italic text-muted-foreground">No resources yet</p>
          )}
          {initialData.attachments.length > 0 && (
            <div className="space-y-2">
              {initialData.attachments.map((attachment) => (
                <div
                  key={attachment._id}
                  className="flex w-full items-center rounded-md border border-sky-200 bg-sky-100 dark:bg-blue-950 dark:border-blue-800 p-3 text-sky-700 dark:text-blue-200"
                >
                  {attachment.resourceType === 'url' ? (
                    <LinkIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  ) : (
                    <File className="mr-2 h-4 w-4 flex-shrink-0" />
                  )}
                  <p className="line-clamp-1 text-xs">{attachment.name}</p>
                  {deletingId === attachment._id && (
                    <div>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  )}
                  {deletingId !== attachment._id && (
                    <button onClick={() => onDelete(attachment._id)} className="ml-auto transition hover:opacity-75">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {isEditing && (
        <div className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={addMode === 'file' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAddMode('file')}
            >
              <File className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={addMode === 'url' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setAddMode('url')}
            >
              <LinkIcon className="h-4 w-4 mr-2" />
              Add URL
            </Button>
          </div>

          {/* File Upload Mode */}
          {addMode === 'file' && (
            <div>
              <FileUpload
                endpoint="file"
                onChange={(url, fileName, fileExtension) => {
                  if (url && fileName) {
                    onSubmitFile({ url, name: fileName, fileExtension, resourceType: 'file' })
                  }
                }}
              />
            </div>
          )}

          {/* URL Input Mode */}
          {addMode === 'url' && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground">Resource Name</label>
                <Input
                  placeholder="e.g., Project Guidelines"
                  value={urlName}
                  onChange={(e) => setUrlName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">URL</label>
                <Input
                  placeholder="https://example.com"
                  value={urlValue}
                  onChange={(e) => setUrlValue(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button
                onClick={onSubmitUrl}
                disabled={isSubmitting || !urlName.trim() || !urlValue.trim()}
                className="w-full"
              >
                {isSubmitting ? 'Adding...' : 'Add Resource'}
              </Button>
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            Add files or links that your students might need to complete the course.
          </div>
        </div>
      )}
    </div>
  )
}
