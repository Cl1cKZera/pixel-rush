/* Sistema de Áudio Procedural via Web Audio API:
 * - Música eletrônica Synthwave/Arcade em loop (baixo, arpejo, lead e bateria)
 * - Som contínuo de motor com modulação por velocidade, aceleração e nitro
 * - Efeitos sonoros: colisão, moeda, combustível, acerto/erro matemático, largada, fim de corrida e UI
 * - Inicia estritamente após a primeira interação do usuário */
(function () {
  'use strict';
  const PR = window.PR;
  const U = PR.U;

  const AudioSys = {
    ctx: null,
    masterGain: null,
    musicGain: null,
    sfxGain: null,
    noiseBuf: null,
    engOsc1: null,
    engOsc2: null,
    engGain: null,
    engFilter: null,
    unlocked: false,
    musicMode: 'menu', // 'menu' | 'race' | 'off'
    step: 0,
    stepTimer: 0,

    init() {
      // Desbloqueia o Web Audio API somente na primeira interação válida do usuário
      const unlock = () => {
        if (!this.unlocked) this.ensureContext();
        if (this.ctx && this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      };
      PR.Input.on((type) => {
        if (type === 'key' || type === 'mouse' || type === 'touch') unlock();
      });
    },

    ensureContext() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      try {
        this.ctx = new AC();
        this.masterGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain.connect(this.masterGain);
        this.sfxGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Buffer de ruído branco para bateria, explosões e vento do nitro
        const len = this.ctx.sampleRate * 1.5;
        this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = this.noiseBuf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

        // Osciladores contínuos do motor
        this.engOsc1 = this.ctx.createOscillator();
        this.engOsc2 = this.ctx.createOscillator();
        this.engFilter = this.ctx.createBiquadFilter();
        this.engGain = this.ctx.createGain();

        this.engOsc1.type = 'sawtooth';
        this.engOsc2.type = 'triangle';
        this.engOsc1.frequency.value = 55;
        this.engOsc2.frequency.value = 110;
        this.engFilter.type = 'lowpass';
        this.engFilter.frequency.value = 260;
        this.engGain.gain.value = 0.0001;

        this.engOsc1.connect(this.engFilter);
        this.engOsc2.connect(this.engFilter);
        this.engFilter.connect(this.engGain);
        this.engGain.connect(this.sfxGain);

        this.engOsc1.start();
        this.engOsc2.start();

        this.syncVolumes();
        this.unlocked = true;
        return true;
      } catch (e) {
        return false;
      }
    },

    syncVolumes() {
      if (!this.ctx) return;
      const s = PR.Storage.settings;
      const now = this.ctx.currentTime;
      const m = s.muted ? 0 : U.clamp(s.master, 0, 1);
      this.masterGain.gain.setTargetAtTime(m, now, 0.02);
      this.musicGain.gain.setTargetAtTime(U.clamp(s.music, 0, 1) * 0.42, now, 0.02);
      this.sfxGain.gain.setTargetAtTime(U.clamp(s.sfx, 0, 1) * 0.65, now, 0.02);
    },

    toggleMute() {
      const s = PR.Storage.settings;
      PR.Storage.saveSettings({ muted: !s.muted });
      this.syncVolumes();
      return PR.Storage.settings.muted;
    },

    setVolume(key, val) {
      const patch = {};
      patch[key] = U.clamp(val, 0, 1);
      if (val > 0 && key === 'master') patch.muted = false;
      PR.Storage.saveSettings(patch);
      this.syncVolumes();
    },

    // Atualiza o ronco do motor em tempo real conforme a velocidade e aceleração
    updateEngine(active, speedRatio, accelerating, nitroActive) {
      if (!this.ctx || !this.engGain) return;
      const now = this.ctx.currentTime;
      if (!active || PR.Storage.settings.muted) {
        this.engGain.gain.setTargetAtTime(0.0001, now, 0.06);
        return;
      }
      const baseFreq = 46 + speedRatio * 95 + (accelerating ? 14 : 0) + (nitroActive ? 36 : 0);
      // Simula trocas de marcha sutis
      const gearMod = ((speedRatio * 4) % 1) * 18;
      const f1 = baseFreq + gearMod;
      this.engOsc1.frequency.setTargetAtTime(f1, now, 0.04);
      this.engOsc2.frequency.setTargetAtTime(f1 * 1.5, now, 0.04);
      this.engFilter.frequency.setTargetAtTime(240 + speedRatio * 520 + (nitroActive ? 400 : 0), now, 0.05);
      const vol = 0.09 + speedRatio * 0.06 + (accelerating ? 0.03 : 0);
      this.engGain.gain.setTargetAtTime(vol, now, 0.05);
    },

    // Utilitário interno para tocar notas sintetizadas
    tone(freq, dur, type, vol, slideTo, delay, dest) {
      if (!this.ctx || PR.Storage.settings.muted) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type || 'square';
      osc.frequency.setValueAtTime(Math.max(20, freq), t0);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
      }
      const peak = Math.max(0.001, vol || 0.2);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(peak, t0 + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(dest || this.sfxGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    },

    // Utilitário interno para ruído filtrado (explosões, caixa de bateria, jato de nitro)
    noise(dur, filterFreq, filterType, vol, delay, dest) {
      if (!this.ctx || !this.noiseBuf || PR.Storage.settings.muted) return;
      const t0 = this.ctx.currentTime + (delay || 0);
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const flt = this.ctx.createBiquadFilter();
      flt.type = filterType || 'bandpass';
      flt.frequency.setValueAtTime(filterFreq || 800, t0);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(Math.max(0.001, vol || 0.25), t0);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(flt);
      flt.connect(g);
      g.connect(dest || this.sfxGain);
      src.start(t0);
      src.stop(t0 + dur + 0.02);
    },

    // Efeitos sonoros do jogo
    sfx(name) {
      if (!this.unlocked) this.ensureContext();
      if (!this.ctx || PR.Storage.settings.muted) return;

      switch (name) {
        case 'click':
          this.tone(660, 0.06, 'square', 0.16, 880);
          break;
        case 'hover':
          this.tone(440, 0.035, 'triangle', 0.08, 520);
          break;
        case 'coin':
          this.tone(987.77, 0.07, 'square', 0.22); // B5
          this.tone(1318.5, 0.18, 'square', 0.22, null, 0.065); // E6
          break;
        case 'fuel':
          this.tone(330, 0.09, 'triangle', 0.25, 440, 0);
          this.tone(440, 0.09, 'triangle', 0.25, 587, 0.08);
          this.tone(587, 0.16, 'square', 0.22, 880, 0.16);
          break;
        case 'nitro_pickup':
          this.tone(523.25, 0.08, 'sawtooth', 0.2, 784, 0);
          this.tone(784, 0.16, 'sawtooth', 0.22, 1174, 0.07);
          break;
        case 'nitro_fire':
          this.noise(0.48, 1200, 'bandpass', 0.32);
          this.tone(140, 0.45, 'sawtooth', 0.28, 520);
          this.tone(280, 0.45, 'square', 0.18, 880);
          break;
        case 'crash':
          this.noise(0.42, 420, 'lowpass', 0.48);
          this.noise(0.28, 1600, 'bandpass', 0.3);
          this.tone(130, 0.36, 'sawtooth', 0.35, 38);
          break;
        case 'math_appear':
          this.tone(587.33, 0.07, 'triangle', 0.18, 880, 0);
          this.tone(880, 0.11, 'sine', 0.18, 1174.66, 0.06);
          break;
        case 'math_ok':
          // Fanfarra arcade ascendente (Dó - Mi - Sol - Dó6)
          this.tone(523.25, 0.09, 'square', 0.24, null, 0);
          this.tone(659.25, 0.09, 'square', 0.24, null, 0.07);
          this.tone(783.99, 0.09, 'square', 0.24, null, 0.14);
          this.tone(1046.5, 0.26, 'square', 0.28, 1100, 0.21);
          break;
        case 'math_bad':
          // Buzzer descendente duplo
          this.tone(220, 0.16, 'sawtooth', 0.28, 155, 0);
          this.tone(175, 0.28, 'sawtooth', 0.30, 110, 0.15);
          break;
        case 'count':
          this.tone(523.25, 0.14, 'square', 0.24);
          break;
        case 'go':
          this.tone(1046.5, 0.34, 'square', 0.32, 1174);
          this.tone(523.25, 0.34, 'sawtooth', 0.22);
          break;
        case 'low_fuel':
          this.tone(880, 0.08, 'square', 0.16, 660);
          break;
        case 'finish':
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
            this.tone(f, i === 4 ? 0.45 : 0.12, 'square', 0.25, null, i * 0.09);
          });
          break;
        case 'gameover':
          [392, 349.23, 329.63, 261.63].forEach((f, i) => {
            this.tone(f, i === 3 ? 0.45 : 0.16, 'sawtooth', 0.24, f * 0.92, i * 0.14);
          });
          break;
      }
    },

    // Sequenciador Synthwave em loop (16 passos por compasso)
    update(dt, mode, speedBoost) {
      this.musicMode = mode || 'menu';
      if (!this.unlocked || !this.ctx || PR.Storage.settings.muted || this.musicMode === 'off') return;

      const stepDur = this.musicMode === 'race' ? (speedBoost ? 0.115 : 0.13) : 0.16;
      this.stepTimer += dt;
      if (this.stepTimer < stepDur) return;
      this.stepTimer %= stepDur;

      const s = this.step % 32;
      this.step = (this.step + 1) % 64;

      // Progressão Synthwave em Lá menor (Am - F - C - G)
      const bassRoots = [110, 110, 110, 110, 110, 110, 110, 110, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31,
                         130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 130.81, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0, 98.0];
      const root = bassRoots[s];
      const octave = (s % 2 === 1) ? 2 : 1;

      // Baixo pulsante em colcheias/semicolcheias
      this.tone(root * octave, stepDur * 0.85, 'sawtooth', 0.18, root * 0.98, 0, this.musicGain);

      // Bateria eletrônica (Bumbo nos tempos pares, Caixa nos tempos 4/12, Chimbal contínuo)
      if (s % 4 === 0) {
        this.tone(125, 0.11, 'sine', 0.35, 36, 0, this.musicGain);
      }
      if (s % 8 === 4 && this.musicMode === 'race') {
        this.noise(0.11, 1400, 'bandpass', 0.22, 0, this.musicGain);
      } else if (s % 2 === 1) {
        this.noise(0.035, 5200, 'highpass', 0.08, 0, this.musicGain);
      }

      // Arpejo / Melodia Lead Neon
      const arpNotes = [
        440, 523.25, 659.25, 880, 659.25, 523.25, 440, 523.25,
        349.23, 440, 523.25, 698.46, 523.25, 440, 349.23, 440,
        523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 523.25, 659.25,
        392.0, 493.88, 587.33, 783.99, 587.33, 493.88, 392.0, 493.88
      ];
      const leadFreq = arpNotes[s];
      if (this.musicMode === 'race' || s % 2 === 0) {
        this.tone(leadFreq, stepDur * 0.75, 'triangle', 0.13, null, 0, this.musicGain);
      }
    }
  };

  PR.Audio = AudioSys;
})();

