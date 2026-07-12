import { agents } from "./agents.js";import { saveRun } from "./store.js";
const id=()=>`run-${Date.now().toString(36)}`;
export async function runPipeline(){const run={id:id(),startedAt:new Date().toISOString(),status:"running",steps:[]};
 const step=async(name,fn)=>{const t=Date.now();try{const output=await fn();run.steps.push({agent:name,status:"complete",latencyMs:Date.now()-t,output});return output;}catch(error){run.steps.push({agent:name,status:"failed",latencyMs:Date.now()-t,error:error.message});throw error;}};
 try{const stories=await step("Monitor",()=>agents.monitor());const rundown=await step("Editor",()=>agents.editor(stories));const draft=await step("Writer",()=>agents.writer(rundown));const verdict=await step("Judge",()=>agents.judge(draft,rundown));if(!verdict.passed)throw new Error("Editorial fact gate rejected bulletin");const voice=await step("Anchor",()=>agents.anchor(draft,run.id));const publication=await step("Publisher",()=>agents.publisher(draft,voice));Object.assign(run,{status:"complete",completedAt:new Date().toISOString(),publication});}
 catch(error){Object.assign(run,{status:"failed",completedAt:new Date().toISOString(),error:error.message});}
 await saveRun(run);return run;}
