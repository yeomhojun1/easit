// ─── MOCK DATA ──────────────────────────────────────────────────────────────
export const STATIONS = ['강남', '역삼', '선릉', '삼성', '종합운동장', '잠실나루', '잠실', '구의', '건대입구', '성수']
export const CURRENT_STATION = '역삼'
export const CURRENT_IDX = STATIONS.indexOf(CURRENT_STATION)

export const MOCK_TRAINS = [
  { line: '2호선', color: '#00A650', number: '2312', eta: 2, direction: '성수 방면' },
  { line: '2호선', color: '#00A650', number: '2298', eta: 8, direction: '성수 방면' },
]

export const CARS = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  prob: [38, 52, 71, 65, 44, 29, 60, 73, 48, 35][i],
  priority: i === 0 || i === 9,
}))

export const ZONES_4 = [
  { key: 'A', label: '존 A', desc: '1번 출입문', prob: 55 },
  { key: 'B', label: '존 B', desc: '2번 출입문', prob: 72 },
  { key: 'C', label: '존 C', desc: '3번 출입문', prob: 68 },
  { key: 'D', label: '존 D', desc: '4번 출입문', prob: 49 },
]

export const ZONES_8 = [
  { key: 'A1', label: 'A-1', prob: 58 }, { key: 'A2', label: 'A-2', prob: 51 },
  { key: 'B1', label: 'B-1', prob: 75 }, { key: 'B2', label: 'B-2', prob: 68 },
  { key: 'C1', label: 'C-1', prob: 71 }, { key: 'C2', label: 'C-2', prob: 64 },
  { key: 'D1', label: 'D-1', prob: 52 }, { key: 'D2', label: 'D-2', prob: 45 },
]

export const MISSIONS = [
  { id: 1, icon: '🎯', title: '첫 하차 정보 제공', desc: '처음으로 하차 정보 제공', reward: 1, done: true },
  { id: 2, icon: '🔥', title: '5회 연속 정확한 정보', desc: '정확도 100% 5회 연속', reward: 3, done: false },
  { id: 3, icon: '⏰', title: '출퇴근 시간대 10회', desc: '7-9시, 18-20시 정보 제공', reward: 2, done: false },
  { id: 4, icon: '♿', title: '교통약자 배려', desc: '교통약자에게 자리 양보', reward: 2, done: false },
]

// ─── DESIGN TOKENS ──────────────────────────────────────────────────────────
export const C = {
  bg: '#080B14', bg2: '#0D1117', card: '#111827', border: '#1F2937',
  accent: '#818CF8', accentDark: '#4338CA',
  green: '#10B981', yellow: '#F59E0B', red: '#EF4444',
  text: '#F9FAFB', muted: '#6B7280', sub: '#9CA3AF',
  gradPurple: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
}

export const probColor = (p) => p >= 65 ? C.green : p >= 40 ? C.yellow : C.muted

export const st = {
  wrap: { fontFamily: "'Noto Sans KR', sans-serif", background: C.bg, minHeight: '100dvh', maxWidth: 430, margin: '0 auto', color: C.text, overflowX: 'hidden' },
  card: { background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 },
  btn: { width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 15, fontFamily: 'inherit' },
  input: { width: '100%', padding: '13px 16px', borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg2, color: C.text, fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  label: { fontSize: 13, color: C.sub, fontWeight: 600, marginBottom: 6, display: 'block' },
}
