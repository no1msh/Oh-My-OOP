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

reviewee 디렉토리 36개 (양 단계 완성 21명 + 1단계만 15명) + HANDOVER. **양 단계 모두 분석된 reviewees (18명):** ijh1298, jinuemong, re4rk, tmdgh1592, wondroid-world, Leeyerin0210, moondev03, hwannow, oungsi2000, dpcks0509, ii2001, kmkim2689, junjange, hxeyexn, pingu244, inseonyun, whk06061, otter66, HamBeomJoon, yrsel, donghyun81, etama123, jerry8282 (실제 18명).

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
