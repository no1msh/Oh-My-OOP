# 진행 상황 (작업 일지)

이 문서는 `woowacourse/kotlin-racingcar` PR 리뷰 분석 작업의 **상태 추적용**이다. 다음 세션이 어디서부터 이어가야 하는지를 알린다.

## 데이터셋

- 출처: https://github.com/woowacourse/kotlin-racingcar/pulls?q=is:pr+is:closed
- 전체 closed PR: **188개**
- 분석 대상 필터: **라인 레벨 reviewer 코멘트 ≥ 5개**
- 통과한 PR: **133개**, 고유 reviewee: **77명**

## 분석 어휘

- 유지: 책임/응집/결합/캡슐화/Tell-Don't-Ask/테스터빌리티/도메인 모델링/일급 컬렉션/원시 강박/의존 방향/명명 설계
- 제외: Kotlin 관용구 (scope function, smart cast, null 처리, val/var, data class 사용 여부, init 블록 형태, collection API 선택, extension 위치)

## 진행 상태

**✅ 완료: 133 PRs / 77 reviewees** — 2026-05-22

`SUMMARY.md` + `README.md` 작성 완료. 메인 README 링크 추가 완료.

---

이전 진행 로그:

**76 PRs 완료 / 40+ reviewees 완료**

완료된 reviewees (코멘트 많은 순):
- wondroid-world, tmdgh1592, chanho0908, rosemin928, junseo511, haeum808, m6z1
- songpink, SeongHoonC, gahyunkim, HamBeomJoon, hwannow, Hevton, boogi-woogi
- devfeijoa, pingu244, oungsi2000, Leeyerin0210, murjune, kkosang, cucumber99
- DYGames, RightHennessy, 2chang5, parkjiminnnn, no1msh, re4rk, kimhm0728
- chaehyuns, doabletuple, hyunji1203, otter66, ippnsj, gaeun5744
- aprilgom, medAndro, giovannijunseokim, ki960213, tobae-time, rhkrwngud445

## 다음 우선순위 (남은 high-comment reviewees)

대략 57 PR / 37 reviewees 남음. /tmp/oop-lessons-cache/grouped.tsv를 보면 정확한 순서를 알 수 있음.

다음 우선:
- chws0508 (31, 2)
- yrsel (31, 1)
- kmkim2689 (30, 2)
- Yunseok-Nam (30, 2)
- s6m1n (29, 2)
- Hogu59 (29, 2)
- EmilyCh0 (29, 2)
- hxeyexn (28, 2)
- inseonyun (27, 2)
- ijh1298 (27, 1)
- sujin9 (25, 2)
- moondev03 (25, 2)
- yujamint (25, 1)
- jiyuneel (25, 1)
- junjange (24, 2)
- JoYehyun99 (24, 2)
- whk06061 (24, 1)
- Songusika (24, 1)
- sh1mj1 (23, 2)
- hyemdooly (23, 2)
- ... (잔여 reviewees는 grouped.tsv 참조)

## 캐시 위치

`/tmp/oop-lessons-cache/`:
- `prs.json` — 188개 PR 메타
- `nums.txt` — PR 번호 목록
- `counts.tsv`, `reviewer_counts.tsv`, `authors.tsv`
- `grouped.tsv` — number / reviewer_count / distinct_reviewers / author
- `comments/<N>.json`, `pr_meta/<N>.json`, `reviews/<N>.json`, `issues/<N>.json`

**주의:** `/tmp`는 재부팅 시 사라질 수 있음. 시작 전 캐시 확인 후 없으면 재생성.

## 다음 세션 시작 시

1. 이 파일 + 가장 최근 commit 확인
2. 캐시 존재 여부 확인 (`ls /tmp/oop-lessons-cache/comments/ | wc -l == 133` 이어야)
3. 캐시 있으면 다음 우선순위(chws0508부터) 진행
4. 5-10 PR마다 commit + push로 안전 저장
5. 전체 133개 완료 후 `SUMMARY.md` + `README.md` + 메인 README 링크 작성

## 작성 패턴 (효율을 위해)

- 1단계 PR이 비슷한 안티패턴(Constants, Util, MutableList, Controller 비대 등) 반복하므로 두 번째 라운드부터는 좀 더 짧게 작성
- 핵심 트레이드오프나 새로운 패턴이 나오는 PR에 더 집중
- 사람마다 30-60 lines 정도가 적정 (1단계 = 50-100, 리팩터링/2단계 = 40-70)

## 검증 — 최종 단계에서 수행

- 무작위 3개 PR 파일을 GitHub 원본과 대조
- `grep -r -E "scope function|apply *\{|let *\{|smart cast|nullable|val vs var|data class" lessons/` Kotlin 관용구 누수 점검
- `SUMMARY.md`의 PR 카운트 = 실제 `.md` 수
- 모든 reviewee 폴더에 최소 1개 .md
