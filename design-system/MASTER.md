# Histarix Design System — MASTER

> 소스 오브 트루스. UI 코드는 이 문서의 토큰(CSS 변수)만 사용한다. raw hex 직접 사용 금지.
> 제품 축: 교육/콘텐츠 B2C · 몰입형 지도 시각화 · **라이트 단일 테마** · Next.js + Tailwind v4 + Three.js

## 1. 방향 — "모던 아틀라스"

종이 지도의 품격을 가진 화이트 스테이지 위, 국가별로 채색된 도트 지구본.

- **시그니처**: 6색 뮤트 팔레트로 채색된 도트 대륙 + 잉크 국경선 + 은은한 블루 대기 글로우
- 국가 구분은 ①팔레트 색(인접국 상이 보장) ②잉크 국경선 ③호버 점등 — 삼중 인코딩
- 원색·고채도 금지. 우아함은 채도가 아니라 톤의 통일과 여백에서 나온다
- UI 크롬은 화이트 유리(blur) + 네이비 잉크 타이포 — 지구본이 유일한 색의 주인공

## 2. 색상 토큰 (라이트 단일 테마)

모든 값은 `frontend/src/app/globals.css :root`에 선언. Three.js 재질도 `getComputedStyle`로 읽는다.

### Surface / Ink

| 토큰 | 값 | 용도 |
|---|---|---|
| `--surface` | `#f4f6fb` | 페이지 배경 (쿨 페이퍼) |
| `--surface-container-low` | `#ffffff` | 카드 배경 |
| `--surface-container` | `#ffffff` | 패널 배경 |
| `--surface-container-high` | `#eaeef7` | 부상 요소 / 스켈레톤 |
| `--surface-container-highest` | `#e1e7f3` | 최상위 부상 / 눌림 배경 |
| `--on-surface` | `#1b2540` | 본문 (네이비 잉크) |
| `--on-surface-variant` | `#5b6478` | 보조 텍스트 |
| `--outline` | `#8b93a8` | 강한 테두리 |
| `--outline-variant` | `#d5dae8` | 약한 테두리 / 디바이더 |
| `--primary` | `#3c66e4` | 브랜드/액션 |
| `--primary-container` | `#2f55c8` | 그라디언트 딥 엔드 / 눌림 |
| `--primary-dim` | `#5379e9` | 보조 액션 |
| `--error` | `#c53a33` | 오류 |

### Globe (라이트)

| 토큰 | 값 | 용도 |
|---|---|---|
| `--globe-ocean` | `#e9eef7` | 구체(바다) — 페이지보다 한 단계 깊어 구가 물체로 읽힘 |
| `--globe-outline` | `rgba(27,37,64,0.32)` | **잉크 국경선** — 국가 구별의 1차 구조 |
| `--globe-graticule` | `rgba(27,37,64,0.055)` | 경위선 |
| `--globe-marker` | `#3c66e4` | 랜드마크 글로우 |
| `--globe-atmosphere` | `rgba(76,118,235,0.20)` | 대기 림 |

### 국가 팔레트 — 6슬롯 (dataviz 6종 검사 PASS, surface `#e9eef7`)

| 슬롯 | 색 | 값 |
|---|---|---|
| 1 | blue | `#4a72c4` |
| 2 | amber | `#b5772a` |
| 3 | teal | `#1b9884` |
| 4 | berry | `#a84a6f` |
| 5 | green | `#6f8d38` |
| 6 | violet | `#654bb8` |

**배정 규칙**: 공유 정점 기반 인접 그래프에서 그리디 컬러링 — 이웃 국가와 같은 슬롯 금지,
가능한 슬롯 중 이웃과의 최소 ΔE(worst-case CVD 포함)를 최대화하는 슬롯 선택.
약한 페어(amber↔green 2.9, teal↔berry 6.3)는 배정기가 실이웃에서 자동 회피.
**상태 파생 규칙**: hover = 기본색 HSL l−0.10 / s+0.05, selected = l−0.17 / s+0.08,
선택 시 나머지 국가는 ocean 방향 60% 디밍(포커스 효과).

### WCAG 대비 검증 (4.5:1 텍스트 / 3:1 UI)

| 전경 / 배경 | 대비 | 판정 |
|---|---|---|
| `#1b2540` on `#f4f6fb` | 13.9:1 | ✅ AAA |
| `#1b2540` on `#ffffff` | 15.2:1 | ✅ AAA |
| `#5b6478` on `#ffffff` | 5.9:1 | ✅ AA |
| `#3c66e4` on `#ffffff` | 5.0:1 | ✅ AA |
| `#ffffff` on `#3c66e4` | 5.0:1 | ✅ AA (버튼) |
| `#5b6478` on `#e1e7f3` | 4.8:1 | ✅ AA |
| 팔레트 6색 on `#e9eef7` | 2.7–4.4:1 | ✅ 그래픽 (잉크 국경선이 relief) |

## 3. 타이포그래피

| 역할 | 폰트 | 웨이트 |
|---|---|---|
| Display/Headline | Space Grotesk (`--font-headline`) | 600–700 |
| Body | Plus Jakarta Sans (`--font-body`) | 400–600 |

- 헤드라인 letter-spacing `-0.02em` · 크기 스케일 11/12/14/15/18/20/24px — 다크 시절과 동일

## 4. 간격 · 형태 · 그림자 (라이트)

- 간격 4pt 리듬, radius 8–14px — 기존과 동일
- **유리 패널**: `bg-[var(--surface-container)]/85` + `backdrop-blur-md~xl` + `ring-1 ring-[var(--outline-variant)]`
- **그림자 (라이트는 잉크 기반)**: 카드 `0 8px 24px rgba(27,37,64,0.10)`, 부상 `0 16px 40px rgba(27,37,64,0.16)` — 검은 그림자(`rgba(0,0,0,…)`) 금지, 잉크 틴트 사용

## 5. 모션

다크 시절과 동일 (flyTo 1600ms, 자동 회전 0.045rad/s, 랜드마크 monument-emerge, reduced-motion 존중).

## 6. 컴포넌트 가이드 — DotGlobe (라이트)

- 바다 `--globe-ocean` + 팔레트 채색 도트 + 잉크 국경선 + 경위선 + 대기 스프라이트
- 선택: 해당국 selected 파생색 + 타국 60% 디밍, 해제 시 전체 복원
- Three.js 색상은 CSS 변수 경유 (8자리 hex 파싱, sRGB 명시)

## 6.5 3D 랜드마크 (papercraft monuments)

- 국가 선택 시 해당 모델이 있으면 사진 카드 대신 **파라메트릭 3D 모뉴먼트**가 실좌표에 등장
- 스타일: 플랫 셰이딩 로우폴리 "페이퍼크래프트" — `monuments/materials.ts`의 뮤트 톤 키트만 사용, 텍스처/원색 금지, 삼각형 ≤2,500
- 규격: 단위 높이 1.0(+Y), 바닥 y=0, 풋프린트 ≤0.75 · 글로브 표시 높이 0.17 유닛
- 카메라: 착륙 후 **앵커 궤도 리그**(접평면 위 35° 고도각)로 블렌드 인/아웃, 리그 중 줌 버튼은 궤도 반경 조절
- 폴백 체인: 3D 모델 → (로드 실패/모델 없음) → 사진 카드. `landmark3d.ts`의 `loadLandmarkModel()` 계약 뒤로 향후 GLB 에셋이 동일하게 끼워짐
- 조명: Hemisphere + Directional은 모뉴먼트(Lambert)에만 작용 — 글로브의 Basic 계열은 무영향

## 7. Anti-patterns (금기)

- ❌ raw hex를 컴포넌트에 직접 쓰기 (토큰 변수만)
- ❌ 팔레트 6색 외 국가색 도입 · 원색/고채도(네온·순색) 사용
- ❌ 인접 국가 동일 슬롯 배정 (그리디 컬러링 우회 금지)
- ❌ 이모지를 구조 아이콘으로 사용 (인라인 SVG만)
- ❌ 터치 타겟 44×44pt 미만 신규 컨트롤 · aria-label/포커스 링 생략
- ❌ 검은 그림자 `rgba(0,0,0,…)` — 잉크 틴트 `rgba(27,37,64,…)` 사용
- ❌ 다크 테마 잔재(네이비 배경 패널 등) 남기기 — 전환은 전면적이어야 함
