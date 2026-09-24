import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const destination=process.argv[2];
if(!destination)throw Error('Usage: node scripts/audit-dependencies.mjs <new-output-directory>');
await fs.mkdir(destination); // Do not overwrite previous audit evidence.
for(const name of ['package.json','package-lock.json'])await fs.copyFile(name,path.join(destination,name));
for(const [name,args] of [['all',[]],['production',['--omit=dev']]]){
  const result=spawnSync('npm',['audit','--json',...args],{encoding:'utf8',maxBuffer:10_000_000});
  if(result.error)throw result.error;
  const report=JSON.parse(result.stdout);
  if(!report.metadata?.vulnerabilities)throw Error(`Audit failed: ${name}`);
  await fs.writeFile(path.join(destination,`${name}.json`),result.stdout,{flag:'wx'});
  console.log(name,JSON.stringify(report.metadata.vulnerabilities));
}
