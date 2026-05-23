# Oh-My-OOP — Claude 작업 가이드

> 이 디렉토리는 **oh-my-oop MCP 서버** (TypeScript) 와 **PR 분석 데이터셋** (`lessons/`)이 함께 있는 monorepo입니다.

---

## 작업 시작 전 반드시 읽을 것

### MCP 소스 구조가 궁금하면
**→ `MCP_STRUCTURE.md` 먼저 읽기.**
- 디렉토리 구조 (src/tools, src/validate, src/tradeoff 등)
- 현재 20개 룰 ↔ lotto 안티패턴 매핑
- 신규 룰 추가 체크리스트
- 추가 룰 후보 (Priority 3 — 코드 AST 필요해 보류)
- 핵심 계약 (`assertHasMultipleRemedies` 등)
- 트레이드오프 9종 (`TradeoffQuestion`)

소스를 처음부터 정찰하지 말고 이 문서를 정독한 뒤 필요한 파일만 부분 읽기.

### PR 분석 자산을 활용하려면
**→ `lessons/woowacourse-kotlin-lotto/PROGRESS.md` 인덱스 확인.**
- 141 PR 완료 (2026-05-22 ~ 05-23 보강 + 사족 정리)
- 각 파일: 잘한 점 / 못한 점 (코드 스니펫) / 리뷰어 의견 요지 / 대표 인용 / 얻은 교훈
- 룰 작성 시 evidence/remedy에 *대표 인용* 발췌해 첨부 (vagueName.ts 패턴)

### racingcar 분석도 있음
`lessons/woowacourse-racingcar/` — lotto 이전에 분석된 데이터셋. 기존 룰의 인용(예: vagueName의 `@vagabond95`)은 이 데이터셋에서 나옴.

---

## 코딩 규칙 (이 프로젝트 한정)

### MCP 룰/도구 추가 시
1. **모든 `Finding`은 ≥2개 `remedies` 필수** — `assertHasMultipleRemedies()`로 감싸기 (계약 위반 시 throw)
2. **단일 권고 금지** — N개 대안 + 트레이드오프 (조영호 「객체지향의 사실과 오해」)
3. **`pros`/`cons`는 추상 문장 X, 도메인 어휘로** 작성
4. **도구 description은 `[USE WHEN] ...`** 패턴 (validate.ts 참고)
5. **빌드/테스트**: `npm run build`, `npm test` (vitest)

### lessons/ 파일 수정 시
- 학생 반성 어휘/리뷰어 스타일 메타 분석/PR 간 학생 진화 비교는 **이미 제거됨** (2026-05-23 사족 정리 커밋). 새로 추가하지 말 것.
- 유지 대상: 객체지향 원칙, 설계 통찰, 테스터빌리티, Kotlin OOP 어휘 (value class/sealed class/fun interface), 안티패턴 코드 스니펫.

---

## 빠른 참조

| 무엇을 하려면 | 어디부터 |
|---|---|
| 새 validate 룰 추가 | `MCP_STRUCTURE.md` §3 + `src/validate/godObject.ts` 패턴 |
| 새 트레이드오프 케이스 추가 | `MCP_STRUCTURE.md` §6 + `src/tradeoff/heuristics/responsibilitySplit.ts` 패턴 |
| 새 도구 추가 | `MCP_STRUCTURE.md` §1 + `src/tools/validate.ts` 패턴 (가장 단순) |
| 룰 인용 작성 | `lessons/woowacourse-kotlin-lotto/` 에서 PR 인용 발췌 |
| Stereotype 의미 확인 | `src/domain/stereotypes.ts` (5종 + fits/misfits) |
| 도구 계약 확인 | `src/validate/findings.ts` (`assertHasMultipleRemedies`) |

---

## 알려진 추가 작업 (대기 중)

1. **lessons/ 미보강 17개 파일**: 댓글 6-14개의 저-댓글 PR. 적정 길이로 판단되어 보류.

2. **blackjack 미션 분석**: 디렉토리 없음. lotto/racingcar 다음 후보 — sealed class (Hit/Stand/Bust), state machine, 핸드 합산 룰 등 lotto에 없는 패턴 가능.

3. **lessons 인덱스 런타임 도구**: validate finding을 반환할 때 evidence에 해당 안티패턴의 유사 PR 1-2개 링크를 자동 첨부하는 도구. `lessons/woowacourse-kotlin-lotto/SUMMARY.md` 의 룰 ↔ PR 매핑을 인덱스로 빌드해 룰 ID로 조회.

4. **`oop_review_principles` 도구**: 현재 설계를 조영호 원칙(책임-역할-협력, Tell-Don't-Ask, 일급 컬렉션 등) 별로 점검. 다만 기존 validate 룰의 `guideline` 필드와 중복 위험 — *원칙 메타데이터*로만 그룹핑할지, 별도 inspector로 만들지 검토 필요.

5. **Priority 3 룰** (코드 AST 필요해 Design 모델만으론 감지 어려움 — 보류):
   - `enum-ordinal-dependency`
   - `null-assertion-misuse`
   - `runCatching-on-non-input`

---

**최근 완료 (2026-05-23, 세션 1-2):**
- 신규 validate 룰 5개 — `empty-object-external-fill`, `collection-wrapper-without-behavior`, `primitive-wrapper-without-invariant`, `strategy-default-param-pollution`, `function-decomposition-excess`
- 신규 tradeoff heuristic 4개 — `value_object_shape`, `strategy_or_policy`, `error_handling`, `collection_shape`
- 룰 16개 + 트레이드오프 9종.
