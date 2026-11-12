import { getThirdAttachmentUrl } from '@/api/file'

export interface AttachmentFile {
  path?: string
  type?: string | number
  url?: string
  [key: string]: any
}

const thirdUrlCache = new Map<string, Promise<string>>()

const normalizeResponseUrl = (response: any) => {
  if (typeof response === 'string') return response
  return response?.url || response?.downloadUrl || response?.data || ''
}

export const getLocalAttachmentUrl = (path?: string) => {
  if (!path) return ''
  const win = window as any
  const token = localStorage.getItem('wornbench_token')
  return `${win.api.dowUrl}${path}${token ? `&token=${encodeURIComponent(token)}` : ''}`
}

export const getInitialAttachmentUrl = (file: AttachmentFile) => {
  if (Number(file?.type) === 2) return file.url || ''
  return file.url || getLocalAttachmentUrl(file?.path)
}

export const resolveAttachmentUrl = async (file: AttachmentFile) => {
  if (file?.url) return file.url
  if (!file?.path) return ''
  if (Number(file.type) !== 2) return getLocalAttachmentUrl(file.path)

  if (!thirdUrlCache.has(file.path)) {
    thirdUrlCache.set(
      file.path,
      getThirdAttachmentUrl(file.path).then(normalizeResponseUrl).catch((error) => {
        thirdUrlCache.delete(file.path as string)
        throw error
      }),
    )
  }
  return thirdUrlCache.get(file.path) as Promise<string>
}

export const buildFilePreviewUrl = (fileUrl: string, fileName = 'file') =>
  `${window.location.origin}/preview/view?url=${encodeURIComponent(fileUrl)}&fileName=${encodeURIComponent(fileName)}`

const IMAGE_EXTENSIONS = /\.(?:png|jpe?g|gif|webp|bmp|svg|ico|avif)(?:$|[?#])/i

export const isImageAttachment = (value = '') => IMAGE_EXTENSIONS.test(value)

export const buildAttachmentPreviewUrl = (
  fileUrl: string,
  fileName = 'file',
  path = '',
) => isImageAttachment(fileName) || isImageAttachment(path)
  ? fileUrl
  : buildFilePreviewUrl(fileUrl, fileName)
