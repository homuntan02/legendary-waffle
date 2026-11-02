/* Chiptune synth: original 8-bit background loop + sound effects (WebAudio, no files). */
(function () {
  const BD = window.BD;
  const cfg = window.BIRTHDAY_CONFIG.audio;
  const SEMI = { C: 0, "C#": 1, D: 2, "D#": 3, E: 4, F: 5, "F#": 6, G: 7, "G#": 8, A: 9, "A#": 10, B: 11 };
  const hz = (n) => {
    const m = /^([A-G]#?)(\d)$/.exec(n);
    return 440 * Math.pow(2, (12 * (+m[2] + 1) + SEMI[m[1]] - 69) / 12);
  };

  /* ---- Original melody "Patooti's Waltz-a-bit" (8 bars of eighth notes) ---- */
  const TEMPO = 128;
  const BARS = [
    [["E5", 1], ["G5", 1], ["C6", 2], ["G5", 1], ["E5", 1], ["G5", 2]],
    [["A5", 1], ["C6", 1], ["E6", 2], ["C6", 1], ["A5", 1], ["E5", 2]],
    [["F5", 1], ["A5", 1], ["C6", 1], ["A5", 1], ["G5", 1], ["F5", 1], ["E5", 1], ["F5", 1]],
    [["G5", 3], ["D5", 1], ["G5", 2], ["B5", 2]],
    [["C6", 1], ["B5", 1], ["A5", 1], ["G5", 1], ["E5", 2], ["G5", 2]],
    [["F5", 1], ["E5", 1], ["F5", 1], ["A5", 1], ["C6", 2], ["A5", 2]],
    [["G5", 1], ["A5", 1], ["B5", 1], ["D6", 1], ["B5", 2], ["G5", 2]],
    [["C6", 4], ["G5", 2], [null, 2]]
  ];
  const BASS = [
    ["C3", "G3", "C3", "G3"], ["A2", "E3", "A2", "E3"], ["F2", "C3", "F2", "C3"], ["G2", "D3", "G2", "B2"],
    ["C3", "G3", "E3", "G3"], ["F2", "C3", "A2", "C3"], ["G2", "D3", "B2", "D3"], ["C3", "G2", "C3", "C3"]
  ];
  const LEAD = {};
  BARS.forEach((bar, b) => { let t = b * 8; bar.forEach(([n, len]) => { if (n) LEAD[t] = [n, len]; t += len; }); });

  const A = (BD.Audio = {
    ctx: null, muted: false, musicOn: true, playing: false,

    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const ctx = (this.ctx = new AC());
      this.master = ctx.createGain(); this.master.gain.value = this.muted ? 0 : 1;
      this.master.connect(ctx.destination);
      this.musicG = ctx.createGain(); this.musicG.gain.value = cfg.musicVolume; this.musicG.connect(this.master);
      this.sfxG = ctx.createGain(); this.sfxG.gain.value = cfg.sfxVolume; this.sfxG.connect(this.master);
      const len = ctx.sampleRate;
      this.noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) ctx.suspend(); else ctx.resume();
      });
      return true;
    },
    unlock() {
      if (!this.init()) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
    },

    tone(freq, dur, o = {}) {
      if (!this.ctx) return;
      const ctx = this.ctx, t = o.at || ctx.currentTime;
      const osc = ctx.createOscillator(), g = ctx.createGain();
      osc.type = o.type || "square";
      osc.frequency.setValueAtTime(freq, t);
      if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      const v = o.vol == null ? 0.25 : o.vol;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(v, t + 0.006);
      g.gain.setValueAtTime(v, t + dur * 0.55);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(g); g.connect(o.dest || this.sfxG);
      osc.start(t); osc.stop(t + dur + 0.03);
    },
    noise(dur, o = {}) {
      if (!this.ctx) return;
      const ctx = this.ctx, t = o.at || ctx.currentTime;
      const src = ctx.createBufferSource(); src.buffer = this.noiseBuf;
      const f = ctx.createBiquadFilter(); f.type = o.ftype || "bandpass";
      f.frequency.setValueAtTime(o.freq || 1000, t);
      if (o.to) f.frequency.exponentialRampToValueAtTime(o.to, t + dur);
      const g = ctx.createGain(), v = o.vol == null ? 0.2 : o.vol;
      g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(o.dest || this.sfxG);
      src.start(t, Math.random() * 0.5); src.stop(t + dur + 0.02);
    },

    sfx(name, arg) {
      if (!this.ctx || this.muted) return;
      const fn = SFX[name];
      if (fn) fn(this, this.ctx.currentTime, arg);
    },

    /* ---- music ---- */
    startMusic() {
      if (!this.ctx || this.playing || !this.musicOn) return;
      this.playing = true; this.step = 0;
      this.next = this.ctx.currentTime + 0.08;
      this.timer = setInterval(() => this.schedule(), 25);
    },
    stopMusic() { this.playing = false; clearInterval(this.timer); },
    schedule() {
      const e = 60 / TEMPO / 2, now = this.ctx.currentTime;
      if (this.next < now - 0.2) this.next = now + 0.05; // resync after throttling
      while (this.next < now + 0.15) {
        this.playStep(this.step % 64, this.next, e);
        this.next += e; this.step++;
      }
    },
    playStep(i, t, e) {
      const L = LEAD[i], mg = this.musicG;
      if (L) {
        this.tone(hz(L[0]), e * L[1] * 0.92, { at: t, vol: 0.11, dest: mg });
        // soft echo an octave down for a fuller chip sound
        this.tone(hz(L[0]) / 2, e * L[1] * 0.6, { at: t, vol: 0.04, dest: mg, type: "triangle" });
      }
      if (i % 2 === 0) this.tone(hz(BASS[Math.floor(i / 8)][(i % 8) / 2]), e * 1.7, { at: t, vol: 0.26, type: "triangle", dest: mg });
      if (i % 2 === 1) this.noise(0.03, { at: t, ftype: "highpass", freq: 7000, vol: 0.05, dest: mg });
      if (i % 8 === 4) this.noise(0.08, { at: t, ftype: "bandpass", freq: 1800, vol: 0.06, dest: mg });
    },
    setMusic(on) {
      this.musicOn = on;
      if (on) this.startMusic(); else this.stopMusic();
    },
    setMuted(m) {
      this.muted = m;
      if (this.master) this.master.gain.setValueAtTime(m ? 0 : 1, this.ctx.currentTime);
    }
  });

  const SFX = {
    click: (a, t) => { a.tone(660, 0.05, { vol: 0.14 }); a.tone(990, 0.07, { at: t + 0.045, vol: 0.12 }); },
    back: (a, t) => { a.tone(784, 0.06, { vol: 0.12 }); a.tone(523, 0.09, { at: t + 0.06, vol: 0.12 }); },
    shake: (a, t) => {
      a.noise(0.22, { freq: 400, vol: 0.25 });
      a.tone(130, 0.1, { type: "triangle", vol: 0.35 }); a.tone(110, 0.1, { type: "triangle", vol: 0.35, at: t + 0.14 });
      a.tone(130, 0.1, { type: "triangle", vol: 0.3, at: t + 0.28 });
    },
    unwrap: (a, t) => {
      a.noise(0.5, { freq: 900, to: 5000, vol: 0.22 });
      [523, 659, 784].forEach((f, i) => a.tone(f, 0.06, { at: t + 0.1 + i * 0.07, vol: 0.08, type: "triangle" }));
    },
    pop: (a) => a.tone(280, 0.14, { to: 1200, vol: 0.18 }),
    creak: (a, t) => { a.tone(180, 0.2, { to: 240, type: "sawtooth", vol: 0.05 }); a.tone(200, 0.2, { to: 300, type: "sawtooth", vol: 0.05, at: t + 0.3 }); },
    open: (a, t) => ["C5", "E5", "G5", "C6", "E6"].forEach((n, i) => a.tone(hz(n), 0.09, { at: t + i * 0.06, vol: 0.13 })),
    shimmer: (a, t) => { for (let i = 0; i < 10; i++) a.tone(1400 + Math.random() * 1600, 0.08, { at: t + i * 0.07, vol: 0.05, type: "triangle" }); },
    boom: (a, t) => { a.noise(0.9, { ftype: "lowpass", freq: 2000, to: 80, vol: 0.55 }); a.tone(120, 0.5, { to: 35, type: "triangle", vol: 0.5 }); },
    celebrate: (a, t) => {
      ["G5", "C6", "E6", "G6"].forEach((n, i) => a.tone(hz(n), 0.1, { at: t + i * 0.09, vol: 0.14 }));
      ["C6", "E6", "G6"].forEach((n) => a.tone(hz(n), 0.6, { at: t + 0.38, vol: 0.07 }));
    },
    firework: (a, t) => { a.tone(600, 0.25, { to: 1500, type: "triangle", vol: 0.04 }); a.noise(0.35, { ftype: "lowpass", freq: 1500, to: 200, vol: 0.14, at: t + 0.25 }); },
    letter: (a) => a.tone(700 + Math.random() * 500, 0.04, { vol: 0.06 }),
    type: (a) => a.tone(900 + Math.random() * 200, 0.025, { vol: 0.04 }),
    sparkle: (a, t) => { a.tone(2093, 0.07, { type: "triangle", vol: 0.07 }); a.tone(2637, 0.1, { type: "triangle", vol: 0.06, at: t + 0.06 }); },
    bloom: (a, t, i = 0) => a.tone(hz(["C5", "D5", "E5", "G5", "A5", "C6", "D6", "E6", "G6", "A6"][i % 10]), 0.12, { type: "triangle", vol: 0.12 }),
    shutter: (a, t) => { a.noise(0.04, { ftype: "highpass", freq: 3000, vol: 0.25 }); a.noise(0.05, { ftype: "highpass", freq: 2500, vol: 0.2, at: t + 0.08 }); },
    boing: (a) => a.tone(180, 0.3, { to: 700, type: "triangle", vol: 0.2 }),
    quack: (a, t) => {
      a.tone(620, 0.09, { to: 430, type: "sawtooth", vol: 0.08 });
      a.tone(640, 0.11, { to: 410, type: "sawtooth", vol: 0.08, at: t + 0.14 });
    }
  };
})();
