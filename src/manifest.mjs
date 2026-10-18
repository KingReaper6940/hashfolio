import {validName} from './hash.mjs';
export function validateEntries(entries){
 if(!Array.isArray(entries)||entries.length>100)throw Error('Manifest must contain at most 100 entries.');
 const seen=new Set();
 return entries.map(e=>{
 if(!e||!validName(e.name)||!Number.isSafeInteger(e.size)||e.size<0||typeof e.sha256!=='string'||!/^[a-f0-9]{64}$/i.test(e.sha256))throw Error('Each entry needs a valid name, nonnegative byte size and 64-digit SHA256.');
 if(seen.has(e.name))throw Error('Duplicate manifest filename: '+e.name);
 seen.add(e.name);return {name:e.name,size:e.size,sha256:e.sha256.toLowerCase()};
 }).sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
}
export function parseManifest(text){
 if(new TextEncoder().encode(text).length>65536)throw Error('Manifest exceeds 64 KiB.');
 let doc;try{doc=JSON.parse(text);}catch{throw Error('Paste valid Hashfolio JSON.');}
 if(doc?.format!=='hashfolio-v1'||doc.algorithm!=='SHA-256')throw Error('Expected hashfolio-v1 with SHA-256.');
 return validateEntries(doc.entries);
}
export function exportManifest(entries){return JSON.stringify({format:'hashfolio-v1',algorithm:'SHA-256',entries:validateEntries(entries)},null,2)+'\n';}
export function compareEntries(current,baseline){
 const now=new Map(validateEntries(current).map(e=>[e.name,e])),before=new Map(validateEntries(baseline).map(e=>[e.name,e]));
 return [...new Set([...before.keys(),...now.keys()])].sort().map(name=>{
 const actual=now.get(name),expected=before.get(name);
 const status=!expected?'new':!actual?'missing':actual.sha256===expected.sha256&&actual.size===expected.size?'match':'changed';
 return {name,status,expected:expected??null,actual:actual??null};
 });
}
export function exportSums(entries){return validateEntries(entries).map(e=>e.sha256+'  '+e.name).join('\n')+'\n';}

