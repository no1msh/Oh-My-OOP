import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// "빈 객체 + 외부 채우기" 안티패턴 — invariant 시간차.
// 대표 사례: val result = WinningResult(); lottos.forEach { result.add(rank) }
// 생성 시점엔 *불완전*, 사용 시점엔 *완전* — Tell-Don't-Ask 위반.
// woowacourse/kotlin-lotto PR #14 (@malibinYun)에서 정확히 이 패턴 지적.

const MUTATION_VERBS = [
  // 한국어 동사 어간
  "추가",
  "누적",
  "채우",
  "세팅",
  "등록",
  "담",
  "모으",
  "쌓",
  // 영어 동사
  "add",
  "append",
  "put",
  "set",
  "record",
  "register",
  "collect",
  "accumulate",
];

function matchedVerbs(text: string): string[] {
  const lower = text.toLowerCase();
  return MUTATION_VERBS.filter((v) => lower.includes(v.toLowerCase()));
}

export function checkEmptyObjectFill(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    if (card.stereotype !== "InformationHolder") continue;
    if (card.responsibilities.knowing.length !== 0) continue;

    const doings = card.responsibilities.doing;
    if (doings.length === 0) continue;

    const perDoingMatches = doings.map((d) => matchedVerbs(d));
    const allMutation = perDoingMatches.every((m) => m.length > 0);
    if (!allMutation) continue;

    const matchedSet = new Set<string>();
    for (const m of perDoingMatches) for (const v of m) matchedSet.add(v);

    out.push(
      assertHasMultipleRemedies({
        rule_id: "empty-object-external-fill",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은(는) InformationHolder인데 knowing이 비어 있고 doing이 모두 *외부에서 채우는* 동사로만 ` +
          `구성되어 있습니다. *빈 껍데기 + 외부 조립* 패턴은 invariant 시간차(생성 시점엔 불완전, 사용 시점엔 완전)를 만듭니다.`,
        evidence: {
          stereotype: card.stereotype,
          knowing_count: 0,
          doing_count: doings.length,
          mutation_verbs_matched: [...matchedSet],
          example_doing: doings[0],
          guideline:
            "@malibinYun (lotto PR #14): \"빈 껍데기의 WinningResult를 만들어서 값을 채우기보다, " +
            "WinningResult를 직접 만들어서 반환하는 것은 어떨까요?\" — " +
            "빈 객체 + 외부 채우기 = invariant 시간차. Tell-Don't-Ask 위반.",
        },
        remedies: [
          {
            label: "팩토리/부생성자로 *완성된* 객체 반환",
            summary:
              `외부 루프에서 add를 반복하는 대신, 입력 컬렉션을 받아 한 번에 채우는 팩토리(또는 부생성자)로 ` +
              `생성 시점에 invariant를 즉시 충족시킨다. ` +
              `예: ${card.name}(items.map { it.toRank() }) 또는 ${card.name}.from(items, criteria).`,
            tradeoffs: {
              pros: [
                "생성 시점에 invariant 즉시 충족 (불완전 상태가 외부에 노출되지 않음)",
                "호출자가 add 호출 순서/누락을 신경 쓸 필요 없음",
                "Tell-Don't-Ask: 호출자는 데이터만 넘기고 채우는 책임은 객체 내부에 위치",
              ],
              cons: [
                "스트리밍·점진 누적이 정당한 도메인에는 부적합",
                "팩토리 시그니처가 입력 컬렉션 타입에 결합됨",
              ],
            },
          },
          {
            label: "Builder + 완성품 *타입 분리*",
            summary:
              `조립 중 객체와 완성된 객체를 *다른 타입*으로 나눈다. ` +
              `${card.name}Builder(가변, add 가능) → .build() → ${card.name}(불변, invariant 검증 완료). ` +
              `호출부는 빌더만 만지고 도메인 코드는 완성품만 본다.`,
            tradeoffs: {
              pros: [
                "조립 중/완성된 객체가 *타입으로 구분*되어 시간차 위반이 컴파일 단계에서 차단",
                "다단계 조건부 조립을 자연스럽게 표현할 수 있음",
              ],
              cons: [
                "객체 수가 1개 늘어 초기 학습 비용 증가",
                "단순한 컬렉션 매핑 수준의 도메인에는 과추상화",
              ],
            },
          },
          {
            label: "현 패턴 유지 + 사용 시점 invariant 검증",
            summary:
              `외부 채우기 흐름을 유지하되, 값을 읽는 메서드 진입부에서 *내용물이 채워졌는지* require로 ` +
              `명시한다. 이는 시간차 invariant를 *받아들이는* 선택임을 코드에 남겨두는 것.`,
            tradeoffs: {
              pros: [
                "기존 호출 구조 변경 없음 (호환성 최대)",
                "외부에서 점진 누적이 진짜 필요한 도메인에서는 자연스러움",
              ],
              cons: [
                "*불완전 객체*가 코드베이스에 떠다님 — 빈 상태에서 메서드 호출 시 런타임 폭발",
                "테스트 fixture가 *조립 절차*를 매번 재현해야 해 testability 저하",
                "조영호 「객체지향의 사실과 오해」: 객체는 *항상 유효한 상태*로 살아 있어야 한다는 원칙과 충돌",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
