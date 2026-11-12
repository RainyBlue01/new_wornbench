/**
 * blob流文件 下载
 * @param { String } res 响应数据
 * @param { String } filename 文件名称
 */
export const blobDownload = (
  res: any,
  filename = new Date().valueOf() + '.xlsx'
) => {
  const blob = new Blob([res], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  if ('download' in document.createElement('a')) {
    const elink = document.createElement('a')
    elink.download = filename
    elink.style.display = 'none'
    elink.href = URL.createObjectURL(blob)
    document.body.appendChild(elink)
    elink.click()
    URL.revokeObjectURL(elink.href)
    document.body.removeChild(elink)
  } else {
    navigator.msSaveBlob(blob, filename)
  }
}

export const openBlobForPrint = (
  source: BlobPart | Blob,
  type = 'application/pdf',
) => {
  const blob = source instanceof Blob ? source : new Blob([source], { type })
  const objectUrl = URL.createObjectURL(blob)
  const printWindow = window.open(objectUrl, '_blank')

  if (!printWindow) {
    URL.revokeObjectURL(objectUrl)
    return false
  }

  let released = false
  const release = () => {
    if (released) return
    released = true
    URL.revokeObjectURL(objectUrl)
  }

  printWindow.addEventListener('load', () => {
    // 等待 Blob 页面加载完成后再监听关闭，避免 about:blank 首次跳转时过早释放 URL。
    printWindow.addEventListener('afterprint', release, { once: true })
    printWindow.addEventListener('pagehide', release, { once: true })
    printWindow.print()
  }, { once: true })
  return true
}

export const saveBlob = (
  source: BlobPart | Blob,
  filename: string,
  type = 'application/octet-stream',
) => {
  const blob = source instanceof Blob ? source : new Blob([source], { type })
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = filename
  link.style.display = 'none'
  link.href = objectUrl
  document.body.appendChild(link)
  try {
    link.click()
  } finally {
    link.remove()
    URL.revokeObjectURL(objectUrl)
  }
}
