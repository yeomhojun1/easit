import { useState } from 'react'
import { C, st, CARS, ZONES_4, ZONES_8, STATIONS, CURRENT_IDX, probColor } from '../constants'
import SubwayCarDiagram from './SubwayCarDiagram'

const PROB_DECREASE_PER_STOP = 4
const PROB_MIN = 10
const STOP_SIMPLE_DECREASE = 5
const STOP_SIMPLE_MIN = 20

function PremiumZoneGrid({ zones, selectedZone, onSelect }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {zones.map(z => {
        const color = probColor(z.prob)
        const isSelected = selectedZone === z.key
        return (
          <button key={z.key} onClick={() => onSelect(z.key)}
            style={{ padding: '14px 10px', background: isSelected ? color + '22' : C.bg2, border: `2px solid ${isSelected ? color : C.border}`, borderRadius: 12, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
            <div style={{ fontSize: 18, fontWeight: 900, color }}>{z.label}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: C.text, marginTop: 4 }}>{z.prob}%</div>
            <div style={{ marginTop: 8, height: 4, borderRadius: 2, background: C.border }}>
              <div style={{ height: '100%', width: `${z.prob}%`, borderRadius: 2, background: color }} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function ZoneScreen({ selectedCar, navigate, isPremium, setIsPremium }) {
  const [stops, setStops] = useState(2)
  const [selectedZone, setSelectedZone] = useState(null)
  const car = selectedCar || CARS[2]
  const zoneData = isPremium ? ZONES_8 : ZONES_4
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
            <div style={{ color: C.sub, fontSize: 13, marginTop: 4 }}>
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
          {isPremium ? (
            <PremiumZoneGrid zones={adjustedZones} selectedZone={selectedZone} onSelect={setSelectedZone} />
          ) : (
            <SubwayCarDiagram zoneData={adjustedZones} selected={selectedZone} onSelect={setSelectedZone} />
          )}
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

        <button onClick={() => navigate('reward-flow')}
          style={{ ...st.btn, background: C.gradPurple, color: '#fff', boxShadow: '0 8px 24px rgba(102,126,234,0.3)' }}>
          🪑 좌석에 앉았어요
        </button>
      </div>
    </div>
  )
}
