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

**141 PRs / 71 reviewees 완료** — 2026-05-22

`SUMMARY.md` + `README.md` 작성 완료.

### 부실 파일 보강 — Round 2 (2026-05-22)

이전 세션에서 후반부 51개 파일이 부실하게 작성되어 보강 작업 진행 중. 부실 기준: 코멘트 ≥30개인데 파일 ≤35줄, 또는 코멘트 15-29개에 파일 ≤30줄.

**심각 18개 PR 재작성 완료 (2026-05-22)** — 코멘트 30+ / 파일 35줄 미만:

| PR | Reviewee | 코멘트 | 결과 길이 |
|----|----------|--------|----------|
| #132 | hwannow | 58 | ~140줄 |
| #91  | sh1mj1 | 42 | ~140줄 |
| #150 | wondroid-world | 41 | ~120줄 |
| #129 | chanho0908 | 39 | ~150줄 |
| #92  | Hevton | 38 | ~150줄 |
| #78  | gaeun5744 | 38 | ~140줄 |
| #127 | medAndro | 36 | ~160줄 |
| #114 | tobae-time | 36 | ~140줄 |
| #13  | otter66 | 35 | ~150줄 |
| #94  | kimhm0728 | 34 | ~170줄 |
| #134 | jerry8282 | 34 | ~160줄 |
| #122 | ijh1298 | 34 | ~170줄 |
| #81  | junjange | 32 | ~170줄 |
| #133 | ijh1298 | 32 | ~170줄 |
| #116 | cucumber99 | 32 | ~160줄 |
| #58  | junjange | 31 | ~150줄 |
| #32  | RightHennessy | 31 | ~150줄 |
| #112 | etama123 | 31 | ~170줄 |

작성 방식:
- 전체 코멘트(jq dump) 완독 후 분석 (압축 X)
- 잘한 점 (5-7개) + 못한 점 (9-13개) + 리뷰어 의견 요지 + 대표 인용 + 얻은 교훈
- 안티패턴마다 `diff_hunk` 또는 인용 코드 스니펫 포함
- 양호한 벤치마크 PR (kkosang/85, hyunji1203/15) 수준으로 깊이 맞춤
- Kotlin idiom 제외, OOP 설계만 (책임/응집/결합/Tell-Don't-Ask/도메인 모델링)

### 중간 33개 PR 보강 완료 (2026-05-22)

코멘트 15-29개에 파일 ≤30줄이던 33개 PR. **모두 80-200줄로 보강 완료**.

#143, 95, 63, 51, 35, 145, 117, 103, 97, 71, 151, 9, 24, 70, 38, 152, 98, 82, 53, 52, 61, 146, 49, 40, 25, 148, 36, 144, 80, 8, 77, 75, 21

작성 방식 (심각 18개와 동일 수준):
- 잘한 점 (3-7개) + 못한 점 (6-12개, 각 코드 스니펫 포함) + 리뷰어 의견 요지 + 대표 인용 (4개) + 얻은 교훈 (7-11개)
- 모든 reviewer 코멘트를 *압축 없이* 전부 인용
- 학생 자가 의문 + 리뷰어 응답 + 후속 라운드 응답 모두 캡처

## 진행 상태

**심각 18 PR + 중간 33 PR = 51개 PR 보강 완료 (2026-05-22)**

전체 141 PR 분석 자료 정상 깊이로 정리 완료.

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
