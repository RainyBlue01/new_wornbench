import axios from 'axios'

interface ThirdAttachmentUrlResponse {
  code: number
  message: string
  success: boolean
  data: string
}

export function getThirdAttachmentUrl(path: string) {
  const token = localStorage.getItem('wornbench_token')
  return axios
    .get<ThirdAttachmentUrlResponse>('/api/internal/business/open/file/third/download/attachment/url', {
      params: { url: path },
      headers: {
        client_id: '339d13a0034b4398939fe8fe89b0af0a',
        ...(token ? { token } : {}),
      },
    })
    .then((response) => response.data?.data || '')
}
