(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  const reveals = document.querySelectorAll('.reveal');
  reveals.forEach((el) => io.observe(el));
  // Anything the reader has already passed (anchor jump, fast scroll) shows at once
  const revealPassed = () => reveals.forEach((el) => {
    if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < innerHeight) el.classList.add('is-in');
  });
  addEventListener('scroll', revealPassed, { passive: true });
  addEventListener('load', revealPassed);
  revealPassed();

  // Hablemos: the chosen occasion writes the WhatsApp message and the email
  const talkBtn = document.getElementById('talk-btn');
  const talkWa = document.getElementById('talk-wa');
  const setMail = () => {
    const choice = document.querySelector('input[name="ocasion"]:checked');
    const what = choice ? choice.value : 'algo especial';
    const subject = `Queremos celebrar ${what}`;
    const body = `Hola ONCE,\n\nQueremos celebrar ${what} y nos gustaría contarles nuestra historia.\n\n`;
    talkBtn.href = `mailto:hola@onceestudio.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (talkWa) talkWa.href = `https://wa.me/524461440254?text=${encodeURIComponent(`Hola ONCE, queremos celebrar ${what} y nos gustaría contarles nuestra historia.`)}`;
  };
  document.querySelectorAll('input[name="ocasion"]').forEach((r) => r.addEventListener('change', setMail));
  if (talkBtn) setMail();

  // Stacking process cards
  document.querySelectorAll('.step').forEach((s, i) => s.style.setProperty('--i', i));

  // Nav: color follows the section underneath
  const nav = document.getElementById('nav');
  const sections = [...document.querySelectorAll('[data-theme]')];
  const light = new Set(['bone']);
  const bg = { terracota: '#9E5F44', bone: '#F1E8E0', black: '#1d1f1f', olive: '#5E5D3E', ink: '#233747' };

  const heroArch = document.querySelector('.hero__arch');
  const root = document.documentElement;

  let ticking = false;
  function onScroll() {
    const y = scrollY;
    nav.classList.toggle('is-scrolled', y > 40);

    const probe = nav.offsetHeight / 2;
    const current = sections.find((s) => {
      const r = s.getBoundingClientRect();
      return r.top <= probe && r.bottom > probe;
    });
    nav.classList.toggle('is-light', !!current && light.has(current.dataset.theme));
    const ground = root.classList.contains('flow') ? getComputedStyle(document.body).backgroundColor : current && bg[current.dataset.theme];
    nav.style.background = current && y > 40 ? ground : 'transparent';

    if (!reduce) {
      // Hero photo slowly settles
      const vh = innerHeight;
      if (y < vh * 1.2) heroArch.style.setProperty('--zoom', (1.08 - Math.min(y / vh, 1) * 0.08).toFixed(3));
    }
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  // ---------- Motion layer: only with GSAP loaded and motion welcome ----------
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const runItems = document.querySelectorAll('.runsheet__list li');

  if (hasGsap && !reduce) {
    gsap.registerPlugin(ScrollTrigger);
    if (window.SplitText) gsap.registerPlugin(SplitText);

    // Smooth scroll, kept in step with ScrollTrigger
    if (window.Lenis) {
      const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -64 } });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // The ground turns from one brand colour to the next, like the pages of the brochure
    root.classList.add('flow');
    const colour = { terracota: '#9E5F44', bone: '#F1E8E0', olive: '#5E5D3E', ink: '#233747', black: '#1d1f1f' };
    const secs = [...document.querySelectorAll('main > section')];
    const mix = gsap.utils.interpolate;
    const flow = () => {
      const vh = innerHeight;
      let c = colour[secs[0].dataset.theme];
      for (let i = 1; i < secs.length; i++) {
        const p = Math.min(Math.max((vh * 0.8 - secs[i].getBoundingClientRect().top) / (vh * 0.45), 0), 1);
        if (p <= 0) break;
        c = mix(colour[secs[i - 1].dataset.theme], colour[secs[i].dataset.theme], p);
      }
      document.body.style.backgroundColor = c;
    };
    addEventListener('scroll', flow, { passive: true });
    addEventListener('resize', flow);
    flow();

    // Headings rise line by line, once
    document.fonts.ready.then(() => {
      if (window.SplitText) {
        document.querySelectorAll('.split').forEach((el) => {
          const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'split-line' });
          gsap.from(split.lines, {
            yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.09,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        });
      }
      ScrollTrigger.refresh();
    });

    // The day's run-of-show ticks itself off as you read it
    runItems.forEach((li) => ScrollTrigger.create({
      trigger: li, start: 'top 62%',
      onEnter: () => li.classList.add('is-done'),
      onLeaveBack: () => li.classList.remove('is-done'),
    }));

  } else {
    runItems.forEach((li) => li.classList.add('is-done'));
  }
})();
