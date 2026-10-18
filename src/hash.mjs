export const MAX_FILE=64*1024*1024,MAX_BATCH=128*1024*1024;
export function validName(name){return typeof name==='string'&&name.length>0&&name.length<=255&&!/[\/\\\u0000-\u001f\u007f]/.test(name)&&name!=='.'&&name!=='..';}
export async function sha256(bytes){
 if(!globalThis.crypto?.subtle)throw Error('Web Crypto is unavailable. Use HTTPS or localhost in a supported browser.');
 const hash=await globalThis.crypto.subtle.digest('SHA-256',bytes);
 return Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');
}
export function validateFiles(files){
 if(!files.length||files.length>100)throw Error('Choose between 1 and 100 files.');
 const seen=new Set();let total=0;
 for(const file of files){
 if(!validName(file.name))throw Error('Use simple filenames without paths, control characters or more than 255 characters.');
 if(seen.has(file.name))throw Error('Duplicate filename: '+file.name+'. Choose files from a single flat set.');
 seen.add(file.name);
 if(!Number.isSafeInteger(file.size)||file.size<0||file.size>MAX_FILE)throw Error('Each file must be at most 64 MiB.');
 total+=file.size;
 }
 if(total>MAX_BATCH)throw Error('The selected batch exceeds 128 MiB.');
}
export async function hashFiles(files,{onProgress=()=>{},isCancelled=()=>false}={}){
 validateFiles(files);const entries=[];
 for(const file of files){
 if(isCancelled())throw Error('Cancelled.');
 const bytes=await file.arrayBuffer();
 if(bytes.byteLength!==file.size)throw Error('File size changed during reading.');
 const hash=await sha256(bytes);
 if(isCancelled())throw Error('Cancelled.');
 entries.push({name:file.name,size:file.size,sha256:hash});onProgress(entries.length,files.length);
 }
 return entries.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
}
