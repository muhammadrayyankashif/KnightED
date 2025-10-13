'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface FileUploadProps {
  onChange: (url?: string, fileName?: string, fileExtension?: string) => void
  value?: string
  endpoint: 'image' | 'video' | 'file'
  accept?: Record<string, string[]>
  maxSize?: number
}

export const FileUpload = ({
  onChange,
  value,
  endpoint,
  accept,
  maxSize = 4 * 1024 * 1024, // 4MB default
}: FileUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      setIsUploading(true)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch(`/api/upload/${endpoint}`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error('Upload failed')
        }

        const { url } = await response.json()
        const fileName = file.name
        const fileExtension = file.name.split('.').pop() || ''
        onChange(url, fileName, fileExtension)
        toast.success('File uploaded successfully!')
      } catch (error) {
        toast.error('Upload failed. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, endpoint]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  if (value) {
    const type = value?.split('.').pop()
    
    return (
      <div className="flex flex-col items-center justify-center w-full h-full">
        {type !== 'pdf' && endpoint === 'image' ? (
          <div className="relative w-full h-40">
            <Image fill src={value} alt="Upload" className="object-cover" />
          </div>
        ) : (
          <div className="flex items-center p-2 w-full bg-background">
            <File className="h-10 w-10 fill-muted stroke-muted" />
            <a href={value} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-muted-foreground hover:underline">
              {endpoint === 'video' ? 'Video File' : 'File'}
            </a>
          </div>
        )}
        <Button onClick={() => onChange('')} variant="ghost" type="button">
          <X className="h-4 w-4" />
          Remove
        </Button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300'}
        ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/50'}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      {isUploading ? (
        <p className="text-sm text-gray-600">Uploading...</p>
      ) : isDragActive ? (
        <p className="text-sm text-gray-600">Drop the file here...</p>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Drag & drop a file here, or click to select
          </p>
          <p className="text-xs text-gray-500">
            Max size: {Math.round(maxSize / (1024 * 1024))}MB
          </p>
        </div>
      )}
    </div>
  )
}
