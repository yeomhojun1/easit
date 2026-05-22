import { C, probColor } from '../constants'

const ZONE_SEATS = { A: 5, B: 6, C: 5 }

function Seat({ color }) {
  return (
    <div style={{
      width: 18, height: 15, borderRadius: 3, flexShrink: 0,
      background: color + '33',
      border: `1px solid ${color}66`,
    }} />
  )
}

function Door({ number }) {
  return (
    <div style={{ width: 28, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <div style={{ width: 24, height: 5, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 1 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <div style={{ fontSize: 14 }}>🚪</div>
        <div style={{ fontSize: 8, color: C.accent, fontWeight: 700 }}>{number}</div>
      </div>
      <div style={{ width: 24, height: 5, background: C.bg, border: `1px solid ${C.border}`, borderRadius: 1 }} />
    </div>
  )
}

function ZoneSection({ zoneKey, zoneData, selected, onSelect }) {
  const z = zoneData.find(z => z.key === zoneKey)
  const prob = z?.prob ?? 0
  const color = probColor(prob)
  const isSelected = selected === zoneKey
  const seatCount = ZONE_SEATS[zoneKey]

  return (
    <div onClick={() => onSelect(zoneKey)} style={{
      flex: seatCount, display: 'flex', flexDirection: 'column',
      background: isSelected ? color + '18' : 'transparent',
      borderRadius: 8, cursor: 'pointer',
      border: `2px solid ${isSelected ? color : 'transparent'}`,
      transition: 'all 0.2s', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', gap: 3, padding: '6px 4px 4px', justifyContent: 'center' }}>
        {Array.from({ length: seatCount }, (_, i) => (
          <Seat key={i} color={color} />
        ))}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>존 {zoneKey}</div>
        <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginTop: 2 }}>{prob}%</div>
        {isSelected && <div style={{ width: 20, height: 2, background: color, borderRadius: 1, marginTop: 3 }} />}
      </div>
      <div style={{ display: 'flex', gap: 3, padding: '4px 4px 6px', justifyContent: 'center' }}>
        {Array.from({ length: seatCount }, (_, i) => (
          <Seat key={i} color={color} />
        ))}
      </div>
    </div>
  )
}

export default function SubwayCarDiagram({ zoneData, selected, onSelect }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 6 }}>
        <span>← 앞 칸 방향</span>
        <span>뒷 칸 방향 →</span>
      </div>

      <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch',
          minWidth: 380, height: 120,
          border: `2px solid ${C.border}`,
          borderRadius: 14, background: C.bg2,
          overflow: 'hidden',
        }}>
          <Door number={1} />
          <ZoneSection zoneKey="A" zoneData={zoneData} selected={selected} onSelect={onSelect} />
          <Door number={2} />
          <ZoneSection zoneKey="B" zoneData={zoneData} selected={selected} onSelect={onSelect} />
          <Door number={3} />
          <ZoneSection zoneKey="C" zoneData={zoneData} selected={selected} onSelect={onSelect} />
          <Door number={4} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
        {zoneData.map(z => {
          const color = probColor(z.prob)
          const isSelected = selected === z.key
          return (
            <button key={z.key} onClick={() => onSelect(z.key)}
              style={{ padding: '10px 4px', background: isSelected ? color + '22' : C.card, border: `2px solid ${isSelected ? color : C.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
              <div style={{ fontSize: 16, fontWeight: 900, color }}>{z.label}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{z.desc}</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
