import {hashFiles} from './src/hash.mjs';
import {parseManifest,exportManifest,compareEntries,exportSums} from './src/manifest.mjs';
import {demoFiles,demoBaseline} from './demo.mjs';
const el=id=>document.getElementById(id),make=(tag,text)=>{const n=document.createElement(tag);n.textContent=text;return n;};
let selected=[],generation=0,current=[];
function clear(){generation++;current=[];el('results').hidden=true;el('json').value='';el('report').textContent='';el('status').textContent='';el('run').disabled=false;el('cancel').disabled=true;}
el('files').addEventListener('change',()=>{clear();selected=Array.from(el('files').files);el('selection').textContent=selected.length+' file(s) selected · '+selected.reduce((s,f)=>s+f.size,0)+' bytes';});
el('baseline').addEventListener('input',clear);
el('cancel').addEventListener('click',()=>{clear();el('status').textContent='Cancelled. An active read/digest may finish internally; its result will be discarded.';});
el('demo').addEventListener('click',()=>{clear();el('files').value='';selected=demoFiles.map(f=>new File([f.text],f.name,{type:'text/plain'}));el('selection').textContent='Demo: 3 tiny files generated in this browser.';el('baseline').value=JSON.stringify(demoBaseline,null,2);run();});
async function run(){
 clear();const job=generation;el('run').disabled=true;el('cancel').disabled=false;
 try{
 const baseline=el('baseline').value.trim()?parseManifest(el('baseline').value):null;
 const entries=await hashFiles(selected,{isCancelled:()=>job!==generation,onProgress:(n,total)=>{if(job===generation)el('status').textContent='Hashed '+n+' of '+total+' files…';}});
 if(job!==generation)return;current=entries;
 const rows=baseline===null?entries.map(e=>({name:e.name,status:'hashed',actual:e,expected:null})):compareEntries(entries,baseline);
 el('results').hidden=false;el('json').value=exportManifest(entries);el('report').textContent=JSON.stringify({algorithm:'SHA-256',baselineSupplied:baseline!==null,rows},null,2);
 el('stats').replaceChildren();
 const stats=baseline===null?[[entries.length,'Files hashed'],[entries.reduce((s,e)=>s+e.size,0),'Bytes read'],[0,'Uploads'],['SHA-256','Algorithm']]:['match','changed','missing','new'].map(status=>[rows.filter(r=>r.status===status).length,status.toUpperCase()]);
 for(const [value,label] of stats){const d=make('div','');d.className='stat';d.append(make('strong',value),make('span',label));el('stats').append(d);}
 el('rows').replaceChildren();for(const row of rows){const tr=document.createElement('tr');tr.append(make('td',row.name));const status=make('td',row.status.toUpperCase());status.className='badge';tr.append(status,make('td',row.actual?.size??'Missing'),make('td',row.actual?.sha256??'Not selected'));el('rows').append(tr);}
 el('summary').textContent=baseline===null?'Snapshot created. Save it before your next transfer.':'Comparison uses exact filenames, byte sizes and hashes. Missing means absent from this selection; files were not searched on disk.';
 el('status').textContent='Finished locally. Review the snapshot and report before sharing.';
 }catch(e){if(job===generation)el('status').textContent=e.message;}
 finally{if(job===generation){el('run').disabled=false;el('cancel').disabled=true;}}
}
el('run').addEventListener('click',run);
function download(text,name,type){const u=URL.createObjectURL(new Blob([text],{type})),a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
el('snapshot').addEventListener('click',()=>download(exportManifest(current),'hashfolio-snapshot.json','application/json'));
el('sums').addEventListener('click',()=>download(exportSums(current),'SHA256SUMS','text/plain'));
