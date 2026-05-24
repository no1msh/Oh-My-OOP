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
| 17 | `cce33fd` | #86, #100, #22, #72, #80 | Yunseok-Nam + Hevton 2단계 완성 (양 단계 32명) + 새 1단계 reviewees 3명 (RightHennessy/kimhm0728/Junyoung-WON). **신규 reviewer 2명 (galcyurio, ghojeong) → 누적 11명** |
| 18 | `93758d1` | #48, #14, #18, #73, #106 | RightHennessy 2단계 완성 (양 단계 33명) + 새 1단계 reviewees 4명 (DYGames/boogi-woogi/jaeyeongjo/giovannijunseokim). **신규 reviewer 1명 (woowahan-leah) → 누적 12명** |
| 19 | `2bd2c8f` | #36, #87, #21, #117, #129 | boogi-woogi #36 + jaeyeongjo #87 양 단계 완성 (2명 추가, **양 단계 35명**) + 새 1단계 reviewees 3명 (hyemdooly/parkjiminnnn/rosemin928). **신규 reviewer 1명 (woowahan-dino) → 누적 13명**. **2025년 코호트 신규 합류 (2 PR: parkjiminnnn/rosemin928) — 셀프 체크리스트 PR 본문 + 모든 스레드 학생 자가 답변 + 커밋 SHA 첨부** |
| 20 | `f0b989e` | #138, #139, #35, #126, #130 | rosemin928 #138 + parkjiminnnn #139 + hyemdooly #35 양 단계 완성 (3명 추가, **양 단계 38명**) + 새 1단계 reviewees 2명 (doabletuple/medAndro). **신규 reviewer 1명 (hyemdooly) → 누적 14명**. **2025년 코호트 5 PR 코퍼스 형성 (parkjiminnnn/rosemin928/doabletuple/medAndro = 4 reviewees)**. **메타 케이스 2번째: hyemdooly = 2023 학생 (#21·#35) → 2025 reviewer (#130) 2년 진화 (krrong 1년 진화에 이어)** |
| 21 | `0380d00` | #142, #143, #109, #113, #118 | doabletuple #142 + medAndro #143 양 단계 완성 (2명 추가, **양 단계 40명**) + 새 1단계 reviewees 3명 (cucumber99/jiyuneel/gahyunkim). **신규 reviewer 1명 (malibinYun 2024→2025 다년 활동) → 누적 14명 유지 (말리빈 기존)**. **2025년 코호트 10 PR 코퍼스 정점 (7 reviewees)**. **신규 reviewer 메타 케이스: malibinYun = 2024 reviewer (PR #95 등) → 2025 reviewer (PR #118) = 다년 활동** |
| 22 | `7b104fb` | #140, #141, #96, #121, #19 | jiyuneel #140 + gahyunkim #141 양 단계 완성 (2명 추가, **양 단계 42명**) + Hogu59 #96 2단계 단독 (1단계 #71 적음 = 2단계만, 양 단계 43명) + 새 1단계 reviewees 2명 (devfeijoa/briandr97). **2023 코호트 마지막 ≥10 thread 1단계 (#19 briandr97) 완료**. **reviewer 다년 활동 2번째 (Gyuil-Hwnag 두루 = 2024→2025)** |
| 23 | (commit pending) | #149, #153, #71, #68, #69 | cucumber99 #149 + devfeijoa #153 + Hogu59 #71 양 단계 완성 (3명 추가, **양 단계 45명**) + 새 1단계 reviewees 2명 (kkosang/gaeun5744 = 2024 코호트). **PR #71 ↔ #96 메타 케이스: 1년 늦은 2단계 학생 자가 학습 시간성** |

reviewee 디렉토리 66개 (양 단계 완성 45명 + 1단계만 21명) + HANDOVER. **batch 23 새 reviewees 2명 (kkosang #68, gaeun5744 #69)**. **양 단계 모두 분석된 reviewees (42명):** ijh1298, jinuemong, re4rk, tmdgh1592, wondroid-world, Leeyerin0210, moondev03, hwannow, oungsi2000, dpcks0509, ii2001, kmkim2689, junjange, hxeyexn, pingu244, inseonyun, whk06061, otter66, HamBeomJoon, yrsel, donghyun81, etama123, jerry8282, chaehyuns, songpink, s6m1n, rhthrhrl0, chws0508, krrong, SeongHoonC, murjune, junseo511, Yunseok-Nam, Hevton, RightHennessy, boogi-woogi, jaeyeongjo, hyemdooly, rosemin928, parkjiminnnn, doabletuple, medAndro, **jiyuneel (batch 22), gahyunkim (batch 22)**. **2단계만 분석 (Hogu59 = 1단계 적음으로 단독, batch 22 추가)**.

**reviewer 다양성:** @laco-dev (페로로), @malibinYun (말리빈), @Gyuil-Hwnag (두루), @namjackson (잭슨), @lee-ji-hoon (지훈), @krrong (크롱), @vagabond95, @KwonDae, @BeokBeok, @galcyurio, @ghojeong, @woowahan-leah, @woowahan-dino, **@hyemdooly (둘리, batch 20 신규 = 학생 → reviewer 진화)** — *총 14 reviewer*.

**메타 학습 케이스 (4건):**
- 학생 krrong (PR #32) = PR #148·#151 의 reviewer 본인 (2023 → 2024 1년 진화).
- 학생 hyemdooly (PR #21·#35) = PR #130 의 reviewer 본인 (2023 → 2025 2년 진화).
- reviewer 다년 활동 1: malibinYun (말리빈) = 2024 PR 들의 reviewer (PR #95 등) + 2025 PR #118·#141 reviewer.
- **reviewer 다년 활동 2 (batch 22 신규): Gyuil-Hwnag (두루) = 2024 PR 들의 reviewer (PR #98 chaehyuns·#146 yrsel 등) + 2025 PR #121 devfeijoa reviewer**.
- **2025년 코호트 10 PR 코퍼스 정점** (batch 19: parkjiminnnn #117·#139 + rosemin928 #129·#138 + batch 20: doabletuple #126 + medAndro #130 + batch 21: doabletuple #142 + medAndro #143 + cucumber99 #109 + jiyuneel #113 + gahyunkim #118) = *모바일 안드로이드 7기 8 reviewees* + *셀프 체크리스트 PR 본문 스타일* + *모든 스레드 학생 자가 답변 + 커밋 SHA 첨부 모범*. **3 시기 코호트 합류** (2023년 3월 / 2024 / 2025).

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

## 18. batch 18 신규 안티패턴 + 메타 어휘 (누적)

batch 18 (#48, #14, #18, #73, #106) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **`controller-to-domain-test-enablement`** (god-object 이전 = 테스트 가능성) | 1 (#48) | ⭐⭐ |
| **`domain-isolation-refactoring-steps`** (UI 분리/private 최소/public 테스트) | 1 (#48) | ⭐⭐⭐ |
| **`test-only-public-exposure-anti-pattern`** | 1 (#48) | ⭐⭐ |
| **`cli-vs-gui-assumption-test`** (y/n CLI 한정 → Boolean) | 1 (#14) | ⭐⭐ |
| **`test-fake-self-test-anti-pattern`** (Fake 자체 테스트 X) | 1 (#14) | ⭐⭐ |
| **`test-static-import-convention`** (프로덕션과 다른 컨벤션) | 1 (#14) | ⭐ |
| **`enum-companion-init-order`** (enum 인스턴스 vs companion 시점) | 1 (#18) | ⭐⭐ |
| **`student-honest-no-deep-thought`** (학생 자가 *깊은 생각 없었음* 솔직 인정) | 1 (#18) | ⭐ |
| **`offline-code-review-suggestion`** | 1 (#18) | ⭐ |
| **`time-boxed-self-learning`** (*오늘까지만 한번 더*) | 1 (#18) | ⭐ |
| **`is-operator-polymorphism-avoidance`** (is = 절차지향 시그널) | 1 (#73) | ⭐⭐⭐ |
| **`design-pattern-without-effect`** (패턴 도입 후 의도 효과 X) | 1 (#73) | ⭐⭐ |
| **`reviewer-emphasis-rationale-meta`** (자가 강조 이유 명시) | 1 (#73) | ⭐⭐ |
| **`reviewer-don't-be-swayed`** (휘둘리지 마세요) | 1 (#73) | ⭐⭐⭐ |
| **`consecutive-if-as-else-violation`** (연속 if = else 위반) | 1 (#73) | ⭐⭐ |
| **`reviewer-power-restraint-meta`** (논리로 찍어 누를 수 있으나) | 1 (#106) | ⭐⭐⭐ |
| **`professional-vs-learning-acceptance-criteria`** (동료 99% / 학습 자가) | 1 (#106) | ⭐⭐ |
| **`student-perspective-shift-self-question`** (언제 관점 깨는가?) | 1 (#106) | ⭐⭐ |
| **`student-stubbornness-self-question`** (고집인가?) | 1 (#106) | ⭐ |
| **`having-vs-knowing-conflation`** (멤버 vs 의존) | 1 (#106) | ⭐⭐ |
| **`rank-vs-score-separation`** (Rank 게임 무관 / 점수 외부) | 1 (#106) | ⭐⭐ |
| **`bust-as-error-not-state`** (Bust = 상태 / 오류 X) | 1 (#106) | ⭐⭐ |
| **`android-onx-vs-domain-callback-confusion`** | 1 (#106) | ⭐⭐ |
| **`stdlib-name-conflict`** (Character vs Number) | 1 (#106) | ⭐ |

### batch 18 메타 어휘 (MCP `oh-my-oop` 핵심 가치 정점)

- **`reviewer 정답 강요 회피 메타`** (말리빈 #106) — *"제가 생각하는 지점을 알려드리는 것으로 수렴하는 느낌이 드네요. (...) 정답으로 받아들일 수 있기에 (...) 좋아하지 않아요"*.
- **`reviewer 권력 자제 메타`** (말리빈 #106) — *"언제든지 논리로 찍어 누를 수 있으나, 그렇게 하지 않는 이유는 그것이 정답으로 받아들여질 것이 필연적이기 때문이에요"*.
- **`실무 vs 학습 미션 수용 기준 차이`** (말리빈 #106) — *"동료분들은 프로라고 생각해요. 그렇기에 그들이 하는 말을 99% 반영해요"*.
- **`학생 자가 *언제 관점 깨는가?* 메타 의문`** (giovannijunseokim #106) — **MCP 핵심 가치 학생 측 메타 어휘**.
- **`reviewer "휘둘리지 마세요"`** (ghojeong #73) — *"제 피드백에 휘둘리지 마시고, '객체 지향 생활 체조 원칙' 에 집중하시면 좋을 것 같습니다"*.
- **`수업 시간 인용 reviewer 합류`** (woowahan-leah #18) — *"수업 시간에 배운 backing property 활용 👍"*. PR #107·#80 결의 *강의 인용 패턴*.

### batch 18 신규 reviewer (1명)

- **@woowahan-leah** (PR #18 boogi-woogi) — 2023년 3월 코호트. *enum + companion object 깊은 어휘 + 상속 vs 조합 외부 글 + 오프라인 코드 리뷰 권유 + 수업 시간 인용*.

**누적 reviewer 12명**: 말리빈/잭슨/두루/페로로/지훈/크롱/vagabond95/BeokBeok/KwonDae/galcyurio/ghojeong/woowahan-leah.

## 17. batch 17 신규 안티패턴 + 메타 어휘 (누적)

batch 17 (#86, #100, #22, #72, #80) 에서 새로 발견된 패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **`redundant-validation-on-type-constraint`** (enum 제약 + 추가 검증 = 중복) | 1 (#86) | ⭐⭐ |
| **`redundant-factory-with-strategy-parameter`** (Card.from(provider) = 중복) | 1 (#86) | ⭐ |
| **`companion-object-method-locus`** (팩토리 + 도우미만, 모든 메서드 강제 X) | 1 (#86) | ⭐ |
| **`personal-metaphor-without-shared-vocabulary`** (지갑 안 신분증) | 1 (#100) | ⭐⭐ |
| **`mutable-state-open-violation`** (open var + OCP 위반) | 1 (#100) | ⭐⭐ |
| **`pseudo-domain-controller-layer`** (Game = 통신 매개체) | 1 (#100) | ⭐⭐ |
| **`external-naming-search-tool`** (grep.app 활용) | 1 (#100) | ⭐ |
| **`dependency-direction-clarification`** (UI→Domain OK / Domain→UI 문제) | 1 (#22) | ⭐⭐⭐ |
| **`static-mutable-collection-unsafe`** (ALL_CARDS = 전역 + remove/add) | 1 (#22) | ⭐⭐ |
| **`test-3-properties-clarity-completeness-conciseness`** (Google Testing Blog) | 1 (#22) | ⭐⭐ |
| **`data-structure-tool-knowledge`** (LinkedList pop = Kotlin 자료구조) | 1 (#22) | ⭐ |
| **`kotlin-vocabulary-misconception`** (enum 내 companion object 가능) | 1 (#22) | ⭐ |
| **`constant-shared-vs-local`** (한 곳 = private / 여러 곳 = public) | 1 (#22) | ⭐ |
| **`controller-classification-criteria`** (view 의존 + 테스트 가능 2 기준) | 1 (#72) | ⭐⭐⭐ |
| **`caching-decision-by-data-scale`** (수천 = 캐싱 / 수백 = 최신값) | 1 (#72) | ⭐⭐ |
| **`jvm-type-erase-firstclass-key`** (`Map<List<Card>, Int>` Key 일급 컬렉션) | 1 (#72) | ⭐⭐ |
| **`cache-key-smaller-than-value`** (Key < Value 크기 원칙) | 1 (#72) | ⭐ |
| **`forward-compatible-delegation`** (로직 없는 위임 = 향후 유지보수 가치) | 1 (#72) | ⭐⭐ |
| **`value-vs-behavior-class-distinction`** (data class vs 일반 class) | 1 (#72) | ⭐⭐ |
| **`package-entry-point-classification`** (각 패키지 대표 객체) | 1 (#72) | ⭐⭐ |
| **`dto-vs-model-classification`** (DTO = 데이터 전달 + 테스트 X) | 1 (#72) | ⭐⭐ |
| **`domain-vocabulary-vs-general-noun`** (HandCards 도메인 vs Cards 일반) | 1 (#72) | ⭐⭐ |
| **`fold-with-label-return`** (Kotlin fold + return@label) | 1 (#72) | ⭐ |
| **`team-convention-documentation`** (팀 컨벤션 + 문서화 강조) | 1 (#72) | ⭐ |
| **`foreach-repeat-as-side-effect-signal`** (Unit 반환 + 변경) | 1 (#72) | ⭐⭐ |
| **`awkward-feeling-signal`** (어색함 = 코드 시그널) | 1 (#72) | ⭐ |
| **`callback-naming-view-coupling`** (printX/showX = View 동사) | 1 (#80) | ⭐⭐⭐ |
| **`unnecessary-abstraction-without-polymorphism`** (다형성 X = 추상화 X) | 1 (#80) | ⭐⭐ |
| **`util-package-definition`** (전역 + 비즈니스 X + 문자열/랜덤/날짜) | 1 (#80) | ⭐⭐ |
| **`multi-source-learning-integration`** (수업 + reviewer + 자가 학습 통합) | 다수 (#80·#82·#145·#107·#46·#91·#100) | ⭐⭐ |

### batch 17 메타 어휘 (MCP `oh-my-oop` 핵심 가치와 일치)

- **`11 reviewer 메타 어휘 완전 확인`** — galcyurio (#22) *"개방 폐쇄 원칙을 잘 지켰다고 생각해요 :+1:"* / *"domain에서 ui를 의존하는 반대의 경우는 문제"* + ghojeong (#72) *"결국 정답은 없습니다"* / *"개발팀마다 모두 다릅니다. 중요한 것은 팀 전체가 납득할 수 있는 컨벤션을 만들고 문서화하는 일입니다"* — **새 reviewer 2명 모두 *MCP 핵심 가치 어휘* 사용**.
- **`사람 시뮬레이션 비유` (ghojeong #72)** — *"해당 역할을 컴퓨터가 아니라 사람에게 시키려고 했을 때, 사람이 한명 더 필요한가 아니면 같은 사람에게 시킬 수 있을까"* — **MCP `oh-my-oop` *역할-책임-협력 (RDD)* 어휘 강화**.
- **`Controller 판단 기준 2 가지`** (ghojeong #72) — *view 의존 + 테스트 가능*.
- **`데이터 규모별 캐싱 결정`** (ghojeong #72) — *수천/수만 = 캐싱 / 수백 = 최신값*.
- **`팀 컨벤션 + 문서화 강조`** (ghojeong #72) — *팀 다양성 + 컨벤션 문서*.
- **`학생 자가 *코드 누적 부채* 자가 인정`** (Hevton #100) — *"이미 시작에서부터 너무 많은 설계가 연쇄"*.
- **`학생 자가 *그저 좋다 생각만* 자가 인정 강화`** (data class private constructor #86, BaseHuman 추상화 #80, Wallet 지갑 #100, Manager 폭증 #145, 팩토리 메서드 #76, 일급 컬렉션 과적용 #39).
- **`다음 미션 학습 자가 적용`** (Hevton #100 오목 미션 *고차함수 자가 활용*) — **MCP `oh-my-oop` 학습 = 시간 두고 반복 어휘**.

### batch 17 신규 reviewer (2명)

- **@galcyurio** (PR #22 RightHennessy) — 2023년 3월 코호트 4번째. *OCP/OOP 원칙 명시 + Google Testing Blog 외부 자료 + UI/Domain 의존 방향 메타*.
- **@ghojeong (파이로)** (PR #72 kimhm0728) — 2024 코호트 신규. *Controller 판단 기준 2가지 + 사람 시뮬레이션 비유 + 데이터 규모별 캐싱 + 팀 컨벤션 문서화 + 디미터 법칙 ACM 논문 인용*.

**누적 reviewer 11명**: 말리빈/잭슨/두루/페로로/지훈/크롱/vagabond95/BeokBeok/KwonDae/galcyurio/ghojeong.

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

### batch 18 후보 (다음 세션)

- **양 단계 완성 우선** — 1단계만 분석 reviewees 의 2단계 PR 후보:
  - kimhm0728 #97 (올리브 2단계, 8 thread) — 적음
  - Junyoung-WON #101 (호두 2단계, 9 thread) — 적음
  - RightHennessy #48 (링링 2단계, 13 thread) — 가치 있음
- **신규 1단계** (≥10 thread, 미분석):
  - 2023년 3월 코호트: #14 DYGames (16), #18 boogi-woogi (16), #19 briandr97 (14), #21 hyemdooly (15)
  - 2024년 코호트: #71 Hogu59 (10), #73 jaeyeongjo (17), #106 giovannijunseokim (19)
- **권장 batch 18**: RightHennessy #48 (2단계 완성, 13) + 새 1단계 4개 (예: #14 DYGames + #18 boogi-woogi + #73 jaeyeongjo + #106 giovannijunseokim)
- **또는 최종 정리 진입** — *batch 17 까지 양 단계 32명 + 1단계 17명 = **81 PR 분석 완료** 시점으로 *코퍼스 매우 충분***. *최종 정리 + MCP 룰화* 우선순위 강화.

### batch 19 후보 (다음 세션)

- **양 단계 완성 우선** — 1단계만 분석 reviewees 의 2단계 PR 후보 (≥10 thread):
  - DYGames #37 (코건 2단계, 9 thread) — 적음
  - boogi-woogi #36 (우기 2단계, 24 thread) — **가치 있음**
  - jaeyeongjo #87 (레오 2단계, 22 thread) — **가치 있음**
  - giovannijunseokim #134 (지오 2단계, 9 thread) — 적음
- **신규 1단계** (≥10 thread, 미분석):
  - 2023년 3월 코호트: #19 briandr97 (14), #21 hyemdooly (15)
  - 2024년 코호트: #71 Hogu59 (10), #126 doabletuple (18), #129 rosemin928 (22), #130 medAndro (25), #117 parkjiminnnn (25), #118 gahyunkim (18), #121 devfeijoa (24), #109 cucumber99 (25), #113 jiyuneel (22)
- **권장 batch 19**: boogi-woogi #36 + jaeyeongjo #87 (2단계 완성 2개) + 새 1단계 3개 (예: #21 hyemdooly + #117 parkjiminnnn + #129 rosemin928)
- **최종 정리 진입 시점 강력 권장** — *batch 18 까지 양 단계 33명 + 1단계 20명 = **86 PR + 12 reviewer + 130+ 룰 후보***. *코퍼스 포화 + 메타 어휘 완전*. **PROGRESS.md/SUMMARY.md/README.md + MCP 룰화 우선 진입 권장**.

### batch 20 후보 (다음 세션) — **최종 정리 진입 매우 강력 권장**

- **양 단계 완성 우선** — 1단계만 분석 reviewees 의 2단계 PR 후보 (≥10 thread):
  - hyemdooly #25 (둘리 2단계, 28 thread) — **가치 있음** *(주의: batch 5에서 PR #25 whk06061 분석됨 — PR 번호 충돌 확인 필요)*
  - parkjiminnnn 2단계 PR (확인 필요, PR #117 1단계 → 2단계 PR 번호 ≥160 가능)
  - rosemin928 2단계 PR (확인 필요)
- **신규 1단계** (≥10 thread, 미분석, 우선순위 ↓):
  - 2024 코호트: #71 Hogu59 (10), #126 doabletuple (18), #130 medAndro (25), #118 gahyunkim (18), #121 devfeijoa (24), #109 cucumber99 (25), #113 jiyuneel (22)
  - 2023 코호트: #19 briandr97 (14)
- **최종 정리 진입 매우 강력 권장** — *batch 19 까지 양 단계 35명 + 1단계 21명 = **91 PR + 13 reviewer + 160+ 룰 후보***. **3 시기 코호트 합류 (2023·2024·2025) + 메타 어휘 완전 정점**. **추가 batch 한계 효용 매우 작음**. 

### batch 21 후보 (다음 세션)

- **양 단계 완성 우선** — 1단계만 분석 reviewees 의 2단계 PR 후보 (≥10 thread):
  - doabletuple #142 (디랙 2단계, 20 thread) — **가치 있음**
  - medAndro #143 (메다 2단계, 19 thread) — **가치 있음**
  - Hogu59 #96 (악어 2단계, 28 thread) — **가치 있음** (1단계 #71 = 10 thread 적음, 2단계 우선)
  - gahyunkim #141 (조이 2단계, 21 thread) — **가치 있음**
  - jiyuneel #140 (포르 2단계, 16 thread) — **가치 있음**
- **신규 1단계** (≥10 thread, 미분석):
  - 2024 코호트: #109 cucumber99 (25), #113 jiyuneel (22), #118 gahyunkim (18), #121 devfeijoa (24)
  - 2023 코호트: #19 briandr97 (14)
- **권장 batch 21**: doabletuple #142 + medAndro #143 (2025 코호트 양 단계 완성 2개) + 새 1단계 3개 (예: #109 cucumber99 + #113 jiyuneel + #118 gahyunkim)

### batch 22 후보 (다음 세션)

- **양 단계 완성 우선**:
  - cucumber99 2단계 PR (확인 필요, #144·#150 후보)
  - jiyuneel #140 (포르 2단계, 16 thread) — *batch 21 권장 후보였음*
  - gahyunkim #141 (조이 2단계, 21 thread) — *batch 21 권장 후보였음*
  - Hogu59 #96 (악어 2단계, 28 thread) — **가치 매우 높음** (1단계 #71 적음 = 2단계 단독 가치)
- **신규 1단계**:
  - #121 devfeijoa (이든 1단계, 24 thread) — *최후 1단계 ≥10 thread 미분석*
  - #19 briandr97 (빅스 1단계, 14 thread, 2023 코호트)
- **권장 batch 22**: jiyuneel #140 + gahyunkim #141 + Hogu59 #96 (2단계 완성 3개) + 새 1단계 2개 (#121 devfeijoa + #19 briandr97)

### batch 23 후보 (다음 세션)

- **남은 양 단계 완성 후보**:
  - cucumber99 2단계 PR (확인 필요, #144 또는 #149)
- **신규 1단계** (≥10 thread, 미분석 잔여):
  - 거의 다 완료. 5~9 그룹 진입 시점.
- **5~9 그룹 짧은 분석** (14 PR, 400-600줄/PR):
  - 가장 풍부한 thread 7-9 PR 부터 시도
- **최종 정리** 또는 **5~9 진입** 결정 시점.

### §22 신규 안티패턴 (batch 22, 5 PR)

batch 22 (#140, #141, #96, #121, #19) 에서 신규/강화 안티패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **고차함수 = 도메인↔View 의존 X** | 2+ (#140·#109) | ⭐⭐ — `higher-order-function-as-domain-view-decoupling` 신규 |
| **sealed class 라이브러리 배포 시 확장 제약** | 1 (#140) | ⭐⭐ — `sealed-class-library-extension-constraint` 신규 |
| **parameter vs self state access** | 1 (#140) | ⭐⭐ — `parameter-vs-self-state-access` 신규 |
| **test = 역할 중심 (not flow)** | 1 (#140) | ⭐⭐ — `test-by-role-not-by-flow` 신규 |
| **super 키워드** | 3+ (#138·#142·#140) | ⭐⭐ — `super-keyword-for-shared-logic` 강화 |
| **tailrec 자가 학습** | 4+ (#138·#142·#140·#141) | ⭐⭐ — 강화 |
| **테스트 카드 스텁 재사용** | 1 (#141) | ⭐ — `test-fixture-stub-reuse` 신규 |
| **응집 vs 분리 트레이드오프** | 1 (#141) | ⭐⭐ — `cohesion-vs-separation-tradeoff` 신규 |
| **표면 리팩토링 vs 본질 변경** | 1 (#141) | ⭐⭐ — `superficial-refactoring-vs-essential-change` 신규 |
| **MVC 패턴 매몰 X 학생 자가 학습** | 2+ (#118·#141) | ⭐⭐ — `pattern-vs-object-naming-priority` 강화 |
| **학생 자가 의존성 그래프 시각화** | 1 (#96) | ⭐ — `student-self-dependency-graph-visualization` 신규 |
| **유연성 vs 현재 룰 트레이드오프** | 1 (#96) | ⭐ — `flexibility-vs-current-rule-tradeoff` 신규 |
| **입력 다양성 = 모든 경우 통제 X** | 1 (#96) | ⭐ — `input-diversity-uncontrollable` 신규 |
| **팀의 코드 어휘** | 1 (#96) | ⭐⭐ — `team-code-vs-personal-code` 신규 |
| **외부 책 인용 (엘레강트 오브젝트)** | 4+ (#96·#136·#118·#108) | ⭐ — `external-book-reference` 신규 |
| **추상 상수 vs 도메인 어휘** | 1 (#96) | ⭐⭐ — `abstract-constant-hides-domain-meaning` 신규 |
| **함수 인자 옵션 다양성 의식** | 1 (#96) | ⭐ — `parameter-options-exploration` 신규 |
| **IDE 단축키 = 개발 생산성** | 1 (#96) | ⭐ — `ide-shortcut-as-productivity` 신규 |
| **JUnit CsvSource** | 1 (#96) | ⭐ — `parameterized-test-via-csvsource` 신규 |
| **reviewer scenario code example** | 2+ (#118·#96) | ⭐⭐ — `reviewer-scenario-code-example` 강화 |
| **reviewer 다년 활동** | 2+ (말리빈·두루) | ⭐⭐⭐ — `multi-year-reviewer-activity` 강화 |
| **집단 지성 어휘** | 1 (#121) | ⭐ — `collective-intelligence-as-resource` 신규 |
| **평행 분리 객체 (Ace/Character/Number) 통합** | 1 (#121) | ⭐ — `over-separation-into-parallel-classes` 신규 |
| **하드코딩 vs 동적 생성** | 1 (#121) | ⭐ — `hardcoded-vs-dynamic-generation` 신규 |
| **toString vs 매퍼 vs 함수 변환 3 안** | 1 (#121) | ⭐ — `to-string-vs-mapper-vs-function-conversion` 신규 |
| **main 에 모든 코드 = god function** | 1 (#121) | ⭐ — `main-as-god-function` 신규 |
| **enum vs sealed class 구분 기준** | 1 (#19) | ⭐⭐ — `enum-vs-sealed-class-criteria` 신규 |
| **sealed interface vs sealed class** | 1 (#19) | ⭐ — `sealed-interface-vs-sealed-class` 신규 |
| **확장 함수 vs object 전략 패턴 트레이드오프** | 1 (#19) | ⭐ — `extension-function-vs-object-strategy` 신규 |
| **도메인이 controller interface 구현 = MVC 위반** | 1 (#19) | ⭐⭐ — `domain-knows-controller-via-interface` 신규 |

### batch 22 신규 reviewer

- **@Gyuil-Hwnag (두루) — PR #121 = 2024→2025 다년 활동** (말리빈에 이어 *두번째 reviewer 다년 활동 메타 케이스*). 누적 reviewer = 14명 유지 (두루 = 기존 2024 reviewer).
- **@vagabond95 (PR #19 reviewer = racingcar 인용 reviewer)** — 기존 2023 reviewer (PR #75 등).

### batch 22 학생/reviewer 메타 케이스

- **reviewer 다년 활동 2번째** (두루) — *MCP 룰 `multi-year-reviewer-activity` 강화* 누적 2+ reviewer.
- **doabletuple 양 단계 완성 + 학생 자가 코드 예시 + 다형성 학습**.
- **medAndro 양 단계 완성 + 학생 자가 `-0.0` Float IEEE 754 학습 + 다른 reviewer 어휘 cross-reference**.
- **Hogu59 1년 늦은 2단계 + 학생 자가 *모든 경우 통제 못함* 메타 학습 + *팀의 코드* 어휘 학습**.
- **devfeijoa 학생 자가 기초지식 부족 + TDD + 페어 학습**.
- **briandr97 PR 본문 자가 interface vs abstract 의문 + Kotlin 어휘 깊은 자가 학습 (sealed interface + enum vs sealed)**.

### 누적 MCP 룰 후보 300+종 (batch 7-22)

batch 7-22 합계 MCP 룰 후보가 **300종**을 넘어섰다. ⭐⭐⭐ 강한 후보 (batch 22 강화):

- **`metaphor-fidelity-locator`** (12+ PR) — *현실 메타포 정합*.
- **`model-view-dependency-direction`** (13+ PR) — *MVC 절대 원칙*.
- **`virtual-object-vs-real-domain`** (8+ PR) — *가상 객체 회피*.
- **`singleton-deck-via-companion`** (20+ PR) — *Singleton 안티패턴*.
- **`blackjack-rule-fidelity-comparison`** (17+ PR) — *블랙잭 룰 정확성*.
- **`multi-year-reviewer-activity`** (2+ reviewer) — *말리빈/두루 다년 활동*.
- **`function-name-vs-return-semantic-mismatch`** (10+ PR).
- **`pattern-applied-without-need`** (8+ PR).
- **`lateinit-var-call-order-invariant`** (12+ PR).
- **`team-code-vs-personal-code`** (1 PR) — *팀의 코드 어휘* (신규 ⭐⭐).
- **`mathematical-naturalness-as-model-criterion`** (1 PR) — *수학식 자연스러움*.

### 최종 정리 진입 시점 — batch 22 완료

| 지표 | batch 21 | batch 22 (현재) |
|---|---|---|
| 총 PR | 101 | **106** |
| reviewer | 14 | **14** (두루 다년 활동) |
| 양 단계 완성 reviewees | 40 | **42** |
| 2단계만 분석 | 0 | **1 (Hogu59)** |
| 1단계만 reviewees | 21 | **21** |
| 2025 코호트 | 10 PR | **11 PR** (+ devfeijoa) |
| 2023 코호트 | 11+ | **12+** (+briandr97 = 최종 1단계 ≥10 미분석 완료) |
| 메타 케이스 | 3 | **4** (+두루 다년 활동) |
| MCP 룰 후보 | 250+ | **300+** |

→ **2023 코호트 ≥10 thread 1단계 분석 완료** + **2025 코호트 11 PR** + **메타 케이스 4건** + **300+ MCP 룰 후보**. *남은 작업: 5~9 그룹 짧은 분석 또는 최종 정리 진입*.

### §21 신규 안티패턴 (batch 21, 5 PR)

batch 21 (#142, #143, #109, #113, #118) 에서 신규/강화 안티패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **reviewer 자가 의도 명료화 + 자가 사과** | 4+ (#142·#126·#130·#109) | ⭐⭐ — `reviewer-self-clarification-explicit` 강화 |
| **학습 목표 회수 어휘** | 3+ (#142·#129·#118) | ⭐⭐ — `abstraction-purpose-revisit` 강화 |
| **학생 자가 코드 예시 + 자가 의문** | 2+ (#142·#113) | ⭐⭐ — `student-self-code-example-as-question` 강화 |
| **`tailrec` 자가 학습 + 바이트코드 확인** | 2+ (#138·#142) | ⭐⭐ — `tailrec-optimization-applicability` 강화 |
| **`-0.0` Float IEEE 754 자가 학습** | 2+ (#131·#143) | ⭐ — `negative-zero-floating-point-trap` 강화 |
| **다른 reviewer 어휘 cross-reference (학생)** | 1 (#143) | ⭐ — `peer-reviewer-cross-reference` 신규 |
| **Kotlin 어휘 자가 N 분류 (property vs function)** | 1 (#143) | ⭐ — `property-vs-function-criteria` 신규 |
| **결과 vs 수익률 enum 분리** | 1 (#143) | ⭐ — `result-vs-rate-enum-separation` 신규 |
| **DI vs 내부 생성** | 2+ (#143·#109) | ⭐⭐ — `dependency-injection-vs-internal-creation` 강화 |
| **Dummy zero for domain absent (Dealer BetAmount 0 vs X)** | 2+ (#87·#143) | ⭐ — `dummy-zero-for-domain-absent` 강화 |
| **symmetric compare bidirectional call** | 3+ (#142·#143·#113) | ⭐⭐ — `symmetric-compare-bidirectional-call` 강화 |
| **enum static vs instance method locator** | 1 (#143) | ⭐ — `enum-static-vs-instance-method-locator` 신규 |
| **external-collection-as-method-arg-vs-member** | 1 (#143) | ⭐ — `external-collection-as-method-arg-vs-member` 신규 |
| **테스트 회귀 (Deck object 제거 부작용)** | 1 (#143) | ⭐ — `test-regression-from-deck-refactor` 신규 |
| **view-format-as-domain-invariant-tradeoff** | 1 (#143) | ⭐ — `view-format-as-domain-invariant-tradeoff` 신규 |
| **english 어순 어색 (`cardAdd`)** | 2+ (#143·#87) | ⭐ — `english-word-order-naming` 강화 |
| **computed property 재계산 비용** | 1 (#143) | ⭐ — `computed-property-vs-val-recompute-cost` 신규 |
| **학생 자가 추상화 활용 부족 자가 인지** | 1 (#143) | ⭐ — `student-self-abstraction-underuse` 신규 |
| **parameter-explosion-vs-object-passing** | 1 (#143) | ⭐ — 신규 |
| **State 가 값 vs 객체 받기 (관심사)** | 1 (#109) | ⭐ — `state-receives-value-vs-object` 신규 |
| **reviewer 자가 position revision** | 1 (#109) | ⭐⭐ — `reviewer-self-position-revision` 신규 |
| **테스트 = 도메인 설계 개선 어휘** | 4+ (#87·#129·#142·#109) | ⭐⭐ — `test-driven-domain-improvement` 강화 |
| **factory function vs constructor redundancy** | 1 (#109) | ⭐ — 신규 |
| **constant aggregation vs domain distribution** | 1 (#109) | ⭐ — 신규 |
| **assert-all vs multiple assertions** | 1 (#109) | ⭐ — 신규 |
| **BDD given/when/then fidelity** | 1 (#109) | ⭐ — 신규 |
| **init block side effect** | 1 (#109) | ⭐ — 신규 |
| **external flow control vs internal** | 1 (#109) | ⭐ — 신규 |
| **boolean variable naming** | 1 (#109) | ⭐ — 신규 |
| **secondary constructor vs default value** | 1 (#109) | ⭐ — 신규 |
| **enum vs Boolean (context-dependent)** | 1 (#113) | ⭐⭐ — `enum-vs-boolean-context-dependent` 신규 |
| **Controller = 카지노 메타포 vs 참가자 자가** | 1 (#113) | ⭐ — `controller-as-game-mediator-vs-domain-game-object` 신규 |
| **reviewer 자가 suggestion revision** | 1 (#113) | ⭐⭐ — `reviewer-self-suggestion-revision` 신규 |
| **extension function locator** | 1 (#113) | ⭐ — 신규 |
| **수학적 자연스러움 = 모델 기준** | 1 (#118) | ⭐⭐⭐ — `mathematical-naturalness-as-model-criterion` 신규 |
| **Flyweight 패턴 자가 학습** | 1 (#118) | ⭐ — `flyweight-pattern-card-caching` 신규 |
| **reviewer scenario code example** | 1 (#118) | ⭐⭐ — `reviewer-scenario-code-example` 신규 |
| **MVC 패턴 매몰 vs 객체 이름 집중** | 1 (#118) | ⭐⭐ — `pattern-vs-object-naming-priority` 신규 |
| **Kotlin 버전 업데이트 학습 권유** | 1 (#118) | ⭐ — `kotlin-version-feature-learning` 신규 |
| **카지노 메타포 (graceful shutdown)** | 1 (#118) | ⭐ — `card-shortage-handling-strategy` 신규 |
| **현실 메타포 vs SRP 트레이드오프** | 1 (#118) | ⭐⭐ — `metaphor-fidelity-vs-srp-tradeoff` 신규 |
| **reviewer 다년 활동 (말리빈 2024→2025)** | 1 (#118) | ⭐⭐ — `multi-year-reviewer-activity` 신규 |
| **Ace 처리 3 방식 (while vs math vs recursion)** | 1+ (#118) | ⭐ — `ace-bonus-while-vs-math-vs-recursion` 신규 |
| **「객체지향의 사실과 오해」 학생 자가 인용** | 1 (#118) | ⭐⭐⭐ — *MCP `oh-my-oop` 핵심 가치 정점 학생 자가 인용* |
| **현실 메타포** | 12+ | ⭐⭐⭐ — `metaphor-fidelity-locator` 강화 |
| **virtual-object-vs-real-domain (CardDistributor)** | 8+ | ⭐⭐⭐ — 강화 |
| **블랙잭 룰 정확성 (`<` vs `<=`)** | 17+ | ⭐⭐⭐ — 강화 |
| **Singleton Deck (companion)** | 20+ | ⭐⭐⭐ — 강화 |
| **model-view-dependency-direction** | 12+ | ⭐⭐⭐ — 강화 |

### batch 21 신규 reviewer

- **@malibinYun (말리빈) — PR #118 — *2024 reviewer 다년 활동* (학생 → reviewer 진화의 반대 시점)** — *MCP 룰 `multi-year-reviewer-activity` 신규 메타 케이스*. 누적 reviewer = 14 명 유지 (말리빈 = 기존 2024 reviewer).

### batch 21 학생/reviewer 메타 케이스

- **2025 코호트 10 PR 코퍼스 정점** (2023·2024·2025 3 시기 합류). *모바일 안드로이드 7기 8 reviewees*.
- **reviewer 다년 활동** (말리빈 2024 → 2025) = *학생 → reviewer 진화 메타 케이스 (krrong/hyemdooly) 의 반대 시점*.
- **doabletuple 양 단계 완성 (#126 + #142)** — *학생/reviewer 양방향 자가 사과 (Thread 1) + 다형성 학습 (Thread 10 학생 자가 코드 예시) + tailrec 바이트코드 확인*.
- **medAndro 양 단계 완성 (#130 + #143)** — *학생 자가 *원래 그리던 꿈을 펼쳐볼까* (다른 reviewer cross-reference) + Kotlin 어휘 자가 4 분류 + `-0.0` Float IEEE 754 자가 학습*.
- **학생 「객체지향의 사실과 오해」 자가 인용 (PR #118 gahyunkim)** — **MCP `oh-my-oop` 핵심 가치 정점 학생 자가 인용**.
- **reviewer 자가 의도 명료화 + 자가 사과** 4 사례 누적 (PR #126·#130·#142·#109).

### 누적 MCP 룰 후보 250+종 (batch 7-21)

batch 7-21 합계 MCP 룰 후보가 **250종**을 넘어섰다. ⭐⭐⭐ 강한 후보 (batch 21 강화):

- **`metaphor-fidelity-locator`** (12+ PR) — *현실 메타포 정합*. 핵심 어휘.
- **`model-view-dependency-direction`** (12+ PR) — *MVC 절대 원칙*.
- **`virtual-object-vs-real-domain`** (8+ PR) — *Picker/Manager/CardDistributor 가상 객체*.
- **`singleton-deck-via-companion`** (20+ PR) — *Singleton 안티패턴 정점*.
- **`blackjack-rule-fidelity-comparison`** (17+ PR) — *블랙잭 룰 정확성*.
- **`student-to-reviewer-evolution-meta`** (2 사례) — *krrong + hyemdooly 진화*.
- **`multi-year-reviewer-activity`** (1 사례) — *말리빈 다년 활동* (신규).
- **`mathematical-naturalness-as-model-criterion`** (1 PR) — *수학식 단순성 = 모델 자연스러움* (신규 ⭐⭐⭐).
- **`pr-body-question-explicit-reviewer-quote`** (3+ PR).
- **`pattern-applied-without-need`** (7+ PR) — *Service/Manager/Builder 패턴 매몰*.
- **`enum-with-ui-value`** (17+ PR).

### 최종 정리 진입 시점 — batch 21 완료 후

| 지표 | batch 18 | batch 19 | batch 20 | batch 21 (현재) |
|---|---|---|---|---|
| 총 PR | 86 | 91 | 96 | **101** |
| reviewer | 12 | 13 | 14 | **14** (말리빈 다년) |
| 양 단계 완성 reviewees | 33 | 35 | 38 | **40** |
| 1단계만 reviewees | 20 | 21 | 20 | **21** |
| 코호트 시기 | 2023·2024 | +2025 (2 PR) | 2025 (5 PR) | **2025 (10 PR)** |
| 메타 케이스 | 1 (krrong) | 1 | 2 (krrong+hyemdooly) | **3 (+말리빈 다년)** |
| MCP 룰 후보 | 130+ | 160+ | 200+ | **250+** |

→ **2025 코호트 10 PR 코퍼스 정점 + 메타 케이스 3건 + 250+ MCP 룰 후보**. *사용자 피드백 (corpus-saturation-judgement): 적절한 데이터 1개라도 의미 있음 → 계속 진행*.

### §20 신규 안티패턴 (batch 20, 5 PR)

batch 20 (#138, #139, #35, #126, #130) 에서 신규/강화 안티패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **PR 본문 자가 의문 + reviewer 라인 인용 + 답변** | 3+ (#35·#126·#138) | ⭐⭐⭐ — `pr-body-question-explicit-reviewer-quote` 강화 |
| **학생 → reviewer 진화 메타 케이스 2번째 (hyemdooly 2년)** | 2+ (krrong + hyemdooly) | ⭐⭐⭐ — `student-to-reviewer-evolution-meta` 강화 |
| **2025 코호트 5 PR 코퍼스 형성 (셀프 체크리스트 + 모든 스레드 commit SHA + 학생 자가 의문 풍부)** | 5 (#117·#129·#138·#126·#130) | ⭐⭐⭐ — 코호트 형성 |
| **reviewer 자가 한계 강한 어휘 인정 + 사과** | 1 (#130) | ⭐⭐ — `reviewer-self-limitation-explicit-apology` 신규 |
| **value class + @JvmInline = Kotlin 어휘 자가 학습** | 1 (#138) | ⭐⭐ — `value-class-application-and-rationale` 신규 |
| **require 예외 vs runCatching 재입력 (graceful retry)** | 2+ (#129·#138) | ⭐⭐ — `require-exception-vs-graceful-retry` 신규 |
| **super 키워드 = 공통 로직 + 자식 확장 (4 스레드 학습)** | 1 (#138) | ⭐⭐ — `super-keyword-for-shared-logic` 신규 |
| **재귀 함수 + tailrec = 명령형 → 함수형** | 2+ (#138·#117) | ⭐⭐ — `recursive-vs-while-functional` 신규 |
| **객체 소유 vs 매개변수 전달 구분** | 1 (#138) | ⭐⭐ — `object-ownership-vs-parameter-passing` 신규 |
| **형식 규칙 부산물 인공 객체 자가 비판 (BlackJackTable 자가 제거)** | 1 (#138) | ⭐⭐ — `form-rule-artificial-grouping-self-critique` 신규 |
| **인스턴스 변수 제약 부산물 묶음** | 7+ (#133·#88·#132·#136·#93·#87·#138) | ⭐⭐ — `instance-variable-limit-artificial-grouping` 강화 |
| **lazy init companion vs instance pool** | 1 (#138) | ⭐ — `lazy-init-companion-vs-instance-pool` 신규 |
| **현실 메타포 (외부 장치 X = 참가자 자가 판단)** | 10+ | ⭐⭐⭐ — `metaphor-fidelity-locator` 강화 |
| **시그니처 차이 = 추상화 불가 + 학생/reviewer 자가 한계 인정** | 1 (#126) | ⭐⭐ — `abstract-method-blocked-by-signature-divergence` 신규 |
| **변수명 = 타입 이름 회피 + 도메인 어휘 (학생 자가 4 안 분석)** | 2+ (#117·#126) | ⭐ — `variable-name-by-type-vs-meaning` 신규 |
| **비즈니스 로직 vs Controller 로직 구분 (카드 N장 공개)** | 3+ (#129·#138·#126) | ⭐⭐ — `business-logic-vs-controller-logic` 강화 |
| **변경 가능성 = View 책임 지표** | 1 (#126) | ⭐⭐ — `change-impact-as-locus-criteria` 신규 |
| **InputView 입력 안내 출력 = OK (분리 엄격성 트레이드오프)** | 1 (#126) | ⭐ — `input-view-output-strict-separation` 신규 |
| **객체 위치 = 변경 영향 범위 (Choice 도메인 vs View)** | 1 (#126) | ⭐ — `object-locus-by-change-impact` 신규 |
| **상태 플래그 vs 도메인 상태 판단 (initialHandShown)** | 1 (#126) | ⭐ — `state-flag-vs-domain-state-judgement` 신규 |
| **부생성자 (vararg cards) = 테스트 fixture 의도** | 2+ (#126·#130) | ⭐ — `test-fixture-secondary-constructor` 신규 |
| **enum reverse() vs operator fun not()** | 2+ (#36·#126) | ⭐ — `enum-reverse-method-vs-operator-not` 신규 |
| **Kotlin stdlib 확장 함수 활용 (filterIsInstance, getOrNull)** | 4+ (#117·#138·#126·#139) | ⭐⭐ — `kotlin-stdlib-extension-application` 신규 |
| **컴파일 시 invariant 강제 (생성자 타입 분리)** | 5+ (#129·#79·#92·#48·#126) | ⭐⭐ — `compile-time-singleton-vs-runtime-filter` 강화 |
| **결과 통계 위치 (Dealer vs Players vs 외부)** | 1 (#126) | ⭐ — `result-aggregation-locator` 신규 |
| **블랙잭 룰 정확성 정점 (`<` vs `<=` 양가성)** | 15+ ⭐⭐⭐ | `blackjack-rule-fidelity-comparison` 강화 |
| **Singleton Deck 안티패턴 4 가지 자가 인지** | 19+ (#130 누적 정점) | ⭐⭐⭐ — `singleton-deck-via-companion` 강화 |
| **테스트 = 동작 명세 + 부작용 검증** | 1 (#130) | ⭐ — `test-side-effect-verification` 신규 |
| **YAGNI 위반 자가 인지 vs 제거 비용 (Translator)** | 2+ (#146·#130) | ⭐ — `yagni-violation-removal-cost` 신규 |
| **도메인 룰 상수 위치 = 도메인** | 1 (#130) | ⭐ — `domain-constant-locator` 신규 |
| **enum.ordinal vs 커스텀 orderNumber** | 1 (#130) | ⭐ — `enum-ordinal-vs-custom-property` 신규 |
| **Card 인덱스 기반 생성 vs 도메인 의미 누수** | 1 (#130) | ⭐ — `card-index-vs-card-identity` 신규 |
| **Boolean 메서드 의미 반전 (isDrawFinish 16 이하 종료)** | 3+ (#117·#139·#130) | ⭐⭐ — `boolean-method-semantic-inversion` 신규 |
| **클래스 명 vs 표준 라이브러리 충돌 (Number)** | 1 (#130) | ⭐ — `class-name-vs-stdlib-collision` 신규 |
| **상태 계산 위치 (enum companion 정적 vs HandCards 자가)** | 1 (#130) | ⭐ — `state-calculation-locator` 신규 |
| **DSL 활용 시점 (여러 번 + 테스트 fixture)** | 1 (#35) | ⭐ — `dsl-applicability-criteria` 신규 |
| **Kotlin 예외 처리 4 원칙 + 외부글 (Elizarov)** | 3+ (#129·#138·#35) | ⭐⭐ — `kotlin-exception-handling-strategy` 신규 |
| **Dealer 수익 = Players 합 부호 반전** | 6+ | ⭐⭐ — `dealer-profit-as-negated-player-sum` 강화 |
| **Domain layer = 가장 테스트 쉬움 = 로직 우선 위치** | 3+ (#35·#87·#129) | ⭐⭐ — `domain-layer-testability-priority` 신규 |
| **UI 재입력 + Domain 검증 = MVC 의존 방향 정공** | 2+ (#35·#129) | ⭐ — `retry-loop-locator-ui-vs-domain` 신규 |
| **블랙잭 0.5 vs 1.5 모델 (순수익 vs 총 받음)** | 1 (#35) | ⭐ — `blackjack-payout-vs-profit-model` 신규 |
| **PUSH vs DRAW 도메인 어휘** | 1 (#35) | ⭐ — `domain-vocabulary-fidelity` 신규 |
| **HIT_STANDARD_POINT = 17 명명 정확성** | 1 (#35) | ⭐ — `dealer-stand-threshold-naming` 신규 |
| **private constructor + companion object factory** | 1 (#35) | ⭐ — `private-constructor-with-static-factory` 신규 |
| **set prefix vs create prefix** | 1 (#35) | ⭐ — `set-prefix-vs-create-prefix` 신규 |
| **information-locator-as-responsibility** | 1 (#35) | ⭐ — `information-locator-as-responsibility` 신규 |
| **indent 깊이 = 함수/지역 변수 분리** | 1 (#35) | ⭐ — `indent-depth-reduction` 신규 |
| **boolean 메서드 N개 분리 = when 분기 중복** | 1 (#35) | ⭐ — `boolean-method-decomposition-redundancy` 신규 |
| **이름 부연설명 회피 (current/total)** | 2+ (#117·#139) | ⭐ — `name-redundant-qualifier` 신규 |
| **이전 단계 코드 잔재 정리 (abs 자가 정정)** | 1 (#139) | ⭐ — `dead-logic-from-previous-stage` 신규 |
| **함수 합성 동치 = 추상화 의도 X** | 1 (#117) | ⭐ — `function-decomposition-creates-identity` 신규 |
| **컬렉션 이름 vs 람다 인자 이름 일관성** | 1 (#139) | ⭐ — `collection-name-vs-lambda-element-naming` 신규 |
| **학생 자가 한계 4 종 명시 (시간 부족 인정)** | 2+ (#130·#36·#129·#138) | ⭐⭐ — `student-self-limitations-explicit` 신규 |
| **페어 학습 + 외부 PR 인용** | 1 (#130) | ⭐ — `peer-learning-cross-pr-reference` 신규 |
| **이전 미션 리뷰 재발 (학습 시간성 한계)** | 1 (#130) | ⭐ — `repeated-feedback-across-missions` 신규 |
| **production vs test 코드 분리** | 1 (#130) | ⭐ — `production-vs-test-code-separation` 신규 |
| **abstract class + abstract 메서드 유무 = open class 동치** | 5+ | ⭐⭐ — `abstract-without-abstract-method` 강화 |
| **PR 본문 자가 의문 답변 가능성 낮음 (PR #139)** | 1 (#139) | ⭐ — `pr-body-question-visibility-low` 신규 |
| **반환 타입 도메인화 (List<X> → X일급컬렉션)** | 8+ | ⭐⭐ — `return-type-domain-object` 신규 |
| **Float vs Double 도메인 정확성** | 1 (#139) | ⭐ — `float-vs-double-domain-precision` 신규 |
| **학생 오해 + reviewer 재명시** | 2+ (#117·#139) | ⭐⭐ — `student-misunderstanding-reviewer-restatement` 신규 |
| **2 reviewer 의 반대 시점 (ProfitCalculator)** | 2 (#129·#139) | ⭐⭐⭐ — `result-decider-external-object-vs-participant-method` 신규 |
| **추상화 활용 점검 + 학습 의도 회수** | 2+ (#129·#139) | ⭐⭐ — `abstraction-purpose-revisit` 신규 |
| **CQS 위반 재발 (drawCount)** | 2+ (#117·#139) | ⭐ — `command-query-separation` 강화 |
| **부모 추상 메서드 반환 의미 역방향 재발** | 2+ (#117·#139) | ⭐ — `method-return-semantic-asymmetry-between-subclasses` 강화 |
| **var betAmount + betting() 호출 강제 X** | 9+ | ⭐⭐ — `lateinit-var-call-order-invariant` 강화 |
| **stateless 클래스 매 호출 시 신규 인스턴스** | 2+ (#117·#139) | ⭐ — `stateless-class-vs-companion-object` 강화 |

### batch 20 신규 reviewer

- **@hyemdooly (둘리) — PR #130 — *14번째 reviewer + 학생 → reviewer 진화 (2년)*** — *krrong 결과 같은 메타 케이스 2번째*. **MCP `oh-my-oop` *학습 = 시간 두고 반복* 정점**.

### batch 20 학생/reviewer 메타 케이스

- **2025 코호트 5 PR 코퍼스 형성 (모바일 안드로이드 7기)** — *셀프 체크리스트 + 모든 스레드 commit SHA + 학생 자가 의문 풍부* 일관 패턴 (#117·#129·#138·#126·#130).
- **hyemdooly 2년 학생 → reviewer 진화** — *2023 PR #21·#35 학생* → *2025 PR #130 reviewer*. *krrong 1년 진화 + hyemdooly 2년 진화 = 메타 케이스 2건*. **MCP `oh-my-oop` *학습 = 시간 두고 반복* 어휘 정점**.
- **reviewer 자가 한계 강한 어휘 인정** — hyemdooly PR #130 *"정말정말 미안해요!!"* + KwonDae PR #126 *"저도 공통로직에만 집중하다보니 외부 입력을 받아야 한다는 것을 놓쳤네요 🫠"*.
- **rosemin928 양 단계 완성 (#129 + #138)** — *PR 본문 자가 의문 2개 → 자가 책임 이동 + reviewer 권유 전 선제 적용* + *8 덱 도메인 룰 자가 학습*.
- **parkjiminnnn 양 단계 완성 (#117 + #139)** — *진흙탕 코드 자가 인정 + 학생 자가 거절 + 대안 제시*.
- **hyemdooly 양 단계 완성 (#21 + #35)** — *PR 본문 자가 의문 3개 + reviewer 라인 인용 답변 (PR #35) → 2년 후 reviewer 진화 (PR #130)*.

### 누적 MCP 룰 후보 200+종 (batch 7-20)

batch 7-20 합계 MCP 룰 후보가 **200종**을 넘어섰다. ⭐⭐⭐ 강한 후보 (batch 20 강화):

- **`metaphor-fidelity-locator`** (10+ PR) — *현실 메타포 정합*. 핵심 어휘.
- **`model-view-dependency-direction`** (11+ PR) — *MVC 절대 원칙*.
- **`blackjack-rule-fidelity-comparison`** (15+ PR) — *블랙잭 룰 정확성*.
- **`singleton-deck-via-companion`** (19+ PR) — *Singleton 안티패턴*. 정점.
- **`student-to-reviewer-evolution-meta`** (2 사례) — *학생 → reviewer 진화* (krrong + hyemdooly).
- **`pr-body-question-explicit-reviewer-quote`** (3+ PR) — *PR 본문 자가 의문 + reviewer 라인 인용 답변*.
- **`virtual-object-vs-real-domain`** (6+ PR) — *Picker/Manager 가상 객체 회피*.
- **`test-as-design-spec`** (3+ PR) — *Wirfs-Brock RDD 정점*.
- **`enum-with-ui-value`** (17+ PR) — *enum UI 어휘 누수*.
- **`is-operator-polymorphism-avoidance`** (6+ PR) — *SOLID OCP*.

### 최종 정리 진입 시점 — batch 20 완료 후 **여전히 추가 가치 있음**

| 지표 | batch 18 | batch 19 | batch 20 (현재) |
|---|---|---|---|
| 총 PR | 86 | 91 | **96** |
| reviewer | 12 | 13 | **14** (hyemdooly 합류) |
| 양 단계 완성 reviewees | 33 | 35 | **38** |
| 1단계만 reviewees | 20 | 21 | **20** (hyemdooly/rosemin928/parkjiminnnn 양 단계 완성으로 이동) |
| 코호트 시기 | 2023·2024 | 2023·2024·2025 (2 PR) | **2023·2024·2025 (5 PR)** |
| 메타 케이스 | 1 (krrong 1년) | 1 (krrong 1년) | **2 (krrong + hyemdooly 2년)** |
| MCP 룰 후보 | 130+ | 160+ | **200+** |

→ **2025 코호트 5 PR 코퍼스 형성 + 학생 → reviewer 진화 메타 케이스 2건 + 200+ MCP 룰 후보**. *사용자 피드백: 적절한 데이터 1개라도 의미 있음 → 계속 진행 권장*.

### §18 신규 안티패턴 (batch 19, 5 PR)

batch 19 (#36, #87, #21, #117, #129) 에서 신규/강화 안티패턴:

| 패턴 | 등장 PR 수 | MCP 룰 후보 |
|---|---|---|
| **현실 메타포 정합 (현실에서 누가 이 일을 하는가)** | **9+ (#117·#129·#31·#21·#80·#76·#36·#73·#74)** | ⭐⭐⭐ — `metaphor-fidelity-locator` 정점 |
| **추상화 활용 점검 + 학습 의도 회수** | 2+ (#129·#15) | ⭐⭐ — `abstraction-purpose-revisit` 신규 |
| **State Context 책임 분석 (Context 객체 명시)** | 4+ (#73·#87·#93·#136) | ⭐⭐ — `state-context-locator` 신규 |
| **State ↔ Context 양방향 참조 회피** | 1+ (#87) | ⭐⭐ — `state-context-bidirectional-reference` 신규 |
| **테스트 = 객체 설계 명세서 (역할·책임·협력)** | 3+ (#26·#87·#93) | ⭐⭐⭐ — `test-as-design-spec` 강화 |
| **`is` 연산자 다형성 회피 (SOLID OCP)** | 6+ (#147·#87·#136·#152·#93·#98) | ⭐⭐⭐ — `is-operator-polymorphism-avoidance` 강화 |
| **디미터 법칙 위반 (a.b.c.d 깊이)** | 6+ (#93·#133·#146·#87·#137·#148) | ⭐⭐ — `law-of-demeter-violation-depth` 강화 |
| **함수 명명 vs 실제 반환 의미 불일치** | 3+ (#36·#117·#21) | ⭐⭐ — `function-name-vs-return-semantic-mismatch` 강화 |
| **property val vs computed property (`get()=`) 트레이드오프** | 1 (#117) | ⭐ — Kotlin 어휘 |
| **Kotlin `by` delegation 권유 vs PR #21 위임 = 나쁜 습관 (반대 시점)** | 1 (#117·#21) | ⭐⭐ — `delegation-vs-encapsulation-tradeoff` 신규 |
| **반복문 의존 vs 수학적 풀이 (Ace 합산)** | 2+ (#117·#87) | ⭐⭐ — `iterative-loop-vs-math-formula` 강화 |
| **함수 합성 동치 = 추상화 의도 X (score - aceCount + aceCount = score)** | 1 (#117) | ⭐ — `function-decomposition-creates-identity` 신규 |
| **CQS (Command-Query Separation) 위반 (drawCount 2 역할)** | 1 (#117) | ⭐ — `command-query-separation` 신규 |
| **테스트 = 하드코드 검증 (production 코드 의존 X)** | 3+ (#99·#26·#117) | ⭐⭐ — `test-hardcoded-vs-production-derived` 강화 |
| **함수형 프로그래밍 학습 미션 어휘 (학습 의도 의식)** | 1 (#117) | (reviewer 어휘) |
| **Model → View 의존성 분리 + ViewMapper / 확장함수** | 9+ (#117·#21·#87·#88·#80·#76·#93·#107·#137·#90) | ⭐⭐⭐ — `model-view-dependency-direction` 강화 |
| **딜러 여러 명 invariant 강제 시점 (생성자 타입 분리 vs single vs filter)** | 4+ (#129·#79·#92·#48) | ⭐⭐ — `compile-time-singleton-vs-runtime-filter` 신규 |
| **sealed interface vs abstract class vs open class 트레이드오프** | 5+ (#129·#98·#36·#147·#93·#136) | ⭐⭐ — `sealed-vs-abstract-vs-open-locator` 신규 |
| **abstract class 추상 메서드 없음 = open class 동치** | 5+ (#95·#36·#117·#129·#147) | ⭐⭐ — `abstract-without-abstract-method` 강화 |
| **테스트 가능성 = interface 분리 (DIP)** | 4+ (#129·#48·#39·#46) | ⭐⭐ — `interface-for-test-substitution` 신규 |
| **검증 코드 함수 분리 vs require inline 트레이드오프** | 1 (#129) | ⭐ — `validation-function-vs-require-inline` 신규 |
| **커뮤니케이션 메타 (줄글 vs 핵심 내용)** | 1 (#129) | (reviewer 어휘 — MCP 핵심 가치 합류) |
| **Boolean 함수명 = true/false 의미 명시** | 1 (#129) | ⭐ — `boolean-function-name-ambiguity` 신규 |
| **Tell-Don't-Ask 부분 적용 = 부분 위반** | 1+ (#36) | ⭐⭐ — `tell-dont-ask-partial-coverage` 신규 |
| **Domain/View 비용 메타포 (서버/클라이언트)** | 1 (#36) | ⭐ — 메타포 어휘 |
| **callback 람다 = View 호출 비용** | 2+ (#36·#137) | ⭐ — `callback-lambda-view-cost` 신규 |
| **nullable enum vs not-nullable enum vs NONE 멤버 3안** | 1 (#36) | ⭐ — `enum-nullability-axis` 신규 |
| **Ace bonus 단일 +10 vs Multi-Ace 수학적** | 2+ (#36·#129·#117) | ⭐⭐ — `ace-bonus-single-vs-multi` 강화 |
| **operator fun not() 의미 일치 (논리 부정 vs 의미 반전)** | 1 (#36) | ⭐ — `operator-not-semantic-misalign` 신규 |
| **Stepdown 원칙 (호출자 먼저, 호출 함수 뒤)** | 1 (#36) | ⭐ — `function-order-stepdown` 신규 |
| **request* 함수 폭증 vs Generic read** | 1 (#36) | ⭐ — `input-function-proliferation-vs-generic` 신규 |
| **Tuple 누수 (Pair<String, Int>) vs 도메인 DTO** | 3+ (#36·#87·#117) | ⭐⭐ — `tuple-leak-vs-domain-dto` 강화 |
| **backing property + data class 양립** | 2+ (#36·#46) | ⭐ — `backing-property-applicability` 신규 |
| **가상 객체 vs 실재 도메인 객체 (CardPicker → Player)** | 6+ (#80·#145·#100·#76·#39·#31·#21) | ⭐⭐⭐ — `virtual-object-vs-real-domain` 강화 |
| **일급 컬렉션 + 위임 = 나쁜 습관 (PR #21·#117 반대 시점)** | 4+ (#21·#74·#108·#46) | ⭐⭐ — `first-class-collection-delegation-pitfall` 강화 |
| **테스트 본문 = 필요한 정보 + factory 함수 (외부글 testing.googleblog)** | 5+ (#99·#26·#21·#87·#93) | ⭐⭐ — `test-fixture-essential-info` 강화 |
| **버스트/블랙잭 룰 정확성 (< vs ≤, 16 ≤ stay 등)** | 10+ (누적) | ⭐⭐⭐ — `blackjack-rule-fidelity-comparison` 강화 |
| **부모 추상 메서드 반환 의미 자식 별 역방향 (Dealer.turn vs Player.turn)** | 1 (#117) | ⭐ — `method-return-semantic-asymmetry-between-subclasses` 신규 |
| **stateless 클래스 인스턴스화 vs companion object 정적** | 1 (#117) | ⭐ — `stateless-class-vs-companion-object` 신규 |
| **mutable List public 노출 (val MutableList)** | 5+ | ⭐⭐ — `mutable-list-public-exposure` 강화 |
| **추상화 활용 = 공통 사항 → 추상 메서드 발견** | 1 (#129) | ⭐⭐ — `abstraction-as-shared-behavior-discovery` 신규 |
| **대칭 getResult vs compareWith (양방향 호출 위험)** | 1 (#129) | ⭐ — `symmetric-getResult-vs-compareWith` 신규 |
| **결과 누적 callback vs return** | 1 (#129) | ⭐ — `callback-action-for-result-aggregation` 신규 |
| **단순 위임 메서드 = 추가 책임 X (메서드 인공)** | 2+ (#129·#87) | ⭐ — `simple-delegation-method-unnecessary` 신규 |
| **모든 N 스레드 학생 자가 답변 + 커밋 SHA 첨부 (2025 코호트 정점)** | 2+ (#117·#129) | (학생 자가 학습 가시화 모범) |
| **2025 코호트 셀프 체크리스트 PR 본문 스타일** | 2 (#117·#129) | (2025 코호트 신규 형식) |

### batch 19 신규 reviewer

- **@woowahan-dino (디노) — PR #117 — *13번째 reviewer*** — *2025 코호트 reviewer*. *현실 메타포 + 학습 의도 의식 + 반복문 vs 수학적 풀이* 어휘.

### batch 19 학생/reviewer 메타 케이스

- **2025 코호트 (모바일 안드로이드 7기) 진입** — parkjiminnnn #117 + rosemin928 #129 — *셀프 체크리스트 PR 본문 + 모든 스레드 commit SHA + 학생 자가 한계 인정 + 자가 후속 의문 풍부*. **3 시기 코호트 합류 정점 (2023·2024·2025)**.
- **boogi-woogi (우기) 양 단계 완성** — 1단계 #18 (batch 18) + 2단계 #36 (batch 19) — *Tell-Don't-Ask 부분 적용 재발 + sealed class 학습 깊이* — *학생 자가 한계 인정 일관*.
- **jaeyeongjo (레오) 양 단계 완성** — 1단계 #73 (batch 18) + 2단계 #87 (batch 19) — *State Context 책임 명시 + 양방향 참조 회피 + 디미터 법칙 + 테스트 = 객체 설계 명세서* — *MCP `oh-my-oop` 핵심 가치 정점 어휘 합류*.
- **KwonDae (제이든) 메타 어휘 깊이 정점** — PR #129 — *커뮤니케이션 메타 + 학생 인간적 격려 + 추상화 활용 점검 + 현실 메타포 정공*. 누적 4 PR reviewer (PR #67·#75·#99·#129).

### 누적 MCP 룰 후보 160+종 (batch 7-19)

batch 7-19 합계 MCP 룰 후보가 **160종**을 넘어섰다. ⭐⭐⭐ 강한 후보 (batch 19 강화):

- **`metaphor-fidelity-locator`** (9+ PR) — *현실 메타포 정합*. 핵심 어휘.
- **`model-view-dependency-direction`** (9+ PR) — *MVC 절대 원칙*. MVC/MVP/MVVM 공통.
- **`virtual-object-vs-real-domain`** (6+ PR) — *Picker/Manager 가상 객체 회피*.
- **`is-operator-polymorphism-avoidance`** (6+ PR) — *SOLID OCP*.
- **`test-as-design-spec`** (3+ PR) — *Wirfs-Brock RDD 정점*.
- **`blackjack-rule-fidelity-comparison`** (10+ PR) — *블랙잭 룰 정확성 (< vs ≤)*.
- **`enum-with-ui-value`** (17+ PR) — *enum UI 어휘 누수*.
- **`controller-classification-criteria`** (다수 PR) — *Controller 책임 위치*.
- **`callback-naming-view-coupling`** — *View 동사 콜백*.
- **`pattern-applied-without-need`** (다수 PR) — *Builder/Strategy/Manager 과적용*.

### 최종 정리 진입 시점 — batch 19 완료 후 **매우 강력 권장**

| 지표 | batch 18 | batch 19 (현재) |
|---|---|---|
| 총 PR | 86 | **91** |
| reviewer | 12 | **13** (woowahan-dino 합류) |
| 양 단계 완성 reviewees | 33 | **35** (boogi-woogi/jaeyeongjo 추가) |
| 1단계만 reviewees | 20 | **21** (hyemdooly/parkjiminnnn/rosemin928 추가) |
| 코호트 시기 | 2023·2024 | **2023·2024·2025** (3 시기 합류) |
| MCP 룰 후보 | 130+ | **160+** |

→ **코퍼스 포화 + 메타 어휘 완전 정점 + 3 시기 코호트 합류**. **PROGRESS.md/SUMMARY.md/README.md + MCP 룰화 우선 진입 매우 강력 권장**.

### 누적 MCP 룰 후보 100+종 (batch 7-17)

batch 7-17 합계 MCP 룰 후보가 100종을 넘어섰다. ⭐⭐⭐ 강한 후보:

- **`pattern-applied-without-need`** (다수 PR: BaseHuman 추상화 #80, Manager 폭증 #145, Wallet 지갑 #100, 팩토리 메서드 #76, 일급 컬렉션 과적용 #39, Builder 패턴 #31)
- **`controller-classification-criteria`** (view 의존 + 테스트 가능 2 기준)
- **`callback-naming-view-coupling`** (printX/showX = View 동사)
- **`dependency-direction-clarification`** (UI→Domain OK / Domain→UI 문제)
- **`maintainer-perspective-locator`** (기획자 요구사항 + 동료 개발자 위치)
- **`manager-class-proliferation`** (Manager 폭증)
- **`kotlin-function-locus-criteria`** (top-level / object / 내부 함수 기준)
- **`sealed-class-when-exhaustive`** (누적 8 PR)
- **`abstract-without-abstract-method`** (누적 5 PR)
- **`blackjack-rule-fidelity`** (누적 7 PR)
- **`enum-with-ui-value`** (누적 15+ PR)
- **`controller-domain-coupling-depth`**

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
