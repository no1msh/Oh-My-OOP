# Oh-My-OOP — Claude 작업 가이드

> 이 디렉토리는 **oh-my-oop MCP 서버** (TypeScript) 와 **PR 분석 데이터셋** (`lessons/`)이 함께 있는 monorepo입니다.

---

## 작업 시작 전 반드시 읽을 것

### MCP 소스 구조가 궁금하면
**→ `MCP_STRUCTURE.md` 먼저 읽기.**
- 디렉토리 구조 (src/tools, src/validate, src/tradeoff 등)
- 기존 15개 룰 ↔ lotto 안티패턴 매핑
- 신규 룰 추가 체크리스트
- 추가 룰 후보 (Priority 1/2/3)
- 핵심 계약 (`assertHasMultipleRemedies` 등)

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

1. **신규 룰 후보 4개** (MCP_STRUCTURE.md §5):
   - `empty-object-external-fill` (Priority 1)
   - `collection-wrapper-without-behavior` (Priority 1)
   - `primitive-wrapper-without-invariant` (Priority 1)
   - `strategy-default-param-pollution` (Priority 2)
   - `function-decomposition-excess` (Priority 2)

2. **트레이드오프 케이스 라이브러리 확장** (MCP_STRUCTURE.md §6):
   - data class vs value class
   - Strategy interface vs enum policy
   - runCatching vs null+while
   - 일급 컬렉션 채택 여부

3. **lessons/ 미보강 17개 파일**: 댓글 6-14개의 저-댓글 PR. 적정 길이로 판단되어 보류.

4. **blackjack 미션**: 디렉토리 없음. 향후 분석 가능성만 존재.

---

**우선순위 추천:** §3 신규 룰 1개를 PR-ready 수준까지 구현 (테스트 포함) → 패턴 확립 후 나머지.
