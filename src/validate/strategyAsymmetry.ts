import type { CrcCard, Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 전략(Strategy) 인터페이스의 *공통 시그니처*에 *분기 인자*가 섞이는 안티패턴.
// 대표 사례: interface LottoMachine { fun generate(count, lottoNumbers: List<List<Int>>? = null) }
//   → ManualLottoMachine은 lottoNumbers를 쓰고, AutomaticLottoMachine은 항상 null을 받음.
// 설계 모델만으로는 메서드 시그니처를 볼 수 없으므로,
//   "같은 *전략 suffix*를 공유하는 2개 이상의 ServiceProvider가 *knowing의 비대칭*을 보일 때"를 프록시로 잡는다.
// 근거: @krrong (lotto PR #144) — "공통 인터페이스 = 공통 시그니처. 분기 인자는 생성자".

const STRATEGY_SUFFIXES = [
  "Machine",
  "Generator",
  "Strategy",
  "Policy",
  "Provider",
  "Handler",
  "Resolver",
  "Selector",
];

function endsWithStrategySuffix(name: string): string | null {
  for (const s of STRATEGY_SUFFIXES) {
    if (name.length > s.length && name.endsWith(s)) return s;
  }
  return null;
}

function isStrategyStereotype(card: CrcCard): boolean {
  return card.stereotype === "ServiceProvider" || card.stereotype === "Coordinator";
}

export function checkStrategyAsymmetry(design: Design): Finding[] {
  const out: Finding[] = [];

  // suffix 별로 카드 그룹핑
  const groups = new Map<string, CrcCard[]>();
  for (const card of design.classes) {
    if (!isStrategyStereotype(card)) continue;
    const suffix = endsWithStrategySuffix(card.name);
    if (!suffix) continue;
    const list = groups.get(suffix) ?? [];
    list.push(card);
    groups.set(suffix, list);
  }

  for (const [suffix, members] of groups) {
    if (members.length < 2) continue;

    const knowingCounts = members.map((m) => m.responsibilities.knowing.length);
    const minK = Math.min(...knowingCounts);
    const maxK = Math.max(...knowingCounts);
    // 모두 같은 knowing 갯수면 대칭 — 통과.
    if (minK === maxK) continue;
    // 한쪽이 0, 다른쪽이 ≥1 이어야 *분기 인자가 인터페이스에 새는* 시그널.
    if (minK !== 0) continue;

    const withData = members.filter((m) => m.responsibilities.knowing.length > 0);
    const empty = members.filter((m) => m.responsibilities.knowing.length === 0);

    out.push(
      assertHasMultipleRemedies({
        rule_id: "strategy-default-param-pollution",
        severity: "warn",
        target: { kind: "design", id: `strategy-group-${suffix}` },
        message:
          `${suffix} 전략 그룹(${members.map((m) => m.name).join(", ")})에서 knowing이 *비대칭*입니다. ` +
          `한 구현체(${withData.map((m) => m.name).join(", ")})는 데이터를 보유하지만 ` +
          `다른 구현체(${empty.map((m) => m.name).join(", ")})는 비어 있습니다. ` +
          `공통 인터페이스 메서드가 이 비대칭을 흡수하려고 *nullable 분기 인자*나 *default = emptyList()* 같은 시그니처 오염을 만들 가능성이 높습니다.`,
        evidence: {
          suffix,
          members: members.map((m) => ({
            name: m.name,
            knowing_count: m.responsibilities.knowing.length,
            knowing_sample: m.responsibilities.knowing[0] ?? null,
          })),
          guideline:
            "@krrong (lotto PR #144): \"수동 발매기의 생성자를 통해 넘겨주는 방식\" — " +
            "공통 인터페이스 = 공통 시그니처. 분기 인자는 *메서드 default*가 아니라 *생성자*로 받아야 한다.",
        },
        remedies: [
          {
            label: "분기 데이터를 *생성자*로 옮기기 (인터페이스 정화)",
            summary:
              `메서드 시그니처에서 일부 구현체에만 의미 있는 파라미터를 제거하고, ` +
              `해당 데이터는 ${withData[0]?.name ?? "ManualX"}의 *생성자*에서 받는다. ` +
              `인터페이스는 모든 구현체가 *공통으로* 필요한 인자만 노출한다.`,
            tradeoffs: {
              pros: [
                "인터페이스 호출자가 *어떤 구현체인지* 신경 쓰지 않아도 됨",
                "nullable/default 값으로 의미를 *우회 표현*하는 코드 소멸",
                "각 구현체의 *생성 시점*에 자기 의존을 명시 (생성자가 invariant)",
              ],
              cons: [
                "구현체 생성 지점에서 인자를 *미리 알아야* 함 (지연 입력이 어려워질 수 있음)",
                "테스트에서 매 구현체마다 생성자 stub 패턴이 달라짐",
              ],
            },
          },
          {
            label: "함수형 인터페이스로 *지연 입력* 끌어올림",
            summary:
              `인터페이스를 \`(input) -> Output\` 같은 함수형으로 단순화하거나, ` +
              `${withData[0]?.name ?? "ManualX"}의 생성자에 \`() -> List<...>\` 같은 함수를 주입해 ` +
              `*입력 시점*을 호출 컨텍스트로 끌어올린다. @krrong 후속 제안.`,
            tradeoffs: {
              pros: [
                "*매 호출마다 다른 입력*이 필요한 경우 자연스럽게 표현",
                "구현체 생성 시점에 데이터를 알 필요 없음",
                "Kotlin functional interface로 호출자 쪽이 간결",
              ],
              cons: [
                "*호출 순서/사이드이펙트*가 함수 내부에 숨음 — 디버깅 비용 증가",
                "함수형 의존이 늘면 *진짜 객체 협력*이 보이지 않게 됨",
              ],
            },
          },
          {
            label: "전략 분리 폐기 + sealed class로 *합치기*",
            summary:
              `구현체 간 차이가 정말 *데이터의 유무*뿐이라면 인터페이스 대신 sealed class로 합쳐 ` +
              `데이터 보유 케이스와 무보유 케이스를 *타입으로* 표현한다. when 표현식이 모든 케이스를 컴파일 단계에서 강제.`,
            tradeoffs: {
              pros: [
                "케이스가 *닫혀 있음*이 타입에 드러나 when exhaustive 보장",
                "각 케이스가 자기 데이터만 가짐 — 비대칭이 사라짐",
                "*전략이 1~2종에서 끝날* 도메인에 가벼움",
              ],
              cons: [
                "변형 추가가 모든 when 분기 수정 비용을 유발 (OCP 약화)",
                "*다형성으로 풀 일을* sealed when으로 풀어 객체지향 의도가 약해짐",
                "외부 라이브러리/외부 의존 주입이 어려워질 수 있음",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
