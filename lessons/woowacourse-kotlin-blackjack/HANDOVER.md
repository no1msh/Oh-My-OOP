# 다음 세션 인계 — kotlin-blackjack OOP 분석 시작 가이드

> **현재 상태:** 정찰 완료, 데이터 캐시 일부 확보, 분석 미시작.
> **목표:** lotto/racingcar와 동일 패턴으로 blackjack 미션 PR을 분석해 lessons 코퍼스를 만들고, 도출된 안티패턴을 MCP validate 룰로 코드화한다.

---

## 1. 데이터셋 정보

- **출처:** https://github.com/woowacourse/kotlin-blackjack
- **총 closed PR:** 154 (lotto 141, racingcar 133과 유사 규모)
- **PR 번호 범위:** #1 ~ #154
- **고유 reviewee (≥5 thread 필터):** 71명
- **1단계 / 2단계 분포 (≥5):** 71 / 69 (1·2단계가 거의 1:1)

### 분석 대상 필터 (lotto/racingcar 동일)

| 필터 | PR 수 | 비고 |
|---|---|---|
| 리뷰 스레드 ≥5 | **140 PR** | 최종 분석 대상 |
| ≥10 | 126 |
| ≥20 | 73 |
| ≥30 | 32 | 심각 그룹 (가장 풍부한 가르침) |

> ⚠️ "리뷰 스레드 수" 는 GraphQL `reviewThreads.totalCount`. lotto의 `comments` API와 다른 단위이지만 *대략* 1 스레드 = 1 라인 위치. *정확한 라인 코멘트 수*가 필요하면 PR별로 `gh api repos/woowacourse/kotlin-blackjack/pulls/<N>/comments --jq 'length'` 로 재카운트.

---

## 2. 캐시 위치

`/tmp/oop-lessons-cache-blackjack/`:

- `prs.json` — REST API로 받은 closed PR 메타 (154개)
- `gql1.json`, `gql2.json` — GraphQL 페이지별 응답 (총 154 노드)
- `all_prs.json` — 두 페이지 합친 PR 노드 배열
- `counts.tsv` — `PR#\treviewee\tthreadCount\ttitle` (정렬 안 됨, 154행)
- `nums.txt` — PR 번호 목록 (1-154)

**⚠️ `/tmp`는 재부팅 시 사라짐.** 다음 세션 시작 시 캐시 확인 → 없으면 §6 절차로 재생성.

---

## 3. 심각 그룹 (≥30 스레드, 32개) — 가장 먼저 작성 권장

```
PR #78  | dpcks0509       | 58 | 1단계
PR #63  | jinuemong       | 53 | 1단계
PR #65  | kmkim2689       | 50 | 1단계
PR #123 | chanho0908      | 48 | 1단계
PR #125 | jerry8282       | 46 | 1단계
PR #112 | etama123        | 45 | 1단계
PR #28  | inseonyun       | 44 | 1단계
PR #79  | ii2001          | 42 | 1단계
PR #128 | ijh1298         | 41 | 1단계
PR #135 | ijh1298         | 40 | 2단계
PR #114 | moondev03       | 40 | 1단계
PR #92  | jinuemong       | 37 | 2단계
PR #29  | tmdgh1592       | 36 | 1단계
PR #24  | otter66         | 36 | 1단계
PR #116 | donghyun81      | 36 | 1단계
PR #10  | s9hn            | 36 | 1단계
PR #33  | 2chang5         | 35 | 1단계
PR #119 | HamBeomJoon     | 35 | 1단계
PR #17  | rhkrwngud445    | 34 | 1단계
PR #81  | hxeyexn         | 33 | 1단계
PR #34  | re4rk           | 33 | 2단계
PR #25  | whk06061        | 33 | 1단계
PR #111 | oungsi2000      | 33 | 1단계
PR #8   | re4rk           | 32 | 1단계
PR #61  | junjange        | 32 | 1단계
PR #20  | pingu244        | 32 | 1단계
PR #120 | yrsel           | 32 | 1단계
PR #64  | aprilgom        | 31 | 1단계
PR #110 | hwannow         | 31 | 1단계
PR #51  | tmdgh1592       | 30 | 2단계
PR #124 | wondroid-world  | 30 | 1단계
PR #108 | Leeyerin0210    | 30 | 1단계
```

전체 목록은 `counts.tsv` 정렬해서 확인.

---

## 4. 분석 파일 작성 규칙

`lessons/woowacourse-kotlin-blackjack/<reviewee>/<PR>-<단계>-블랙잭.md` 명명 (lotto와 동일).

### 필수 섹션 (lotto/racingcar 패턴)

1. **메타 헤더** — reviewee, PR URL, 단계, 리뷰어, 라인 코멘트 수
2. **잘한 점 (설계 관점)** — 3~7 항목. 설계 통찰 위주, 단순 칭찬 X
3. **못한 점 (설계 관점)** — 안티패턴별 섹션. *코드 스니펫(diff_hunk 또는 본문 인용) 포함 필수*
4. **리뷰어 의견 요지** — 7~10 항목, 짧게
5. **대표 인용** — 3~5 인용. 형식: `> "..." — @reviewer on src/...`
6. **얻은 교훈** — 7~12 항목, 일반화된 설계 원칙

### 금지 사항 (lotto 사족 정리에서 도출)

- ❌ 학생 반성 어휘 (`안타까웠다`, `부끄러웠다`, `🥹/🥲/😅`)
- ❌ 강사 스타일 메타 분석 (`라면 비유 코칭 스타일`, `메타-질문 패턴`)
- ❌ PR 간 학생/강사 진화 비교 (`PR #X 같은 학생 1→2단계 진화`)
- ❌ 우테코 문화 관찰 (`우테코 리뷰어 공통`, `심리적 안전`)
- ❌ 평가성 도입 (`이 PR은 *교과서급* 리뷰`)
- ❌ 메타 라벨 (`(*인용 가치 매우 높음*)`, `(메타-질문 반사)`)

### 유지 대상

- ✅ 객체지향 원칙 (Tell-Don't-Ask, SRP, OCP, Liskov, DIP)
- ✅ 설계 (책임 분배, 도메인 모델링, 패턴: Strategy/Factory/NullObject/Flyweight/State)
- ✅ 테스터빌리티 (Random 외부 주입, given/when/then, fake fixture)
- ✅ Kotlin OOP 어휘 (value class, sealed class, fun interface, operator)
- ✅ MVC, 일급 컬렉션, 원시값 포장, invariant
- ✅ 안티패턴 코드 스니펫 + 리뷰어 설계 통찰 인용

### 스타일 참고

- `lessons/STYLE_GUIDE.md` — racingcar에서 추출한 보편 원칙
- `lessons/woowacourse-kotlin-lotto/SUMMARY.md` — lotto 패턴 인용 형식
- `lessons/woowacourse-kotlin-lotto/<reviewee>/*.md` — 정상 깊이 사례 (예: `parkjiminnnn/146-2단계-로또.md`)

---

## 5. blackjack 도메인 특수 패턴 (lotto에 없음)

분석하면서 다음 도메인 패턴이 새 안티/좋은 패턴을 만들지 주목:

| 패턴 | 설명 | 가능한 안티/MCP 룰 후보 |
|---|---|---|
| **State machine** | 플레이어 상태 전이 (Hit → Stand → Bust → Blackjack) | sealed class로 표현하지 않으면 if/when 분기 폭증 |
| **Ace 양가성** | Ace는 1 또는 11 (핸드 합산 시 동적 결정) | enum + state 결합 / 별도 ValueCalculator 분리 |
| **Player vs Dealer 비대칭** | Dealer는 16 이하면 무조건 Hit (다른 정책) | 상속? 인터페이스? sealed class? |
| **Bet/Profit 계산** | 2단계: 베팅 → 승부 → 수익률 (블랙잭은 1.5배 등) | Money 도메인 분리, 정밀도 (Double vs BigDecimal) |
| **Card 도메인** | Suit (4종) × Rank (13종) → 52장 (Flyweight 후보) | lotto의 LottoNumber Flyweight 패턴 재등장 가능 |

→ 분석 종료 후 §7 **MCP 룰화 검토 단계**에서 위 패턴별 신규 룰 후보 도출.

---

## 6. 작업 순서 권장

### 세션 N (분석 진입)

1. `cat HANDOVER.md` 정독.
2. `lessons/STYLE_GUIDE.md` 정독.
3. `lessons/woowacourse-kotlin-lotto/parkjiminnnn/146-2단계-로또.md` 같은 정상 깊이 사례 1-2개 정독해 *스타일 감 잡기*.
4. 캐시 확인:
   ```bash
   ls /tmp/oop-lessons-cache-blackjack/ 2>&1
   # 없으면 재생성:
   #   mkdir -p /tmp/oop-lessons-cache-blackjack
   #   gh api graphql 또는 gh api ... pulls 로 prs/counts 재구축
   ```
5. **심각 그룹 32개부터 작성** (배치 5개씩, 매 배치마다 commit + npm test 영향 없으니 push는 안 함).
6. 코멘트 dump 방법 (lotto에서 검증됨):
   ```bash
   gh api repos/woowacourse/kotlin-blackjack/pulls/<N>/comments \
     | jq -r '.[] | "=== \(.path) ===\nUSER: \(.user.login)\nBODY:\n\(.body)\nDIFF:\n\(.diff_hunk)\n---"' \
     > /tmp/pr<N>_full.txt
   ```
   읽고 분석 (압축 X — *모든* 코멘트 읽기).

### 세션 N+1, N+2 (계속)

- 중간 그룹 (≥10~29 스레드, 약 94개) 일괄.
- 저-댓글 그룹 (5~9 스레드, 14개) — 짧은 분석이 적정.

### 최종 세션 (마무리)

1. **PROGRESS.md / SUMMARY.md / README.md** 작성 (lotto 패턴).
2. **MCP 룰화 후보 도출** — §5의 도메인 특수 패턴 + 일반 안티패턴을 lotto 룰 5개 추가했던 방식대로 신규 룰 1-3개 작성.
3. `MCP_STRUCTURE.md` §5에 새 후보 추가.
4. `CLAUDE.md` "알려진 추가 작업"에 blackjack 완료 + 신규 룰 후보 명시.

---

## 7. 분석 끝나면 MCP 룰화 검토

lotto 분석 후 5개 신규 룰을 만든 패턴 (`src/validate/<rule>.ts` + `rules.ts` 등록 + `test/unit/validate.rules.test.ts` 케이스 추가).

blackjack 분석에서 **반복적으로 나오는 안티패턴 3개 이상**이라면 룰 후보. 1-2번만 나오면 *코퍼스에만 기록*하고 룰화는 보류.

기존 룰과 충돌/중복 검토 필수 (`MCP_STRUCTURE.md` §4 참조).

---

## 8. 알려진 위험

- **분석 분량이 크다** (140 PR). lotto는 4세션 이상 걸렸음. 한 세션에 모두 끝낼 수 없다고 가정하고 *심각 그룹부터*.
- **`/tmp` 캐시 휘발성.** 세션 시작 시 항상 캐시 검증.
- **사족 누적 위험.** lotto에서 *후반부에 메타 분석이 늘어나* 사족 정리에 별도 세션이 들었음. *첫 PR부터 §4 금지 사항을 엄수*하면 사족 정리 세션 불필요.
- **`reviewThreads` ≠ `comments`** — 카운트 정확성 필요한 경우 PR별로 `comments` API 재카운트.

---

**다음 세션 진입 메시지:** 별도로 작성 예정 (이 HANDOVER.md를 정독시키고 §6 작업 순서 시작 지시).
