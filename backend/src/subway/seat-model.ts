// 착석 확률 모델 — 서울교통공사 혼잡도 데이터(30분 단위, 요일·역·방향별) 기반.
// 외부 의존성 없는 순수 계산 모듈이라 Nest 없이도 단독 테스트 가능.
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// 혼잡도(%) = 승차인원/정원(량당 약 160명). 좌석은 량당 54석이므로
// 혼잡도 ≈ 34%가 "좌석이 정확히 다 찬" 지점이다. 모델의 기준선.
const SEAT_CONGESTION = 34
// 즉시 착석 확률 로지스틱 곡선의 중심/기울기.
// 중심을 34보다 약간 낮게(32) 둔 이유: 좌석이 몰려 있어 만석 직전에도 빈자리 찾기가 어려움.
const P_CENTER = 32
const P_SCALE = 5

export interface JourneyStep {
  station: string
  congestion: number
  pGain: number // 이 역에서 (아직 서 있을 때) 자리가 나서 앉을 확률
  pCumulative: number // 탑승~이 역까지 누적 착석 확률
}

export interface SeatPrediction {
  supported: boolean
  reason?: string
  line?: string
  station?: string
  direction?: string
  day?: string
  time?: string
  congestion?: number
  pSitNow?: number
  journey?: JourneyStep[]
  curve?: { slots: string[]; values: number[] }
  meta?: { source: string; seatCongestion: number }
}

interface Model {
  meta: { source: string; slots: string[]; days: string[] }
  lines: Record<
    string,
    {
      order: { name: string; code: number }[]
      data: Record<string, Record<string, Record<string, number[]>>>
    }
  >
}

let model: Model | null = null

function loadModel(): Model {
  if (model) return model
  const file = 'congestion-model.json'
  const candidates = [
    join(__dirname, '..', '..', 'data', file), // dist/subway 기준
    join(__dirname, '..', '..', '..', 'data', file), // dist/src/subway 기준
    join(process.cwd(), 'data', file),
    join(process.cwd(), 'backend', 'data', file),
  ]
  const found = candidates.find((p) => existsSync(p))
  if (!found)
    throw new Error(
      '혼잡도 모델이 없습니다. backend에서 `node scripts/build-congestion-model.mjs`를 먼저 실행하세요.',
    )
  model = JSON.parse(readFileSync(found, 'utf-8'))
  return model
}

// 역명 정규화: 공백 제거, "역" 접미 제거
function norm(name: string): string {
  return name.replace(/\s+/g, '').replace(/역$/, '')
}

// "총신대입구(이수)" → ["총신대입구", "이수"] 처럼 괄호 병기 별칭까지 매칭 후보로
function nameKeys(name: string): string[] {
  const keys = [norm(name.replace(/\(.*?\)/g, ''))]
  const alias = name.match(/\((.+?)\)/)?.[1]
  if (alias) keys.push(norm(alias))
  return keys
}

// 개명·병기로 앱 쪽 역명과 데이터 역명이 다른 경우 (앱 명칭 → 데이터 명칭)
const ALIASES: Record<string, string> = {
  이수: '총신대입구',
  당고개: '불암산',
  뚝섬유원지: '자양',
}

function findStation(order: { name: string; code: number }[], name: string): number {
  const target = norm(name.replace(/\(.*?\)/g, ''))
  const candidates = [target, ALIASES[target]].filter(Boolean)
  return order.findIndex((s) => nameKeys(s.name).some((k) => candidates.includes(k)))
}

// 이동 방향(역번호 증가/감소) → CSV의 상·하선 라벨.
// 서울교통공사 관례: 3~8호선은 역번호가 작은 종점(대화·당고개·방화·응암·장암·암사) 방면이 상선.
// 1호선(서울역~청량리 구간)은 소요산 방면(역번호 증가)이 상행, 2호선은 시계방향(역번호 증가)이 내선.
function directionLabel(line: string, ascending: boolean): string {
  if (line === '2호선') return ascending ? '내선' : '외선'
  if (line === '1호선') return ascending ? '상선' : '하선'
  return ascending ? '하선' : '상선'
}

// "HH:MM"을 05:30 기준 슬롯 위치(실수)로. 00:00~00:30은 하루 끝쪽으로 취급.
function slotPos(time: string, slotCount: number): number {
  const [h, m] = time.split(':').map(Number)
  let minutes = h * 60 + m
  if (minutes < 5 * 60) minutes += 24 * 60 // 자정 이후는 이어붙임
  const pos = (minutes - (5 * 60 + 30)) / 30
  return Math.max(0, Math.min(slotCount - 1, pos))
}

// 30분 슬롯 사이 선형 보간으로 임의 시각의 혼잡도 추정
function congestionAt(values: number[], time: string): number {
  const pos = slotPos(time, values.length)
  const lo = Math.floor(pos)
  const hi = Math.min(values.length - 1, lo + 1)
  const frac = pos - lo
  return values[lo] * (1 - frac) + values[hi] * frac
}

// 즉시 착석 확률: 혼잡도의 로지스틱 함수.
// c=10% → 0.99, c=20% → 0.92, c=32% → 0.5, c=50% → 0.03
function pSitNow(c: number): number {
  return 1 / (1 + Math.exp((c - P_CENTER) / P_SCALE))
}

/**
 * 착석 확률 예측.
 * @param lineName 예: "2호선"
 * @param stationName 탑승역
 * @param nextStationName 진행 방향의 다음 역 (방향 결정용)
 * @param day "평일" | "토요일" | "일요일"
 * @param time "HH:MM"
 * @param stops 몇 정거장 앞까지 시뮬레이션할지 (기본 8, 최대 15)
 */
export function predictSeat(
  lineName: string,
  stationName: string,
  nextStationName: string,
  day: string,
  time: string,
  stops = 8,
): SeatPrediction {
  const m = loadModel()
  const line = m.lines[lineName]
  if (!line) return { supported: false, reason: `${lineName}은 혼잡도 데이터가 없습니다 (1~8호선만 지원).` }
  if (!m.meta.days.includes(day)) return { supported: false, reason: `요일 구분은 ${m.meta.days.join('/')} 중 하나여야 합니다.` }

  const idx = findStation(line.order, stationName)
  if (idx < 0) return { supported: false, reason: `${stationName}역은 이 데이터셋에 없습니다.` }

  const nextIdx = findStation(line.order, nextStationName)
  if (nextIdx < 0 || nextIdx === idx)
    return { supported: false, reason: `다음 역(${nextStationName})으로 방향을 정할 수 없습니다.` }

  const ascending = nextIdx > idx
  const dir = directionLabel(lineName, ascending)

  const seriesOf = (station: string): number[] | undefined => line.data[station]?.[dir]?.[day]

  const baseSeries = seriesOf(line.order[idx].name)
  if (!baseSeries) return { supported: false, reason: `${stationName}역 ${dir} 데이터가 없습니다.` }

  const c0 = congestionAt(baseSeries, time)
  const pNow = pSitNow(c0)

  // 진행 방향의 이후 역들을 순서대로 걷는다
  const step = ascending ? 1 : -1
  const journey: JourneyStep[] = []
  let pNotSeated = 1 - pNow
  let prevC = c0
  for (let k = 1; k <= Math.min(stops, 15); k++) {
    const i = idx + step * k
    if (i < 0 || i >= line.order.length) break
    const st = line.order[i].name
    const series = seriesOf(st)
    if (!series) break
    const c = congestionAt(series, time)

    // 이 역에서 내리는 사람(순감소)이 좌석을 비우고, 서 있는 사람들이 경쟁한다.
    // 내리는 사람 중 앉아 있던 비율 ≈ min(1, 좌석기준/이전혼잡도)
    const standing = Math.max(0, prevC - SEAT_CONGESTION)
    const alight = Math.max(0, prevC - c)
    const seatedShare = prevC > 0 ? Math.min(1, SEAT_CONGESTION / prevC) : 1
    const freedSeats = alight * seatedShare
    const pGain = standing > 0 ? Math.min(1, freedSeats / standing) : 1

    pNotSeated *= 1 - pGain
    journey.push({
      station: st,
      congestion: round1(c),
      pGain: round3(pGain),
      // 통계 추정이므로 100% 확정으로 표시하지 않는다
      pCumulative: Math.min(0.99, round3(1 - pNotSeated)),
    })
    prevC = c
  }

  return {
    supported: true,
    line: lineName,
    station: line.order[idx].name,
    direction: dir,
    day,
    time,
    congestion: round1(c0),
    pSitNow: round3(pNow),
    journey,
    curve: { slots: m.meta.slots, values: baseSeries },
    meta: { source: m.meta.source, seatCongestion: SEAT_CONGESTION },
  }
}

const round1 = (n: number) => Math.round(n * 10) / 10
const round3 = (n: number) => Math.round(n * 1000) / 1000
