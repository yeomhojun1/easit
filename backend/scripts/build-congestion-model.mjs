// 서울교통공사 지하철혼잡도 CSV → 예측용 모델 JSON 변환 스크립트
// 실행: node scripts/build-congestion-model.mjs
// 입력: data/congestion-2026q1.csv (UTF-8, 공공데이터포털 원본을 인코딩만 변환)
// 출력: data/congestion-model.json
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SUBWAY_LINES } from '../../src/data/subway.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'data', 'congestion-2026q1.csv')
const OUT = join(ROOT, 'data', 'congestion-model.json')

const raw = readFileSync(SRC, 'utf-8').replace(/^﻿/, '')
const rows = raw.split(/\r?\n/).filter((l) => l.trim())
const header = rows[0].split(',')

// 헤더: 구분,호선,역번호,역명,상하구분,5시30분 ... 00시30분 (30분 단위 39칸)
const slotLabels = header.slice(5).map((h) => {
  const m = h.trim().match(/^(\d{1,2})시(\d{2})분$/)
  return `${m[1].padStart(2, '0')}:${m[2]}`
})

const lines = {}
let count = 0

// 노선별 원본 레코드 수집 (덮어쓰지 않고 전부 보관 — 같은 역명이 여러 승강장 코드로 들어온다)
const byLine = {}
for (const row of rows.slice(1)) {
  const cols = row.split(',')
  const [day, line, codeStr, station, direction] = cols.map((c) => c.trim())
  const values = cols.slice(5).map((v) => {
    const n = parseFloat(v)
    return Number.isFinite(n) ? n : 0
  })
  if (values.length !== slotLabels.length) {
    console.warn(`칸 수 불일치, 건너뜀: ${line} ${station} ${direction} ${day}`)
    continue
  }
  ;(byLine[line] ??= []).push({ code: parseInt(codeStr, 10), csvName: station, dir: direction, day, values })
  count++
}

// ── 역 순서의 정본은 프론트 SUBWAY_LINES ────────────────────────────────
// 역번호 정렬은 신설·재배번 역(1호선 동묘앞 159, 8호선 남위례 2828)을 노선 끝에 붙여버린다.
// 실제 UI 기준인 프론트 배열 순서를 쓰고, 혼잡도 데이터는 역명으로 매칭한다.
// 같은 역명이 여러 코드로 나오면(2호선 성수 211/9002, 신도림 234/9003) 본선(낮은 코드)이 정본이고,
// 선택되지 않은 지선 승강장 시계열은 버리지 않고 `성수(지선)` 같은 별도 키로 보존한다.

// 지선은 프론트 branches 를 그대로 별도 트랙으로 만든다. junction = 본선과 만나는 역.
const BRANCH_TRACKS = {
  '2호선': {
    성수지선: { junction: '성수', junctionKey: '성수(지선)', invertDirection: true },
    신정지선: { junction: '신도림', junctionKey: '신도림(지선)' },
  },
  '5호선': {
    하남지선: { junction: '강동' },
    // 마천지선(둔촌동~마천)은 프론트 본선 배열에 이미 포함되어 별도 트랙을 만들지 않는다
  },
}

// 앱(프론트) 역명 → CSV 역명
const NAME_ALIASES = { 당고개: '불암산', 뚝섬유원지: '자양' }

const norm = (s) => s.replace(/\s+/g, '').replace(/역$/, '')
const bare = (s) => norm(s).replace(/\(.*?\)/g, '') // 괄호 병기 제거
const baseName = (s) => bare(s).replace(/[A-Z]$/, '') // 성수E·응암S 같은 승강장 접미 제거
const allZero = (v) => v.every((n) => n === 0)

const leftovers = []
for (const L of SUBWAY_LINES) {
  const recs = byLine[L.name]
  if (!recs) continue

  const cand = new Map()
  recs.forEach((r, i) => {
    for (const k of new Set([bare(r.csvName), baseName(r.csvName)])) {
      if (!cand.has(k)) cand.set(k, [])
      cand.get(k).push(i)
    }
  })

  const branchStations = Object.values(L.branches ?? {}).flat()
  const targets = [...new Set([...L.stations, ...branchStations])]

  const data = {}
  const codeOf = {}
  const used = new Set()

  for (const station of targets) {
    const keys = [bare(station), NAME_ALIASES[bare(station)]].filter(Boolean)
    const idxs = [...new Set(keys.flatMap((k) => cand.get(k) ?? []))].sort((a, b) => recs[a].code - recs[b].code)
    for (const i of idxs) {
      const r = recs[i]
      if (allZero(r.values)) continue // 측정 없는 승강장·방향(전부 0)은 "데이터 없음"으로 둔다
      data[station] ??= {}
      data[station][r.dir] ??= {}
      if (data[station][r.dir][r.day]) continue // 이미 더 낮은 코드(본선)가 차지
      data[station][r.dir][r.day] = r.values
      used.add(i)
      codeOf[station] ??= r.code
    }
  }

  // 정본으로 선택되지 않은 레코드(지선 승강장 등)를 별도 키로 보존
  for (let i = 0; i < recs.length; i++) {
    if (used.has(i)) continue
    const r = recs[i]
    if (allZero(r.values)) continue
    // 역명이 완전히 같으면 (지선) 을 붙이고, CSV 쪽에 이미 병기가 있으면(강동(마천)) 그 이름을 그대로 쓴다
    const owner = targets.find((s) => norm(s) === norm(r.csvName))
    const key = owner ? `${owner}(지선)` : r.csvName
    data[key] ??= {}
    data[key][r.dir] ??= {}
    data[key][r.dir][r.day] ??= r.values
    leftovers.push(`${L.name} ${r.csvName}(${r.code}) → ${key}`)
  }

  const entry = (name, extra = {}) => ({ name, code: codeOf[name] ?? null, ...extra })
  const branches = []
  for (const [bname, cfg] of Object.entries(BRANCH_TRACKS[L.name] ?? {})) {
    const stations = L.branches?.[bname]
    if (!stations) continue
    const track = { name: bname, order: [] }
    if (cfg.invertDirection) track.invertDirection = true
    if (cfg.junction) track.order.push(entry(cfg.junction, cfg.junctionKey ? { key: cfg.junctionKey } : {}))
    for (const s of stations) track.order.push(entry(s))
    branches.push(track)
  }

  lines[L.name] = { order: L.stations.map((s) => entry(s)), ...(branches.length ? { branches } : {}), data }
}

const model = {
  meta: {
    source: '서울교통공사_지하철혼잡도정보 (2026-03-31 갱신, 공공데이터포털 15071311)',
    license: 'KOGL 제1유형 (출처표시)',
    note: '혼잡도(%) = 승차인원/정원. 34% 부근이 좌석 정원(1량 좌석 54석/정원 약 160명) 수준.',
    stationOrder: '프론트 src/data/subway.js 의 SUBWAY_LINES 순서를 정본으로 사용 (역번호 정렬 아님)',
    slots: slotLabels,
    days: ['평일', '토요일', '일요일'],
  },
  lines,
}

writeFileSync(OUT, JSON.stringify(model), 'utf-8')
console.log(`완료: ${count}개 행 → ${OUT}`)
console.log(`노선: ${Object.keys(lines).join(', ')}`)
if (leftovers.length) console.log(`지선·별도 승강장으로 보존: ${[...new Set(leftovers)].join(' / ')}`)
