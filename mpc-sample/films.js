// Native controls, on-demand loading, and one sound source at a time.
const films=[...document.querySelectorAll('.product-film')];let startingFilm=false;
for(const film of films)film.addEventListener('play',()=>{startingFilm=true;document.dispatchEvent(new Event('rhythmer:explorer-play'));startingFilm=false;document.querySelectorAll('audio,video').forEach(other=>{if(other!==film)other.pause()})});
for(const event of ['rhythmer:explorer-play','rhythmer:showcase-play'])document.addEventListener(event,()=>{if(!startingFilm)films.forEach(film=>film.pause())});
document.addEventListener('visibilitychange',()=>{if(document.hidden)films.forEach(film=>film.pause())});
