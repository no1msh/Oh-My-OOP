# 진행 상황 (작업 일지)

이 문서는 `woowacourse/kotlin-racingcar` PR 리뷰 분석의 데이터 출처와 범위를 기록한다.

## 데이터셋

- 출처: https://github.com/woowacourse/kotlin-racingcar/pulls?q=is:pr+is:closed
- 전체 closed PR: **188개**
- 분석 대상 필터: **라인 레벨 reviewer 코멘트 ≥ 5개**
- 통과한 PR: **133개**, 고유 reviewee: **77명**

## 분석 어휘

- 유지: 책임/응집/결합/캡슐화/Tell-Don't-Ask/테스터빌리티/도메인 모델링/일급 컬렉션/원시 강박/의존 방향/명명 설계
- 제외: Kotlin 관용구 (scope function, smart cast, null 처리, val/var, data class 사용 여부, init 블록 형태, collection API 선택, extension 위치)

## 현재 상태

133개 PR의 분석 자료와 `SUMMARY.md`, `README.md`가 작성되어 있다. 각 분석은 책임, 응집, 결합, 캡슐화, 테스터빌리티 등 OOP 설계 관점을 다룬다.

## 캐시 위치

`/tmp/oop-lessons-cache/`:
- `prs.json` — 188개 PR 메타
- `nums.txt` — PR 번호 목록
- `counts.tsv`, `reviewer_counts.tsv`, `authors.tsv`
- `grouped.tsv` — number / reviewer_count / distinct_reviewers / author
- `comments/<N>.json`, `pr_meta/<N>.json`, `reviews/<N>.json`, `issues/<N>.json`

**주의:** `/tmp`는 재부팅 시 사라질 수 있음. 시작 전 캐시 확인 후 없으면 재생성.

## 자료 캐시

`/tmp/oop-lessons-cache/`는 원본 PR 메타와 코멘트 데이터를 임시 보관하던 위치이며, 재부팅 후 사라질 수 있다. 개별 PR 자료의 출처는 각 문서에 기록된 GitHub 링크를 기준으로 한다.
