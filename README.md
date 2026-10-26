# Easit — 지하철에서 앉을 수 있을지 미리 알려주는 앱

수도권 지하철을 탈 때, 지금 이 열차에 타면 자리에 앉을 수 있을지를 공공 혼잡도 통계로 계산해 보여줍니다.

## 누구의 어떤 불편인가

출퇴근길에 매일 같은 노선을 타는 사람은 "이번 열차는 앉을 수 있을까, 몇 정거장 가면 자리가 날까"를 타 보기 전까지 알 수 없습니다. 서울교통공사가 역·방향·시간대별 혼잡도를 공개하고 있지만, 표로 된 숫자라서 승강장에서 바로 써먹기 어렵습니다. Easit은 이 숫자를 "앉을 확률"로 바꿔 보여줍니다.

## 바로 써 보기

**https://yeomhojun1.github.io/easit/**

설치나 회원가입 없이 링크만 누르면 됩니다. 첫 화면에서 **데모 계정으로 바로 시작**을 누르세요.
이 데모는 실제 서버 없이 브라우저 안에서만 동작합니다. 로그인·포인트는 가짜이고, 앉을 확률은 저장소에 들어 있는 서울교통공사 혼잡도 자료로 브라우저에서 직접 계산합니다.

## 화면에서 할 수 있는 것

1. **노선과 역 고르기** — 수도권 24개 노선 중 하나를 고르고, 타는 역을 고릅니다.
2. **가는 방향 고르기** — 옆 역 이름으로 방향을 정하면 지금 시각 기준 열차 혼잡도와 "지금 타면 앉을 확률"이 나옵니다. (서울교통공사 자료가 있는 1~8호선 구간만 실제 계산, 나머지 노선은 예시 값이라고 화면에 안내합니다.)
3. **몇 정거장 뒤에 앉을 확률 보기** — 칸을 하나 누르고 슬라이더를 움직이면, 몇 정거장 뒤 어느 역까지 가면 앉을 확률이 얼마인지 보여줍니다.
4. **칸 안 구역 보기** — 한 칸을 출입문 사이 3구역(프리미엄 표시 시 6구역)으로 나눠 보여줍니다. 칸별·구역별 비율은 아직 예시 값입니다.
5. **착석 기록과 포인트** — "좌석에 앉았어요"를 누르고 내릴 역을 알려주면 포인트가 쌓이는 흐름을 체험할 수 있습니다.

## 어떻게 만들고 고쳤나

AI 코딩 에이전트로 기능을 만든 뒤, 별도 에이전트에게 기능 38개를 하나씩 실행해 보게 했습니다([feature-test-report.md](feature-test-report.md): 통과 25, 실패 4, 환경이 없어 실행 못 함 9, 표 밖 결함 4건).
찾은 결함 B1~B8(로그인 키가 없으면 서버가 안 뜨는 문제, 2호선 성수·신도림 방향이 거꾸로 계산되는 문제 등)을 고치고, 같은 실수가 다시 나오지 않도록 예측 모델 단위 테스트 11개를 추가했습니다([fix-report.md](fix-report.md)). 실제 DB를 붙인 회원가입·로그인 검증은 아직 하지 못했습니다.

---

# 🚇 Easit — 수도권 지하철 좌석 예측 (개발자용)

### 데모 모드 (GitHub Pages)

`VITE_DEMO=true`로 빌드하면 백엔드 대신 브라우저 안의 가짜 API(`src/demo/`)가 응답합니다. 착석 예측은 `backend/data/congestion-model.json`을 그대로 불러와 `backend/src/subway/seat-model.ts`와 같은 계산(`src/demo/seatModel.js`)을 합니다. 백엔드 모델을 고치면 이 파일도 같이 고쳐야 합니다. 평소 빌드(`npm run build`)에는 데모 코드가 포함되지 않습니다.

```bash
VITE_DEMO=true npm run build   # base 가 /easit/ 로 바뀜
VITE_DEMO=true npm run preview # http://localhost:4173/easit/
```

`main`에 push하면 `.github/workflows/pages.yml`이 데모 빌드를 GitHub Pages에 배포합니다.

지하철 탑승객이 **좌석 현황을 체크인**하면, 다른 사용자는 **빈자리가 생길 확률이 높은 칸**을 미리 찾을 수 있는 서비스입니다. (Easit 프로젝트의 초기 버전 — 더 발전된 버전은 [subwayApp](https://github.com/yeomhojun1/subwayApp))

---

## ✨ 주요 기능

- **실데이터 착석 확률 예측** — 서울교통공사 혼잡도 통계(1~8호선) 기반, 아래 상세
- 탑승 중인 열차·좌석 체크인
- 노선/칸별 빈자리 예측 정보 확인
- 카카오 · 네이버 · 구글 소셜 로그인 (키가 설정된 것만 버튼 노출, 없으면 이메일 로그인만)

## 📊 착석 확률 예측 모델 (실데이터)

[서울교통공사 지하철혼잡도정보](https://www.data.go.kr/data/15071311/fileData.do)(공공데이터포털, KOGL 제1유형)를 기반으로,
역·방향·요일·30분 단위 혼잡도에서 **"지금 타면 앉을 확률"과 "k정거장 후 누적 착석 확률"**을 계산합니다.

**모델 아이디어** (전동차 1량 좌석 54석 / 정원 약 160명 → 혼잡도 34% ≈ 좌석 만석):

1. **즉시 착석**: 혼잡도 `c`의 로지스틱 함수 `1/(1+e^((c-32)/5))` — 혼잡 10%면 ~99%, 50%면 ~3%
2. **k정거장 후**: 진행 방향의 다음 역들에서 혼잡도가 줄어드는 만큼(하차) 좌석이 나고,
   서 있는 사람들이 경쟁한다고 보고 역마다 `p_i = 빈좌석/입석자`를 누적 — `P_k = 1-(1-P_0)·Π(1-p_i)`
3. 30분 슬롯 사이는 선형 보간, 상·하선(내·외선)은 프론트 `SUBWAY_LINES` 배열의 역 순서로 판별
4. 노선 순서의 정본은 프론트 `src/data/subway.js` — 같은 역명이 여러 승강장 코드로 오면(2호선 성수 211/9002)
   본선을 정본으로, 지선 승강장 시계열은 `성수(지선)` 같은 별도 키로 보존한다. 지선은 별도 트랙으로 조회

```bash
# 모델 재생성 (원본 CSV → JSON)
cd backend && node scripts/build-congestion-model.mjs

# 예측 API 스모크 테스트 (DB 불필요)
npm run build && node scripts/smoke-prediction.js

# 예측 모델 단위 테스트 (DB 불필요)
npm test
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

## 🚀 실행 방법 (Docker 불필요)

### 1. PostgreSQL 16

네이티브 설치(권장, Windows):

```powershell
# 설치 후 psql 로 DB·계정 생성
psql -U postgres -c "CREATE USER easit WITH PASSWORD 'easit1234';"
psql -U postgres -c "CREATE DATABASE easit OWNER easit;"
```

docker 가 있다면 DB만 컨테이너로 띄워도 됩니다 (`docker compose up -d db`).
테이블은 TypeORM `synchronize: true` 로 자동 생성됩니다.

### 2. 환경변수

```bash
cp .env.example .env   # 소셜 로그인 키는 비워둬도 됩니다
```

### 3. 실행

```bash
# 백엔드 (포트 4003)
cd backend
npm install
npm run start:dev

# 프론트엔드 (포트 5173, 루트)
npm install
npm run dev
```

> 소셜 로그인 키(`KAKAO_REST_API_KEY` 등)가 없으면 해당 전략을 아예 등록하지 않으므로
> 백엔드는 정상 기동하고, 프론트는 `GET /api/auth/providers` 응답에 따라 등록된 버튼만 보여줍니다.
> 미설정 프로바이더로 직접 접근하면 503 JSON 으로 응답합니다.

## 🔑 환경변수 (레포 루트의 `.env` — 백엔드가 `../.env`를 읽음)

```
PORT=4003
VITE_API_URL=http://localhost:4003/api

DB_HOST=localhost
DB_PORT=5432
DB_USER=easit
DB_PASS=easit1234
DB_NAME=easit

JWT_SECRET=32자_이상_랜덤_문자열   # 없으면 개발용 기본값으로 동작

# 선택 — 없으면 해당 소셜 버튼이 숨겨집니다
# KAKAO_REST_API_KEY=카카오_REST_API_키
KAKAO_CALLBACK_URL=http://localhost:4003/api/auth/kakao/callback
```

> `.env.example`을 복사해 `.env`를 만들어 값을 채워주세요.
