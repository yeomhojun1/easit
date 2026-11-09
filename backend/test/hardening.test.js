// 입력 검증·시크릿·외부 API·시간대 처리 단위 테스트 — DB·네트워크 불필요.
// 실행: cd backend && npm test   (pretest 로 nest build 가 먼저 돈다)
const test = require('node:test')
const assert = require('node:assert/strict')
const { createValidationPipe } = require('../dist/validation.js')
const { RegisterDto } = require('../dist/auth/dto/register.dto.js')
const { LoginDto } = require('../dist/auth/dto/login.dto.js')
const { UsersService } = require('../dist/users/users.service.js')
const { jwtSecret, DEV_JWT_SECRET } = require('../dist/auth/auth.config.js')
const { SubwayService } = require('../dist/subway/subway.service.js')
const { seoulTimeHHMM } = require('../dist/subway/prediction.controller.js')

const validRegister = { name: '홍길동', email: 'hong@example.com', password: 'password123', phone: '010-1234-5678', birthDate: '990101', gender: 'male' }
const body = (metatype) => ({ type: 'body', metatype })

// 컨트롤러와 같은 전역 파이프(main.ts 의 createValidationPipe)로 요청 본문을 검증한다
async function validate(metatype, value) {
  return createValidationPipe().transform(value, body(metatype))
}

async function rejection(metatype, value) {
  try {
    await validate(metatype, value)
  } catch (e) {
    return e
  }
  assert.fail(`거절되어야 하는데 통과함: ${JSON.stringify(value)}`)
}

test('회원가입: 정상 본문은 통과한다', async () => {
  const dto = await validate(RegisterDto, { ...validRegister })
  assert.ok(dto instanceof RegisterDto)
  assert.equal(dto.email, validRegister.email)
})

test('회원가입: points·isActive·id 등 DTO 에 없는 필드가 오면 400 으로 거절 (mass assignment)', async () => {
  const e = await rejection(RegisterDto, { ...validRegister, points: 999999, isActive: true, id: '00000000-0000-0000-0000-000000000000' })
  assert.equal(e.getStatus(), 400)
  const messages = e.getResponse().message
  console.log('  거절 메시지:', JSON.stringify(messages))
  for (const f of ['points', 'isActive', 'id']) {
    assert.ok(messages.includes(`property ${f} should not exist`), `${f} 거절 메시지가 없다: ${messages}`)
  }
})

test('회원가입: 형식 오류는 400', async () => {
  for (const bad of [
    { ...validRegister, email: 'not-an-email' },
    { ...validRegister, password: 'short' },
    { ...validRegister, birthDate: '1999-01-01' },
    { ...validRegister, gender: 'x' },
  ]) {
    const e = await rejection(RegisterDto, bad)
    assert.equal(e.getStatus(), 400)
  }
})

test('로그인: LoginDto 로 이메일·비밀번호 형식과 추가 필드를 검증한다', async () => {
  const ok = await validate(LoginDto, { email: 'demo@easit.app', password: 'demo1234' })
  assert.ok(ok instanceof LoginDto)
  for (const bad of [
    {},
    { email: 'demo@easit.app' },
    { email: 'nope', password: 'demo1234' },
    { email: 'demo@easit.app', password: 12345678 },
    { email: 'demo@easit.app', password: 'demo1234', isAdmin: true },
  ]) {
    const e = await rejection(LoginDto, bad)
    assert.equal(e.getStatus(), 400, JSON.stringify(bad))
  }
})

test('UsersService.createEmailUser: dto 를 펼치지 않아 서버 관리 필드가 엔티티로 넘어가지 않는다', async () => {
  let created
  const repo = { create: (x) => (created = x), save: async (x) => x }
  const svc = new UsersService(repo)
  await svc.createEmailUser({ ...validRegister, points: 999999, isActive: false, id: 'evil', provider: 'kakao' })
  for (const f of ['points', 'isActive', 'id']) assert.equal(f in created, false, `${f} 가 엔티티에 들어갔다`)
  assert.equal(created.provider, 'email')
  assert.notEqual(created.password, validRegister.password, '비밀번호는 해시되어야 한다')
  assert.equal(created.email, validRegister.email)
})

test('jwtSecret: 개발은 기본값+경고, 운영(NODE_ENV=production)은 미설정 시 예외', (t) => {
  const saved = { JWT_SECRET: process.env.JWT_SECRET, NODE_ENV: process.env.NODE_ENV }
  t.after(() => {
    for (const [k, v] of Object.entries(saved)) {
      if (v === undefined) delete process.env[k]
      else process.env[k] = v
    }
  })
  t.mock.method(console, 'warn', () => {})

  delete process.env.JWT_SECRET
  delete process.env.NODE_ENV
  assert.equal(jwtSecret(), DEV_JWT_SECRET)
  process.env.NODE_ENV = 'development'
  process.env.JWT_SECRET = '   '
  assert.equal(jwtSecret(), DEV_JWT_SECRET)

  process.env.NODE_ENV = 'production'
  delete process.env.JWT_SECRET
  assert.throws(() => jwtSecret(), /JWT_SECRET/)
  process.env.JWT_SECRET = '   '
  assert.throws(() => jwtSecret(), /JWT_SECRET/)
  process.env.JWT_SECRET = 'prod-secret-value'
  assert.equal(jwtSecret(), 'prod-secret-value')
})

test('SubwayService: 쿼리 값을 인코딩하고, 외부 API 오류는 502 로 바꾼다', async (t) => {
  const svc = new SubwayService({ get: () => 'KEY' })
  const urls = []
  const fake = t.mock.method(globalThis, 'fetch', async (url) => {
    urls.push(url)
    return { ok: true, status: 200, json: async () => ({ realtimePositionList: [1], response: { body: { items: { item: [2] } } } }) }
  })
  assert.deepEqual(await svc.getRealtimePosition('2호선/../x?y=1'), [1])
  assert.ok(urls[0].endsWith('/realtimePosition/0/100/' + encodeURIComponent('2호선/../x?y=1')), urls[0])
  assert.deepEqual(await svc.getCongestion('1&serviceKey=evil'), [2])
  assert.ok(urls[1].includes('subwayStationId=1%26serviceKey%3Devil&'), urls[1])

  fake.mock.mockImplementation(async () => ({ ok: false, status: 500, json: async () => ({}) }))
  await assert.rejects(svc.getArrivalInfo('강남'), (e) => e.getStatus() === 502 && /HTTP 500/.test(e.message))

  fake.mock.mockImplementation(async () => { throw new TypeError('fetch failed') })
  await assert.rejects(svc.getRealtimePosition('1'), (e) => e.getStatus() === 502)

  fake.mock.mockImplementation(async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('bad json') } }))
  await assert.rejects(svc.getCongestion('1'), (e) => e.getStatus() === 502)
})

test('기본 시각은 서버 시간대와 무관하게 서울 시각(UTC+9)', () => {
  assert.equal(seoulTimeHHMM(new Date('2026-01-01T00:30:00Z')), '09:30')
  assert.equal(seoulTimeHHMM(new Date('2026-01-01T15:05:00Z')), '00:05')
  assert.equal(seoulTimeHHMM(new Date('2026-06-30T23:59:00Z')), '08:59')
  assert.match(seoulTimeHHMM(), /^([01]\d|2[0-3]):[0-5]\d$/)
})
