export class CyberCursor {
  constructor() {
    this.cursor = document.getElementById('cyber-cursor');
    this.follower = document.getElementById('cyber-cursor-follower');
    this.coordsEl = document.getElementById('cursor-coords');
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    if (!this.cursor) return;
    this.init();
  }

  init() {
    window.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
      if (this.coordsEl) {
        this.coordsEl.textContent = `[X:${String(e.clientX).padStart(4, '0')} Y:${String(e.clientY).padStart(4, '0')}]`;
      }
    });

    // Hover detection
    const interactables = 'button, a, input, .interactive-card, .mode-btn, .color-dot, canvas';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactables)) {
        this.follower.classList.add('cursor-hover');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactables)) {
        this.follower.classList.remove('cursor-hover');
      }
    });

    document.addEventListener('mousedown', () => {
      this.follower.classList.add('cursor-active');
    });

    document.addEventListener('mouseup', () => {
      this.follower.classList.remove('cursor-active');
    });

    this.render();
  }

  render() {
    // Fast update for exact cursor
    this.cursor.style.transform = `translate3d(${this.target.x}px, ${this.target.y}px, 0)`;

    // Smooth lerp for trailing reticle
    this.pos.x += (this.target.x - this.pos.x) * 0.15;
    this.pos.y += (this.target.y - this.pos.y) * 0.15;
    this.follower.style.transform = `translate3d(${this.pos.x}px, ${this.pos.y}px, 0)`;

    requestAnimationFrame(() => this.render());
  }
}
