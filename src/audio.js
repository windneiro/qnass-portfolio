// Synthesized procedural Web Audio sound design for cyber-couture UI

class CyberAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.masterGain = null;
    this.ambientOsc = null;
    this.ambientGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
      this.enabled = true;
      this.startAmbientDrone();
    } catch (e) {
      console.warn("AudioContext init failed", e);
    }
  }

  toggle() {
    if (!this.ctx) {
      this.init();
      return true;
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
      this.enabled = true;
      return true;
    }
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.enabled ? 0.3 : 0, this.ctx.currentTime, 0.05);
    }
    return this.enabled;
  }

  playHover() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, t);
      osc.frequency.exponentialRampToValueAtTime(2200, t + 0.04);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch (_) {}
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch (_) {}
  }

  playScan() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, t);
      osc.frequency.linearRampToValueAtTime(800, t + 0.15);
      osc.frequency.linearRampToValueAtTime(300, t + 0.3);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, t);
      filter.Q.setValueAtTime(4.0, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch (_) {}
  }

  playModeChange() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.03);

        gain.gain.setValueAtTime(0.05, t + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.03 + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(t + i * 0.03);
        osc.stop(t + i * 0.03 + 0.12);
      });
    } catch (_) {}
  }

  startAmbientDrone() {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Sub-bass A1

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(120, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();
      this.ambientOsc = osc;
      this.ambientGain = gain;
    } catch (_) {}
  }

  playDeskTransform() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Mechanical resonant sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.4);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.8);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, t);
      filter.frequency.linearRampToValueAtTime(1200, t + 0.3);
      filter.frequency.exponentialRampToValueAtTime(200, t + 0.85);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.85);
    } catch (_) {}
  }

  playLampClick() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Crisp mechanical rotary/toggle click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(2200, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.035);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.035);
    } catch (_) {}
  }

  playItemDrop() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Organic wooden clatter / bounce
      const freqs = [380, 520, 260];
      freqs.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = t + idx * 0.04;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq + Math.random() * 60, startTime);
        osc.frequency.exponentialRampToValueAtTime(120, startTime + 0.06);

        gain.gain.setValueAtTime(0.06 / (idx + 1), startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 0.06);
      });
    } catch (_) {}
  }

  playLaptopOpen() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Gentle friction hinge whoosh + soft chime
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.15);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.2);
    } catch (_) {}
  }

  playBoxBurst() {
    this.init();
    if (!this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // 1. Heavy cardboard pop / thud
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(160, t);
      thudOsc.frequency.exponentialRampToValueAtTime(45, t + 0.18);
      thudGain.gain.setValueAtTime(0.35, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);
      thudOsc.start(t);
      thudOsc.stop(t + 0.18);

      // 2. Whoosh upward rush
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(300, t);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 0.45);
      filter.Q.setValueAtTime(3.0, t);

      const noiseOsc = this.ctx.createOscillator();
      const noiseGain = this.ctx.createGain();
      noiseOsc.type = 'sawtooth';
      noiseOsc.frequency.setValueAtTime(120, t);
      noiseOsc.frequency.exponentialRampToValueAtTime(600, t + 0.45);
      noiseGain.gain.setValueAtTime(0.08, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.50);
      noiseOsc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseOsc.start(t);
      noiseOsc.stop(t + 0.50);

      // 3. Shimmering reveal harmonic chords (C-E-G-B crystal chord)
      const chord = [523.25, 659.25, 783.99, 987.77, 1318.51];
      chord.forEach((note, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = t + 0.12 + i * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, start);
        gain.gain.setValueAtTime(0.06 / (i + 1), start);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.85);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(start);
        osc.stop(start + 0.85);
      });
    } catch (_) {}
  }
}

export const cyberAudio = new CyberAudioEngine();
