const DIRECT_URL_PATTERN = /^(?:https?:|data:|blob:|\/)/i

export const getAppIconUrl = (icon: unknown): string => {
  if (typeof icon !== 'string') return ''

  const normalizedIcon = icon.trim()
  if (!normalizedIcon) return ''
  if (DIRECT_URL_PATTERN.test(normalizedIcon)) return normalizedIcon

  const downloadUrl = String((window as any).api?.dowUrl || '')
  if (!downloadUrl) return ''

  const iconUrl = `${downloadUrl}${normalizedIcon}`
  const token = localStorage.getItem('wornbench_token')
  if (!token) return iconUrl

  const separator = iconUrl.includes('?') ? '&' : '?'
  return `${iconUrl}${separator}token=${encodeURIComponent(token)}`
}
