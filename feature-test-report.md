# easit 기능 테스트 보고 (2026-09-16)

> 5개 프로젝트 전체 현황: https://claude.ai/artifact/PvWqAcbkvtL8VSNHZhL48e

## 한 줄 요약: 전체 기능 38개 중 PASS 25 / FAIL 4 / 환경없음 9 (표 밖 결함 B5~B8 별도 4건)

- 테스트 환경: Windows 11, Node v18.20.8, npm 10.8.2. 로컬에 Postgres·docker 없음. 프론트 dev 서버(5173)는 기존 것 그대로 사용, 백엔드는 3100/3101/3999 포트로 잠깐 띄웠다가 모두 종료함.
- 소스·git 변경 없음(`git status`: staged `backend/tsconfig.json` 1건 그대로). 빌드 산출물(`dist/`, `backend/dist/`)만 재생성(.gitignore 대상).
- 테스트 스크립트는 전부 scratchpad에 두고 실행했고, 모델 재생성도 CSV·스크립트를 복사한 뒤 돌려서 프로젝트의 `data/congestion-model.json`은 건드리지 않음.

## 기능 목록과 결과

판정 기준: **PASS** = 실제 실행/렌더/호출로 확인, **FAIL** = 실행해서 결함 확인, **환경없음** = DB·API키·OAuth 앱 등록이 없어 실행 불가(코드 검토만).
"SSR 렌더"는 esbuild로 컴포넌트를 번들해 Node에서 `renderToString`한 것(클릭 동작은 아니고 "깨지지 않고 기대 문구가 나오는지"까지).

| # | 기능 | 종류 | 테스트 방법(명령) | 결과 | 관찰/근거 |
|---|------|------|-------------------|------|-----------|
| 1 | 프론트 프로덕션 빌드 | UI | `npm run build` (루트) | PASS | vite 5.4.21, 44 modules, `dist/assets/index-*.js` 187 kB, 4.3s |
| 2 | 프론트 dev 서버 서빙(5173) | UI | `curl http://localhost:5173/` + `/src/**` 14개 모듈 curl | PASS | index 200, 14개 모듈 전부 200, `@vite/client`·react dep 200. 각 모듈에 핵심 문구(`카카오로 시작하기`, `노선 선택`, `실데이터 착석 예측`, `데모 데이터`, `/auth/login`, `/auth/register` 등) 포함 확인 |
| 3 | 온보딩 화면(카카오·네이버·구글·이메일 4버튼) | UI | SSR 렌더 `<App />`, `<OnboardingScreen />` | PASS | 4버튼 + 약관 문구 렌더. 소셜 버튼은 `window.location.href = API_URL/auth/{kakao,naver,google}` (백엔드 필요) |
| 4 | 이메일 로그인 화면 | UI | SSR 렌더 `<LoginScreen />` | PASS | 이메일/비밀번호/로그인/회원가입 링크 렌더. 실제 로그인은 #25 참조 |
| 5 | 회원가입 2단계 폼(이름·이메일·비번 8자 → 전화·생년월일·성별·동의) | UI | SSR 렌더 step1 + 코드 검토(formatPhone/formatBirth/isStep2Valid) | PASS | step1 렌더 OK. 2단계 검증 로직(전화 11자리, 생년월일 6자리, 성별, 동의) 코드상 정상. 단 문구 결함 → 버그 B6 |
| 6 | 노선 선택 목록(24개 노선) | UI | SSR 렌더 `<MainScreen />` | PASS | 1호선~GTX-A 24노선, "N개 역" 표기. 역 총합 740 |
| 7 | 역 선택 → 탑승 방향(이전/다음 역) 선택 | UI | 코드 검토 + 방향→API 호출 매핑을 #14/#15로 검증 | PASS | `direction`(다음 역명)을 그대로 `next` 쿼리로 전달. 노선 첫/끝 역은 버튼 1개만 표시 |
| 8 | 실데이터 예측 카드 / 미지원·폴백 안내(백엔드 없을 때 데모값) | UI | `src/prediction.js` 코드 확인 + 3000포트 실제 응답 curl + SSR(ZoneScreen 선택 상태) | PASS | `fetchSeatPrediction`이 실패·미지원 시 `null` → 화면은 데모값. 현재 3000은 **다른 앱(연애 분석 AI, Next.js)** 이 점유 중이라 HTML 404 → `res.json()` 예외 → 폴백 정상 동작. 단 안내 문구가 부정확 → 버그 B5 |
| 9 | 도착 예정 열차 목록 | UI | 코드 검토 | PASS | `MOCK_TRAINS` 고정 2건(2312/2298, 성수 방면) — 실데이터 아님(목업) |
| 10 | 객차별 착석 확률 10칸 → 클릭 시 상세 | UI | 코드 검토 + `CARS` 상수 | PASS | 목업 확률 [38,52,71,65,44,29,60,73,48,35], 65%+ 초록 테두리 |
| 11 | 객차 상세(ZoneScreen) — 3존 다이어그램·존 선택·데모 수식 | UI | SSR 렌더(미선택/선택+프리미엄), 데모 수식 값 대조 | PASS | 미선택 시 경고 2개+버튼 비활성. 데모 수식 검증: 3호차 71%, 2정거장 → 61%, 존A 47/존B 64/존C 60 정확히 렌더 |
| 12 | 프리미엄 토글(3존↔6존) | UI | SSR 렌더 isPremium=true, `<SubwayCarDiagram isPremium />` | PASS | A-1~C-2 6존 렌더. 제목 문구 불일치 → 버그 B7 |
| 13 | 정거장 슬라이더(실데이터 journey 반영) | UI | 코드 검토 + journey 응답 구조(#14) | PASS | 백엔드 있으면 `journey[stops-1].pCumulative`로 % 표시, 존 확률은 상대가중치×누적확률. 없으면 `max(20, prob-5*stops)` |
| 14 | 예측 API `GET /api/subway/seat-prediction` 정상 | API | `cd backend && npm run build && node scripts/smoke-prediction.js` | PASS | status 200, 강남→역삼 외선 혼잡 91.1% pSitNow 0, journey 역삼 17% > 선릉 48% > 삼성 99% … / 9호선 supported=false / 파라미터 누락 400 |
| 15 | 예측 API 입력 검증(14케이스) | API | Nest 앱을 3100포트에 단독 기동(scratchpad `controller-http.js`) | PASS | line만→400, station 누락→400, time `8시`/`830`→400, `stops=abc`→기본 8, `stops=100`→15 캡, day 생략→평일, time 생략→현재시각, 요일오류/없는 역→200 `supported:false`, 없는 경로→404 |
| 16 | 예측 API — `time=25:99` 허용 | API | 위와 동일 | FAIL(경미) | 정규식 `^\d{1,2}:\d{2}$`만 검사해 `25:99`가 200으로 통과, 내부에서 마지막 슬롯(00:30)으로 조용히 클램프 → 버그 B4 |
| 17 | 모델 함수 `predictSeat` 정상 경로(1~7호선 표본) | 모델 | scratchpad `model-direct.js`로 dist 함수 직접 호출 | PASS | 2호선 내/외선, 3호선 상/하선, 1호선 상선, 4호선 별칭 등 결과 산출. 로지스틱 수식 재계산 일치(일 06:00 강남 c=13.4 → 0.976), 슬롯 보간 일치(08:30 91.1 / 09:00 91.6 / 08:45 91.4), 누적확률 단조증가·≤0.99·0≤pGain≤1 전부 참, curve 39슬롯 |
| 18 | 역명 정규화·별칭(공백, "역" 접미, 괄호 병기, 이수→총신대입구, 당고개→불암산, 뚝섬유원지→자양) | 모델 | 동일 | PASS | `"강남 역"→"역삼역"`, `총신대입구(이수)`, `이수`, `당고개`, `뚝섬유원지` 모두 매칭 |
| 19 | 미지원 입력 처리(9호선·신분당선·GTX-A·빈 노선·월요일·없는 역·같은 역·타 노선 역) | 모델 | 동일 | PASS | 전부 `supported:false` + 사유 문자열. 예외 없음 |
| 20 | 경계값(stops 0/-3/100, 00:15, 04:59, 05:00) | 모델 | 동일 | PASS | stops≤0 → journey 빈 배열(200), 100 → 15개, 자정 이후는 하루 끝으로 이어붙임, 05:00 이전은 첫 슬롯 클램프 |
| 21 | 2호선 성수·신도림(지선 분기역) 예측 | 모델 | `predictSeat('2호선','성수','건대입구',…)`, `('2호선','신도림','문래',…)` | FAIL | 성수→건대입구가 **외선**으로 판정되고 경로가 `성수E > 까치산 > 용두 > 신정네거리 > 양천구청`. 신도림→문래는 혼잡도 0%·착석 99.8%로 나옴. 원인 = 버그 B1 |
| 22 | 신설·개명역 순서(1호선 동묘앞, 8호선 남위례) | 모델 | 프론트 인접역 쌍 전수 대조(F 섹션) | FAIL | 1호선 동대문→동묘앞 경로가 `신설동 > 제기동 > 청량리 > 동묘앞`, 8호선 복정→남위례 경로가 `산성`부터, 남위례→산성이 `모란` 방향. 원인 = 버그 B2 |
| 23 | 5호선 강동역 예측 | 모델 | `predictSeat('5호선','강동','길동',…)` | FAIL | `강동역 하선 데이터가 없습니다` — 마천/하남 방향 둘 다 미지원. 원인 = 버그 B3 |
| 24 | 프론트 역 목록 대비 데이터 커버리지 | 모델 | 1~8호선 프론트 역 전수(379역) 호출 | PASS(관찰) | 예측불가: 1호선 66/75(서울교통공사 구간 서울역~청량리 10역만 데이터 있음), 3호선 10/44(대화~삼송), 4호선 26/51(진접선·과천/안산선), 5호선 1(강동), 7호선 12/53(인천구간), 8호선 5/23(별내선), 2·6호선 0. 데이터 출처상 한계이며 앱은 데모값으로 폴백 |
| 25 | 혼잡도 모델 빌드 스크립트 `build-congestion-model.mjs` | 모델 | scratchpad에 CSV+스크립트 복사 후 `node scripts/build-congestion-model.mjs`, 결과를 커밋본과 바이트 비교 | PASS | 1671행 → 8노선, 산출 JSON **커밋본과 완전 동일**(319,747 bytes). 스크립트 주석과 달리 CSV에 BOM은 없음(무해) |
| 26 | 백엔드 빌드 `nest build` | API | `cd backend && npm run build` | PASS | 에러 0. staged된 tsconfig 변경(baseUrl 제거) 상태로도 정상 |
| 27 | 백엔드 전체 기동(`node dist/main.js`) | API | `PORT=3101 node dist/main.js` (PowerShell, 로그 파일 캡처) | 환경없음 | (a) `.env` 없이: TypeORM 이전에 **`OAuth2Strategy requires a clientID option`** 으로 즉사(KakaoStrategy). (b) OAuth 더미값 넣으면 `Unable to connect to the database. Retrying (1)…(9)` `ECONNREFUSED ::1:5432` 후 27초 만에 종료. 5432 TCP 직접 연결도 ECONNREFUSED(4ms) |
| 28 | JWT 가드(`/api/subway/arrival|congestion|position`) | 인증 | 3100포트 단독 앱(SubwayService는 스텁으로 교체, 외부 API 호출 없음) | PASS | 토큰 없음/형식 오류/다른 시크릿/만료 토큰 → 401, 유효 토큰 → 200. `seat-prediction`은 가드 없음 확인 |
| 29 | CORS(5173 허용, credentials) | API | 동일 앱에 `Origin` 헤더로 요청 | PASS | `access-control-allow-origin: http://localhost:5173`, `allow-credentials: true` |
| 30 | 실시간 도착정보 `GET /subway/arrival` (서울 열린데이터) | API | 코드 검토 | 환경없음 | `SEOUL_API_KEY` 필요. 키 없으면 URL에 `undefined`가 들어간 채 외부 호출 → 외부 호출은 하지 않음 |
| 31 | 실시간 혼잡도 `GET /subway/congestion` (TAGO) | API | 코드 검토 | 환경없음 | `TAGO_API_KEY` 필요. 프론트에서 호출하는 곳 없음(미사용 엔드포인트) |
| 32 | 실시간 열차위치 `GET /subway/position` | API | 코드 검토 | 환경없음 | 위와 동일, 프론트 미사용 |
| 33 | 이메일 회원가입 `POST /auth/register` | 인증 | 코드 검토 | 환경없음 | bcrypt 해시 후 저장, 이메일 중복(23505)→409. **DTO 클래스가 없어 ValidationPipe가 아무것도 검증하지 않음**(빈 body도 통과 → DB 제약에서만 걸림) |
| 34 | 이메일 로그인 `POST /auth/login` → JWT(30일) | 인증 | 코드 검토 + JWT 발급/검증은 #28에서 실증 | 환경없음 | 비활성 계정·비번 불일치 401 처리 있음 |
| 35 | 카카오 OAuth(`/auth/kakao` → callback → `FRONTEND_URL?token=`) | 인증 | 코드 검토 | 환경없음 | 카카오 앱 키·콜백 등록 + DB 필요. `FRONTEND_URL` 미설정 시 `undefined?token=…`으로 리다이렉트 |
| 36 | 네이버 OAuth | 인증 | 코드 검토 | 환경없음 | 동일 |
| 37 | 구글 OAuth | 인증 | 코드 검토 | 환경없음 | 동일(scope email·profile) |
| 38 | OAuth 토큰 수신(프론트 `?token=` → localStorage → 메인) / 로그아웃 | UI | 코드 검토(App.jsx useEffect) | PASS | 토큰 저장 후 URL 정리(`replaceState`), 재방문 시 토큰 있으면 메인. 로그아웃은 토큰 삭제+온보딩 복귀. 브라우저에서 `localStorage.setItem('token','x')`로 백엔드 없이도 메인 진입 가능 |

추가로 확인한 인프라 항목(표 밖): `docker-compose.yml`은 `build: ./backend`, `build: .`을 참조하지만 **두 Dockerfile 모두 없음** → docker가 있어도 `docker compose up` 실패(버그 B8).

집계: PASS 25 (#1~15, 17~20, 24~26, 28, 29, 38) / FAIL 4 (#16, 21, 22, 23) / 환경없음 9 (#27, 30~37). 표에 행으로 잡지 않은 UI·인프라 결함(B5~B8)은 아래 버그 목록에만 기재.

## 발견한 버그·문제 (재현법 포함)

### B1. [모델·데이터] 2호선 성수·신도림이 지선 승강장 코드(9002/9003)로 덮어써져 위치·방향·혼잡도가 모두 틀림
- 원인: CSV에 `성수`가 211(본선)과 9002(성수지선 승강장), `신도림`이 234와 9003으로 **같은 역명이 두 번** 들어 있음. `build-congestion-model.mjs`의 `lines[line].stations[station] = code` / `data[station][direction][day] = values`가 나중 행으로 덮어써서, 본선 성수(211)·신도림(234)가 순서표에서 사라지고 맨 끝(9002/9003)에 붙음. 9002 성수의 내선·9003 신도림의 외선은 전부 0 시계열.
- 재현:
  ```
  cd backend && node -e "const {predictSeat}=require('./dist/subway/seat-model.js');console.log(JSON.stringify(predictSeat('2호선','성수','건대입구','평일','08:00',5)))"
  → direction:"외선"(정답 내선), journey: 성수E > 까치산 > 용두 > 신정네거리 > 양천구청
  node -e "...predictSeat('2호선','신도림','문래','평일','08:00',3)"  → congestion:0, pSitNow:0.998
  node -e "...predictSeat('2호선','뚝섬','성수','평일','08:00',3)"    → journey 첫 역이 건대입구(성수 건너뜀)
  ```
- 영향: 앱에서 2호선 성수·신도림(둘 다 대형 환승역)을 고르면 실데이터 카드가 뜨지만 값이 엉터리. 뚝섬/건대입구/대림/문래에서 출발해도 성수·신도림 구간이 빠짐.
- 같은 뿌리: 6호선 `응암S`(9006), 5호선 `강동(마천)`(9005)도 9000번대 특수 코드.

### B2. [모델·데이터] 역번호 정렬로 노선 순서를 만들어 신설·재배번 역이 엉뚱한 위치에 놓임
- 1호선 `동묘앞`=159 → 청량리(158) 뒤에 배치. 8호선 `남위례`=2828 → 모란(2827) 뒤에 배치(실제로는 복정–산성 사이). 2호선 지선(용답 244~까치산 260)도 충정로(243) 뒤에 본선처럼 이어짐.
- 재현: `predictSeat('1호선','동대문','동묘앞','평일','08:00',5)` → journey `신설동 > 제기동 > 청량리 > 동묘앞`. `predictSeat('8호선','남위례','산성','평일','08:00',3)` → 모란 방향으로 진행.
- 대안: 코드 정렬 대신 프론트 `SUBWAY_LINES` 순서를 기준으로 하거나, 노선별 순서 오버라이드 표를 두는 편이 안전.

### B3. [모델·데이터] 5호선 강동역 하선(마천·하남 방향) 예측 불가
- CSV에 `강동`(2549, 상선만), `강동(하남검단산)`(2549, 하선만), `강동(마천)`(9005, 하선만)로 쪼개져 있고, 순서표에 `강동`과 `강동(하남검단산)`이 **같은 코드로 둘 다** 들어감. 앱의 "강동"은 `강동` 항목에 매칭 → 하선 시계열이 없어 `supported:false`.
- 재현: `predictSeat('5호선','강동','길동','평일','08:00',3)` → `강동역 하선 데이터가 없습니다.` (`'강동','천호'`는 상선이라 정상)

### B4. [API] `time=25:99` 같은 비정상 시각이 200으로 통과
- `prediction.controller.ts:22`의 검사가 형식만 봄. `slotPos`가 범위를 클램프해 00:30 슬롯 값으로 조용히 응답(혼잡 5.9%, 착석 99.5%).
- 재현: `GET /api/subway/seat-prediction?line=2호선&station=강남&next=역삼&time=25:99&stops=1`

### B5. [UI] 백엔드가 죽어 있어도 "이 노선·역은 혼잡도 실데이터 미지원(1~8호선만)"이라고 표시
- `prediction.js`가 네트워크 오류와 `supported:false`를 구분 없이 `null`로 접어서, MainScreen(`MainScreen.jsx:149`)이 2호선 강남에서도 "미지원"이라고 안내. 현재 이 PC처럼 3000번을 다른 앱이 점유하면 항상 이 문구가 뜸.
- 재현: 5173에서 `localStorage.setItem('token','x')` → 새로고침 → 2호선 → 강남 → "역삼 방향" 클릭.

### B6. [UI·개인정보 고지 불일치] 회원가입 2단계에 "생년월일은 서버에 저장되지 않습니다"라고 쓰여 있지만 실제로는 저장됨
- `SignupScreen.jsx:60` 문구 vs `SignupScreen.jsx:120`에서 `birthDate`를 전송, `user.entity.ts:22` `birthDate` 컬럼에 저장. 바로 아래 동의 문구에는 "수집 항목: … 생년월일"이라고 적혀 있어 화면 안에서도 모순.

### B7. [UI 문구] 존 개수 표기 불일치
- 실제 존은 3개/6개(`ZONES_3`/`ZONES_6`)인데 화면은 "4존 기본 / 8존 프리미엄 / 🔒 8존 보기"(`ZoneScreen.jsx:72,80`).

### B8. [인프라] `docker-compose.yml`이 참조하는 `backend/Dockerfile`, 루트 `Dockerfile`이 없음
- `docker compose up` 시 backend/frontend 서비스 빌드 실패. README의 실행 방법에도 docker 절차는 없음.

### 그 외 관찰(경미)
- `src/api.js`의 `API_URL`이 `http://localhost:3000/api` 하드코딩(환경변수 없음). 이 PC는 3000을 **yeonae-ai(Next.js)** 가 쓰고 있어 온보딩의 소셜 버튼을 누르면 그 앱의 400 페이지로 이동하고, 이메일 로그인은 그 앱의 `/api/auth/login` 400 JSON을 에러로 표시함.
- `.env` 없이 백엔드를 켜면 DB 에러가 아니라 `OAuth2Strategy requires a clientID option`이 먼저 나서 원인 파악이 어려움(카카오/네이버/구글 키 3종 + `JWT_SECRET`이 사실상 필수).
- `RewardFlowScreen` 하차역 목록은 선택한 방향과 무관하게 "노선 순서상 뒤쪽 역"만 보여줌(이전 역 방향으로 탈 때 목록이 틀림). ZoneScreen 데모 모드의 대상역 이름은 노선과 무관하게 2호선 `STATIONS` 상수(삼성 등)를 씀.
- 프론트 노선 데이터에 중복 역명: 경의·중앙선 `능곡`, 김포골드라인 `마산`(+`걸포북변`/`걸포` 혼재), 의정부경전철 `새말`·`탑석`. React key 중복 경고 + `indexOf`가 첫 번째만 잡아 두 번째 항목의 방향 버튼이 어긋남.
- `/api/auth/register`는 DTO 없이 인라인 타입이라 `ValidationPipe`가 사실상 무효. OAuth 사용자의 이메일이 기존 이메일 계정과 겹치면 `createOAuthUser`에서 23505를 안 잡아 500.
- 프론트가 호출하는 백엔드 엔드포인트는 `seat-prediction`, `auth/login`, `auth/register`, OAuth 진입 3개뿐. `/subway/arrival|congestion|position`은 프론트 미사용.

## 브라우저에서 직접 눌러봐야 할 UI 시나리오 (백엔드 없이 가능)

1. **회원가입 폼 검증**: 온보딩 → "이메일로 시작하기" → "회원가입" → 이름/이메일 입력, 비밀번호 7자 입력 → 빨간 "8자 이상 입력해주세요" + "다음" 비활성(반투명) → 8자 입력 → "다음" 활성 → 2단계에서 전화번호 `01012345678` 입력 → 자동으로 `010-1234-5678` → 생년월일에 7자리 입력 → 6자리에서 잘림 → 성별 미선택/동의 미체크면 "가입 완료" 반투명, 모두 채우면 활성(클릭하면 3000 호출 실패 에러 문구 표시).
2. **백엔드 없는 메인 진입 + 폴백 문구**: 개발자도구 콘솔 `localStorage.setItem('token','x')` → 새로고침 → 바로 "노선 선택" 화면 → 2호선 → 강남역 → "← 교대 방향"/"역삼 방향 →" 두 버튼 중 하나 클릭 → 선택 버튼 보라색 하이라이트 + 아래에 "이 노선·역은 혼잡도 실데이터 미지원(1~8호선만) — 아래 확률은 데모 값입니다"(B5 확인) + 목업 열차 2건 + 10칸 확률 카드.
3. **객차 상세·슬라이더·프리미엄 토글**: 위 화면에서 3호차(71%) 카드 클릭 → "3호차 상세", 배지 "데모 데이터", 존 A/B/C 55/72/68 → 슬라이더 1→8 이동 시 큰 숫자 66→61→…→31, 존 값도 4%씩 감소(최소 10) → 존 클릭 시 테두리·하단 버튼 동시 하이라이트 → "🔒 8존 보기" 클릭 → 6칸(A-1~C-2)로 바뀌고 버튼이 "⭐ 프리미엄"(제목은 "8존 프리미엄" — B7).
4. **착석 리워드 플로우 → 포인트 반영**: 상세 화면 "🪑 좌석에 앉았어요"(방향 미선택 시 반투명·클릭 불가) → 1/4 "네, 앉았어요!" → 2/4 6존 중 하나 선택 후 "다음" → 3/4 드롭다운(강남 이후 역만: 역삼, 선릉… 표시) 선택 → "제출하기" → 4/4 "+1 포인트 적립!", 보유 1P → 하단 "리워드" 탭 → 1P, 진행바 1/3, "2P 남음". 같은 플로우 3회 반복하면 "⭐ 프리미엄 1일 사용하기" 버튼 등장 → 클릭 시 "이용 중" 배지.
5. **미선택 상태의 좌석 탭 + 로그아웃**: 하단 "좌석" 탭을 노선 선택 전에 클릭 → 노란 경고 "호선과 탑승역을 먼저 선택해주세요" / "탑승 방향을 먼저 선택해주세요" 2줄 + 버튼 비활성 → "홈" → 우상단 "로그아웃" → 온보딩으로 복귀, `localStorage.token` 삭제됨(새로고침해도 온보딩 유지).

## 환경 한계 (DB 필요 기능 목록과, 로컬에서 돌리려면 뭐가 필요한지)

**DB(PostgreSQL)가 있어야 동작하는 기능**
- 백엔드 전체 기동(`AppModule`이 `TypeOrmModule.forRoot`로 5432에 연결, 실패 시 10회 재시도 후 종료 — 실측 27초)
- `POST /api/auth/register`, `POST /api/auth/login`, JWT 발급(사용자 조회 필요)
- 카카오/네이버/구글 OAuth 콜백(`findByProvider`/`createOAuthUser`)
- 사용자 포인트 저장(`addPoints` — 현재 프론트는 포인트를 로컬 state로만 관리하고 이 API를 호출하는 곳은 없음)

**DB 없이도 실제로 돌려본 것**: 예측 API(컨트롤러 단독 기동), 모델 함수, 모델 빌드 스크립트, JWT 가드(시크릿만 있으면 됨), 프론트 빌드·렌더.

**로컬에서 전부 돌리려면**
1. PostgreSQL 16 — `docker compose up db`(docker 설치 필요; 현재 없음) 또는 Windows용 Postgres 설치 후 `easit/easit1234/easit` DB 생성. `synchronize: true`라 테이블은 자동 생성.
2. 레포 루트 `.env` — `.env.example` 복사. **최소 필수**: `JWT_SECRET`, `KAKAO_REST_API_KEY`, `KAKAO_CALLBACK_URL`, `NAVER_CLIENT_ID/SECRET/CALLBACK_URL`, `GOOGLE_CLIENT_ID/SECRET/CALLBACK_URL`(값이 비면 부팅 자체가 실패), `FRONTEND_URL`. 선택: `SEOUL_API_KEY`, `TAGO_API_KEY`(실시간 3개 엔드포인트, 프론트 미사용).
3. OAuth 실사용은 각 개발자 콘솔에 앱 등록 + 콜백 URL(`http://localhost:3000/api/auth/{kakao|naver|google}/callback`) 등록 필요.
4. **3000번 포트 비우기** — 프론트 `API_URL`이 3000 고정. 지금 이 PC는 3000을 yeonae-ai(Next.js)가 사용 중이므로 그 앱을 내리거나 `src/api.js`를 바꿔야 함.
5. 그 다음 `cd backend && npm run start:dev`, 프론트는 이미 5173에 떠 있음.
