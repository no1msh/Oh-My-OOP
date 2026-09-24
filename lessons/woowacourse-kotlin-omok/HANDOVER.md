# Kotlin Omok lessons — 인계

## Corpus

오목 레슨 코퍼스 분석은 완료되었습니다. 71명, 142개 PR의 분석 기록과 이 인계 문서가 있습니다. PR 문서에는 출처 URL, 리뷰 인용, 구체적인 설계 선택 분석이 있습니다.

## Editing principles

- 원본 PR URL과 인용 attribution을 보존합니다.
- 코드 예시, 구체적인 설계 문제와 피드백, 교훈, 대안, 트레이드오프를 보존합니다.
- 설계 결정의 기술적 결과를 설명하는 before/after 변화는 남깁니다.
- 개인 성장·심리 추측, 리뷰어 스타일·성향, 사람 간 비교, batch 및 어휘 집계를 제거합니다.
- 코드 fence와 인용 원문은 수정하지 않습니다.

저장소 `CLAUDE.md`의 lessons 원칙을 따릅니다.

## 분석 문서 형식

```markdown
# PR #<번호> — [오목] <닉네임> <단계>단계 미션

- **Reviewee:** [@<github>](https://github.com/<github>) (<닉네임>)
- **PR:** https://github.com/woowacourse/kotlin-omok/pull/<번호>
- **단계:** 1·2단계 (또는 3·4단계 + Android + SQLite)
- **리뷰어:** [@<github>](https://github.com/<github>) (<닉네임>)
- **라인 코멘트:** <N개> / <thread 수> thread — *핵심 토픽 한 줄 요약*

---

## 잘한 점 (설계 관점)
[코드 스니펫 + reviewer 인용 + OOP 통찰 매핑]

## 못한 점 (설계 관점)
[코드 스니펫 + reviewer 인용 + 학생 자가 답변 + OOP 통찰 매핑]

## 대표 인용
> *"[생생한 인용 1-3개]"*

## 얻은 교훈 (OOP / 설계)
1. ...
2. ...

## 도메인 특수 어휘 (3·4단계는 Android + SQLite 어휘)
- ...
```

## Useful design themes

주요 설계 주제는 결과 타입(`Boolean`, nullable, enum, sealed, `Result`), 책임 경계, 상태와 턴 모델링, wrapper와 adapter, 이름과 함수 계약, UI/도메인/데이터 분리, 영속성 모델, 테스터빌리티, Kotlin 언어 기능입니다. 개별 PR을 근거로 사용하고, 빈도나 사례 수를 설계 규칙으로 간주하지 않습니다.

## PR 자료 확인 명령

### PR 한 개 dump

```bash
N=<PR번호>
gh api "repos/woowacourse/kotlin-omok/pulls/${N}/comments" > /tmp/omok_pr${N}_line.json
jq -r '.[] | "===\n[\(.user.login)] \(.path) line=\(.line // "null") (id=\(.id) reply=\(.in_reply_to_id // "null"))\n\(.body)\n"' /tmp/omok_pr${N}_line.json > /tmp/omok_pr${N}_threads.txt
echo "PR #${N}: $(jq 'length' /tmp/omok_pr${N}_line.json) comments / reviewers:"
jq -r '[.[] | .user.login] | unique[]' /tmp/omok_pr${N}_line.json
```

### PR 상태 확인

```bash
gh pr view <N> --repo woowacourse/kotlin-omok --json title,state,mergedAt --jq '"\(.title) | state=\(.state) | merged=\(.mergedAt)"'
```

- `state=MERGED` = 정식 PR (분석 대상)
- `state=CLOSED` + `merged=null` = 폐기 PR (분석에서 제외)

### PR 본문과 일반 코멘트 확인

```bash
gh pr view <N> --repo woowacourse/kotlin-omok --comments > /tmp/omok_pr<N>_view.txt
```
