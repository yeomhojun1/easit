import { C, probColor } from '../constants'

const ZONE_SEATS = { A: 5, B: 6, C: 5 }

function Door({ number, slim = false }) {
  if (slim) {
    // 프리미엄용: 얇은 세로선 + 번호만
    return (
      <div style={{
        width: 14,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: C.border + '44',
        position: 'relative',
      }}>
        <div style={{ fontSize: 8, color: C.muted, fontWeight: 700, writingMode: 'vertical-rl' }}>
          {number}
        </div>
      </div>
    )
  }

  // 기존 3존용 Door (변경 없음)
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
      flex: seatCount,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: isSelected ? color + '22' : color + '0D',
      borderRadius: 8,
      cursor: 'pointer',
      border: `2px solid ${isSelected ? color : color + '44'}`,
      transition: 'all 0.2s',
      margin: '6px 3px',
      gap: 4,
    }}>
      <div style={{ fontSize: 15, fontWeight: 900, color, lineHeight: 1 }}>존 {zoneKey}</div>
      <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>{prob}%</div>
      {isSelected && <div style={{ width: 20, height: 2, borderRadius: 1, background: color }} />}
    </div>
  )
}

function PremiumZoneSection({ zone1Key, zone2Key, zoneData, selected, onSelect }) {
  const z1 = zoneData.find(z => z.key === zone1Key)
  const z2 = zoneData.find(z => z.key === zone2Key)
  const prob1 = z1?.prob ?? 0
  const prob2 = z2?.prob ?? 0
  const color1 = probColor(prob1)
  const color2 = probColor(prob2)
  const isSel1 = selected === zone1Key
  const isSel2 = selected === zone2Key

  return (
    <div style={{ flex: 5, display: 'flex', flexDirection: 'column', margin: '6px 3px', gap: 3 }}>
      {/* 위 블록 */}
      <div onClick={() => onSelect(zone1Key)} style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isSel1 ? color1 + '22' : color1 + '0D',
        border: `2px solid ${isSel1 ? color1 : color1 + '44'}`,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: color1 }}>{z1?.label}</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{prob1}%</div>
      </div>

      {/* 아래 블록 */}
      <div onClick={() => onSelect(zone2Key)} style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: isSel2 ? color2 + '22' : color2 + '0D',
        border: `2px solid ${isSel2 ? color2 : color2 + '44'}`,
        borderRadius: 6,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}>
        <div style={{ fontSize: 11, fontWeight: 900, color: color2 }}>{z2?.label}</div>
        <div style={{ fontSize: 13, fontWeight: 900, color: C.text }}>{prob2}%</div>
      </div>
    </div>
  )
}

export default function SubwayCarDiagram({ zoneData, selected, onSelect, isPremium = false }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 6 }}>
        <span>← 앞 칸 방향</span>
        <span>뒷 칸 방향 →</span>
      </div>

      <div style={{ overflowX: isPremium ? 'visible' : 'auto', paddingBottom: 4 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch',
          minWidth: isPremium ? 'unset' : 380,
          width: '100%',
          height: 120,
          border: `2px solid ${C.border}`,
          borderRadius: 14, background: C.bg2,
          overflow: 'hidden',
        }}>
          {isPremium ? (
            <>
              <Door number={1} slim={true} />
              <PremiumZoneSection zone1Key="A1" zone2Key="A2" zoneData={zoneData} selected={selected} onSelect={onSelect} />
              <Door number={2} slim={true} />
              <PremiumZoneSection zone1Key="B1" zone2Key="B2" zoneData={zoneData} selected={selected} onSelect={onSelect} />
              <Door number={3} slim={true} />
              <PremiumZoneSection zone1Key="C1" zone2Key="C2" zoneData={zoneData} selected={selected} onSelect={onSelect} />
              <Door number={4} slim={true} />
            </>
          ) : (
            <>
              <Door number={1} />
              <ZoneSection zoneKey="A" zoneData={zoneData} selected={selected} onSelect={onSelect} />
              <Door number={2} />
              <ZoneSection zoneKey="B" zoneData={zoneData} selected={selected} onSelect={onSelect} />
              <Door number={3} />
              <ZoneSection zoneKey="C" zoneData={zoneData} selected={selected} onSelect={onSelect} />
              <Door number={4} />
            </>
          )}
        </div>
      </div>

      {/* 존 버튼 셀렉터 */}
      <div style={{ display: 'grid', gridTemplateColumns: isPremium ? '1fr 1fr 1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 6, marginTop: 12 }}>
        {zoneData.map(z => {
          const color = probColor(z.prob)
          const isSelected = selected === z.key
          return (
            <button key={z.key} onClick={() => onSelect(z.key)}
              style={{ padding: '10px 4px', background: isSelected ? color + '22' : C.card, border: `2px solid ${isSelected ? color : C.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'center', fontFamily: 'inherit' }}>
              <div style={{ fontSize: isPremium ? 13 : 16, fontWeight: 900, color }}>{z.label}</div>
              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{z.prob}%</div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
