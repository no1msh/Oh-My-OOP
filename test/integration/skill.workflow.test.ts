import {afterEach,beforeEach,describe,expect,it} from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import {execFileSync,spawnSync} from 'node:child_process';
import matter from 'gray-matter';
let temporary:string;
const entry=path.resolve('dist/index.js');
const loader=path.resolve('test/fixtures/reject-mcp-import.mjs');
beforeEach(async()=>{temporary=await fs.mkdtemp(path.join(os.tmpdir(),'oop-skill-workflow-'));});
afterEach(async()=>{await fs.rm(temporary,{recursive:true,force:true});});
describe('Skill distribution independent of the OOP core',()=>{
  it.each(['copy','symlink'])('uses a %s of the standard Skill without generated runtime or MCP',async(method)=>{
    const source=path.resolve('skills/oh-my-oop');
    const skill=path.join(temporary,'installed skill');
    if(method==='copy')await fs.cp(source,skill,{recursive:true});else await fs.symlink(source,skill);
    const text=await fs.readFile(path.join(skill,'SKILL.md'),'utf8');
    expect(matter(text).data).toEqual({name:'oh-my-oop',description:expect.any(String)});
    await expect(fs.access(path.join(skill,'runtime.json'))).rejects.toMatchObject({code:'ENOENT'});
    const project=path.join(temporary,'target project');await fs.mkdir(project);
    const run=(args:string[])=>JSON.parse(execFileSync(process.execPath,['--experimental-loader',loader,entry,...args],{cwd:skill,encoding:'utf8',stdio:['pipe','pipe','pipe']}));
    expect(run(['system','capabilities']).interfaces.skill).toMatchObject({installer:'skills',mcp_required:false});
    run(['oop','init','--root',project]);
    expect(run(['oop','class_list','--root',project])).toMatchObject({classes:[]});
    await fs.access(path.join(project,'.oop','design.md'));
    await expect(fs.access(path.join(skill,'.oop'))).rejects.toMatchObject({code:'ENOENT'});
  });
  it('rejects the old installer without creating a destination',async()=>{
    const target=path.join(temporary,'old-install');
    const result=spawnSync(process.execPath,[entry,'skill','install'],{cwd:temporary,encoding:'utf8'});
    expect(result.status).not.toBe(0);expect(result.stderr).toContain('npx skills');
    expect(spawnSync(process.execPath,[entry,'skill','install','--target',target],{encoding:'utf8'}).status).not.toBe(0);
    await expect(fs.access(target)).rejects.toMatchObject({code:'ENOENT'});
  });
});
