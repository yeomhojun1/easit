// 서울교통공사 지하철혼잡도 CSV → 예측용 모델 JSON 변환 스크립트
// 실행: node scripts/build-congestion-model.mjs
// 입력: data/congestion-2026q1.csv (UTF-8, 공공데이터포털 원본을 인코딩만 변환)
// 출력: data/congestion-model.json
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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

  lines[line] ??= { stations: {}, data: {} }
  lines[line].stations[station] = parseInt(codeStr, 10)
  lines[line].data[station] ??= {}
  lines[line].data[station][direction] ??= {}
  lines[line].data[station][direction][day] = values
  count++
}

// 역 목록을 역번호 오름차순 배열로 정리 (노선 내 지리적 순서)
for (const line of Object.values(lines)) {
  line.order = Object.entries(line.stations)
    .sort((a, b) => a[1] - b[1])
    .map(([name, code]) => ({ name, code }))
  delete line.stations
}

const model = {
  meta: {
    source: '서울교통공사_지하철혼잡도정보 (2026-03-31 갱신, 공공데이터포털 15071311)',
    license: 'KOGL 제1유형 (출처표시)',
    note: '혼잡도(%) = 승차인원/정원. 34% 부근이 좌석 정원(1량 좌석 54석/정원 약 160명) 수준.',
    slots: slotLabels,
    days: ['평일', '토요일', '일요일'],
  },
  lines,
}

writeFileSync(OUT, JSON.stringify(model), 'utf-8')
console.log(`완료: ${count}개 행 → ${OUT}`)
console.log(`노선: ${Object.keys(lines).join(', ')}`)
