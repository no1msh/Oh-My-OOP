# 블랙잭 미션에서 얻어갈 객체지향 인사이트

> 우아한테크코스 kotlin-blackjack 미션 135 PR 분석에서 추출.
> 본 문서의 중심은 **블랙잭 도메인을 통과해서 학습자가 가져갈 OOP 원칙·교훈**이다. reviewer/student 인용은 *근거*로만 짧게 등장한다.

---

## 왜 블랙잭이 OOP 학습 미션으로 *특별히* 적합한가

세 가지 도메인 특성이 OOP 핵심 원칙들과 자연스럽게 맞물려있다. 다른 코딩 미션(로또·자동차 경주)에 없거나 약한 결이다.

### (1) 다중 주체 + 동등성

딜러 1 + 플레이어 N. *양측이 동등한 참가자*이고, 한쪽이 다른 쪽에게 일방적으로 명령하는 구조가 아니다. → *메시지·협력·Tell-Don't-Ask*가 학생이 회피할 수 없는 형태로 등장한다.

### (2) 상태가 행동을 바꾼다

Hit → Stay/Bust/BlackJack 전이. *어떤 행동이 가능한가*가 *현재 상태가 무엇인가*에 종속된다. → *다형성·State 패턴*의 자연 학습장. 분기 N×M 폭증을 *학생이 직접 경험한 뒤* sealed interface를 만나면 도입의 *필요성*을 체감으로 학습한다.

### (3) 룰의 비대칭

- 딜러 ≤16 자동 hit / 플레이어 자율
- 딜러 베팅 없음 / 플레이어 베팅 있음
- 블랙잭(Ace+10 두 장)은 1.5배 / 일반 21은 1배
- Ace 1↔11 양가
- Bust 양측 가능 / BlackJack은 한쪽만

→ 단순 일반화로 풀리지 않아 *추상화의 한계*를 학습한다.

---

# 핵심 인사이트 10

## 1. 승부 판정 — Tell-Don't-Ask의 가장 명확한 케이스

**도메인 특성.** 승부는 *양측이 동등한 주체* 사이의 판정이다. 외부 심판이 없는 경기.

**자주 빠지는 함정.** 외부 정적 비교자.

```kotlin
class Judge {
    fun judge(dealer: Dealer, player: Player): Result {
        val dealerScore = dealer.getScore()    // 꺼내기
        val playerScore = player.getScore()    // 꺼내기
        return if (dealerScore > playerScore) Result.LOSE else Result.WIN
    }
}
```

이 코드의 어색함은 *Judge가 양측의 데이터를 꺼내서 비교*한다는 데 있다. 객체의 데이터를 *꺼내 쓰는 외부 코드*는 Tell-Don't-Ask 위반의 가장 직접적인 모습이다.

**풀어내는 방향.** 메시지로.

```kotlin
val result: Result = player.match(dealer)
```

판정 책임이 *참여자의 메시지*가 된다. *대칭/비대칭*은 부산물 트레이드오프로 학습:

| 대안 | 비교 |
|---|---|
| `a.match(b)` 일방향 | 단순, 다만 *누가 누구에게 묻는가*를 호출처가 결정 |
| `a.match(b)` + `b.match(a)` | 대칭, 다만 양측 결과 일관성 강제 비용 |
| `State.compareTo(other)` | 상태 패턴과 결합, 다형성 |

**가져갈 인사이트.** 객체 간 비교가 필요할 때, *외부 비교자*는 거의 항상 잘못된 첫 답이다. *객체에게 묻기*가 첫 답이고, 거기서부터 트레이드오프가 시작된다.

> *"몇 개 일치하는지 요청해서 결과를 받아오도록 해보세요. 객체지향 프로그래밍에서는 이 개념을 메시지를 보낸다 라고 표현합니다."* — laco-dev
>
> *"내 카드들의 정보를 넘겨줄테니 블랙잭인지 알려줘"* — BeokBeok

---

## 2. Dealer의 이중성 — 역할 vs 책임 분리

**도메인 특성.** Dealer는 *카드를 받는 참여자*이면서 *카드를 나눠주는 진행자*이다. 한 인격에 두 역할이 들어있다.

**자주 빠지는 함정.** 모든 책임을 Dealer 클래스에 흡수.

```kotlin
class Dealer {
    val hand: Hand
    fun deal(players: List<Player>) { ... }     // 진행자 책임
    fun draw(deck: Deck) { ... }                // 참여자 책임
    fun calculateScore() { ... }                // 참여자 책임
    fun decide(player: Player): Result { ... }  // 심판 책임?
}
```

→ god-object. 변경 이유가 *카드 배부 방식*, *블랙잭 룰*, *점수 계산* 세 축이 동시에 모인다.

**풀어내는 방향.** 책임을 분리한다.

```kotlin
abstract class Participant(val hand: Hand) {       // 참여자 = 카드 받는 책임
    abstract fun canDraw(): Boolean
}
class Dealer : Participant(...)
class Player(name: String) : Participant(...)

class Game(
    private val participants: List<Participant>,
    private val deck: Deck,
) {                                                 // 진행자 = 게임 진행
    fun start() { ... }
    fun playerTurn(player: Player) { ... }
    fun dealerTurn() { ... }
}
```

3안 비교:

- (A) `Dealer is-a Participant` + 별도 `Game`이 진행 책임
- (B) `abstract class Participant` 형제 + `Game`이 진행
- (C) Dealer가 진행 책임 보유 + Player는 자가 행동만

각 안의 *추상화 한계 지점*이 다르다. (A)/(B)는 *Dealer 자동 hit ≤16 룰*을 어디 둘지가 트레이드오프 — `Dealer.canDraw()` 오버라이드 vs `Game`이 룰 보유.

**가져갈 인사이트.** *한 객체가 여러 역할을 가지면 분리 후보*다. RDD의 *역할 = 책임의 그룹*이라는 정의가 블랙잭에서 가장 명확히 보인다. 분리 후 *어디가 책임의 자연스러운 거처인지*를 묻는 게 OOP 설계의 본질이다.

> *"해당 역할을 컴퓨터가 아니라 사람에게 시키려고 했을 때, 사람이 한 명 더 필요한가 아니면 같은 사람에게 시킬 수 있을까를 고민해보세요."* — ghojeong

---

## 3. State sealed interface — 분기 폭증의 다형성 흡수

**도메인 특성.** Hit / Stay / Bust / BlackJack. *현재 상태에 따라 가능한 행동이 다르다.*

**자주 빠지는 함정.** `when`/`if` 분기로 시작하고 상태 플래그를 흩뿌린다.

```kotlin
class Player {
    var score: Int = 0
    var isBust: Boolean = false
    var isBlackjack: Boolean = false
    var isStay: Boolean = false
}

fun play(player: Player) {
    when {
        player.score > 21 -> player.isBust = true
        player.score == 21 && player.hand.size == 2 -> player.isBlackjack = true
        player.score >= 17 -> player.isStay = true
        else -> { /* hit */ }
    }
}
```

→ Player에 *상태 플래그가 폭증*하고, 그 다음에 *모든 메서드가 이 플래그를 분기*하기 시작한다. 새 상태(예: Surrender) 추가하려면 *모든 분기 추적* 필요.

**풀어내는 방향.** sealed interface.

```kotlin
sealed interface State {
    fun draw(card: Card): State
    fun strength(): Int
}

class Hit(val hand: Hand) : State {
    override fun draw(card: Card): State {
        val next = hand + card
        return when {
            next.score().isBust() -> Bust(next)
            next.isBlackjack() -> BlackJack(next)
            next.score() >= 21 -> Stay(next)
            else -> Hit(next)
        }
    }
    override fun strength(): Int = hand.score().value
}
class Stay(val hand: Hand) : State { ... }
class Bust(val hand: Hand) : State {
    override fun strength(): Int = 0          // Bust는 비교에서 항상 패배
}
class BlackJack(val hand: Hand) : State {
    override fun strength(): Int = 22         // 일반 21보다 우위
}
```

State 패턴 도입의 *2 기준*:

1. **다형성을 활용하는가** — 각 상태가 *다른 행동 응답*을 하는가
2. **Context에 책임이 있는가** — State가 Context(Player)의 책임을 위임받는가

두 기준 모두 만족할 때 State 패턴이 *답*이지, 만족하지 않으면 enum + when으로 충분하다.

**도입 직후 자주 따라오는 함정.**

- *외부 mutation*: `player.state = Bust()` 직접 변경 → 상태 전이 룰이 우회된다. State private + `draw(card)` 메시지가 다음 상태 반환.
- *if state is Bust 잔재*: 다형성 도입했는데 호출처에서 다시 타입 검사. State 메서드로 책임 이동.
- *데이터 차이 없는 sealed*: 멤버 차이 없으면 enum과 동치다. 진짜 다형성 지점이 있는지 재검토.

**가져갈 인사이트.** 분기 N×M이 폭증하는 *경험* 뒤에 만난 sealed interface는 *이론적 도구*가 아니라 *답*이다. 패턴은 문제가 있을 때 답이다.

> *"State 디자인 패턴은 다음 두 가지를 확인합니다. 1. 다형성 활용 2. Context 책임 부여."* — ghojeong
>
> *"블랙잭 미션은 타입 캐스팅을 가능한 사용하지 않는 것이 숨겨진 요구사항이랍니다."* — malibinYun

---

## 4. Ace 1↔11 — 한 값에 두 의미

**도메인 특성.** Ace는 11 또는 1로 셀 수 있다. 한 값이 두 의미를 가지는 드물지만 명확한 케이스.

**자주 빠지는 함정.** 11 기본 + 차감 보정 루프.

```kotlin
fun score(cards: List<Card>): Int {
    var score = cards.sumOf { it.value }            // ACE = 11
    var aceCount = cards.count { it.rank == Rank.ACE }
    while (score > 21 && aceCount > 0) {
        score -= 10
        aceCount--
    }
    return score
}
```

문제:

- *절차지향* (상태 변경 + 루프 + 차감) — score/aceCount 두 가변 변수가 함께 변경
- *오답 가능성* — 구현 따라 ACE,ACE,JACK 같은 케이스에서 22 → 12를 한 번에 못 잡고 22 반환
- *Score 책임이 외부 함수에 흩어짐* — Hand·Card가 가져야 할 책임

**풀어내는 방향.** 4안.

| 안 | 표현 |
|---|---|
| **(A) 단일 룰** | `score = sum(asLow=1) + (if (containsAce && hardScore <= 21) +10 else 0)` |
| **(B) sealed Ace** | `sealed Ace { object LOW : Ace(1); object HIGH : Ace(11) }` — 가능한 조합 평가 |
| **(C) value class** | `value class Score(soft: Int, hard: Int)` — 양가성 자체를 표현 |
| **(D) Hand 수준 보정** | Card는 기본값만, Hand가 컬렉션 단위로 보정 |

각 안의 트레이드오프:

- (A) 단순 / Ace 외 양가 카드 추가 시 확장 X
- (B) 다형성 학습 가치 ↑ / 도입 비용 ↑
- (C) Score 자체가 양가 표현 / 비교 로직이 복잡해짐
- (D) 책임이 Hand에 집중 / Card 단독 점수 부재

**가져갈 인사이트.** *값이 두 의미를 가질 때* 절차로 풀려 들면 절차지향 시그널이 강하게 드러난다. *값 객체의 양가성*은 OOP에서 자주 만나지 않지만, 만났을 때는 *값 자체의 모델링*이 첫 답이다. 외부에서 `if/while`로 보정하는 건 거의 항상 잘못된 첫 답.

---

## 5. BettingMoney의 invariant 모순 — 값 객체의 책임 분리

**도메인 특성.** 베팅금은 *양수*여야 한다(`≥ 1`). 그런데 결과 수익은 *음수*(손실) 가능.

**자주 빠지는 함정.** 한 타입에 두 invariant.

```kotlin
class BettingMoney(val value: Int) {
    init { require(value > 0) }                            // 베팅금 = 양수
    operator fun times(rate: Double): BettingMoney =
        BettingMoney((value * rate).toInt())               // ⚠ rate=-1 시 require 위반
}
```

같은 타입을 반환하면 invariant 모순이 발생한다.

**연관 함정**: 배수별 메서드 폭증.

```kotlin
fun times1_5(): BettingMoney = ...
fun timesBlackjack(): BettingMoney = ...
fun timesDouble(): BettingMoney = ...
fun timesLose(): BettingMoney = ...     // -1배?
```

→ 1.5/2/0/−1 *배수 자체가 도메인 데이터*인데 *메서드 이름*에 박혀 닫혀 있다.

**풀어내는 방향.** 책임을 두 값 객체로 분리.

```kotlin
class BettingMoney(val value: Int) {
    init { require(value > 0) }                            // 양수만
    operator fun times(rate: Double): Profit =
        Profit((value * rate).toInt())                     // 결과는 Profit
}

@JvmInline
value class Profit(val value: Int)                         // 부호 있음
```

추가 함정: *베팅금이 결과에 따라 변하는 코드*.

```kotlin
class Player {
    var bettingAmount: Int    // ⚠ 결과에 따라 변경
}
```

→ 베팅금은 *불변*. 결과로 도출되는 건 *Profit* (별도 값).

**가져갈 인사이트.** 값 객체는 *생성 invariant*뿐 아니라 *산술 결과 타입*까지 설계 단위다. 산술이 invariant를 깨면 *결과 타입이 다른 객체*라는 신호.

> *"BettingMoney에는 음수가 들어가서는 안 되니, 수익률은 BettingMoney로 취급하지 않겠다는 의미겠지요."* — malibinYun
>
> *"베팅금액은 말 그대로 베팅금액입니다. (...) 경기 결과에 따라서 얻는 금액이 달라지는 것이고 베팅금액은 변하지 않습니다."* — krrong

---

## 6. 점수의 두 책임 — 출력 vs 비교

**도메인 특성.** Bust가 27점인 패는 *표시는 27*이지만 *비교에서는 패배*. Blackjack은 *표시 21*이지만 *비교 우위가 일반 21보다 높다*.

**자주 빠지는 함정.** 한 `score` 필드로 두 책임 모두 처리.

```kotlin
class Hand(val cards: List<Card>) {
    val score: Int = cards.sumOf { it.value }    // 출력과 비교 동시
}
```

→ Bust 처리 시 *score를 그대로 표시*하면 27점 출력. *0으로 바꾸면* 표시도 0이 됨. 두 책임이 같은 필드에 묶여 *어느 한쪽이 다른 쪽을 망친다*.

**풀어내는 방향.** 두 책임 분리.

```kotlin
class Hand(val cards: List<Card>) {
    fun displayScore(): Int = cards.sumOf { it.value }   // 27 (총합)
    fun strength(): Int = when {                          // 비교용
        isBust() -> 0
        isBlackjack() -> 22                               // 일반 21보다 우위
        else -> displayScore()
    }
}
```

또는 *상태 객체에 위임* (인사이트 3과 결합):

```kotlin
class Bust(hand: Hand) : State {
    override fun displayScore(): Int = hand.totalValue()
    override fun strength(): Int = 0
}
class BlackJack(hand: Hand) : State {
    override fun displayScore(): Int = 21
    override fun strength(): Int = 22
}
```

**가져갈 인사이트.** 외관상 같은 데이터도 *책임이 다르면 다른 모델*이다. *데이터의 모양*이 아니라 *데이터가 답해야 할 메시지*가 모델링의 기준이다.

> *"승패를 비교할 때는 strength를 이용하고, 점수 출력을 할 때에는 손에 있는 카드 점수의 총합을 이용해 출력합니다."* — laco-dev

---

## 7. enum의 UI value 침투 — 도메인 vs 표현 분리

**도메인 특성.** 카드는 *Suit × Rank*로 정의되는 도메인 데이터다. 한글 표기·이모지·색상은 *표현*이다.

**자주 빠지는 함정.** enum에 표현 어휘 박기.

```kotlin
enum class Suit(val koreanText: String) {
    HEART("하트"), SPADE("스페이드"), DIAMOND("다이아"), CLUB("클로버")
}
enum class Rank(val value: Int, val displayName: String) {
    ACE(1, "A"), KING(10, "K"), QUEEN(10, "Q"), ...
}
```

→ 한글 변경, 영어 변경, 이모지 표기 변경이 *enum 자체 수정*이 된다. 도메인이 *표현 기술의 변경*에 결합된다.

**풀어내는 방향.** enum은 *영구한 도메인 데이터*만. 표현은 OutputView가 매핑.

```kotlin
enum class Suit { HEART, SPADE, DIAMOND, CLUB }
enum class Rank(val value: Int) { ACE(1), TWO(2), ..., KING(10) }

// OutputView
private val suitText = mapOf(
    Suit.HEART to "하트",
    Suit.SPADE to "스페이드",
    ...
)
fun renderCard(card: Card): String = "${rankText[card.rank]} ${suitText[card.suit]}"
```

**연관 함정**: `enum.displayName` 외에도 *Result.description = "이득"*, *GameState.message = "버스트"* 같이 *도메인 enum이 출력 문자열을 보유*하는 패턴 다수. 모두 같은 원리.

**가져갈 인사이트.** enum은 *책임 흡인기*가 되기 쉽다. *디자이너 변경 = 도메인 수정*이 되면 결합도 위반의 가장 명확한 형태. 의존 방향은 *항상* Domain ← View(반대 X).

> *"Rank에 대한 출력 값은 UI의 관심사입니다. 도메인 모델에서 UI 로직을 제거하고."* — laco-dev

---

## 8. Hand·Deck — 일급 컬렉션과 캡슐화

**도메인 특성.** Hand는 *카드 컬렉션 + 행동(점수·블랙잭 판정)*. Deck은 *카드 컬렉션 + 행동(뽑기·재초기화)*.

**자주 빠지는 함정 1.** Hand의 외부 가변 참조 누수.

```kotlin
class Hand(val cards: MutableList<Card>)

// 외부에서
hand.cards.add(card)        // 직접 mutation
hand.cards.clear()          // 임의 변경
```

→ 일급 컬렉션의 의미가 사라진다. Hand가 *행동을 가진 컬렉션*이 아니라 *MutableList의 별명*이 됨.

**자주 빠지는 함정 2.** Deck Singleton.

```kotlin
object Deck {
    private val cards = mutableListOf<Card>(/* 52장 초기화 */)
    fun draw(): Card = cards.removeAt(0)
}
```

→ *테스트 격리 불가*: 다음 테스트가 *이전 테스트의 잔여 카드*를 뽑음. *2판 이상 불가*: 재초기화 강제. *전략 주입 불가*: 셔플/순서 고정/스텁 카드 등 테스트용 변형 막힘.

**풀어내는 방향.**

```kotlin
class Hand(initial: List<Card>) {
    private val _cards = initial.toMutableList()
    val cards: List<Card> get() = _cards.toList()       // 외부는 불변
    fun add(card: Card) { _cards += card }              // 변경은 메시지로
    fun score(): Score = ...
    fun isBlackjack(): Boolean = ...
}

interface DeckFillStrategy {
    fun fill(): ArrayDeque<Card>
}
class StandardDeck52 : DeckFillStrategy { ... }
class ShuffledDeck52(seed: Long) : DeckFillStrategy { ... }
class FixedOrderDeck(cards: List<Card>) : DeckFillStrategy { ... }   // 테스트용

class Deck(strategy: DeckFillStrategy) {
    private val cards: ArrayDeque<Card> = strategy.fill()
    fun draw(): Card = cards.removeFirst()
    fun isEmpty(): Boolean = cards.isEmpty()
}
```

**카드 소진 처리 트레이드오프** (53장째):

- (A) 예외 throw — 단순 / 카지노 룰과 어긋남
- (B) 재초기화 — 카지노 6덱 메타포 부합 / 카드 카운팅 방지 의도와 맞음
- (C) Controller가 graceful shutdown — 도메인 단순 / Controller 책임 증가

**가져갈 인사이트.**

- 일급 컬렉션은 *내부 가변 + 외부 불변* + *변경은 메시지로*가 최소 요건이다.
- 전역 상태(`object`)는 *테스터빌리티*로 즉시 망가진다. 의존성 주입의 가치를 *체감*하게 된다.

> *"덱을 다시 채워야 할 수도 있고, 한 게임은 여러 벌의 카드로 진행을 하는 요구사항이 생길 수도 있어요. 정말 53번 뽑으면 오류가 발생해야 할까요?"* — malibinYun

---

## 9. 도메인 룰 정확성 = 모델 정확성

**도메인 특성.** 블랙잭에는 *세부 룰*이 많다. 룰을 정확히 잡지 않으면 *모델 자체가 부정확해진다*.

**자주 빠지는 함정** (룰 좁게 해석):

| 잘못된 해석 | 정확한 룰 |
|---|---|
| 21점 = 블랙잭 | Ace+10 *두 장*만이 진짜 블랙잭. 3장으로 만든 21은 일반 21. |
| 딜러 16 이하 hit | 정확히 ≤16 hit, ≥17 stay. `<` vs `≤` 혼동 빈발. |
| 양쪽 Bust면 무승부 | 양쪽 모두 Bust면 *플레이어 패배* (딜러 우선). |
| 21점이면 무조건 1.5배 | 블랙잭(=2장 21)만 1.5배. 3장 21은 1배. |

**풀어내는 방향.** 룰을 *테스트로 먼저* 표현(test-as-spec).

```kotlin
@Test fun `Ace와 10이 두 장인 경우만 블랙잭`() {
    assertThat(Hand(listOf(ACE, KING)).isBlackjack()).isTrue()
    assertThat(Hand(listOf(ACE, FIVE, FIVE)).isBlackjack()).isFalse()  // 3장 21
}

@Test fun `양쪽 모두 Bust일 때 플레이어 패배`() {
    val dealer = Bust(Hand(...))
    val player = Bust(Hand(...))
    assertThat(player.match(dealer)).isEqualTo(Result.LOSE)
}

@Test fun `딜러는 16 이하면 hit한다`() {
    assertThat(Hand(scoreOf = 16).canDraw()).isTrue()
    assertThat(Hand(scoreOf = 17).canDraw()).isFalse()
}
```

→ 테스트가 통과하는 *코드*보다, 테스트가 *명세*하는 *룰*이 우선이다.

**가져갈 인사이트.** *모델은 룰의 정확한 반영*이어야 한다. 룰을 잘못 잡으면 *코드가 아무리 깔끔해도 답이 틀린다*. 테스트는 *동작 검증*이기 전에 *룰의 명세*다.

> *"테스트 케이스를 하나의 프로그램 명세서라고도 할 수 있어요."* — namjackson

---

## 10. 현실 메타포 vs 객체 메타포

**도메인 특성.** 블랙잭에는 *현실에 있는 등장인물*이 많다 — 딜러, 플레이어, 카드, 덱, 베팅. 학생은 자연스레 *현실의 모든 것에 객체를 부여*하기 시작한다.

**자주 빠지는 함정.** 가상 객체.

```kotlin
class CardPicker { fun pick(deck: Deck): Card = deck.draw() }     // Deck.draw()의 래퍼
class GameManager { fun manage(...) { ... } }                     // Controller의 다른 이름
class BlackJackRule { ... }                                       // 룰 god-object
class BettingCalculator { ... }                                   // 베팅 산술 외부
class CardDistributor { ... }                                     // Dealer의 진행자 책임 외부화
```

→ *행동이 없는 명사*에 객체를 부여하면 god-object의 시작. *현실에 이름이 있다*는 이유만으로는 객체가 되지 않는다.

**판정 기준.**

1. **이 객체에 *자기 행동*이 있는가?** 없으면 *다른 도메인 객체가 그 책임을 이미 가져야 한다*.
2. **현실에서 *없어도* 게임이 진행되는가?** Picker/Manager는 없어도 진행됨 → 가상.
3. **사람이라면 *한 명 더 필요한가*?** 같은 사람이 할 수 있다면 별도 객체로 분리 X.

→ `CardPicker.pick(deck)`은 *Deck이 draw 책임을 가지면 되는* 가상 객체. `BlackJackRule`은 *룰이 각 객체에 응집*되어야지 god-object로 모으면 안 됨.

**가져갈 인사이트.** 메타포는 *생각의 출발점*이지 *모델의 정답*이 아니다. 객체지향 세계의 객체는 *현실에 있는 것*이 아니라 *책임을 가진 것*이다.

> *"현실세계라면 블랙잭 게임에서의 규칙이지만, 객체지향 세계에서 객체는 모두 스스로 일을 합니다."* — laco-dev

---

# 단계별 학습 진화 — 도메인이 어떻게 학습을 진화시키는가

블랙잭 미션은 1·2단계로 나뉜다. 단계가 *추가 요구사항*만 가져오는 것이 아니라, *1단계 설계의 한계를 2단계가 폭로*하는 학습 장치로 짜여 있다.

## 1단계 — 기본 도메인 모델링

**추가되는 요구사항.** 카드, 딜러, 플레이어, Hit/Stay, 점수 계산, Bust/BlackJack 판정.

**핵심 학습 영역.**

- 책임-역할-협력 (Dealer · Player · Hand · Card · Deck)
- 메시지 (`participant.match(other)`)
- 일급 컬렉션 (Hand · Deck)
- enum 캡슐화 (Suit · Rank)
- Tell-Don't-Ask 첫 노출
- 도메인 vs 표현 분리 (Suit의 한글 표기)

**도달 지점.** *분기 N×M이 폭증하기 시작하지만 sealed interface까지는 아직 안 가도 됨*. 다형성의 필요를 *체감만* 하고 1단계가 끝난다.

## 2단계 — 추가 요구사항이 1단계 설계의 한계를 드러냄

**추가되는 요구사항.** 베팅금, 수익률, 블랙잭 1.5배, 다중 플레이어 결과 집계.

**1단계가 무엇을 못 잡았는지 드러난다.**

| 1단계 설계 | 2단계에서 드러나는 한계 |
|---|---|
| Score가 *출력 + 비교* 한 필드로 처리 | strength 분리 필요 (인사이트 6) |
| Dealer god-object | 베팅 없는 Dealer / 베팅 있는 Player *비대칭*이 드러남 → 추상화 한계 (인사이트 2) |
| `when` 분기로 상태 처리 | 블랙잭 1.5배 분기 추가 시 분기 폭증 체감 → State 패턴 (인사이트 3) |
| `Money = Int` | 베팅 invariant + 수익 부호 모순 → Profit 분리 (인사이트 5) |
| `Judge.judge` 정적 비교 | 다중 플레이어 집계 시 *대칭 비교*의 어색함 강화 (인사이트 1) |

**도달 지점.** *학생이 1단계 코드를 보고 처음부터 다시 구현하고 싶어한다*. 이게 학습 장치다 — 실패가 아니다.

**가져갈 인사이트.** *추가 요구사항이 기존 설계를 깨는 경험*은 OOP 학습의 핵심이다. 1단계에서 깨지지 않는 설계를 짜는 것이 목표가 아니라, *2단계의 변경에 어떻게 응답하는가*가 학습 대상이다.

---

# 설계 인사이트 — 도메인 너머

## M1. 단일 답 거부 — 거의 모든 결정에 3-4안 + 트레이드오프

블랙잭 설계에서 *단일 답이 있는 결정*은 거의 없다:

- Ace 표현 (4안)
- 승부 판정 위치 (4안)
- State 표현 (4안)
- Deck 자료구조 (4안)
- 베팅 invariant (단일 vs 분리)
- 1.5배 분기 처리 (별도 멤버 vs `Win + isBlackjack` 분기 vs 계수 매핑)
- Card 캐싱 (생성자 vs `companion.invoke` 팩토리)
- 카드 소진 처리 (예외 vs 재초기화 vs Controller)

→ OOP는 *원칙의 적용이지 원칙의 복종이 아니다*. 같은 원칙도 *맥락에 따라 다른 답*.

## M2. *그저 좋다고* 도입하는 패턴의 함정

학생이 가장 자주 만나는 자가 자각:

- *팩토리메서드가 그저 좋다라는 것만 생각하고 일단 생성한 다음 의미를 부여*
- *Manager 폭증* — `GameManager`, `BlackJackManager`, `ResultManager`, `DrawManager`
- *Builder 패턴 불필요* — 필수 속성 ≥ 선택 속성인 도메인에 Builder
- *일급 컬렉션 과적용* — 행동 없이 단지 `List`를 감싸는 wrapper

→ 패턴은 *해결할 문제*가 있을 때 답이다. *문제 없이* 도입하면 부채. *수업에서 배운 패턴*을 *어딘가 적용하고 싶은 욕구*가 가장 흔한 동기인데, 이게 거의 항상 잘못된 시작점.

## M3. 테스터빌리티 = 설계 품질의 가장 객관적 지표

- Singleton Deck → 테스트 격리 불가
- `lateinit var callback` → 호출 순서 강요
- 외부 mutation State → 전이 룰 우회
- 정적 비교자 → 양측 양가 결정 불가
- 입력 검증 재귀 호출 → 영원 종료 안 됨

모두 *테스트 어려움*으로 즉시 발현된다. *테스트가 어려운가*는 설계가 잘되었는지의 가장 객관적 측정이다 — 가독성/응집도 같은 *주관적 지표*보다 우선해서 본다.

## M4. 어색함은 객체 분리 신호

- *`getXX` / `setXX` 명명이 어색*하면 → 분리해야 할 객체 신호
- *역할-책임 매핑이 어색*하면 → 책임이 잘못된 곳에 있음
- *분기 깊이가 깊어지면* → 다형성 후보
- *생성자가 데이터만 받는데 어색*하면 → invariant가 잘못 잡힘
- *함수 이름이 자꾸 길어지면* → 책임이 *함수가 아니라 객체 단위*여야 한다는 신호

> *"적절한 네이밍을 생각하지 못해서 두었습니다. 알아차리지 못한 객체로 분리하라는 신호였던 것 같습니다."* — 학생 자가 자각

---

# 학습자에게 — 블랙잭 미션을 어떻게 통과하면 좋은가

1. **1단계는 *책임-역할-협력*만 잘 잡아라.** 패턴·추상화는 *문제가 보이면* 도입한다. *그저 좋다*고 도입하지 말기.
2. **승부 판정은 무조건 메시지로.** `Judge.judge` 같은 외부 비교자는 거의 항상 잘못된 첫 답이다.
3. **enum에 표현 어휘 박지 마라.** Domain ← View는 절대 원칙.
4. **`object Deck`은 즉시 의심하라.** 테스트가 망가지면 잘못된 설계.
5. **2단계 시작 시 1단계 코드를 *비판적*으로 읽어라.** 1단계 설계가 2단계에서 깨지는 것은 *학습 장치*이지 *실패*가 아니다.
6. **결정마다 3-4안을 적어봐라.** 한 안만 떠오르면 *생각을 덜 한 것*이다.
7. **테스트가 어려우면 설계를 의심하라.** 거의 항상 설계의 문제.
8. **현실에 있는 것을 객체로 만들고 싶을 때 멈춰라.** *책임이 있는가*를 먼저 물어라.
9. **분기가 폭증하면 다형성 후보**다. `when (state)` `is X` 가 늘기 시작하면 sealed interface를 고려하라.
10. **값이 두 invariant를 가지면 두 객체**다. BettingMoney(양수) / Profit(부호 있음).

---

# 부록 A: MCP `oh-my-oop` 도구 매핑 — 이 인사이트가 어떻게 잡히는가

본 인사이트들은 MCP `oh-my-oop` 의 일부 룰/heuristic/prompt 로 *부분 자동화*되어 있다. **MCP 의 룰 시그니처/이름/판정 로직 자체는 도메인 무관**(`MCP_STRUCTURE.md` §2-5)이며, 블랙잭 인용은 evidence/remedy/guideline 에만 등장한다.

## 10대 인사이트 매핑

| # | 인사이트 | MCP 도구/룰/prompt |
|---|---|---|
| 1 | 승부 판정 = Tell-Don't-Ask | `dual_subject_comparison` heuristic (4안) + `feature-envy` 룰 (인용 보강) + `/tell-dont-ask-rephrase` prompt |
| 2 | Dealer 이중성 = 역할 vs 책임 | `god-object` 룰 (인용 보강) + `/imagine-without-controller` prompt |
| 3 | State sealed = 분기 흡수 | `/state-machine-introspect` prompt (자동 감지 X — 분기 폭증 경험 후 학생 자가 도달) |
| 4 | Ace 1↔11 양가성 | `value_object_shape` tradeoff (기존, 4안: value class / data class / class+init / primitive) |
| 5 | BettingMoney → Profit 분리 | `primitive-wrapper-without-invariant` 룰 (인용 보강) + `value_object_shape` tradeoff |
| 6 | 점수의 두 책임 (출력 vs 비교) | `dual-purpose-knowing` 룰 (신규) |
| 7 | enum UI value 침투 | `dependency-direction` 룰 (인용 보강) + `mixed-stereotype` 룰 |
| 8 | Hand·Deck 캡슐화 | `singleton-stateful-holder` 룰 (신규) + `empty-object-external-fill` (기존) + `collection-wrapper-without-behavior` (기존) |
| 9 | 도메인 룰 정확성 = 모델 정확성 | MCP 가 직접 잡지 않음 (도메인 종속, §2-5 원칙) — *학생/팀 도메인 명세 책임 영역* |
| 10 | 현실 vs 객체 메타포 | `vague-class-name` 룰 (사전 확장 +14 어휘) + `/imagine-without-controller` prompt + *대안 0번 슬롯* |

## 설계 인사이트 매핑

| 메타 | MCP 장치 |
|---|---|
| M1. 단일 답 거부 | 모든 `propose_alternatives` 가 *N안 + pros/cons + cho_younghos_lens* 강제 (`assertHasMultipleRemedies` 계약) + *대안 0번 슬롯* (`tradeoff/engine.ts::nullOptionFor`) |
| M2. *그저 좋다* 도입 함정 | *대안 0번 슬롯* (모든 alternatives 호출에 "이 객체를 만들지 않는다" 카드 자동) + `/imagine-without-controller` + `/state-machine-introspect` (State 패턴 2 기준 강제) |
| M3. 테스터빌리티 = 객관 지표 | `singleton-stateful-holder` + `non-newable` + `mocking-pressure` + `side-effect-in-holder` + 모든 tradeoff 의 `cho_younghos_lens.testability` 평가 |
| M4. 어색함은 객체 분리 신호 | MCP 가 직접 감지 못함 — 정량 어려움. 룰 evidence/guideline 의 *학생 자가 자각 어휘* 인용으로 학습 유도 |

## 매핑되지 않은 인사이트 (의도적)

- **인사이트 9 (도메인 룰 정확성)** — *블랙잭 룰 명세 / 로또 보너스 / 자동차 이동 규칙* 같은 도메인 종속은 §2-5 원칙으로 MCP 가 잡지 않는다. *학생/팀의 도메인 명세 책임 영역*.
- **메타 M4 (어색함 신호)** — 정량 감지 어려움. 코퍼스 학습 어휘로만 유도.

## 학습자 사용 흐름 (블랙잭 예시)

1. `oop_init` → `.oop/` 워크스페이스 생성
2. `oop_use_case_add` 로 1단계 유스케이스 등록
3. `oop_propose_responsibilities` → N안 책임 분할 (대안 0번 *"분리하지 않음"* 자동 포함)
4. `oop_class_upsert` 로 CRC 카드 작성
5. `oop_collaboration_define` → `dual_subject_comparison` 4안으로 승부 판정 협력 결정
6. `oop_design_validate` → `dual-purpose-knowing`/`singleton-stateful-holder`/`vague-class-name`/`feature-envy` 등으로 어색 지점 자가 점검
7. `/state-machine-introspect` 또는 `/tell-dont-ask-rephrase` 로 *어색함 발견 시* 추가 사고
8. 2단계 진입 시 `/phase-pressure-test` 로 *1단계 설계의 한계 자가 진단*
9. `oop_design_compare` 로 Before/After 점검

핵심: *MCP 는 답을 주는 도구가 아니라 N안과 트레이드오프를 제시하고 학생 자가 결정을 강제하는 도구* 다.

---

# 부록 B: 코퍼스 범위와 출처

근거 자료는 우아한테크코스 Kotlin Blackjack 미션의 PR 분석 문서다. 각 PR 문서에는 코드 사례, 원문 인용, 설계 피드백과 교훈이 정리되어 있다. 본 문서의 인사이트는 여러 PR에서 반복된 설계 문제를 종합했다.
