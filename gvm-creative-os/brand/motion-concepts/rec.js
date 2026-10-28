// Deterministic capture: render(t) per frame → PNG → ffmpeg.
const {chromium}=require('playwright');const fs=require('fs');const {execSync}=require('child_process');
const [,,name,dur='6.5',fps='30']=process.argv;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files']});
const p=await b.newPage({viewport:{width:1280,height:720}});p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('file://'+process.cwd()+'/'+name+'.html');await p.waitForFunction(()=>window.ready&&window.render,null,{timeout:30000});await p.evaluate(()=>window.ready);
const dir='f_'+name;fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir);const n=Math.round(dur*fps);
for(let i=0;i<n;i++){await p.evaluate(t=>window.render(t),i/fps);await p.screenshot({path:`${dir}/${String(i).padStart(4,'0')}.png`})}
await b.close();
execSync(`ffmpeg -y -loglevel error -framerate ${fps} -i ${dir}/%04d.png -c:v libx264 -pix_fmt yuv420p -crf 20 -movflags +faststart ${name}.mp4`);
execSync(`ffmpeg -y -loglevel error -i ${name}.mp4 -vf "fps=15,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer" ${name}.gif`);
console.log('ok',name,n)})();
