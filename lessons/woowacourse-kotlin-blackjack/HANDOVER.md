# kotlin-blackjack OOP 분석 — 인계 (동일 리뷰이 2단계 완료 시점, batch 11)

> **현재 상태 (2026-05-23 세션 N+3 기준):** ≥30 심각 그룹 **32/32 완료** + ≥10~29 중간 그룹 *동일 리뷰이 1단계+2단계 완성 (총 23 PR 추가)*. **양 단계 모두 분석된 reviewees 18명**. 다음 = 새 reviewees 진입.

---

## 1. 진행 현황

### 완료 (≥30 심각 그룹 32/32 + 중간 그룹 batch 8·9)

`git log --oneline` 으로 9 배치 + 2 commit 확인:

| Batch | Commit | PR 목록 | 그룹 |
|---|---|---|---|
| 1 | `99a62c6` | #78, #63, #65, #123, #125 | ≥30 |
| 2 | `149b639` | #112, #28, #79, #128, #135 | ≥30 |
| 3 | `00f0c06` | #114, #92, #29, #24, #116 | ≥30 |
| 4 | `47531b2` | #10, #33, #119, #17, #81 | ≥30 |
| 5 | `bba52ec` | #34, #25, #111, #8, #61 | ≥30 |
| 6 | `5bcd8a2` | #20, #120, #64, #110, #51 | ≥30 |
| 7 | `ae98945` | #124, #108 | ≥30 마무리 |
| 8 | `3bcea6d` | #152, #133, #131, #132, #136 | 중간 (≥10~29, 동일 리뷰이 1→2단계) |
| 9 | `108c118` | #88, #85, #90, #93, #103 | 중간 (동일 리뷰이 2단계) |
| 10 | `a721ab4` | #41, #49, #53, #58, #137 | 중간 (동일 리뷰이 2단계) |
| 11 | `91671c3` | #146, #147, #148, #151 | 중간 (동일 리뷰이 2단계 마지막) |
| 12 | `64b00c9` | #75, #74, #70, #32, #67 | 새 1단계 reviewees (sh1mj1, songpink, chaehyuns, krrong, s6m1n) + 신규 reviewer (vagabond95, KwonDae) |
| 13 | `8afa82d` | #98, #95, #99, #23, #26 | batch 12 reviewees (chaehyuns/songpink/s6m1n) 2단계 양 단계 완성 + 2023년 3월 코호트 진입 (rhthrhrl0, chws0508) |
| 14 | `a0fbf02` | #39, #43, #46, #16, #77 | batch 13 reviewees (rhthrhrl0/chws0508) 2단계 + krrong 2단계 완성 (양 단계 28명) + 새 1단계 reviewees (SeongHoonC, murjune) + 신규 reviewer BeokBeok |
| 15 | `aa9776e` | #91, #9, #31, #66, #107 | murjune 2단계 완성 (양 단계 29명) + 새 1단계 reviewees 4명 (Choisehyeon/no1msh/JoYehyun99/junseo511). **메타 케이스: no1msh = MCP `oh-my-oop` 저자 (반달) 학생 시기 PR** |
| 16 | `6dd65c5` | #145, #11, #13, #76, #82 | junseo511 2단계 완성 (양 단계 30명) + 새 1단계 reviewees 4명 (ki960213/hyunji1203/Yunseok-Nam/Hevton). **2023년 3월 코호트 6 PR + 2024 코호트 풍부** |

reviewee 디렉토리 46개 (양 단계 완성 30명 + 1단계만 16명) + HANDOVER. **양 단계 모두 분석된 reviewees (18명):** ijh1298, jinuemong, re4rk, tmdgh1592, wondroid-world, Leeyerin0210, moondev03, hwannow, oungsi2000, dpcks0509, ii2001, kmkim2689, junjange, hxeyexn, pingu244, inseonyun, whk06061, otter66, HamBeomJoon, yrsel, donghyun81, etama123, jerry8282 (실제 18명).

**reviewer 다양성:** @laco-dev (페로로), @malibinYun (말리빈), @Gyuil-Hwnag (두루), @namjackson (잭슨), @lee-ji-hoon (지훈), @krrong (크롱), @vagabond95 (racingcar 인용 reviewer), @KwonDae — *총 8 reviewer*.

**메타 학습 케이스:** 학생 krrong (PR #32) = PR #148·#151 의 reviewer 본인 — 학생/reviewer 동시 등장.

### 남은 작업

| 그룹 | PR 수 | 다음 작업 |
|---|---|---|
| ≥30 스레드 | **0개** | 완료 ✓ |
| 동일 리뷰이 2단계 미분석 | **0개** | 완료 ✓ |
| 새 1단계 reviewees (≥10~29) | ~10-15개 | 다음 우선 (jiyuneel, parkjiminnnn, rosemin928, m6z1, doabletuple, gahyunkim, junseo511, medAndro, cucumber99, tobae-time, devfeijoa 등 — 1단계 미분석 reviewees) |
| 새 2단계 reviewees | ~60-65개 | 후속 |
| 5~9 | 14개 | 짧은 분석 |

> ⚠ **`/tmp/oop-lessons-cache-blackjack/`은 휘발성**. 다음 세션 시작 시 `ls /tmp/oop-lessons-cache-blackjack/` 확인. 캐시 없으면 §6 절차 (HANDOVER 원본) 재실행. 단 *각 PR 코멘트는 `/tmp/pr<N>_full.txt`에 즉시 dump* 가능 (gh CLI).

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

## 3. 학생/리뷰어 패턴 (사족 X, 분석에 도움되는 메타 정보)

### 학생 자가 토론이 풍부한 PR (학습 가시화 모범)

PR #128/#135 (ijh1298), #111 (oungsi2000), #110 (hwannow), #120 (yrsel), #29 (tmdgh1592), #63 (jinuemong) — *PR 본문/코멘트에 자가 의문 + 자가 답변 명시*.

→ 학생이 *자가 의문 → 리뷰어 메타 질문 → 자가 답변*으로 정답 도달하는 패턴. *분석 시 인용 가치 ↑*.

### 같은 코드 / 다른 리뷰어 케이스

- PR #78 (dpcks0509, reviewer Gyuil-Hwnag) vs PR #79 (ii2001, reviewer laco-dev) — *동일 코드 다른 리뷰어 = 안티패턴이 코드 자체의 문제임을 증명* (룰화 신뢰도 ↑).
- PR #24 (otter66, reviewer laco-dev) vs PR #25 (whk06061, reviewer namjackson) — 거의 동일 코드. 리뷰 토론 결은 다름.
- PR #111 (oungsi2000) vs PR #112 (etama123) — 코드 구조 매우 유사.

### 페어 / 동일 학생 1단계+2단계

| 학생 | 1단계 | 2단계 |
|---|---|---|
| ijh1298 | #128 | #135 |
| jinuemong | #63 | #92 |
| re4rk | #8 | #34 |
| tmdgh1592 | #29 | #51 |

→ *진화 비교는 사족 금지* (HANDOVER §4). 다만 *2단계 신규 기능*(베팅, 수익률, 블랙잭 1.5배)은 *별도 패턴*으로 기록.

---

## 4. 분석 파일 작성 규칙 (변동 없음 + 신규 권고)

기본 §4 규칙 + 세션 N에서 굳어진 추가:

### 작성 길이 휴리스틱

- 학생 자가 토론 풍부 → **1000~1500줄** (예: PR #128·#135·#111·#120)
- 표준 리뷰 → **800~1100줄** (예: PR #20·#64)
- PR #24 같은 *공통 코드 다른 PR* → **400~600줄** ("PR #N과 공통 + 추가 패턴만")

### 신규 권고

1. **누적 패턴 ≥5인 안티패턴은 *§N에서 결*로 간략 인용** — 본 분석에서 *반복 텍스트 작성 방지*. 예: "PR #28·#78·#112·#125와 같은 결".
2. **블랙잭 룰 오해 발견 시 *명시*** — 학생/리뷰어/코드 어디서 룰이 어긋났는지.
3. **학생 자가 답변이 *정답 도달*하면 *대표 인용*에 학생 코멘트 직접 인용** — 학습 모범 사례 기록.

---

## 5. 다음 세션 진입 순서

### 권장 첫 단계

1. `cat HANDOVER.md` (이 문서) 정독.
2. `ls /tmp/oop-lessons-cache-blackjack/` — 캐시 확인.
3. **이미 작성된 PR 1개 정독** (가벼운 거 권장 — `chanho0908/123-1단계-블랙잭.md` 또는 `donghyun81/116-1단계-블랙잭.md`) → 스타일 감 회복.
4. **남은 ≥30 그룹 2개부터 마무리** — `#124 wondroid-world`, `#108 Leeyerin0210`.
5. 그 뒤 ≥10~29 그룹 진입 (배치 5개씩, 각 배치마다 commit).

### 진행 방식 자가 점검

- *배치 5개씩* + *5 PR 끝나면 commit + push 안 함* 유지.
- *공통 안티패턴은 짧게 인용으로*, *PR 특이 패턴은 길게*.
- *학생 자가 의문/답변* 발견 시 *대표 인용*에 넣고 *얻은 교훈*에 학습 패턴 명시.

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

## 7. 위험 / 메모

- ***/tmp 캐시 휘발성*** — 매 세션 첫 작업이 캐시 확인.
- ***컨텍스트 관리*** — 본 세션 N에서 *6 배치 = 30 PR 분석*에 *800k 토큰*. *한 세션에 6 배치가 적정 한계*. 더 진행하려면 `/compact` 또는 세션 종료.
- ***PR #124, #108은 실제 라인 코멘트 수는 30 미달 가능성*** — `reviewThreads` vs `comments` 단위 차이.

---

**최근 commit (세션 N+3 batch 10·11, 9 PR 추가):** `a721ab4` (batch 10 동일 리뷰이 2단계 5개), `91671c3` (batch 11 동일 리뷰이 2단계 마지막 4개). *전체 batch 7~11 누계: 23 PR 추가 + 2 HANDOVER update*. `git push` 는 안 함 (HANDOVER 원본 정책 유지).

## 10. batch 10·11 신규 안티패턴 (누적)

batch 10·11 (#41, #49, #53, #58, #137, #146, #147, #148, #151) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **상태 × 참가자 N×M 클래스 폭증** (Initial/Playing/Finished × Dealer/Player) | 1 (#147) | ⭐⭐ — `state-times-actor-class-explosion` |
| **`Hit + 주체` (DealerHit/PlayerHit/DoubleHit) 폭증** | 1 (#147) | ⭐ |
| **`Finished is-a Initial` 상속 모순** | 1 (#147) | ⭐ |
| **`ProfitPlayer / MatchResultProfitPlayerWithXXX` 기능 + 명사 이어붙이기 폭증** | 1 (#147) | ⭐⭐ — `feature-class-naming-explosion` |
| **typealias vs 클래스 트레이드오프 (3+ 멤버 = 클래스 권고)** | 1 (#146) | ⭐ — `typealias-vs-class` |
| **방어적 복사 강박 자가 학습 (불변 객체 deepCopy 비용)** | 2 (#137·#148) | ⭐⭐ — `defensive-copy-on-immutable` |
| **`canHit` vs `isBust` 부울 의미 일관 (True 방향 통일)** | 1 (#151) | ⭐ |
| **View vs 도메인 검증 학생 자가 토론 깊이 (Multi-platform 함정)** | 2 (#41·#151) | ⭐⭐ — `view-only-validation-cross-ui-fragility` |
| **역할 vs 상태 자가 학습 (Player=역할, GameResult=상태)** | 1 (#148) | ⭐⭐ — `role-state-conflation` |
| **참가자 vs 참가자 일반화 (플레이어 vs 플레이어, 딜러 vs 딜러)** | 4 (#148·#151·#49·#132) | ⭐⭐⭐ 메이저 |
| **`Listener` vs 고차함수 콜백 트레이드오프** | 1 (#148) | ⭐ |
| **Controller stateless 재사용 vs in-place 변경** | 1 (#151) | ⭐ |
| **`Map<X, X>` 자료구조 우회 인스턴스 변수 제약** | 1 (#151) | ⭐ |
| **카지노 6덱 메타포 vs 요구사항 트레이드오프** | 1 (#58) | ⭐ |
| **`data class + private constructor copy 우회 함정`** | 1 (#58) | ⭐ |
| **`println` 도메인 X (간접 lambda 도 결합)** | 1 (#137) | ⭐ |
| **enum + when exhaustive 활용 (else 불필요)** | 다수 (#137·#148·#90 외) | ⭐⭐ |
| **`onXX` 콜백 어휘 (Inversion of Control)** | 2 (#137·#132) | ⭐⭐ |
| **반란군 비유 (요구사항 vs 좋은 설계 자유 인정)** | 1 (#151) | (reviewer 어휘) |

### batch 10·11 신규 reviewer

- @namjackson (잭슨): #41 (핑구), #53 (베리) — *학생 자가 학습 메타 질문 + 트레이드오프 명시*
- @lee-ji-hoon (지훈) [신규]: #137 (미플) — *원시값 포장 + onXX 콜백 + 어휘 양방향 학습*
- @krrong (크롱) [신규]: #148 (타마), #151 (제리) — *역할 vs 상태 + 추상화 확장 (참가자 vs 참가자) + 반란군 비유*

## 16. batch 16 신규 안티패턴 + 메타 어휘 (누적)

batch 16 (#145, #11, #13, #76, #82) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **`manager-class-proliferation`** (Manager 폭증 = 빈약 Model) | 1 (#145) | ⭐⭐⭐ |
| **`responsibility-extraction-overcorrection`** (PR #107 자가 도입 → PR #145 안티패턴 전환) | 1 (#145) | ⭐⭐ |
| **`function-vs-lambda-naming-perspective`** (함수=수신/람다=공급 시점) | 1 (#145) | ⭐ |
| **`map-to-domain-object-migration`** (Map → Domain 2 이유 자가 명시) | 1 (#145) | ⭐ |
| **`view-domain-object-creation-locus`** (View 가 Domain 객체 생성 양가성) | 1 (#145) | ⭐⭐ |
| **`meaningless-stdlib-test`** (Kotlin operator fun 테스트 무의미) | 1 (#145) | ⭐⭐ |
| **`branch-order-readability-vs-logic`** (BLACKJACK 우선 미적 vs BUST 우선 논리) | 1 (#145) | ⭐ |
| **`code-format-readability-convention`** (abstract val / val / abstract fun / fun 순서) | 1 (#145) | ⭐ |
| **`business-rule-explicit-in-code`** (항상 true 인 조건문 = 비즈니스 룰 명시 의도) | 1 (#11) | ⭐⭐ |
| **`set-vs-list-firstclass-collection`** (Set = 의도 명시 / List = 사용자 친화 검증 양가성) | 1 (#11) | ⭐⭐ |
| **`single-locale-method-name`** (toKorean 한국어 한정 명명) | 1 (#11) | ⭐⭐ |
| **`general-name-class-bloat`** (Const.kt, BlackJackRule.kt, misc 일반 명명 비대화) | 3 (#11·#13·#16) | ⭐⭐ |
| **`inconsistent-accessor-pattern`** (value vs toList vs cards 혼재) | 1 (#11) | ⭐ |
| **`inconsistent-approach-pattern`** (비슷한 일 = 비슷한 방식 X) | 1 (#13) | ⭐ |
| **`input-retry-cohesion`** (ReadValueSureModifier 응집) | 1 (#11) | ⭐ |
| **`etc-package-anti-pattern`** (etc/common/misc 패키지 = 마지막 수단) | 1 (#13) | ⭐⭐ |
| **`kotlin-function-locus-criteria`** (클래스 내부 vs top-level extension vs object function 기준) | 1 (#13) | ⭐⭐⭐ |
| **`factory-method-discoverability`** (생성자 미차단 + 팩토리 = 발견 어려움) | 1 (#76) | ⭐⭐ |
| **`pattern-applied-without-need`** (팩토리 메서드/Manager/Builder *그저 좋다 생각만*) | 4 (#76·#145·#39·#31) | ⭐⭐⭐ |
| **`proxy-object-anti-pattern`** (대리자 = 데이터 외부 주입 + 행동 위탁) | 1 (#76) | ⭐⭐ |
| **`domain-object-string-input-leak`** (Card.of(String) View 입력 의존) | 1 (#76) | ⭐⭐ |
| **`constant-locus-meaning-cohesion`** (Denomination 10 = 카드 합계 영역) | 1 (#76) | ⭐⭐ |
| **`jvm-type-erase-factory-justification`** (List<T> 시그니처 충돌 = 팩토리 정공) | 1 (#76) | ⭐ |
| **`test-readability-pause-anti-pattern`** (복잡 로직 = 머릿속 계산 강제) | 1 (#76) | ⭐ |
| **`maintainer-perspective-locator`** (기획자 요구사항 + 동료 개발자 위치) | 다수 (#82·#107·#145·#46·#91) | ⭐⭐⭐ |
| **`intermediate-object-without-role`** (Answer 단순 변환만 = 존재 가치 의문) | 1 (#82) | ⭐⭐ |
| **`test-classification-domain-vs-view`** (입력 변환 = View 테스트 / 비즈니스 = 도메인) | 1 (#82) | ⭐⭐ |
| **`hand-deck-conflation`** (Hand 가 Deck 보유 = 의미 혼동) | 1 (#82) | ⭐⭐ |
| **`requirement-vs-natural-modeling-conflict`** (인덴트 depth 강제 = 부자연스러운 상수) | 1 (#82) | ⭐⭐ |
| **`dependency-graph-self-review`** (PR 본문 의존성 그래프 첨부 + 자가 검토) | 1 (#82) | ⭐⭐ |
| **`nested-loop-to-flatmap`** (Kotlin 어휘 = depth 회피) | 1 (#82) | ⭐ |
| **`controller-vs-game-manager-distinction`** (Controller = 게임장 / GameManager = 매 게임 관리자) | 1 (#82) | ⭐ |

### batch 16 메타 어휘 (MCP `oh-my-oop` 핵심 가치와 일치)

- **`9 reviewer 메타 어휘 완전 합류 확인`** — vagabond95 *"저의 개인적인 경험으로"* (#11) + 말리빈 *"필요에 의해서 추가 및 수정함"* (#76) + KwonDae *"기획자 요구사항이 왔을 때 동료 개발자가 어디를 가장 먼저 살펴보게 될까요?"* (#82) + lee-ji-hoon *"의견을 너무 어필 시 그대로 따라갈까 봐 추상적 표현"* (#145).
- **`히스토리를 들어보니`** (vagabond95 #11) — *대화형 분석 메타*.
- **`reviewer 자가 사과 + 의도 명확화`** — KwonDae #82 *"헷갈리게 말씀드린거 같네요 🥲"*, lee-ji-hoon #145 *"의견을 너무 어필 시"*.
- **`친밀한 이모지 어조`** — *🫠 🥲 🤔 👀 😅 😢* — *학생/reviewer 양측 친밀 어조 모든 PR 일관*.
- **`학생 자가 *그저 좋다 생각만* 자가 인정`** — Yunseok-Nam #76 *"팩토리메서드가 그저 좋다라는 것만 생각하고 일단 생성한 다음 의미를 부여한것 같다"* / junseo511 #145 *"Manager 폭증"* / rhthrhrl0 #39 *"일급 컬렉션 과적용"* / no1msh #31 *"Builder 패턴 불필요"*. **MCP 룰 `pattern-applied-without-need` 강화**.

### batch 16 신규 reviewer

- 없음. 9 reviewer 안정 (말리빈/잭슨/두루/페로로/지훈/크롱/vagabond95/BeokBeok/KwonDae).

### batch 16 코호트 분포 확장

- **2023년 3월 코호트 (PR ≤ 60):** PR #9·#11·#13·#16·#23·#26·#31·#33·#39·#43·#46 (#33 batch 4 이미 분석) — *11 PR 분석*.
- **2024 코호트 (PR ≥ 60):** *나머지 35+ PR* — *압도적 다수*.
- **2024 코호트가 *학생 자가 학습 가시화 매개* + *PR 본문 자가 의문* 풍부 시리즈 (PR #91·#107·#46·#77·#82·#145·#137·#148·#151·#46·#136 등)**.
- **2023년 3월 코호트는 *외부 글 추천 + 요구사항 인용 + 한글 변수* 패턴 풍부 (PR #11·#13·#16·#23·#26·#9 — 벅벅/말리빈/잭슨/vagabond95)**.

## 15. batch 15 신규 안티패턴 + 메타 어휘 (누적)

batch 15 (#91, #9, #31, #66, #107) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **`uimodel-passive-vs-active-tension`** (UiModel 자립적 vs 데이터 운반자 양가성) | 1 (#91) | ⭐⭐ |
| **`sealed-class-when-exhaustive`** (학생 자가 정리 강화) | 1 (#91) | ⭐⭐⭐ (누적 #98·#137·#148·#90·#146·#16·#91) |
| **`runcatching-locus`** (View 입력 + Result 반환 위치) | 1 (#91) | ⭐⭐ |
| **`error-classification-locus`** (논리적 오류 vs 입력 오류) | 1 (#91) | ⭐⭐ |
| **`extension-function-domain-misuse`** (확장 함수 외부 발견 어려움) | 1 (#9) | ⭐⭐ |
| **`builder-call-order-dependency`** (Builder 호출 순서 의존) | 2 (#9·#31) | ⭐⭐ |
| **`dto-conversion-locus`** (Domain 이 DTO 반환 = 테스트 어려움) | 1 (#31) | ⭐⭐ |
| **`dealer-extends-player-lsp-violation`** (Dealer is-a Player 의미적 위반) | 2 (#31·#95) | ⭐⭐ |
| **`unnecessary-builder-pattern`** (YAGNI 위반 + 책임 모호) | 1 (#31) | ⭐ |
| **`domain-state-duplication`** (동일 상태 다중 객체 보유) | 1 (#31) | ⭐⭐ |
| **`controller-domain-coupling-depth`** (Controller 도메인 침투 깊이) | 다수 (#31·#46·#77·#91·#107) | ⭐⭐⭐ |
| **`string-constant-locus`** (에러 메시지 상수화 양가성) | 1 (#31) | ⭐ |
| **`initial-method-public-leak`** (initial~ public + 최초 1회 기대) | 1 (#66) | ⭐ |
| **`view-passive-vs-active`** (MVP/MVVM 어휘) | 1 (#107) | ⭐⭐ |
| **`maintenance-perspective-evaluation`** (유지보수 관점 메타 어휘) | 1 (#107) | ⭐⭐ |
| **`magic-default-conversion`** (View 가 기본값 → 도메인 어휘 매직 변환) | 1 (#107) | ⭐⭐ |
| **`concrete-abstract-method-override-impossible`** (abstract 기본 구현 + override X) | 1 (#107) | ⭐ |
| **`test-name-business-perspective`** (테스트 명 = 비즈니스 의도) | 1 (#107) | ⭐ |
| **`vagueName 강화 (4 회 동일 PR)`** (setUp/init/sum/calculateSum) | 1 (#66) | ⭐⭐ |
| **`enum-with-ui-value 반대 시점`** (View 가 enum 변환 자가 결정) | 1 (#9) | (양가성 보강) |
| **`procedural-method-name` (라면 비유 결)** | 1 (#9) | ⭐ |
| **`class-without-state` 강화** | 1 (#9) | ⭐⭐ |
| **`primitive-with-domain-logic` 강화** | 1 (#107) | ⭐⭐ |
| **`magic-number-in-view`** (`2` 매직 넘버) | 1 (#66) | ⭐ |
| **`은닉 사라진 자가 인정` (private constructor 망각)** | 1 (#107) | ⭐ |

### batch 15 메타 어휘 (MCP `oh-my-oop` 핵심 가치와 일치)

- **`개인 의견 메타 어휘` 9 reviewer 완전 합류** — KwonDae #91 *"제 개인적인 생각으로는"* — 말리빈/잭슨/두루/페로로/지훈/크롱/vagabond95/BeokBeok/KwonDae **9 reviewer 모두 사용**. **MCP `oh-my-oop` 핵심 가치 일치 강도 최고**.
- **`유지보수 관점 메타 어휘`** (lee-ji-hoon #107) — *"누군가 유지보수 한다고 생각을 해볼까요?"* — *시간 두고 관점*.
- **`강의 인용 reviewer 패턴`** (lee-ji-hoon #107) — *"오늘 강의 시간 때 이야기 했던 내용"* — *실시간 학습 연결*.
- **`reviewer 자가 사과 + 친밀한 어조` 다수** — lee-ji-hoon (학생 이름 *"동전"* 실수 + 밥 약속), KwonDae #91 (*"혼란을 드린거 같아 죄송합니다 🥲"*), KwonDae #77, 말리빈 #46/#23, BeokBeok #16.
- **`5 단계 핑퐁 토론 + 학생 자가 결정 변경`** (#107 junseo511) — *학생 의도 → reviewer 질문 → 학생 정당화 → reviewer 유지보수 관점 → 자가 후퇴 + 결정 변경*.

### batch 15 신규 reviewer

- 없음 (vagabond95/KwonDae/BeokBeok/lee-ji-hoon 모두 기존). 누적 reviewer 9 명 안정.

### batch 15 학생/reviewer 메타 케이스 강화

- **no1msh = MCP `oh-my-oop` 저자 (반달)** — 2023년 3월 학생 시기 PR #31 분석 = *학생 시기 자가 의문 (DTO 위치 + 상수화) → 1 년 후 MCP 저자 시기 *N 안 + 트레이드오프* 어휘 진화*. **`학생 → 도구 저자` 변형** — PR #46 (krrong *학생 → reviewer*) 결의 *학생 → 도구화* 변형.
- **`junseo511 학습 가시화 최강 사례`** (#107) — PR 본문 자가 의문 2 + 스크린샷 + 25 thread 중 22 응답 + 5 단계 핑퐁 + 자가 도입 3종 (UserCommand/GameManager/ResultManager). **모든 학습 가시화 매개체 활용**.

## 14. batch 14 신규 안티패턴 + 메타 어휘 (누적)

batch 14 (#39, #43, #46, #16, #77) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **`first-class-collection-without-behavior`** (`PlayersNameAndBet` 행동 없는 일급화) | 1 (#39) | ⭐⭐ — lotto `collection-wrapper-without-behavior` 변형 |
| **`and-conjunction-name`** (`NameAndBet`, `HandAndWallet`) | 1 (#39) | ⭐⭐ |
| **`immutable-recompute-on-call`** (불변 + 매 호출 계산 함수) | 1 (#39) | ⭐⭐ |
| **`factory-vs-constructor-inconsistency`** (생성 방식 일관성 부재) | 1 (#39) | ⭐ |
| **`deepCopy 명명 vs 실제 (얕은 복사)` 명명 정확성** | 1 (#39) | ⭐ |
| **`class-without-state`** (행동만 가진 클래스 = static helper 차이 X) | 2 (#16·#46) | ⭐⭐ |
| **`primitive-with-domain-logic`** (Int 점수 + 도메인 로직 = Score 포장) | 2 (#16·#39) | ⭐⭐ |
| **`package-cohesion`** (constants 패키지 + 로직 객체 = 응집 위반) | 1 (#16) | ⭐ |
| **`abstract-without-abstract-method` 강화** | 1 (#16) | ⭐⭐⭐ (누적 4 PR #74·#95·#147·#16) |
| **`dataclass-private-constructor-copy-leak`** (PR #58 결 강화) | 1 (#46) | ⭐⭐ |
| **`value-object-arithmetic-invariant-leak`** (BettingMoney ≥ 1 + 수익률 음수) | 1 (#46) | ⭐⭐ |
| **`procedural-method-name`** (`냄비에물을500미리붓고...` vs `라면끓이기`) | 1 (#46) | ⭐ |
| **`delegate-vs-firstclass-collection`** (`by` 키워드 + 일급 컬렉션 양가성) | 2 (#77·#74) | ⭐⭐ |
| **`lambda-injection-locus`** (람다 인자 vs 생성자 주입) | 1 (#77) | ⭐⭐ |
| **`judge-symmetry-violation`** (참가자 vs 참가자 일반화 + 비대칭 룰 충돌) | 1 (#77) | ⭐⭐ |
| **`premature-strategy-extraction`** (PointCalculator 분리 YAGNI 위반) | 1 (#77) | ⭐ |
| **`unnecessary-member-variable`** (initialCards 멤버 X) | 1 (#46) | ⭐ |
| **`when-pattern-vs-condition` Kotlin 어휘 갭** | 1 (#43) | ⭐ |
| **Phase 추상화 (학생 창의적 발상)** | 1 (#39) | (도메인 특수) |

### batch 14 메타 어휘 (MCP `oh-my-oop` 핵심 가치와 일치)

- ***극단 사례 (reductio ad absurdum)*** — *"1만 개의 메서드"* (#46), *"100개의 메서드"* (#46) — **변경 시 비용 메타 어휘**.
- **`라면 비유`** (말리빈 #46) — *추상화 수준 시각화*. PR #151 (크롱 *반란군 비유*) / PR #146 (두루 *YAGNI 비유*) 결.
- **`반영커밋 URL 첨부` 패턴** (krrong #46, 14회 중 11회) — *학생 자가 학습 가시화 강화*.
- **`외부 채널 권유 (Slack DM)`** (말리빈 #46, KwonDae #99·#77) — *PR 코멘트 외부 토론 채널 인정*.
- **`공동 학습 권유`** ("같이 고민해봐도 좋을 것 같습니다" — KwonDae #77) / **`reviewer 자가 사과 + 자가 부연`** (KwonDae #77, BeokBeok #16, 말리빈 #46).
- **`요구사항 인용`** (BeokBeok #16, *"프로그래밍 요구사항은 아래와 같은"*) — *블랙잭 미션 명시 요구사항을 reviewer 가 그대로 인용*.
- **`객체지향 원칙 약어 (SRP/LSP/DIP)` 명시** (BeokBeok #16, KwonDae #77 *DIP*) — **MCP `oh-my-oop` 룰의 *guideline* 필드와 일치**.

### batch 14 신규 reviewer

- @BeokBeok (벅벅) — PR #16. *2023년 3월 코호트 3번째 reviewer* (말리빈/잭슨/벅벅). 요구사항 인용 + SRP/LSP 원칙 명시.

### batch 14 학생/reviewer 메타 케이스

- **krrong 1 년 학생 → reviewer 진화** — *2023년 3월 학생 시기 (PR #32, #46) 의 학습 패턴 (자가 토론 + 양방향 + 반영커밋 URL) → 2024년 3월 reviewer 시기 (PR #148·#151) 의 학생 권유*. **MCP `oh-my-oop` *학습 = 시간 두고 반복* 어휘와 일치**.
- **`Test Fixture 학습 전파` 케이스** — *PR #99 (KwonDae *Test Fixture 품질* 권고) → PR #77 (KwonDae *Test Fixture 잘 활용* 칭찬)* — **reviewer 의 학습 시드가 다른 학생에게 이어지는 *reviewer 매개 학습 전파*** 케이스.

## 13. batch 13 신규 안티패턴 + 메타 어휘 (누적)

batch 13 (#98, #95, #99, #23, #26) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **`abstract-without-abstract-method` 2단계 재발** (학생 자가 의문 형태) | 1 (#95) | ⭐⭐ — 기존 룰 강화 |
| **enum 분기 곱집합 = 명명 어색 (WIN/LOSE × 블랙잭/일반)** | 1 (#99) | ⭐⭐ — `enum-product-axes-conflation` |
| **`Return → GameResult` (vague enum rename)** | 1 (#99) | ⭐ — 기존 `vagueName` 변형 |
| **테스트 = 명세서 메타 어휘** (test-as-spec) | 1 (#26) | (reviewer 어휘) |
| **암묵 제약 (implicit invariant) 외부에서 알기 어려움** | 1 (#26) | ⭐⭐ — `implicit-invariant-on-known-rule` 강화 |
| **`~~~er` 접두사 영어 사전 의미 충돌 (Drawer = 서랍)** | 1 (#23) | ⭐ — `er-suffix-collision` |
| **자료구조 Set vs List (여러 카드덱)** | 2 (#23·#26) | ⭐⭐ — `set-vs-list-multiset` |
| **카드 1벌 vs 여러 벌 도메인 룰 분기** (카지노 6덱 메타포 #58 결) | 1 (#26) | ⭐ — 도메인 특수 |
| **`Test Fixture` 품질 = 프로덕션 동등** (createPlayers/createCards) | 2 (#99·#26) | ⭐⭐ — `test-fixture-quality-parity` |
| **`onXX` 콜백 어휘 자가 적용** (학생 자가 람다 분리) | 2 (#99·#23) | ⭐⭐ — 기존 룰 강화 |
| **재구현 권유 (학습 = 시간 두고 반복)** | 3 (#95·#98·#99) | (reviewer 어휘) |
| **머지 후 후속 코멘트 (학습 종료 X)** | 1 (#23) | (reviewer 어휘) |
| **공식 의견 + 개인 의견 메타 분리** | 2 (#23·#26) | (reviewer 어휘 — MCP `oop_propose_alternatives` 일치) |
| **외부 자료 첨부 = Kotlin 공식 문서** | 2 (#23·#26) | (reviewer 어휘) |
| **블랙잭 룰 정확성 명시 (Bust 양측 + BlackJack 2장 > 3장 21)** | 1 (#26) | ⭐⭐⭐ — `blackjack-rule-fidelity` 강화 (#20·#64·#110·#120·#29·#63·#23·#26) |
| **suggestion 블록 활용** (given-when-then, expression body) | 1 (#26) | (reviewer 도구 활용) |
| **`Controller + View 없이 가능?` 메타 질문** (테스터빌리티) | 1 (#99) | ⭐⭐ — `controller-view-domain-coupling` |
| **PR 본문 자가 의문 + 다이어그램 + 1단계 코멘트 URL 자가 참조** | 1 (#99) | (학생 자가 학습 모범) |
| **`current 상태 = 분기 책임 위치 이동 ≠ 책임 제거` 자가 의문 (상태 패턴)** | 1 (#98) | ⭐ — 도메인 특수 |
| ***"옳고 그름 X, 장단점만"* reviewer 메타 어휘** | 1 (#95) | (reviewer 어휘 — MCP 핵심 가치 일치) |
| **`data object` vs `object` Kotlin 어휘** (sealed + 디버그 친화) | 1 (#98) | ⭐ — Kotlin 어휘 |
| **`fun interface` vs `interface` 자가 결정** (SAM 한정 vs 확장 여지) | 1 (#98) | ⭐ — Kotlin 어휘 |
| **점수 책임 위치 (Dealer / Player / Participant 3 후보) + 그림 첨부 의존 관계** | 1 (#23) | ⭐⭐ — `dealer-vs-player-result-locus` |
| **else 지양 원칙 극단 적용 자가 학습** | 1 (#23) | (학생 자가 학습 — PR #146·#151 결) |

### batch 13 메타 어휘 (MCP `oh-my-oop` 핵심 가치와 일치)

- ***"개발에 옳고 그름은 없고, 장단점만이 있는 세계"*** (말리빈, PR #95) — *조영호 「객체지향의 사실과 오해」 + MCP `oop_propose_alternatives` 어휘*.
- **공식 의견 + 개인 의견 메타 분리** (말리빈 PR #23, 잭슨 PR #26) — *reviewer 가 *주된 권고 + 개인 의견 + 학생 선택지* 명시*.
- **다른 크루의 말 *그대로 따라하지 말기*** (말리빈 PR #95) — *권위 인용 ≠ 논리적 설득*.
- **테스트 = 프로그램 명세서 어휘** (잭슨 PR #26) — *테스트 가 *동작 명세*를 표현*.
- **머지 시점 회고 권유** (KwonDae PR #99, 두루 PR #98, 말리빈 PR #95) — *"수정사항을 반영하시면서 어떤 장점을 느꼈는지 정리"* / *"처음부터 다시 만들어보는 시간"* — *학생 자가 학습 가시화*.

### batch 13 신규 reviewer

- 없음 (말리빈/잭슨/두루/KwonDae 모두 기존). *2023년 3월 코호트 진입 = 시기적 다른 PR 풀*.

## 11. 학생 자가 학습 + 메타 토론 모범 패턴 (전체 누적)

- **자가 의문 → reviewer 메타 답변 → 자가 후퇴/결정 명시 + 커밋 SHA 첨부** — *PR #124·#128·#135·#108·#133·#136·#137·#148·#151·#146·#147·#88 등 다수*.
- **외부 자료 인용 + 코드 적용** — *Effective Kotlin Item 4/14 (#108), 엘레강트 오브젝트 4.2/2.2 (#136), 객체 지향 생활 체조 원칙 (#151), YAGNI 인용 (#146), Racing Car 피드백 (#148), 디미터의 법칙 (#93·#133·#146), Clean Code (#93)*.
- **양방향 reviewer/학생 토론** — *PR #137 (지훈 자가 인정 어휘 혼란), #151 (크롱 자가 인정 확장성 한계), #133 (말리빈 다각도 시점), #146 (두루 typealias 자가 사용 의견), #147 (페로로 다형성 학습 진행 인정)*.

## 12. 다음 세션 진입 순서 (업데이트)

1. `ls /tmp/oop-lessons-cache-blackjack/` — 캐시 확인.
2. **새 reviewees 1단계 진입** — *PR 번호 < 108* 중 *threads ≥10 + 1단계* 미분석 PR 추출:
   - 이미 분석된 PR 번호 (batch 13 까지): #8, #10, #17, #20, #23, #24, #25, #26, #28, #29, #32, #33(보고: 35 thread 미분석), #34, #51, #61, #63, #64, #65, #67, #70, #74, #75, #78, #79, #81, #92, #95, #98, #99, #108, #110, #111, #112, #114, #116, #119, #120, #123, #124, #125, #128, #135
   - **양 단계 완성 reviewees (21명):** ijh1298, jinuemong, re4rk, tmdgh1592, wondroid-world, Leeyerin0210, moondev03, hwannow, oungsi2000, dpcks0509, ii2001, kmkim2689, junjange, hxeyexn, pingu244, inseonyun, whk06061, otter66, HamBeomJoon, yrsel, donghyun81, etama123, jerry8282, **chaehyuns** (#70 + #98), **songpink** (#74 + #95), **s6m1n** (#67 + #99)
   - **1단계만 분석 reviewees (5명, 2단계 미분석):** sh1mj1 (#75 → #104 thread 3개 너무 적음 스킵 가능), krrong (#32 → #46 thread 29개), rhthrhrl0 (#23 → #39 thread 23개), chws0508 (#26 → #43 thread 10개)
   - **남은 1단계 미분석 후보 (≥10 thread):**
     - 2023년 3월 코호트 (PR 번호 ~33): #9 Choisehyeon (23), #11 ki960213 (19), #13 hyunji1203 (19), #14 DYGames (16), #16 SeongHoonC (21), #18 boogi-woogi (16), #19 briandr97 (14), #21 hyemdooly (15), #22 RightHennessy (16), #31 no1msh (19), #33 2chang5 (35)
     - 2024년 코호트 (#61~107): #66 JoYehyun99 (18), #71 Hogu59 (10), #72 kimhm0728 (17), #73 jaeyeongjo (17), #76 Yunseok-Nam (18), #77 murjune (24), #80 Junyoung-WON (19), #82 Hevton (19), #106 giovannijunseokim (19), #107 junseo511 (25)
   - 배치 5개씩, 매 배치 commit
3. **새 2단계 PR** — 1단계 분석 후 자연스럽게 같은 reviewee 의 2단계 진입
4. **5~9 그룹** — 짧은 분석 (400-600줄) + 다른 배치 와 함께
5. *최종 정리* — PROGRESS.md, SUMMARY.md, README.md 작성 + MCP 룰화 검토

### batch 14 후보 (다음 세션)

- **양 단계 완성 우선**: rhthrhrl0 #39 (2단계, 23) + chws0508 #43 (2단계, 10) + krrong #46 (2단계, 29) — 3개
- **신규 1단계**: #16 SeongHoonC (21) + #33 2chang5 (35) 또는 #77 murjune (24) — 2개
- 총 5개

### batch 15 후보 (다음 세션)

- ⚠ *주의: §12 "이미 분석된 PR" 표가 부정확 — #33 2chang5 1단계는 batch 4 에서 이미 분석됨 (`2chang5/33-1단계-블랙잭.md` 존재)*. counts.tsv vs 디렉토리 ls 로 교차 확인 필수.
- **양 단계 완성 우선**: 
  - SeongHoonC #44 (베르 2단계, 10) — 적음 스킵 가능, #54 (10) 도 마찬가지
  - murjune #91 (오둥이 2단계, 13) — 양 단계 완성
  - 1단계만 분석된 5명 모두 *2단계가 적은 thread* → 양 단계 완성 가치 작음
- **신규 1단계** (≥10 thread, 미분석):
  - 2023년 3월 코호트: #9 Choisehyeon (23), #11 ki960213 (19), #13 hyunji1203 (19), #14 DYGames (16), #18 boogi-woogi (16), #19 briandr97 (14), #21 hyemdooly (15), #22 RightHennessy (16), #31 no1msh (19)
  - 2024년 코호트: #66 JoYehyun99 (18), #71 Hogu59 (10), #72 kimhm0728 (17), #73 jaeyeongjo (17), #76 Yunseok-Nam (18), #80 Junyoung-WON (19), #82 Hevton (19), #106 giovannijunseokim (19), #107 junseo511 (25)
- **권장 batch 15**: murjune #91 (2단계 완성) + 새 1단계 4개 (예: #9 Choisehyeon + #31 no1msh + #66 JoYehyun99 + #107 junseo511) — 다양성 강화. 또는 *5~9 그룹 짧은 분석* 진입.

### batch 16 후보 (다음 세션)

- 양 단계 완성 reviewees 29명 + 1단계만 13명 (Choisehyeon, no1msh, JoYehyun99, junseo511 추가). 1단계만 분석된 reviewees 의 2단계 PR 후보:
  - Choisehyeon #52 (로피 2단계, 6 thread) — 적음
  - no1msh #55 (반달 2단계, 5 thread) — 적음
  - JoYehyun99 #83 (예니 2단계, 5 thread) — 적음
  - junseo511 #145 (공백 2단계, 17 thread) — 가치 있음
- **권장 batch 16**: junseo511 #145 (2단계 완성, 17) + 새 1단계 4개 (예: #11 ki960213, #13 hyunji1203, #22 RightHennessy, #76 Yunseok-Nam 또는 #80 Junyoung-WON, #82 Hevton)
- **또는 5~9 그룹 짧은 분석 진입** — 13 + 14 = 27 PR 분석 완료 시점으로 *코퍼스 충분* — *최종 정리 (PROGRESS.md/SUMMARY.md/README.md) + MCP 룰화* 진입 검토.

### batch 17 후보 (다음 세션)

- **양 단계 완성 우선** — 1단계만 분석된 reviewees 의 2단계 PR 후보:
  - ki960213 #40 (토마스 2단계, 5 thread) — 적음 스킵
  - hyunji1203 #45 (뽀또 2단계, 5 thread) — 적음 스킵
  - Yunseok-Nam #86 (서기 2단계, 16 thread) — 가치 있음
  - Hevton #100 (팡태 2단계, 16 thread) — 가치 있음
- **신규 1단계** (≥10 thread, 미분석):
  - 2023년 3월 코호트: #14 DYGames (16), #18 boogi-woogi (16), #19 briandr97 (14), #21 hyemdooly (15), #22 RightHennessy (16)
  - 2024년 코호트: #71 Hogu59 (10), #72 kimhm0728 (17), #73 jaeyeongjo (17), #80 Junyoung-WON (19), #106 giovannijunseokim (19)
- **권장 batch 17**: Yunseok-Nam #86 + Hevton #100 (2단계 완성 2개) + 새 1단계 3개 (예: #22 RightHennessy + #72 kimhm0728 + #80 Junyoung-WON)
- **또는 최종 정리 진입** — *batch 16 까지 양 단계 30명 + 1단계 16명 = 76 PR 분석 완료 시점으로 *코퍼스 매우 충분***. *최종 정리 (PROGRESS.md/SUMMARY.md/README.md) + MCP 룰화* 우선 검토.

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

## 9. 다음 세션 진입 순서

1. `ls /tmp/oop-lessons-cache-blackjack/` — 캐시 확인.
2. 동일 리뷰이 2단계 미분석 9개 우선 (위 §1 표). 배치 5개씩:
   - **batch 10**: #41 pingu244, #49 inseonyun, #53 whk06061, #58 otter66, #137 HamBeomJoon
   - **batch 11**: #146 yrsel, #147 donghyun81, #148 etama123, #151 jerry8282 + 1단계 미분석 reviewee 1개
3. 그 뒤 새 1단계/2단계 reviewees (~75개) 진입.
4. *각 배치마다 commit, push 안 함*.

### 분량 휴리스틱 (batch 8·9 데이터)

- 학생 자가 토론 풍부 + State 패턴: **1100~1400줄** (#152, #133, #93, #132, #136)
- 학생 자가 답변 + value class 등 Kotlin 어휘 풍부: **1100~1300줄** (#90)
- 표준 + 깊은 토론: **800~1000줄** (#85, #131)
- 칭찬 위주 + 학생 100% 후속 반영: **400~600줄** (#88, #103)
