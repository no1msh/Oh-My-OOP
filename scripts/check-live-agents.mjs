// User-invoked real-agent smoke test. Uses existing logins; no secrets are read or saved here.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync,spawn} from 'node:child_process';
if(process.argv[2]!=='--execute')throw Error('Use --execute to run real Claude/Codex model sessions in a new Downloads test project.');
const root=fileURLToPath(new URL('../',import.meta.url));
const base=await fs.mkdtemp(path.join(os.homedir(),'Downloads','oh-my-oop-live-'));
const project=path.join(base,'project');await fs.mkdir(project);
const cli=path.join(root,'dist/index.js');
console.log(`Artifacts: ${base}`);
const installation=execFileSync('npm',['exec','--yes','--package=skills@1.7.0','--','skills','add',root,'--skill','oh-my-oop','-a','claude-code','-a','codex','--copy','-y'],{cwd:project,encoding:'utf8',env:{...process.env,DISABLE_TELEMETRY:'1',DO_NOT_TRACK:'1'},timeout:60000});
await fs.writeFile(path.join(base,'installation.txt'),installation);
const shared=`이것은 사용자가 승인한 실제 Skill 사용 테스트다. 설치된 oh-my-oop Skill을 찾아 먼저 읽고 그 지침대로 실행해. Skill 경로/본문은 이 프롬프트에 주지 않았으므로 실제 로컬 발견을 사용해. MCP는 사용하지 마. 실행 코어는 node "${cli}" 이며 대상 프로젝트는 "${project}"야. 파일 변경은 이 대상 프로젝트의 .oop만 허용한다. 도구 저장을 우회해 직접 .oop 파일을 작성하지 마. 앱 구현, 설치, 외부 검색, 다른 에이전트 실행은 하지 마. 권한/로그인 문제면 우회하지 말고 보고해. 최종 답은 한국어로 읽은 Skill 경로, 수행한 CLI 연산, 실제 결과, 남은 한계를 간단히 적어.`;
const prompts={
  claude:`oh-my-oop Skill을 사용해줘. ${shared}\n작은 도서 대출 설계 테스트다. 새 .oop를 초기화하고 Book 클래스(책 식별자와 대출 여부를 알고, 대출 가능 여부를 판단하는 책임)를 저장해. 대출 가능 판단을 Book이 소유하는 안과 LoanPolicy로 분리하는 안을 도구로 비교하고, 저장된 설계 모델을 검증해. 실제 API 입력은 discovery에서 확인해. 책임을 두 클래스에 중복 저장하지 말고 Book 하나만 저장해.`,
  codex:`$oh-my-oop 사용. ${shared}\n앞선 에이전트가 저장한 .oop를 읽어 Book 클래스가 있는지 확인해. 있다면 기존 데이터는 변경하지 말고 설계 모델 검증과 diagram_generate의 write_current:false 미리보기를 해. 없다면 그 사실을 보고하고 CLI로 새 .oop와 Book(책 식별자/대출 여부를 알고 대출 가능 여부를 판단)을 저장한 후 검증과 미리보기를 해. 기존 데이터가 있었다면 수정하지 않았음을 확인해.`,
};
async function run(name,exe,args){
  await fs.writeFile(path.join(base,`${name}-prompt.txt`),prompts[name]);
  const started=Date.now();let output='',errors='';
  const child=spawn(exe,args,{cwd:project,env:process.env,stdio:['pipe','pipe','pipe']});
  child.stdout.on('data',b=>{output+=b;});child.stderr.on('data',b=>{errors+=b;});
  child.stdin.end(prompts[name]);
  const timer=setTimeout(()=>child.kill('SIGTERM'),180000);
  const result=await new Promise(resolve=>{child.on('error',e=>resolve({error:e.message}));child.on('close',(code,signal)=>resolve({code,signal}));});clearTimeout(timer);
  // Exclude reasoning-only events from the portable audit; keep tool use and final response.
  const lines=output.split('\n').filter(Boolean).map(line=>{try{const event=JSON.parse(line);if(event.item?.type==='reasoning')return null;if(event.message?.content)event.message.content=event.message.content.filter(x=>!['thinking','redacted_thinking'].includes(x.type));return JSON.stringify(event);}catch{return line;}}).filter(Boolean);
  await fs.writeFile(path.join(base,`${name}-events.jsonl`),lines.join('\n')+'\n');
  await fs.writeFile(path.join(base,`${name}-stderr.txt`),errors);
  const report={...result,elapsedMs:Date.now()-started};console.log(name,JSON.stringify(report));return report;
}
const results={};
results.claude=await run('claude','claude',['-p','--output-format','stream-json','--verbose','--effort','medium','--max-budget-usd','2','--strict-mcp-config','--mcp-config','{"mcpServers":{}}','--setting-sources','project','--permission-mode','dontAsk','--tools','Read,Skill,Bash','--allowedTools','Read,Skill,Bash','--no-session-persistence']);
async function snapshot(){const out={};async function walk(dir){for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())await walk(p);else out[path.relative(project,p)]=await fs.readFile(p,'utf8');}}try{await walk(path.join(project,'.oop'));}catch(e){if(e.code!=='ENOENT')throw e;}return out;}
const afterClaude=await snapshot();await fs.writeFile(path.join(base,'after-claude.json'),JSON.stringify(afterClaude,null,2));
results.codex=await run('codex','codex',['exec','--ignore-user-config','--ephemeral','--sandbox','workspace-write','--skip-git-repo-check','--json','-m','gpt-6-astra','-c','model_reasoning_effort="medium"','-']);
const afterCodex=await snapshot();await fs.writeFile(path.join(base,'after-codex.json'),JSON.stringify(afterCodex,null,2));
await fs.writeFile(path.join(base,'summary.json'),JSON.stringify({results,claudeCreatedState:Object.keys(afterClaude).length>0,sharedStateUnchanged:JSON.stringify(afterClaude)===JSON.stringify(afterCodex),finalStateFiles:Object.keys(afterCodex),scope:'Real non-interactive CLI sessions, not graphical skill picker testing.'},null,2));
console.log(`Completed: ${base}`);
