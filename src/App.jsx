import { useState } from 'react'

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const STATIONS = ['강남', '역삼', '선릉', '삼성', '종합운동장', '잠실나루', '잠실', '구의', '건대입구', '성수']
const CURRENT_STATION = '역삼'
const CURRENT_IDX = STATIONS.indexOf(CURRENT_STATION)

const MOCK_TRAINS = [
  { line: '2호선', color: '#00A650', number: '2312', eta: 2, direction: '성수 방면', cars: 10 },
  { line: '2호선', color: '#00A650', number: '2298', eta: 8, direction: '성수 방면', cars: 10 },
]

const CARS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  prob: [38, 52, 71, 65, 44, 29, 60, 73, 48, 35][i],
  priority: i === 0 || i === 9,
}))

const ZONES_4 = [
  { key: 'A', label: '존 A', desc: '첫 번째 출입문 옆', prob: 55 },
  { key: 'B', label: '존 B', desc: '두 번째 출입문 옆', prob: 72 },
  { key: 'C', label: '존 C', desc: '세 번째 출입문 옆', prob: 68 },
  { key: 'D', label: '존 D', desc: '네 번째 출입문 옆', prob: 49 },
]

const ZONES_8 = [
  { key: 'A1', label: 'A-1', prob: 58 }, { key: 'A2', label: 'A-2', prob: 51 },
  { key: 'B1', label: 'B-1', prob: 75 }, { key: 'B2', label: 'B-2', prob: 68 },
  { key: 'C1', label: 'C-1', prob: 71 }, { key: 'C2', label: 'C-2', prob: 64 },
  { key: 'D1', label: 'D-1', prob: 52 }, { key: 'D2', label: 'D-2', prob: 45 },
]

const MISSIONS = [
  { id: 1, icon: '🎯', title: '첫 하차 정보 제공', desc: '처음으로 하차 정보를 제공해보세요', reward: 1, done: true },
  { id: 2, icon: '🔥', title: '5회 연속 정확한 정보', desc: '정확도 100% 달성 5회 연속', reward: 3, done: false },
  { id: 3, icon: '⏰', title: '출퇴근 시간대 10회', desc: '7-9시 또는 18-20시에 정보 제공', reward: 2, done: false },
  { id: 4, icon: '♿', title: '교통약자 배려', desc: '교통약자에게 자리 양보 인증', reward: 2, done: false },
]

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
const C = {
  bg: '#080B14',
  bg2: '#0D1117',
  card: '#111827',
  border: '#1F2937',
  accent: '#818CF8',
  accentDark: '#4338CA',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  text: '#F9FAFB',
  muted: '#6B7280',
  sub: '#9CA3AF',
  gradPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  gradGreen: 'linear-gradient(135deg, #10B981, #059669)',
}

const st = {
  wrap: {
    fontFamily: "'Noto Sans KR', sans-serif",
    background: C.bg,
    minHeight: '100dvh',
    maxWidth: 430,
    margin: '0 auto',
    color: C.text,
    position: 'relative',
    overflowX: 'hidden',
  },
  card: {
    background: C.card,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    padding: 16,
  },
  btn: {
    width: '100%',
    padding: '15px 0',
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700,
    fontSize: 15,
    fontFamily: 'inherit',
    transition: 'opacity 0.15s',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
}

// ─── PROB COLOR ──────────────────────────────────────────────────────────────
const probColor = (p) => p >= 65 ? C.green : p >= 40 ? C.yellow : C.muted

// ─── ONBOARDING ──────────────────────────────────────────────────────────────
function OnboardingScreen({ onLogin }) {
  return (
    <div style={{ ...st.wrap, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', padding: '0 28px', paddingBottom: 0 }}>
      <div style={{ textAlign: 'center', marginBottom: 52 }}>
        <div style={{ width: 88, height: 88, borderRadius: 28, background: C.gradPurple, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: 42, boxShadow: '0 20px 40px rgba(102,126,234,0.4)' }}>
          🚇
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, letterSpacing: -1.5 }}>Easit</div>
        <div style={{ color: C.sub, fontSize: 15, marginTop: 8, lineHeight: 1.5 }}>
          지하철 좌석 예측 & 리워드<br />
          <span style={{ fontSize: 13, color: C.muted }}>앉을 확률이 높은 자리를 미리 알아보세요</span>
        </div>
      </div>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button onClick={() => onLogin('kakao')}
          style={{ ...st.btn, background: '#FEE500', color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💬</span> 카카오로 시작하기
        </button>
        <button onClick={() => onLogin('naver')}
          style={{ ...st.btn, background: '#03C75A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 18, letterSpacing: -1 }}>N</span> 네이버로 시작하기
        </button>
        <button onClick={() => onLogin('email')}
          style={{ ...st.btn, background: C.card, color: C.text, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span>✉️</span> 이메일로 시작하기
        </button>
      </div>

      <div style={{ marginTop: 24, color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 1.8 }}>
        로그인 시 <span style={{ color: C.accent }}>개인정보 처리방침</span> 및{' '}
        <span style={{ color: C.accent }}>이용약관</span>에 동의합니다.<br />
        <span style={{ fontSize: 11 }}>위치 정보는 역 감지 용도로만 사용되며 서버에 저장되지 않습니다.</span>
      </div>
    </div>
  )
}

// ─── MAIN SCREEN ─────────────────────────────────────────────────────────────
function MainScreen({ navigate, setSelectedCar }) {
  const [trainIdx, setTrainIdx] = useState(0)
  const train = MOCK_TRAINS[trainIdx]

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '52px 20px 20px', background: 'linear-gradient(180deg, rgba(15,20,40,1) 0%, rgba(8,11,20,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
          <span style={{ color: C.sub, fontSize: 12, fontWeight: 500 }}>GPS 감지됨 · 실시간</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{CURRENT_STATION}역</div>
        <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>수도권 2호선 · 외선순환</div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Trains */}
        <div style={st.card}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 12, letterSpacing: 0.5 }}>도착 예정 열차</div>
          {MOCK_TRAINS.map((t, i) => (
            <div key={i} onClick={() => setTrainIdx(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ ...st.tag, background: t.color + '22', color: t.color }}>{t.line}</div>
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

        {/* Car Probability */}
        <div style={st.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 700 }}>객차별 착석 확률</span>
            <span style={{ ...st.tag, background: C.accentDark + '33', color: C.accent, fontSize: 11 }}>방금 업데이트</span>
          </div>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 6 }}>
            {CARS.map(car => {
              const color = probColor(car.prob)
              return (
                <div key={car.id} onClick={() => { setSelectedCar(car); navigate('zone') }}
                  style={{ flexShrink: 0, width: 64, background: C.bg2, borderRadius: 12, padding: '10px 6px', textAlign: 'center', cursor: 'pointer', border: `1.5px solid ${car.prob >= 65 ? color + '66' : C.border}`, transition: 'border-color 0.2s' }}>
                  {car.priority && <div style={{ fontSize: 8, color: C.yellow, fontWeight: 700, marginBottom: 3 }}>우선석</div>}
                  <div style={{ fontSize: 17, fontWeight: 900, color }}>{car.prob}%</div>
                  <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>{car.id}호차</div>
                  <div style={{ marginTop: 6, height: 3, borderRadius: 2, background: C.border }}>
                    <div style={{ height: '100%', width: `${car.prob}%`, borderRadius: 2, background: color }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: C.muted, display: 'flex', gap: 12 }}>
            <span style={{ color: C.green }}>■</span> 높음(65%+)&nbsp;
            <span style={{ color: C.yellow }}>■</span> 보통(40%+)&nbsp;
            <span style={{ color: C.muted }}>■</span> 낮음
          </div>
        </div>

        {/* Notice */}
        <div style={{ ...st.card, background: C.accentDark + '18', border: `1px solid ${C.accentDark}44`, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>지금 3명이 같은 정보를 보고 있어요</div>
            <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.5 }}>동시 알림 인원이 제한(최대 3명)되어 더 공정하게 자리를 잡을 수 있어요.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ZONE SCREEN ─────────────────────────────────────────────────────────────
function ZoneScreen({ selectedCar, navigate, isPremium, setIsPremium }) {
  const [stops, setStops] = useState(2)
  const car = selectedCar || CARS[2]
  const zones = isPremium ? ZONES_8 : ZONES_4
  const adjustedProb = (base) => Math.max(10, base - stops * 4)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '52px 20px 16px' }}>
        <button onClick={() => navigate('main')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          <span style={{ fontSize: 18 }}>←</span> <span style={{ fontSize: 14 }}>뒤로</span>
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{car.id}호차 상세</div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>현재 착석 확률 <span style={{ color: probColor(car.prob), fontWeight: 700 }}>{car.prob}%</span></div>
          </div>
          <button onClick={() => setIsPremium(!isPremium)}
            style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${isPremium ? C.accent : C.border}`, background: isPremium ? C.gradPurple : 'transparent', color: isPremium ? '#fff' : C.sub, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', flexShrink: 0 }}>
            {isPremium ? '⭐ 프리미엄' : '🔒 8존 보기'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Car Diagram */}
        <div style={st.card}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 10 }}>객차 존 배치 ({isPremium ? '8존 프리미엄' : '4존 기본'})</div>
          <div style={{ display: 'flex', gap: 4, height: 70, borderRadius: 10, overflow: 'hidden' }}>
            {zones.map((z) => {
              const p = adjustedProb(z.prob)
              const bg = probColor(p)
              return (
                <div key={z.key} style={{ flex: 1, background: bg + '22', border: `1px solid ${bg}55`, borderRadius: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: isPremium ? 9 : 11, fontWeight: 700, color: bg }}>{z.label}</div>
                  <div style={{ fontSize: isPremium ? 11 : 15, fontWeight: 900, marginTop: 2 }}>{p}%</div>
                </div>
              )
            })}
          </div>
          {!isPremium && (
            <div style={{ marginTop: 8, padding: '8px 12px', background: C.accentDark + '22', borderRadius: 8, fontSize: 12, color: C.sub, textAlign: 'center' }}>
              🔒 프리미엄에서 8존 세분화 정보를 볼 수 있어요
            </div>
          )}
        </div>

        {/* Stop Slider */}
        <div style={st.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>정거장 후 착석 확률</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: C.accent }}>{stops}정거장 후</span>
          </div>
          <input type="range" min={1} max={8} value={stops} onChange={e => setStops(+e.target.value)} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 6 }}>
            <span>1정거장 ({STATIONS[CURRENT_IDX + 1]})</span>
            <span>8정거장</span>
          </div>
          <div style={{ marginTop: 12, padding: '14px 16px', background: C.bg2, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: C.sub }}>{STATIONS[Math.min(CURRENT_IDX + stops, STATIONS.length - 1)]}역 즈음 착석 확률</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: probColor(Math.max(20, car.prob - stops * 5)) }}>{Math.max(20, car.prob - stops * 5)}%</span>
          </div>
        </div>

        {/* Zone Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {(isPremium ? ZONES_8 : ZONES_4).map(z => {
            const p = adjustedProb(z.prob)
            const color = probColor(p)
            return (
              <div key={z.key} style={{ ...st.card, textAlign: 'center', padding: '14px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.sub, marginBottom: 6 }}>{z.label}</div>
                <div style={{ fontSize: 30, fontWeight: 900, color }}>{p}%</div>
                {z.desc && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{z.desc}</div>}
                <div style={{ marginTop: 10, height: 4, borderRadius: 2, background: C.border }}>
                  <div style={{ height: '100%', width: `${p}%`, borderRadius: 2, background: color, transition: 'width 0.3s' }} />
                </div>
              </div>
            )
          })}
        </div>

        <button onClick={() => navigate('reward-flow')}
          style={{ ...st.btn, background: C.gradPurple, color: '#fff', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>
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

  const STEP_LABELS = ['착석 확인', '존 선택', '하차역 입력', '포인트 적립']

  return (
    <div style={{ padding: '52px 20px 80px' }}>
      {/* Progress Bar */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          {STEP_LABELS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? C.accent : C.border, transition: 'background 0.3s' }} />
          ))}
        </div>
        <div style={{ fontSize: 13, color: C.muted }}>
          {step}/{STEP_LABELS.length} · <span style={{ color: C.text, fontWeight: 600 }}>{STEP_LABELS[step - 1]}</span>
        </div>
      </div>

      {step === 1 && (
        <div style={{ textAlign: 'center', paddingTop: 20 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🪑</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>좌석에 앉으셨나요?</div>
          <div style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
            하차역을 알려주시면 <span style={{ color: C.accent, fontWeight: 700 }}>+1 포인트</span>를 드려요.<br />
            3포인트 = 프리미엄 1일 무료!
          </div>
          <button onClick={() => setStep(2)} style={{ ...st.btn, background: C.gradPurple, color: '#fff', marginBottom: 12, boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>
            네, 앉았어요!
          </button>
          <button onClick={() => navigate('main')} style={{ ...st.btn, background: 'none', color: C.muted }}>
            취소
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>어느 존에 앉으셨나요?</div>
          <div style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>정확할수록 다른 사용자에게 도움이 돼요</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
            {ZONES_4.map(z => (
              <button key={z.key} onClick={() => setZone(z.key)}
                style={{ ...st.card, padding: 20, textAlign: 'center', cursor: 'pointer', border: `2px solid ${zone === z.key ? C.accent : C.border}`, background: zone === z.key ? C.accentDark + '33' : C.card, fontFamily: 'inherit' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: zone === z.key ? C.accent : C.text }}>{z.label}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{z.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => zone && setStep(3)}
            style={{ ...st.btn, background: zone ? C.gradPurple : C.border, color: '#fff', opacity: zone ? 1 : 0.5 }}>
            다음
          </button>
        </div>
      )}

      {step === 3 && (
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>어느 역에서 내리실 건가요?</div>
          <div style={{ color: C.sub, fontSize: 13, marginBottom: 20 }}>GPS로 실제 하차를 확인해 포인트를 드려요</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {STATIONS.slice(CURRENT_IDX + 1).map(st_ => (
              <button key={st_} onClick={() => setDest(st_)}
                style={{ padding: '14px 18px', borderRadius: 12, border: `2px solid ${dest === st_ ? C.accent : C.border}`, background: dest === st_ ? C.accentDark + '33' : C.card, color: dest === st_ ? C.accent : C.text, textAlign: 'left', cursor: 'pointer', fontWeight: dest === st_ ? 700 : 400, fontSize: 15, fontFamily: 'inherit' }}>
                {st_}역
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
            <div style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>다음 프리미엄까지 {3 - (points % 3)}P</div>
          </div>
          <button onClick={() => navigate('main')} style={{ ...st.btn, background: C.gradPurple, color: '#fff', boxShadow: '0 8px 24px rgba(102,126,234,0.35)' }}>
            메인으로 돌아가기
          </button>
        </div>
      )}
    </div>
  )
}

// ─── REWARDS SCREEN ───────────────────────────────────────────────────────────
function RewardsScreen({ points, isPremium, setIsPremium }) {
  const premiumDays = Math.floor(points / 3)
  const toNext = 3 - (points % 3)

  return (
    <div style={{ padding: '52px 16px 80px' }}>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 20 }}>리워드</div>

      {/* Points Card */}
      <div style={{ borderRadius: 20, background: 'linear-gradient(135deg, #1a1040, #2d1b69)', padding: 20, marginBottom: 12, border: `1px solid ${C.accentDark}66` }}>
        <div style={{ fontSize: 13, color: '#a5b4fc', marginBottom: 6 }}>보유 포인트</div>
        <div style={{ fontSize: 52, fontWeight: 900, color: '#fff', letterSpacing: -2 }}>{points}<span style={{ fontSize: 24, letterSpacing: 0 }}>P</span></div>
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a5b4fc', marginBottom: 6 }}>
            <span>프리미엄 이용권까지</span><span>{toNext}P 남음</span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 3 }}>
            <div style={{ height: '100%', width: `${((3 - toNext) / 3) * 100}%`, borderRadius: 3, background: C.accent, transition: 'width 0.3s' }} />
          </div>
        </div>
        {premiumDays > 0 && (
          <button onClick={() => setIsPremium(true)}
            style={{ ...st.btn, background: 'rgba(255,255,255,0.15)', color: '#fff', marginTop: 14, backdropFilter: 'blur(8px)' }}>
            ⭐ 프리미엄 {premiumDays}일 사용하기
          </button>
        )}
      </div>

      {/* Premium Status */}
      <div style={{ ...st.card, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>⭐ 프리미엄</div>
            <div style={{ fontSize: 12, color: C.muted }}>8존 세분화 · 고급 예측 · 선탑승 알림</div>
          </div>
          <div style={{ ...st.tag, background: isPremium ? C.green + '22' : C.border, color: isPremium ? C.green : C.muted }}>
            {isPremium ? '이용 중' : '미이용'}
          </div>
        </div>
      </div>

      {/* Missions */}
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
            <div style={{ ...st.tag, background: C.accentDark + '33', color: C.accent, flexShrink: 0 }}>+{m.reward}P</div>
          </div>
        ))}
      </div>

      {/* Reward Table */}
      <div style={{ ...st.card, marginTop: 20 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>포인트 안내</div>
        {[
          { action: '하차 정보 제공 (GPS 검증)', point: '+1P', color: C.green },
          { action: '교통약자 자리 양보', point: '+2P', color: C.accent },
          { action: '허위 정보 제공 (패널티)', point: '-3P', color: C.red },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
            <span style={{ fontSize: 13, color: C.sub }}>{r.action}</span>
            <span style={{ fontWeight: 800, color: r.color }}>{r.point}</span>
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
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(10,13,22,0.95)', borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, backdropFilter: 'blur(12px)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {items.map(item => {
        const active = screen === item.key
        return (
          <button key={item.key} onClick={() => navigate(item.key)}
            style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: active ? C.accent : C.muted, fontWeight: active ? 700 : 400, transition: 'color 0.2s' }}>{item.label}</span>
            {active && <div style={{ width: 18, height: 3, borderRadius: 2, background: C.accent, marginTop: 1 }} />}
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
      {screen === 'onboarding' && (
        <OnboardingScreen onLogin={() => navigate('main')} />
      )}
      {screen === 'main' && (
        <MainScreen navigate={navigate} setSelectedCar={setSelectedCar} />
      )}
      {screen === 'zone' && (
        <ZoneScreen selectedCar={selectedCar} navigate={navigate} isPremium={isPremium} setIsPremium={setIsPremium} />
      )}
      {screen === 'reward-flow' && (
        <RewardFlowScreen navigate={navigate} points={points} setPoints={setPoints} />
      )}
      {screen === 'rewards' && (
        <RewardsScreen points={points} isPremium={isPremium} setIsPremium={setIsPremium} />
      )}
      {screen !== 'onboarding' && (
        <BottomNav screen={screen} navigate={navigate} />
      )}
    </div>
  )
}
