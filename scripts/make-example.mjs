import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
const hash=text=>createHash('sha256').update(text).digest('hex');
const entry=(name,text)=>({name,size:Buffer.byteLength(text),sha256:hash(text)});
const baseline={format:'hashfolio-v1',algorithm:'SHA-256',entries:[entry('changed.txt','old'),entry('missing.txt','gone'),entry('stable.txt','abc')]};
await writeFile('examples/baseline.json',JSON.stringify(baseline,null,2)+'\n');
await writeFile('public/demo.mjs','export const demoFiles='+JSON.stringify([{name:'stable.txt',text:'abc'},{name:'changed.txt',text:'new'},{name:'new.txt',text:'hello'}])+';\nexport const demoBaseline='+JSON.stringify(baseline)+';\n');
