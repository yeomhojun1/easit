// 데모 모드(VITE_DEMO=true 빌드)에서 백엔드 대신 응답하는 브라우저 안의 가짜 API.
// 착석 예측은 저장소의 실제 혼잡도 모델(backend/data/congestion-model.json)로 백엔드와 같은 계산을 한다.
// 로그인·회원가입은 저장 없이 아무 값이나 받아 데모 사용자로 들여보낸다.
import { predictSeat } from './seatModel'
import { DEMO_ACCOUNT } from './account'
const DEMO_TOKEN = 'demo-token'

let modelPromise = null
const loadModel = () => {
  modelPromise ??= import('../../backend/data/congestion-model.json').then((m) => m.default)
  return modelPromise
}

const ok = (data) => ({ status: 200, data })
const fail = (status, message) => ({ status, data: { statusCode: status, message } })

function parseBody(options) {
  try {
    return options.body ? JSON.parse(options.body) : {}
  } catch {
    return {}
  }
}

const demoUser = (name, email) => ({ id: 1, name: name || '데모 사용자', email, points: 0, provider: 'demo' })

// 실제 서버처럼 { status, data } 를 돌려준다. 에러 처리는 apiFetch 가 맡는다.
export async function demoFetch(path, options = {}) {
  const url = new URL(path, 'http://demo.local')
  const method = (options.method || 'GET').toUpperCase()

  if (method === 'GET' && url.pathname === '/auth/providers') return ok({ providers: [] })

  if (method === 'POST' && url.pathname === '/auth/login') {
    const { email, password } = parseBody(options)
    if (!email || !password) return fail(400, '이메일과 비밀번호를 입력해주세요.')
    return ok({ accessToken: DEMO_TOKEN, user: demoUser(email === DEMO_ACCOUNT.email ? '데모 사용자' : email.split('@')[0], email) })
  }

  if (method === 'POST' && url.pathname === '/auth/register') {
    const { name, email } = parseBody(options)
    return ok({ accessToken: DEMO_TOKEN, user: demoUser(name, email) })
  }

  if (method === 'GET' && url.pathname === '/subway/seat-prediction') {
    const q = url.searchParams
    const line = q.get('line')
    const station = q.get('station')
    const next = q.get('next')
    if (!line || !station || !next) return fail(400, 'line, station, next 쿼리가 필요합니다.')
    const model = await loadModel()
    const stops = parseInt(q.get('stops') || '8', 10) || 8
    return ok(predictSeat(model, line, station, next, q.get('day') || '평일', q.get('time') || '08:00', stops))
  }

  return fail(404, `데모 모드에서 지원하지 않는 요청입니다: ${method} ${url.pathname}`)
}
