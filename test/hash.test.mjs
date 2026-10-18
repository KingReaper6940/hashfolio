import test from 'node:test';import assert from 'node:assert/strict';import {webcrypto,createHash} from 'node:crypto';
import {sha256,hashFiles,validateFiles,MAX_FILE,MAX_BATCH} from '../src/hash.mjs';
if(!globalThis.crypto)globalThis.crypto=webcrypto;
const file=(name,text)=>({name,size:Buffer.byteLength(text),arrayBuffer:async()=>Uint8Array.from(Buffer.from(text)).buffer});
test('known SHA256 vectors',async()=>{assert.equal(await sha256(new TextEncoder().encode('abc')),'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');assert.equal(await sha256(new Uint8Array()),'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');});
test('binary bytes match independent Node hash',async()=>{const bytes=Uint8Array.from([0,255,128,13,10]);assert.equal(await sha256(bytes),createHash('sha256').update(bytes).digest('hex'));});
test('batch ordering, byte sizes and progress',async()=>{const progress=[];const result=await hashFiles([file('z.txt','世界'),file('a.txt','abc')],{onProgress:n=>progress.push(n)});assert.equal(result[1].size,6);assert.deepEqual(result.map(e=>e.name),['a.txt','z.txt']);assert.deepEqual(progress,[1,2]);});
test('duplicate names, limits and paths rejected',()=>{for(const f of [[],[file('a',''),file('a','')],[file('../a','')],[{name:'x',size:MAX_FILE+1}],Array(101).fill(file('x',''))])assert.throws(()=>validateFiles(f));assert.throws(()=>validateFiles([1,2,3].map(i=>({name:String(i),size:MAX_FILE}))));});
test('cancellation and failed reads never return partial manifest',async()=>{await assert.rejects(hashFiles([file('a','')],{isCancelled:()=>true}),/Cancelled/);await assert.rejects(hashFiles([{name:'a',size:1,arrayBuffer:async()=>new ArrayBuffer(0)}]),/size changed/);});
test('browser demo has independent baseline and all four comparison statuses',async()=>{
 const {demoFiles,demoBaseline}=await import('../public/demo.mjs');
 const current=demoFiles.map(f=>({name:f.name,size:Buffer.byteLength(f.text),sha256:createHash('sha256').update(f.text).digest('hex')}));
 const {compareEntries}=await import('../src/manifest.mjs');
 assert.deepEqual(compareEntries(current,demoBaseline.entries).map(r=>r.status),['changed','missing','new','match']);
});

