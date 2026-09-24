# 진행 상황 (작업 일지) — kotlin-lotto

이 문서는 `woowacourse/kotlin-lotto` PR 리뷰 분석 작업의 **상태 추적용**이다.

## 데이터셋

- 출처: https://github.com/woowacourse/kotlin-lotto/pulls?q=is:pr+is:closed
- 전체 closed PR: **153개**
- 분석 대상 필터: **라인 레벨 reviewer 코멘트 ≥ 5개**
- 통과한 PR: **141개**, 고유 reviewee: **71명**

## 분석 어휘

- 유지: 책임/응집/결합/캡슐화/Tell-Don't-Ask/테스터빌리티/도메인 모델링/일급 컬렉션/원시 강박/의존 방향/명명 설계
- 제외: Kotlin 관용구 (scope function, smart cast, null 처리, val/var, data class 사용 여부, init 블록 형태, collection API 선택, extension 위치)

## 추가 지침 (racingcar와 다른 점)

- **코드 스니펫 포함**: 안티패턴이 명확한 경우 `diff_hunk` 또는 인용 코드를 함께 기록해 가독성 향상.
- **lotto 도메인 특화 어휘**: 당첨 등수 (Rank/Winning), 금액 계산 (Money/Profit), 통계 집계 (Statistics), 로또 번호 검증 (LottoNumber) 등.

## ✅ 완료

**141 PRs 완료** — 2026-05-22

`SUMMARY.md` + `README.md` 작성 완료.

## 진행 상태

141개 대상 PR의 개별 분석과 요약 문서를 작성했다. 분석 파일은 설계 관점의 근거, 인용 코드, 원본 PR 링크, 구체적 교훈을 중심으로 구성한다.

## MCP에 반영된 lotto 안티패턴 (2026-05-23)

이 코퍼스에서 도출한 안티패턴 중 5개가 oh-my-oop MCP 서버의 validate 룰로 코드화됨. 룰의 evidence/remedy에는 아래 PR의 *대표 인용*이 발췌되어 들어가 있다.

| 신규 룰 ID | 인용 PR | 핵심 통찰 |
|---|---|---|
| `empty-object-external-fill` | [#14](Choisehyeon/14-1단계-로또.md) @malibinYun | "빈 껍데기를 만들어서 외부에서 값을 채우지 말 것." 도메인 객체는 생성 시점에 invariant 충족. |
| `collection-wrapper-without-behavior` | [#144](jiyuneel/144-2단계-로또.md) @krrong | 일급 컬렉션이 *행동* 없이 `toString` 오버라이드 용도면 만들지 않는 것도 좋은 답. |
| `primitive-wrapper-without-invariant` | [#58](junjange/58-1단계-로또.md) @junjange, [#77](hxeyexn/77-1단계-로또.md) @hxeyexn | `init`은 자기 invariant, factory는 입력 변환 + 생성 결정. invariant 없는 wrapper는 원시값과 동일. |
| `strategy-default-param-pollution` | [#144](jiyuneel/144-2단계-로또.md) @krrong | 공통 인터페이스 = 공통 시그니처. 분기 인자(`manualNumbers`)는 생성자로 끌어올려야 호출 컨텍스트가 분리됨. |
| `function-decomposition-excess` | lotto 일반 (@krrong 류 코멘트 다수) | 함수를 *분리*하는 것이지 *분해*하는 것이 아니다. 1-2줄짜리 private 헬퍼 남발은 가독성 저하. |

룰을 추가하면서 함께 도입된 트레이드오프 heuristic 4종: `value_object_shape`, `strategy_or_policy`, `error_handling`, `collection_shape` (총 8개 typed heuristic + `free_form`).

상세 룰 ↔ 안티패턴 매핑은 `../../MCP_STRUCTURE.md` §3 참조.

## 캐시 위치

`/tmp/oop-lessons-cache-lotto/`:
- `prs.json` — 153개 PR 메타
- `nums.txt` — PR 번호 목록 (1-153)
- `counts.tsv` — PR# / 라인 코멘트 수
- `filtered.tsv` — ≥5 코멘트 PR 목록
- `authors.tsv` — PR# / 작성자
- `grouped.tsv` — PR# / 코멘트 수 / 고유 리뷰어 수 / 작성자
- `comments/<N>.json` — PR별 라인 코멘트 (diff_hunk 포함)

**주의:** `/tmp`는 재부팅 시 사라질 수 있음. 시작 전 캐시 확인 후 없으면 재생성.

## 문서 구성

- 개별 PR 문서는 원본 URL, 리뷰어 의견의 요지와 attribution, 관련 코드, 설계 대안과 교훈을 기록한다.
- lotto 특화 용어와 반복 설계 패턴은 `SUMMARY.md`에 묶어 색인한다.
