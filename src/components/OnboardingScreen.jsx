import { useEffect, useState } from 'react'
import { C, st } from '../constants'
import { API_URL, fetchAuthProviders } from '../api'

// 백엔드에 등록된 소셜 로그인만 버튼으로 노출한다 (키가 없는 프로바이더는 숨김)
const SOCIAL_BUTTONS = {
  kakao: { text: '카카오로 시작하기', icon: '💬', iconStyle: { fontSize: 22 }, style: { background: '#FEE500', color: '#191919' } },
  naver: { text: '네이버로 시작하기', icon: 'N', iconStyle: { fontWeight: 900, fontSize: 20 }, style: { background: '#03C75A', color: '#fff' } },
  google: { text: 'Google로 시작하기', icon: 'G', iconStyle: { fontSize: 20 }, style: { background: '#fff', color: '#191919' } },
}

export default function OnboardingScreen({ navigate }) {
  const [providers, setProviders] = useState(null)

  useEffect(() => {
    let alive = true
    fetchAuthProviders().then(list => { if (alive) setProviders(list) })
    return () => { alive = false }
  }, [])

  const socials = (providers ?? []).filter(p => SOCIAL_BUTTONS[p.name])

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
        {socials.map(p => {
          const b = SOCIAL_BUTTONS[p.name]
          return (
            <button key={p.name} onClick={() => { window.location.href = `${API_URL}/auth/${p.name}` }}
              style={{ ...st.btn, ...b.style, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={b.iconStyle}>{b.icon}</span> {b.text}
            </button>
          )
        })}
        <button onClick={() => navigate('login')}
          style={{ ...st.btn, background: C.card, color: C.text, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span>✉️</span> 이메일로 시작하기
        </button>
      </div>

      {providers !== null && socials.length === 0 && (
        <div style={{ marginTop: 14, color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 1.7 }}>
          소셜 로그인은 이 서버에 설정되어 있지 않습니다. 이메일로 시작해주세요.
        </div>
      )}

      <div style={{ marginTop: 20, color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 1.8 }}>
        로그인 시 <span style={{ color: C.accent }}>개인정보 처리방침</span> 및 <span style={{ color: C.accent }}>이용약관</span>에 동의합니다.
      </div>
    </div>
  )
}
