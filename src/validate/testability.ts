import type { Design, CrcCard } from "../domain/model.js";
import type { Finding } from "./findings.js";
import { assertHasMultipleRemedies } from "./findings.js";

const NON_NEWABLE_RE = /(Repository|Client|Gateway|Random|Clock|System|Http|Db|Connection)/;
const STRATEGY_HINT_RE = /(Strategy|Policy|Provider|Source|Generator)/;
const SIDE_EFFECT_VERBS = /(save|store|persist|send|publish|emit|print|log|write|delete|fetch|call)/i;

function isNonNewableName(name: string): boolean {
  return NON_NEWABLE_RE.test(name);
}

function hasStrategySeam(card: CrcCard): boolean {
  return card.collaborators.some((c) => STRATEGY_HINT_RE.test(c.name));
}

export function checkNonNewable(design: Design): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    const offenders = card.collaborators.filter((c) => isNonNewableName(c.name));
    if (offenders.length === 0) continue;
    if (hasStrategySeam(card)) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "non-newable",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}이(가) 외부 자원성 협력자(${offenders
            .map((o) => o.name)
            .join(", ")})를 직접 사용해 단위테스트에서 단순히 \`new\`로 생성하기 어렵습니다.`,
        evidence: {
          offenders: offenders.map((o) => o.name),
          guideline: "조영호님 기준: new로 생성 가능한가, 사이드이펙트 의존을 강제하는가",
        },
        remedies: [
          {
            label: "Strategy/Provider 인터페이스로 추출",
            summary:
              "외부 자원 호출을 인터페이스 뒤로 감추고, 테스트에서는 페이크 구현을 주입한다.",
            tradeoffs: {
              pros: ["테스트가 단순해지고 모킹 부담이 사라짐", "구현 교체 용이"],
              cons: ["인터페이스 1개 추가로 코드 표면적 증가"],
            },
          },
          {
            label: "값(결과)을 파라미터로 받기",
            summary:
              "자원에서 얻은 값(예: 현재 시각, 난수)을 호출 시점에 파라미터로 받아 객체를 순수하게 유지한다.",
            tradeoffs: {
              pros: ["객체가 완전히 순수해져 테스트 자유도 최고"],
              cons: ["호출자가 값을 준비해야 해서 유스케이스 진입점이 무거워짐"],
            },
          },
          {
            label: "Interfacer로 위임 + 경계에서만 자원 사용",
            summary:
              "외부 자원 호출 책임을 별도 Interfacer로 모으고, 도메인 객체는 그 결과만 받는다.",
            tradeoffs: {
              pros: ["도메인-인프라 경계가 명확", "교체 가능한 구조"],
              cons: ["계층이 늘어 학습 곡선 상승"],
            },
          },
        ],
      }),
    );
  }
  return out;
}

export function checkSideEffectInHolder(design: Design): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    if (card.stereotype !== "InformationHolder") continue;
    const offenders = card.responsibilities.doing.filter((d) => SIDE_EFFECT_VERBS.test(d));
    if (offenders.length === 0) continue;

    out.push(
      assertHasMultipleRemedies({
        rule_id: "side-effect-in-holder",
        severity: "warn",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}은 InformationHolder인데 사이드이펙트성 동사(저장/전송/기록 등)가 포함된 doing 책임을 가집니다.`,
        evidence: { offenders },
        remedies: [
          {
            label: "Stereotype을 ServiceProvider로 재분류",
            summary: "사이드이펙트 책임이 본질이라면 Stereotype을 맞게 바꾼다.",
            tradeoffs: {
              pros: ["역할이 정확히 표현됨"],
              cons: ["원래 정보 표현 목적이라면 정체성이 흐려짐"],
            },
          },
          {
            label: "사이드이펙트를 새 ServiceProvider/Interfacer로 추출",
            summary:
              "정보를 보유하는 책임은 남기고, 저장/전송 등은 새 협력자에게 위임한다.",
            tradeoffs: {
              pros: ["순수한 도메인 정보 보존", "테스트 용이"],
              cons: ["클래스 수 증가"],
            },
          },
          {
            label: "이벤트로 바꾸고 Interfacer가 처리",
            summary:
              "사이드이펙트를 이벤트 발행으로 바꾸고 경계에서 Interfacer가 실제 동작을 수행한다.",
            tradeoffs: {
              pros: ["도메인이 인프라를 모름", "확장 용이"],
              cons: ["이벤트 추적이 어려워질 수 있음"],
            },
          },
        ],
      }),
    );
  }
  return out;
}

export function checkMockingPressure(
  design: Design,
  maxNonNewable: number,
): Finding[] {
  const out: Finding[] = [];
  for (const card of design.classes) {
    const nonNewable = card.collaborators.filter((c) => isNonNewableName(c.name));
    if (nonNewable.length <= maxNonNewable) continue;
    out.push(
      assertHasMultipleRemedies({
        rule_id: "mocking-pressure",
        severity: "info",
        target: { kind: "class", id: card.id },
        message:
          `${card.name}이(가) 외부 자원성 협력자 ${nonNewable.length}개에 의존합니다. ` +
          `테스트에서 모킹 부담이 커집니다.`,
        evidence: { nonNewable: nonNewable.map((n) => n.name), max: maxNonNewable },
        remedies: [
          {
            label: "테스트 더블 seam 도입",
            summary:
              "모든 외부 의존을 한두 개의 Strategy 인터페이스 뒤로 모은다.",
            tradeoffs: {
              pros: ["모킹 지점이 줄어든다"],
              cons: ["seam 설계에 시간 필요"],
            },
          },
          {
            label: "조합 책임을 바깥(경계)으로 밀어내기",
            summary:
              "유스케이스 경계에서 의존성 조립을 하고 도메인 코어는 순수하게 둔다.",
            tradeoffs: {
              pros: ["코어를 표준 단위테스트로 검증 가능"],
              cons: ["조립 책임이 한곳에 집중되어 비대해질 수 있음"],
            },
          },
          {
            label: "순수 코어 / 인프라 어댑터 분리",
            summary:
              "도메인 규칙은 순수 객체로, 외부 호출은 어댑터로 나눠 클래스를 둘로 쪼갠다.",
            tradeoffs: {
              pros: ["테스트 피라미드 하단(단위) 비중 증가"],
              cons: ["객체 수 증가, 호출 흐름 길어짐"],
            },
          },
        ],
      }),
    );
  }
  return out;
}
