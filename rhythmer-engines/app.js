// Engine catalog, shared OS sound demos, and original filled 3D artwork.
// This page previews sounds; it does not execute the instrument's DSP.
(async () => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const list = $('#engine-list'), audio = $('#engine-audio'), engineSelect = $('#engine-select');
  const play = $('#preview-play'), motion = $('#preview-motion');
  const status = $('#preview-status'), canvas = $('#engine-animation');
  const context = canvas.getContext('2d'), still = $('#engine-screen');
  const visual = $('#engine-visual'), progress = $('#preview-progress');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  new ResizeObserver(entries => {
    document.documentElement.style.setProperty('--header-offset', Math.ceil(entries[0].target.getBoundingClientRect().height + 16) + 'px');
  }).observe($('.jr-site-header'));
  const cache = new Map();
  let demos = {}, motions = {}, selected, movie, revision = 0, visible = false;
  let motionPaused = reduced.matches, lastFrame = -1, idleTime = 0, lastTick = 0;
  audio.volume = Number($('#preview-volume').value);
  $('#preview-volume').addEventListener('input', event => { audio.volume = Number(event.target.value); });
  function playbackLabel() {
    play.textContent = !audio.paused ? 'PAUSE SOUND' : audio.ended ? 'REPLAY SOUND' : 'PLAY SOUND';
    play.setAttribute('aria-label', `${play.textContent.toLowerCase()} · ${selected?.name || 'engine'}`);
  }
  function motionLabel() {
    motion.textContent = motionPaused ? 'PLAY MOTION' : 'PAUSE MOTION';
    motion.setAttribute('aria-pressed', String(motionPaused));
  }
  async function start() {
    if (!selected || !demos[selected.name]) return;
    const current = revision;
    if (audio.ended) audio.currentTime = 0;
    try {
      await audio.play();
      if (current === revision) { status.textContent = `Playing ${selected.name}.`; playbackLabel(); }
    } catch (error) {
      if (current === revision && error.name !== 'AbortError') {
        status.textContent = error.name === 'NotAllowedError'
          ? 'Press PLAY SOUND to enable audio in this browser.'
          : 'The sound could not play. Press PLAY SOUND to retry.';
        playbackLabel();
      }
    }
  }
  play.addEventListener('click', () => {
    if (audio.paused) start();
    else { audio.pause(); status.textContent = 'Sound paused.'; }
  });
  audio.addEventListener('pause', () => { if (audio.currentTime > 0) idleTime = audio.currentTime; });
  for (const event of ['play', 'pause', 'ended']) audio.addEventListener(event, playbackLabel);
  audio.addEventListener('ended', () => { status.textContent = `${selected.name} preview finished. Choose another engine or replay.`; });
  audio.addEventListener('error', () => { if (audio.getAttribute('src')) status.textContent = 'This sound could not load. Choose another engine or retry.'; });
  motion.addEventListener('click', () => { motionPaused = !motionPaused; motionLabel(); });
  reduced.addEventListener('change', event => { motionPaused = event.matches; motionLabel(); });
  new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible && selected && !movie) loadMovie(selected.name, revision);
  }, { rootMargin: '80px' }).observe(visual);
  function draw() {
    if (!movie) return;
    const frameIndex = Math.floor((!audio.paused ? audio.currentTime : idleTime) * movie.fps) % movie.frames.length;
    if (frameIndex === lastFrame) return;
    lastFrame = frameIndex;
    const rect = visual.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    const width = Math.max(1, Math.round(rect.width * dpr)), height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
    context.setTransform(width / movie.width, 0, 0, height / movie.height, 0, 0);
    context.fillStyle = '#000'; context.fillRect(0, 0, movie.width, movie.height);
    context.lineWidth = 0.85;
    for (const face of movie.frames[frameIndex]) {
      context.beginPath(); context.moveTo(face[0], face[1]);
      for (let i = 2; i < 8; i += 2) context.lineTo(face[i], face[i + 1]);
      context.closePath();
      context.fillStyle = `rgba(255,255,255,${face[8]})`; context.fill();
      context.strokeStyle = `rgba(255,255,255,${face[9]})`; context.stroke();
    }
    canvas.hidden = false; still.hidden = true;
    canvas.dataset.frame = String(frameIndex);
  }
  function tick(now) {
    requestAnimationFrame(tick);
    const delta = Math.min((now - lastTick) / 1000 || 0, .1); lastTick = now;
    if (document.hidden || !visible) return;
    progress.value = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.currentTime / audio.duration : 0;
    if (!motionPaused) { idleTime += delta * .4; draw(); }
    else if (lastFrame < 0) draw();
  }
  new ResizeObserver(() => { lastFrame = -1; draw(); }).observe(visual);
  document.addEventListener('visibilitychange', () => { if (document.hidden && !audio.paused) { audio.pause(); status.textContent = 'Sound paused while this tab is hidden.'; } });
  window.addEventListener('pagehide', () => audio.pause());
  async function loadMovie(name, current) {
    const entry = motions[name];
    if (!entry) return;
    try {
      if (!cache.has(name)) {
        const pending = fetch(entry.src + '?v=original-3d-20261119').then(response => {
          if (!response.ok) throw Error('Animation unavailable');
          return response.json();
        });
        cache.set(name, pending);
        if (cache.size > 3) cache.delete(cache.keys().next().value);
      }
      const data = await cache.get(name);
      if (current !== revision) return;
      if (!data.frames?.length) throw Error('Empty animation');
      movie = data; motion.disabled = false; lastFrame = -1; draw();
    } catch (error) {
      cache.delete(name);
      if (current === revision) { movie = null; motion.disabled = true; motion.textContent = 'STILL PREVIEW'; }
    }
  }
  function show(engine, index, userInitiated = false) {
    const current = ++revision; engineSelect.value = String(index); selected = engine; movie = null; idleTime = 0; lastFrame = -1;
    audio.pause(); audio.removeAttribute('src'); audio.load(); progress.value = 0;
    for (const [i, button] of [...list.children].entries()) button.setAttribute('aria-pressed', String(i === index));
    $('#engine-name').textContent = engine.name;
    $('#engine-meta').textContent = index === 0 ? 'SIXTEEN-PAD DRUM INSTRUMENT' : 'SYNTH ENGINE';
    $('#engine-description').textContent = engine.description;
    still.src = engine.image; still.hidden = false; canvas.hidden = true;
    visual.setAttribute('aria-label', engine.name + ' original geometric animation');
    $('#program-count').textContent = engine.count + (index === 0 ? ' kits' : ' preset selections');
    $('#program-list').replaceChildren(...engine.programs.map(name => { const li = document.createElement('li'); li.textContent = name; return li; }));
    $('#engine-credit').textContent = engine.authors + ' / ' + engine.license;
    $('#engine-source').href = engine.source;
    motion.disabled = true; motionLabel();
    const demo = demos[engine.name]; play.disabled = !demo;
    $('#preview-preset').textContent = demo ? `DEMO PRESET · ${demo.preset} · ${demo.bpm} BPM` : 'Sound preview unavailable.';
    if (demo) { audio.src = demo.src + '?v=' + demo.sha256.slice(0, 12); status.textContent = 'Choose an engine or press PLAY SOUND to hear its preview.'; }
    else status.textContent = 'A sound preview is not available for this engine.';
    playbackLabel();
    if (visible || userInitiated) loadMovie(engine.name, current);
    // Only an explicit engine-button gesture starts sound, never initial page load.
    if (userInitiated && demo) start();
  }
  try {
    const response = await fetch('engines.json?v=mac-20261119');
    if (!response.ok) throw Error('Catalog unavailable');
    const engines = await response.json();
    const optional = await Promise.allSettled([
      fetch('../mpc-sample/demos.json?v=loudness-match1').then(r => { if (!r.ok) throw Error(); return r.json(); }).then(data => Object.fromEntries(Object.entries(data).map(([name, demo]) => [name, { ...demo, src: new URL(demo.src, new URL('../mpc-sample/', location.href)).href }]))),
      fetch('motion.json?v=mac-preview-20261119').then(r => { if (!r.ok) throw Error(); return r.json(); })
    ]);
    if (optional[0].status === 'fulfilled') demos = optional[0].value;
    if (optional[1].status === 'fulfilled') motions = optional[1].value;
    engineSelect.addEventListener('change', () => { const index = Number(engineSelect.value); show(engines[index], index, true); });
    engines.forEach((engine, index) => {
      const option = document.createElement('option'); option.value = String(index); option.textContent = engine.name; engineSelect.append(option);
      const button = document.createElement('button'); button.type = 'button'; button.textContent = engine.name;
      button.setAttribute('aria-pressed', String(index === 0)); button.addEventListener('click', () => show(engine, index, true)); list.append(button);
      const row = document.createElement('article'); row.className = 'credit-row';
      const name = document.createElement('h3'); name.textContent = engine.name;
      const info = document.createElement('p'); info.textContent = engine.authors + ' · ' + engine.license;
      const link = document.createElement('a'); link.href = engine.source; link.textContent = 'Original project';
      row.append(name, info, link); $('#credits-list').append(row);
    });
    show(engines[0], 0); motionLabel(); requestAnimationFrame(tick);
  } catch (error) { list.textContent = 'The engine list could not load. Refresh the page to try again.'; }
})();
