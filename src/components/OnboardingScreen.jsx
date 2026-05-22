import { C, st } from '../constants'
import { API_URL } from '../api'

export default function OnboardingScreen({ navigate }) {
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
        <button onClick={() => { window.location.href = `${API_URL}/auth/kakao` }}
          style={{ ...st.btn, background: '#FEE500', color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>💬</span> 카카오로 시작하기
        </button>
        <button onClick={() => { window.location.href = `${API_URL}/auth/naver` }}
          style={{ ...st.btn, background: '#03C75A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 20 }}>N</span> 네이버로 시작하기
        </button>
<button onClick={() => { window.location.href = `${API_URL}/auth/google` }}
          style={{ ...st.btn, background: '#fff', color: '#191919', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>G</span> Google로 시작하기
        </button>
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
