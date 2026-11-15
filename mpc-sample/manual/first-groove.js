// Walkthroughs load on request; native media controls keep sound explicit.
(()=>{const figures=[...document.querySelectorAll('.lesson-animation')];
function stop(f){const img=f.querySelector('img'),b=f.querySelector('.lesson-play');img.src=img.dataset.poster;b.setAttribute('aria-pressed','false');b.textContent='PLAY SCREEN WALKTHROUGH ▶'}
for(const f of figures)f.querySelector('.lesson-play').addEventListener('click',()=>{const b=f.querySelector('.lesson-play'),img=f.querySelector('img'),playing=b.getAttribute('aria-pressed')==='true';figures.forEach(stop);if(!playing){img.src=img.dataset.animation;b.setAttribute('aria-pressed','true');b.textContent='PAUSE SCREEN WALKTHROUGH ■'}});
const media=[...document.querySelectorAll('audio,video')];for(const m of media)m.addEventListener('play',()=>media.forEach(other=>{if(other!==m)other.pause()}));
const film=document.querySelector('.lesson-film');let requestedSeek=null;const status=document.querySelector('#lesson-status');
function seekWhenReady(){if(film&&film.readyState>=1&&requestedSeek!==null){film.currentTime=requestedSeek;requestedSeek=null}}
film?.addEventListener('loadedmetadata',seekWhenReady);
for(const b of document.querySelectorAll('[data-seek]'))b.addEventListener('click',()=>{if(!film)return;requestedSeek=Number(b.dataset.seek);seekWhenReady();film.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'center'});film.focus({preventScroll:true});if(status)status.textContent='Opening this step in the film. Pause whenever you want to follow along.';film.play().catch(()=>{if(status)status.textContent='Press Play on the video to watch this step.'})});
if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(!entry.isIntersecting)stop(entry.target)});figures.forEach(f=>observer.observe(f))}
document.addEventListener('visibilitychange',()=>{if(document.hidden){figures.forEach(stop);media.forEach(m=>m.pause())}});
const motion=matchMedia('(prefers-reduced-motion: reduce)');motion.addEventListener('change',()=>figures.forEach(stop));
})();
