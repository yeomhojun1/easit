// 예측 모델 단위 테스트 — DB·네트워크 불필요.
// 실행: cd backend && npm test   (pretest 로 nest build 가 먼저 돈다)
const test = require('node:test')
const assert = require('node:assert/strict')
const { predictSeat } = require('../dist/subway/seat-model.js')
const { PredictionController } = require('../dist/subway/prediction.controller.js')

const names = (r) => r.journey.map((s) => s.station)

test('2호선 성수: 지선 승강장(9002)이 아니라 본선(211) 기준으로 내선 판정 — B1 회귀', () => {
  const r = predictSeat('2호선', '성수', '건대입구', '평일', '08:00', 5)
  assert.equal(r.supported, true)
  assert.equal(r.direction, '내선')
  assert.deepEqual(names(r).slice(0, 3), ['건대입구', '구의', '강변'])
  assert.ok(r.congestion > 0, '본선 성수 내선 혼잡도는 0이 아니어야 한다')
  assert.equal(r.congestion, 42.2)
})

test('2호선 신도림: 혼잡도 0%·착석 99.8% 가 나오지 않는다 — B1 회귀', () => {
  const r = predictSeat('2호선', '신도림', '문래', '평일', '08:00', 3)
  assert.equal(r.supported, true)
  assert.equal(r.direction, '내선')
  assert.ok(r.congestion > 100, `아침 신도림 내선은 100% 이상이어야 하는데 ${r.congestion}%`)
  assert.ok(r.pSitNow < 0.05)
  assert.deepEqual(names(r), ['문래', '영등포구청', '당산'])
})

test('2호선 뚝섬→성수: 본선 성수가 경로에서 빠지지 않는다 — B1 회귀', () => {
  const r = predictSeat('2호선', '뚝섬', '성수', '평일', '08:00', 3)
  assert.equal(names(r)[0], '성수')
})

test('1호선 동묘앞(159): 역번호가 아니라 프론트 노선 순서를 따른다 — B2 회귀', () => {
  const r = predictSeat('1호선', '동대문', '동묘앞', '평일', '08:00', 5)
  assert.equal(r.supported, true)
  assert.equal(r.direction, '하선')
  assert.deepEqual(names(r).slice(0, 3), ['동묘앞', '신설동', '제기동'])
})

test('8호선 남위례(2828): 복정–산성 사이에 놓인다 — B2 회귀', () => {
  const a = predictSeat('8호선', '복정', '남위례', '평일', '08:00', 3)
  assert.deepEqual(names(a), ['남위례', '산성', '남한산성입구'])
  const b = predictSeat('8호선', '남위례', '산성', '평일', '08:00', 2)
  assert.equal(b.direction, '하선')
  assert.deepEqual(names(b), ['산성', '남한산성입구'])
})

test('5호선 강동: 하남·마천 두 분기 모두 조회된다 — B3 회귀', () => {
  const haname = predictSeat('5호선', '강동', '길동', '평일', '08:00', 3)
  assert.equal(haname.supported, true, haname.reason)
  assert.equal(haname.direction, '하선')
  assert.equal(haname.congestion, 31.6)

  const machon = predictSeat('5호선', '강동(마천)', '둔촌동', '평일', '08:00', 3)
  assert.equal(machon.supported, true, machon.reason)
  assert.equal(machon.congestion, 67.8)

  const up = predictSeat('5호선', '강동', '천호', '평일', '08:00', 2)
  assert.equal(up.direction, '상선')
  assert.equal(up.congestion, 79)
})

test('2호선 지선은 본선과 섞이지 않고 지선 안에서만 진행한다', () => {
  const seongsu = predictSeat('2호선', '성수', '용답', '평일', '08:00', 3)
  assert.equal(seongsu.supported, true, seongsu.reason)
  assert.deepEqual(names(seongsu), ['용답', '신답', '용두'])

  const sindorim = predictSeat('2호선', '신도림', '도림천', '평일', '08:00', 3)
  assert.equal(sindorim.supported, true, sindorim.reason)
  assert.deepEqual(names(sindorim), ['도림천', '양천구청', '신정네거리'])
})

test('미지원 입력은 예외 없이 supported:false 로 응답한다', () => {
  for (const args of [
    ['9호선', '당산', '국회의사당'],
    ['2호선', '없는역', '강남'],
    ['2호선', '강남', '강남'],
    ['2호선', '강남', '오이도'],
  ]) {
    const r = predictSeat(args[0], args[1], args[2], '평일', '08:00', 3)
    assert.equal(r.supported, false, `${args.join('/')} 는 미지원이어야 한다`)
    assert.ok(typeof r.reason === 'string' && r.reason.length > 0)
  }
  const day = predictSeat('2호선', '강남', '역삼', '월요일', '08:00', 3)
  assert.equal(day.supported, false)
})

test('역명 별칭·표기 흔들림을 흡수한다', () => {
  const base = predictSeat('4호선', '총신대입구(이수)', '사당', '평일', '08:00', 2)
  assert.equal(base.supported, true, base.reason)
  for (const name of ['이수', '총신대입구', '총신대입구 역']) {
    const r = predictSeat('4호선', name, '사당', '평일', '08:00', 2)
    assert.equal(r.supported, true, `${name} 매칭 실패: ${r.reason}`)
    assert.equal(r.congestion, base.congestion)
  }
  // 개명역: 당고개 → 불암산, 뚝섬유원지 → 자양(7호선)
  assert.equal(predictSeat('4호선', '당고개', '상계', '평일', '08:00', 2).supported, true)
  assert.equal(predictSeat('7호선', '뚝섬유원지', '청담', '평일', '08:00', 2).supported, true)
})

test('시각 검증: 형식·범위를 벗어난 time 은 400', () => {
  const c = new PredictionController()
  const ok = c.getSeatPrediction('2호선', '강남', '역삼', '평일', '08:30', '3')
  assert.equal(ok.supported, true)

  for (const bad of ['25:99', '24:00', '08:60', '8시', '830', '-1:00']) {
    assert.throws(
      () => c.getSeatPrediction('2호선', '강남', '역삼', '평일', bad, '3'),
      (e) => e.getStatus?.() === 400,
      `${bad} 는 400 이어야 한다`,
    )
  }
  assert.throws(() => c.getSeatPrediction('2호선', undefined, '역삼'), (e) => e.getStatus?.() === 400)
})

test('30분 슬롯 선형 보간이 단조적이고 누적 착석 확률이 증가한다', () => {
  const at = (t) => predictSeat('2호선', '강남', '역삼', '평일', t, 5)
  const a = at('08:30').congestion
  const b = at('08:45').congestion
  const c = at('09:00').congestion
  assert.ok((a <= b && b <= c) || (a >= b && b >= c), `보간 단조성 위반: ${a}/${b}/${c}`)

  const r = at('08:30')
  let prev = -1
  for (const step of r.journey) {
    assert.ok(step.pCumulative >= prev, '누적 착석 확률은 감소하지 않아야 한다')
    assert.ok(step.pCumulative <= 0.99)
    assert.ok(step.pGain >= 0 && step.pGain <= 1)
    prev = step.pCumulative
  }
})
