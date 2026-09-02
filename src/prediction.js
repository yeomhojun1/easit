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
// 실패·미지원 시 null을 돌려주고 화면은 기존 데모 값으로 동작한다.
export async function fetchSeatPrediction({ line, station, next, stops = 8 }) {
  try {
    const q = new URLSearchParams({
      line, station, next,
      day: todayType(),
      time: nowTime(),
      stops: String(stops),
    })
    const data = await apiFetch(`/subway/seat-prediction?${q}`)
    return data?.supported ? data : null
  } catch {
    return null
  }
}
