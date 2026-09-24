import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerOopOperation } from "./oop.js";

export function registerInit(server: McpServer): void {
  registerOopOperation(server, "oop_init", {
    title: "Initialize .oop/ workspace (RDD / OOP / 객체지향 / 설계 워크숍 시작)",
    description:
      "[USE WHEN] 사용자가 객체지향/OOP/설계/RDD/책임 주도 설계/CRC/클래스 다이어그램/책임 분배/Wirfs-Brock stereotype/응집도/결합도/테스터빌리티 등을 언급하고 새 도메인을 모델링하려 할 때 가장 먼저 호출. " +
      ".oop/ 디렉토리(use-cases/, classes/, collaborations/, diagrams/, history/)와 design.md를 초기화하여 RDD 워크숍 워크스페이스를 만든다. 코드 생성은 하지 않고 설계 모델링만 담당.",
  });
}
