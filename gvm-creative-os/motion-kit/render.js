#!/usr/bin/env node
// GVM motion kit renderer: renders a template from a JSON spec, frame by frame, into MP4.
// Usage: node render.js specs/<name>.json [--preview]
//   --preview  half resolution, 15 fps — a fast draft to check timing and layout.
// Output: out/<name>/<name>.mp4 (master), <name>_mobile.mp4 (small, plays on phones), poster.jpg, contact.jpg
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {execFileSync}=require('child_process');
const specPath=process.argv[2];const preview=process.argv.includes('--preview');
if(!specPath){console.error('usage: node render.js specs/<name>.json [--preview]');process.exit(1)}
const spec=JSON.parse(fs.readFileSync(specPath,'utf8'));
const name=spec.name||path.basename(specPath,'.json');
const scale=preview?.5:1,fps=preview?15:(spec.fps||30),dur=spec.duration||6.5;
const width=Math.round((spec.width||1280)*scale/2)*2,height=Math.round((spec.height||720)*scale/2)*2;
const params=Object.assign({},spec.params||{},{width,height,duration:dur});
const outDir=path.join(__dirname,'out',name+(preview?'_preview':''));const frames=path.join(outDir,'frames');
fs.rmSync(outDir,{recursive:true,force:true});fs.mkdirSync(frames,{recursive:true});
(async()=>{
 const browser=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
 const page=await browser.newPage({viewport:{width,height}});
 page.on('pageerror',e=>console.error('page error:',e.message));
 await page.addInitScript(p=>{window.GVM_PARAMS=p},params);
 await page.goto('file://'+path.join(__dirname,'templates',spec.template+'.html'));
 await page.waitForFunction(()=>window.ready&&window.render,null,{timeout:60000});await page.evaluate(()=>window.ready);
 const n=Math.round(dur*fps),t0=Date.now();
 for(let i=0;i<n;i++){await page.evaluate(t=>window.render(t),i/fps);await page.screenshot({path:path.join(frames,String(i).padStart(4,'0')+'.png')});
  if(i%30===0)process.stdout.write(`frame ${i}/${n}\n`)}
 await browser.close();
 const ff=(...a)=>execFileSync('ffmpeg',['-y','-loglevel','error',...a]);
 const master=path.join(outDir,name+'.mp4'),mobile=path.join(outDir,name+'_mobile.mp4');
 ff('-framerate',String(fps),'-i',path.join(frames,'%04d.png'),'-c:v','libx264','-crf','17','-preset','slow','-pix_fmt','yuv420p','-movflags','+faststart',master);
 const longSide=Math.max(width,height),mw=width>=height?Math.min(width,960):-2,mh=width>=height?-2:Math.min(height,960);
 ff('-i',master,'-vf',`scale=${mw}:${mh},hqdn3d=1.5:1.5:2:2`,'-c:v','libx264','-profile:v','main','-level','4.0','-b:v','2.5M','-maxrate','3M','-bufsize','5M','-pix_fmt','yuv420p','-movflags','+faststart','-an',mobile);
 ff('-ss',String(dur*.85),'-i',master,'-frames:v','1','-q:v','3',path.join(outDir,'poster.jpg'));
 ff('-i',master,'-vf',`fps=${4/dur},scale=${width>=height?480:270}:-2,tile=2x2`,'-frames:v','1','-q:v','4',path.join(outDir,'contact.jpg'));
 fs.rmSync(frames,{recursive:true,force:true});
 console.log(JSON.stringify({ok:true,master,mobile,poster:path.join(outDir,'poster.jpg'),contact:path.join(outDir,'contact.jpg'),frames:n,seconds:Math.round((Date.now()-t0)/1000)}));
})().catch(e=>{console.error(e);process.exit(1)});
