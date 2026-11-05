// Jalankan dari folder _src: node ../tools/char.mjs <name>
// art/c_<name>.png -> potong 4 pose -> Meshy multi-image + rig -> meshy/<name>_*.glb. Butuh _src/.env berisi MESHY_API_KEY=...
import fs from 'fs';import {execSync} from 'child_process';
const n=process.argv[2];
console.log(execSync(`python ../tools/crop.py ${n}`).toString());
const key=fs.readFileSync('.env','utf8').match(/MESHY_API_KEY=(\S+)/)[1];
const H={Authorization:'Bearer '+key,'Content-Type':'application/json'},A='https://api.meshy.ai/openapi/v1';
const uri=f=>'data:image/png;base64,'+fs.readFileSync(f).toString('base64');
const post=async(p,b)=>{const r=await fetch(A+p,{method:'POST',headers:H,body:JSON.stringify(b)});const t=await r.text();if(!r.ok)throw new Error(p+' '+r.status+' '+t);return JSON.parse(t).result};
const wait=async p=>{for(;;){try{const r=await fetch(A+p,{headers:H});if(r.ok){const j=await r.json();if(j.status==='SUCCEEDED')return j;if(['FAILED','CANCELED'].includes(j.status))throw new Error('FAIL '+p+' '+JSON.stringify(j.task_error));}}catch(e){if(String(e).includes('FAIL'))throw e}await new Promise(s=>setTimeout(s,8000));}};
const dl=async(u,f)=>{const g=await fetch(u);fs.writeFileSync(f,Buffer.from(await g.arrayBuffer()))};
const id=await post('/multi-image-to-3d',{image_urls:['front','back','left','right'].map(k=>uri(`art/${n}_${k}.png`)),ai_model:'latest',should_texture:true,enable_pbr:false,should_remesh:true,target_polycount:30000,texture_prompt:'hand-painted storybook illustration, soft painterly fabric, no specular'});
const d=await wait('/multi-image-to-3d/'+id);await dl(d.model_urls.glb,`meshy/${n}.glb`);
const r=await post('/rigging',{input_task_id:id,height_meters:1.7});const j=await wait('/rigging/'+r);const R=j.result||{};
await dl(R.rigged_character_glb_url,`meshy/${n}_rig.glb`);const B=R.basic_animations||{};await dl(B.walking_glb_url,`meshy/${n}_walking.glb`);await dl(B.running_glb_url,`meshy/${n}_running.glb`);console.log(n,'done');
