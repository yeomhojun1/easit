# easit 버그 수정 보고 (2026-09-17)

> 5개 프로젝트 전체 현황: https://claude.ai/artifact/PvWqAcbkvtL8VSNHZhL48e

feature-test-report.md 의 B1~B8 + "그 외 관찰" 전부 대응. 커밋·푸시 안 함(전부 워킹트리에 미커밋), staged 되어 있던 `backend/tsconfig.json` 은 손대지 않음.

## 한 줄 요약

OAuth 키 없이 백엔드가 뜨고 이메일 로그인이 동작(합격 기준 충족). 혼잡도 모델은 "본선 우선 + 프론트 `SUBWAY_LINES` 순서 정본"으로 재생성해 2호선 성수·신도림, 1호선 동묘앞, 8호선 남위례, 5호선 강동이 전부 정상화. 예측 가능한 인접역 쌍 504→512로 증가(감소 0). 단위 테스트 11개 추가 전부 통과. **PostgreSQL(5432)·Node 24 는 작업 종료 시점에도 아직 안 올라와서 DB 연동 검증은 보류.**

## 검증 결과

| 항목 | 명령 | 결과 |
|---|---|---|
| 백엔드 빌드 | `cd backend && npm run build` | PASS (에러 0) |
| 예측 스모크 | `node scripts/smoke-prediction.js` | PASS (200 / 외선 91.1% / 9호선 supported:false / 누락 400) |
| 단위 테스트 | `cd backend && npm test` | PASS 11/11 (신규) |
| 프론트 빌드 | 루트 `npm run build` | PASS (vite 5.4.21, 44 modules) |
| OAuth 키 없이 부팅 | `node dist/main.js` | PASS — `OAuth2Strategy requires a clientID option` 소멸. 이제 TypeORM DB 연결에서만 대기/종료 |
| 인증 API 실호출(4003) | DB 스텁으로 실제 AuthController 기동 | PASS (아래) |
| DB 연동(실DB 회원가입·로그인) | — | **검증 보류** (5432 미기동, `node -v` = 18.20.8 그대로) |
| 브라우저 클릭 확인 | Playwright | **미실시** — 브라우저 프로필이 이미 사용 중이라 접속 실패. 대신 SSR 렌더 + HTTP 실호출로 확인 |

### 인증 API 실측 (포트 4003, OAuth 키 없음 / DB 스텁)

```
GET  /api/auth/providers       200 {"providers":[], "all":[kakao·naver·google 전부 configured:false]}
GET  /api/auth/kakao           503 {"provider":"kakao","configured":false,"message":"카카오 로그인은 이 서버에 설정되어 있지 않습니다. (.env 의 KAKAO_REST_API_KEY 필요)"}
GET  /api/auth/naver           503 (동일 형식)
GET  /api/auth/google          503 (동일 형식)
POST /api/auth/register {}     400 ["이름을 입력해주세요.","이메일 형식이 올바르지 않습니다.","비밀번호는 8자 이상이어야 합니다."]
POST /api/auth/register 정상   201 accessToken 발급
POST /api/auth/register 중복   409 "이미 사용 중인 이메일입니다."
POST /api/auth/login  정상     201 user 반환
POST /api/auth/login  비번오류 401
```

`KAKAO_REST_API_KEY` 만 넣고 다시 띄우면 `providers:[{"name":"kakao","label":"카카오"}]` 로 바뀌고 AuthModule providers 에 `KakaoStrategy` 가 실제로 추가된다(메타데이터로 확인). `NAVER_CLIENT_ID` 만 있고 SECRET 이 없으면 등록하지 않는다(부분 설정 방지).

---

## 2. 혼잡도 데이터 — 수정 전/후 예측값 비교

같은 입력(`평일 08:00`)으로 수정 전 커밋본 모델·코드와 수정 후를 각각 직접 호출한 결과.

### 2호선 성수 → 건대입구 (stops=5)

| | 수정 전 | 수정 후 |
|---|---|---|
| direction | **외선** (오답) | **내선** (정답) |
| congestion | 15.6% (9002 지선 승강장 값) | **42.2%** (본선 211 내선) |
| pSitNow | 96.4% | **11.5%** |
| journey | 성수E > 까치산 > 용두 > 신정네거리 > 양천구청 | **건대입구 > 구의 > 강변 > 잠실나루 > 잠실** |

### 2호선 신도림 → 문래 (stops=3)

| | 수정 전 | 수정 후 |
|---|---|---|
| direction | 외선 | **내선** |
| congestion | **0%** (9003 외선이 전부 0인 시계열) | **128.6%** |
| pSitNow | **99.8%** (사실상 "무조건 앉는다") | **0.0%** |
| journey | 성수 > 성수E > 까치산 | **문래 > 영등포구청 > 당산** |
| journey 혼잡도 | 15.6 / 54.5 / 53 | 121.1 / 114.6 / 112.9 |

### 2호선 뚝섬 → 성수 (stops=3)

| | 수정 전 | 수정 후 |
|---|---|---|
| journey | 건대입구 > 구의 > 강변 (성수를 건너뜀) | **성수 > 건대입구 > 구의** |
| 1정거장 누적 착석 | 2% | 36% |

### 1호선 동대문 → 동묘앞 (stops=5) — B2

| | 수정 전 | 수정 후 |
|---|---|---|
| direction | 상선 | **하선** |
| congestion | 23.2% | **82.2%** |
| journey | 신설동 > 제기동 > 청량리 > **동묘앞** (동묘앞이 청량리 뒤) | **동묘앞 > 신설동 > 제기동 > 청량리** |

### 8호선 남위례(2828) — B2

| | 수정 전 | 수정 후 |
|---|---|---|
| 복정→남위례 journey | 산성 > 남한산성입구 > 단대오거리 (남위례 없음) | **남위례 > 산성 > 남한산성입구** |
| 남위례→산성 | **상선** 86%, journey 모란 > 수진 > 신흥 (반대 방향) | **하선** 15.7%, journey 산성 > 남한산성입구 |

### 5호선 강동 — B3

| | 수정 전 | 수정 후 |
|---|---|---|
| 강동→길동(하남 방면) | **미지원** "강동역 하선 데이터가 없습니다." | **하선 31.6%, pSitNow 52.0%**, journey 길동 > 굽은다리 > 명일 |
| 강동(마천)→둔촌동 | 미지원 | **하선 67.8%, pSitNow 0.1%** |
| 강동→천호(상선) | 상선 79% | 상선 79% (변화 없음) |

### 지선 (기존엔 본선처럼 이어붙던 구간)

| 입력 | 수정 전 | 수정 후 |
|---|---|---|
| 2호선 성수→용답 | 외선 15.6%, journey 성수E > 까치산 > 용두 | **외선 15.6%, journey 용답 > 신답 > 용두** (성수지선 트랙) |
| 2호선 신도림→도림천 | 외선 0%, journey 성수 > 성수E > 까치산 | **내선 34.7%, journey 도림천 > 양천구청 > 신정네거리** |

### 회귀 (변하면 안 되는 것)

| 입력 | 수정 전 | 수정 후 |
|---|---|---|
| 2호선 강남→역삼 08:30 | 외선 91.1%, 역삼 17% > 선릉 48% > 삼성 99% | **동일** |
| 5호선 강일→미사 | 하선 31.1% | **동일** |

### 커버리지 (프론트 인접역 쌍 전수, 1~8호선 742쌍, 평일 08:00)

| | 1호선 | 2호선 | 3호선 | 4호선 | 5호선 | 6호선 | 7호선 | 8호선 | 합계 |
|---|---|---|---|---|---|---|---|---|---|
| 수정 전 | 18/148 | 84/84 | 66/86 | 50/100 | 99/100 | 71/76 | 82/104 | 34/44 | **504/742** |
| 수정 후 | 20/148 | 84/84 | 67/86 | 52/100 | 100/100 | 71/76 | 83/104 | 35/44 | **512/742** |

**줄어든 노선 없음.** (1~8호선 안에서도 예측 불가인 구간이 남는 건 원본 CSV가 서울교통공사 관할 구간만 담고 있어서이며 이번 수정 범위 밖.)

### 모델 JSON 갱신 전후

`backend/data/congestion-model.json` 334,279 → 336,336 bytes (입력 1671행은 동일).

| 노선 | order 길이 | data 키 | 지선 트랙 |
|---|---|---|---|
| 1호선 | 10 → 75 | 10 → 10 | — |
| 2호선 | 52 → 43 | 52 → 53 | 성수지선(5), 신정지선(5) |
| 3호선 | 34 → 44 | 34 → 34 | — |
| 4호선 | 26 → 51 | 26 → 26 | — |
| 5호선 | 58 → 51 | 58 → 57 | 하남지선(6) |
| 6호선 | 40 → 39 | 40 → 40 | — |
| 7호선 | 42 → 53 | 42 → 42 | — |
| 8호선 | 19 → 23 | 19 → 23 | — |

- order 가 늘어난 노선은 데이터가 없는 역까지 프론트 순서를 그대로 담기 때문(방향 판정이 정확해진다). 2·5·6호선은 지선이 본선 배열에서 빠지면서 줄었다.
- 수정 전 2호선 order 끝은 `용두/250 까치산/260 성수E/9001 성수/9002 신도림/9003` 였고, 지금은 본선이 `… 뚝섬/210 성수/211 건대입구/212 …` 로 제자리.
- 지선 데이터 보존 키: `성수(지선)`, `신도림(지선)`, `강동(마천)`, `응암S`, `암사역사공원` (스크립트가 실행 시 목록을 출력).

---

## 고친 내용 (파일별)

### 1. 소셜 로그인 조건부 등록 (최우선)

- **신규** `backend/src/auth/auth.config.ts` — 프로바이더별 필수 env 정의, `isProviderConfigured/enabledProviders`, `jwtSecret()`(미설정 시 개발용 기본값 + 경고), `frontendUrl()`(기본 `http://localhost:5173`).
  - 프로바이더 등록 여부가 `ConfigModule.forRoot` 실행보다 먼저 결정되므로, 같은 경로(`../.env`, `.env`)를 dotenv 로 한 번 더 읽는다(이미 있는 env 는 덮어쓰지 않음).
- **신규** `backend/src/auth/oauth.guard.ts` — `OAuthGuard(provider)` 믹스인. 미설정이면 passport 의 "Unknown strategy" 500 대신 **503 JSON**(어떤 env 가 필요한지 포함).
- `auth.module.ts` — Kakao/Naver/Google 전략을 `isProviderConfigured` 통과한 것만 `providers` 에 등록.
- `auth.controller.ts` — `AuthGuard(...)` → `OAuthGuard(...)`, **`GET /auth/providers`** 신설, 콜백 리다이렉트가 `undefined?token=` 이 되지 않도록 `frontendUrl()` 사용.
- `jwt.strategy.ts` — `JWT_SECRET` 미설정 시 부팅이 죽던 것 → 개발용 기본값 사용.
- **프론트** `OnboardingScreen.jsx` — 마운트 시 `GET /auth/providers` 로 목록을 받아 **등록된 버튼만** 렌더. 하나도 없으면 "소셜 로그인은 이 서버에 설정되어 있지 않습니다" 안내. 이메일 버튼은 항상 노출.

### 2. 혼잡도 데이터 (B1~B3)

- `backend/scripts/build-congestion-model.mjs` — 집계 로직 교체.
  - **본선 우선**: 같은 역명의 후보 레코드를 역번호 오름차순으로 훑어 방향·요일별로 먼저 채운 쪽이 정본. 값이 전부 0 인 시계열은 "데이터 없음"으로 보고 건너뛴다 → 2호선 성수 외선은 본선 211(전부 0) 대신 **9001 `성수E`**(실측치가 뚝섬 52.0 ↔ 건대입구 68.0 사이에 정확히 들어맞음)가 선택된다.
  - **순서 정본은 프론트** `src/data/subway.js` 의 `SUBWAY_LINES`(스크립트가 직접 import). 역번호 정렬 폐기.
  - 선택되지 않은 지선 승강장은 `성수(지선)`·`신도림(지선)`·`강동(마천)` 등 별도 키로 보존.
  - 지선(`branches`)은 **별도 트랙**으로 출력하고 본선과 만나는 역(성수/신도림/강동)을 트랙 맨 앞에 붙였다. 성수지선은 내·외선 라벨이 본선과 반대라 `invertDirection` 표시.
- `backend/src/subway/seat-model.ts` — 본선→지선 순으로 "탑승역과 다음 역이 함께 있는 트랙"을 골라 그 안에서만 진행. `order` 항목의 `key` 로 지선 승강장 시계열을 참조하고, `강동(마천)` 처럼 승강장을 직접 지정한 조회도 지원.

### 3. API 주소·오류 문구

- `src/api.js` — `API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4003/api'`. `ApiError`(network 플래그) 도입: fetch 자체가 실패하면 **"서버에 연결할 수 없습니다. 백엔드가 실행 중인지 확인해주세요."**, 응답이 JSON 이 아니면 "서버 응답을 해석할 수 없습니다. API 주소를 확인해주세요." (`Failed to fetch` 원문 노출 제거). `fetchAuthProviders()` 추가.
- `.env.example`(루트) — `PORT=4003`, `VITE_API_URL`, 콜백 URL 4003, 소셜 키는 **주석 처리**(복사해서 바로 써도 "키 없으면 건너뛰기"가 동작).
- **B5** `src/prediction.js` — `fetchSeatPrediction` 이 `null` 대신 항상 `status`(`ok`/`unsupported`/`offline`/`error`)를 담아 반환. `predictionNotice()` 로 문구 분기:
  - offline → "백엔드 서버에 연결할 수 없습니다 — 아래 확률은 데모 값입니다"
  - error → "실데이터를 불러오지 못했습니다 (…) — 아래 확률은 데모 값입니다"
  - unsupported → 기존 "이 노선·역은 혼잡도 실데이터 미지원(1~8호선만) …"
  - `MainScreen.jsx` / `ZoneScreen.jsx` 가 `prediction?.supported` 로 판정하도록 수정.

### 4. 나머지

- **B4** `prediction.controller.ts` — 시:분 범위 검사 추가. `time=25:99` → **400** "time은 00:00~23:59 범위여야 합니다." (`24:00`, `08:60` 도 400)
- **B6** `SignupScreen.jsx:60` — "연령 확인 용도로만 사용되며 서버에 저장되지 않습니다" → **"연령 확인 용도로 수집·저장되며, 회원 탈퇴 시 삭제됩니다."** (바로 아래 동의 문구의 수집 항목·보유기간과 일치)
- **B7** `ZoneScreen.jsx` — "4존 기본 / 8존 프리미엄 / 🔒 8존 보기" → **"3존 기본 / 6존 프리미엄 / 🔒 6존 보기"**
- **B8** `docker-compose.yml` — Dockerfile 이 없는 `backend`·`frontend` 서비스 삭제, **db 만** 유지. `README.md` 실행 방법을 Docker 없는 절차(네이티브 PostgreSQL + psql 로 DB/계정 생성 → `.env` → 백엔드 4003 / 프론트 5173)로 갱신.
- `POST /auth/register` DTO — **신규** `backend/src/auth/dto/register.dto.ts` (이메일 형식, 비밀번호 8자, 이름 필수, 생년월일 YYMMDD, 성별 male/female). `auth.service`·`users.service` 시그니처 정리.
- `users.service.createOAuthUser` — 기존 이메일 계정과 겹칠 때 500 → **409**.
- `RewardFlowScreen.jsx` — 하차역 목록을 **선택한 탑승 방향** 쪽으로. 이전 역 방향이면 앞쪽 역들을 역순으로 보여준다. (`App.jsx` 는 이미 `selectedDirection` 을 넘기고 있었는데 컴포넌트가 받지 않고 있었음)
- `ZoneScreen` 데모 모드 대상역 — 2호선 `STATIONS` 상수 고정 → **선택한 노선·방향** 기준 계산.
- `src/data/subway.js` 중복 역명 정리 (React key 경고·`indexOf` 오동작 원인)
  - 경의·중앙선: `'곡산','능곡','대곡','화전','강매','행신','능곡',…` → `'곡산','대곡','능곡','행신','강매','화전',…`
  - 김포골드라인: `걸포`/`걸포북변` 혼재·`마산` 2회 → `'김포공항','고촌','풍무','사우(김포시청)','걸포북변','운양','장기','마산','한강신도시(구래)','양촌'`
  - 의정부경전철: 끝에 붙어 있던 `'새말','탑석'` 중복 제거
  - 확인: 전 노선 중복 0, 총 역수 740 → 735
- **단위 테스트 11개** `backend/test/seat-model.test.js` (+ `package.json` 에 `pretest`=nest build, `test`=`node --test test/`)
  1. 2호선 성수 내선·본선 판정 (B1 회귀, congestion 42.2 고정값)
  2. 2호선 신도림 0%·99.8% 금지 (B1 회귀)
  3. 2호선 뚝섬→성수 경로에 성수 포함 (B1 회귀)
  4. 1호선 동묘앞 위치 (B2 회귀)
  5. 8호선 남위례 위치 (B2 회귀)
  6. 5호선 강동 하남·마천 양쪽 조회 + 상선 회귀 (B3)
  7. 2호선 지선이 본선과 섞이지 않음
  8. 미지원 입력(9호선/없는 역/같은 역/타 노선 역/요일 오류) → 예외 없이 `supported:false`
  9. 역명 별칭(이수·총신대입구·"총신대입구 역"·당고개·뚝섬유원지)
  10. 시각 검증 400 (`25:99`, `24:00`, `08:60`, `8시`, `830`, `-1:00`) + 파라미터 누락
  11. 슬롯 보간 단조성·누적 착석 확률 단조증가 및 ≤0.99

---

## 남은 것 · 알려진 한계

1. **DB 연동 검증 보류** — 작업 종료 시점에도 `node -v` = 18.20.8, 5432 미기동. PostgreSQL 설치 후 아래로 이어서 확인 필요:
   ```powershell
   psql -U postgres -c "CREATE USER easit WITH PASSWORD 'easit1234';"
   psql -U postgres -c "CREATE DATABASE easit OWNER easit;"
   cd backend; npm run start:dev      # 4003 에서 기동
   ```
   그다음 브라우저 5173 에서 회원가입 → 로그인.
2. **브라우저 클릭 확인 미실시** — Playwright 브라우저 프로필이 이미 사용 중이라 접속 실패. 대신 SSR 렌더로 온보딩(이메일 버튼만 노출)·존 화면 문구(3존/6존)·리워드 화면 렌더를 확인했다.
3. `5호선 강동(마천)→둔촌동` 은 혼잡도로 마천 승강장(67.8%) 값을 쓰지만, 이후 경로는 프론트 5호선 배열이 본선+마천지선을 한 줄로 이어 놓은 순서(…상일동, 둔촌동…)를 따라 `길동 > 굽은다리 > 명일` 로 걷는다. 마천지선 역들이 본선 배열에 이미 들어 있어 별도 트랙을 만들지 않았기 때문. 고치려면 프론트 5호선 배열에서 둔촌동~마천을 분리해야 한다(프론트 UI 영향이 있어 이번엔 보류).
4. 1호선 66/75, 3호선 대화~삼송 등 **예측 불가 구간은 여전** — 원본 CSV(서울교통공사 관할)에 그 구간이 없어서이며, 앱은 데모 값으로 폴백한다.
5. `MOCK_TRAINS`(도착 예정 열차 2건)·객차별 확률 10칸·존 확률은 여전히 목업. `/subway/arrival|congestion|position` 은 프론트 미사용.
6. `git add/commit/push` 하지 않음. `backend/tsconfig.json` 의 staged 변경(1줄 삭제)은 그대로 둠.
