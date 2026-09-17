import { useState, useEffect } from 'react'
import { C, st, CARS, ZONES_3, ZONES_6, STATIONS, CURRENT_IDX, probColor } from '../constants'
import SubwayCarDiagram from './SubwayCarDiagram'
import { fetchSeatPrediction, predictionNotice } from '../prediction'

const PROB_DECREASE_PER_STOP = 4
const PROB_MIN = 10
const STOP_SIMPLE_DECREASE = 5
const STOP_SIMPLE_MIN = 20
const MAX_STOPS = 8


export default function ZoneScreen({ selectedCar, selectedLine, selectedStation, selectedDirection, navigate, isPremium, setIsPremium }) {
  const [stops, setStops] = useState(2)
  const [selectedZone, setSelectedZone] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const car = selectedCar || CARS[2]
  const zoneData = isPremium ? ZONES_6 : ZONES_3

  useEffect(() => {
    const next = selectedDirection?.replace(' 방향', '')
    if (!next || !selectedLine || !selectedStation) { setPrediction(null); return }
    let alive = true
    fetchSeatPrediction({ line: selectedLine.name, station: selectedStation, next, stops: MAX_STOPS })
      .then(p => { if (alive) setPrediction(p) })
    return () => { alive = false }
  }, [selectedDirection, selectedLine, selectedStation])

  const hasRealData = !!prediction?.supported
  const journey = prediction?.journey?.length ? prediction.journey : null
  const journeyStep = journey ? journey[Math.min(stops, journey.length) - 1] : null

  // 데모 모드에서도 실제로 선택한 노선·방향의 역 이름을 쓴다 (2호선 상수 고정이던 문제)
  const demoStations = selectedLine?.stations?.length ? selectedLine.stations : STATIONS
  const demoBase = selectedStation ? demoStations.indexOf(selectedStation) : -1
  const demoNext = selectedDirection ? demoStations.indexOf(selectedDirection.replace(' 방향', '')) : -1
  const demoStep = demoBase >= 0 && demoNext >= 0 && demoNext < demoBase ? -1 : 1
  const demoIdx = demoBase >= 0 ? demoBase + demoStep * stops : CURRENT_IDX + stops
  const demoStation = demoStations[Math.max(0, Math.min(demoIdx, demoStations.length - 1))]

  const nowProb = hasRealData ? Math.round(prediction.pSitNow * 100) : car.prob
  const stopsAheadProb = journeyStep
    ? Math.round(journeyStep.pCumulative * 100)
    : Math.max(STOP_SIMPLE_MIN, car.prob - stops * STOP_SIMPLE_DECREASE)
  const targetStationName = journeyStep ? journeyStep.station : demoStation

  // 존별 확률: 실데이터가 있으면 존 간 상대 가중치(기본값 평균 대비)를 실제 확률에 입힌다
  const zoneMean = zoneData.reduce((s, z) => s + z.prob, 0) / zoneData.length
  const adjustedZones = zoneData.map(z => ({
    ...z,
    prob: journeyStep
      ? Math.min(99, Math.max(1, Math.round((z.prob / zoneMean) * stopsAheadProb)))
      : Math.max(PROB_MIN, z.prob - stops * PROB_DECREASE_PER_STOP),
  }))

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
              현재 착석 확률 <span style={{ color: probColor(nowProb), fontWeight: 700 }}>{nowProb}%</span>
            </div>
            <div style={{ marginTop: 6 }}>
              <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: 20, background: hasRealData ? C.green + '22' : C.border, color: hasRealData ? C.green : C.muted, fontSize: 10, fontWeight: 600 }}>
                {hasRealData ? '📊 서울교통공사 혼잡도 기반' : '데모 데이터'}
              </span>
            </div>
          </div>
          <button onClick={() => setIsPremium(!isPremium)}
            style={{ padding: '7px 14px', borderRadius: 20, border: `1px solid ${isPremium ? C.accent : C.border}`, background: isPremium ? C.gradPurple : 'transparent', color: isPremium ? '#fff' : C.sub, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: 'inherit' }}>
            {isPremium ? '⭐ 프리미엄' : '🔒 6존 보기'}
          </button>
        </div>
      </div>

      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={st.card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
            객차 존 배치 — {isPremium ? '6존 프리미엄' : '3존 기본'}
          </div>
          {!hasRealData && predictionNotice(prediction) && (
            <div style={{ fontSize: 11, color: prediction?.status === 'unsupported' ? C.muted : C.yellow, marginBottom: 10 }}>
              {predictionNotice(prediction)}
            </div>
          )}
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
          <input type="range" min={1} max={journey ? journey.length : MAX_STOPS} value={Math.min(stops, journey ? journey.length : MAX_STOPS)} onChange={e => setStops(+e.target.value)} style={{ width: '100%', accentColor: C.accent }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginTop: 6 }}>
            <span>1정거장</span><span>{journey ? journey.length : MAX_STOPS}정거장</span>
          </div>
          <div style={{ marginTop: 12, padding: '14px 16px', background: C.bg2, borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 13, color: C.sub }}>{targetStationName}역 {journeyStep ? '까지 누적' : '즈음'}</span>
              {journeyStep && (
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>그 구간 혼잡도 {journeyStep.congestion}%</div>
              )}
            </div>
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
