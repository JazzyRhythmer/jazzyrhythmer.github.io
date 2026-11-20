/* JR sampler evidence components. Encoded files retain their fixed matching gains. */
(() => {
  'use strict';
  const names = { dry: 'Dry', sp1200: 'SP1200', s950: 'S950', asr10: 'ASR10', mpc60: 'MPC60', mpc3000: 'MPC3000', squeeze: 'Compression', texture: 'Texture', wow: 'Motion', full: 'PATINA' };
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
      const levelNote = player.dataset.levelNote || 'fixed −23 LUFS integrated';
      const setStatus = message => { if (status) status.textContent = message; };
      let selected = buttons.find(button => button.getAttribute('aria-pressed') === 'true')?.dataset.audition || 'dry';
      if (!names[selected]) selected = 'dry';
      let generation = 0;
      let pending = null;
      let failed = false;
      const label = () => names[selected];
      const markButtons = () => buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.audition === selected)));
      markButtons();
      setStatus(`Ready · ${label()} · ${levelNote}`);
      const metadata = () => {
        const request = pending;
        if (!request || request.generation !== generation || audio.readyState < 1 || audio.currentSrc !== request.url) return;
        pending = null;
        const maximum = Number.isFinite(audio.duration) ? Math.max(0, audio.duration - 0.01) : request.position;
        try { audio.currentTime = Math.min(request.position, maximum); } catch (_) { /* Unseekable media starts at zero. */ }
        if (!request.resume) { setStatus(`Ready · ${label()} · ${levelNote}`); return; }
        const result = audio.play();
        if (result && typeof result.catch === 'function') result.catch(error => {
          if (request.generation !== generation) return;
          setStatus(error.name === 'NotAllowedError' ? `Ready · ${label()}. Press Play to continue.` : `Playback could not start · ${label()}. Press Play to retry.`);
        });
      };
      audio.addEventListener('loadedmetadata', metadata);
      audio.addEventListener('play', () => { document.querySelectorAll('[data-emul-player] audio').forEach(other=>{if(other!==audio&&!other.paused)other.pause();}); if (!pending) setStatus(`Playing · ${label()} · ${levelNote}`); });
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
        const url = new URL(`${player.dataset.audioPrefix || 'phrase'}-${key}.wav`, directory).href;
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

/* Measured detail views use a fixed, public asset allowlist. */
(() => {
 'use strict';
 const names={dry:'Dry',sp1200:'SP1200',s950:'S950',asr10:'ASR-10',mpc60:'MPC60',mpc3000:'MPC3000'};
 document.querySelectorAll('[data-detail-lab]').forEach(lab=>{
  let detailModel='sp1200',detailFrequency='difference';
  const detailBase=new URL(lab.dataset.detailBase||'../emul-detail/',document.baseURI);
  const setImage=(selector,file,alt)=>{const img=lab.querySelector(selector);if(img){img.src=new URL(file,detailBase).href;img.alt=alt;const mobile=img.closest('picture')?.querySelector('source');if(mobile)mobile.srcset=new URL(file.replace(/(\.[^.]+)$/,'-mobile$1'),detailBase).href;}};
  const updateFrequency=()=>{
   const difference=detailFrequency==='difference';
   setImage('[data-detail-spectrum]',`${detailFrequency}-${detailModel}.svg`,difference?`${names[detailModel]} minus Dry: measured spectral energy difference including natural output gain`:`Same-input-gain Amen Break spectrum: Dry and ${names[detailModel]} software output`);
   lab.querySelector('[data-detail-frequency-title]').textContent=difference?'What changes across the band.':'The texture between the peaks.';
   lab.querySelector('[data-detail-frequency-unit]').textContent=difference?'OUTPUT PSD DIFFERENCE / SAME INPUT':'FULL OUTPUT SPECTRUM';
   lab.querySelector('[data-detail-frequency-caption]').textContent=difference?'Frequency-by-frequency change with one shared input gain and no output normalization. Above zero means more energy than Dry; below zero means less. This includes the effect’s gain change. Weak-input bins are omitted; it is not an isolated filter transfer-function measurement.':'Detailed Welch spectra include the fine structure of the rendered output. The same 48 kHz / 24-bit pre-firmware Amen Break source is shown against Dry, with identical input gain and the engine’s output gain retained.';
  };
  lab.querySelectorAll('[data-detail-frequency]').forEach(button=>button.addEventListener('click',()=>{
   const key=button.dataset.detailFrequency;if(!['spectrum','difference'].includes(key))return;detailFrequency=key;
   lab.querySelectorAll('[data-detail-frequency]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateFrequency();
  }));
  lab.querySelectorAll('[data-detail-model]').forEach(button=>button.addEventListener('click',()=>{
   const key=button.dataset.detailModel;if(!Object.hasOwn(names,key))return;detailModel=key;
   lab.querySelectorAll('[data-detail-model]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   lab.querySelector('[data-detail-model-label]').textContent=names[key];
   setImage('[data-detail-spectrogram]',`spectrogram-${key}.png`,`${names[key]} software output: measured rising-sweep spectrogram`);
   updateFrequency();
   lab.querySelector('[data-detail-spectrogram-link]').href=new URL(`spectrogram-${key}.png`,detailBase).href;
  }));
  lab.querySelectorAll('[data-detail-clip]').forEach(button=>button.addEventListener('click',()=>{
   const key=button.dataset.detailClip;if(!['off','3','6','9'].includes(key))return;
   const label=key==='off'?'Off':`+${key} dB`;
   lab.querySelectorAll('[data-detail-clip]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   lab.querySelector('[data-detail-clip-label]').textContent=`SOFT CLIP ${label}`;
   setImage('[data-detail-clip-image]',`softclip-${key}.svg`,`Actual complete engine waveform and spectrum: SOFT CLIP ${label}, fixed level matching against Off`);
   lab.querySelector('[data-detail-clip-status]').textContent=`Showing production SOFT CLIP ${label}.`;
  }));
  lab.querySelectorAll('[data-detail-circuit]').forEach(button=>button.addEventListener('click',()=>{
   const key=button.dataset.detailCircuit;if(!['sp','s950','analog'].includes(key))return;
   lab.querySelectorAll('[data-detail-circuit]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   lab.querySelectorAll('[data-circuit-view]').forEach(view=>{view.hidden=view.dataset.circuitView!==key;});
   lab.querySelector('[data-circuit-status]').textContent=`Showing ${key==='sp'?'SP1200':key==='s950'?'S950':'ANALOG'} signal-path anatomy.`;
  }));
 });
})();
