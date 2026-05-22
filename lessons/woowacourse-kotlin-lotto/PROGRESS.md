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

## 진행 상태

**0 PRs 완료 / 0 reviewees 완료** (시작)

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

## 우선순위 (코멘트 많은 PR 순)

```
85  (132)  kkosang     - [로또 2단계]
15  ( 85)  hyunji1203  - [로또 1단계]
19  ( 79)  krrong      - [로또 1단계]
65  ( 75)  songpink    - [로또 1단계]
16  ( 75)  ippnsj      - [로또 1단계]
106 ( 75)  giovannijunseokim
120 ( 71)  junseo511
27  ( 70)  2chang5     - [로또 1단계]
115 ( 68)  jerry8282
135 ( 67)  Leeyerin0210
... (계속 grouped.tsv 참조)
```

## 다음 세션 시작 시

1. 이 파일 + 가장 최근 commit 확인
2. 캐시 존재 여부 확인 (`ls /tmp/oop-lessons-cache-lotto/comments/ | wc -l == 153`)
3. 캐시 있으면 미완 reviewee부터 진행
4. 5-10 PR마다 commit + push로 안전 저장
5. 전체 141개 완료 후 `SUMMARY.md` + `README.md` 작성

## 작성 패턴

- 1단계 PR이 비슷한 안티패턴(원시 강박, Statistics god-object 등) 반복 → 2단계는 짧게
- 핵심 트레이드오프 또는 새로운 패턴에 더 집중
- 사람마다 40-80 lines 정도가 적정 (1단계 = 60-100, 2단계/리팩토링 = 40-70)
- **안티패턴 코드 스니펫** 인용 시 ` ```kotlin ... ``` ` 블록으로

## 검증 — 최종 단계에서 수행

- 무작위 3개 PR 파일을 GitHub 원본과 대조
- Kotlin 관용구 누수 점검 (`grep -r -E "scope function|apply *\{|let *\{|smart cast"`)
- `SUMMARY.md`의 PR 카운트 = 실제 `.md` 수
- 모든 reviewee 폴더에 최소 1개 .md
