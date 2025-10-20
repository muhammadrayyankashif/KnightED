'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload, FileText, ArrowLeft, Link as LinkIcon } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Link from 'next/link'

const createPastPaperSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  categoryId: z.string().min(1, 'Category is required'),
  year: z.string().min(1, 'Year is required'),
  url: z.string().optional(),
})

type CreatePastPaperFormValues = z.infer<typeof createPastPaperSchema>

interface Category {
  _id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface CreatePastPaperFormProps {
  categories: Category[]
}

export function CreatePastPaperForm({ categories }: CreatePastPaperFormProps) {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'file' | 'url'>('file')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreatePastPaperFormValues>({
    resolver: zodResolver(createPastPaperSchema),
    defaultValues: {
      title: '',
      categoryId: '',
      year: '',
      url: '',
    },
  })

  const selectedCategoryId = watch('categoryId')
  const selectedYear = watch('year')
  const url = watch('url')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please upload a PDF file')
        return
      }
      setUploadedFile(file)
      if (!watch('title')) {
        const title = file.name.replace('.pdf', '').replace(/_/g, ' ')
        setValue('title', title)
      }
    }
  }

  const onSubmitFile = async (data: CreatePastPaperFormValues) => {
    if (!uploadedFile) {
      toast.error('Please select a file')
      return
    }

    setIsUploading(true)
    try {
       const formData = new FormData()
       formData.append('file', uploadedFile)

      const uploadResponse = await fetch('/api/upload/file', {
        method: 'POST',
        body: formData,
      })

       if (!uploadResponse.ok) {
         const errorData = await uploadResponse.json()
         throw new Error(errorData.error || 'Failed to upload file')
       }

       const uploadResult = await uploadResponse.json()
       const fileExtension = uploadedFile.name.split('.').pop() || ''

      const pastPaperResponse = await fetch('/api/admin/past-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          fileUrl: uploadResult.url,
          fileName: uploadedFile.name,
          fileSize: uploadedFile.size,
          fileExtension,
          categoryId: data.categoryId,
          year: parseInt(data.year),
        }),
      })

       if (!pastPaperResponse.ok) {
         const errorData = await pastPaperResponse.json()
         throw new Error(errorData.error || 'Failed to create past paper')
       }

       toast.success('Past paper created successfully!')
       router.push('/admin/past-papers')
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Failed to create past paper')
     } finally {
       setIsUploading(false)
     }
  }

  const onSubmitUrl = async (data: CreatePastPaperFormValues) => {
    if (!data.url) {
      toast.error('Please enter a URL')
      return
    }

    try {
      // Validate URL
      new URL(data.url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    setIsUploading(true)
    try {
      const pastPaperResponse = await fetch('/api/admin/past-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: data.title,
          fileUrl: data.url,
          fileName: data.title,
          fileSize: 0,
          fileExtension: '',
          categoryId: data.categoryId,
          year: parseInt(data.year),
        }),
      })

       if (!pastPaperResponse.ok) {
         const errorData = await pastPaperResponse.json()
         throw new Error(errorData.error || 'Failed to create past paper')
       }

       toast.success('Past paper created successfully!')
       router.push('/admin/past-papers')
     } catch (error) {
       toast.error(error instanceof Error ? error.message : 'Failed to create past paper')
     } finally {
       setIsUploading(false)
     }
  }

  const onSubmit = async (data: CreatePastPaperFormValues) => {
    if (mode === 'file') {
      await onSubmitFile(data)
    } else {
      await onSubmitUrl(data)
    }
  }

  const currentYear = new Date().getFullYear()
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - i)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/admin/past-papers">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Past Papers
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Past Paper Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter past paper title"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value: string) => setValue('categoryId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-sm text-red-500">{errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select onValueChange={(value: string) => setValue('year', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-sm text-red-500">{errors.year.message}</p>
                )}
              </div>
            </div>

            {/* Mode selector */}
            <div className="space-y-3 border-y py-4">
              <Label className="text-base">Add via</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={mode === 'file' ? 'default' : 'outline'}
                  onClick={() => {
                    setMode('file')
                    setUploadedFile(null)
                  }}
                  className="flex-1 gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant={mode === 'url' ? 'default' : 'outline'}
                  onClick={() => {
                    setMode('url')
                    setUploadedFile(null)
                  }}
                  className="flex-1 gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Add URL
                </Button>
              </div>
            </div>

            {/* File upload section */}
            {mode === 'file' && (
              <div className="space-y-2">
                <Label htmlFor="file">PDF File</Label>
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-slate-700"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadedFile ? (
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            {uploadedFile.name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-semibold">Click to upload</span> file
                          </p>
                        </div>
                      )}
                    </div>
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
                {!uploadedFile && (
                  <p className="text-sm text-red-500">File is required</p>
                )}
              </div>
            )}

            {/* URL section */}
            {mode === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  type="url"
                  placeholder="https://example.com/file"
                  {...register('url')}
                />
                {errors.url && (
                  <p className="text-sm text-red-500">{errors.url.message}</p>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isUploading}
                className="flex-1"
              >
                {isUploading ? 'Creating...' : 'Create Past Paper'}
              </Button>
              <Link href="/admin/past-papers">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
