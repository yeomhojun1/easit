export const API_URL = 'http://localhost:3000/api'

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : (data.message || '오류가 발생했습니다.'))
  return data
}
