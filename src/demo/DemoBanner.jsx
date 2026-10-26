export default function DemoBanner() {
  return (
    <div role="status" style={{ position: 'sticky', top: 0, zIndex: 200, padding: '8px 14px', background: '#FFD54F', color: '#1a1a1a', fontSize: 12, fontWeight: 700, lineHeight: 1.5, textAlign: 'center' }}>
      데모 모드: 실제 서버 없이 브라우저 안에서 가짜 데이터로 동작합니다
    </div>
  )
}
