import {createHash} from 'node:crypto';
import {writeFile} from 'node:fs/promises';
import {demoFiles,demoBaseline} from '../public/demo.mjs';
import {exportManifest,compareEntries,exportSums} from '../src/manifest.mjs';
const entries=demoFiles.map(f=>({name:f.name,size:Buffer.byteLength(f.text),sha256:createHash('sha256').update(f.text).digest('hex')}));
await writeFile('examples/current-snapshot.json',exportManifest(entries));
await writeFile('examples/SHA256SUMS',exportSums(entries));
await writeFile('examples/comparison.json',JSON.stringify({algorithm:'SHA-256',baselineSupplied:true,rows:compareEntries(entries,demoBaseline.entries)},null,2)+'\n');
