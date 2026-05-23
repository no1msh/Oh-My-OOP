# MCP 소스 구조 가이드 (oh-my-oop)

> **목적:** 다음 세션이 빠르게 MCP 룰/도구 확장 작업에 들어갈 수 있도록.
> **마지막 정찰:** 2026-05-23 (lotto 141 PR 분석 직후, 룰 확장 작업 진입 전)

---

## 1. 디렉토리 구조

```
src/
├── index.ts                 ← entry point (stdio transport)
├── server.ts                ← McpServer 생성 + 도구/리소스/프롬프트 등록
├── config.ts                ← .oop/ 워크스페이스 위치 해석
│
├── domain/                  ← 도메인 모델 (CRC 카드, 유스케이스, 협력)
│   ├── ids.ts
│   ├── model.ts             ← CrcCard, UseCase, Collaboration, Design 타입
│   ├── schemas.ts           ← Zod 스키마 (TradeoffQuestion 등)
│   └── stereotypes.ts       ← Wirfs-Brock 5종 + fits/misfits 힌트
│
├── io/                      ← 파일 시스템 영속화 (.oop/ markdown frontmatter)
│   ├── classStore.ts        ← CrcCard CRUD
│   ├── useCaseStore.ts
│   ├── collaborationStore.ts
│   ├── designIndex.ts       ← .oop/index.json 관리
│   ├── design.ts            ← loadDesign() — 모든 카드/유스케이스/협력 통합 로딩
│   ├── frontmatter.ts       ← gray-matter wrapper, nowIso()
│   ├── history.ts           ← Before/After 비교용 스냅샷
│   └── workspace.ts         ← .oop/ 부트스트랩 (oop_init)
│
├── tools/                   ← MCP 도구 등록 (각 파일 = 1~2개 도구)
│   ├── index.ts             ← registerAllTools() 진입점
│   ├── init.ts              ← oop_init
│   ├── useCases.ts          ← oop_use_case_add, oop_use_case_list
│   ├── responsibilities.ts  ← oop_propose_responsibilities, oop_assign_responsibility
│   ├── classes.ts           ← oop_class_upsert, oop_class_list
│   ├── collaborations.ts    ← oop_collaboration_define
│   ├── alternatives.ts      ← oop_propose_alternatives
│   ├── diagram.ts           ← oop_diagram_generate (Mermaid)
│   ├── compare.ts           ← oop_design_compare (Before/After)
│   ├── validate.ts          ← oop_design_validate
│   └── state.ts             ← oop_state_read
│
├── validate/                ← 검증 룰 (각 파일 = 1개 룰)
│   ├── rules.ts             ← ALL_RULE_IDS, validateDesign() dispatch
│   ├── findings.ts          ← Finding/Remedy/Severity 타입 + assertHasMultipleRemedies
│   ├── godObject.ts         ← 책임/협력자 임계치 초과
│   ├── cohesion.ts          ← low-cohesion
│   ├── coupling.ts          ← too-many-collaborators
│   ├── testability.ts       ← non-newable, side-effect-in-holder, mocking-pressure
│   ├── cycle.ts             ← 순환 의존
│   ├── vagueName.ts         ← Validator/Manager/Helper 등 god-name (racingcar 인용)
│   ├── validationLocation.ts ← 검증 분산 (UI 형식 vs 입력 정책 vs 도메인 invariant 3분류)
│   ├── dependencyDirection.ts ← Domain → UI 역방향 의존 (BeokBeok 인용)
│   ├── dataDuplication.ts   ← knowing 책임 중복
│   └── functionNotObject.ts ← 함수형 클래스 (= 정적 유틸)
│
├── tradeoff/                ← N개 대안 + 트레이드오프 생성
│   ├── engine.ts            ← generateAlternatives() + attachReflectionQuestions()
│   ├── templates.ts         ← expansion_prompt 텍스트
│   └── heuristics/
│       ├── classSplit.ts
│       ├── collaborationShape.ts
│       ├── responsibilitySplit.ts ← by-noun/by-verb/by-stereotype/single-class
│       └── stereotypeChoice.ts
│
├── prompts/                 ← MCP 프롬프트 (대화 시드)
│   ├── index.ts
│   ├── rddIntro.ts          ← /rdd-workshop-intro
│   ├── discovery.ts
│   └── review.ts            ← /design-review-cho-younghos-lens
│
├── render/
│   ├── mermaid.ts           ← Mermaid classDiagram 생성
│   ├── diff.ts
│   └── sideBySide.ts
│
├── resources/
│   └── index.ts
│
└── util/
    ├── log.ts
    └── mcp.ts               ← jsonResult, errorResult 헬퍼

test/
├── unit/
├── integration/
├── kotlin-racingcar/        ← racingcar 미션 케이스
└── fixtures/

lessons/                     ← PR 분석 데이터셋 (정적 자산)
├── STYLE_GUIDE.md
├── woowacourse-kotlin-lotto/    ← 141 PR 분석 (2026-05-22 완료)
└── woowacourse-racingcar/       ← 이전 분석
```

---

## 2. 핵심 계약 (반드시 지킬 것)

### 2-1. `Finding`은 항상 ≥2개 `remedies`
```ts
// validate/findings.ts
assertHasMultipleRemedies(finding)  // throw if < 2 remedies
```
→ 모든 새 룰은 *최소 2개 대안 remedy + pros/cons*를 자동 첨부해야 함. 단일 권고 금지 (조영호 철학).

### 2-2. 모든 도구는 jsonResult/errorResult 사용
```ts
// util/mcp.ts
return jsonResult({ ... });
return errorResult((e as Error).message);
```

### 2-3. 도구 description은 *[USE WHEN] ... + 호출 시점* 명시
- validate.ts 참고: "'리뷰'/'검토'/'평가'해달라거나, 'god object 같지 않아?'를 물을 때"

### 2-4. `AlternativeSeed`는 항상 `reflection_questions` 첨부
- `tradeoff/engine.ts::attachReflectionQuestions()` 가 자동 부착
- `testability_justification` + `expansion_pressure` 2개 강제

---

## 3. 신규 룰 추가 방법 (체크리스트)

1. `src/validate/<ruleName>.ts` 생성 (godObject.ts 패턴 그대로)
2. `check<RuleName>(design: Design, ...): Finding[]` 함수 export
3. `validate/rules.ts`:
   - import 추가
   - `ALL_RULE_IDS` 배열에 ID 추가
   - `validateDesign()`의 if 체인에 호출 추가
   - 임계치 필요하면 `DEFAULT_THRESHOLDS`에 추가
4. 모든 finding에 `assertHasMultipleRemedies()` 감싸기 (≥2 remedies 강제)
5. `test/unit/validate.rules.test.ts`에 테스트 케이스 *추가* (모듈당 1 파일, 평면 구조 — 디렉토리 분리 X). 케이스 패턴: positive 1개 + suppression(skip) negative 2~3개. 마지막 `all rules pass the >=2 remedies contract` 케이스가 신규 룰도 자동 검증.

---

## 4. 기존 15개 룰 ↔ lotto 안티패턴 매핑

이미 lotto에서 본 안티패턴 중 **이미 룰로 존재하는 것**:

| lotto 안티패턴 | 기존 룰 ID | 비고 |
|---|---|---|
| Validator/Verifier god-name | `vague-class-name` | racingcar에서 추출, lotto에도 동일 |
| Controller god-object | `god-object` | 책임/협력자 임계치 |
| 검증 분산 (View + Domain) | `validation-misplacement` | UI 형식/입력 정책/도메인 invariant 3분류 |
| Domain → View 의존 | `dependency-direction` | BeokBeok 인용 |
| toString 도메인 침투 | `dependency-direction` 부분 + `mixed-stereotype` | UI 어휘 + InformationHolder misfits 힌트 |
| Tell-Don't-Ask 위반 | `feature-envy` | knowing 점수 기반 |
| 양방향/순환 의존 | `cycle` | |
| 단일 위임만 하는 객체 | `function-not-object` 일부 | 좀 다름. 추가 룰 필요할 수 있음 |
| 모호한 책임 혼합 | `mixed-stereotype` | knowing+doing+coordinating 모두 |
| 미사용 클래스 | `orphan-class` | |
| 데이터 중복 | `data-source-duplication` | knowing 토큰 중복 |

---

## 5. 추가 룰 후보 (lotto에서 새로 발견)

### ✅ 추가 완료 (2026-05-23, 세션 2)
1. **`empty-object-external-fill`** — InformationHolder + knowing 0 + doing이 모두 mutation 동사 (PR #14 @malibinYun)
2. **`collection-wrapper-without-behavior`** — Structurer + 단일 컬렉션 knowing + pass-through doing (PR #144 @krrong)
3. **`primitive-wrapper-without-invariant`** — 값 wrapper 명명 + 단일 원시 knowing + invariant 의도 없음 (PR #58 @junjange, #77 @hxeyexn)
4. **`strategy-default-param-pollution`** — 같은 전략 suffix 그룹의 knowing 비대칭 (PR #144 @krrong)
5. **`function-decomposition-excess`** — doing ≥4개 모두 짧은 동사 + 도메인 명사 부재 (lotto 일반 가르침)

→ 총 16개 룰 (기존 15 + 신규 1) + 5개 더 = **20개**.

### Priority 3 (코드 분석 필요해 룰화 어려움 — 보류)
- `enum-ordinal-dependency` — Design 모델만으로는 감지 어려움 (코드 AST 필요)
- `null-assertion-misuse` — 동일
- `runCatching-on-non-input` — 동일

---

## 6. 추가 트레이드오프 케이스 (`tradeoff/heuristics/`)

### ✅ 추가 완료 (2026-05-23, 세션 2) — `TradeoffQuestion` 9종
| 케이스 | 위치 | question type |
|---|---|---|
| `data class vs value class` | `heuristics/valueObjectShape.ts` | `value_object_shape` |
| `Strategy interface vs enum policy` | `heuristics/strategyOrPolicy.ts` | `strategy_or_policy` |
| `runCatching vs null+while` | `heuristics/errorHandling.ts` | `error_handling` |
| `일급 컬렉션 채택 여부` | `heuristics/collectionShape.ts` | `collection_shape` |

각 4개 대안 + 도메인 어휘 pros/cons + 조영호 렌즈 (cohesion/coupling/testability) 첨부.

기존 5종은 그대로: `responsibility_split`, `class_split`, `collaboration_shape`, `stereotype_choice`, `free_form`.

`검증 위치 (View + Domain 모두 vs 단일)`은 이미 `validationLocation.ts` 룰로 다룸.

---

## 7. 빌드/테스트

```bash
npm run dev          # tsx src/index.ts (dev mode)
npm run build        # tsc -p . → dist/
npm test             # vitest run
npm run test:watch
```

- TypeScript strict mode, ESM (`"type": "module"`)
- Node ≥ 18.17
- 의존성: `@modelcontextprotocol/sdk`, `zod`, `gray-matter`

---

## 8. 다음 세션 진입 시 추천 작업 순서

1. **이 문서 + `validate/godObject.ts` + `validate/vagueName.ts` 읽기** (룰 작성 패턴 익히기)
2. **`validate/findings.ts` 읽기** (`assertHasMultipleRemedies` 계약 이해)
3. **Priority 1 룰 1개 선택 (예: `empty-object-external-fill`) 후 PR-ready 수준으로 구현**:
   - `validate/emptyObjectFill.ts` 작성
   - `rules.ts`에 등록
   - `test/unit/validate/emptyObjectFill.test.ts` 작성
   - `npm test` 통과 확인
4. **lessons/woowacourse-kotlin-lotto/ 에서 해당 룰이 잡을 PR 예시 1-2개 인용해 evidence/remedy에 첨부** (vagueName.ts 패턴)

---

## 9. lotto PR 분석 자산 활용

`lessons/woowacourse-kotlin-lotto/` — 141 PR 분석 완료 (2026-05-23 사족 정리 끝).

새 룰의 evidence/remedy 작성 시 `lessons/woowacourse-kotlin-lotto/<reviewee>/<PR>.md`에서 *대표 인용* 발췌해 첨부하면 학생에게 *왜*가 즉시 전달됨. (vagueName.ts 가 `@vagabond95` 인용한 패턴과 동일.)

PROGRESS.md에 PR# / reviewee / 코멘트 수 인덱스 있음.

---

## 10. 알려진 한계

- **코드 AST 분석 없음** — 룰은 모두 `.oop/` 설계 모델(CRC/협력) 기반. `enum.ordinal`, `!!`, `runCatching` 같은 코드 패턴은 감지 불가.
- **lotto의 5종 stereotype 매핑**이 학생 입력 의존 — 자동 추론 안 함.
- **blackjack 미션 데이터셋 없음** — 향후 분석 가능.
