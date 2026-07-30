# Histarix Design System — MASTER

> 소스 오브 트루스. UI 코드는 이 문서의 토큰(CSS 변수)만 사용한다. raw hex 직접 사용 금지.
> 제품 축: 교육/콘텐츠 B2C · 몰입형 데이터 시각화 · 다크 단일 테마 · Next.js + Tailwind v4 + Three.js

## 1. 방향

세계 지도를 "밤하늘에 떠 있는 도트 지구본"으로 표현하는 미니멀 다크 디자인.
(참조: Framer 3D Globe 컴포넌트의 도트 매트릭스 룩 — 색상은 histarix 고유 팔레트로 치환)

- **시그니처**: 도트 매트릭스 3D 지구본 + primary 블루 대기(atmosphere) 림 글로우
- 대륙은 무채색에 가까운 뮤트 블루 도트, 선택된 국가만 흰색으로 점등 — 위계는 색으로만 표현
- 장식 최소화: 글로브가 유일한 주인공, 패널/위젯은 유리(blur) 위 타이포그래피

## 2. 색상 토큰 (다크 단일 테마)

모든 값은 `frontend/src/app/globals.css :root`에 선언되어 있으며, Three.js 재질 색상도
런타임에 `getComputedStyle`로 이 변수들을 읽는다.

### Surface / Text

| 토큰 | 값 | 용도 |
|---|---|---|
| `--surface` | `#070e1d` | 페이지 배경 |
| `--surface-container-low` | `#0b1323` | 카드 배경 (저) |
| `--surface-container` | `#11192b` | 카드/패널 배경 |
| `--surface-container-high` | `#161f33` | 부상 요소 |
| `--surface-container-highest` | `#1b263b` | 최상위 부상 요소 |
| `--on-surface` | `#dfe5fa` | 본문 텍스트 |
| `--on-surface-variant` | `#a4abbf` | 보조 텍스트 |
| `--outline` | `#6e7588` | 강한 테두리 |
| `--outline-variant` | `#414859` | 약한 테두리 |
| `--primary` | `#85adff` | 브랜드/액션/글로우 |
| `--primary-container` | `#6e9fff` | 채워진 액션 배경 |
| `--primary-dim` | `#699cff` | 눌림 상태 |
| `--error` | `#ff716c` | 오류 |

### Globe (신규 — 도트 지구본 전용)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--globe-ocean` | `#0a1425` | 구체(바다) 면 — 배경보다 한 단계 밝아 구가 물체로 읽힘 |
| `--globe-dot` | `#97a8cf` | 대륙 도트 기본 (뮤트 블루그레이) |
| `--globe-dot-hover` | `#c6d5ff` | 호버 국가 도트 |
| `--globe-dot-selected` | `#ffffff` | 선택 국가 도트 (최대 밝기 = 위계 정점) |
| `--globe-outline` | `rgba(133, 173, 255, 0.13)` | 국경선 |
| `--globe-graticule` | `rgba(133, 173, 255, 0.045)` | 경위선 그리드 |
| `--globe-marker` | `#85adff` | 랜드마크 글로우 마커 (primary 계열, 시안 금지) |
| `--globe-atmosphere` | `rgba(110, 159, 255, 0.22)` | 대기 림 글로우 (radial gradient 코어) |

### WCAG AA 대비 검증 (기준: 4.5:1 텍스트 / 3:1 UI)

| 전경 / 배경 | 대비 | 판정 |
|---|---|---|
| `#dfe5fa` on `#070e1d` | 15.4:1 | ✅ AAA |
| `#a4abbf` on `#070e1d` | 8.0:1 | ✅ AAA |
| `#85adff` on `#070e1d` | 7.6:1 | ✅ AAA |
| `#dfe5fa` on `#11192b` | 13.5:1 | ✅ AAA |
| `#a4abbf` on `#1b263b` | 6.0:1 | ✅ AA |
| `#ffffff` on `#0a1425` (선택 도트) | 18.9:1 | ✅ (그래픽) |
| `#97a8cf` on `#0a1425` (기본 도트) | 7.6:1 | ✅ (그래픽) |

## 3. 타이포그래피

| 역할 | 폰트 | 웨이트 | 용례 |
|---|---|---|---|
| Display/Headline | `var(--font-headline)` Space Grotesk | 600–700 | 로고, 패널 제목, 랜드마크명 |
| Body | `var(--font-body)` Plus Jakarta Sans | 400–600 | 본문, 라벨, 버튼 |

- letter-spacing: 헤드라인 `-0.02em`, 본문 기본값
- 크기 스케일: 11 / 12(0.75rem) / 14(0.875rem) / 15 / 18 / 20 / 24px

## 4. 간격 · 형태 · 그림자

- **간격**: 4pt 리듬 (4/8/12/16/20/24/32…), Tailwind 스케일 사용
- **radius**: 버튼·컨트롤 `rounded-lg`(8) ~ `rounded-xl`(12), 카드 `rounded-xl`~`14px`, 팝업 카드 14px
- **blur 유리 패널**: `backdrop-blur-md`~`xl` + 반투명 surface + `ring-1 ring-[var(--outline-variant)]/30`
- **그림자**: 부상 카드 `0 16px 40px rgba(0,0,0,0.5)` + primary 글로우 `0 0 20px rgba(133,173,255,0.05)`

## 5. 모션

| 용례 | 값 |
|---|---|
| 마이크로 인터랙션 (hover 등) | 150–200ms ease |
| 글로브 flyTo (국가 포커스) | 1600ms cubic ease-in-out |
| 글로브 자동 회전 | ~0.05 rad/s, 호버 시 감속 정지 |
| 랜드마크 등장 | 기존 `monument-emerge` 1.2s cubic-bezier(0.22,1,0.36,1) |
| **reduced motion** | `prefers-reduced-motion` 시 자동 회전 정지, 등장 애니메이션 즉시 완료 |

## 6. 컴포넌트 가이드 — DotGlobe

- 구성: 바다 구체(`--globe-ocean`) + 대륙 도트 Points(`--globe-dot`) + 국경 LineSegments(`--globe-outline`) + 경위선(`--globe-graticule`) + 대기 스프라이트(`--globe-atmosphere`)
- 상호작용: 드래그 회전(관성 없음, pitch ±75° 클램프), 호버 국가 도트 점등 + `cursor: pointer`, 클릭 선택/재클릭 해제, 자동 회전은 유휴 상태에서만
- 선택 시: 해당 국가가 카메라 정면으로 회전 + 줌인(flyTo) → 랜드마크 글로우 마커 + 사진 카드(DOM 오버레이, 3D→2D 투영 추적)
- Three.js 색상은 반드시 CSS 변수를 `getComputedStyle`로 읽어 주입 (하드코딩 금지)
- 줌 범위: 카메라 거리 1.35–4.6 (globe 반지름 1), 기본 3.35 / 포커스 1.85

## 7. Anti-patterns (금기)

- ❌ raw hex를 컴포넌트에 직접 쓰기 (토큰 변수만; Three.js도 변수 해석 경유)
- ❌ 이모지를 구조 아이콘으로 사용 (인라인 SVG — Feather/Lucide 스타일만)
- ❌ 글로브 도트에 시안(`#00f7ff`) 등 팔레트 외 색 도입 — 액센트는 primary 계열 단일
- ❌ 터치 타겟 44×44pt 미만의 신규 컨트롤
- ❌ 글로브 위 과도한 장식(별, 파티클, 아크 등) — 시그니처는 도트 지구본 하나로 충분
- ❌ 라이트 테마 변형 추가 (다크 단일 테마 제품)
- ❌ interactive 요소에 `aria-label`/포커스 링 생략
