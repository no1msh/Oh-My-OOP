// Explicit network-enabled smoke test; never installs into the user's project or global Skill directories.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

if(process.argv[2]!=='--execute')throw Error('Use --execute to allow npm to fetch skills@1.7.0 and install into temporary projects.');
const root=fileURLToPath(new URL('../',import.meta.url));
const temporary=await fs.mkdtemp(path.join(os.tmpdir(),'oop-skills-distribution-'));
const env={...process.env,DISABLE_TELEMETRY:'1',DO_NOT_TRACK:'1'};
const expected=await fs.readFile(path.join(root,'skills/oh-my-oop/SKILL.md'),'utf8');
const results=[];
try{
  for(const method of ['copy','symlink']){
    const project=path.join(temporary,method);await fs.mkdir(project);
    const args=['exec','--yes','--package=skills@1.7.0','--','skills','add',root,'--skill','oh-my-oop','-a','claude-code','-a','codex','-y',...(method==='copy'?['--copy']:[])];
    const output=execFileSync('npm',args,{cwd:project,env,encoding:'utf8',timeout:120000,maxBuffer:2_000_000});
    await fs.writeFile(path.join(project,'install-output.txt'),output);
    for(const relative of ['.claude/skills/oh-my-oop','.agents/skills/oh-my-oop']){
      const skill=path.join(project,relative);
      assert.equal(await fs.readFile(path.join(skill,'SKILL.md'),'utf8'),expected);
      await assert.rejects(fs.access(path.join(skill,'runtime.json')),{code:'ENOENT'});
    }
    const entry=path.join(root,'dist/index.js');
    const run=(args)=>JSON.parse(execFileSync(process.execPath,['--experimental-loader',path.join(root,'test/fixtures/reject-mcp-import.mjs'),entry,...args],{cwd:project,encoding:'utf8',stdio:['pipe','pipe','pipe']}));
    assert.equal(run(['system','capabilities']).interfaces.skill.installer,'skills');
    run(['oop','init','--root',project]);
    assert.deepEqual(run(['oop','class_list','--root',project]).classes,[]);
    results.push({method,hosts:['claude-code','codex'],skillMatches:true,coreWithoutMcp:true});
  }
  const report={skillsVersion:'1.7.0',temporary,results,realAgentInferenceTested:false};
  await fs.writeFile(path.join(temporary,'result.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
}catch(error){console.error(`Smoke test artifacts retained at ${temporary}`);throw error;}
