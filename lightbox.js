/* ── Lightbox ──────────────────────────────────────────── */
(function () {
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    .lb-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.88);
      z-index: 9999;
      align-items: center;
      justify-content: center;
      cursor: zoom-out;
      backdrop-filter: blur(6px);
    }
    .lb-overlay.active { display: flex; }
    .lb-img-wrap {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      cursor: default;
    }
    .lb-overlay img {
      display: block;
      max-width: 90vw;
      max-height: 90vh;
      border-radius: 10px;
      box-shadow: 0 24px 80px rgba(0,0,0,0.6);
      object-fit: contain;
    }
    .lb-close {
      position: fixed;
      top: 20px;
      right: 24px;
      color: #fff;
      font-size: 2.2rem;
      line-height: 1;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0;
      opacity: 0.8;
      transition: opacity 0.2s;
      z-index: 10000;
    }
    .lb-close:hover { opacity: 1; }
    .lb-prev, .lb-next {
      position: fixed;
      top: 50%;
      transform: translateY(-50%);
      color: #fff;
      font-size: 2.5rem;
      line-height: 1;
      cursor: pointer;
      background: none;
      border: none;
      padding: 0 16px;
      opacity: 0.7;
      transition: opacity 0.2s;
      z-index: 10000;
      user-select: none;
    }
    .lb-prev { left: 12px; }
    .lb-next { right: 12px; }
    .lb-prev:hover, .lb-next:hover { opacity: 1; }

    /* Clickable wrappers */
    .gallery-item,
    .unit-img,
    .apt-img-wrap,
    .gallery-main,
    .gallery-thumb { cursor: zoom-in; }

    /* Let overlay pass clicks through to the gallery-item */
    .gallery-overlay { pointer-events: none; }
  `;
  document.head.appendChild(style);

  // Inject HTML
  const overlay = document.createElement('div');
  overlay.className = 'lb-overlay';
  overlay.innerHTML = `
    <button class="lb-close" aria-label="Close">&#x2715;</button>
    <button class="lb-prev" aria-label="Previous">&#x2039;</button>
    <div class="lb-img-wrap"><img src="" alt="" /></div>
    <button class="lb-next" aria-label="Next">&#x203a;</button>
  `;
  document.body.appendChild(overlay);

  const lbImg = overlay.querySelector('img');
  const closeBtn = overlay.querySelector('.lb-close');
  const prevBtn = overlay.querySelector('.lb-prev');
  const nextBtn = overlay.querySelector('.lb-next');

  // Active group state
  let activeGroup = [];
  let current = 0;

  function open(group, idx) {
    activeGroup = group;
    current = idx;
    lbImg.src = activeGroup[current].src;
    lbImg.alt = activeGroup[current].alt;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    prevBtn.style.display = activeGroup.length > 1 ? '' : 'none';
    nextBtn.style.display = activeGroup.length > 1 ? '' : 'none';
  }

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function prev() { open(activeGroup, (current - 1 + activeGroup.length) % activeGroup.length); }
  function next() { open(activeGroup, (current + 1) % activeGroup.length); }

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', e => { e.stopPropagation(); prev(); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); next(); });
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  document.addEventListener('keydown', e => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  function buildGroup(wrappers) {
    return wrappers.map(wrap => {
      const img = wrap.querySelector('img');
      return {
        src: img.src.replace(/w=\d+/, 'w=1600'),
        alt: img.alt
      };
    });
  }

  function attachGroup(selector) {
    const wrappers = Array.from(document.querySelectorAll(selector))
      .filter(el => el.querySelector('img'));
    if (!wrappers.length) return;

    const group = buildGroup(wrappers);

    wrappers.forEach((wrap, idx) => {
      wrap.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        open(group, idx);
      });
    });
  }

  function init() {
    // Each selector is its own independent photo group
    attachGroup('.gallery-item');       // index.html — photo gallery section
    attachGroup('.unit-img');           // units.html — unit listing photos
    attachGroup('.apt-img-wrap');       // index.html — apartment cards
    attachGroup('.gallery-main, .gallery-thumb'); // unit detail pages — combined as one set
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
