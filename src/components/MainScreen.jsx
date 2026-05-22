import { useState } from 'react'
import { C, st, MOCK_TRAINS, CARS, CURRENT_STATION, probColor } from '../constants'

export default function MainScreen({ navigate, setSelectedCar, user, onLogout }) {
  const [trainIdx, setTrainIdx] = useState(0)

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '52px 20px 20px', background: 'linear-gradient(180deg, rgba(15,20,40,1) 0%, rgba(8,11,20,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.green, boxShadow: `0 0 8px ${C.green}` }} />
            <span style={{ color: C.sub, fontSize: 12, fontWeight: 500 }}>GPS 감지됨 · 실시간</span>
          </div>
          <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            로그아웃
          </button>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{CURRENT_STATION}역</div>
        <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>수도권 2호선 · 외선순환{user?.name ? ` · ${user.name}` : ''}</div>
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
