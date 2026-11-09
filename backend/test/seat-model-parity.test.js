// 백엔드 모델(backend/src/subway/seat-model.ts)과 데모 모드 사본(src/demo/seatModel.js)이
// 같은 입력에 같은 결과를 내는지 비교한다. 데모 사본은 손으로 옮긴 것이라 한쪽만 고치면 여기서 깨진다.
// 실행: cd backend && npm test   (pretest 로 nest build 가 먼저 돈다)
// 기본은 표본(모든 인접 역 쌍 × 3개 요일 유형 × 시각 80개 중 번갈아 절반 = 92,160건),
// PARITY_FULL=1 이면 전수(184,320건)를 비교한다.
const test = require('node:test')
const assert = require('node:assert/strict')
const path = require('node:path')
const { readFileSync } = require('node:fs')
const { pathToFileURL } = require('node:url')
const backend = require('../dist/subway/seat-model.js')

const ROOT = path.join(__dirname, '..', '..')
const FULL = process.env.PARITY_FULL === '1'

test('데모 모드 착석 모델이 백엔드 모델과 결과가 같다', async () => {
  const demo = await import(pathToFileURL(path.join(ROOT, 'src', 'demo', 'seatModel.js')).href)
  const model = JSON.parse(readFileSync(path.join(ROOT, 'backend', 'data', 'congestion-model.json'), 'utf8'))

  // 05:00 ~ 24:45 를 15분 간격으로 (30분 슬롯 경계와 보간 구간을 모두 포함)
  const times = []
  for (let h = 5; h <= 24; h++) {
    for (const m of [0, 15, 30, 45]) times.push(`${String(h % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }

  let compared = 0
  let pair = 0
  let mismatch = 0
  const examples = []
  for (const [line, L] of Object.entries(model.lines)) {
    const tracks = [L.order, ...(L.branches || []).map((b) => b.order)]
    for (const order of tracks) {
      for (let i = 0; i < order.length; i++) {
        for (const j of [i - 1, i + 1]) {
          if (j < 0 || j >= order.length) continue
          pair++
          for (const day of model.meta.days) {
            for (let k = 0; k < times.length; k++) {
              // 표본 모드: 역 쌍마다 시각을 번갈아 절반씩 골라, 전체로는 모든 시각을 덮는다
              if (!FULL && (k + pair) % 2 !== 0) continue
              const args = [line, order[i].name, order[j].name, day, times[k], 15]
              const a = JSON.stringify(backend.predictSeat(...args))
              const b = JSON.stringify(demo.predictSeat(model, ...args))
              compared++
              if (a !== b && mismatch++ < 5) examples.push(args.join(' / '))
            }
          }
        }
      }
    }
  }
  console.log(`  비교 ${compared}건 (${FULL ? '전수' : '표본'}), 불일치 ${mismatch}건`)
  assert.ok(compared > 0, '비교 대상이 없다 — 모델 파일 구조가 바뀌었는지 확인')
  assert.equal(mismatch, 0, `백엔드와 데모 모델 결과가 다르다 (예: ${examples.join(' | ')})`)
})
