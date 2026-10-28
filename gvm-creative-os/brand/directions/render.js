const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:880}});
await p.goto('file://'+process.cwd()+'/boards.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(2500);
// re-run canvas after fonts/layout
for(let i=1;i<=8;i++){const el=await p.$('#b'+i);await el.screenshot({path:`board-0${i}.png`});}
const over=await p.evaluate(()=>[...document.querySelectorAll('.board')].map(b=>{const r=b.getBoundingClientRect();let bad=[];b.querySelectorAll('.side,.web,.head p').forEach(e=>{if(e.scrollHeight>e.clientHeight+2)bad.push(e.className||e.tagName)});const s=b.querySelector('.side').getBoundingClientRect();return b.id+' side bottom '+Math.round(s.bottom-r.top)+' overflow:'+bad.join(',')}));console.log(over.join('\n'));
await p.pdf({path:'GVM_style_lookbook.pdf',width:'1600px',height:'880px',printBackground:true});await b.close()})();
