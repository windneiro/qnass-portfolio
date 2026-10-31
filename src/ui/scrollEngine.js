// ScrollController: Tracks scroll progress, triggers 3D scene morphing, and transforms DOM elements

export class ScrollEngine {
  constructor(options = {}) {
    this.onScrollProgress = options.onScrollProgress || (() => {});
    this.onSectionChange = options.onSectionChange || (() => {});
    this.scrollProgress = 0;
    this.scrollY = 0;
    this.activeSection = '';

    this.hudScrollProgressEl = document.getElementById('scroll-progress-badge');
    this.navLinks = document.querySelectorAll('.nav-links a');
    this.sections = document.querySelectorAll('section[id]');
    this.metricElements = document.querySelectorAll('[data-count-target]');
    this.metricsTriggered = false;

    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    this.handleScroll();
  }

  handleScroll() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollY = window.scrollY;
    this.scrollProgress = totalHeight > 0 ? Math.max(0, Math.min(1, this.scrollY / totalHeight)) : 0;

    // Update HUD Progress Badge
    if (this.hudScrollProgressEl) {
      const pct = Math.round(this.scrollProgress * 100);
      this.hudScrollProgressEl.textContent = `[ PROGRESS: ${String(pct).padStart(2, '0')}% ]`;
    }

    // Pass progress to 3D scenes (Hero, Paper background, etc.)
    this.onScrollProgress(this.scrollProgress, this.scrollY);

    // Active Section Detection
    const scrollMiddle = this.scrollY + window.innerHeight * 0.45;
    let currentSectionId = '';

    this.sections.forEach((sec) => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollMiddle >= top && scrollMiddle < top + height) {
        currentSectionId = sec.id;
      }
    });

    if (currentSectionId && currentSectionId !== this.activeSection) {
      this.activeSection = currentSectionId;
      this.onSectionChange(this.activeSection);

      this.navLinks.forEach((link) => {
        const href = link.getAttribute('href');
        if (href === `#${currentSectionId}`) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    // Scroll-driven parallax on cards and images
    document.querySelectorAll('.interactive-card').forEach((card) => {
      const rect = card.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (inView) {
        const centerOffset = (rect.top + rect.height / 2 - window.innerHeight / 2) / (window.innerHeight / 2);
        const tiltX = centerOffset * 4.0;
        card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) translateY(${centerOffset * -8}px)`;
      }
    });

    // Animate metric counters when in view
    if (!this.metricsTriggered && this.metricElements.length > 0) {
      const firstMetric = this.metricElements[0];
      const rect = firstMetric.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        this.animateMetrics();
        this.metricsTriggered = true;
      }
    }
  }

  animateMetrics() {
    this.metricElements.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-count-target'));
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      let current = 0;
      const duration = 1500;
      const startTime = performance.now();

      const updateCount = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Ease out expo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        current = target * ease;

        el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        }
      };

      requestAnimationFrame(updateCount);
    });
  }
}
