import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 도메인 상태를 보유한 *전역 객체* (Kotlin `object`, static singleton 등) 안티패턴.
// *테스터빌리티 손상* (테스트 격리 불가) + *재초기화 강제* (2회 이상 사용 불가) + *DI 불가* (전략 주입 막힘).
//
// 근거: lessons/woowacourse-kotlin-blackjack 다수 PR — `object Deck` 패턴 반복.
// @malibinYun (krrong/46): "덱을 다시 채워야 할 수도 있고, 한 게임은 여러 벌의 카드로 진행을 하는
//                          요구사항이 생길 수도 있어요. 정말 53번 뽑으면 오류가 발생해야 할까요?"

const SINGLETON_NOTE_PATTERNS = [
  "singleton",
  "object 키워드",
  "object keyword",
  "전역",
  "글로벌",
  "global",
];

const MUTABLE_STATE_PATTERNS = [
  "mutable",
  "mutablelist",
  "mutablemap",
  "mutableset",
  "arraydeque",
  "가변",
  "변경 가능",
  "변경가능",
];

function noteMatchesSingleton(notes?: string): boolean {
  if (!notes) return false;
  const lower = notes.toLowerCase();
  return SINGLETON_NOTE_PATTERNS.some((p) => lower.includes(p));
}

function nameMatchesSingleton(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.includes("singleton") || lower.includes("global");
}

function findMutableKnowing(knowing: string[]): string | null {
  for (const k of knowing) {
    const lower = k.toLowerCase();
    for (const p of MUTABLE_STATE_PATTERNS) {
      if (lower.includes(p)) return k;
    }
  }
  return null;
}

export function checkSingletonStatefulHolder(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    if (
      card.stereotype !== "InformationHolder" &&
      card.stereotype !== "Structurer"
    )
      continue;

    const singletonByName = nameMatchesSingleton(card.name);
    const singletonByNotes = noteMatchesSingleton(card.notes);
    if (!singletonByName && !singletonByNotes) continue;

    const mutableKnowing = findMutableKnowing(card.responsibilities.knowing);
    if (!mutableKnowing) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "singleton-stateful-holder",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은(는) *도메인 상태*를 보유한 *전역 객체*입니다. ` +
          `*테스트 격리 불가* + *재초기화 강제* + *전략 주입 막힘*. ` +
          `객체지향에서 *상태가 있는 객체*는 *인스턴스화 가능*해야 한다.`,
        evidence: {
          stereotype: card.stereotype,
          singleton_signal: singletonByName ? "name" : "notes",
          mutable_knowing: mutableKnowing,
          guideline:
            "@malibinYun (woowacourse-kotlin-blackjack krrong/46): " +
            "\"덱을 다시 채워야 할 수도 있고, 한 게임은 여러 벌의 카드로 진행을 하는 요구사항이 생길 수도 있어요. " +
            "정말 53번 뽑으면 오류가 발생해야 할까요?\" " +
            "— 전역 가변 상태는 *테스트 격리 + 다회 사용 + 전략 주입* 셋 모두 막는다.",
        },
        remedies: [
          {
            label: "일반 class 로 강등 + 생성자 주입",
            summary:
              `${card.name}을 \`object\`/Singleton 에서 일반 \`class\`로 강등하고, 상태(데이터)는 ` +
              `생성자로 주입한다. 호출자는 *원하는 상태*로 인스턴스 생성. 테스트는 *원하는 fixture* 로.`,
            tradeoffs: {
              pros: [
                "*테스트 격리* 회복 — 각 테스트가 자기 인스턴스를 가짐",
                "*다회 사용* 가능 — 새 인스턴스 = 새 상태",
                "*전략 주입* 가능 (다른 fill strategy / 다른 초기 상태)",
              ],
              cons: [
                "*호출 지점* 마다 인스턴스 생성/공유 결정 비용",
                "*기본 인스턴스* 가 필요하다면 공통 팩토리 추가 필요",
              ],
            },
          },
          {
            label: "전략 객체 주입으로 분리 (DI)",
            summary:
              `${card.name}이 *상태 자체*가 아니라 *상태 생성 전략*을 인자로 받게 한다. ` +
              `상태 보유는 인스턴스에 두되, *어떻게 만드는가*는 외부 결정.`,
            tradeoffs: {
              pros: [
                "*테스트용 stub 주입* 자연스러움",
                "*기본 동작*과 *특수 동작* 양립 가능",
                "*확장점*이 코드에 명시",
              ],
              cons: [
                "전략 인터페이스 추가 비용",
                "단순 케이스에는 과설계",
              ],
            },
          },
          {
            label: "상태를 호출처로 끌어올리기 (외부 소유)",
            summary:
              `${card.name}은 *상태 없는 함수 집합*으로 두고, 상태는 *호출 측*이 들고 다닌다. ` +
              `호출 시 상태 인스턴스를 인자로 전달.`,
            tradeoffs: {
              pros: [
                "전역 상태 완전 제거",
                "함수형 스타일과 결합 자연",
              ],
              cons: [
                "*상태 책임이 호출처에 분산* — 객체지향 응집 ↓",
                "Tell-Don't-Ask 원칙 약화",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
