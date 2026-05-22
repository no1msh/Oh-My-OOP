# 우아한테크코스 kotlin-racingcar PR 리뷰 OOP 교훈

[`woowacourse/kotlin-racingcar`](https://github.com/woowacourse/kotlin-racingcar) 리포의 closed PR 188개 중 라인 코멘트 ≥ 5개인 **133개 PR (77명 reviewee)**을 분석해 도출한 OOP 설계 교훈 모음.

## 📖 시작하기

- **[SUMMARY.md](SUMMARY.md)** — 전체 정리 (자주 하는 실수 TOP 10, 리뷰어 명언, 조영호 강의 토픽 매핑, 단계별 학습 곡선)
- **개별 PR 분석** — 각 reviewee 폴더 안에 `<PR번호>-<단계>-자동차-경주.md` 형태로 정리

## 🎯 분석 범위

**OOP 설계 관점만**:
책임 분배 / 응집도 / 결합도 / 캡슐화 / Tell-Don't-Ask / 테스터빌리티 / 도메인 모델링 / 일급 컬렉션 / 원시 강박 / 의존 방향 / 명명 설계

**제외**:
Kotlin 관용구 (scope function, smart cast, null 처리 idiom, val/var, data class 문법 자체, init 블록 형태, collection API 선택)

## 📂 폴더 구조

```
woowacourse-racingcar/
├── README.md (이 문서)
├── SUMMARY.md (총정리)
├── PROGRESS.md (작업 진행 로그)
└── <reviewee-name>/
    └── <PR번호>-<단계>-자동차-경주.md
```

각 PR 분석은 다음 구조:
- **잘한 점** (설계 관점)
- **못한 점** (설계 관점)
- **리뷰어 의견 요지** (대표 인용 1~3개 + 출처)
- **얻은 교훈**

## 🔥 가장 인상적인 PR

학습 곡선의 본보기로 참고할 만한 PR:

- **[sh1mj1/115](sh1mj1/115-2단계-자동차-경주.md)** — 1단계 피드백을 *자가 학습*으로 발전시킨 이상적 사례. 리뷰어 평: "박수 쳤습니다." MoveStrategy 인터페이스 도입, DI 깊이 자가 인지/해결.

- **[moondev03/161](moondev03/161-2단계-자동차-경주.md)** — 1단계 피드백을 *맹목 흡수*하지 않고 *재검토*. "InputView에 검증 옮겨라" 가이드를 따랐지만 결합도 우려로 재조정.

- **[hxeyexn/109](hxeyexn/109-1단계-자동차-경주.md)** — 리뷰어 @ghojeong의 명문장 다수. "Depth = abstraction level", "휴가 가도 동료가 일할 수 있는 코드", "최대한도로 세분화하라".

- **[Songusika/84](Songusika/84-2단계-자동차-경주.md)** — 페어 프로그래밍 + 학생 *역질문*으로 토론 깊어진 PR. data class vs record 5가지 차이 정리.

- **[injoon2019/24](injoon2019/24-2단계-자동차-경주.md)** — 3명 리뷰어 협력 리뷰. 코틀린 idiom + OOP 개념 + 테스트 DSL (kotest).

## 🎓 단계별 학습 곡선

리뷰어들이 반복적으로 짚는 안티패턴은 **단계가 진행되면서 다른 깊이**로 나타남:

**1단계 흔한 실수:**
- `Const.kt` 한 파일 / `Validator` / `Util` 모호한 이름 / Controller god-object / Car.position var / 검증 위치 혼란 / 매직넘버 / 추상적인 테스트명

**2단계 부각 이슈:**
- 전략 패턴 / 일급 컬렉션 / VO / 테스트 가능성 / Controller-Domain 책임 재분배 / 도메인-UI 의존 방향

자세한 분석은 [SUMMARY.md의 "단계별 학습 곡선"](SUMMARY.md#단계별-학습-곡선) 참고.

## 🔗 관련 리소스

- 원본 리포: https://github.com/woowacourse/kotlin-racingcar
- 분석 도구 (Oh-My-OOP MCP): [상위 리포 README](../../README.md)
- 조영호 "객체지향의 사실과 오해" — 책임/역할/협력 3요소가 본 분석의 주요 어휘

## 📝 작업 로그

분석 과정과 데이터 위치는 [PROGRESS.md](PROGRESS.md) 참고. 캐시된 PR 메타와 코멘트 JSON은 `/tmp/oop-lessons-cache/`에 저장됨 (재부팅 시 사라질 수 있음).
