# 🚇 Easit — 수도권 지하철 좌석 예측

지하철 탑승객이 **좌석 현황을 체크인**하면, 다른 사용자는 **빈자리가 생길 확률이 높은 칸**을 미리 찾을 수 있는 서비스입니다. (Easit 프로젝트의 초기 버전 — 더 발전된 버전은 [subwayApp](https://github.com/yeomhojun1/subwayApp))

---

## ✨ 주요 기능

- 탑승 중인 열차·좌석 체크인
- 노선/칸별 빈자리 예측 정보 확인
- 카카오 · 네이버 · 구글 소셜 로그인

## 🧱 기술 스택

| 구분 | 기술 |
| --- | --- |
| Frontend | React · Vite |
| Backend | **NestJS** · TypeORM · PostgreSQL |
| 인증 | JWT · Passport (Kakao · Naver · Google OAuth) |

## 📁 구조

```
easit/
├─ src/        # React (Vite) 프론트엔드
└─ backend/    # NestJS API 서버 (TypeORM + PostgreSQL)
```

## 🚀 실행 방법

```bash
# 프론트엔드 (루트)
npm install
npm run dev

# 백엔드
cd backend
npm install
# .env 설정 (아래 참고)
npm run start:dev
```

## 🔑 환경변수 (backend/.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=easit
DB_PASS=easit1234
DB_NAME=easit

JWT_SECRET=32자_이상_랜덤_문자열
KAKAO_REST_API_KEY=카카오_REST_API_키
KAKAO_CALLBACK_URL=http://localhost:3000/api/auth/kakao/callback
```

> `.env.example`을 복사해 `.env`를 만들어 값을 채워주세요.
