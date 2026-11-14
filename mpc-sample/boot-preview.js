// SPDX-License-Identifier: AGPL-3.0-only
// One-pass production boot preview; preserves source GIF timing.
(async()=>{
  const script=document.currentScript, base=new URL(script.dataset.bootBase||'./',location.href);
  const roots=[...document.querySelectorAll('[data-boot-preview]')];if(!roots.length)return;
  const m=await fetch(new URL('assets/boot/startup.json?v=miniatures-fit1',base)).then(r=>{if(!r.ok)throw Error('Boot preview');return r.json()});
  const image=new Image();image.src=new URL('assets/boot/'+m.src+'?v='+m.sha256.slice(0,12),base);await image.decode();
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),total=m.durations.reduce((a,b)=>a+b,0);
  for(const root of roots){
    const canvas=root.querySelector('canvas'),button=root.querySelector('button'),ctx=canvas.getContext('2d');
    canvas.width=m.width;canvas.height=m.height;
    let running=false,started=false,elapsed=0,last=0,frame=-1;
    function label(){button.textContent=running?'PAUSE BOOT ❚❚':elapsed>=total?'REPLAY BOOT ↻':'PLAY BOOT ▶';button.setAttribute('aria-pressed',String(running))}
    function draw(){let t=0,f=m.frames-1;for(let i=0;i<m.frames;i++){t+=m.durations[i];if(elapsed<t){f=i;break}}if(f===frame)return;frame=f;ctx.drawImage(image,(f%m.columns)*m.width,Math.floor(f/m.columns)*m.height,m.width,m.height,0,0,m.width,m.height);canvas.hidden=false;canvas.dataset.frame=String(f)}
    function tick(now){if(!running)return;if(last)elapsed+=Math.min(now-last,200);last=now;draw();if(elapsed>=total){running=false;label();return}requestAnimationFrame(tick)}
    function play(){started=true;running=true;last=0;label();requestAnimationFrame(tick)}
    button.addEventListener('click',()=>{if(running){running=false;label()}else{if(elapsed>=total)elapsed=0;play()}});
    reduced.addEventListener('change',e=>{if(e.matches){running=false;canvas.hidden=true;label()}});
    new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting&&!started&&!reduced.matches)play();else if(!e.isIntersecting&&running){running=false;label()}}},{threshold:.25}).observe(root);label();
  }
})().catch(()=>{document.querySelectorAll('[data-boot-preview] button').forEach(b=>{b.textContent='BOOT STILL';b.disabled=true})});
