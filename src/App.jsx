import { useState } from 'react'

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const STATIONS = ['강남', '역삼', '선릉', '삼성', '종합운동장', '잠실나루', '잠실', '구의', '건대입구', '성수']
const CURRENT_STATION = '역삼'
const CURRENT_IDX = STATIONS.indexOf(CURRENT_STATION)

const MOCK_TRAINS = [
  { line: '2호선', color: '#00A650', number: '2312', eta: 2, direction: '성수 방면' },
  { line: '2호선', color: '#00A650', number: '2298', eta: 8, direction: '성수 방면' },
]

const CARS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  prob: [38, 52, 71, 65, 44, 29, 60, 73, 48, 35][i],
  priority: i === 0 || i === 9,
}))

const ZONES_4 = [
  { key: 'A', label: '존 A', desc: '1번 출입문', prob: 55 },
  { key: 'B', label: '존 B', desc: '2번 출입문', prob: 72 },
  { key: 'C', label: '존 C', desc: '3번 출입문', prob: 68 },
  { key: 'D', label: '존 D', desc: '4번 출입문', prob: 49 },
]

const ZONES_8 = [
  { key: 'A1', label: 'A-1', prob: 58 }, { key: 'A2', label: 'A-2', prob: 51 },
  { key: 'B1', label: 'B-1', prob: 75 }, { key: 'B2', label: 'B-2', prob: 68 },
  { key: 'C1', label: 'C-1', prob: 71 }, { key: 'C2', label: 'C-2', prob: 64 },
  { key: 'D1', label: 'D-1', prob: 52 }, { key: 'D2', label: 'D-2', prob: 45 },
]

const MISSIONS = [
  { id: 1, icon: '🎯', title: '첫 하차 정보 제공', desc: '처음으로 하차 정보 제공', reward: 1, done: true },
  { id: 2, icon: '🔥', title: '5회 연속 정확한 정보', desc: '정확도 100% 5회 연속', reward: 3, done: false },
  { id: 3, icon: '⏰', title: '출퇴근 시간대 10회', desc: '7-9시, 18-20시 정보 제공', reward: 2, done: false },
  { id: 4, icon: '♿', title: '교통약자 배려', desc: '교통약자에게 자리 양보', reward: 2, done: false },
]

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg: '#080B14', bg2: '#0D1117', card: '#111827', border: '#1F2937',
  accent: '#818CF8', accentDark: '#4338CA',
  green: '#10B981', yellow: '#F59E0B', red: '#EF4444',
  text: '#F9FAFB', muted: '#6B7280', sub: '#9CA3AF',
  gradPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}

const probColor = (p) => p >= 65 ? C.green : p >= 40 ? C.yellow : C.muted

const st = {
  wrap: { fontFamily: "'Noto Sans KR', sans-serif", background: C.bg, minHeight: '100dvh', maxWidth: 430, margin: '0 auto', color: C.text, overflowX: 'hidden' },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 },
  btn: { width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' },
  input: { width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg2, color: C.text, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  label: { fontSize: 13, color: C.sub, fontWeight: 600, marginBottom: 6, display: 'block' },
}

// ─── SUBWAY CAR DIAGRAM ─────────────────────────────────────────────────────
function SubwayCarDiagram({ zoneData, selected, onSelect }) {
  const ZONE_SEATS = { A: 3, B: 5, C: 5, D: 3 }

  const Seat = ({ color, priority }) => (
    <div style={{
      width: 18, height: 15, borderRadius: 3, flexShrink: 0,
      background: priority ? C.yellow + '33' : color + '33',
      border: `1px solid ${priority ? C.yellow : color}66`,
    }} />
  )

  const Door = () => (
    <div style={{ width: 28, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <div style={{ width: 24, height: 5, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 1 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ fontSize: 14 }}>🚪</div>
        <div style={{ fontSize: 8, color: C.accent, fontWeight: 700 }}>DOOR</div>
      </div>
      <div style={{ width: 24, height: 5, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 1 }} />
    </div>
  )

  const ZoneSection = ({ zoneKey }) => {
    const z = zoneData.find(z => z.key === zoneKey)
    const prob = z?.prob ?? 0
    const color = probColor(prob)
    const isSelected = selected === zoneKey
    const seatCount = ZONE_SEATS[zoneKey]

    return (
      <div onClick={() => onSelect(zoneKey)} style={{
        flex: seatCount, display: 'flex', flexDirection: 'column',
        background: isSelected ? color + '18' : 'transparent',
        borderRadius: 8, cursor: 'pointer',
        border: `2px solid ${isSelected ? color : 'transparent'}`,
        transition: 'all 0.2s', overflow: 'hidden',
      }}>
        {/* Top seat row */}
        <div style={{ display: 'flex', gap: 3, padding: '6px 4px 4px', justifyContent: 'center' }}>
          {Array.from({ length: seatCount }, (_, i) => (
            <Seat key={i} color={color} priority={zoneKey === 'A' && i === 0} />
          ))}
        </div>
        {/* Zone label */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>존 {zoneKey}</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginTop: 2 }}>{prob}%</div>
          {isSelected && <div style={{ width: 20, height: 2, background: color, borderRadius: 1, marginTop: 3 }} />}
        </div>
        {/* Bottom seat row */}
        <div style={{ display: 'flex', gap: 3, padding: '4px 4px 6px', justifyContent: 'center' }}>
          {Array.from({ length: seatCount }, (_, i) => (
            <Seat key={i} color={color} priority={zoneKey === 'D' && i === seatCount - 1} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Car header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 6 }}>
        <span>← 앞 칸 방향</span>
        <span>뒷 칸 방향 →</span>
      </div>

      {/* Main car visualization */}
      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch',
          minWidth: 480, height: 120,
          border: `2px solid ${C.border}`,
          borderRadius: 14, background: C.bg2,
          overflow: 'hidden',
        }}>
          {/* Car front end */}
          <div style={{ width: 12, background: C.border + '44', flexShrink: 0 }} />
          <ZoneSection zoneKey="A" />
          <Door />
          <ZoneSection zoneKey="B" />
          <Door />
          <ZoneSection zoneKey="C" />
          <Door />
          <ZoneSection zoneKey="D" />
          {/* Car back end */}
          <div style={{ width: 12, background: C.border + '44', flexShrink: 0 }} />
        </div>
      </div>

      {/* Priority seat note */}
      <div style={{ fontSize: 11, color: C.muted, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 14, height: 10, borderRadius: 2, background: C.yellow + '33', border: `1px solid ${C.yellow}66` }} />
        <span>우선석 (어르신·임산부·장애인 전용 — 앱 선점 차단)</span>
      </div>

      {/* Zone selector buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
        {zoneData.map(z => {
          const color = probColor(z.prob)
          const isSelected = selected === z.key
          return (
            <button key={z.key} onClick={() => onSelect(z.key)}
              style={{ padding: '10px 4px', background: isSelected ? color + '22' : C.card, border: `2px solid ${isSelected ? color : C.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color }}>{z.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{z.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function OnboardingScreen({ navigate }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '0 28px' }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ width: 88, height: 88, borderRadius: 28, background: C.gradPurple, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 42, boxShadow: '0 20px 40px rgba(102,126,234,0.35)' }}>
          🚇
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1.5 }}>Easit</div>
        <div style={{ color: C.sub, fontSize: 14, marginTop: 8, lineHeight: 1.6 }}>지하철 좌석 예측 & 리워드</div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 카카오 */}
        <button onClick={() => navigate('main')}
          style={{ ...st.btn, background: '#FEE500', color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💬</span> 카카오로 시작하기
        </button>
        {/* 네이버 */}
        <button onClick={() => navigate('main')}
          style={{ ...st.btn, background: '#03C75A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 20 }}>N</span> 네이버로 시작하기
        </button>
        {/* 구글 */}
        <button onClick={() => navigate('main')}
          style={{ ...st.btn, background: '#fff', color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>G</span> Google로 시작하기
        </button>
        {/* 이메일 */}
        <button onClick={() => navigate('login')}
          style={{ ...st.btn, background: C.card, color: C.text, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span>✉️</span> 이메일로 시작하기
        </button>
      </div>

      <div style={{ marginTop: 20, color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 1.8 }}>
        로그인 시 <span style={{ color: C.accent }}>개인정보 처리방침</span> 및 <span style={{ color: C.accent }}>이용약관</span>에 동의합니다.
      </div>
    </div>
  )
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen({ navigate }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ padding: '56px 24px 32px' }}>
      <button onClick={() => navigate('onboarding')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 0 20px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← 뒤로
      </button>
      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 6 }}>로그인</div>
      <div style={{ color: C.sub, fontSize: 14, marginBottom: 32 }}>이메일로 계속하기</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={st.label}>이메일</label>
          <input style={st.input} type="email" placeholder="example@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div>
          <label style={st.label}>비밀번호</label>
          <input style={st.input} type="password" placeholder="비밀번호 입력" value={form.password} onChange={e => set('password', e.target.value)} />
        </div>
      </div>

      <button onClick={() => navigate('main')}
        style={{ ...st.btn, background: C.gradPurple, color: '#fff', marginTop: 24, boxShadow: '0 8px 24px rgba(102,126,234,0.3)' }}>
        로그인
      </button>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: C.muted }}>
        계정이 없으신가요?{' '}
        <span onClick={() => navigate('signup')} style={{ color: C.accent, cursor: 'pointer', fontWeight: 700 }}>
          회원가입
        </span>
      </div>
    </div>
  )
}

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
function SignupScreen({ navigate }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', birth: '', gender: '' })
  const [agreed, setAgreed] = useState(false)
  const [step, setStep] = useState(1)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const formatPhone = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 3) return digits
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }

  const formatBirth = (v) => v.replace(/\D/g, '').slice(0, 6)

  const isStep1Valid = form.name && form.email && form.password.length >= 8
  const isStep2Valid = form.phone.replace(/\D/g, '').length === 11 && form.birth.length === 6 && form.gender

  return (
    <div style={{ padding: '56px 24px 40px' }}>
      <button onClick={() => step === 1 ? navigate('login') : setStep(1)}
        style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 0 20px', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
        ← 뒤로
      </button>

      <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: C.accent }} />
        <div style={{ flex: 1, height: 4, borderRadius: 2, background: step >= 2 ? C.accent : C.border }} />
      </div>

      <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 4 }}>
        {step === 1 ? '계정 만들기' : '추가 정보 입력'}
      </div>
      <div style={{ color: C.sub, fontSize: 14, marginBottom: 28 }}>
        {step === 1 ? '기본 정보를 입력해주세요' : '서비스 이용을 위한 정보입니다'}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={st.label}>이름</label>
            <input style={st.input} placeholder="홍길동" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>
          <div>
            <label style={st.label}>이메일</label>
            <input style={st.input} type="email" placeholder="example@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
          </div>
          <div>
            <label style={st.label}>비밀번호 (8자 이상)</label>
            <input style={st.input} type="password" placeholder="비밀번호 입력" value={form.password} onChange={e => set('password', e.target.value)} />
            {form.password && form.password.length < 8 && (
              <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>8자 이상 입력해주세요</div>
            )}
          </div>
          <button onClick={() => isStep1Valid && setStep(2)}
            style={{ ...st.btn, background: isStep1Valid ? C.gradPurple : C.border, color: '#fff', marginTop: 8, opacity: isStep1Valid ? 1 : 0.5 }}>
            다음
          </button>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={st.label}>전화번호</label>
            <input style={st.input} type="tel" placeholder="010-0000-0000"
              value={form.phone}
              onChange={e => set('phone', formatPhone(e.target.value))} />
          </div>
          <div>
            <label style={st.label}>생년월일 6자리 <span style={{ color: C.muted, fontWeight: 400 }}>(예: 990101)</span></label>
            <input style={st.input} placeholder="YYMMDD" maxLength={6}
              value={form.birth}
              onChange={e => set('birth', formatBirth(e.target.value))} />
            <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
              ※ 연령 확인 용도로만 사용되며 서버에 저장되지 않습니다.
            </div>
          </div>
          <div>
            <label style={st.label}>성별</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {['male', 'female'].map(g => (
                <button key={g} onClick={() => set('gender', g)}
                  style={{ flex: 1, padding: 14, borderRadius: 12, border: `2px solid ${form.gender === g ? C.accent : C.border}`, background: form.gender === g ? C.accentDark + '33' : C.card, color: form.gender === g ? C.accent : C.sub, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', fontSize: 14 }}>
                  {g === 'male' ? '👨 남성' : '👩 여성'}
                </button>
              ))}
            </div>
          </div>

          {/* 약관 동의 */}
          <div style={{ ...st.card, display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }} onClick={() => setAgreed(!agreed)}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agreed ? C.accent : C.border}`, background: agreed ? C.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
              {agreed && <span style={{ fontSize: 13, color: '#fff' }}>✓</span>}
            </div>
            <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>
              <span style={{ color: C.text, fontWeight: 700 }}>개인정보 수집 및 이용에 동의합니다.</span><br />
              수집 항목: 이름, 이메일, 전화번호, 생년월일, 성별<br />
              목적: 회원 식별 및 서비스 제공<br />
              보유기간: 회원 탈퇴 시까지
            </div>
          </div>

          <button onClick={() => (isStep2Valid && agreed) && navigate('main')}
            style={{ ...st.btn, background: (isStep2Valid && agreed) ? C.gradPurple : C.border, color: '#fff', opacity: (isStep2Valid && agreed) ? 1 : 0.5 }}>
            가입 완료
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
function MainScreen({ navigate, setSelectedCar }) {
  const [trainIdx, setTrainIdx] = useState(0)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '52px 20px 20px', background: 'linear-gradient(180deg, rgba(15,20,40,1) 0%, rgba(8,11,20,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ color: C.sub, fontSize: 12, fontWeight: 500 }}>GPS 감지됨 · 실시간</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{CURRENT_STATION}역</div>
        <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>수도권 2호선 · 외선순환</div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={st.card}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 12 }}>도착 예정 열차</div>
          {MOCK_TRAINS.map((t, i) => (
            <div key={i} onClick={() => setTrainIdx(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: t.color + '22', color: t.color, fontSize: 12, fontWeight: 600 }}>{t.line}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{t.direction}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>열차번호 {t.number}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: i === trainIdx ? C.accent : C.text }}>{t.eta}분</div>
                <div style={{ fontSize: 11, color: C.muted }}>후 도착</div>
              </div>
            </div>
          ))}
        </div>

        <div style={st.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>객차별 착석 확률</span>
            <span style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: C.accentDark + '33', color: C.accent, fontSize: 11, fontWeight: 600 }}>방금 업데이트</span>
          </div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6 }}>
            {CARS.map(car => {
              const color = probColor(car.prob)
              return (
                <div key={car.id} onClick={() => { setSelectedCar(car); navigate('zone') }}
                  style={{ flexShrink: 0, width: 62, background: C.bg2, borderRadius: 12, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${car.prob >= 65 ? color + '66' : C.border}` }}>
                  {car.priority && <div style={{ fontSize: 8, color: C.yellow, fontWeight: 700, marginBottom: 3 }}>우선석</div>}
                  <div style={{ fontSize: 16, fontWeight: 900, color }}>{car.prob}%</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{car.id}호차</div>
                  <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: C.border }}>
                    <div style={{ height: '100%', width: `${car.prob}%`, borderRadius: 2, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: C.muted, display: 'flex', gap: 12 }}>
            <span style={{ color: C.green }}>■</span> 높음(65%+)
            <span style={{ color: C.yellow }}>■</span> 보통(40%+)
            <span style={{ color: C.muted }}>■</span> 낮음
          </div>
        </div>

        <div style={{ ...st.card, background: C.accentDark + '18', border: `1px solid ${C.accentDark}44`, display: 'flex', gap: 12 }}>
          <span style={{ fontSize: 20 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>지금 3명이 같은 정보를 보고 있어요</div>
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>동시 알림 최대 3명 제한으로 더 공정하게 자리를 잡을 수 있어요.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ZONE SCREEN ─────────────────────────────────────────────────────────────
function ZoneScreen({ selectedCar, navigate, isPremium, setIsPremium }) {
  const [stops, setStops] = useState(2)
  const [selectedZone, setSelectedZone] = useState(null)
  const car = selectedCar || CARS[2]
  const zoneData = isPremium ? ZONES_8 : ZONES_4
  const adjustedProb = (base) => Math.max(10, base - stops * 4)
  const adjustedZones = zoneData.map(z => ({ ...z, prob: adjustedProb(z.prob) }))

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '52px 20px 16px' }}>
        <button onClick={() => navigate('main')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          ← 뒤로
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{car.id}호차 상세</div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>
              현재 착석 확률 <span style={{ color: probColor(car.prob), fontWeight: 700 }}>{car.prob}%</span>
            </div>
          </div>
          <button onClick={() => setIsPremium(!isPremium)}
            style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${isPremium ? C.accent : C.border}`, background: isPremium ? C.gradPurple : 'transparent', color: isPremium ? '#fff' : C.sub, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            {isPremium ? '⭐ 프리미엄' : '🔒 8존 보기'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Subway Car Diagram */}
        <div style={st.card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            객차 존 배치 — {isPremium ? '8존 프리미엄' : '4존 기본'}
          </div>
          {isPremium ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {adjustedZones.map(z => {
                const color = probColor(z.prob)
                const isSelected = selectedZone === z.key
                return (
                  <button key={z.key} onClick={() => setSelectedZone(z.key)}
                    style={{ padding: '14px 10px', background: isSelected ? color + '22' : C.bg2, border: `2px solid ${isSelected ? color : C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color }}>{z.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginTop: 4 }}>{z.prob}%</div>
                    <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: C.border }}>
                      <div style={{ height: '100%', width: `${z.prob}%`, borderRadius: 2, background: color }} />
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <SubwayCarDiagram
              zoneData={adjustedZones}
              selected={selectedZone}
              onSelect={setSelectedZone}
            />
          )}
        </div>

        {/* Stop Slider */}
        <div style={st.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>정거장 후 착석 확률</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{stops}정거장 후</span>
          </div>
          <input type="range" min={1} max={8} value={stops} onChange={e => setStops(+e.target.value)} style={{ width: '100%', accentColor: C.accent }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 6 }}>
            <span>1정거장</span><span>8정거장</span>
          </div>
          <div style={{ marginTop: 12, padding: '14px 16px', background: C.bg2, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: C.sub }}>
              {STATIONS[Math.min(CURRENT_IDX + stops, STATIONS.length - 1)]}역 즈음
            </span>
            <span style={{ fontSize: 24, fontWeight: 900, color: probColor(Math.max(20, car.prob - stops * 5)) }}>
              {Math.max(20, car.prob - stops * 5)}%
            </span>
          </div>
        </div>

        <button onClick={() => navigate('reward-flow')}
          style={{ ...st.btn, background: C.gradPurple, color: '#fff', boxShadow: '0 8px 24px rgba(102,126,234,0.3)' }}>
          🪑 좌석에 앉았어요
        </button>
      </div>
    </div>
  )
}

// ─── REWARD FLOW ─────────────────────────────────────────────────────────────
function RewardFlowScreen({ navigate, points, setPoints }) {
  const [step, setStep] = useState(1)
  const [zone, setZone] = useState(null)
  const [dest, setDest] = useState('')
  const STEPS = ['착석 확인', '존 선택', '하차역 입력', '포인트 적립']

  return (
    <div style={{ padding: '52px 20px 80px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {STEPS.map((_, i) => <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? C.accent : C.border, transition: 'background 0.3s' }} />)}
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>{step}/{STEPS.length} · <span style={{ color: C.text, fontWeight: 600 }}>{STEPS[step - 1]}</span></div>
      </div>

      {step === 1 && (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🪑</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>좌석에 앉으셨나요?</div>
          <div style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
            하차역 정보를 알려주시면<br /><span style={{ color: C.accent, fontWeight: 700 }}>+1 포인트</span>를 드려요
          </div>
          <button onClick={() => setStep(2)} style={{ ...st.btn, background: C.gradPurple, color: '#fff', marginBottom: 12 }}>네, 앉았어요!</button>
          <button onClick={() => navigate('main')} style={{ ...st.btn, background: 'none', color: C.muted }}>취소</button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>어느 존에 앉으셨나요?</div>
          <SubwayCarDiagram zoneData={ZONES_4} selected={zone} onSelect={setZone} />
          <button onClick={() => zone && setStep(3)}
            style={{ ...st.btn, background: zone ? C.gradPurple : C.border, color: '#fff', marginTop: 20, opacity: zone ? 1 : 0.5 }}>
            다음
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>어느 역에서 내리실 건가요?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {STATIONS.slice(CURRENT_IDX + 1).map(s => (
              <button key={s} onClick={() => setDest(s)}
                style={{ padding: '14px 18px', borderRadius: 12, border: `2px solid ${dest === s ? C.accent : C.border}`, background: dest === s ? C.accentDark + '33' : C.card, color: dest === s ? C.accent : C.text, textAlign: 'left', cursor: 'pointer', fontWeight: dest === s ? 700 : 400, fontSize: 15, fontFamily: 'inherit' }}>
                {s}역
              </button>
            ))}
          </div>
          <button onClick={() => { if (dest) { setPoints(p => p + 1); setStep(4) } }}
            style={{ ...st.btn, background: dest ? C.gradPurple : C.border, color: '#fff', opacity: dest ? 1 : 0.5 }}>
            제출하기
          </button>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🎉</div>
          <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 8 }}>+1 포인트 적립!</div>
          <div style={{ color: C.sub, fontSize: 14, marginBottom: 10, lineHeight: 1.6 }}>
            <span style={{ color: C.text, fontWeight: 600 }}>{dest}역</span> 도착 후 GPS로 최종 확인됩니다.
          </div>
          <div style={{ ...st.card, display: 'inline-block', padding: '14px 28px', marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>현재 보유 포인트</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: C.accent }}>{points}P</div>
          </div>
          <button onClick={() => navigate('main')} style={{ ...st.btn, background: C.gradPurple, color: '#fff' }}>메인으로 돌아가기</button>
        </div>
      )}
    </div>
  )
}

// ─── REWARDS SCREEN ───────────────────────────────────────────────────────────
function RewardsScreen({ points, isPremium, setIsPremium }) {
  const toNext = 3 - (points % 3)
  const premiumDays = Math.floor(points / 3)

  return (
    <div style={{ padding: '52px 16px 80px' }}>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>리워드</div>
      <div style={{ borderRadius: 20, background: 'linear-gradient(135deg, #1a1040, #2d1b69)', padding: 20, marginBottom: 12, border: `1px solid ${C.accentDark}66` }}>
        <div style={{ fontSize: 13, color: '#a5b4fc', marginBottom: 6 }}>보유 포인트</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: -2 }}>{points}<span style={{ fontSize: 24 }}>P</span></div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a5b4fc', marginBottom: 6 }}>
            <span>다음 프리미엄 이용권까지</span><span>{toNext}P 남음</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${((3 - toNext) / 3) * 100}%`, borderRadius: 3, background: C.accent }} />
          </div>
        </div>
        {premiumDays > 0 && (
          <button onClick={() => setIsPremium(true)} style={{ ...st.btn, background: 'rgba(255,255,255,0.15)', color: '#fff', marginTop: 14 }}>
            ⭐ 프리미엄 {premiumDays}일 사용하기
          </button>
        )}
      </div>

      <div style={{ ...st.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⭐ 프리미엄</div>
            <div style={{ fontSize: 12, color: C.muted }}>8존 세분화 · 고급 예측 · 선탑승 알림</div>
          </div>
          <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: isPremium ? C.green + '22' : C.border, color: isPremium ? C.green : C.muted, fontSize: 12, fontWeight: 600 }}>
            {isPremium ? '이용 중' : '미이용'}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>미션</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {MISSIONS.map(m => (
          <div key={m.id} style={{ ...st.card, display: 'flex', alignItems: 'center', gap: 14, opacity: m.done ? 0.55 : 1 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: m.done ? C.green + '22' : C.accentDark + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {m.done ? '✅' : m.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{m.title}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{m.desc}</div>
            </div>
            <div style={{ display: 'inline-flex', padding: '3px 10px', borderRadius: 20, background: C.accentDark + '33', color: C.accent, fontSize: 12, fontWeight: 600 }}>
              +{m.reward}P
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────
function BottomNav({ screen, navigate }) {
  const items = [
    { key: 'main', label: '홈', icon: '🏠' },
    { key: 'zone', label: '좌석', icon: '🚇' },
    { key: 'reward-flow', label: '착석', icon: '🪑' },
    { key: 'rewards', label: '리워드', icon: '⭐' },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(10,13,22,0.96)', borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, backdropFilter: 'blur(12px)' }}>
      {items.map(item => {
        const active = screen === item.key
        return (
          <button key={item.key} onClick={() => navigate(item.key)}
            style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: active ? C.accent : C.muted, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            {active && <div style={{ width: 18, height: 3, borderRadius: 2, background: C.accent }} />}
          </button>
        )
      })}
    </div>
  )
}

// ─── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState('onboarding')
  const [selectedCar, setSelectedCar] = useState(CARS[2])
  const [points, setPoints] = useState(7)
  const [isPremium, setIsPremium] = useState(false)
  const navigate = (s) => setScreen(s)

  return (
    <div style={st.wrap}>
      {screen === 'onboarding' && <OnboardingScreen navigate={navigate} />}
      {screen === 'login'      && <LoginScreen navigate={navigate} />}
      {screen === 'signup'     && <SignupScreen navigate={navigate} />}
      {screen === 'main'       && <MainScreen navigate={navigate} setSelectedCar={setSelectedCar} />}
      {screen === 'zone'       && <ZoneScreen selectedCar={selectedCar} navigate={navigate} isPremium={isPremium} setIsPremium={setIsPremium} />}
      {screen === 'reward-flow'&& <RewardFlowScreen navigate={navigate} points={points} setPoints={setPoints} />}
      {screen === 'rewards'    && <RewardsScreen points={points} isPremium={isPremium} setIsPremium={setIsPremium} />}
      {!['onboarding','login','signup'].includes(screen) && <BottomNav screen={screen} navigate={navigate} />}
    </div>
  )
}
