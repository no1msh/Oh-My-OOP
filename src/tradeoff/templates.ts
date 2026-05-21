export function expansionPromptResponsibilities(useCaseTitle: string): string {
  return [
    `# 책임 분해 풍부화 요청`,
    ``,
    `유스케이스 "${useCaseTitle}"에 대해 아래 시드 대안들을 받았습니다.`,
    `각 대안에 대해 **현재 프로젝트의 도메인 어휘**를 사용해 다음을 보강해주세요:`,
    ``,
    `1. \`tradeoffs.pros\` / \`tradeoffs.cons\`를 추상적 문장이 아닌 이 도메인의 구체적 결과로 다시 쓰세요.`,
    `2. \`assignments[].candidate_class\` 이름이 도메인 명사를 반영하는지 검토해 더 적절한 이름을 제안하세요.`,
    `3. 빠진 시각이 있으면 대안을 1~2개 더 추가하세요 (총 5개를 넘기지 마세요).`,
    `4. 조영호님 렌즈로 한 줄 평을 덧붙이세요 — "이 대안은 Tell-Don't-Ask 측면에서 ...".`,
    ``,
    `**중요:** 단일 권장안을 내놓지 마세요. 사용자가 선택할 수 있도록 모든 대안의 가치를 동등하게 제시하세요.`,
  ].join("\n");
}

export function expansionPromptAlternatives(question: string, description: string): string {
  return [
    `# 트레이드오프 대안 풍부화 요청`,
    ``,
    `질문 종류: \`${question}\``,
    `상황: ${description}`,
    ``,
    `시드로 받은 대안들에 대해 다음을 수행하세요:`,
    ``,
    `1. 각 대안의 \`pros\`/\`cons\`를 이 프로젝트의 실제 컨텍스트로 다시 작성.`,
    `2. \`cho_younghos_lens\`의 \`notes\`에 cohesion/coupling/testability 변화 이유를 한 문장으로 적기.`,
    `3. 빠진 대안이 있다면 1~2개 추가 (총 5개 한도).`,
    `4. 사용자에게 **결정을 강요하지 말고** 각 대안이 어떤 상황에서 적합한지를 분명히 하세요.`,
    ``,
    `결정은 사용자가 합니다. 당신의 역할은 트레이드오프를 명료하게 만드는 것입니다.`,
  ].join("\n");
}
