import { cyberAudio } from '../audio.js';

export class OrderModal {
  constructor() {
    this.modal = document.getElementById('order-modal');
    this.backdrop = document.getElementById('modal-backdrop');
    this.closeBtn = document.getElementById('modal-close');
    this.confirmBtn = document.getElementById('modal-confirm-btn');
    this.statusText = document.getElementById('modal-status-text');
    this.itemTitle = document.getElementById('modal-item-title');
    this.itemSerial = document.getElementById('modal-item-serial');
    this.init();
  }

  init() {
    if (!this.modal) return;

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    if (this.confirmBtn) {
      this.confirmBtn.addEventListener('click', () => {
        cyberAudio.playScan();
        this.statusText.textContent = 'AUTHENTICATING TOKEN // ENCRYPTING BIO-TRANSACTION...';
        this.confirmBtn.disabled = true;
        this.confirmBtn.textContent = 'VERIFYING...';

        setTimeout(() => {
          cyberAudio.playModeChange();
          this.statusText.textContent = 'ACCESS GRANTED // UNIT ALLOCATED: #09-CTRL-07';
          this.statusText.style.color = '#FFE1BF';
          this.confirmBtn.textContent = 'CONFIRMED // DISPATCH PROTOCOL ACTIVE';
          this.confirmBtn.style.background = '#FFE1BF';
          this.confirmBtn.style.color = '#000000';
        }, 1200);
      });
    }

    document.querySelectorAll('[data-open-modal]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const item = e.currentTarget.getAttribute('data-item') || 'SYNTH DROP 01 // SILENCE PIECE';
        const serial = e.currentTarget.getAttribute('data-serial') || 'SERIAL: 09-CTRL-07 / 2026';
        this.open(item, serial);
      });
    });
  }

  open(title, serial) {
    cyberAudio.playClick();
    if (this.itemTitle) this.itemTitle.textContent = title;
    if (this.itemSerial) this.itemSerial.textContent = serial;
    if (this.statusText) {
      this.statusText.textContent = 'USER ACCESS: VERIFIED // ALLOCATION READY';
      this.statusText.style.color = '#E3142A';
    }
    if (this.confirmBtn) {
      this.confirmBtn.disabled = false;
      this.confirmBtn.textContent = 'INITIALIZE PROTOCOL ACQUISITION';
      this.confirmBtn.style.background = '#E3142A';
      this.confirmBtn.style.color = '#FFFFFF';
    }
    this.modal.classList.add('active');
    this.backdrop.classList.add('active');
  }

  close() {
    cyberAudio.playClick();
    this.modal.classList.remove('active');
    this.backdrop.classList.remove('active');
  }
}
