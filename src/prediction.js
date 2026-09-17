import { apiFetch } from './api'

// 오늘이 혼잡도 데이터의 어느 요일 구분에 해당하는지
export function todayType(d = new Date()) {
  const day = d.getDay()
  return day === 0 ? '일요일' : day === 6 ? '토요일' : '평일'
}

export function nowTime(d = new Date()) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// 서울교통공사 혼잡도 데이터 기반 착석 확률 예측 (1~8호선만 지원)
// 항상 status 가 있는 객체를 돌려준다. 화면은 supported 가 false 면 데모 값으로 동작하되,
// "미지원"과 "서버에 못 닿음"을 구분해 안내한다.
//   ok          정상 예측
//   unsupported 백엔드는 응답했지만 데이터가 없는 노선·역
//   offline     백엔드에 연결 실패 (미기동·주소 오류)
//   error       그 밖의 오류 응답
export async function fetchSeatPrediction({ line, station, next, stops = 8 }) {
  try {
    const q = new URLSearchParams({
      line, station, next,
      day: todayType(),
      time: nowTime(),
      stops: String(stops),
    })
    const data = await apiFetch(`/subway/seat-prediction?${q}`)
    if (data?.supported) return { ...data, status: 'ok' }
    return { supported: false, status: 'unsupported', reason: data?.reason }
  } catch (e) {
    return { supported: false, status: e?.network ? 'offline' : 'error', reason: e?.message }
  }
}

// 예측을 못 받았을 때 화면에 띄울 안내 문구
export function predictionNotice(prediction) {
  if (!prediction || prediction.supported) return null
  if (prediction.status === 'offline')
    return '백엔드 서버에 연결할 수 없습니다 — 아래 확률은 데모 값입니다'
  if (prediction.status === 'error')
    return `실데이터를 불러오지 못했습니다 (${prediction.reason ?? '알 수 없는 오류'}) — 아래 확률은 데모 값입니다`
  return `이 노선·역은 혼잡도 실데이터 미지원(1~8호선만) — 아래 확률은 데모 값입니다`
}
