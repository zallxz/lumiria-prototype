// node render.js <glb> <outPrefix> [frames] [size]  -> sheet of 4 dirs walking
const path=require('path'),fs=require('fs');
const PW=__dirname;const {chromium}=require('playwright-core');
const [glb,out,frames='8',size='256']=process.argv.slice(2);
const html=`<!doctype html><script type=importmap>{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<script type=module>
import * as THREE from 'three';import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
window.go=async(url,F,S,pitch)=>{
 const r=new THREE.WebGLRenderer({alpha:true,preserveDrawingBuffer:true,antialias:true});r.setSize(S,S);r.setClearColor(0,0);r.outputColorSpace=THREE.SRGBColorSpace;document.body.append(r.domElement);
 const sc=new THREE.Scene();sc.add(new THREE.HemisphereLight(0xfff4e4,0x9a8678,+(new URLSearchParams(location.search).get('h')||1.25)));const d=new THREE.DirectionalLight(0xffe9c8,+(new URLSearchParams(location.search).get('d')||1.5));d.position.set(-2,4,3);sc.add(d);
 const g=await new GLTFLoader().loadAsync(url);const m=g.scene;m.traverse(o=>{if(o.isMesh){const a=o.material;o.frustumCulled=false;if(new URLSearchParams(location.search).get('flat'))o.material=new THREE.MeshLambertMaterial({map:a.map||null,color:a.map?0xffffff:a.color})}});sc.add(m);
 const mix=g.animations[0]?new THREE.AnimationMixer(m):null;const clip=g.animations[0];if(mix){const ac=mix.clipAction(clip);ac.setEffectiveWeight(+(new URLSearchParams(location.search).get('w')||1));ac.play()}
 const box=new THREE.Box3().setFromObject(m);let c=box.getCenter(new THREE.Vector3()),s=box.getSize(new THREE.Vector3());let h=Math.max(s.x,s.y,s.z)*.62;const FX=new URLSearchParams(location.search).get('fix');if(FX){h=+FX;c=new THREE.Vector3(0,.85,0);window.__box=[box.min.toArray(),box.max.toArray()]}
 const cam=new THREE.OrthographicCamera(-h,h,h,-h,.01,100);const p=pitch*Math.PI/180;cam.position.set(c.x,c.y+Math.sin(p)*10,c.z+Math.cos(p)*10);cam.lookAt(c);
 const cv=document.createElement('canvas');const dirs=[0,180,-90,90];cv.width=S*F;cv.height=S*dirs.length;const x=cv.getContext('2d');
 const T=clip?clip.duration:1;
 dirs.forEach((y,row)=>{m.rotation.y=y*Math.PI/180;for(let f=0;f<F;f++){if(mix)mix.setTime(T*f/F);m.updateMatrixWorld(true);r.render(sc,cam);x.drawImage(r.domElement,f*S,row*S)}});
 return cv.toDataURL('image/png')};
window.ready=1</script>`;
(async()=>{const b=await chromium.launch({channel:process.env.CHROME_CHANNEL||'chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage();p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()=='error')console.log(m.text())});
await p.route('http://r.local/**',r=>{const u=new URL(r.request().url()).pathname;
 if(u=='/')return r.fulfill({contentType:'text/html',body:html});
 if(u.startsWith('/three/'))return r.fulfill({path:path.join(PW,'node_modules',u),contentType:'text/javascript'});
 if(u=='/m.glb')return r.fulfill({path:glb,contentType:'model/gltf-binary'});r.fulfill({status:404})});
await p.goto('http://r.local/?'+(process.env.Q||''));await p.waitForFunction('window.ready');
const pit=+(process.env.PITCH||38);const d=await p.evaluate(([F,S,P])=>go('/m.glb',F,S,P),[+frames,+size,pit]);
fs.writeFileSync(out,Buffer.from(d.split(',')[1],'base64'));await b.close();console.log('ok',out)})().catch(e=>{console.error(e);process.exit(1)});
