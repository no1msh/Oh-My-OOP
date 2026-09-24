# MCP 소스 구조 가이드 (oh-my-oop)

`src/oop/commands.ts`가 MCP/CLI 공통 코어입니다. `src/cli.ts`는 JSON CLI, `src/application/discovery.ts`는 OOP 명령 스키마 발견을 담당합니다. 아키텍처/실행기/JEV 모듈은 분리했습니다. 현재 제품 경계는 `SCOPE.md`를 읽으세요.

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

### 2-5. 도메인 종속 룰/도구 금지 (general-OOP 원칙)

`src/` 의 모든 룰, tradeoff heuristic, 도구, prompt, stereotype 은 **어떤 도메인에도 적용 가능**한 일반 OOP 패턴이어야 한다. 도메인 종속 어휘(블랙잭의 Ace, 로또의 Bonus, 자동차 경주의 Move 등)는 *룰 시그니처/이름/판정 로직*에 등장하지 않는다.

**허용**: `lessons/<mission>/` 의 PR 인용을 evidence/remedy 에 첨부. `vagueName.ts` 가 racingcar `@vagabond95` 인용한 패턴과 동일. 도메인 어휘는 *근거*로만 등장한다.

**금지 예시**:
- `ace-bonus-while-anti-pattern` 룰 (블랙잭 Ace 한정)
- `blackjack-rule-fidelity` 룰 (블랙잭 룰 명세)
- `lotto-bonus-number-locus` 룰 (로또 한정)
- `/blackjack-phase2-entry` prompt (블랙잭 단계명)

**허용 예시**:
- `value-arithmetic-invariant-conflict` 룰 (값 객체 산술 일반)
- `dual-purpose-knowing` 룰 (한 데이터 두 책임 일반)
- `/phase-pressure-test` prompt (단계 진화 일반)
- 위 룰의 evidence 에 *"블랙잭 BettingMoney → Profit 분리"* PR 인용

**판단 기준**: *룰 이름·시그니처·판정 로직에서 그 도메인 어휘를 제거해도 일반 OOP 안티패턴인가?* 그렇다면 일반. 아니면 도메인 종속이므로 거부.

**Stereotype 5종 동결**: 현재 5종 (Knowing/Doing/Controller/Coordinator/Structurer) + Interfacer 는 *추상화 정점*이다. 도메인 stereotype (Participant/Dealer/Judge 등) 은 추가하지 않고, 도메인 역할은 카드 `metadata.role`(자유 텍스트)로 표현한다. fits/misfits 일관성 유지 비용과 학생 분류 부담이 폭증하기 때문.

**룰 폭증 회피 동반 원칙**: 신규 룰 1개 추가 = *기존 룰 인용 보강 ≥2개* 동반. lessons 코퍼스의 발견은 *기존 룰 강화로 흡수 가능한지* 먼저 검토하고, 흡수 불가일 때만 신규 룰.

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

## 4. 기존 18개 룰 ↔ 코퍼스 안티패턴 매핑

이미 lotto/racingcar/blackjack 에서 본 안티패턴 중 **이미 룰로 존재하는 것**:

| 안티패턴 | 룰 ID | 비고 |
|---|---|---|
| Validator/Verifier/Picker/Distributor/Judge god-name | `vague-class-name` | racingcar 추출. blackjack 으로 가상 객체 사전 +14 + laco-dev/ghojeong 인용 보강 |
| Controller god-object / Dealer 이중 역할 | `god-object` | 책임/협력자 임계치 + blackjack ghojeong "사람 한 명 더 필요한가" 인용 |
| 검증 분산 (View + Domain) | `validation-misplacement` | UI 형식/입력 정책/도메인 invariant 3분류 |
| Domain → View 의존 / enum UI value 침투 | `dependency-direction` | BeokBeok + blackjack laco-dev "Rank 출력 = UI 관심사" 인용 |
| toString 도메인 침투 | `dependency-direction` 부분 + `mixed-stereotype` | UI 어휘 + InformationHolder misfits 힌트 |
| Tell-Don't-Ask 위반 / 외부 비교자 (Judge.judge) | `feature-envy` | knowing 점수 기반 + blackjack laco-dev/BeokBeok 메시지 어휘 인용 |
| 양방향/순환 의존 | `cycle` | |
| 단일 위임만 하는 객체 | `function-not-object` 일부 | 좀 다름. 추가 룰 필요할 수 있음 |
| 모호한 책임 혼합 | `mixed-stereotype` | knowing+doing+coordinating 모두 |
| 미사용 클래스 | `orphan-class` | |
| 데이터 중복 | `data-source-duplication` | knowing 토큰 중복 |
| 빈 InformationHolder + 외부 mutation | `empty-object-external-fill` | lotto malibinYun 인용 |
| 행위 없는 컬렉션 wrapper | `collection-wrapper-without-behavior` | lotto krrong 인용 |
| 값 wrapper invariant 부재 / BettingMoney 산술 invariant 충돌 | `primitive-wrapper-without-invariant` | lotto junjange + blackjack malibinYun "BettingMoney → Profit" 인용 |
| 전략 그룹 knowing 비대칭 | `strategy-default-param-pollution` | lotto krrong 인용 |
| doing 과도 분해 | `function-decomposition-excess` | lotto 일반 가르침 |
| 한 데이터 두 책임 (출력 vs 비교) | `dual-purpose-knowing` | blackjack laco-dev "strength vs displayScore" — Phase 1 신규 |
| 도메인 상태 보유 전역 객체 (Singleton Deck) | `singleton-stateful-holder` | blackjack malibinYun "53번 뽑으면 오류?" — Phase 1 신규 |

---

## 5. 추가 룰 후보 (lotto에서 새로 발견)

### ✅ 추가 완료 — lotto 코퍼스 (2026-05-23, 세션 2)
1. **`empty-object-external-fill`** — InformationHolder + knowing 0 + doing이 모두 mutation 동사 (PR #14 @malibinYun)
2. **`collection-wrapper-without-behavior`** — Structurer + 단일 컬렉션 knowing + pass-through doing (PR #144 @krrong)
3. **`primitive-wrapper-without-invariant`** — 값 wrapper 명명 + 단일 원시 knowing + invariant 의도 없음 (PR #58 @junjange, #77 @hxeyexn)
4. **`strategy-default-param-pollution`** — 같은 전략 suffix 그룹의 knowing 비대칭 (PR #144 @krrong)
5. **`function-decomposition-excess`** — doing ≥4개 모두 짧은 동사 + 도메인 명사 부재 (lotto 일반 가르침)

### ✅ 추가 완료 — blackjack 코퍼스 (2026-05-28, 세션 3 Phase 1)
6. **`dual-purpose-knowing`** — InformationHolder/Structurer + 표현(display/format/render/출력) 동사 ≥1 + 비교/판정(compare/judge/strength/비교) 동사 ≥1 동시 등장 (blackjack aprilgom/105 @laco-dev "strength vs displayScore")
7. **`singleton-stateful-holder`** — InformationHolder/Structurer + notes/name 에 singleton/global 표식 + 가변 컬렉션 knowing (blackjack krrong/46 @malibinYun "53번 뽑으면 오류?")

→ 총 18개 룰 (기존 16 + blackjack 신규 2) = **18개**.

### ✅ 기존 룰 인용 보강 — blackjack 코퍼스 (Phase 2)
- `vague-class-name` — SUSPECT 사전 +14 (Picker/Distributor/Judge/Rule/Calculator/Information/Info/Decider 등) + laco-dev/ghojeong 가상 객체 회피 인용
- `dependency-direction` — laco-dev "Rank 출력 = UI 관심사" + galcyurio "domain → ui 반대 문제" 인용
- `feature-envy` — laco-dev "메시지를 보낸다" + BeokBeok "내 카드 줄테니 알려줘" 인용
- `god-object` — ghojeong "사람 한 명 더 필요한가" 인용
- `primitive-wrapper-without-invariant` — malibinYun "BettingMoney 산술이 invariant 깰 때 결과 타입 분리" 인용

### Priority 3 (코드 분석 필요해 룰화 어려움 — 보류)
- `enum-ordinal-dependency` — Design 모델만으로는 감지 어려움 (코드 AST 필요)
- `null-assertion-misuse` — 동일
- `runCatching-on-non-input` — 동일

---

## 6. 추가 트레이드오프 케이스 (`tradeoff/heuristics/`)

### ✅ 추가 완료 (2026-05-23, 세션 2 + 2026-05-28, 세션 3) — `TradeoffQuestion` 10종
| 케이스 | 위치 | question type | 추가 시점 |
|---|---|---|---|
| `data class vs value class` | `heuristics/valueObjectShape.ts` | `value_object_shape` | 세션 2 |
| `Strategy interface vs enum policy` | `heuristics/strategyOrPolicy.ts` | `strategy_or_policy` | 세션 2 |
| `runCatching vs null+while` | `heuristics/errorHandling.ts` | `error_handling` | 세션 2 |
| `일급 컬렉션 채택 여부` | `heuristics/collectionShape.ts` | `collection_shape` | 세션 2 |
| `두 동등 주체 간 비교 책임 위치` | `heuristics/dualSubjectComparison.ts` | `dual_subject_comparison` | **세션 3 (blackjack)** |

각 4개 대안 + 도메인 어휘 pros/cons + 조영호 렌즈 (cohesion/coupling/testability) 첨부.

기존 5종은 그대로: `responsibility_split`, `class_split`, `collaboration_shape`, `stereotype_choice`, `free_form`.

`검증 위치 (View + Domain 모두 vs 단일)`은 이미 `validationLocation.ts` 룰로 다룸.

### ✅ 학습 장치: 대안 0번 슬롯 (2026-05-28, 세션 3)

`tradeoff/engine.ts::nullOptionFor()` — 모든 `propose_alternatives` 호출에 *"이 객체/분리를 만들지 않는다"* 카드를 0번 슬롯에 자동 prepend. `free_form` 제외 9개 question 별 다른 label.

*답을 받는 게 아니라 문제를 거부하는 카드*를 항상 노출해서 가상 객체 회피를 *학생 자가 자각*하도록 강제. *N안 + 트레이드오프*의 *경험적 체화* 장치.

@laco-dev (blackjack tobae-time/115): *"객체는 모두 스스로 일을 합니다."*

### ✅ prompts 4종 추가 (2026-05-28, 세션 3)

| prompt | 용도 |
|---|---|
| `/tell-dont-ask-rephrase` | 외부 비교자/getter → 메시지 호출로 다시 쓰는 4안 + 진단 질문 |
| `/state-machine-introspect` | sealed State 도입 2 기준 (다형성 + Context 책임) + 4안. 자동 감지 X, 학생 자가 도달 |
| `/phase-pressure-test` | 추가 요구사항이 깰 부분 학생 자가 진단. 1단계→2단계 학습 장치 |
| `/imagine-without-controller` | Controller 가상 제거 + 가상 객체 회피 사고 실험 |

기존 3종: `/rdd-workshop-intro`, `/design-discovery`, `/design-review-cho-younghos-lens`. 총 7종.

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
