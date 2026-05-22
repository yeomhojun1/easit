import { useState } from 'react'
import { C, st } from '../constants'
import { apiFetch } from '../api'

export default function LoginScreen({ navigate, onLogin }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleLogin = async () => {
    if (!form.email || !form.password) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, password: form.password }),
      })
      localStorage.setItem('token', data.accessToken)
      onLogin(data.user)
      navigate('main')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

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
          <input style={st.input} type="password" placeholder="비밀번호 입력" value={form.password} onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
      </div>

      {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: C.red + '22', color: C.red, fontSize: 13 }}>{error}</div>}

      <button onClick={handleLogin} disabled={loading}
        style={{ ...st.btn, background: C.gradPurple, color: '#fff', marginTop: 24, boxShadow: '0 8px 24px rgba(102,126,234,0.3)', opacity: loading ? 0.7 : 1 }}>
        {loading ? '로그인 중...' : '로그인'}
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
