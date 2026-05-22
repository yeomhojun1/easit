import { C } from '../constants'

const NAV_ITEMS = [
  { key: 'main', label: '홈', icon: '🏠' },
  { key: 'zone', label: '좌석', icon: '🚇' },
  { key: 'reward-flow', label: '착석', icon: '🪑' },
  { key: 'rewards', label: '리워드', icon: '⭐' },
]

export default function BottomNav({ screen, navigate }) {
  return (
    <div style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 430, background: 'rgba(10,13,22,0.96)', borderTop: `1px solid ${C.border}`, display: 'flex', zIndex: 100, backdropFilter: 'blur(12px)' }}>
      {NAV_ITEMS.map(item => {
        const active = screen === item.key
        return (
          <button key={item.key} onClick={() => navigate(item.key)}
            style={{ flex: 1, background: 'none', border: 'none', padding: '10px 0', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, fontFamily: 'inherit' }}>
            <span style={{ fontSize: 22 }}>{item.icon}</span>
            <span style={{ fontSize: 10, color: active ? C.accent : C.muted, fontWeight: active ? 700 : 400 }}>{item.label}</span>
            {active && <div style={{ width: 18, height: 3, borderRadius: 2, background: C.accent }} />}
          </button>
        )
      })}
    </div>
  )
}
