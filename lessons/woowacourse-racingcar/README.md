# 우아한테크코스 kotlin-racingcar PR 리뷰 OOP 교훈

[`woowacourse/kotlin-racingcar`](https://github.com/woowacourse/kotlin-racingcar) 리포의 closed PR 188개 중 라인 코멘트 ≥ 5개인 **133개 PR (77명 reviewee)**을 분석해 도출한 OOP 설계 교훈 모음.

## 📖 시작하기

- **[SUMMARY.md](SUMMARY.md)** — 반복되는 설계 문제, 설계 원칙과 코드 사례, 조영호 강의 토픽 매핑
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

## 주제별 사례

- [MoveStrategy 주입과 테스트 가능성](sh1mj1/115-2단계-자동차-경주.md)
- [검증 위치와 도메인/UI 결합도](moondev03/161-2단계-자동차-경주.md)
- [추상화 단계와 책임 분리](hxeyexn/109-1단계-자동차-경주.md)
- [data class와 일반 클래스의 동치성 차이](Songusika/84-2단계-자동차-경주.md)
- [값 객체와 테스트 DSL 사례](injoon2019/24-2단계-자동차-경주.md)

## 🔗 관련 리소스

- 원본 리포: https://github.com/woowacourse/kotlin-racingcar
- 분석 도구 (Oh-My-OOP MCP): [상위 리포 README](../../README.md)
- 조영호 "객체지향의 사실과 오해" — 책임/역할/협력 3요소가 본 분석의 주요 어휘

## 📝 작업 로그

분석 과정과 데이터 위치는 [PROGRESS.md](PROGRESS.md) 참고. 캐시된 PR 메타와 코멘트 JSON은 `/tmp/oop-lessons-cache/`에 저장됨 (재부팅 시 사라질 수 있음).
