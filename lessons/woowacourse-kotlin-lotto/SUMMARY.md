# 우아한테크코스 kotlin-lotto PR 리뷰 분석 — 총정리

141개의 closed PR (라인 코멘트 ≥ 5개), 71명의 reviewee를 분석해 도출한 OOP 설계 교훈 모음.

> **분석 범위:** 책임/응집/결합/캡슐화/Tell-Don't-Ask/테스터빌리티/도메인 모델링/일급 컬렉션/원시 강박/의존 방향/명명 설계.
> **제외:** Kotlin 관용구 (scope function, smart cast, null 처리 idiom, `val/var`, data class *문법* 자체).
> **추가:** 안티패턴 발견 시 실제 `diff_hunk` 코드 스니펫 인용 — 읽을 때 즉시 파악 가능.

---

## 자주 하는 설계 실수 TOP 10 (lotto 도메인 특화)

### 1. **`LottoNumber` 도메인 누락** — 모든 lotto 미션의 마스터 키 누락

**증상:** `Lotto`가 `List<Int>` 또는 `Set<Int>`를 그대로 보유. 1-45 범위 검증을 Lotto가 직접.

**예시 PR:** [#15](hyunji1203/15-1단계-로또.md), [#19](krrong/19-1단계-로또.md), [#62](ii2001/62-1단계-로또.md), [#120](junseo511/120-1단계-로또.md), [#126](oungsi2000/126-1단계-로또.md), [#117](parkjiminnnn/117-1단계-로또.md), [#114](tobae-time/114-1단계-로또.md)

**해법 패턴:**
- `value class LottoNumber(val value: Int) { init { require(value in 1..45) } }`
- flyweight 캐싱 (1-45 범위 고정 → 45개만 존재)
- Lotto는 *LottoNumber 개수와 중복*만 보장

**리뷰어 인용:**
> 로또에서 사용하는 숫자는 결국 Int 타입이라고 볼 수 있겠습니다. 그렇다면 외부에서 가져온 이 숫자들이 로또 번호라는 것을 어떻게 알 수 있을까요? — @laco-dev ([PR #19](krrong/19-1단계-로또.md))

### 2. **`Rank` enum + `matchBonus` 필드 위치 의문**

**증상:** 5개 일치가 2등(보너스 일치) vs 3등(미일치) 둘 다 가능 → matchBonus를 어디서 어떻게 표현?

**예시 PR:** [#15](hyunji1203/15-1단계-로또.md), [#19](krrong/19-1단계-로또.md), [#65](songpink/65-1단계-로또.md), [#120](junseo511/120-1단계-로또.md), [#111](donghyun81/111-1단계-로또.md), [#110](moondev03/110-1단계-로또.md)

**3가지 답안 + 트레이드오프:**
1. **Rank가 matchBonus 필드** — enum이 모든 정보 보유, 외부 분기 사라짐
2. **`Rank.SECOND`만 특수 처리** — 일반화 어색 (`matchBonus = true`만 단독)
3. **`matchBonus`는 *판별 입력*** — `Rank.of(matchCount, matchBonus)`로 검색, 필드는 없음

**리뷰어 핵심:** `Rank.values()[matchCount]` 같은 순서 의존 silent bug 회피 ([#106](giovannijunseokim/106-1단계-로또.md)).

### 3. **`Statistics`/`Analyzer`/`Calculator` god-object** (Tell-Don't-Ask 위반)

**증상:** Lottos + WinningLotto의 정보를 꺼내 외부 객체가 통계 + 등수 + 수익률 계산.

**예시 PR:** [#19](krrong/19-1단계-로또.md), [#59](jaeyeongjo/59-1단계-로또.md), [#26](briandr97/26-1단계-로또.md), [#18](s9hn/18-1단계-로또.md), [#125](devfeijoa/125-1단계-로또.md), [#2](DYGames/2-1단계-로또.md), [#111](donghyun81/111-1단계-로또.md)

**해법 패턴 (Tell-Don't-Ask):**
```kotlin
// 안 됨
class LottoStatistics(...) {
    fun calculate(): Map<Rank, Int> {
        val winningNumbers = winningLotto.getNumbers()  // ⚠ 꺼내기
        return lottos.map { ... compare ... }            // ⚠ 외부 비교
    }
}

// 됨
val rank: Rank = winningLotto.match(lotto)
val results: Map<Rank, Int> = winningLotto.matchAll(lottos)
```

**리뷰어 인용:**
> 몇개가 일치하는지 요청해서 결과를 받아오도록 해보세요. 객체지향 프로그래밍에서는 이 개념을 메시지를 보낸다 라고 표현합니다. — @laco-dev ([PR #19](krrong/19-1단계-로또.md))

### 4. **enum/도메인에 UI 표현 문자열 침투**

**증상:** `Rank` enum에 `description = "6개 일치"`, `LottoPrize.message`, `GainLoss.description = "이득"` 같은 UI 표현이 도메인 데이터에 박힘.

**예시 PR:** [#15](hyunji1203/15-1단계-로또.md), [#16](ippnsj/16-1단계-로또.md), [#85](kkosang/85-2단계-로또.md), [#135](Leeyerin0210/135-2단계-로또.md), [#130](medAndro/130-2단계-로또.md), [#62](ii2001/62-1단계-로또.md), [#14](Choisehyeon/14-1단계-로또.md), [#24](chws0508/24-1단계-로또.md)

**해법:** enum은 *영구한 도메인 데이터*만 (matchCount, winningMoney). 표현은 OutputView.

**리뷰어 인용:**
> Rank에 대한 출력 값은 UI의 관심사입니다. 도메인 모델에서 UI 로직을 제거하고. — @laco-dev ([PR #15](hyunji1203/15-1단계-로또.md))

### 5. **Controller god-controller** (racingcar에서도 반복)

**증상:** `LottoController`가 input + parsing + validation + 로또 생성 + 비교 + 출력까지.

**예시 PR:** [#85](kkosang/85-2단계-로또.md), [#15](hyunji1203/15-1단계-로또.md), [#106](giovannijunseokim/106-1단계-로또.md), [#41](krrong/41-2단계-로또.md), [#131](junseo511/131-2단계-로또.md), [#27](2chang5/1단계-로또.md), [#137](giovannijunseokim/137-2단계-로또.md)

**해법:** Controller = view-domain 연결만. 도메인 로직은 도메인.

**리뷰어 인용:**
> 2단계 요구사항을 모두 컨트롤러에서 반영한 느낌이에요. 마치 자동차 경주와 1단계에서 배운 내용을 다 잊어버린 것처럼 보여요. — @krrong ([PR #131](junseo511/131-2단계-로또.md))

### 6. **`Money`/`PurchaseAmount`/`Profit` 원시값 미포장 또는 wrapping만**

**증상:** Money를 Int로 그대로, 또는 wrapping했지만 `.value` 노출 후 Controller가 `Money.value / 1000` 같이 계산.

**예시 PR:** [#15](hyunji1203/15-1단계-로또.md), [#41](krrong/41-2단계-로또.md), [#72](Yunseok-Nam/72-1단계-로또.md), [#102](aprilgom/102-2단계-로또.md), [#136](gahyunkim/136-2단계-로또.md), [#10](sujin9/10-1단계-로또.md), [#66](s6m1n/66-1단계-로또.md)

**해법:**
- `class Money(val value: Int) { fun numberOfLottos(): Int = value / LOTTO_PRICE }`
- 또는 `class Money(val value: Int) : Comparable<Money>` + operator overloading
- value class로 인라인 + 동치성

### 7. **수동/자동 로또 분리 vs 통합** (2단계 핵심 결정)

**증상:** 2단계 수동 로또 추가 시 `ManualLottoGenerator` + `RandomLottoGenerator`를 별도 처리 + Controller에서 분기.

**예시 PR:** [#85](kkosang/85-2단계-로또.md), [#99](songpink/99-2단계-로또.md), [#34](DYGames/34-2단계-로또.md), [#147](cucumber99/147-2단계-로또.md), [#92](Hevton/92-2단계-로또.md), [#91](sh1mj1/91-2단계-로또.md), [#150](wondroid-world/150-2단계-로또.md), [#83](jaeyeongjo/83-2단계-로또.md), [#137](giovannijunseokim/137-2단계-로또.md)

**해법 패턴:**
```kotlin
fun interface LottoGenerator { fun generate(): Lotto }
class RandomLottoGenerator(...) : LottoGenerator { ... }
class ManualLottoGenerator(val numbers: List<Int>) : LottoGenerator { ... }

class LottoMachine {
    fun purchase(generators: List<LottoGenerator>): Lottos = ...
}
```

→ Strategy 패턴 + 통합 인터페이스.

### 8. **`Constants.kt` / `LottoConstants` / `Constant` god-folder**

**증상:** 모든 상수를 한 파일에 모음.

**예시 PR:** [#85](kkosang/85-2단계-로또.md), [#83](yujamint/...)... wait, racingcar의 예시군. Let me adjust.

lotto PR: [#85](kkosang/85-2단계-로또.md), [#118](wondroid-world/118-1단계-로또.md), [#74](kimhm0728/74-1단계-로또.md), [#111](donghyun81/111-1단계-로또.md), [#78](gaeun5744/78-1단계-로또.md), [#62](ii2001/62-1단계-로또.md), [#27](2chang5/27-1단계-로또.md), [#121](HamBeomJoon/121-1단계-로또.md), [#9](whk06061/9-1단계-로또.md)

**해법:** 도메인 객체가 자기 상수 소유 (`LottoNumber.MIN`, `Lotto.SIZE`, `Money.LOTTO_PRICE`).

### 9. **테스트만을 위해 public**

**예시 PR:** [#19](krrong/19-1단계-로또.md), [#113](hwannow/113-1단계-로또.md), [#116](cucumber99/116-1단계-로또.md), [#41](whk06061/41-2단계-로또.md) (racingcar에서도 동일).

**해법:** 도메인 재설계. internal 가시성. 또는 *통합 테스트*로 외부 행위 검증.

### 10. **자동/수동 패턴 불일치 + 통합 추상화 부재** (2단계)

**증상:** 자동은 인터페이스 통한 호출, 수동은 Controller가 직접 처리 또는 다른 시그니처.

**예시 PR:** [#83](jaeyeongjo/83-2단계-로또.md), [#149](oungsi2000/149-2단계-로또.md), [#34](DYGames/34-2단계-로또.md), [#92](Hevton/92-2단계-로또.md)

**해법:** 같은 *발급 협력 인터페이스* → 다른 구현체.

---

## 리뷰어들이 반복적으로 하는 말 (lotto 특화)

### 🎯 "객체에게 메시지를 던져라" (Tell Don't Ask)

> 몇개가 일치하는지 요청해서 결과를 받아오도록 해보세요. 객체지향 프로그래밍에서는 이 개념을 메시지를 보낸다 라고 표현합니다. — @laco-dev

**출현 PR:** [#19](krrong/19-1단계-로또.md), [#26](briandr97/26-1단계-로또.md), [#18](s9hn/18-1단계-로또.md), [#107](gahyunkim/107-1단계-로또.md), [#137](giovannijunseokim/137-2단계-로또.md), [#128](jiyuneel/128-1단계-로또.md), [#144](jiyuneel/144-2단계-로또.md), [#95](haeum808/95-2단계-로또.md), [#52](2chang5/52-2단계-로또.md)

### 🎯 "View → Domain 의존은 OK"

> domain 레이어는 view를 알면 안되지만, view에서는 domain을 알기 때문에 저는 InputView에서 바로 domain 모델을 만드는 방법을 선호하는 편입니다. — @laco-dev ([PR #27](2chang5/27-1단계-로또.md))

→ Controller가 String parsing 안 하고 도메인 객체 받기. View가 변환 책임.

### 🎯 "1000원 1장 = 가격은 누구의 책임?"

> 로또 한장의 가격이 1,000원이라는 것을 이 곳에서 결정하는게 적절할까? — @laco-dev ([PR #124](chanho0908/124-1단계-로또.md))

→ Lotto/Money 책임 토론. 미래 다중 가격 정책 시뮬레이션.

### 🎯 "LottoNumber 캐싱 (flyweight)"

> 동일한 숫자는 한 번만 만들고 재활용해 볼 수 있을까요? 1억개의 티켓을 만들더라도, 번호는 45개만 활용할 수 있도록이요. — @malibinYun ([PR #105](m6z1/105-1단계-로또.md))

**출현 PR:** [#2](DYGames/2-1단계-로또.md), [#4](re4rk/4-1단계-로또.md), [#67](haeum808/67-1단계-로또.md), [#105](m6z1/105-1단계-로또.md), [#106](giovannijunseokim/106-1단계-로또.md), [#96](JoYehyun99/96-2단계-로또.md), [#136](gahyunkim/136-2단계-로또.md)

### 🎯 "수동은 어디서 발행?"

> 수동은 어디서 발행하는 것일까요? 이 질문의 의도는 정말 어디서 발행하는지를 묻는 것이 아닌, 자동과 수동의 관계와 현재의 구조 설계에 대한 질문입니다. — @laco-dev

**출현 PR:** [#94](kimhm0728/94-2단계-로또.md), [#103](s6m1n/103-2단계-로또.md), [#99](songpink/99-2단계-로또.md), [#100](Hogu59/100-2단계-로또.md)

### 🎯 "거스름돈, 1000원 미만 입력 = UX 시나리오"

> 1500원과 같은 나머지 금액이 발생해도 별다른 안내가 이루어지지 않고 있습니다. — @KwonDae ([PR #145](tobae-time/145-2단계-로또.md))

→ 명세 외 시나리오 검증.

### 🎯 "Map<Rank, Int>도 wrapping 후보"

> Map으로 리턴되는 값들을 WinningXXX or Lottos 등으로 묶어보는 것은 어떨까 라는 생각이 듭니다 — @Gyuil-Hwnag ([PR #123](rosemin928/123-1단계-로또.md))

**출현 PR:** [#19](krrong/19-1단계-로또.md), [#16](ippnsj/16-1단계-로또.md), [#99](songpink/99-2단계-로또.md), [#123](rosemin928/123-1단계-로또.md)

→ Map은 *임시 자료구조*. 도메인 의미가 있으면 객체로.

### 🎯 "이전 미션 (racingcar) 학습 적용"

> 로또에서 랜덤 테스트를 구성하지 못한다는 의미는, 자동차 경주에서의 랜덤 테스트를 가능하게 하는 방법에 대해... — @malibinYun ([PR #149](oungsi2000/149-2단계-로또.md))

**출현 PR:** [#62](ii2001/62-1단계-로또.md), [#13](otter66/13-1단계-로또.md), [#149](oungsi2000/149-2단계-로또.md), [#127](Junyoung-WON/127-2단계-로또.md)

→ racingcar의 NumberGenerator 추상화를 lotto에 재적용.

---

## 조영호님 강의 토픽과의 매핑 (lotto)

### `god-object`

- **Controller god-controller**: [#85](kkosang/85-2단계-로또.md), [#15](hyunji1203/15-1단계-로또.md), [#106](giovannijunseokim/106-1단계-로또.md), [#41](krrong/41-2단계-로또.md)
- **`Statistics`/`Bank`/`Judgement`/`Analyzer` god-object**: [#19](krrong/19-1단계-로또.md), [#59](jaeyeongjo/59-1단계-로또.md), [#26](briandr97/26-1단계-로또.md), [#18](s9hn/18-1단계-로또.md), [#2](DYGames/2-1단계-로또.md)
- **`World` god-naming**: [#2](DYGames/2-1단계-로또.md), [#3](inseonyun/3-1단계-로또.md), [#27](2chang5/27-1단계-로또.md)

### `feature-envy`

- WinningLotto의 numbers를 외부에서 꺼내 비교: 거의 모든 1단계 PR
- `getNumbers()`/`getValue()` 노출 후 외부 로직: [#46](Choisehyeon/46-...)... actually racingcar. Lotto는 [#18](s9hn/18-1단계-로또.md), [#19](krrong/19-1단계-로또.md), [#26](briandr97/26-1단계-로또.md), [#62](ii2001/62-1단계-로또.md)

### `non-newable` / Random 의존 분리

- Controller/LottoMachine이 Random 직접 호출: [#85](kkosang/85-2단계-로또.md), [#99](songpink/99-2단계-로또.md), [#62](ii2001/62-1단계-로또.md), [#105](m6z1/105-1단계-로또.md), [#108](yrsel/108-1단계-로또.md), [#117](jinuemong/117-2단계-로또.md)

### `Tell-Don't-Ask`

- `winningLotto.match(lotto): Rank` 패턴: [#19](krrong/19-1단계-로또.md), [#26](briandr97/26-1단계-로또.md), [#107](gahyunkim/107-1단계-로또.md), [#137](giovannijunseokim/137-2단계-로또.md), [#52](2chang5/52-2단계-로또.md), [#144](jiyuneel/144-2단계-로또.md)

### `책임-역할-협력` (조영호 "객체지향의 사실과 오해" 3요소)

- 체스 비유: 유저 → 체스판 → 말 (lotto: 구매자 → LottoMachine → Lotto) — [#125](Hogu59/125-2단계-로또.md) (racingcar에서도 동일)
- 현실 모델링 — 로또 기계는 돈을 받고 로또를 *준다*, 소유 X: [#135](Leeyerin0210/135-2단계-로또.md), [#113](hwannow/113-1단계-로또.md)

### `의존 방향`

- Validator가 OutputView 의존: lotto에도 동일
- 인터페이스는 domain, 구현체는 data/infra: 모든 2단계 PR의 진화 방향

### `일급 컬렉션`

- `Lottos` 일급 컬렉션 표준: [#46](Choisehyeon/...)... 다시 racingcar. Lotto에는 [#16](ippnsj/16-1단계-로또.md), [#80](dpcks0509/80-1단계-로또.md), [#109](Leeyerin0210/109-1단계-로또.md), [#122](ijh1298/122-1단계-로또.md)
- delegation으로 일급 컬렉션 만든 후 *불필요 메서드 노출*: [#4](re4rk/4-1단계-로또.md), [#47](Choisehyeon/47-2단계-로또.md), [#8](ki960213/8-1단계-로또.md)

### `원시 강박 (Primitive Obsession)`

- **`Int` 로또 번호 → `LottoNumber`** — 거의 모든 1단계 PR
- **`Int` 금액 → `Money/PurchaseAmount`** — 다수 PR
- **`Double` 수익률 → `ProfitRate`** — [#15](hyunji1203/15-1단계-로또.md), [#16](ippnsj/16-1단계-로또.md), [#68](Hogu59/68-1단계-로또.md), [#123](rosemin928/123-1단계-로또.md)

### `명명 설계`

- **모호한 이름 god-naming**: `Bank`, `World`, `Veilfier`(오타), `Validator`, `Constant`, `Helper`, `Calculator`, `Analyzer` 등 lotto 전반
- **함수명 = 도메인 어휘**: `compare()` → `match()`, `yield()` → `profitRate()`
- **`Evaluator.evaluate()` 동어반복** — [#75](sh1mj1/75-1단계-로또.md), [#8](ki960213/8-1단계-로또.md)

---

## 단계별 학습 곡선 (lotto)

### 1단계 흔한 실수

- `Constants.kt` 한 파일에 모든 상수
- `Validator`/`Util`/`Helper` 모호한 이름
- Controller가 split + validation + 비교 직접
- `Lotto`가 `List<Int>` 그대로 노출
- `Rank` enum에 UI 표현 (`description`)
- 검증을 어디서 할지 결정 못함
- `Statistics`/`Analyzer` god-object로 모든 비교 수행
- Random 직접 의존 → 테스트 불가
- `Money.ZERO`가 Int 반환 (값 객체 의미 잃음)
- 테스트 함수명이 "정상 동작한다" 류

### 2단계에서 부각되는 이슈

- **수동/자동 로또 통합** — Strategy 인터페이스 + 두 구현체
- **`Map<Rank, Int>` wrapping** — 통계 객체로
- **`LottoNumber` 캐싱 (flyweight)** — 1억 티켓 시뮬레이션
- **1단계 피드백 *지속 검증*** — 검증 위치 재조정, 일급 컬렉션 의미
- **거스름돈/예외 흐름** — UX + 도메인 명세
- **자가 의문 PR 본문 명시** — 학생 사고의 가시화
- **이전 라운드 코멘트 링크로 변경 의도 명시** — [#129](chanho0908/129-2단계-로또.md), [#151](m6z1/151-2단계-로또.md)

### 가장 잘된 학습 곡선의 시그니처

1. 1단계 피드백을 즉시 흡수
2. 자가 검토로 다음 단계에서 재조정
3. 결정 *이유*를 PR 본문에 명시 (`이전 PR의 코멘트 링크`)
4. 더 깊은 자가 의문 던지기

가장 좋은 사례 PR:
- [#161](moondev03/...) ([racingcar 학습 곡선과 유사한 형태])
- [#115](sh1mj1/115-2단계-로또.md) — racingcar에서 칭찬받은 학생이 lotto에서도 깊은 사고

---

## racingcar vs lotto — 도메인 비교

### 공통 안티패턴 (두 미션 모두)

- god-controller
- 외부 비교자 (Statistics/Analyzer/Bank/Determiner)
- 매직넘버 + Constants god-folder
- Random 직접 의존
- 모호한 이름 (Manager/Util/Helper/Validator)
- enum에 UI 표현 누수
- 테스트만 위한 public

### lotto 특화 안티패턴

- **`LottoNumber` 도메인 누락** — racingcar의 Position과 비슷하지만 *고정 범위*로 flyweight 패턴 적용 가능
- **`Map<Rank, Int>` wrapping 회피** — 등수별 집계 자료구조 wrapping
- **수동/자동 로또 통합** (2단계) — racingcar에 없던 패턴
- **`Money`/`Profit`/`Yield` 금융 도메인** — racingcar에 없음
- **`Rank.matchBonus` 필드 위치** — 2등이 특수 케이스인 enum 설계 문제

### lotto에서 *처음으로* 학습되는 패턴

- **flyweight** (LottoNumber 캐싱)
- **operator overloading** (Money + Money)
- **sealed class** (GameState, Result)
- **value class** (LottoNumber, Money)
- **확장 시나리오 압박** ("1억 티켓이면?", "다국어 차?" 같은 시뮬레이션)

---

## 부록: 가장 강력한 리뷰어 명언 10선 (lotto)

1. *"로또에서 사용하는 숫자는 결국 Int 타입이라고 볼 수 있겠습니다. 그렇다면 외부에서 가져온 이 숫자들이 로또 번호라는 것을 어떻게 알 수 있을까요?"* — @laco-dev on [#19](krrong/19-1단계-로또.md)

2. *"몇개가 일치하는지 요청해서 결과를 받아오도록 해보세요. 객체지향 프로그래밍에서는 이 개념을 메시지를 보낸다 라고 표현합니다."* — @laco-dev on [#19](krrong/19-1단계-로또.md)

3. *"단순하게 도메인을 출력하는 것이 UI의 역할이기 때문이에요. 도메인 없이 그냥 출력만 한다면 뭘 출력할건데? 라는 생각을 할 수 있겠죠."* — @laco-dev on [#124](chanho0908/124-1단계-로또.md)

4. *"1억개의 티켓을 만들더라도, 번호는 45개만 활용할 수 있도록이요"* — @malibinYun on [#105](m6z1/105-1단계-로또.md)

5. *"로또 한장의 가격이 1,000원이라는 것을 이 곳에서 결정하는게 적절할까? A 상점에서는 1,000원 B 상점에서는 2,000원에 팔아야 한다면...?"* — @laco-dev on [#124](chanho0908/124-1단계-로또.md)

6. *"로또를 발급하는 기계가 수동 티켓을 미리 가지고 있어야 할까요?"* — @malibinYun on [#34](DYGames/34-2단계-로또.md)

7. *"이 객체는 단순히 값을 가지고있는 것 외에 별다른 역할을 가지고 있지 않고 있네요."* — @malibinYun on [#62](ii2001/62-1단계-로또.md)

8. *"2단계 요구사항을 모두 컨트롤러에서 반영한 느낌이에요. 마치 자동차 경주와 1단계에서 배운 내용을 다 잊어버린 것처럼 보여요."* — @krrong on [#131](junseo511/131-2단계-로또.md)

9. *"View는 멍청해야 한다. 근데 View가 어느정도까지 멍청해야 할까요?"* — @lee-ji-hoon on [#132](hwannow/132-2단계-로또.md)

10. *"단지 toString을 오버라이드 하기 위한 일급 컬렉션 사용에 대해 어떻게 생각하시나요?"* — student self-question on [#122](ijh1298/122-1단계-로또.md)

---

## 통계

- **분석된 PR:** 141개
- **분석된 reviewee:** 71명
- **고유 reviewer:** ~20명 (laco-dev, Gyuil-Hwnag, KwonDae, malibinYun, vagabond95, hyemdooly, BeokBeok, krrong, ghojeong 등)
- **단계별:** 1단계 ≈ 50 PR, 2단계 ≈ 90 PR (리팩토링 포함)
- **수치 비교:** racingcar (133 PR, 77 reviewees) → lotto (141 PR, 71 reviewees). 도메인 깊이 +.

이 코퍼스는 lotto 도메인 (금융 + 통계 + 등수)에서의 OOP 학습 곡선을 담는다. racingcar에서 배운 패턴을 lotto에서 *어떻게 재적용*하는지, *새 도메인 (Money, Rank)*에서 어떻게 *원시 강박을 탈출*하는지, *2단계 수동 로또*에서 *Strategy 패턴이 어떻게 자연스럽게 등장*하는지의 흐름이 보인다.
