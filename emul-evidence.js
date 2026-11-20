/* JR sampler evidence components. Encoded files retain their fixed matching gains. */
(() => {
  'use strict';
  const names = { dry: 'Dry', sp1200: 'SP1200', s950: 'S950', asr10: 'ASR10', mpc60: 'MPC60', mpc3000: 'MPC3000' };
  const roots = document.querySelectorAll('.emul-evidence');
  roots.forEach(root => {
    root.querySelectorAll('[data-emul-graph]').forEach(graph => {
      const buttons = [...graph.querySelectorAll('[data-graph-model]')];
      const paths = [...graph.querySelectorAll('[data-model-key]')];
      const status = graph.querySelector('[data-graph-status]');
      const select = key => {
        if (key !== 'all' && !paths.some(path => path.dataset.modelKey === key)) return;
        paths.forEach(path => { path.style.display = key === 'all' || path.dataset.modelKey === key ? '' : 'none'; });
        buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.graphModel === key)));
        if (status) status.textContent = key === 'all' ? 'Showing all five software models.' : `Showing ${key} software model.`;
      };
      buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.graphModel)));
      select(buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.graphModel || 'all');
    });
    root.querySelectorAll('[data-emul-player]').forEach(player => {
      const audio = player.querySelector('audio');
      if (!audio) return;
      const buttons = [...player.querySelectorAll('[data-audition]')];
      const status = player.querySelector('[data-audio-status]');
      const setStatus = message => { if (status) status.textContent = message; };
      let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.audition || 'dry';
      if (!names[selected]) selected = 'dry';
      let generation = 0;
      let pending = null;
      let failed = false;
      const label = () => names[selected];
      const markButtons = () => buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.audition === selected)));
      markButtons();
      setStatus(`Ready · ${label()} · fixed −23 LUFS integrated`);
      const metadata = () => {
        const request = pending;
        if (!request || request.generation !== generation || audio.readyState < 1 || audio.currentSrc !== request.url) return;
        pending = null;
        const maximum = Number.isFinite(audio.duration) ? Math.max(0, audio.duration - 0.01) : request.position;
        try { audio.currentTime = Math.min(request.position, maximum); } catch (_) { /* Unseekable media starts at zero. */ }
        if (!request.resume) { setStatus(`Ready · ${label()} · fixed −23 LUFS integrated`); return; }
        const result = audio.play();
        if (result && typeof result.catch === 'function') result.catch(error => {
          if (request.generation !== generation) return;
          setStatus(error.name === 'NotAllowedError' ? `Ready · ${label()}. Press Play to continue.` : `Playback could not start · ${label()}. Press Play to retry.`);
        });
      };
      audio.addEventListener('loadedmetadata', metadata);
      audio.addEventListener('play', () => { if (!pending) setStatus(`Playing · ${label()} · fixed −23 LUFS integrated`); });
      audio.addEventListener('pause', () => { if (!pending && !failed && !audio.ended) setStatus(`Paused · ${label()}`); });
      audio.addEventListener('ended', () => { if (!pending) setStatus(`Finished · ${label()}`); });
      audio.addEventListener('error', () => {
        if (!audio.error) return;
        pending = null; failed = true;
        setStatus(`Unable to load ${label()}. Check your connection and select the example again to retry.`);
      });
      buttons.forEach(button => button.addEventListener('click', () => {
        const key = button.dataset.audition;
        if (!names[key] || (key === selected && !failed)) return;
        const position = pending ? pending.position : (Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
        const resume = pending ? pending.resume : (!audio.paused && !audio.ended);
        const base = player.dataset.audioBase || '../emul-evidence/';
        const directory = new URL(base.endsWith('/') ? base : `${base}/`, document.baseURI);
        const url = new URL(`phrase-${key}.wav`, directory).href;
        selected = key; failed = false; generation += 1;
        pending = { position, resume, generation, url };
        markButtons(); setStatus(`Loading · ${label()}…`);
        audio.src = url;
        audio.load();
        if (audio.readyState >= 1) metadata();
      }));
    });
  });
  document.querySelectorAll('.emul-product .emul-routing, .emul-evidence .emul-routing').forEach(routing => {
    const buttons = [...routing.querySelectorAll('[data-route]')];
    const diagram = routing.querySelector('[data-routing-diagram]');
    const description = routing.querySelector('[data-route-description]');
    const select = mode => {
      if (!['serial', 'switch'].includes(mode)) return;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.route === mode)));
      if (diagram) diagram.dataset.mode = mode;
      if (description) description.textContent = mode === 'serial'
        ? 'Series overview: input passes through stage A, then stage B, then the output rack. This diagram does not change the audio examples.'
        : 'A/B switch overview: choose stage A or stage B before the output rack. This diagram does not change the audio examples.';
    };
    buttons.forEach(button => button.addEventListener('click', () => select(button.dataset.route)));
    select(buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.route || 'serial');
  });
})();
