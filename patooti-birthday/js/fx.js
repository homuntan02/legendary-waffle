/* Low-resolution particle canvas: hearts, stars, confetti, petals, fireworks.
 * Drawn at 1/PX resolution and scaled up so every particle is a chunky pixel. */
(function () {
  const BD = window.BD, C = BD.C;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FX = (BD.FX = {
    PX: 4, list: [], cache: {},
    PALETTE: [C.pink, C.pinkLight, C.pinkDark, C.yellow, C.white, C.cream, C.yellowDark],

    init() {
      this.cv = document.getElementById("fx");
      this.ctx = this.cv.getContext("2d");
      this.resize();
      addEventListener("resize", () => this.resize());
      requestAnimationFrame((t) => this.tick(t));
    },
    resize() {
      this.PX = innerWidth < 640 ? 3 : 4;
      this.cv.width = Math.ceil(innerWidth / this.PX);
      this.cv.height = Math.ceil(innerHeight / this.PX);
      this.ctx.imageSmoothingEnabled = false;
    },
    sprite(kind, color) {
      const k = kind + color;
      if (!this.cache[k]) {
        const name = { heart: "heart5", star: "star5", sparkle: "sparkle", sparkleS: "sparkleS", petalA: "petalA", petalB: "petalB", bigheart: "heart7" }[kind];
        this.cache[k] = BD.small(name, color, { hi: C.white, outline: kind === "bigheart" }).toCanvas();
      }
      return this.cache[k];
    },
    add(p) {
      if (reduced && this.list.length > 150) return;
      this.list.push(Object.assign({ vx: 0, vy: 0, g: 0, drag: 1, life: 80, age: 0, kind: "sq", color: C.pink, size: 1, sway: 0, phase: rand(0, 6.28) }, p));
      if (this.list.length > 1200) this.list.shift();
    },
    tick(t) {
      const dt = this.last ? Math.min(3, (t - this.last) / 16.67) : 1;
      this.last = t;
      const ctx = this.ctx, W = this.cv.width, H = this.cv.height;
      ctx.clearRect(0, 0, W, H);
      const keep = [];
      for (const p of this.list) {
        p.age += dt;
        p.vy += p.g * dt;
        const dr = Math.pow(p.drag, dt);
        p.vx *= dr; p.vy *= dr;
        p.x += (p.vx + (p.sway ? Math.sin(p.age * 0.07 + p.phase) * p.sway : 0)) * dt;
        p.y += p.vy * dt;
        if (p.kind === "rocket") {
          if (Math.random() < 0.7) this.add({ x: p.x, y: p.y + 1, kind: "sq", color: pick([C.yellow, C.white]), life: rand(8, 16), vy: rand(0, 0.2) });
          if (p.age >= p.life) { this.burstRing(p.x, p.y, p.colors); continue; }
        }
        if (p.age > p.life || p.y > H + 10 || p.x < -20 || p.x > W + 20 || p.y < -60) continue;
        keep.push(p);
        const left = p.life - p.age;
        if (left < 16 && Math.floor(p.age / 3) % 2) continue; // retro blink-out
        const x = Math.round(p.x), y = Math.round(p.y);
        ctx.fillStyle = p.color;
        switch (p.kind) {
          case "sq": ctx.fillRect(x, y, p.size, p.size); break;
          case "rocket": ctx.fillRect(x, y, 1, 2); break;
          case "conf": Math.floor(p.age / 6 + p.phase) % 2 ? ctx.fillRect(x, y, 2, 1) : ctx.fillRect(x, y, 1, 2); break;
          case "petal": ctx.drawImage(this.sprite(Math.floor(p.age / 14 + p.phase) % 2 ? "petalA" : "petalB", p.color), x, y); break;
          case "sparkle": ctx.drawImage(this.sprite(Math.floor(p.age / 6) % 2 ? "sparkle" : "sparkleS", p.color), x - 2, y - 2); break;
          default: { const c = this.sprite(p.kind, p.color); ctx.drawImage(c, x - (c.width >> 1), y - (c.height >> 1)); }
        }
      }
      this.list = keep;
      requestAnimationFrame((tt) => this.tick(tt));
    },

    /* ---- public API (coordinates in CSS pixels) ---- */
    burst(x, y, o = {}) {
      const n = reduced ? Math.ceil((o.n || 40) / 3) : o.n || 40;
      const kinds = o.kinds || ["sq", "heart", "star", "sparkle", "conf"];
      const colors = o.colors || this.PALETTE, sp = o.speed || 2.5;
      for (let i = 0; i < n; i++) {
        const a = rand(0, Math.PI * 2), v = sp * rand(0.25, 1);
        this.add({
          x: x / this.PX, y: y / this.PX, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up || 0),
          g: o.g == null ? 0.05 : o.g, drag: o.drag || 0.975, life: rand(...(o.life || [50, 100])),
          kind: pick(kinds), color: pick(colors), size: pick([1, 1, 2]), sway: o.sway || 0
        });
      }
    },
    burstRing(x, y, colors = [C.pink, C.white]) {
      const n = 26;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, v = rand(1.3, 1.6);
        this.add({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.02, drag: 0.965, life: rand(55, 75), kind: i % 3 ? "sq" : "sparkle", color: pick(colors), size: 1 });
      }
      for (let i = 0; i < 6; i++) {
        const a = rand(0, Math.PI * 2);
        this.add({ x, y, vx: Math.cos(a) * 0.6, vy: Math.sin(a) * 0.6, g: 0.015, drag: 0.97, life: 70, kind: "heart", color: pick(colors) });
      }
    },
    firework(x, y) {
      const sx = x / this.PX, ty = y / this.PX, H = this.cv.height, frames = 38;
      this.add({ x: sx + rand(-8, 8), y: H, vy: -(H - ty) / frames, life: frames, kind: "rocket", color: C.white,
        colors: pick([[C.pink, C.white], [C.yellow, C.white], [C.pinkLight, C.yellow], [C.pinkDark, C.pinkLight]]) });
      BD.Audio.sfx("firework");
    },
    confetti(n = 60) {
      if (reduced) n = Math.ceil(n / 3);
      for (let i = 0; i < n; i++)
        this.add({ x: rand(0, this.cv.width), y: rand(-40, -2), vy: rand(0.35, 0.9), vx: rand(-0.2, 0.2), sway: rand(0.2, 0.5), life: 600, kind: pick(["conf", "conf", "sq", "heart", "star"]), color: pick(this.PALETTE) });
    },
    hearts(x, y, n = 3) {
      for (let i = 0; i < n; i++)
        this.add({ x: x / this.PX + rand(-4, 4), y: y / this.PX, vy: rand(-0.6, -0.35), sway: rand(0.15, 0.35), life: rand(60, 90), kind: Math.random() < 0.3 ? "bigheart" : "heart", color: pick([C.pink, C.pinkDark, C.pinkLight, C.white]) });
    },
    petalFall() {
      this.add({ x: rand(0, this.cv.width), y: -4, vy: rand(0.3, 0.6), sway: rand(0.25, 0.5), life: 900, kind: "petal", color: pick([C.pink, C.pinkLight, C.white, C.yellow]) });
    },
    sparkles(x, y, n = 6) {
      this.burst(x, y, { n, kinds: ["sparkle", "sparkle", "sq"], colors: [C.white, C.yellow, C.pinkLight], speed: 1.4, g: 0, life: [20, 40] });
    }
  });
})();
