(() => {
  'use strict';
  const config = window.JR_SITE || {};
  const connect = (id, value) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return false;
      const link = document.getElementById(id);
      if (!link) return false;
      link.href = url.href;
      link.hidden = false;
      return true;
    } catch { return false; }
  };
  if (connect('newsletter-link', config.newsletterUrl)) {
    const pending = document.getElementById('newsletter-pending');
    if (pending) pending.hidden = true;
  }
  connect('support-link', config.supportUrl);
  connect('shop-link', config.shopUrl);
  document.querySelectorAll('[data-product]').forEach(link => {
    const value = (config.productUrls || {})[link.dataset.product];
    if (!value) return;
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.username || url.password) return;
      link.href = url.href;
      link.hidden = false;
    } catch { /* Keep unconfigured product destinations hidden. */ }
  });
  document.getElementById('year').textContent = new Date().getFullYear();

  const productNames = {
    'jr-acid': 'JR ACID', 'jr-fx': 'JR FX', 'jr-trek': 'JR TREK',
    'jr-rytm': 'JR RYTM', 'jr-play': 'JR PLAY',
    'jr-smpl': 'JR SMPL', 'jr-draw': 'JR DRAW'
  };
  const product = new URLSearchParams(location.search).get('product');
  const signupContext = document.getElementById('signup-context');
  if (signupContext && Object.hasOwn(productNames, product)) {
    signupContext.textContent = `${productNames[product]} / EXPECTED 2027`;
    signupContext.hidden = false;
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const firmwareToggle = document.querySelector('.firmware-motion-toggle');
  if (firmwareToggle) {
    const previews = document.querySelectorAll('.firmware-display source');
    const syncPreviews = playing => {
      previews.forEach(source => { source.media = playing ? 'all' : 'not all'; });
      firmwareToggle.textContent = playing ? 'Pause previews' : 'Play previews';
    };
    let playing = !reducedMotion.matches;
    firmwareToggle.addEventListener('click', () => {
      playing = !playing;
      syncPreviews(playing);
    });
    reducedMotion.addEventListener('change', event => {
      playing = !event.matches;
      syncPreviews(playing);
    });
    syncPreviews(playing);
    firmwareToggle.hidden = false;
  }

  const canvas = document.getElementById('dot-field');
  if (!canvas) return;
  const context = canvas.getContext('2d');
  const toggle = document.getElementById('motion-toggle');
  let paused = reducedMotion.matches;
  let frame = 0;
  let time = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  const draw = () => {
    context.clearRect(0, 0, width, height);
    const spacing = width < 600 ? 10 : 12;
    for (let x = 6; x < width; x += spacing) {
      const nx = x / width;
      const envelope = Math.pow(Math.sin(nx * Math.PI), 0.65);
      const wave = Math.sin(nx * 17 - time) * 0.46 + Math.sin(nx * 31 + time * 0.7) * 0.24;
      const center = height * 0.52 + wave * height * 0.19 * envelope;
      const spread = (0.12 + Math.abs(Math.sin(nx * 9 + time * 0.5)) * 0.28) * height * envelope;
      for (let y = 42; y < height - 30; y += spacing) {
        const distance = Math.abs(y - center);
        const intensity = Math.max(0, 1 - distance / Math.max(1, spread));
        context.fillStyle = `rgba(238,238,238,${0.045 + intensity * 0.82})`;
        const size = intensity > 0.55 ? 2.1 : 1.3;
        context.beginPath();
        context.arc(x, y, size, 0, Math.PI * 2);
        context.fill();
      }
    }
  };
  const animate = stamp => {
    if (paused || document.hidden) { frame = 0; return; }
    if (stamp - last > 40) {
      time += Math.min(stamp - last, 80) * 0.00028;
      last = stamp;
      draw();
    }
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    toggle.setAttribute('aria-pressed', String(paused));
    toggle.setAttribute('aria-label', paused ? 'Play dot animation' : 'Pause dot animation');
    toggle.textContent = paused ? 'PLAY ▷' : 'PAUSE Ⅱ';
    if (!paused && !frame && !document.hidden) frame = requestAnimationFrame(animate);
  };
  new ResizeObserver(() => {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }).observe(canvas);
  toggle.addEventListener('click', () => { paused = !paused; sync(); });
  reducedMotion.addEventListener('change', event => { paused = event.matches; sync(); });
  document.addEventListener('visibilitychange', sync);
  sync();
})();
