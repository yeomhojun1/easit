// 소셜 로그인은 "환경변수가 있을 때만" 등록한다.
// 키가 없는 개발 환경에서도 백엔드가 뜨고 이메일 로그인이 동작해야 하기 때문.
//
// 프로바이더 등록 여부는 AuthModule 이 import 되는 시점(= ConfigModule.forRoot 실행 전)에
// 결정되므로, ConfigModule 과 같은 경로의 .env 를 여기서 한 번 더 읽어 둔다.
// dotenv 는 이미 있는 process.env 값을 덮어쓰지 않으므로 ConfigModule 과 충돌하지 않는다.
import { config as loadDotenv } from 'dotenv'

for (const path of ['../.env', '.env']) loadDotenv({ path })

export interface OAuthProviderInfo {
  name: string
  label: string
  envKeys: string[]
}

export const OAUTH_PROVIDERS: OAuthProviderInfo[] = [
  { name: 'kakao', label: '카카오', envKeys: ['KAKAO_REST_API_KEY'] },
  { name: 'naver', label: '네이버', envKeys: ['NAVER_CLIENT_ID', 'NAVER_CLIENT_SECRET'] },
  { name: 'google', label: '구글', envKeys: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
]

const filled = (key: string) => {
  const v = process.env[key]
  return typeof v === 'string' && v.trim() !== ''
}

export function isProviderConfigured(name: string): boolean {
  const p = OAUTH_PROVIDERS.find((x) => x.name === name)
  return !!p && p.envKeys.every(filled)
}

export function enabledProviders(): OAuthProviderInfo[] {
  return OAUTH_PROVIDERS.filter((p) => isProviderConfigured(p.name))
}

// 키가 없으면 개발용 기본값으로 대체 (없으면 passport-jwt 가 부팅 중 예외를 던진다)
export const DEV_JWT_SECRET = 'easit-dev-only-secret-change-me'

export function jwtSecret(): string {
  const v = process.env.JWT_SECRET
  if (v && v.trim()) return v
  console.warn('[auth] JWT_SECRET 미설정 — 개발용 기본 시크릿을 사용합니다. 운영에서는 반드시 설정하세요.')
  return DEV_JWT_SECRET
}

export const frontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:5173'
