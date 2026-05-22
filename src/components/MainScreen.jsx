import { useState } from 'react'
import { C, st, MOCK_TRAINS, CARS, probColor } from '../constants'
import { SUBWAY_LINES } from '../data/subway'

export default function MainScreen({ navigate, setSelectedCar, onSelectLine, onSelectStation, onSelectDirection, user, onLogout }) {
  const [view, setView] = useState('line')
  const [selectedLine, setSelectedLine] = useState(null)
  const [selectedStation, setSelectedStation] = useState(null)
  const [trainIdx, setTrainIdx] = useState(0)
  const [direction, setDirection] = useState(null)

  if (view === 'line') {
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={{ padding: '52px 20px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 22, fontWeight: 900 }}>노선 선택</div>
            <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              로그아웃
            </button>
          </div>
          <div style={{ color: C.sub, fontSize: 13 }}>승차할 노선을 선택하세요</div>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SUBWAY_LINES.map(line => (
            <button key={line.id} onClick={() => { setSelectedLine(line); setView('station') }}
              style={{ padding: '14px 18px', borderRadius: 14, border: `1px solid ${C.border}`, background: C.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: line.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: line.shortColor, flexShrink: 0 }}>
                {line.name.replace('호선', '').replace('·', '').replace('선', '')}
              </div>
              <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{line.name}</div>
              <div style={{ marginLeft: 'auto', color: C.muted, fontSize: 12 }}>{line.stations.length}개 역 ›</div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  if (view === 'station') {
    return (
      <div style={{ paddingBottom: 80 }}>
        <div style={{ padding: '52px 20px 16px' }}>
          <button onClick={() => setView('line')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 0 14px', fontFamily: 'inherit', fontSize: 13 }}>
            ← 뒤로
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: selectedLine.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: selectedLine.shortColor, flexShrink: 0 }}>
              {selectedLine.name.replace('호선', '').replace('·', '').replace('선', '')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{selectedLine.name} 역 선택</div>
          </div>
        </div>
        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {selectedLine.stations.map(station => (
            <button key={station} onClick={() => { setSelectedStation(station); onSelectLine(selectedLine); onSelectStation(station); setDirection(null); setView('trains') }}
              style={{ padding: '13px 18px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.card, color: C.text, textAlign: 'left', cursor: 'pointer', fontSize: 15, fontFamily: 'inherit', fontWeight: 500 }}>
              {station}역
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '52px 20px 20px', background: 'linear-gradient(180deg, rgba(15,20,40,1) 0%, rgba(8,11,20,0) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <button onClick={() => setView('station')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← {selectedLine.name}
          </button>
          <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 20, padding: '4px 12px', color: C.muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            로그아웃
          </button>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>{selectedStation}역</div>
        <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>
          {selectedLine.name}{user?.name ? ` · ${user.name}` : ''}
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(() => {
          const allStations = selectedLine?.stations ?? []
          const idx = allStations.indexOf(selectedStation)
          const prevStation = idx > 0 ? allStations[idx - 1] : null
          const nextStation = idx < allStations.length - 1 ? allStations[idx + 1] : null
          return (
            <div style={st.card}>
              <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 12 }}>탑승 방향</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {prevStation && (
                  <button onClick={() => { setDirection(prevStation); onSelectDirection(`${prevStation} 방향`) }}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${direction === prevStation ? C.accent : C.border}`, background: direction === prevStation ? C.accentDark + '33' : C.bg2, color: direction === prevStation ? C.accent : C.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    ← {prevStation} 방향
                  </button>
                )}
                {nextStation && (
                  <button onClick={() => { setDirection(nextStation); onSelectDirection(`${nextStation} 방향`) }}
                    style={{ flex: 1, padding: '12px 8px', borderRadius: 12, border: `1.5px solid ${direction === nextStation ? C.accent : C.border}`, background: direction === nextStation ? C.accentDark + '33' : C.bg2, color: direction === nextStation ? C.accent : C.text, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {nextStation} 방향 →
                  </button>
                )}
              </div>
            </div>
          )
        })()}
        <div style={st.card}>
          <div style={{ fontSize: 12, color: C.muted, fontWeight: 700, marginBottom: 12 }}>도착 예정 열차</div>
          {MOCK_TRAINS.map((t, i) => (
            <div key={i} onClick={() => setTrainIdx(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < MOCK_TRAINS.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}>
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
