import {describe,it,expect} from 'vitest';
import {execFileSync,spawnSync} from 'node:child_process';
import {capabilities,describeOperation} from '../../src/application/discovery.js';
import {OOP_OPERATIONS} from '../../src/oop/commands.js';
import {Client} from '@modelcontextprotocol/sdk/client/index.js';
import {InMemoryTransport} from '@modelcontextprotocol/sdk/inMemory.js';
import {createServer} from '../../src/server.js';

describe('OOP-only public surface',()=>{
  it('discovers only OOP and system operations with executable schemas',()=>{
    const result=capabilities();
    expect(result.product).toBe('oh-my-oop');
    expect(result.operations).toHaveLength(Object.keys(OOP_OPERATIONS).length+2);
    for(const op of result.operations){
      expect(['oop','system']).toContain(op.command);
      expect(describeOperation({command:op.command,operation:op.operation}).input_schema).toBeTruthy();
    }
    expect(()=>describeOperation({command:'semantic',operation:'classify'})).toThrow();
  });
  it('CLI discovery matches core without importing the MCP SDK',()=>{
    const output=execFileSync(process.execPath,['--import','tsx','--experimental-loader','./test/fixtures/reject-mcp-import.mjs','src/index.ts','system','capabilities'],{encoding:'utf8'});
    expect(JSON.parse(output)).toEqual(capabilities());
    for(const command of ['project','task','review','semantic','skills']){
      const result=spawnSync(process.execPath,['--import','tsx','src/index.ts',command,'read'],{encoding:'utf8'});
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('Unknown command');
    }
  });
  it('MCP exposes exactly OOP core plus read-only discovery',async()=>{
    const server=createServer();
    const client=new Client({name:'scope-test',version:'1'},{capabilities:{}});
    const [a,b]=InMemoryTransport.createLinkedPair();
    try{
      await server.connect(b);await client.connect(a);
      const tools=await client.listTools();
      expect(tools.tools.map(t=>t.name).sort()).toEqual([...Object.keys(OOP_OPERATIONS),'oop_capabilities','oop_describe'].sort());
      for(const name of ['oop_capabilities','oop_describe'])expect(tools.tools.find(t=>t.name===name)?.annotations?.readOnlyHint).toBe(true);
    }finally{await client.close();await server.close();}
  });
});
