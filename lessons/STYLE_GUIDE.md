# OOP 설계 스타일 가이드

`woowacourse/kotlin-racingcar` 133개 PR 리뷰에서 추출한 보편 원칙 모음. MCP의 자동 검증(`oop_design_validate`)이 잡지 못하지만 **워크숍/리뷰에서 안내할 만한** 규칙들.

자세한 사례는 [lessons/woowacourse-racingcar/SUMMARY.md](woowacourse-racingcar/SUMMARY.md) 참고.

---

## 1. 명명 원칙

### 1-1. 함수 이름 = 동사 하나만

- 안 됨: `executeInputTryNumber()`, `setRacingResult()`, `runOrStop()`
- 됨: `inputTryNumber()`, `tryMove()`, `stop()`

> "이 함수에는 동사가 2개가 존재합니다. (input, try) 함수에는 하나의 동사만 포함시켜보면 어떨까요?" — @BeokBeok ([PR #68](woowacourse-racingcar/hyemdooly/68-1단계-자동차-경주.md))

### 1-2. 이름의 *오해 비용* 최소화

- `XxxException` 접미사는 **Exception 타입**을 의미. 검증 객체에 붙이면 동료 혼란.
- `XxxValidator` / `XxxValidation` 으로.
- `Manager`, `Helper`, `Util`은 거의 항상 god-object 신호 (자동 검증 `vague-class-name` 룰로도 잡힘).

### 1-3. 상수 이름 = 의미, 값이 아님

- 안 됨: `","`, `STANDARD_NUMBER`, `MAX = 5`
- 됨: `NAME_DELIMITER`, `MOVEMENT_THRESHOLD`, `MAX_NAME_LENGTH`

> "STANDARD_NUMBER는 자동차 경주 게임에 대한 지식이 없는 사람이 보았을 때도 한 번에 알아볼 수 있는 의미를 담은 이름일까요?" — @malibinYun ([PR #145](woowacourse-racingcar/etama123/145-2단계-자동차-경주.md))

### 1-4. 메서드명에 컨텍스트 중복 금지

- 안 됨: `NumberGenerator.generateNumber()` (Generator + generateNumber → 동어반복)
- 됨: `NumberGenerator.generate()`

---

## 2. 메시지와 에러

### 2-1. 메시지 상수에 매직넘버 박지 말 것

```kotlin
// 안 됨 — 요구사항 변경 시 두 곳 수정
const val ERROR = "이름은 1~5글자여야 합니다"

// 됨 — 한 줄 수정으로 끝
const val MIN_LEN = 1
const val MAX_LEN = 5
val errorMsg = "이름은 $MIN_LEN~${MAX_LEN}글자여야 합니다"
```

> "1, 5와 같은 내용이 상수 문자열에 포함될 경우, 요구사항의 변경에 따라 항상 수정이 필요하게 됩니다." — @vagabond95

### 2-2. 에러 메시지에 *입력값*을 담아라

운영 디버깅의 거의 무료 정보. "잘못된 입력" 대신 "잘못된 입력 'foo bar baz'".

### 2-3. 에러 케이스별로 구분된 메시지

같은 공통 메시지로 통합하면 어느 경로 실패인지 모름.

---

## 3. 검증 책임의 3분류

> **이 원칙은 MCP의 `validation-misplacement` 룰로도 자동 검증된다.**

| 검증 종류 | 자리 | 예시 |
|---|---|---|
| UI 형식 검증 | Interfacer (View) | 빈 문자열, 숫자 아님, 형식 |
| 사용자 입력 정책 | Coordinator | 재입력 흐름, 종료 조건 |
| 도메인 무결성 invariant | InformationHolder / Structurer init | 이름 길이, 자동차 두 대 이상, 중복 |

`require()` / `check()`를 도메인 init에 두면 invariant 보호가 자동.

---

## 4. 의존 방향

> **MCP의 `dependency-direction` 룰로 자동 검증.**

- **Domain은 UI/Interfacer를 모른다.** Validator가 OutputView를 의존하면 의존 역전.
- Coordinator만 Interfacer 협력 허용.
- 더 엄격: 인터페이스를 Domain에서 정의, Interfacer가 구현 (DIP).

---

## 5. 책임의 3층 구조 (체스 비유)

> @KwonDae ([PR #125](woowacourse-racingcar/Hogu59/125-2단계-자동차-경주.md))

- **유저(Controller)** = 명령만 (이 말을 저기로)
- **체스판(RacingGame)** = 상태 + 명령 해석 (체스판 위에서 일어나는 모든 일)
- **말(Car)** = 자기 위치 + 자기 행위 (앞으로 한 칸)

Controller가 "이 말이 어디로 가야 할지" 판단하면 체스판의 책임이 Controller로 누수된 것.

---

## 6. 자가 점검 질문

설계 결정마다 던질 질문 (실제 리뷰어들이 던진 질문):

### 6-1. "이 클래스의 책임을 한 문장으로 적어보세요"

> "단일 책임 원칙이 어긋나 있는지 확인하는 좋은 방법 중 하나는, 이 클래스의 역할과 책임이 무엇인지 한 문장으로 적어보는 것입니다." — @ghojeong

문장이 모호하거나 길면 SRP 위반.

### 6-2. "휴가 가도 동료가 일할 수 있는 코드인가?"

함수명 + 시그니처만 보고 동료가 같은 일을 할 수 있는가 = SRP 검사법.

> "업계에 떠도는 맨날 야근하는 개발 조직 괴담이 역할과 책임이 명확하지 않은 함수, 클래스, 혹은 모듈로 인해서 생긴다고 생각해주세요." — @ghojeong

### 6-3. "이 분리가 테스트를 더 명확하게 만드는가?"

> **MCP의 `propose_alternatives`가 모든 대안에 이 질문을 첨부함.**

분리해도 테스트가 더 명확해지지 않으면 분리할 이유 없음. 분리의 정당화는 테스트 개선이 와야 한다.

### 6-4. "도메인이 N배로 늘면 이 구조가 견디는가?"

> **MCP의 `propose_alternatives`가 모든 대안에 이 질문을 첨부함.**

확장 시나리오 압박 시뮬레이션. KoreanCar/EnglishCar로 늘어도, 상수 1000개로 늘어도, 자동차 1000대로 늘어도.

### 6-5. "무슨 객체가 개선되었나?"

> "객체지향 패러다임에 들어맞느냐라는 질문에는 제가 아니라 심지님 스스로, 무슨 '객체' 가 개선되었는지 답할 수 있으면 됩니다." — @ghojeong ([PR #115](woowacourse-racingcar/sh1mj1/115-2단계-자동차-경주.md))

---

## 7. Tell-Don't-Ask 응용

### 7-1. 외부에서 getter로 묻고 비교하지 말 것

```kotlin
// 안 됨 — feature-envy
val maxPos = cars.maxOf { it.position }
cars.filter { it.position == maxPos }.map { it.name }

// 됨 — 일급 컬렉션에 메시지
cars.findWinners().map { it.name }
```

### 7-2. element가 스스로 상태 변경하면 컬렉션은 immutable

```kotlin
// 안 됨 — 매번 새 컬렉션
class Cars(val value: List<Car>) {
    fun moveAll() = Cars(value.map { it.copy(position = it.position + ...) })
}

// 됨 — element가 자기 상태 변경
class Cars(val value: List<Car>) {
    fun moveAll() = value.forEach { it.move(...) }
}
```

> @vagabond95 ([PR #92](woowacourse-racingcar/kmkim2689/92-1단계-자동차-경주.md))

### 7-3. depth 줄이기 = 함수 분리 ≠ 재귀로 indentation 감추기

> "depth 를 이야기할 때, 쉬운 설명을 위해서 indentation 을 이야기하지만, 엄밀히 이야기하면 abstraction level 을 뜻합니다." — @ghojeong

재귀로 들여쓰기만 줄이면 abstraction level은 그대로. **함수 분리**로 abstraction level을 낮춰야 SRP가 살아남.

---

## 8. 외부 비결정성 분리

> **MCP의 `non-newable` 룰로 자동 검증.**

`Random`, `Clock`, `System` 같은 외부 자원은 *도메인에 직접 의존*하지 말 것.

**패턴:**
1. `interface NumberGenerator { fun generate(): Int }` 또는 `fun interface MoveStrategy { fun isMovable(): Boolean }`
2. 도메인은 인터페이스만 의존
3. 프로덕션은 `RandomNumberGenerator` 구현체 주입
4. 테스트는 `FakeGenerator(values: List<Int>)` 같은 결정적 fake 주입

함수형 인터페이스 (Kotlin `fun interface`)는 람다로도 구현 가능해 경량.

---

## 9. 캡슐화 패턴

### 9-1. `var position; private set`

```kotlin
class Car(val name: String) {
    var position: Int = 0
        private set
    fun move() { position++ }
}
```

원시값은 이게 가장 간결. backing property는 컬렉션의 mutable/immutable 분리 시에만.

### 9-2. data class + var는 위험

`equals/hashCode`가 주생성자 프로퍼티만 보는데 var면 동치성이 깨질 수 있음. data class는 immutable VO가 본업.

### 9-3. 단일 값 wrapper = value class

```kotlin
@JvmInline value class Position(val value: Int) {
    init { require(value >= 0) }
}
```

data class보다 인라인되어 런타임 오버헤드 없음.

### 9-4. 정규화는 팩토리 함수, 주 생성자는 검증된 값만

```kotlin
class CarName private constructor(val value: String) {
    init { require(value.isNotBlank() && value.length <= 5) }
    companion object {
        fun of(raw: String) = CarName(raw.trim())
    }
}
```

주 생성자가 trim까지 하면 "객체 생성 시 입력이 어떻게 변형되는가"가 불투명.

---

## 10. 테스트

### 10-1. 테스트 함수명 = 시나리오 + 결과

- 안 됨: "정상 동작한다", "예외가 발생한다"
- 됨: `randomNumber가 4 이상이면 자동차가 움직인다`, `자동차 이름은 5자를 초과할 수 없다`

### 10-2. 테스트 setup은 우회 메서드 없이

Car의 위치를 5로 만들기 위해 `tryMove()`를 5번 호출하지 말 것. 생성자에 직접 받기.

### 10-3. 분기 들어가면 두 테스트로 쪼개라

테스트 코드에 `if/when`이 나오면 그건 두 케이스를 한 함수에 담은 것.

### 10-4. 자기가 구현 안 한 부분은 자기가 테스트 안 한다

`Random.nextInt`, `String.split` 같은 표준 라이브러리는 단위 테스트 대상이 아님.

### 10-5. 테스트가 *깨지지 않게* 보편화하는 것 vs 요구사항 바뀌면 갈아엎기

> "제 입장에서 테스트 코드란 구현해야할 요구 사항이지, 요구사항에 대한 구현체가 아니기 때문입니다." — @ghojeong

지나친 보편화 ("기준 숫자 이하")는 미래의 자기 통제권을 줄임. 요구사항 바뀌면 테스트도 바꿔라.

### 10-6. Controller는 단위 테스트 X (통합 테스트로)

> "컨트롤러는 UI나 콘솔과 같이 실행에 밀접한 관련이 있기 때문에 일반적으로 단위 테스트를 작성하지는 않습니다." — @laco-dev

도메인 테스트에 집중.

---

## 11. 객체 vs 함수

> **MCP의 `function-not-object` 룰로 자동 검증.**

- **객체 = 메서드 + 멤버 둘 다**. 멤버 없이 함수 하나만 가진 클래스는 객체 아님 → top-level fun 또는 object의 메서드로.
- **상태 없는 클래스 = object**. 인스턴스마다 다른 상태가 필요할 때만 class.

---

## 12. DI는 키워드가 아니라 역할-책임-협력

> "DI 라는 키워드에 집착하기 보다는, NumberGenerator 와 의존관계를 가질 class 가 누가 되어야 하는지, 역할과 책임 관점에서 생각을 해보시면 좋을 것 같습니다." — @ghojeong ([PR #107](woowacourse-racingcar/sh1mj1/107-1단계-자동차-경주.md))

조영호 "객체지향의 사실과 오해" 3요소 = **역할, 책임, 협력**. DI는 그 결과.

---

## 13. 커밋과 PR

- 커밋 단위 = 의미 단위. "스켈레톤 코드 작성" 같은 무의미한 커밋 회피.
- 같은 메시지의 중복 커밋 = 책임 단위 모호의 신호.
- 자가 의문/결정 이유를 PR 본문에 명시. 리뷰어가 더 깊은 토론으로 응답.
- 페어 프로그래밍의 가치 = 토론이 PR에 보임.

---

## 14. 출력 책임

- **toString이 도메인에 출력 형식 보유 X** — OutputView 책임 침범. (단, 안드로이드 UI 모델은 회색지대)
- **enum의 데이터에 UI 표현(`"-"`) 박지 말 것** — UI 변경이 도메인 변경. (MCP의 `side-effect-in-holder` 룰이 잡음)
- **출력 책임 일원화** — Service/도메인/Controller 어디든 출력 문구가 생기면 OutputView로 옮기기.

---

## 부록: 리뷰어 명언 베스트

1. *"객체지향 패러다임은 사실 별로 안 중요합니다. 불편함을 스스로 인지하고, 인지한 부분을 다시 스스로 해결하는 과정이 제일 중요합니다."* — @ghojeong
2. *"네이밍이 모호하다는 것은 곧 해당 클래스/함수의 역할이 모호하거나 모호해질 수 있다는 신호입니다."* — @vagabond95
3. *"객체에게 메시지만 던져 자동차 스스로 판단해 움직일지 말지 역할을 부여하세요."* — @KwonDae
4. *"테스트하기 쉬운가?를 기준으로 객체를 쪼개고 합칩니다."* — @ghojeong
5. *"객체는 메서드 뿐만 아니라 멤버로도 구성된다는 사실을 잊지 말아주세요."* — @ghojeong
6. *"처음에 최대한도로 세분화하라는 조언은, 보통 합쳐진것을 쪼개는 리팩토링 보다, 쪼개진 것을 합치는 리팩토링이 더 쉽기 때문입니다."* — @ghojeong
