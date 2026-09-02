// 예측 API 스모크 테스트 — DB 없이 PredictionController만 단독으로 띄워 확인.
// 사전조건: npm run build (dist 생성)
// 실행: node scripts/smoke-prediction.js
const { NestFactory } = require('@nestjs/core')
const { Module } = require('@nestjs/common')
const { PredictionController } = require('../dist/subway/prediction.controller.js')

class SmokeModule {}
Module({ controllers: [PredictionController] })(SmokeModule)

async function main() {
  const app = await NestFactory.create(SmokeModule, { logger: false })
  app.setGlobalPrefix('api')
  await app.listen(3999, '127.0.0.1')

  const q = new URLSearchParams({ line: '2호선', station: '강남', next: '역삼', day: '평일', time: '08:30', stops: '5' })
  const res = await fetch(`http://127.0.0.1:3999/api/subway/seat-prediction?${q}`)
  const data = await res.json()
  console.log('status:', res.status)
  console.log('direction:', data.direction, '| congestion:', data.congestion, '| pSitNow:', data.pSitNow)
  console.log('journey:', data.journey.map((s) => `${s.station} ${Math.round(s.pCumulative * 100)}%`).join(', '))

  const res2 = await fetch(`http://127.0.0.1:3999/api/subway/seat-prediction?line=9호선&station=당산&next=국회의사당`)
  const d2 = await res2.json()
  console.log('미지원 노선(9호선):', res2.status, d2.supported, d2.reason)

  const res3 = await fetch(`http://127.0.0.1:3999/api/subway/seat-prediction?line=2호선`)
  console.log('파라미터 누락 → 400 기대:', res3.status)

  await app.close()
}
main().catch((e) => { console.error(e); process.exit(1) })
