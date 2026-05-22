import { C, st, MISSIONS } from '../constants'

const POINTS_PER_PREMIUM_DAY = 3

export default function RewardsScreen({ points, isPremium, setIsPremium }) {
  const toNext = POINTS_PER_PREMIUM_DAY - (points % POINTS_PER_PREMIUM_DAY)
  const premiumDays = Math.floor(points / POINTS_PER_PREMIUM_DAY)
  const progressPct = ((POINTS_PER_PREMIUM_DAY - toNext) / POINTS_PER_PREMIUM_DAY) * 100

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
            <div style={{ height: '100%', width: `${progressPct}%`, borderRadius: 3, background: C.accent }} />
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
