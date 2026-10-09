import gsap from 'gsap';

/** Native horizontal gallery, with vertical-wheel input mapped onto the rail. */
export function createCaseGallery(dialog, { onClose, isBusy, reducedMotion }) {
  const rail = dialog.querySelector('.case-gallery');
  const progress = dialog.querySelector('.case-progress-fill');
  const intro = dialog.querySelector('.case-header');
  let introMotion = null;
  const events = new AbortController();
  let tween = null;
  let target = 0;
  let slides = [];
  const limit = () => Math.max(0, dialog.scrollWidth - dialog.clientWidth);
  function update() {
    const fraction = dialog.scrollLeft / Math.max(1, limit());
    progress.style.transform = `scaleX(${fraction})`;
    // Each intro element has its own scrubbed fade/movement duration.
    // Its fixed parent prevents native horizontal scrolling moving the CTA.
    introMotion?.time(dialog.scrollLeft / Math.max(1, dialog.clientWidth));
    intro.inert = dialog.scrollLeft > dialog.clientWidth * .92;
  }
  function buildIntroMotion() {
    introMotion?.kill();
    const width = dialog.clientWidth || window.innerWidth;
    const distance = reducedMotion.matches ? 0 : width;
    const title = intro.querySelector('h1');
    const paragraphs = intro.querySelectorAll('.case-story p');
    const facts = intro.querySelector('.case-facts');
    const launch = intro.querySelector('.case-project-link');
    gsap.set([title, ...paragraphs, facts, launch], { clearProps: 'transform,opacity' });
    introMotion = gsap.timeline({ paused: true, defaults: { ease: 'none' } })
      .to(title, { x: -distance * .26, opacity: 0, duration: .58 }, 0)
      .to(paragraphs, { x: -distance * .065, opacity: 0, duration: .72, stagger: .06 }, 0)
      .to(facts, { x: -distance * .035, opacity: 0, duration: .88 }, 0)
      .to(launch, { opacity: 0, duration: .42 }, 0);
    update();
  }
  function stop() { tween?.kill(); tween = null; target = dialog.scrollLeft; }
  function move(value) {
    const toEnd = value >= limit();
    target = Math.max(0, Math.min(limit(), value));
    tween?.kill();
    tween = gsap.to(dialog, { scrollLeft: target, duration: reducedMotion.matches ? 0 : .45, ease: 'power2.out', onComplete: () => {
      if (toEnd) dialog.scrollLeft = limit();
      tween = null;
      update();
    } });
  }
  function step(direction) {
    const x = dialog.scrollLeft;
    const points = slides.map((slide, index) => index === 0 ? 0 : Math.max(0, Math.min(limit(), slide.getBoundingClientRect().left + x - (dialog.clientWidth - slide.offsetWidth) / 2)));
    move(direction > 0 ? points.find(point => point > x + 8) ?? limit() : points.reverse().find(point => point < x - 8) ?? 0);
  }
  dialog.addEventListener('wheel', event => {
    if (event.ctrlKey || isBusy() || event.target.closest('.case-palette, [data-hero-nav]')) return;
    event.preventDefault();
    const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? dialog.clientWidth : 1);
    if (dialog.scrollLeft <= 1 && !tween && delta < -18) { onClose(); return; }
    move((tween ? target : dialog.scrollLeft) + delta);
  }, { passive: false, signal: events.signal });
  dialog.addEventListener('keydown', event => {
    if (isBusy() || event.target.closest('a, input, textarea, select, .case-palette, [data-hero-nav]')) return;
    if (['ArrowRight', 'ArrowDown', 'PageDown', 'ArrowLeft', 'ArrowUp', 'PageUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      if (event.key === 'Home') move(0);
      else if (event.key === 'End') move(limit());
      else step(['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1);
    }
  }, { signal: events.signal });
  dialog.addEventListener('pointerdown', stop, { signal: events.signal });
  dialog.addEventListener('scroll', update, { passive: true, signal: events.signal });
  window.addEventListener('resize', buildIntroMotion, { signal: events.signal });
  return {
    populate(project, cover, nextProject, nextCover) {
      stop();
      rail.replaceChildren();
      const seen = new Set([cover.src]);
      // Alternate a pair of portrait screens with a landscape composition.
      const portraits = project.media === 'device' ? [...project.shots] : [];
      const landscapes = (project.media === 'device' ? [...(project.extra || [])] : [...project.shots, ...(project.extra || [])]).filter(shot => shot.src !== cover.src);
      const ordered = [];
      while (landscapes.length || portraits.length) {
        if (portraits.length) ordered.push(...portraits.splice(0, 2).map(shot => ({ ...shot, orientation: 'portrait' })));
        if (landscapes.length) ordered.push({ ...landscapes.shift(), orientation: 'landscape' });
      }
      ordered.forEach(shot => {
        if (seen.has(shot.src)) return;
        seen.add(shot.src);
        const figure = document.createElement('figure');
        figure.className = `case-slide case-slide--${shot.orientation}`;
        const image = document.createElement('img');
        image.src = shot.src;
        image.alt = `${project.name} — ${shot.caption}`;
        image.loading = 'lazy';
        image.decoding = 'async';
        image.draggable = false;
        // Authored grouping gives stable loading sizes; natural dimensions
        // also support portrait assets in future browser projects.
        image.addEventListener('load', () => {
          figure.style.setProperty('--image-ratio', String(image.naturalWidth / image.naturalHeight));
          figure.classList.toggle('case-slide--portrait', image.naturalHeight > image.naturalWidth);
          figure.classList.toggle('case-slide--landscape', image.naturalHeight <= image.naturalWidth);
          update();
        }, { once: true });
        const caption = document.createElement('figcaption');
        caption.textContent = shot.caption;
        figure.append(image, caption);
        rail.append(figure);
      });
      const link = dialog.querySelector('.case-project-link');
      link.hidden = !project.link;
      if (project.link) { link.href = project.link.href; link.textContent = 'Launch project ↗'; }
      else link.removeAttribute('href');
      const services = dialog.querySelector('.case-services');
      services.replaceChildren(...project.discipline.map(service => {
        const item = document.createElement('li'); item.textContent = service; return item;
      }));
      const links = dialog.querySelector('.case-links');
      links.hidden = !project.link;
      if (project.link) {
        const site = links.querySelector('a'); site.href = project.link.href; site.textContent = project.link.label;
      }
      const end = dialog.querySelector('.case-end');
      end.querySelector('.case-next-title').textContent = nextProject.name;
      end.querySelector('.case-next-project').setAttribute('aria-label', `Next project: ${nextProject.name}`);
      end.querySelector('.case-next-preview').src = nextCover.src;
      end.querySelector('.case-next-preview').alt = '';
      slides = [dialog.querySelector('.case-stage'), dialog.querySelector('.case-hero'), ...rail.children, dialog.querySelector('.case-end')];
      dialog.scrollLeft = 0;
      buildIntroMotion();
    },
    reset() { stop(); dialog.scrollLeft = 0; update(); },
    refresh: buildIntroMotion,
    dispose() { stop(); introMotion?.kill(); events.abort(); },
  };
}
