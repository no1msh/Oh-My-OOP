# Oh-My-OOP

객체의 책임·역할·협력을 함께 설계하는 OOP/RDD 도구입니다. **Skill + CLI 또는 MCP 중 하나를 선택**하세요. 같은 코어와 같은 `.oop` 설계 데이터를 사용하며, 모델 API 키·JEV·JVM·Docker는 필요하지 않습니다.

## 사용 방식 선택

| | Skill + CLI | MCP |
|---|---|---|
| 실행 | 에이전트가 Skill을 읽고 CLI 호출 | 에이전트가 `oop_*` 도구 호출 |
| 필요한 환경 | Agent Skills 지원, 파일 읽기·명령 실행 권한, Node.js | 로컬 stdio MCP 지원, Node.js |
| 설치 | 호스트의 Skill 디렉터리에 설치 | 호스트에 MCP 서버 등록 |
| 상대 방식 필요? | MCP 연결 불필요 | Skill 설치 불필요 |

둘 다 설치할 수도 있지만 같은 변경을 두 번 실행하지 마세요. Skill과 MCP의 프롬프트/리소스 전달 방식은 다르며, 보장하는 공통 부분은 OOP 연산과 저장 형식입니다.

## 공통 준비

배포 코어의 실행 최소 버전은 Node.js 18.17입니다. 소스 빌드·테스트에는 개발 의존성(Vitest/Vite)을 고려해 Node.js 22.12 이상인 22.x 또는 24 이상을 사용하세요. 아래는 로컬 소스 설치 기준이며 npm 레지스트리 배포를 전제하지 않습니다.

```sh
git clone https://github.com/no1msh/Oh-My-OOP.git
cd Oh-My-OOP
npm ci
npm run build
node dist/index.js --help
```

이미 저장소가 있다면 clone 없이 해당 디렉터리에서 빌드하세요.

## A. Skill로 사용하기

배포·에이전트 선택은 [Vercel Skills CLI](https://github.com/vercel-labs/skills)에 맡깁니다. `npx skills`는 Skill 안내 파일을 설치하고, **실제 검사는 별도로 준비한 `oh-my-oop` CLI가 실행**합니다. MCP 연결은 필요 없습니다.

### 1. 실행 코어 준비

위 공통 준비로 빌드한 뒤, 저장소 디렉터리에서 아래 명령으로 CLI를 PATH에 연결할 수 있습니다.

```sh
npm link
oh-my-oop --version
```

`npm link`는 로컬 소스를 npm의 전역 prefix에 연결합니다. 전역 연결을 원하지 않으면 건너뛰고 에이전트에 `node /absolute/Oh-My-OOP/dist/index.js`라는 실행 경로를 명시하세요. 새 에이전트 프로세스에서도 Node.js와 해당 CLI에 접근할 수 있어야 합니다. npm 레지스트리의 동명 패키지를 자동 다운로드하는 `npx oh-my-oop`는 안내하지 않습니다.

### 2. Skill 설치 — 대상 프로젝트에서 실행

**현재 로컬 변경을 바로 사용하려면**, 대상 프로젝트로 이동한 후 로컬 저장소에서 설치하세요.

```sh
cd /absolute/my-project
npx skills add /absolute/Oh-My-OOP --skill oh-my-oop -a claude-code -a codex
```

Claude Code와 Codex 양쪽에 같은 Skill을 설치합니다. 하나만 사용하면 해당 `-a`만 남기세요. 다른 에이전트는 `-a`를 생략해 대화형으로 선택하거나 Skills CLI의 지원 에이전트 ID를 지정하세요.

```sh
npx skills add /absolute/Oh-My-OOP --skill oh-my-oop
```

기본은 프로젝트 범위이고 개인 공용 설치는 `-g`를 추가합니다. 복사 설치를 원하면 `--copy`를 사용하세요. 로컬 저장소 없이 Skill만 설치하려면 GitHub 소스를 사용합니다. 코어 CLI 준비는 여전히 별도입니다.

```sh
npx skills add no1msh/Oh-My-OOP --skill oh-my-oop -a claude-code -a codex
```

설치 목록/업데이트/삭제는 Skills CLI로 관리합니다.

```sh
npx skills list
npx skills update oh-my-oop
npx skills remove oh-my-oop
```

로컬 경로 설치의 갱신은 해당 Skills CLI 버전의 안내를 따르세요. 원본 변경이 자동 동기화된다고 가정하지 마세요. 원격 소스 업데이트 역시 **Skill만 갱신**하며 OOP 코어는 별도로 업데이트하고 빌드해야 합니다.

### 3. 에이전트에서 사용

“oh-my-oop Skill로 주문 객체의 책임 분배를 검토해줘. 대상 프로젝트는 /absolute/my-project야”라고 요청하세요. 호스트의 Skill 선택 UI/직접 호출 기능을 사용해도 됩니다.

공통 Skill은 표준 name/description과 Markdown만 사용하며 호스트 전용 확장 문법이나 `runtime.json`에 의존하지 않습니다. 자동 설치 대상에 없는 에이전트도 표준 Skill 폴더를 읽고 CLI를 실행할 수 있다면 수동으로 연결할 수 있지만, 모든 에이전트에서의 동작을 보증하지는 않습니다.

- Skill 설치만으로 CLI·의존성이 설치되거나 `.oop`가 초기화되지는 않습니다.
- 셸 실행이 금지된 채팅 환경에서는 실행 코어를 사용할 수 없습니다. 원격/컨테이너 에이전트는 그 환경 안에 코어를 준비하세요.
- 자체 `skill install --target` 명령은 제거했습니다. 예전에 자체 설치기로 설치했다면 **해당 oh-my-oop 폴더만** 백업한 뒤 Skills CLI로 다시 설치하세요. 기존 파일의 덮어쓰기/삭제 확인을 읽고 진행하세요.
- 이전 `runtime.json` 경로는 새 Skill이 읽지 않습니다. PATH 또는 명시한 CLI 경로를 준비하세요.
- 설치는 사용자의 선택입니다. 에이전트가 소프트웨어를 임의 설치하거나 권한을 우회하지 않도록 Skill에 명시했습니다.

## B. MCP로 사용하기

Skill 설치 없이 MCP 서버만 등록하면 됩니다. 다음은 `mcpServers` JSON 형식 예시입니다. 호스트별 설정 파일/형식은 해당 호스트 안내를 따르세요.

```json
{
  "mcpServers": {
    "oh-my-oop": {
      "command": "node",
      "args": ["/absolute/Oh-My-OOP/dist/index.js", "mcp"],
      "env": { "OOP_PROJECT_ROOT": "/absolute/my-project" }
    }
  }
}
```

인자 없이 실행해도 stdio MCP가 시작됩니다. 서버 로그는 stderr로 나갑니다. `oop_capabilities`와 `oop_describe`에서 연산과 입력 스키마를 확인할 수 있습니다. 서버를 변경/재빌드했다면 MCP 연결을 재시작하세요.

## 제공하는 기능과 한계

- 유스케이스, CRC 카드, 책임 배분, 객체 간 협력 저장
- 여러 설계 대안·트레이드오프·재검토 질문
- 저장된 설계 모델의 응집도·결합도·의존 방향 등 권고 검사
- Mermaid 클래스 다이어그램, 이력과 Before/After 비교
- 구현 검토에 사용할 설계 계약과 체크리스트

`design_validate`는 **저장된 설계 모델**을 검사하지, 실제 Kotlin/Android 소스를 자동 분석하지 않습니다. `conformance_check`는 호스트 LLM이 허용된 실제 구현과 비교할 계약을 반환하며 자동 합격 판정이 아닙니다. Finding은 권고이고 둘 이상의 remedy를 제공합니다.

동일한 프로젝트 루트라면 Skill/CLI와 MCP가 같은 `.oop`를 읽습니다. 대화·로그인은 이전하지 않으며 여러 에이전트의 동시 편집 잠금을 제공하지 않습니다.

## CLI 직접 사용

```sh
node dist/index.js system capabilities
node dist/index.js oop init --root /absolute/my-project
node dist/index.js oop design_validate --root /absolute/my-project
echo '{"command":"oop","operation":"class_upsert"}' | node dist/index.js system describe --input -
```

`oop <operation> --input FILE` 또는 `--input -`로 JSON 객체를 전달합니다. JSON에는 `action`을 넣지 않습니다. `--root`는 대상 프로젝트이며 생략 시 `OOP_PROJECT_ROOT`, 호환 별칭 `ARCH_PROJECT_ROOT`, 현재 디렉터리 순으로 결정합니다.

## 개발과 제품 범위

새 디렉터리에 소스만 복사해 `npm ci` → 빌드 → 테스트 → tarball 설치를 검증할 수 있습니다. 설치된 패키지의 CLI/MCP와 Claude Code·Codex용 Skill 복사 설치도 확인합니다. npm 네트워크 접근이 필요하며 전역 설치·모델 호출·배포는 하지 않습니다. 새 폴더 검사이지 새 OS/VM 검사는 아닙니다.

```sh
node scripts/check-package-install.mjs --execute
```

```sh
npm run build
npm test
```

실제 외부 설치 CLI까지 확인하려면 다음 검사를 별도로 실행하세요. `skills@1.7.0`을 npm에서 가져올 수 있으며 임시 프로젝트에서 Claude Code/Codex의 복사·심볼릭 링크 설치와 MCP 없는 코어 실행을 검사합니다. 텔레메트리는 끄고 실행하며 테스트 산출물 경로를 출력합니다. 실제 에이전트 추론이나 UI의 Skill 선택 품질을 검증하는 것은 아닙니다.

```sh
node scripts/check-skills-distribution.mjs --execute
```

실제 로그인된 Claude Code/Codex가 Skill을 읽고 CLI를 사용하는 테스트도 별도로 실행할 수 있습니다. 두 CLI가 설치·로그인되어 있어야 하며 **모델 사용량/비용이 발생할 수 있습니다**. 새 `Downloads/oh-my-oop-live-*` 프로젝트에서 Claude가 설계를 저장하고 Codex가 읽기·검증하며, 프롬프트/도구 로그/전후 상태를 그 폴더에 보존합니다. 기본 설정 일부를 테스트 세션에서 제외하므로 기존 MCP 연결이나 그래픽 UI 테스트와는 다릅니다. 재실행은 필요할 때만 하세요.

```sh
node scripts/check-live-agents.mjs --execute
```

이 제품은 OOP 전용입니다. 아키텍처 워커·Kotlin 분석·JEV 실험은 별도 하네스로 분리했으며 `arch_*`, project/task/review/semantic 명령은 제공하지 않습니다. Skill 배포는 외부 `npx skills`를 사용하며 자체 설치기는 제공하지 않습니다.

[제품 경계](SCOPE.md) · [코어/MCP 구조](MCP_STRUCTURE.md) · [개발 가이드](CLAUDE.md) · [공통 Skill](skills/oh-my-oop/SKILL.md)
