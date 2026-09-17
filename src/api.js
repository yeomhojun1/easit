export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003/api'

// network=true 면 서버에 닿지 못한 것(미기동·CORS·DNS). 화면 문구를 구분하는 데 쓴다.
export class ApiError extends Error {
  constructor(message, { network = false, status = 0 } = {}) {
    super(message)
    this.name = 'ApiError'
    this.network = network
    this.status = status
  }
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  let res
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })
  } catch {
    throw new ApiError('서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요.', { network: true })
  }

  let data = null
  try {
    data = await res.json()
  } catch {
    data = null
  }

  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message
    throw new ApiError(msg || `요청을 처리하지 못했습니다. (${res.status})`, { status: res.status })
  }
  if (data === null) {
    throw new ApiError('서버 응답을 해석할 수 없습니다. API 주소를 확인해주세요.', { network: true, status: res.status })
  }
  return data
}

// 서버에 등록된 소셜 로그인 목록 (키가 없는 프로바이더는 버튼을 숨긴다)
export async function fetchAuthProviders() {
  try {
    const data = await apiFetch('/auth/providers')
    return Array.isArray(data?.providers) ? data.providers : []
  } catch {
    return []
  }
}
