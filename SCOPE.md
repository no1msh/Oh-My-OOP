# OOP 제품 경계와 전달 방식 — 2026-09-24

## 결정

사용자가 **Skill + CLI** 또는 **MCP**를 선택한다. 두 경로는 `src/oop/commands.ts`의 같은 검증·저장 코드를 호출한다. `skills/oh-my-oop/SKILL.md`는 표준 Agent Skills 형식이며 특정 호스트의 확장 문법에 의존하지 않는다. Skill 배포·에이전트 선택은 외부 `npx skills`가 담당한다. 자체 설치기와 runtime.json 생성을 제거했으며 OOP 코어는 별도 빌드/실행한다. Skill 업데이트와 코어 업데이트도 별개다.

| 선택 | 이 제품에서 얻는 것 | 부담 / 한계 |
|---|---|---|
| MCP | 구조화된 도구 입력, `.oop` 상태, 검사·다이어그램 코어 재사용. 새 하네스도 CLI/MCP로 호출 가능 | MCP 등록·호환성 테스트 유지 필요 |
| Skill + CLI | 워크숍 순서를 필요할 때 읽고 셸에서 코어 실행. MCP 연결 불필요 | 호스트별 Skill 발견·권한 차이. 실행 코드와 상태 저장은 여전히 필요 |
| 순수 Skill | 배포 파일이 적고 설명 중심 워크숍에 간단함 | 검사·저장·비교를 LLM 지시에 맡기거나 실행기를 다시 만들어야 함 |

현재 가볍게 만들 부분은 프로토콜보다 제품 범위다. MCP를 유지한다고 특정 모델/API가 필요한 것은 아니다. 다만 어느 방식이 더 빠른지는 별도 비교하지 않았으며 속도 우위를 주장하지 않는다.

공식 개념 근거: [MCP 서버 도구·리소스·프롬프트](https://modelcontextprotocol.io/docs/learn/server-concepts), [Agent Skills](https://agentskills.io/home). Skills도 스크립트를 포함할 수 있으므로 ‘Skill은 코드 실행 불가’라는 구분은 틀리다. 여기서는 절차 안내와 실행 코어의 책임을 구분한다.

## 남긴 것

`src/oop`, `domain`, `io`, `validate`, `tradeoff`, `render`, `prompts`, `resources`, OOP MCP 래퍼, 작은 CLI/명령 발견 기능. 새 OOP Skill은 CLI를 사용한다. OOP 관련 기존 수정·신규 규칙·프롬프트·lessons·발표 문서는 보존했다.

## 분리한 것

`src/architecture`, `src/runner`, `src/semantic`, 대응 MCP 도구와 테스트, `docs`, `benchmarks`, `integrations`, `examples`, 아키텍처 Skills/TypeSafe Skill과 lock. 새 하네스에서 실험 코드를 재검토해 채택한다. OOP 제품에는 JEV 호출이나 에이전트 실행기를 남기지 않는다.

로컬 인수인계 위치: `/Users/moon/Downloads/architecture-migration/START-HERE.md`. 저장소 독자가 이 개인 경로에 접근할 수 있다고 가정하지 않는다. 외부 공개·업로드·새 저장소 생성은 하지 않았다.

원본 파일/해시/이동 대상은 그 폴더의 `migration-manifest.json`, 이동 전 전체 작업 트리는 `reference-project`에 있다. `.git`, 의존성, 빌드 산출물, 실제 로컬 비밀값은 참조 스냅샷에서 제외했다. 원래 dirty 변경을 reset/checkout하지 않았다. 복구는 필요한 파일만 스냅샷과 비교 후 복사하며 현재 변경 전체를 덮어쓰지 않는다.
