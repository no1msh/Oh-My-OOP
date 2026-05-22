# 우아한테크코스 kotlin-lotto PR 리뷰 OOP 교훈

[`woowacourse/kotlin-lotto`](https://github.com/woowacourse/kotlin-lotto) 리포의 closed PR 153개 중 라인 코멘트 ≥ 5개인 **141개 PR (71명 reviewee)**을 분석해 도출한 OOP 설계 교훈 모음.

## 📖 시작하기

- **[SUMMARY.md](SUMMARY.md)** — 전체 정리 (자주 하는 실수 TOP 10, 리뷰어 명언, 조영호 강의 토픽 매핑, 단계별 학습 곡선, **racingcar vs lotto 비교**)
- **개별 PR 분석** — 각 reviewee 폴더 안에 `<PR번호>-<단계>-로또.md` 형태로 정리
- **이전 미션**: [racingcar lessons](../woowacourse-racingcar/) — 같은 학생들의 이전 학습 흐름

## 🎯 분석 범위

**OOP 설계 관점만**:
책임 분배 / 응집도 / 결합도 / 캡슐화 / Tell-Don't-Ask / 테스터빌리티 / 도메인 모델링 / 일급 컬렉션 / 원시 강박 / 의존 방향 / 명명 설계

**제외**:
Kotlin 관용구 (scope function, smart cast, null 처리 idiom, val/var, data class 문법 자체)

**추가 (racingcar lessons와의 차이)**:
**안티패턴 발견 시 실제 `diff_hunk` 코드 스니펫을 함께 인용** — 가독성과 즉시 파악 ↑.

## 📂 폴더 구조

```
woowacourse-kotlin-lotto/
├── README.md (이 문서)
├── SUMMARY.md (총정리)
├── PROGRESS.md (작업 진행 로그)
└── <reviewee-name>/
    └── <PR번호>-<단계>-로또.md
```

각 PR 분석은 다음 구조:
- **잘한 점** (설계 관점)
- **못한 점** (설계 관점) — *실제 코드 스니펫 포함*
- **리뷰어 의견 요지** (대표 인용 1~3개 + 출처)
- **얻은 교훈**

## 🔥 lotto 도메인 특화 안티패턴 TOP 5

racingcar와 다른 lotto만의 패턴:

### 1. `LottoNumber` 도메인 누락
`Lotto`가 `List<Int>` 노출 → 호출자가 매번 "이 Int가 로또 번호 맞나?" 의심

### 2. `Rank` enum + `matchBonus` 처리
5개 일치 두 가지 분기 (2등 vs 3등) 어떻게 표현?
→ 필드 vs 검색 입력 vs `null` fallback

### 3. `Map<Rank, Int>` wrapping 회피
통계 자료구조를 그대로 노출 → 표현 책임이 View로 누수

### 4. 수동/자동 로또 통합 (2단계)
같은 *발급 협력*인데 다른 시그니처 → Strategy 패턴 미적용

### 5. `Money`/`Profit`/`Yield` 금융 도메인
원시값 그대로 노출 또는 wrapping만 (행위 부재)

자세한 내용: [SUMMARY.md의 "자주 하는 설계 실수 TOP 10"](SUMMARY.md#자주-하는-설계-실수-top-10-lotto-도메인-특화)

## 🎓 단계별 학습 곡선

**1단계** = LottoNumber 추출, Rank enum 설계, Validator 위치, Statistics god-object
**2단계** = 수동/자동 통합, Strategy 패턴, Map<Rank, Int> wrapping, flyweight 캐싱, 거스름돈 UX

자세한 분석은 [SUMMARY.md의 "단계별 학습 곡선"](SUMMARY.md#단계별-학습-곡선-lotto) 참고.

## 🔗 관련 리소스

- 원본 리포: https://github.com/woowacourse/kotlin-lotto
- 이전 미션: [woowacourse-racingcar/](../woowacourse-racingcar/) — racingcar lessons (133 PR)
- 분석 도구 (Oh-My-OOP MCP): [상위 리포 README](../../README.md)
- 조영호 "객체지향의 사실과 오해" — 책임/역할/협력 3요소가 본 분석의 주요 어휘

## 📝 작업 로그

분석 과정과 데이터 위치는 [PROGRESS.md](PROGRESS.md) 참고. 캐시된 PR 메타와 코멘트 JSON은 `/tmp/oop-lessons-cache-lotto/`에 저장됨 (재부팅 시 사라질 수 있음).
