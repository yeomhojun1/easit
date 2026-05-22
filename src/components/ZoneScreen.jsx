import { useState } from 'react'
import { C, st, CARS, ZONES_3, ZONES_6, STATIONS, CURRENT_IDX, probColor } from '../constants'
import SubwayCarDiagram from './SubwayCarDiagram'

const PROB_DECREASE_PER_STOP = 4
const PROB_MIN = 10
const STOP_SIMPLE_DECREASE = 5
const STOP_SIMPLE_MIN = 20


export default function ZoneScreen({ selectedCar, selectedLine, selectedStation, selectedDirection, navigate, isPremium, setIsPremium }) {
  const [stops, setStops] = useState(2)
  const [selectedZone, setSelectedZone] = useState(null)
  const car = selectedCar || CARS[2]
  const zoneData = isPremium ? ZONES_6 : ZONES_3
  const adjustedZones = zoneData.map(z => ({ ...z, prob: Math.max(PROB_MIN, z.prob - stops * PROB_DECREASE_PER_STOP) }))
  const stopsAheadProb = Math.max(STOP_SIMPLE_MIN, car.prob - stops * STOP_SIMPLE_DECREASE)
  const targetStationName = STATIONS[Math.min(CURRENT_IDX + stops, STATIONS.length - 1)]

  return (
    <div style={{ paddingBottom: 80 }}>
      <div style={{ padding: '52px 20px 16px' }}>
        <button onClick={() => navigate('main')} style={{ background: 'none', border: 'none', color: C.sub, cursor: 'pointer', padding: '0 0 14px', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
          ← 뒤로
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>{car.id}호차 상세</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 4 }}>
              {selectedLine?.name && `${selectedLine.name} · `}{selectedStation && `${selectedStation}역 · `}{car.id}호차
            </div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 2 }}>
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
        <div style={st.card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            객차 존 배치 — {isPremium ? '8존 프리미엄' : '4존 기본'}
          </div>
          <SubwayCarDiagram
            zoneData={adjustedZones}
            selected={selectedZone}
            onSelect={setSelectedZone}
            isPremium={isPremium}
          />
        </div>

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
            <span style={{ fontSize: 13, color: C.sub }}>{targetStationName}역 즈음</span>
            <span style={{ fontSize: 24, fontWeight: 900, color: probColor(stopsAheadProb) }}>
              {stopsAheadProb}%
            </span>
          </div>
        </div>

        {(!selectedLine || !selectedStation) && (
          <div style={{ textAlign: 'center', color: C.yellow, fontSize: 13, marginBottom: 8 }}>
            호선과 탑승역을 먼저 선택해주세요
          </div>
        )}
        {!selectedDirection && (
          <div style={{ textAlign: 'center', color: C.yellow, fontSize: 13, marginBottom: 8 }}>
            탑승 방향을 먼저 선택해주세요
          </div>
        )}
        <button onClick={() => navigate('reward-flow')}
          style={{ ...st.btn, background: C.gradPurple, color: '#fff', boxShadow: '0 8px 24px rgba(102,126,234,0.3)', opacity: selectedDirection ? 1 : 0.4, pointerEvents: selectedDirection ? 'auto' : 'none' }}>
          🪑 좌석에 앉았어요
        </button>
      </div>
    </div>
  )
}
