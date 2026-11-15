// Walkthroughs load on request; native media controls keep sound explicit.
(()=>{const figures=[...document.querySelectorAll('.lesson-animation')];
function stop(f){const img=f.querySelector('img'),b=f.querySelector('.lesson-play');img.src=img.dataset.poster;b.setAttribute('aria-pressed','false');b.textContent='PLAY SCREEN WALKTHROUGH ▶'}
for(const f of figures)f.querySelector('.lesson-play').addEventListener('click',()=>{const b=f.querySelector('.lesson-play'),img=f.querySelector('img'),playing=b.getAttribute('aria-pressed')==='true';figures.forEach(stop);if(!playing){img.src=img.dataset.animation;b.setAttribute('aria-pressed','true');b.textContent='PAUSE SCREEN WALKTHROUGH ■'}});
const media=[...document.querySelectorAll('audio,video')];for(const m of media)m.addEventListener('play',()=>media.forEach(other=>{if(other!==m)other.pause()}));
const film=document.querySelector('.lesson-film');for(const b of document.querySelectorAll('[data-seek]'))b.addEventListener('click',()=>{film.currentTime=Number(b.dataset.seek);film.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});film.play().catch(()=>{})});
document.addEventListener('visibilitychange',()=>{if(document.hidden){figures.forEach(stop);media.forEach(m=>m.pause())}});
const motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',()=>figures.forEach(stop));
})();
