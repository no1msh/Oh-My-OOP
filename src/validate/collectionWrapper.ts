import type { Design } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

// 일급 컬렉션을 만들었지만 *List를 감싸는 것 외에 아무 역할이 없는* 안티패턴.
// 대표 사례: class Lottos(val list: List<Lotto>)만 두고 도메인 메서드 없음.
// woowacourse/kotlin-lotto PR #144 (jiyuneel) — 학생 자가 답변과 @krrong 균형 코멘트.

const PASS_THROUGH_VERBS = [
  // 표현/직렬화
  "tostring",
  "tolines",
  "torow",
  "출력",
  "문자열",
  "표시",
  "포맷",
  "print",
  "format",
  // 단순 위임/조회
  "크기",
  "개수",
  "size",
  "count",
  "get",
  "list",
  "조회",
  "반환",
  "노출",
];

function isPassThrough(doing: string): boolean {
  const lower = doing.toLowerCase();
  return PASS_THROUGH_VERBS.some((v) => lower.includes(v));
}

function looksLikeCollectionToken(knowing: string): boolean {
  const lower = knowing.toLowerCase();
  if (/(list|collection|set|map|array|리스트|컬렉션|집합|배열|들)/i.test(lower))
    return true;
  // 영어 복수형 단순 휴리스틱
  if (/[a-z]s\b/.test(lower)) return true;
  return false;
}

export function checkCollectionWrapperWithoutBehavior(design: Design): Finding[] {
  const out: Finding[] = [];

  for (const card of design.classes) {
    if (card.stereotype !== "Structurer") continue;

    const knowing = card.responsibilities.knowing;
    if (knowing.length > 1) continue; // 다중 knowing은 다른 안티패턴

    // knowing이 0개거나, 1개가 컬렉션 토큰일 때만 본다.
    if (knowing.length === 1 && !looksLikeCollectionToken(knowing[0]!)) continue;

    const doing = card.responsibilities.doing;

    // doing이 모두 pass-through(표현/조회)거나 비어 있어야 안티패턴.
    if (doing.length > 0) {
      const allPassThrough = doing.every((d) => isPassThrough(d));
      if (!allPassThrough) continue;
    }

    out.push(
      assertHasMultipleRemedies({
        rule_id: "collection-wrapper-without-behavior",
        severity: "info",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은(는) Structurer로 분류되어 있지만, 컬렉션을 감싸는 것 외에 도메인 행위가 없습니다. ` +
          `일급 컬렉션은 *역할*이 있을 때만 가치가 있습니다. *역할 없는 wrapper*는 호출자에게 한 겹의 ` +
          `간접 비용만 더하고 도메인 어휘를 흐립니다.`,
        evidence: {
          stereotype: card.stereotype,
          knowing_count: knowing.length,
          doing_count: doing.length,
          example_knowing: knowing[0] ?? null,
          example_doing: doing[0] ?? null,
          guideline:
            "@krrong (lotto PR #144): \"역할과 책임이 없기에 만들지 않는 것도 좋은 근거와 방법이라고 생각해요. " +
            "단 *도메인 의미 전달*, *불변성 보장*, *확장성*은 일급 컬렉션의 장점\" — " +
            "일급 컬렉션 채택은 *현재 행동* + *예상 확장*의 트레이드오프.",
        },
        remedies: [
          {
            label: "도메인 행위를 끌어와 일급 컬렉션의 역할을 부여",
            summary:
              `${card.name}에 *컬렉션 위에서만* 의미 있는 행위(예: 합계, 일치 개수, 우승자 판정, 필터링)를 ` +
              `옮긴다. 현재 외부에서 ${card.name}의 데이터를 꺼내 계산하는 호출 지점을 찾아 ` +
              `Tell-Don't-Ask로 뒤집는다. 행위가 생기면 wrapper가 *진짜 도메인 객체*가 된다.`,
            tradeoffs: {
              pros: [
                "도메인 어휘가 코드에 드러남 (\"이름들의 합\"이 아니라 \"Names.totalLength()\")",
                "컬렉션 불변성을 게이트로 보장 (외부에서 MutableList로 변형 불가)",
                "추후 행위가 더 늘어도 한 곳에서 확장 (OCP에 가까워짐)",
              ],
              cons: [
                "현 시점에 행위가 정말 *없다면* 인위적 메서드를 만들 위험",
                "행위 이전 작업이 호출자들의 사용 위치 추적을 요구함",
              ],
            },
          },
          {
            label: "wrapper 폐기, List<T> 직접 사용 + 행위는 ServiceProvider로",
            summary:
              `${card.name}을 제거하고 호출 지점에서 List<T>를 직접 쓴다. 컬렉션 위에서 도는 도메인 계산은 ` +
              `별도 ServiceProvider(또는 확장 함수)로 분리. *역할이 없으면 만들지 않는 것이 정직*하다는 ` +
              `@krrong의 균형 답변과 일치.`,
            tradeoffs: {
              pros: [
                "객체 수가 줄어 인지 부담 감소",
                "Kotlin 컬렉션 표준 API(map/filter/sumOf)를 자연스럽게 활용",
                "*역할 없는 추상*이라는 죽은 코드 제거",
              ],
              cons: [
                "List<Lotto>가 코드 전체에 노출 — 불변성/타입 의미 약화",
                "이후 도메인 행위가 생기면 다시 모으는 비용",
                "공동 작업자가 List<T>의 도메인적 의미를 코드에서 읽어내야 함",
              ],
            },
          },
          {
            label: "유지 + notes에 *명시적 미사용 사유* 기록",
            summary:
              `${card.name}을 그대로 두되, notes에 \"현 시점 행위 없음. *불변성 게이트* 목적으로 유지\" 같은 ` +
              `의도를 적어 *방치된 추상*이 아님을 코드 외부에서 기록한다.`,
            tradeoffs: {
              pros: [
                "타입으로 도메인 의미를 *최소한* 유지 (Lottos vs List<Lotto>)",
                "행위가 생겼을 때 추가 위치가 이미 준비됨",
              ],
              cons: [
                "*추측 기반* 설계 — 정말 행위가 안 생기면 영구적 잉여물",
                "리뷰에서 \"왜 wrapper가 있죠?\"가 반복 질문으로 남음",
              ],
            },
          },
        ],
      }),
    );
  }

  return out;
}
