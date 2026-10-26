// 데모 모드 전용: backend/src/subway/seat-model.ts 의 착석 확률 계산을 브라우저용으로 옮긴 것.
// 파일을 읽는 부분만 빼고 계산식·상수는 백엔드와 같다. 백엔드 모델을 고치면 여기도 같이 고쳐야 한다.

const SEAT_CONGESTION = 34
const P_CENTER = 32
const P_SCALE = 5

const norm = (name) => name.replace(/\s+/g, '').replace(/역$/, '')

function nameKeys(name) {
  const keys = [norm(name.replace(/\(.*?\)/g, ''))]
  const alias = name.match(/\((.+?)\)/)?.[1]
  if (alias) keys.push(norm(alias))
  return keys
}

const ALIASES = {
  이수: '총신대입구',
  당고개: '불암산',
  뚝섬유원지: '자양',
}

function findStation(order, name) {
  const target = norm(name.replace(/\(.*?\)/g, ''))
  const candidates = [target, ALIASES[target]].filter(Boolean)
  return order.findIndex((s) => nameKeys(s.name).some((k) => candidates.includes(k)))
}

function directionLabel(line, ascending) {
  if (line === '2호선') return ascending ? '내선' : '외선'
  if (line === '1호선') return ascending ? '상선' : '하선'
  return ascending ? '하선' : '상선'
}

function slotPos(time, slotCount) {
  const [h, m] = time.split(':').map(Number)
  let minutes = h * 60 + m
  if (minutes < 5 * 60) minutes += 24 * 60
  const pos = (minutes - (5 * 60 + 30)) / 30
  return Math.max(0, Math.min(slotCount - 1, pos))
}

function congestionAt(values, time) {
  const pos = slotPos(time, values.length)
  const lo = Math.floor(pos)
  const hi = Math.min(values.length - 1, lo + 1)
  const frac = pos - lo
  return values[lo] * (1 - frac) + values[hi] * frac
}

const pSitNow = (c) => 1 / (1 + Math.exp((c - P_CENTER) / P_SCALE))
const round1 = (n) => Math.round(n * 10) / 10
const round3 = (n) => Math.round(n * 1000) / 1000

export function predictSeat(m, lineName, stationName, nextStationName, day, time, stops = 8) {
  const line = m.lines[lineName]
  if (!line) return { supported: false, reason: `${lineName}은 혼잡도 데이터가 없습니다 (1~8호선만 지원).` }
  if (!m.meta.days.includes(day)) return { supported: false, reason: `요일 구분은 ${m.meta.days.join('/')} 중 하나여야 합니다.` }

  const tracks = [{ order: line.order }, ...(line.branches ?? [])]
  let track = null
  let idx = -1
  let nextIdx = -1
  let stationFound = false
  for (const t of tracks) {
    const i = findStation(t.order, stationName)
    if (i < 0) continue
    stationFound = true
    const n = findStation(t.order, nextStationName)
    if (n < 0 || n === i) continue
    track = t
    idx = i
    nextIdx = n
    break
  }
  if (!stationFound) return { supported: false, reason: `${stationName}역은 이 데이터셋에 없습니다.` }
  if (!track) return { supported: false, reason: `다음 역(${nextStationName})으로 방향을 정할 수 없습니다.` }

  const ascending = nextIdx > idx
  const dir = directionLabel(lineName, track.invertDirection ? !ascending : ascending)
  const seriesOf = (entry) => line.data[entry.key ?? entry.name]?.[dir]?.[day]

  const explicit = norm(stationName)
  const explicitSeries = explicit !== track.order[idx].name ? line.data[explicit]?.[dir]?.[day] : undefined
  const baseSeries = explicitSeries ?? seriesOf(track.order[idx])
  if (!baseSeries) return { supported: false, reason: `${stationName}역 ${dir} 데이터가 없습니다.` }

  const c0 = congestionAt(baseSeries, time)
  const pNow = pSitNow(c0)

  const step = ascending ? 1 : -1
  const journey = []
  let pNotSeated = 1 - pNow
  let prevC = c0
  for (let k = 1; k <= Math.min(stops, 15); k++) {
    const i = idx + step * k
    if (i < 0 || i >= track.order.length) break
    const series = seriesOf(track.order[i])
    if (!series) break
    const c = congestionAt(series, time)

    const standing = Math.max(0, prevC - SEAT_CONGESTION)
    const alight = Math.max(0, prevC - c)
    const seatedShare = prevC > 0 ? Math.min(1, SEAT_CONGESTION / prevC) : 1
    const pGain = standing > 0 ? Math.min(1, (alight * seatedShare) / standing) : 1

    pNotSeated *= 1 - pGain
    journey.push({
      station: track.order[i].name,
      congestion: round1(c),
      pGain: round3(pGain),
      pCumulative: Math.min(0.99, round3(1 - pNotSeated)),
    })
    prevC = c
  }

  return {
    supported: true,
    line: lineName,
    station: track.order[idx].name,
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
