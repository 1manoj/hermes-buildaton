import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
const dir=path.resolve(".data"), file=path.join(dir,"runs.json");
export async function listRuns(){try{return JSON.parse(await readFile(file,"utf8"));}catch{return [];}}
export async function saveRun(run){const runs=await listRuns();runs.unshift(run);await mkdir(dir,{recursive:true});await writeFile(file,JSON.stringify(runs.slice(0,30),null,2));return run;}
