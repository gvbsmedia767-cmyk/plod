#!/usr/bin/env node
// GVM compositor: live footage clips + an overlay template (transparent PNG sequence) + voice/music mix → finished MP4.
// Usage: node compose.js jobs/<name>.json [--preview]
// Job: {name, fps, width, height, tail (s of extra time after clips, e.g. end card), clips:[path...], grade:{warm,vignette,push},
//       music:{path, start, gainDb}, overlay:{template, params}}  (paths relative to the job file)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');const {execFileSync}=require('child_process');
const jobPath=path.resolve(process.argv[2]);const preview=process.argv.includes('--preview');const job=JSON.parse(fs.readFileSync(jobPath,'utf8'));const base=path.dirname(jobPath);
const fps=job.fps||25,W=job.width||1080,H=job.height||1920,rel=p=>path.resolve(base,p);
const out=path.join(__dirname,'out',job.name+(preview?'_preview':''));fs.rmSync(out,{recursive:true,force:true});const fr=path.join(out,'ov');fs.mkdirSync(fr,{recursive:true});
const ff=(...a)=>execFileSync('ffmpeg',['-y','-loglevel','error',...a]);
const dur=c=>parseFloat(execFileSync('ffprobe',['-v','error','-show_entries','format=duration','-of','csv=p=0',c]).toString());
(async()=>{
 const clips=job.clips.map(rel),lens=clips.map(dur),total=lens.reduce((a,b)=>a+b,0)+(job.tail||0),n=Math.round(total*fps);
 // 1) overlay frames with alpha
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H}});p.on('pageerror',e=>console.error('page error:',e.message));
 await p.addInitScript(x=>{window.GVM_PARAMS=x},Object.assign({width:W,height:H},job.overlay.params));
 await p.goto('file://'+path.join(__dirname,'templates',job.overlay.template+'.html'));await p.waitForFunction(()=>window.ready&&window.render);await p.evaluate(()=>window.ready);
 const step=preview?3:1;
 for(let i=0;i<n;i+=step){await p.evaluate(t=>window.render(t),i/fps);await p.screenshot({path:path.join(fr,String(i/step|0).padStart(5,'0')+'.png'),omitBackground:true})}
 await b.close();
 // 2) picture: concat clips, warm grade, gentle push-in, pad the tail, overlay
 const g=job.grade||{},inputs=[];clips.forEach(c=>inputs.push('-i',c));
 const parts=clips.map((c,i)=>`[${i}:v]setpts=PTS-STARTPTS,fps=${fps},scale=${Math.round(W*1.06/2)*2}:-2,crop=${W}:${H}:(iw-${W})/2*(1-t/${lens[i].toFixed(3)})+0:(ih-${H})/2,setsar=1[v${i}];[${i}:a]asetpts=PTS-STARTPTS,aresample=48000[a${i}]`).join(';');
 const cat=clips.map((c,i)=>`[v${i}][a${i}]`).join('')+`concat=n=${clips.length}:v=1:a=1[cv][ca]`;
 const warm=g.warm??.05;
 const vchain=`[cv]colorbalance=rs=${warm}:gs=${warm/3}:bs=${-warm}:rm=${warm/2}:bm=${-warm/2},eq=saturation=1.06:contrast=1.03,vignette=PI/${g.vignette||5},tpad=stop_mode=clone:stop=${Math.round((job.tail||0)*fps)}[gv]`;
 let mix=`[ca]highpass=f=80,acompressor=threshold=-24dB:ratio=3:attack=10:release=200,loudnorm=I=-16:TP=-1.5:LRA=7,apad=pad_dur=${job.tail||0}[voice]`;
 let amap='[voice]';
 if(job.music){inputs.push('-ss',String(job.music.start||0),'-i',rel(job.music.path));const mi=clips.length;
  mix+=`;[${mi}:a]aresample=48000,volume=${job.music.gainDb||-20}dB,atrim=0:${total.toFixed(3)},afade=t=in:d=1.2,afade=t=out:st=${(total-2).toFixed(3)}:d=2[mus];[voice]asplit=2[vk][vm];[mus][vk]sidechaincompress=threshold=0.04:ratio=6:attack=20:release=400[duck];[vm][duck]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1:LRA=9[mixa]`;amap='[mixa]'}
 // pass 1: graded base picture + mixed audio (one filtergraph); pass 2: overlay on top.
 // (Overlaying inside the same graph as concat+tpad truncated the tail in ffmpeg 6.1, so the passes are split.)
 const base=path.join(out,'base.mp4');
 const fc=`${parts};${cat};${vchain};${mix}`;
 fs.writeFileSync(path.join(out,'filter.txt'),fc);
 ff(...inputs,'-filter_complex',fc,'-map','[gv]','-map',amap,'-t',total.toFixed(3),'-c:v','libx264','-crf','14','-preset',preview?'veryfast':'medium','-c:a','pcm_s16le','-f','mov',base);
 const master=path.join(out,job.name+'.mp4');
 ff('-i',base,'-framerate',String(fps/step),'-i',path.join(fr,'%05d.png'),'-filter_complex',`[1:v]fps=${fps},format=rgba[ov];[0:v][ov]overlay=0:0:eof_action=repeat,format=yuv420p[outv]`,'-map','[outv]','-map','0:a','-t',total.toFixed(3),'-c:v','libx264','-crf',preview?'26':'17','-preset',preview?'veryfast':'slow','-c:a','aac','-b:a','192k','-movflags','+faststart',master);
 fs.rmSync(base,{force:true});
 const mobile=path.join(out,job.name+'_mobile.mp4');
 ff('-i',master,'-vf',`scale=${W>=H?-2:720}:${W>=H?720:-2}`,'-c:v','libx264','-profile:v','main','-level','4.0','-b:v','1.3M','-maxrate','1.6M','-bufsize','3M','-c:a','aac','-b:a','96k','-movflags','+faststart',mobile);
 ff('-i',master,'-vf',`fps=8/${total.toFixed(2)},scale=270:-2,tile=4x2`,'-frames:v','1','-q:v','4',path.join(out,'contact.jpg'));
 if(!process.env.KEEP)fs.rmSync(fr,{recursive:true,force:true});
 console.log(JSON.stringify({ok:true,master,mobile,contact:path.join(out,'contact.jpg'),seconds:+total.toFixed(2)}));
})().catch(e=>{console.error(e.stderr?e.stderr.toString():e);process.exit(1)});
