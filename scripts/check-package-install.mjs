// Network-enabled release check. All installations stay in a new temporary directory.
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';

if(process.argv[2]!=='--execute')throw Error('Use --execute to allow temporary npm and skills installations.');
const source=fileURLToPath(new URL('../',import.meta.url));
const output=await fs.mkdtemp(path.join(process.argv[3] || os.tmpdir(),'oop-package-'));
console.log(`Artifacts: ${output}`);
const build=path.join(output,'build');
const consumer=path.join(output,'consumer');
await fs.mkdir(build);await fs.mkdir(consumer);
const env={...process.env,DISABLE_TELEMETRY:'1',DO_NOT_TRACK:'1'};
let sequence=0;
function run(command,args,cwd,input){
  const log=path.join(output,`${++sequence}.log`);
  try{
    const text=execFileSync(command,args,{cwd,env,input,encoding:'utf8',timeout:180000,maxBuffer:10_000_000,stdio:['pipe','pipe','pipe']});
    return fs.writeFile(log,text).then(()=>text);
  }catch(error){
    return fs.writeFile(log,`${error.stdout || ''}\n${error.stderr || ''}`).then(()=>{throw error;});
  }
}
for(const name of ['src','test','skills','lessons','package.json','package-lock.json','tsconfig.json','vitest.config.ts','README.md','MCP_STRUCTURE.md','SCOPE.md']){
  await fs.cp(path.join(source,name),path.join(build,name),{recursive:true});
}
await run('npm',['ci','--ignore-scripts'],build);
await run('npm',['run','build'],build);
await run('npm',['test','--','--reporter=json','--outputFile=regression.json'],build);
const regression=JSON.parse(await fs.readFile(path.join(build,'regression.json'),'utf8'));
assert.equal(regression.success,true);
const packed=JSON.parse(await run('npm',['pack','--json','--pack-destination',output],build))[0];
await fs.writeFile(path.join(consumer,'package.json'),JSON.stringify({name:'oop-release-consumer',version:'1.0.0',private:true}));
await run('npm',['install','--omit=dev','--ignore-scripts',path.join(output,packed.filename)],consumer);
const installed=path.join(consumer,'node_modules/oh-my-oop');
const bin=path.join(consumer,'node_modules/.bin/oh-my-oop');
for(const name of ['vitest','typescript','tsx'])await assert.rejects(fs.access(path.join(consumer,'node_modules',name)),{code:'ENOENT'});
const cli=async(action,input={})=>JSON.parse(await run(bin,['oop',action,'--root',consumer,'--input','-'],consumer,JSON.stringify(input)));
await cli('init');
await cli('class_upsert',{name:'Book',stereotype:'InformationHolder',responsibilities:{knowing:['title']}});
const state=await cli('state_read');
assert.match(JSON.stringify(state),/Book/);
await cli('design_validate');await cli('diagram_generate',{write_current:false});
await assert.rejects(fs.access(path.join(installed,'.oop')),{code:'ENOENT'});
const require=createRequire(path.join(consumer,'package.json'));
const {Client}=await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/index.js')));
const {StdioClientTransport}=await import(pathToFileURL(require.resolve('@modelcontextprotocol/sdk/client/stdio.js')));
const client=new Client({name:'package-check',version:'1.0.0'},{capabilities:{}});
try{
  await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(installed,'dist/index.js'),'mcp'],env:{...env,OOP_PROJECT_ROOT:consumer},stderr:'pipe'}));
  assert.equal((await client.listTools()).tools.length,16);
  const result=await client.callTool({name:'oop_state_read',arguments:{}});
  assert.notEqual(result.isError,true);assert.deepEqual(result.structuredContent,state);
}finally{await client.close();}
await run('npm',['exec','--yes','--package=skills@1.7.0','--','skills','add',installed,'--skill','oh-my-oop','-a','claude-code','-a','codex','-y','--copy'],consumer);
for(const host of ['.claude','.agents'])assert.equal(await fs.readFile(path.join(consumer,host,'skills/oh-my-oop/SKILL.md'),'utf8'),await fs.readFile(path.join(installed,'skills/oh-my-oop/SKILL.md'),'utf8'));
const audit=JSON.parse(await run('npm',['audit','--omit=dev','--json'],consumer));
assert.equal(audit.metadata.vulnerabilities.total,0);
const result={output,node:process.version,cleanBuild:true,regressionTests:regression.numPassedTests,tarball:packed.filename,productionOnly:true,cli:true,mcpTools:16,mcpCliStateParity:true,skillHosts:['claude-code','codex'],productionVulnerabilities:0,limitations:['Same machine and npm cache, not a clean VM','No agent inference or publishing']};
await fs.writeFile(path.join(output,'result.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
