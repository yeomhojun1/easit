import { useState } from 'react'
import { C, st, ZONES_4, STATIONS, CURRENT_IDX } from '../constants'
import SubwayCarDiagram from './SubwayCarDiagram'

const REWARD_STEPS = ['착석 확인', '존 선택', '하차역 입력', '포인트 적립']
const POINTS_PER_SUBMISSION = 1

function StepIndicator({ step }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
        {REWARD_STEPS.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i < step ? C.accent : C.border, transition: 'background 0.3s' }} />
        ))}
      </div>
      <div style={{ fontSize: 13, color: C.muted }}>
        {step}/{REWARD_STEPS.length} · <span style={{ color: C.text, fontWeight: 600 }}>{REWARD_STEPS[step - 1]}</span>
      </div>
    </div>
  )
}

function ConfirmStep({ onConfirm, onCancel }) {
  return (
    <div style={{ textAlign: 'center', paddingTop: 20 }}>
      <div style={{ fontSize: 80, marginBottom: 20 }}>🪑</div>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>좌석에 앉으셨나요?</div>
      <div style={{ color: C.sub, fontSize: 14, lineHeight: 1.7, marginBottom: 36 }}>
        하차역 정보를 알려주시면<br /><span style={{ color: C.accent, fontWeight: 700 }}>+1 포인트</span>를 드려요
      </div>
      <button onClick={onConfirm} style={{ ...st.btn, background: C.gradPurple, color: '#fff', marginBottom: 12 }}>네, 앉았어요!</button>
      <button onClick={onCancel} style={{ ...st.btn, background: 'none', color: C.muted }}>취소</button>
    </div>
  )
}

function ZoneSelectStep({ zone, setZone, onNext }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 18 }}>어느 존에 앉으셨나요?</div>
      <SubwayCarDiagram zoneData={ZONES_4} selected={zone} onSelect={setZone} />
      <button onClick={() => zone && onNext()}
        style={{ ...st.btn, background: zone ? C.gradPurple : C.border, color: '#fff', marginTop: 20, opacity: zone ? 1 : 0.5 }}>
        다음
      </button>
    </div>
  )
}

function DestinationStep({ dest, setDest, onSubmit }) {
  return (
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
      <button onClick={() => dest && onSubmit()}
        style={{ ...st.btn, background: dest ? C.gradPurple : C.border, color: '#fff', opacity: dest ? 1 : 0.5 }}>
        제출하기
      </button>
    </div>
  )
}

function SuccessStep({ dest, points, onDone }) {
  return (
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
      <button onClick={onDone} style={{ ...st.btn, background: C.gradPurple, color: '#fff' }}>메인으로 돌아가기</button>
    </div>
  )
}

export default function RewardFlowScreen({ navigate, points, setPoints }) {
  const [step, setStep] = useState(1)
  const [zone, setZone] = useState(null)
  const [dest, setDest] = useState('')

  const handleSubmit = () => {
    if (!dest) return
    setPoints(p => p + POINTS_PER_SUBMISSION)
    setStep(4)
  }

  return (
    <div style={{ padding: '52px 20px 80px' }}>
      <StepIndicator step={step} />

      {step === 1 && <ConfirmStep onConfirm={() => setStep(2)} onCancel={() => navigate('main')} />}
      {step === 2 && <ZoneSelectStep zone={zone} setZone={setZone} onNext={() => setStep(3)} />}
      {step === 3 && <DestinationStep dest={dest} setDest={setDest} onSubmit={handleSubmit} />}
      {step === 4 && <SuccessStep dest={dest} points={points} onDone={() => navigate('main')} />}
    </div>
  )
}
