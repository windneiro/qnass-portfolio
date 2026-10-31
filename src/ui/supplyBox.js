import { cyberAudio } from '../audio.js';

export class SupplyBox {
  constructor(avatarEngine) {
    this.avatarEngine = avatarEngine;
    this.boxBtn = document.getElementById('shake-box-btn');
    this.boxContainer = document.getElementById('interactive-box-wrapper');
    this.spillStage = document.getElementById('spilled-items-stage');
    this.countBadge = document.getElementById('inventory-count-badge');
    this.isShaking = false;
    this.itemCount = 0;

    this.init();
  }

  init() {
    if (!this.boxBtn) return;

    this.boxBtn.addEventListener('click', () => {
      this.triggerShakeAndSpill();
    });

    // Also shake if user clicks the crate box itself
    const crate = document.getElementById('stationery-crate');
    if (crate) {
      crate.addEventListener('click', () => {
        this.triggerShakeAndSpill();
      });
    }
  }

  triggerShakeAndSpill() {
    if (this.isShaking) return;
    this.isShaking = true;

    cyberAudio.playScan();

    const crate = document.getElementById('stationery-crate');
    if (crate) {
      crate.classList.add('shaking');
    }

    // Play rattle sounds with Web Audio
    let rattles = 0;
    const rattleInterval = setInterval(() => {
      cyberAudio.playClick();
      rattles++;
      if (rattles > 6) {
        clearInterval(rattleInterval);
        this.popOpenAndSpill();
      }
    }, 120);
  }

  popOpenAndSpill() {
    cyberAudio.playModeChange();

    const crate = document.getElementById('stationery-crate');
    if (crate) {
      crate.classList.remove('shaking');
      crate.classList.add('opened');
    }

    // 1. Trigger Avatar trick jump from box
    if (this.avatarEngine) {
      this.avatarEngine.triggerTrickJump();
    }

    // 2. Spawn and scatter office inventory onto the desk!
    const inventoryItems = [
      { type: 'clip-red', label: '📎 Красная скрепка #E3142A', icon: '📎' },
      { type: 'clip-chrome', label: '📎 Хромированная скрепка', icon: '📎' },
      { type: 'pencil-red', label: '✏️ Чертежный карандаш 2B', icon: '✏️' },
      { type: 'pencil-black', label: '🖋️ Линер Sakura 0.5mm', icon: '🖋️' },
      { type: 'note-yellow', label: '📝 Записка: "Не забудь про токены!"', icon: '📝' },
      { type: 'note-red', label: '📌 Записка: "Деплой на Cloudflare"', icon: '📌' },
      { type: 'tape', label: '🩹 Лента скотча Washi', icon: '🩹' },
      { type: 'eraser', label: '🧼 Ластик архитектурный', icon: '🧼' },
      { type: 'clip-red', label: '📎 Скрепка канцелярская', icon: '📎' },
      { type: 'note-black', label: '🗒️ Чеклист дизайн-системы', icon: '🗒️' }
    ];

    if (this.spillStage) {
      inventoryItems.forEach((item, index) => {
        setTimeout(() => {
          this.spawnSpilledItem(item, index);
        }, index * 80);
      });
    }

    this.itemCount += inventoryItems.length;
    if (this.countBadge) {
      this.countBadge.textContent = `[ ВЫСЫПАНО ИНВЕНТАРЯ: ${this.itemCount} ШТ. + АВАТАР QNASSIO ]`;
      this.countBadge.classList.add('active');
    }

    setTimeout(() => {
      this.isShaking = false;
    }, 1200);
  }

  spawnSpilledItem(item, index) {
    const el = document.createElement('div');
    el.className = `spilled-item-tag ${item.type}`;
    el.innerHTML = `<span>${item.icon}</span> <strong>${item.label}</strong>`;

    // Random landing position within desk stage
    const spreadX = (Math.random() - 0.5) * 650;
    const spreadY = (Math.random() - 0.5) * 220;
    const rot = (Math.random() - 0.5) * 45;

    el.style.setProperty('--target-x', `${spreadX}px`);
    el.style.setProperty('--target-y', `${spreadY}px`);
    el.style.setProperty('--target-rot', `${rot}deg`);

    // Interactive drag or click to remove/inspect
    el.addEventListener('click', () => {
      cyberAudio.playHover();
      el.classList.add('collected');
      setTimeout(() => el.remove(), 400);
    });

    this.spillStage.appendChild(el);
  }
}
