# Histarix

세계 지도 기반 인터랙티브 역사 학습 플랫폼

---

## 1. 프로젝트 개요

Histarix는 세계 지도를 인터랙티브 인터페이스로 활용하여, 사용자가 시간과 공간을 자유롭게 탐색하며 세계 각국의 역사를 몰입감 있게 학습할 수 있는 차세대 역사 교육 플랫폼입니다.

### 핵심 가치

| 키워드 | 설명 |
|--------|------|
| **탐색 (Explore)** | 시간 슬라이더로 시대별 지도 변화를 실시간 확인 |
| **발견 (Discover)** | AI가 추천하는 역사적 연결고리와 숨겨진 이야기 |
| **학습 (Learn)** | 구조화된 콘텐츠와 퀴즈로 지식 체계화 |
| **공유 (Share)** | 커뮤니티 기반 토론과 협업 학습 |

### 기본 정보

| 항목 | 내용 |
|------|------|
| 서비스 유형 | SaaS 웹 플랫폼 (B2C / B2B2C) |
| 타겟 플랫폼 | 웹 및 모바일 웹 (향후 네이티브 앱 확장) |
| 주요 타겟 | 역사 애호가, 학생(10~20대), 교육기관, 일반 학습자 |
| 수익 모델 | Freemium + 프리미엄 구독 + 교육기관 B2B 라이선스 |
| MVP 목표 | 2026년 Q4 |
| 정식 출시 | 2027년 Q2 |

---

## 2. 기술 스택

### Frontend

| 기술 | 용도 |
|------|------|
| Next.js 15 (App Router) | SSR/SSG 하이브리드 렌더링, SEO 최적화 |
| TypeScript | 타입 안전성 |
| Tailwind CSS v4 | 유틸리티 기반 스타일링 |
| Mapbox GL JS | WebGL 기반 인터랙티브 세계 지도 |
| Supabase Auth | 소셜 로그인 / 이메일 인증 |
| PostHog | 사용자 행동 분석 |

### Backend

| 기술 | 용도 |
|------|------|
| FastAPI (Python) | 비동기 고성능 REST API |
| httpx | 외부 API 비동기 호출 |
| Pydantic v2 | 데이터 검증 / 스키마 |
| cachetools (TTLCache) | 인메모리 API 응답 캐싱 |

### 외부 API

| API | 제공기관 | 용도 | 비용 |
|-----|----------|------|------|
| Mapbox GL JS | Mapbox | 인터랙티브 세계 지도 렌더링 | 무료 50K뷰/월 |
| Natural Earth Data | 커뮤니티 | 국경선/지형 GeoJSON | 완전 무료 |
| Wikidata SPARQL | Wikimedia | 역사 사건/인물 구조화 데이터 | 완전 무료 (CC0) |
| Wikipedia REST API | Wikimedia | 역사 문서 본문 추출 | 완전 무료 (CC BY-SA) |
| Wikimedia On This Day | Wikimedia | 오늘의 역사 사건/인물 | 완전 무료 |
| REST Countries | 커뮤니티 | 250+ 국가 기본 정보 | 완전 무료 |
| Europeana API | EU | 유럽 5천만+ 문화유산 데이터 | 무료 (키 필요) |
| The Met Collection API | 메트로폴리탄 미술관 | 47만+ 예술품 데이터/이미지 | 완전 무료 (CC0) |
| Claude API | Anthropic | AI 역사 가이드 챗봇 | 유료 (종량제) |
| Supabase Auth | Supabase | 사용자 인증 | 무료 50K MAU |
| Stripe API | Stripe | 구독 결제 | 거래당 수수료 |
| PostHog | PostHog | 사용자 행동 분석 | 무료 100만 이벤트/월 |
| Sentry | Sentry | 에러 추적/모니터링 | 무료 5K 이벤트/월 |

---

## 3. 프로젝트 구조

```
histarix/
├── Histarix_기획서.docx          # 프로젝트 기획서
├── HISTOMAP_OpenAPI_가이드.xlsx   # API 가이드 문서
├── package.json                  # 루트 워크스페이스
├── Makefile                      # 개발 명령어
│
├── frontend/                     # Next.js 15 (App Router)
│   ├── package.json
│   ├── next.config.ts
│   ├── tsconfig.json
│   ├── postcss.config.mjs
│   ├── .env.local.example
│   └── src/
│       ├── app/
│       │   ├── layout.tsx         # 루트 레이아웃 (다크 테마)
│       │   ├── page.tsx           # 메인 SPA (지도 + 패널 조합)
│       │   ├── globals.css        # Tailwind + Mapbox CSS
│       │   ├── providers.tsx      # PostHog 프로바이더
│       │   └── auth/
│       │       ├── login/page.tsx # 로그인 페이지
│       │       └── callback/route.ts # OAuth 콜백
│       ├── components/
│       │   ├── map/
│       │   │   ├── WorldMap.tsx   # Mapbox GL JS 지도 (핵심 컴포넌트)
│       │   │   └── MapControls.tsx
│       │   ├── country/
│       │   │   ├── CountryPanel.tsx    # 슬라이드 패널 (정보/역사/타임라인 탭)
│       │   │   ├── CountryInfo.tsx     # 국가 기본 정보
│       │   │   ├── CountryHistory.tsx  # 위키피디아 요약 + 사건 목록
│       │   │   └── HistoryTimeline.tsx # 수직 타임라인 시각화
│       │   ├── timeline/
│       │   │   ├── TimeSlider.tsx      # 시간 슬라이더 (BC 3000 ~ AD 2026)
│       │   │   └── TimeDisplay.tsx     # 연도 포맷 헬퍼
│       │   ├── onthisday/
│       │   │   └── OnThisDay.tsx       # 오늘의 역사 위젯
│       │   ├── layout/
│       │   │   ├── Header.tsx          # 헤더 (로고, 검색, 로그인)
│       │   │   └── SearchBar.tsx       # 국가 검색 (디바운스)
│       │   └── auth/
│       │       └── AuthButton.tsx
│       ├── hooks/
│       │   ├── useCountryData.ts  # 국가 데이터 패칭
│       │   ├── useOnThisDay.ts    # 오늘의 역사 패칭
│       │   └── useTimeSlider.ts   # 시간 슬라이더 상태
│       ├── services/
│       │   ├── countryService.ts  # 국가 API 호출
│       │   └── onThisDayService.ts
│       ├── lib/
│       │   ├── api.ts             # API 클라이언트
│       │   ├── posthog.ts         # PostHog 초기화
│       │   └── supabase/
│       │       ├── client.ts      # 브라우저 클라이언트
│       │       └── server.ts      # 서버 클라이언트
│       └── types/
│           ├── country.ts
│           ├── history.ts
│           └── map.ts
│
└── backend/                       # FastAPI
    ├── pyproject.toml
    ├── requirements.txt
    ├── .env.example
    └── app/
        ├── main.py                # FastAPI 앱 (CORS, 라이프사이클)
        ├── config.py              # Pydantic Settings
        ├── cache.py               # TTLCache (국가 24h, 이벤트 1h, 오늘의역사 6h)
        ├── routers/
        │   ├── countries.py       # /api/countries/{code}, /search, /{code}/history
        │   ├── history.py         # /api/history/events
        │   ├── onthisday.py       # /api/onthisday, /{month}/{day}
        │   └── search.py          # /api/search
        ├── services/
        │   ├── rest_countries.py   # REST Countries API 클라이언트
        │   ├── wikipedia.py        # Wikipedia REST API 클라이언트
        │   ├── wikidata.py         # Wikidata SPARQL 쿼리
        │   └── wikimedia.py        # Wikimedia On This Day API
        ├── schemas/
        │   ├── country.py          # CountryInfo, CountryBasic
        │   ├── history.py          # HistoricalEvent, CountryHistory
        │   └── onthisday.py        # OnThisDayEvent, OnThisDayResponse
        ├── utils/
        │   └── country_mapping.py  # ISO → Wikidata QID 매핑 (65개국)
        └── tests/
            ├── conftest.py
            └── test_health.py
```

---

## 4. 핵심 기능 (MVP)

### 4.1 인터랙티브 세계 지도

- Mapbox GL JS 기반 다크 테마 세계 지도
- 국가 호버 시 하이라이트, 클릭 시 상세 패널 오픈
- 줌 인/아웃 컨트롤

### 4.2 국가 상세 패널

3개 탭으로 구성된 슬라이드 패널:

- **정보 탭**: 국기, 공식명, 수도, 인구, 면적, 지역, 언어, 통화 (REST Countries API)
- **역사 탭**: 위키피디아 요약 + Wikidata 역사 사건 목록 (연도 배지 + 설명)
- **타임라인 탭**: 수직 타임라인 시각화

### 4.3 시간 슬라이더

- BC 3000 ~ AD 2026 범위
- 재생/일시정지 버튼으로 자동 시대 이동
- 음수 연도는 "BC XXXX" 형식 표시

### 4.4 오늘의 역사

- 왼쪽 하단 플로팅 카드
- 접기/펼치기 가능
- Wikimedia On This Day API 기반 오늘 날짜의 역사 사건

### 4.5 국가 검색

- 헤더 중앙 검색바
- 300ms 디바운스 입력
- 드롭다운 결과 → 선택 시 지도 이동 + 패널 오픈

### 4.6 사용자 인증

- Supabase Auth 기반
- Google OAuth + 이메일 로그인

---

## 5. API 엔드포인트

### Backend REST API

| Method | Endpoint | 설명 | 데이터 소스 |
|--------|----------|------|-------------|
| GET | `/api/health` | 헬스 체크 | - |
| GET | `/api/countries/search?q=` | 국가 검색 | REST Countries |
| GET | `/api/countries/{iso_code}` | 국가 상세 정보 | REST Countries + Wikipedia |
| GET | `/api/countries/{iso_code}/history` | 국가 역사 이벤트 | Wikidata SPARQL |
| GET | `/api/history/events?country=&year_from=&year_to=` | 역사 사건 필터 | Wikidata |
| GET | `/api/onthisday` | 오늘의 역사 | Wikimedia On This Day |
| GET | `/api/onthisday/{month}/{day}` | 특정일 역사 | Wikimedia On This Day |
| GET | `/api/search?q=` | 통합 검색 | REST Countries |

### 데이터 흐름

```
사용자 → 국가 클릭 → iso_code 추출
  → Frontend Hook (useCountryData)
    → GET /api/countries/{code}
      → FastAPI Router
        → [캐시 확인] → 히트: 즉시 반환
        → [캐시 미스] → 병렬 호출:
          1. REST Countries API (국가 기본 정보)
          2. Wikipedia REST API (요약 + 썸네일)
        → 응답 병합 → 캐시 저장 → JSON 반환
    → GET /api/countries/{code}/history
      → ISO → Wikidata QID 매핑
      → SPARQL 쿼리 실행
      → 역사 이벤트 파싱 → 반환
  → UI 렌더링 (CountryPanel)
```

---

## 6. 캐싱 전략

| 캐시 | TTL | 최대 항목 | 용도 |
|------|-----|----------|------|
| country_cache | 24시간 | 500 | 국가 기본 정보 (변경 빈도 낮음) |
| event_cache | 1시간 | 1,000 | 역사 이벤트 (SPARQL 쿼리 결과) |
| onthisday_cache | 6시간 | 400 | 오늘의 역사 (일별 변경) |

---

## 7. 환경 변수

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxx        # Mapbox 액세스 토큰 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (`backend/.env`)

```env
ALLOWED_ORIGINS=http://localhost:3000
WIKIPEDIA_USER_AGENT=Histarix/1.0 (contact@histarix.com)
```

---

## 8. 실행 방법

### 사전 요구사항

- Node.js 20+
- Python 3.11+
- Mapbox 계정 + Access Token

### Frontend

```bash
cd frontend
cp .env.local.example .env.local
# .env.local에 Mapbox 토큰 등 설정
npm install
npm run dev          # http://localhost:3000
```

### Backend

```bash
cd backend
cp .env.example .env
pip install -e ".[dev]"
uvicorn app.main:app --reload --port 8000
```

### 전체 동시 실행

```bash
make install         # 의존성 설치
make dev             # 프론트엔드 + 백엔드 동시 실행
```

---

## 9. 보안 조치

| 영역 | 조치 |
|------|------|
| SPARQL Injection | Wikidata QID 정규식 검증 (`Q\d+` 패턴만 허용) |
| URL Path Traversal | ISO 코드 정규식 검증 (`[A-Z]{2,3}`), Wikipedia 경로 URL 인코딩 |
| Open Redirect | OAuth 콜백 `next` 파라미터 검증 (`/`로 시작, `//` 불허) |
| CORS | 허용 origin 설정 기반 제한 |
| 입력 검증 | month(1-12), day(1-31) 범위 제한 |
| 시크릿 관리 | `.env` 파일 gitignore 처리, 클라이언트에 민감 키 미노출 |

---

## 10. 로드맵

### MVP (현재 구현)

- [x] 인터랙티브 세계 지도 (Mapbox GL JS)
- [x] 국가 클릭 → 상세 정보 패널
- [x] 국가 역사 타임라인 (Wikidata SPARQL)
- [x] 오늘의 역사 위젯 (Wikimedia)
- [x] 시간 슬라이더 UI
- [x] 국가 검색
- [x] Supabase Auth 연동
- [x] PostHog 분석 연동
- [x] API 응답 캐싱

### Phase 2 (예정)

- [ ] 시간 슬라이더 실제 영토 변화 데이터 (역사 GeoJSON)
- [ ] AI 역사 가이드 챗봇 (Claude API + RAG)
- [ ] 역사 인물 카드
- [ ] 문화유산 갤러리 (Europeana + The Met API)
- [ ] 역사 퀴즈 시스템
- [ ] 구독 결제 (Stripe)

### Phase 3 (예정)

- [ ] AI 가상 역사 시뮬레이션 ("만약 ~했다면?")
- [ ] 전쟁 시뮬레이션 애니메이션
- [ ] 경제/무역 데이터 시각화 (World Bank API)
- [ ] 다국어 지원 (Google Translate / DeepL)
- [ ] 커뮤니티 토론 포럼
- [ ] 게이미피케이션 (퀴즈, 스탬프, 리더보드)

---

## 11. 수익 모델

| 플랜 | 요금 | 주요 기능 |
|------|------|----------|
| Free | 무료 | 지도 탐색, 기본 콘텐츠, AI 챗 3회/일 |
| Pro | ₩9,900/월 | 무제한 AI, 프리미엄 콘텐츠, 데일리 챌린지 |
| Edu | ₩49,000/월 | 학생 관리, 수업 자료 제작, 성적 분석 (교사 1인 + 40명) |
| Enterprise | 별도 협의 | SSO/LMS 연동, 커스텀 콘텐츠, 전담 매니저 |

---

## 12. API 비용 추정

### MVP 단계 (월)

| API | 비용 |
|-----|------|
| Mapbox (~20K loads) | ₩0 |
| Wikidata / Wikipedia / Wikimedia | ₩0 |
| Europeana / The Met / REST Countries | ₩0 |
| Supabase Auth (~1K MAU) | ₩0 |
| Claude API (~100K 토큰/일) | ~₩150,000 |
| Stripe (~100건) | ~₩30,000 |
| **합계** | **~₩180,000/월** |

### 정식 출시 (월)

| API | 비용 |
|-----|------|
| Mapbox (~500K loads) | ~₩250,000 |
| Claude API (~2M 토큰/일) | ~₩3,000,000 |
| PostHog (~5M 이벤트) | ~₩500,000 |
| Stripe (~5,000건) | ~₩1,500,000 |
| 기타 | ~₩330,000 |
| **합계** | **~₩5,580,000/월** |

---

## 13. 성능 목표

| 지표 | 목표값 |
|------|--------|
| 초기 로드 (FCP) | < 1.5초 |
| 지도 타일 로드 | < 200ms |
| 시간 슬라이더 응답 | < 100ms |
| API 응답 (p95) | < 300ms |
| AI 챗 응답 | < 3초 (Streaming) |
| 동시 접속 | 10,000+ |
| Uptime | 99.9% |

---

## 14. KPI

| KPI | M6 | M12 | M24 |
|-----|-----|------|------|
| MAU | 10K | 50K | 300K |
| DAU/MAU | 15% | 25% | 30% |
| 유료 전환율 | 2% | 3% | 5% |
| 평균 세션 | 5분 | 12분 | 18분 |
| 콘텐츠 커버리지 | 30개국 | 100개국 | 195개국 |
| NPS | 30+ | 40+ | 50+ |

---

## 라이선스

내부 프로젝트 - 비공개
