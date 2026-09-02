# 🚇 Easit — 수도권 지하철 좌석 예측

지하철 탑승객이 **좌석 현황을 체크인**하면, 다른 사용자는 **빈자리가 생길 확률이 높은 칸**을 미리 찾을 수 있는 서비스입니다. (Easit 프로젝트의 초기 버전 — 더 발전된 버전은 [subwayApp](https://github.com/yeomhojun1/subwayApp))

---

## ✨ 주요 기능

- **실데이터 착석 확률 예측** — 서울교통공사 혼잡도 통계(1~8호선) 기반, 아래 상세
- 탑승 중인 열차·좌석 체크인
- 노선/칸별 빈자리 예측 정보 확인
- 카카오 · 네이버 · 구글 소셜 로그인

## 📊 착석 확률 예측 모델 (실데이터)

[서울교통공사 지하철혼잡도정보](https://www.data.go.kr/data/15071311/fileData.do)(공공데이터포털, KOGL 제1유형)를 기반으로,
역·방향·요일·30분 단위 혼잡도에서 **"지금 타면 앉을 확률"과 "k정거장 후 누적 착석 확률"**을 계산합니다.

**모델 아이디어** (전동차 1량 좌석 54석 / 정원 약 160명 → 혼잡도 34% ≈ 좌석 만석):

1. **즉시 착석**: 혼잡도 `c`의 로지스틱 함수 `1/(1+e^((c-32)/5))` — 혼잡 10%면 ~99%, 50%면 ~3%
2. **k정거장 후**: 진행 방향의 다음 역들에서 혼잡도가 줄어드는 만큼(하차) 좌석이 나고,
   서 있는 사람들이 경쟁한다고 보고 역마다 `p_i = 빈좌석/입석자`를 누적 — `P_k = 1-(1-P_0)·Π(1-p_i)`
3. 30분 슬롯 사이는 선형 보간, 상·하선은 역번호 증감으로 판별

```bash
# 모델 재생성 (원본 CSV → JSON)
cd backend && node scripts/build-congestion-model.mjs

# 예측 API 스모크 테스트 (DB 불필요)
npm run build && node scripts/smoke-prediction.js
```

```
GET /api/subway/seat-prediction?line=2호선&station=강남&next=역삼&day=평일&time=08:30
→ { congestion: 91.1, pSitNow: 0, journey: [{ station: "역삼", pCumulative: 0.17 }, ...] }
```

> 인증 불필요·API 키 불필요. 9호선·경전철 등 데이터 밖 노선은 `supported: false`로 응답하고
> 앱은 데모 값으로 동작합니다. 데이터 출처: 서울교통공사_지하철혼잡도정보 (2026-03-31, 분기 갱신)

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

## 🔑 환경변수 (레포 루트의 `.env` — 코드가 `../.env`를 읽음)

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
