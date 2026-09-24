# kotlin-blackjack OOP 분석 — 인계

> 분석 대상은 우아한테크코스 Kotlin Blackjack 미션의 PR 기록이다. 이 문서는 분석 진행 이력과 반복 확인된 설계 문제를 정리한다.

---

## 1. 진행 현황

### 완료 (≥30 심각 그룹 32/32 + 중간 그룹 batch 8·9)

`git log --oneline` 으로 9 배치 + 2 commit 확인:

| Batch | Commit | 분석한 PR |
|---|---|---|
| 1 | `99a62c6` | #78, #63, #65, #123, #125 |
| 2 | `149b639` | #112, #28, #79, #128, #135 |
| 3 | `00f0c06` | #114, #92, #29, #24, #116 |
| 4 | `47531b2` | #10, #33, #119, #17, #81 |
| 5 | `bba52ec` | #34, #25, #111, #8, #61 |
| 6 | `5bcd8a2` | #20, #120, #64, #110, #51 |
| 7 | `ae98945` | #124, #108 |
| 8 | `3bcea6d` | #152, #133, #131, #132, #136 |
| 9 | `108c118` | #88, #85, #90, #93, #103 |
| 10 | `a721ab4` | #41, #49, #53, #58, #137 |
| 11 | `91671c3` | #146, #147, #148, #151 |
| 12 | `64b00c9` | #75, #74, #70, #32, #67 |
| 13 | `8afa82d` | #98, #95, #99, #23, #26 |
| 14 | `a0fbf02` | #39, #43, #46, #16, #77 |
| 15 | `aa9776e` | #91, #9, #31, #66, #107 |
| 16 | `6dd65c5` | #145, #11, #13, #76, #82 |
| 17 | `cce33fd` | #86, #100, #22, #72, #80 |
| 18 | `93758d1` | #48, #14, #18, #73, #106 |
| 19 | `2bd2c8f` | #36, #87, #21, #117, #129 |
| 20 | `f0b989e` | #138, #139, #35, #126, #130 |
| 21 | `0380d00` | #142, #143, #109, #113, #118 |
| 22 | `7b104fb` | #140, #141, #96, #121, #19 |
| 23 | `a8d6ba3` | #149, #153, #71, #68, #69 |
| 24 | `00ab0b9` | #94, #102, #122, #144, #15 |
| 25 | `0cd59b9` | #12, #38, #115, #154, #47 |
| 26 | `4488d04` | #30, #42, #62, #89, #54 |

| 27 | `fd07c66` | #37, #134, #101, #97, #150 |

| 28 | 작업 문서 반영 대기 | #50, #105, #59, #52 |

현재 폴더에는 70개 reviewee 디렉토리와 135개 PR 분석 문서가 있다. 앞선 batch별 PR 번호와 커밋은 위 표에 기록했다.

---

## 2. 누적 안티패턴 강도 (MCP 룰화 후보)

세션 N에서 30 PR 분석 후 *반복 등장 횟수 ≥5*인 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 우선순위 |
|---|---|---|
| **enum의 UI value (`koreanText`/`description`/`word`/`value`/`displayName`)** | **17+** | ⭐⭐⭐ 최강 |
| **승부 = 참가자 메시지 (정적 `judge(dealer, player)` 회피)** | **18+** | ⭐⭐⭐ |
| **Singleton Deck (`object`) = 테스터빌리티 ↓ + 2판 이상 불가** | **11+** | ⭐⭐ |
| **외부 `MutableList<Card>` 참조 누수 (lotto `empty-object-external-fill` 변형)** | **12+** | ⭐⭐ (기존 룰 변형) |
| **Ace 11 기본 + while/차감 보정 < Ace 1 기본 + 단일 +10 룰** | **11+** | ⭐⭐ |
| **블랙잭 룰 오해 (Ace+10 두 장만 진짜 블랙잭 / Bust 양측 / 21 ≠ 블랙잭 / 16이하 반복)** | **10+** | ⭐⭐ (도메인 특수) |
| **Controller god-object + 절차적 명령 (`game.data → loop → game.method`)** | **11+** | ⭐⭐ |
| **점수 계산이 Player에 = Hand/Card 책임 누수** | **9+** | ⭐⭐ |
| **만능 명사 (`Manager`/`Information`/`Rule`/`Value`/`Wallet`/`Base*`/`UserInfo`)** | **8+** | ⭐⭐ (기존 `vague-class-name` 룰 확장) |
| **`lateinit var callback` + setter (호출 순서 invariant 부재)** | **7+** | ⭐ |
| **`apply`/`with`/DSL Builder의 의도 위반 = 수업 적용 욕구** | **6+** | ⭐ |
| **`open class Player` + `Dealer : Player` < `abstract Participant`** | **5+** | ⭐ |
| **형식 규칙(3변수 제한)이 만든 인공 객체 (`Wallet`/`PlayerBetInfo`/`UserInformation`)** | **3** | ⭐ (도메인 특수) |
| **State 패턴의 *전이 누락* (Hit→Stay/BlackJack/Bust)** | **3+** | ⭐ (State 도입 PR 한정) |
| **잘못된 함수명 (`isACE`/`JUMP`/`takeCard`/`deepCopy`/`showCard`/`runPhase`)** | **6+** | ⭐ |

### 신규 도메인 특수 (lotto에 없음)

1. **`State` sealed interface** — Running(Hit) / Finished(Stay/Bust/BlackJack). 신규 룰 `state-machine-without-sealed`?
2. **`Ace` 1↔11 양가성** — 8개+ PR 동일한 *while + 차감* 안티패턴.
3. **"카드 배부 진행자가 누구?"** — Dealer? Blackjack? Game? `dealer-vs-progressor-conflation` 룰 후보.
4. **`Deck` 자료구조** — Set/재귀 / Singleton / `ArrayDeque`/`MutableList` 선택.
5. **블랙잭 룰 정확성** — *Ace+10 두 장*, *Bust 개별 판정*, *딜러 자동 hit ≤16* — `blackjack-rule-fidelity` 후보.

---

## 4. 분석 기록 기준

- 구체적인 코드, 설계 문제, 피드백 근거와 대안의 트레이드오프를 기록한다.
- 반복 패턴은 대표 PR을 연결하고, 블랙잭 규칙과 구현이 어긋난 경우 규칙·코드 위치를 구분한다.
- 직접 인용은 출처와 PR 링크를 함께 보존한다.

---

## 6. 최종 정리 단계 (모든 분석 끝난 후)

다음을 수행:

1. **`PROGRESS.md` 작성** — lotto 패턴. 모든 PR 목록 + 짧은 한 줄 요약.
2. **`SUMMARY.md` 작성** — 룰 ↔ 대표 PR 매핑 (lotto 인덱스 패턴).
3. **`README.md`** — 코퍼스 사용 가이드.
4. **MCP 룰화 검토** — §2의 ⭐⭐⭐ 패턴 3-5개를 *validate 룰*로 (`src/validate/<rule>.ts` + `rules.ts` 등록 + 테스트 케이스).
5. **`MCP_STRUCTURE.md` §5에 신규 후보 추가** — 도메인 특수 패턴 (State 패턴, Ace, 블랙잭 룰 정확성, Dealer 진행자 vs 참여자).
6. **`CLAUDE.md` "알려진 추가 작업"에 blackjack 완료 명시 + 신규 룰 후보 정리**.

---

## 분석 한계

PR 스레드 수와 일반 댓글 수는 집계 기준이 다를 수 있다. 숫자로 그룹을 비교할 때는 reviewThreads와 comments를 구분한다.

## 10. batch 10·11 신규 안티패턴 (누적)

batch 10·11 (#41, #49, #53, #58, #137, #146, #147, #148, #151) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **상태 × 참가자 N×M 클래스 폭증** (Initial/Playing/Finished × Dealer/Player) | 1 (#147) | ⭐⭐ — `state-times-actor-class-explosion` |
| **`Hit + 주체` (DealerHit/PlayerHit/DoubleHit) 폭증** | 1 (#147) | ⭐ |
| **`Finished is-a Initial` 상속 모순** | 1 (#147) | ⭐ |
| **`ProfitPlayer / MatchResultProfitPlayerWithXXX` 기능 + 명사 이어붙이기 폭증** | 1 (#147) | ⭐⭐ — `feature-class-naming-explosion` |
| **typealias vs 클래스 트레이드오프 (3+ 멤버 = 클래스 권고)** | 1 (#146) | ⭐ — `typealias-vs-class` |
| **불변 객체에 대한 불필요한 방어적 복사 (`deepCopy`)** | 2 (#137·#148) | ⭐⭐ — `defensive-copy-on-immutable` |
| **`canHit` vs `isBust` 부울 의미 일관 (True 방향 통일)** | 1 (#151) | ⭐ |
| **View와 도메인 검증 분리 (다중 플랫폼에서 UI 검증 누락 위험)** | 2 (#41·#151) | ⭐⭐ — `view-only-validation-cross-ui-fragility` |
| **역할과 상태 혼동 (`Player`는 역할, `GameResult`는 상태)** | 1 (#148) | ⭐⭐ — `role-state-conflation` |
| **참가자 vs 참가자 일반화 (플레이어 vs 플레이어, 딜러 vs 딜러)** | 4 (#148·#151·#49·#132) | ⭐⭐⭐ 메이저 |
| **`Listener` vs 고차함수 콜백 트레이드오프** | 1 (#148) | ⭐ |
| **Controller stateless 재사용 vs in-place 변경** | 1 (#151) | ⭐ |
| **`Map<X, X>` 자료구조 우회 인스턴스 변수 제약** | 1 (#151) | ⭐ |
| **카지노 6덱 메타포 vs 요구사항 트레이드오프** | 1 (#58) | ⭐ |
| **`data class + private constructor copy 우회 함정`** | 1 (#58) | ⭐ |
| **`println` 도메인 X (간접 lambda 도 결합)** | 1 (#137) | ⭐ |
| **enum + when exhaustive 활용 (else 불필요)** | 다수 (#137·#148·#90 외) | ⭐⭐ |
| **`onXX` 콜백을 통한 제어 역전** | 2 (#137·#132) | ⭐⭐ |

## 8. 중간 그룹 신규 안티패턴 (batch 8·9 누적)

≥10~29 그룹의 *2단계 특수 패턴* (베팅/수익률/블랙잭 1.5배):

| 패턴 | 등장 PR 수 (batch 8·9) | MCP 룰 후보 |
|---|---|---|
| **`Money 가변 + operator plus Unit 반환`** = 가변 + 연산자 오버로딩 상성 | 3+ (#133·#132·#90) | ⭐⭐ — Kotlin 어휘 |
| **3 변수 제약 부산물 인공 객체** (Items / GameInformation / BetStatus / BlackJackPair / UserInfo) | 5+ (#133·#88·#132·#136·#93) | ⭐⭐ |
| **수익률 계산 책임 위치 토론** (Player/Participant vs Result 객체) | 모든 2단계 PR | (트레이드오프 — 룰화 어려움) |
| **`-0.0` Double IEEE 754 함정 우회** | 1 (#131) | ⭐ — 도메인 특수 |
| **`Bust.earningRate` Dead code** (sealed 추상 메서드 통일 부작용) | 1+ (#93) | ⭐ |
| **`sealed without differentiation`** (멤버 별 데이터 차이 없는 sealed) | 1 (#93) | ⭐⭐ — Kotlin 어휘 |
| **`view-as-raw-input-converter`** (Controller에서 raw String → ActionType 변환) | 2 (#132·#90) | ⭐⭐ |
| **`view-by-stage-split`** (View 를 단계별 분리: SettingView/ProgressView) | 2 (#88·#131) | ⭐ |
| **`bidirectional-dependency`** (부모-자식 양방향 의존) | 1 (#93) | ⭐ |
| **`let-run-elvis-pitfall`** (Kotlin scope function null 함정) | 1 (#93) | ⭐ — Kotlin 한정 |
| **State 패턴 정공 vs interface vs enum 트레이드오프** | 모든 2단계 PR | (도메인 정합 룰) |
| **`action-and-state-enum-conflation`** (HIT/STAND enum 에 Bust 흡수) | 1 (#90) | ⭐ |

### 신규 도메인 특수 (batch 8·9)

1. **블랙잭 1.5배 분기**: `BlackjackWin` 별도 결과 멤버 vs *Win + isBlackjack 분기* — 트레이드오프.
2. **딜러 ≠ 플레이어 도메인 차이** = *Dealer 베팅 안 함*. 명시적 멤버 차이로 표현.
3. **`Card private constructor + named factory`** (PR #133, #93, #136 정공) vs *invoke 함정* (PR #108 1단계).
4. **State 객체 = `compareTo(other: State): GameResult`** 다형성 (PR #93·#136·#152) vs *Judge 정적 헬퍼 + difference 변환* (PR #90).
