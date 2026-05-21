# 진행 상황 (작업 일지)

이 문서는 `woowacourse/kotlin-racingcar` PR 리뷰 분석 작업의 **상태 추적용**이다. 다음 세션이 어디서부터 이어가야 하는지를 알린다.

## 데이터셋

- 출처: https://github.com/woowacourse/kotlin-racingcar/pulls?q=is:pr+is:closed
- 전체 closed PR: **188개**
- 분석 대상 필터: **라인 레벨 리뷰 코멘트 ≥ 5개**
- 통과한 PR: **133개**, 고유 reviewee: **77명**

## 분석 어휘

- 유지: 책임/응집/결합/캡슐화/Tell-Don't-Ask/테스터빌리티/도메인 모델링/일급 컬렉션/원시 강박/의존 방향/명명 설계
- 제외: Kotlin 관용구 (scope function, smart cast, null 처리, val/var, data class 사용 여부, init 블록 형태, collection API 선택, extension 위치, 코틀린답기)

## 진행 상태

| Reviewee | PR | 단계 | 코멘트 | 상태 |
|---|---|---|---|---|
| wondroid-world | #136 | 1단계 | 46 | ✅ |
| wondroid-world | #166 | 2단계 | 27 | ✅ |
| tmdgh1592 | #47 | 1단계 | 38 | ✅ |
| tmdgh1592 | #64 | 2단계 | 24 | ✅ |
| chanho0908 | #147 | 1단계 | 47 | ✅ |
| chanho0908 | #160 | 2단계 | 15 | ✅ |
| rosemin928 | #138 | 1단계 | 46 | ✅ |
| rosemin928 | #171 | 2단계 | 9 | ✅ |
| junseo511 | #148 | 1단계 | 32 | ✅ |
| junseo511 | #165 | 2단계 | 23 | ✅ |
| haeum808 | #101 | 1단계 | 45 | ✅ |
| haeum808 | #129 | 리팩터링 | 10 | ✅ |
| m6z1 | #150 | 1단계 | 48 | ✅ |
| m6z1 | #156 | 2단계 | 5 | ✅ |

**완료:** 14개 PR / 7명 reviewee.
**남음:** 119개 PR / 70명 reviewee.

## 다음 우선순위 (코멘트 수 기준 상위)

| Reviewee | 총 코멘트 | PR 수 |
|---|---|---|
| songpink | 52 | 2 |
| SeongHoonC | 52 | 2 |
| gahyunkim | 50 | 2 |
| HamBeomJoon | 49 | 2 |
| hwannow | 48 | 2 |
| Hevton | 48 | 2 |
| boogi-woogi | 47 | 2 |
| devfeijoa | 45 | 1 |
| pingu244 | 44 | 2 |
| oungsi2000 | 44 | 2 |
| ... | ... | ... |

전체 대상은 `/tmp/oop-lessons-cache/grouped.tsv` (PR / count / distinct_reviewers / author 4-tuple)에 있음.

## 캐시 위치

`/tmp/oop-lessons-cache/`:
- `prs.json` — 188개 PR 메타
- `nums.txt` — PR 번호 목록
- `counts.tsv` — PR별 총 코멘트 수
- `reviewer_counts.tsv` — PR별 reviewer-only 코멘트 수 (author replies 제외)
- `authors.tsv` — qualifying PR 번호 ↔ author 매핑
- `grouped.tsv` — 종합 (number / reviewer_count / distinct_reviewers / author)
- `comments/<N>.json` — PR별 라인 코멘트 raw
- `pr_meta/<N>.json` — PR 메타 (title/body/author/base/head/url)
- `reviews/<N>.json` — PR 리뷰 상태/본문
- `issues/<N>.json` — PR 대화 코멘트

**주의:** `/tmp`는 재부팅 시 사라질 수 있음. 다음 세션 시작 전 캐시가 존재하는지 확인하고, 없으면 재생성 필요.

재생성 방법(요약):
```bash
gh pr list --repo woowacourse/kotlin-racingcar --state closed --limit 200 --json number,author,title,baseRefName,createdAt > prs.json
# 각 PR마다:
gh api --paginate "/repos/woowacourse/kotlin-racingcar/pulls/<N>/comments?per_page=100" > comments/<N>.json
gh api "/repos/woowacourse/kotlin-racingcar/pulls/<N>" --jq '{number, title, body, user: .user.login, base: .base.ref, head: .head.ref, created_at, html_url, additions, deletions, changed_files}' > pr_meta/<N>.json
```

## 다음 세션 시작 시

1. 이 파일을 읽고 직전 상태 확인
2. 캐시 존재 여부 확인 (`ls /tmp/oop-lessons-cache/`)
3. 캐시가 있으면 다음 우선순위(songpink부터) 진행
4. 캐시가 없으면 재생성
5. 일정 단위(5~10 PR)마다 commit + push로 안전 저장
6. 전체 133개 완료 후 `SUMMARY.md` + `README.md` + `Oh-My-OOP/README.md` 링크 작성

## 검증 — 최종 단계에서 수행

- 무작위 3개 PR 파일을 GitHub 원본과 대조
- `grep -r -E "scope function|apply *\{|let *\{|smart cast|nullable|val vs var|data class" lessons/`로 Kotlin 관용구 누수 점검
- `SUMMARY.md`의 PR 카운트 = 실제 `.md` 파일 수
- 모든 reviewee 폴더에 최소 1개 .md 존재
