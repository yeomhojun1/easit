import { useState } from 'react'
import { C, st } from '../constants'
import { apiFetch } from '../api'

const MIN_PASSWORD_LENGTH = 8

function formatPhone(v) {
  const digits = v.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function formatBirth(v) {
  return v.replace(/\D/g, '').slice(0, 6)
}

function Step1Form({ form, set, onNext, isValid }) {
  return (
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
        {form.password && form.password.length < MIN_PASSWORD_LENGTH && (
          <div style={{ fontSize: 12, color: C.red, marginTop: 4 }}>8자 이상 입력해주세요</div>
        )}
      </div>
      <button onClick={() => isValid && onNext()}
        style={{ ...st.btn, background: isValid ? C.gradPurple : C.border, color: '#fff', marginTop: 8, opacity: isValid ? 1 : 0.5 }}>
        다음
      </button>
    </div>
  )
}

function Step2Form({ form, set, agreed, setAgreed, error, loading, onSubmit, isValid }) {
  const submitEnabled = isValid && agreed && !loading
  return (
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

      {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: C.red + '22', color: C.red, fontSize: 13 }}>{error}</div>}

      <button onClick={onSubmit} disabled={loading}
        style={{ ...st.btn, background: submitEnabled ? C.gradPurple : C.border, color: '#fff', opacity: submitEnabled ? 1 : 0.5 }}>
        {loading ? '가입 중...' : '가입 완료'}
      </button>
    </div>
  )
}

export default function SignupScreen({ navigate, onLogin }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', birth: '', gender: '' })
  const [agreed, setAgreed] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const isStep1Valid = form.name && form.email && form.password.length >= MIN_PASSWORD_LENGTH
  const isStep2Valid = form.phone.replace(/\D/g, '').length === 11 && form.birth.length === 6 && form.gender

  const handleSubmit = async () => {
    if (!isStep2Valid || !agreed) return
    setLoading(true)
    setError('')
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          birthDate: form.birth,
          gender: form.gender,
        }),
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
        <Step1Form form={form} set={set} onNext={() => setStep(2)} isValid={isStep1Valid} />
      )}
      {step === 2 && (
        <Step2Form
          form={form} set={set}
          agreed={agreed} setAgreed={setAgreed}
          error={error} loading={loading}
          onSubmit={handleSubmit} isValid={isStep2Valid}
        />
      )}
    </div>
  )
}
