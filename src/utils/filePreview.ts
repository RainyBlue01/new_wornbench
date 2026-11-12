import router from '@/router'

export interface FilePreviewItem {
  path?: string
  fileName?: string
  name?: string
  type?: number | null
}

/** 打开文件/图片/签名预览页（与 qUpload 预览行为一致） */
export function openFilePreview(file: FilePreviewItem | string) {
  const fileItem: FilePreviewItem = typeof file === 'string'
    ? { path: file, fileName: 'signature.png', type: 1 }
    : file

  const fileId = fileItem.path
  if (!fileId) {
    console.warn('无法获取 fileId')
    return
  }

  const pathStr = String(fileId)
  const isDataOrHttp = pathStr.startsWith('data:') || /^https?:\/\//i.test(pathStr)
  if (isDataOrHttp) {
    window.open(pathStr, '_blank', 'noopener,noreferrer')
    return
  }

  if (fileItem.type == 1 || fileItem.type == null) {
    const fileName = fileItem.fileName || fileItem.name || 'file'
    const { href } = router.resolve({
      name: 'iframePreview',
      query: {
        fileId: pathStr,
        fileName,
      },
    })
    window.open(href, '_blank', 'noopener,noreferrer')
    return
  }

  const win = window as any
  const token = localStorage.getItem('wornbench_token') || ''
  window.open(`${win.api?.dowUrl}${pathStr}&token=${token}`, '_blank', 'noopener,noreferrer')
}
