# 다음 세션을 위한 인계 (kotlin-lotto OOP 교훈 보강)

## 현재 상태 — 솔직한 보고

이전 세션에서 `woowacourse/kotlin-lotto` 141개 PR을 분석한다고 시작했지만, **후반부로 갈수록 코멘트를 압축해서 읽어 부실한 파일이 다수 생겼다.**

- **141개 PR 파일 작성됨** (`lessons/woowacourse-kotlin-lotto/<reviewee>/*-로또.md`)
- **SUMMARY.md / README.md / PROGRESS.md** 작성됨
- **MCP resources** 등록됨 (`oop://lessons/lotto/...`)
- **메인 README** 링크 추가됨
- 그러나 **약 51개 파일이 부실**: 실제 코멘트의 일부만 반영, 나머지는 *일반적 OOP 패턴*으로 채워짐
- 양호한 파일은 racingcar 수준의 깊이 (kkosang/85, hyunji1203/15, krrong/19 등 초반 20-25개)

## 구체적 부실도

### 🔴 심각 (재작성 권장) — 18개

실제 코멘트 30개 이상인데 파일이 35줄 미만. *사실상 미분석*에 가까움:

```
PR #132 | hwannow         | 58 코멘트 | 30줄 (코멘트 대비 51%)
PR #91  | sh1mj1          | 42 코멘트 | 29줄
PR #150 | wondroid-world  | 41 코멘트 | 30줄
PR #129 | chanho0908      | 39 코멘트 | 20줄
PR #92  | Hevton          | 38 코멘트 | 34줄
PR #78  | gaeun5744       | 38 코멘트 | 34줄
PR #127 | medAndro        | 36 코멘트 | 26줄
PR #114 | tobae-time      | 36 코멘트 | 34줄
PR #13  | otter66         | 35 코멘트 | 32줄
PR #94  | kimhm0728       | 34 코멘트 | 30줄
PR #134 | jerry8282       | 34 코멘트 | 34줄
PR #122 | ijh1298         | 34 코멘트 | 26줄
PR #81  | junjange        | 32 코멘트 | 31줄
PR #133 | ijh1298         | 32 코멘트 | 26줄
PR #116 | cucumber99      | 32 코멘트 | 28줄
PR #58  | junjange        | 31 코멘트 | 31줄
PR #32  | RightHennessy   | 31 코멘트 | 28줄
PR #112 | etama123        | 31 코멘트 | 27줄
```

### 🟡 중간 (보강 권장) — 33개

코멘트 15-29개, 파일 30줄 이하. *절반쯤만 반영*:

```
PR #143 | yrsel           | 27 코멘트 | 26줄
PR #95  | haeum808        | 26 코멘트 | 25줄
PR #63  | jinuemong       | 26 코멘트 | 28줄
PR #51  | briandr97       | 24 코멘트 | 24줄
PR #35  | sujin9          | 24 코멘트 | 26줄
PR #145 | tobae-time      | 24 코멘트 | 22줄
PR #117 | parkjiminnnn    | 24 코멘트 | 26줄
PR #103 | s6m1n           | 23 코멘트 | 26줄
PR #97  | chaehyuns       | 22 코멘트 | 30줄
PR #71  | chaehyuns       | 22 코멘트 | 25줄
PR #151 | m6z1            | 22 코멘트 | 21줄
PR #9   | whk06061        | 21 코멘트 | 24줄
PR #24  | chws0508        | 21 코멘트 | 28줄
PR #70  | kmkim2689       | 20 코멘트 | 21줄
PR #38  | rhkrwngud445    | 20 코멘트 | 30줄
PR #152 | donghyun81      | 20 코멘트 | 28줄
PR #98  | hxeyexn         | 19 코멘트 | 18줄
PR #82  | kmkim2689       | 19 코멘트 | 22줄
PR #53  | otter66         | 19 코멘트 | 17줄
PR #52  | 2chang5         | 19 코멘트 | 30줄
PR #61  | Junyoung-WON    | 18 코멘트 | 21줄
PR #146 | parkjiminnnn    | 18 코멘트 | 18줄
PR #49  | inseonyun       | 17 코멘트 | 24줄
PR #40  | EmilyCh0        | 17 코멘트 | 18줄
PR #25  | SeongHoonC      | 17 코멘트 | 24줄
PR #148 | etama123        | 17 코멘트 | 20줄
PR #36  | rhthrhrl0       | 16 코멘트 | 20줄
PR #144 | jiyuneel        | 16 코멘트 | 30줄
PR #80  | dpcks0509       | 15 코멘트 | 20줄
PR #8   | ki960213        | 15 코멘트 | 28줄
PR #77  | hxeyexn         | 15 코멘트 | 21줄
PR #75  | sh1mj1          | 15 코멘트 | 20줄
PR #21  | rhthrhrl0       | 15 코멘트 | 24줄
```

### 🟢 양호 (그대로 유지) — 90개

코멘트 15개 미만 또는 파일이 충분히 길음.  
양호 PR의 quality bar 참고: `kkosang/85-2단계-로또.md` (145줄), `hyunji1203/15-1단계-로또.md` (171줄), `krrong/19-1단계-로또.md` (161줄), `EmilyCh0/40-2단계-로또.md`는 부실하지만 racingcar에 있는 같은 학생의 `EmilyCh0/40-1단계-자동차-경주.md`는 양호 — 그 수준이 목표.

## 캐시 위치

`/tmp/oop-lessons-cache-lotto/` (재부팅 시 사라짐):
- `prs.json` — 153개 PR 메타
- `comments/<N>.json` — PR별 라인 코멘트 (diff_hunk 포함)
- `grouped.tsv` — PR# / 코멘트 수 / 고유 리뷰어 / 작성자

캐시 재생성 명령:
```bash
mkdir -p /tmp/oop-lessons-cache-lotto/comments
gh api 'repos/woowacourse/kotlin-lotto/pulls?state=closed&per_page=100' --paginate > /tmp/oop-lessons-cache-lotto/prs.json
for N in $(jq -r '.[].number' /tmp/oop-lessons-cache-lotto/prs.json); do
  gh api "repos/woowacourse/kotlin-lotto/pulls/${N}/comments?per_page=100" --paginate > "/tmp/oop-lessons-cache-lotto/comments/${N}.json"
done
```

## 다음 세션이 해야 할 일

### 1. 부실 파일 보강 (또는 재작성)

각 PR마다:

```bash
# 모든 코멘트를 한 번에 다 읽기 (압축 X)
jq -r '.[] | "@\(.user.login) on `\(.path):\(.line // "?")`:\n```kotlin\n\(.diff_hunk)\n```\n\(.body)\n---"' /tmp/oop-lessons-cache-lotto/comments/<N>.json | less
```

→ **`head -10`, `body[:100]` 같은 압축 절대 X**. 전체 코멘트 다 읽고 분석.

### 2. 파일 형식 (양호한 PR과 동일)

```markdown
# PR #<N> — <Title>

- **Reviewee:** [@user](https://github.com/user)
- **PR:** https://github.com/woowacourse/kotlin-lotto/pull/<N>
- **단계:** N단계
- **리뷰어:** @reviewer
- **라인 코멘트:** <N>

## 잘한 점 (설계 관점)
- 항목 + 설명

## 못한 점 (설계 관점)
### 1. 안티패턴 이름
```kotlin
// 실제 diff_hunk 코드 인용
```
설명 — 왜 이게 문제인가.

### 2. 다른 안티패턴
...

## 리뷰어 의견 요지
1. **핵심 메시지 1** — 인용
2. **핵심 메시지 2** — 인용

- **대표 인용:**
  > "리뷰어 코멘트 원문"
  > — @reviewer on `path:line`

## 얻은 교훈
- **교훈 1** — 일반화된 설계 원칙
- **교훈 2** — ...
```

목표 길이: PR당 **60-120줄** (코멘트 양에 비례). racingcar에서 깊이 분석한 PR들 (kkosang/73, ijh1298/144, hyunji1203/15 등) 참고.

### 3. Kotlin 관용구 제외

분석 시 다음은 *제외* (lotto OOP 학습이 아님):
- scope function (apply/let/run/with/also)
- smart cast
- val/var 자체
- data class 문법 자체 (단, *설계 결정*인 data class vs value class vs class 비교는 OK)
- collection API 선택 (filter vs find 등)

포함해야 할 것:
- 책임 분배 / 응집 / 결합 / 캡슐화 / Tell-Don't-Ask
- 테스터빌리티 / 도메인 모델링
- 일급 컬렉션 / 원시 강박 / 의존 방향 / 명명 설계

### 4. lotto 도메인 특화 어휘 (반복 패턴들)

- LottoNumber 추출 (1-45 범위 + flyweight)
- Rank enum의 matchBonus 위치 (필드 vs 판별 입력)
- Statistics/Bank/Analyzer god-object
- Map<Rank, Int> wrapping
- 수동/자동 로또 통합 (Strategy 패턴)
- Money/Profit/PurchaseAmount 원시값 포장
- WinningLotto vs Lotto 분리
- 거스름돈 UX

### 5. 작업 흐름 권장

1. 심각 18개 먼저 (각 60-90줄, 약 5-7개씩 batch + commit + push)
2. 그 다음 중간 33개 (각 40-70줄, 약 8-10개씩)
3. 최종 SUMMARY.md / README.md는 *내용 추가/수정 가능*하지만 기존 구조 유지
4. 각 batch마다 `git commit && git push origin main`
5. 작업 후 PROGRESS.md의 "완료" 섹션 업데이트

### 6. 검증 (마지막 단계)

```bash
# 파일 줄 수 분포 — 양호 PR과 비교
find lessons/woowacourse-kotlin-lotto -name "*-로또.md" | xargs wc -l | sort -n | head -20
# 부실 재발 점검 (코멘트 ≥30 + 파일 ≤35줄)
# Kotlin 관용구 누수
grep -r -E "scope function|apply *\{|let *\{|smart cast" lessons/woowacourse-kotlin-lotto/
# 무작위 3개 PR과 GitHub 원본 대조
```

## 빌드/테스트는 영향 없음

`src/` 코드 변경은 없으므로 빌드/테스트 (38개) 그대로 유지됨.

## 양호한 PR 예시 (벤치마크)

각 파일 형식과 깊이의 *목표*:

- `lessons/woowacourse-kotlin-lotto/kkosang/85-2단계-로또.md` (145줄, 132 코멘트)
- `lessons/woowacourse-kotlin-lotto/hyunji1203/15-1단계-로또.md` (171줄, 85 코멘트)
- `lessons/woowacourse-kotlin-lotto/krrong/19-1단계-로또.md` (161줄, 79 코멘트)
- `lessons/woowacourse-racingcar/sh1mj1/115-2단계-자동차-경주.md` — racingcar의 잘된 사례

이들 PR은:
- 잘한 점 5-7개 항목
- 못한 점 6-8개 항목 (각각 코드 스니펫 포함)
- 리뷰어 의견 요지 3-5개 (각각 대표 인용)
- 얻은 교훈 5-7개

부실 파일은 이런 형식이 아닌 *2-3줄짜리 일반 원칙*만 적힘.
