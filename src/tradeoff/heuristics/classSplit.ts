import type { CrcCard } from "../../domain/model.js";
import type { AlternativeSeed } from "../engine.js";

export function classSplitSeeds(card: CrcCard | undefined): AlternativeSeed[] {
  const name = card?.name ?? "Target";
  return [
    {
      id: "split-extract-collaborator",
      label: "협력자로 추출",
      summary: `${name}의 doing 책임 중 가장 응집된 묶음을 새 ServiceProvider로 빼고, ${name}이 그에게 위임하도록 한다.`,
      design_delta: {
        added_classes: [{ name: `${name}Service`, stereotype: "ServiceProvider" }],
        moved_responsibilities: [
          { text: "<응집된 doing 묶음>", from: card?.id ?? "target", to: `${slug(name)}-service` },
        ],
        added_collaborations: [
          { from: card?.id ?? "target", to: `${slug(name)}-service`, message: "perform()" },
        ],
      },
      tradeoffs: {
        pros: ["원본 클래스가 가벼워진다", "테스트 단위가 작아진다"],
        cons: ["호출자 입장에서 협력자 수가 늘어남", "추출 경계가 모호하면 인위적"],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "neutral",
        testability: "improves",
        notes: "응집된 행위가 한곳에 모이고, 단위테스트 대상이 명확해진다.",
      },
    },
    {
      id: "split-extract-strategy",
      label: "Strategy로 추출",
      summary: `${name}의 가변 부분(알고리즘/정책)을 인터페이스 뒤로 빼고 구현체를 주입한다.`,
      design_delta: {
        added_classes: [{ name: `${name}Strategy`, stereotype: "ServiceProvider" }],
        added_collaborations: [
          { from: card?.id ?? "target", to: `${slug(name)}-strategy`, message: "decide()" },
        ],
      },
      tradeoffs: {
        pros: ["테스트에서 페이크 주입 용이", "변형 추가가 OCP에 가까워짐"],
        cons: ["인터페이스 1개 증가", "정책이 1개뿐이라면 과설계"],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "neutral",
        testability: "improves",
        notes: "non-newable 의존(난수/시각/외부)을 격리하는 데 특히 유리.",
      },
    },
    {
      id: "split-extract-value",
      label: "값 객체로 추출",
      summary: `${name}의 knowing 묶음을 InformationHolder(값 객체)로 빼낸다.`,
      design_delta: {
        added_classes: [{ name: `${name}Value`, stereotype: "InformationHolder" }],
        moved_responsibilities: [
          { text: "<응집된 knowing 묶음>", from: card?.id ?? "target", to: `${slug(name)}-value` },
        ],
      },
      tradeoffs: {
        pros: ["원시 타입 강박이 사라진다", "유효성 검증이 한곳에 모임"],
        cons: ["진짜 도메인 개념이 아니면 표면적인 추상"],
      },
      cho_younghos_lens: {
        cohesion: "improves",
        coupling: "improves",
        testability: "improves",
        notes: "데이터 무결성 책임이 값 객체로 모여 사이드이펙트 노출이 줄어든다.",
      },
    },
    {
      id: "split-keep-and-shrink",
      label: "현재 위치 유지 + 책임 축소",
      summary: "분리 대신 일부 책임을 제거하거나 더 작은 표현으로 바꾼다.",
      design_delta: {},
      tradeoffs: {
        pros: ["변경 비용 최소", "과설계 회피"],
        cons: ["god-object 가능성이 남아 있음"],
      },
      cho_younghos_lens: {
        cohesion: "neutral",
        coupling: "neutral",
        testability: "neutral",
        notes: "통증이 본격적으로 보이지 않으면 가장 안전한 선택이 될 수 있다.",
      },
    },
  ];
}

function slug(s: string): string {
  return s
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-");
}
