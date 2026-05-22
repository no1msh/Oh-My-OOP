# Oh-My-OOP

**RDD(Responsibility-Driven Design) 워크숍을 진행해주는 MCP 서버.**

유스케이스 → 책임 → 협력 → 클래스 다이어그램 흐름을 안내하고, **모든 설계 결정마다 단일 답 대신 트레이드오프가 있는 N개의 대안**을 제시합니다. 조영호님의 *오브젝트* / *객체지향의 사실과 오해* 가르침을 바탕으로 합니다.

- 대상 언어: **Kotlin** (코드 생성 X, 설계 모델링 O)
- 저장소: 사용자 프로젝트 루트의 `.oop/*.md` (Markdown + YAML frontmatter + Mermaid)
- 변경 시각화: Before/After Mermaid `classDiagram` 세로 스택 + 색상 강조
- 검증: 책임 적절성 / 결합도 / 테스터빌리티 (모두 권고. 어떤 변경도 차단하지 않음)
- 📚 **참고 자료:** [lessons/woowacourse-racingcar](lessons/woowacourse-racingcar/) — `woowacourse/kotlin-racingcar` 133개 PR 리뷰에서 추출한 OOP 설계 교훈 모음 ([SUMMARY](lessons/woowacourse-racingcar/SUMMARY.md))

---

## 빠른 설치 — AI 어시스턴트용 안내

> **AI에게:** 사용자가 "이 MCP를 설치해줘"라고 했다면 아래 절차를 그대로 따르세요. 모든 명령은 비대화형이며, `<...>` 표시는 실제 경로/이름으로 치환해야 합니다.

### 0. 사전 요구사항

- **Node.js 18.17 이상** (`node --version`)
- **git** (`git --version`)

둘 중 하나라도 없으면 사용자에게 알리고 멈추세요.

### 1. 클론 & 빌드

```bash
git clone https://github.com/<OWNER>/Oh-My-OOP.git
cd Oh-My-OOP
npm install
npm run build
npm test
```

- `npm test`가 30개 테스트 모두 통과해야 정상입니다.
- 빌드 산출물은 `dist/index.js`입니다. **이후 모든 설정에서 이 파일의 절대 경로**를 사용합니다.

설치 후 절대 경로를 얻으려면:

```bash
# 클론한 디렉토리에서:
echo "$(pwd)/dist/index.js"
```

이 출력값을 아래 클라이언트별 설정의 `<ABSOLUTE_PATH_TO_dist/index.js>` 자리에 그대로 넣으세요.

---

## 클라이언트별 등록

### Claude Code (CLI) — User scope (모든 프로젝트에서 사용)

```bash
claude mcp add --scope user oh-my-oop -- node <ABSOLUTE_PATH_TO_dist/index.js>
```

확인:

```bash
claude mcp get oh-my-oop
# Status: ✓ Connected 가 보이면 성공
```

제거: `claude mcp remove oh-my-oop -s user`

### Claude Desktop (Mac/Windows)

설정 파일 위치:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

`mcpServers` 키에 다음 추가 (기존 항목은 보존):

```json
{
  "mcpServers": {
    "oh-my-oop": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_dist/index.js>"]
    }
  }
}
```

Claude Desktop을 완전히 종료 후 재시작하면 도구가 메뉴에 나타납니다.

### Codex CLI (OpenAI)

`~/.codex/config.toml`에 다음 섹션을 추가:

```toml
[mcp_servers.oh-my-oop]
command = "node"
args = ["<ABSOLUTE_PATH_TO_dist/index.js>"]
```

Codex CLI를 재시작한 뒤 `/mcp`로 등록 확인.

### Cursor / 그 외 MCP 호스트

Claude Desktop과 같은 JSON 구조(`command` + `args`)를 지원합니다. 호스트의 MCP 서버 설정 위치에 동일한 항목을 추가하세요.

---

## 워크스페이스 위치 — `.oop/`이 어디에 생기는가

서버는 다음 순서로 작업 루트를 결정합니다:

1. 환경변수 `OOP_PROJECT_ROOT`가 있으면 그 경로
2. 없으면 서버 프로세스의 cwd (호스트가 결정)

**프로젝트 단위로 고정하고 싶다면** 클라이언트 설정에서 env로 지정:

**Claude Desktop / Cursor (JSON):**
```json
{
  "oh-my-oop": {
    "command": "node",
    "args": ["<ABSOLUTE_PATH_TO_dist/index.js>"],
    "env": {
      "OOP_PROJECT_ROOT": "<ABSOLUTE_PATH_TO_USER_PROJECT>"
    }
  }
}
```

**Codex (TOML):**
```toml
[mcp_servers.oh-my-oop]
command = "node"
args = ["<ABSOLUTE_PATH_TO_dist/index.js>"]
env = { OOP_PROJECT_ROOT = "<ABSOLUTE_PATH_TO_USER_PROJECT>" }
```

**Claude Code (CLI):**
```bash
claude mcp add --scope user oh-my-oop -e OOP_PROJECT_ROOT=<ABSOLUTE_PATH_TO_USER_PROJECT> -- node <ABSOLUTE_PATH_TO_dist/index.js>
```

---

## 워크숍 시작

호스트에서 `rdd-workshop-intro` 프롬프트를 호출하면 안내가 시작됩니다.

도구를 직접 부르는 흐름:

```
1. oop_init({ project: "<프로젝트명>" })
2. oop_use_case_add({ title, actor, main_flow: [...] })
3. oop_propose_responsibilities({ use_case_id, n: 3 })      # 3개 대안 + 트레이드오프
4. oop_class_upsert({ name, stereotype, responsibilities, collaborators })
5. oop_collaboration_define({ from, to, message })
6. oop_diagram_generate({})                                  # 현재 Mermaid classDiagram
7. oop_propose_alternatives({ question, context, n })        # 트레이드오프 엔진 (범용)
8. oop_design_compare({ before, after })                     # Before/After 색상 강조
9. oop_design_validate({})                                   # 항상 권고. remedies는 항상 ≥2개
```

---

## 노출하는 MCP 인터페이스

### Tools (13개)

| 도구 | 부수효과 | 단일 답 회피 |
|---|---|---|
| `oop_init` | `.oop/` 부트스트랩 | — |
| `oop_use_case_add` | `.oop/use-cases/<id>.md` | — |
| `oop_use_case_list` | 없음 | — |
| `oop_propose_responsibilities` | 없음 | ✅ N개 대안 |
| `oop_assign_responsibility` | CRC 갱신 | — |
| `oop_class_upsert` | `.oop/classes/<id>.md` | — |
| `oop_class_list` | 없음 | — |
| `oop_collaboration_define` | `.oop/collaborations/...md` | — |
| `oop_propose_alternatives` | 없음 | ✅ 트레이드오프 엔진 |
| `oop_diagram_generate` | `.oop/diagrams/current.mmd` | — |
| `oop_design_compare` | 없음 | — |
| `oop_design_validate` | 없음 | ✅ remedies ≥ 2 |
| `oop_state_read` | 없음 | — |

### Resources

- `oop://design/index`, `oop://design/diagram`
- `oop://design/classes`, `oop://design/classes/{id}`
- `oop://design/use-cases`, `oop://design/use-cases/{id}`
- `oop://design/collaborations`
- `oop://design/history`, `oop://design/history/{file}`

### Prompts

- `rdd-workshop-intro` — 워크숍 시작 + Stereotype 소개
- `responsibility-discovery` — 유스케이스 → CRC 스케치 N안
- `design-review-cho-younghos-lens` — 조영호 렌즈로 설계 리뷰

---

## 검증 룰 (10개, 모두 remedies ≥ 2 보장)

`god-object`, `mixed-stereotype`, `low-cohesion`, `too-many-collaborators`, `feature-envy`, `non-newable`, `side-effect-in-holder`, `mocking-pressure`, `cycle`, `orphan-class`.

임계값은 `.oop/design.md` frontmatter의 `thresholds`로 오버라이드 가능:

```yaml
thresholds:
  god_object_responsibilities: 7
  god_object_collaborators: 6
  cohesion_min_overlap: 0.2
  too_many_collaborators: 4
  mocking_pressure_max: 2
```

---

## 핵심 철학 (조영호님 강의에서)

도구의 동작 자체에 박혀 있는 원칙들:

- **"설계는 정답을 찾는 게 아니라 제약 아래 답을 찾는 행위"**
  → 모든 `propose_*` 도구가 단일 답 대신 N개 대안 + 트레이드오프 + 조영호 렌즈(cohesion/coupling/testability) 반환.
- **"코드 통제권은 개발자에게"**
  → `oop_design_validate`는 항상 권고. 어떤 변경도 차단하지 않음.
- **"테스터블한가가 좋은 코드의 기준"**
  → `non-newable`, `side-effect-in-holder`, `mocking-pressure` 룰로 측정.
- **"모킹이 많다면 나쁜 코드"**
  → `mocking-pressure` 룰로 감지하고 seam 도입 대안 제시.
- **"Tell-Don't-Ask"**
  → `collaboration_shape` 시드의 첫 번째 옵션이자, 협력 정의 시 권장 모드.

---

## 디렉토리 구조 (생성되는 `.oop/`)

```
<project-root>/.oop/
├── design.md                            # 인덱스 (frontmatter cross-ref)
├── use-cases/<id>.md
├── classes/<id>.md                      # CRC 카드 (knowing/doing + collaborators)
├── collaborations/<from>__<verb>__<to>.md
├── diagrams/current.mmd                 # 현재 Mermaid classDiagram
└── history/<ISO>__<label>.mmd           # 변경 전 스냅샷
```

각 파일은 Markdown + YAML frontmatter로, **사람이 직접 PR 리뷰 가능**합니다. `.oop/`를 git에 커밋하면 설계 진화가 그대로 히스토리에 남습니다.

---

## 문제 해결

| 증상 | 원인 / 조치 |
|---|---|
| `Status: ✗ Failed to connect` | `node <path>`가 직접 실행되는지 확인. `dist/index.js`가 존재하는지(빌드 했는지) 확인. |
| `OOP_PROJECT_ROOT does not exist` | 환경변수로 지정한 경로가 실제로 존재해야 함. 절대 경로를 사용. |
| 도구 호출 시 "Design index not found" | 먼저 `oop_init`을 호출해 `.oop/`를 만들어야 함. |
| Mermaid 다이어그램이 비어 보임 | 클래스를 추가한 뒤에는 `oop_diagram_generate`를 호출해야 `current.mmd`가 갱신됨. |
| 한글 ID가 깨짐 | macOS의 NFC/NFD 차이일 수 있음. 도구 입력은 NFC로 통일됨. 파일명을 직접 만지지 말고 도구로만 수정. |

---

## 개발

```bash
npm run dev          # tsx로 ts 직접 실행 (개발 중)
npm run build        # tsc -> dist/
npm test             # vitest run
npm run test:watch   # vitest watch
```

기여 시 모든 `propose_*` / `validate` 변경은 **"단일 답을 내지 않는다"는 계약**을 깨지 않도록 주의하세요 (`assertHasMultipleRemedies`로 강제됨, 테스트로 검증됨).

---

## 라이선스

MIT.
