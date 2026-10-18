import { cp, mkdir, rm } from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
for(const file of ['public/app.mjs','public/demo.mjs'])execFileSync(process.execPath,['--check',file],{stdio:'inherit'});
await rm('dist', {recursive:true,force:true});
await mkdir('dist', {recursive:true});
await cp('public','dist',{recursive:true});
await cp('src','dist/src',{recursive:true});
console.log('Built Hashfolio into dist/');
