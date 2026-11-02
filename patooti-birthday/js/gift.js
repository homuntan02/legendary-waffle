/* Reusable pixel gift box component with staged opening animations. */
(function () {
  const BD = window.BD, C = BD.C, S = BD.Sprite;
  const wait = (BD.wait = (ms) => new Promise((r) => setTimeout(r, ms)));
  BD.presents = [];

  /** Wrapping-paper presets: w/h/lidH are in pixels-of-art. */
  BD.wraps = {
    main: { w: 40, h: 26, lidH: 9, paper: C.pink, paperLight: C.pinkLight, paperDark: C.pinkDark, ribbon: C.cream, ribbonLight: C.white, ribbonDark: C.creamDark, pattern: "hearts" }
  };

  BD.makeGiftParts = function (o) {
    const O = C.outline;
    const rw = o.rw || Math.max(3, Math.round(o.w / 6));
    function pattern(s, x0, y0, w, h) {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          let on = false;
          if (o.pattern === "dots") on = y % 4 === 1 && (x + (Math.floor(y / 4) % 2) * 2) % 4 === 1;
          else if (o.pattern === "stripes") on = (x + y) % 6 < 2;
          else if (o.pattern === "checks") on = (Math.floor(x / 3) + Math.floor(y / 3)) % 2 === 0;
          else if (o.pattern === "hearts") {
            const hx = (x + (Math.floor(y / 6) % 2) * 4) % 8, hy = y % 6;
            on = (hy === 1 && (hx === 1 || hx === 3)) || (hy === 2 && hx >= 1 && hx <= 3) || (hy === 3 && hx === 2);
          }
          if (on) s.set(x0 + x, y0 + y, o.paperLight);
        }
    }
    function body(rib) {
      const s = new S(o.w + 2, o.h + 2);
      s.rect(1, 1, o.w, o.h, o.paper); pattern(s, 1, 1, o.w, o.h);
      s.rect(1, 1, 1, o.h, o.paperLight);
      s.rect(o.w - 1, 1, 2, o.h, o.paperDark);
      s.rect(1, o.h, o.w, 1, o.paperDark);
      s.rect(1, 1, o.w, 2, o.paperDark);
      if (rib) {
        const rx = 1 + Math.floor((o.w - rw) / 2);
        s.rect(rx, 1, rw, o.h, o.ribbon); s.rect(rx, 1, 1, o.h, o.ribbonLight);
        s.rect(rx + rw - 1, 1, 1, o.h, o.ribbonDark); s.rect(rx, 1, rw, 2, o.ribbonDark);
      }
      return s.outline(O);
    }
    function lid(rib) {
      const lw = o.w + 4, lh = o.lidH, s = new S(lw + 2, lh + 2);
      s.rect(1, 1, lw, lh, o.paper); pattern(s, 1, 1, lw, lh);
      s.rect(1, 1, lw, 1, o.paperLight); s.rect(lw, 1, 1, lh, o.paperDark); s.rect(1, lh, lw, 1, o.paperDark);
      if (rib) {
        const rx = 1 + Math.floor((lw - rw) / 2);
        s.rect(rx, 1, rw, lh, o.ribbon); s.rect(rx, 1, 1, lh, o.ribbonLight); s.rect(rx + rw - 1, 1, 1, lh, o.ribbonDark);
      }
      return s.outline(O);
    }
    function bow() {
      const bw = Math.max(13, Math.round(o.w * 0.6)), bh = Math.max(7, Math.round(bw * 0.5));
      const s = new S(bw + 10, bh + 10), cx = (bw + 10) / 2, cy = 5 + bh * 0.45;
      const tl = Math.round(bh * 0.6);
      for (let i = 0; i < tl; i++) {
        s.rect(Math.round(cx - 2 - i * 0.75), Math.round(cy + i), 2, 1, o.ribbon);
        s.rect(Math.round(cx + i * 0.75), Math.round(cy + i), 2, 1, o.ribbon);
      }
      s.ellipse(cx - bw * 0.26, cy, bw * 0.26, bh * 0.46, o.ribbon);
      s.ellipse(cx + bw * 0.26, cy, bw * 0.26, bh * 0.46, o.ribbon);
      s.ellipse(cx - bw * 0.23, cy + bh * 0.06, bw * 0.1, bh * 0.17, o.ribbonDark);
      s.ellipse(cx + bw * 0.23, cy + bh * 0.06, bw * 0.1, bh * 0.17, o.ribbonDark);
      s.set(cx - bw * 0.42, cy - bh * 0.2, o.ribbonLight); s.set(cx - bw * 0.38, cy - bh * 0.3, o.ribbonLight);
      s.set(cx + bw * 0.12, cy - bh * 0.3, o.ribbonLight);
      const ky = Math.round(cy - bh * 0.28), kh = Math.max(3, Math.round(bh * 0.55));
      s.rect(Math.round(cx - 2), ky, 4, kh, o.ribbonDark);
      s.rect(Math.round(cx - 1), ky + 1, 2, kh - 2, o.ribbon);
      return s.trim(1).outline(O);
    }
    function strip(len) {
      const s = new S(rw + 2, len + 2);
      s.rect(1, 1, rw, len, o.ribbon); s.rect(1, 1, 1, len, o.ribbonLight); s.rect(rw, 1, 1, len, o.ribbonDark);
      return s.outline(O);
    }
    return { base: body(true), baseBare: body(false), lid: lid(true), lidBare: lid(false), bow: bow(), stripBase: strip(o.h), stripLid: strip(o.lidH), rw };
  };

  class Gift {
    constructor(spec) {
      this.spec = spec;
      const p = (this.p = BD.makeGiftParts(spec));
      const W = p.lid.w;
      this.lidTop = p.bow.h - 3;
      this.baseTop = this.lidTop + p.lid.h - 2;
      const H = this.baseTop + p.base.h;
      this.W = W; this.H = H;

      const el = (this.el = document.createElement("div"));
      el.className = "gift";
      el.style.width = `calc(var(--s) * ${W}px)`;
      el.style.height = `calc(var(--s) * ${H}px)`;
      const inner = (this.inner = document.createElement("div"));
      inner.className = "gift-inner";
      el.appendChild(inner);

      const rays = BD.Art.rays(W + 16, Math.round(W * 0.95));
      this.light = BD.place(document.createElement("div"), (W - rays.w) / 2, this.baseTop + 3 - rays.h);
      this.light.className = "gift-light";
      this.light.appendChild(BD.spriteEl(rays));

      this.baseX = (W - p.base.w) / 2;
      this.base = BD.place(BD.spriteEl(p.base), this.baseX, this.baseTop);
      this.lid = BD.place(BD.spriteEl(p.lid, "gift-lid"), 0, this.lidTop);
      this.bow = BD.place(BD.spriteEl(p.bow, "gift-bow"), (W - p.bow.w) / 2, 0);
      inner.append(this.light, this.base, this.lid, this.bow);
    }
    get s() {
      return parseFloat(getComputedStyle(this.el).getPropertyValue("--s")) || 4;
    }
    shake(power = 1) {
      const a = 3 * power, s = this.s;
      const kf = [0, -1, 1, -1, 1, -0.6, 0.6, 0].map((k, i) => ({
        transform: `translateX(${k * a * s * 0.4}px) rotate(${k * a}deg) scale(${i === 1 ? 1.04 : 1}, ${i === 1 ? 0.95 : 1})`
      }));
      return this.inner.animate(kf, { duration: 520, easing: "linear" }).finished;
    }
    async loosenRibbon() {
      const p = this.p, s = this.s;
      BD.paint(this.base, p.baseBare);
      BD.paint(this.lid, p.lidBare);
      const rx = 1 + Math.floor((this.spec.w - p.rw) / 2) - 1;
      const lrx = 1 + Math.floor((this.spec.w + 4 - p.rw) / 2) - 1;
      const a = BD.place(BD.spriteEl(p.stripBase), this.baseX + rx, this.baseTop);
      const b = BD.place(BD.spriteEl(p.stripLid), lrx, this.lidTop);
      this.inner.insertBefore(a, this.lid);
      this.inner.insertBefore(b, this.bow);
      const fall = (el, dir, delay) =>
        el.animate(
          [
            { transform: "none", opacity: 1 },
            { transform: `translate(${dir * 2 * s}px, ${-3 * s}px) rotate(${dir * 8}deg)`, offset: 0.25 },
            { transform: `translate(${dir * 6 * s}px, ${-1 * s}px) rotate(${dir * 20}deg)`, offset: 0.45 },
            { transform: `translate(${dir * 18 * s}px, ${30 * s}px) rotate(${dir * 70}deg)`, opacity: 0 }
          ],
          { duration: 1000, delay, easing: "cubic-bezier(.4,0,.8,.5)", fill: "forwards" }
        ).finished;
      await Promise.all([fall(a, -1, 0), fall(b, 1, 120)]);
      a.remove(); b.remove();
    }
    popBow() {
      const s = this.s, dir = Math.random() < 0.5 ? -1 : 1;
      const floor = this.H - this.p.bow.h;
      const T = (x, y, r) => `translate(${dir * x * s}px, ${y * s}px) rotate(${dir * r}deg)`;
      return this.bow.animate(
        [
          { transform: T(0, 0, 0), easing: "ease-out" },
          { transform: T(4, -16, 30), offset: 0.22, easing: "ease-in" },
          { transform: T(30, floor, 160), offset: 0.48, easing: "ease-out" },
          { transform: T(40, floor - 10, 220), offset: 0.62, easing: "ease-in" },
          { transform: T(48, floor, 280), offset: 0.75, easing: "ease-out" },
          { transform: T(53, floor - 3, 310), offset: 0.85, easing: "ease-in" },
          { transform: T(57, floor, 340), offset: 0.93, opacity: 1 },
          { transform: T(60, floor, 360), opacity: 0 }
        ],
        { duration: 1400, fill: "forwards" }
      ).finished;
    }
    /** mode 'lift' (main gift: creaks open and hovers) or 'off' (flies away). */
    async openLid(mode = "lift") {
      const s = this.s, L = this.lid;
      await L.animate(
        [
          { transform: "none" }, { transform: `translateY(${-2 * s}px) rotate(-2deg)` }, { transform: "none" },
          { transform: `translateY(${-4 * s}px) rotate(3deg)` }, { transform: `translateY(${-1 * s}px)` }
        ],
        { duration: mode === "lift" ? 900 : 500, easing: "steps(5)", fill: "forwards" }
      ).finished;
      if (mode === "lift") {
        return L.animate(
          [{ transform: `translateY(${-1 * s}px)` }, { transform: `translate(${-8 * s}px, ${-17 * s}px) rotate(-14deg)` }],
          { duration: 1200, easing: "cubic-bezier(.2,.7,.3,1)", fill: "forwards" }
        ).finished;
      }
      return L.animate(
        [
          { transform: `translateY(${-1 * s}px)` },
          { transform: `translate(${-14 * s}px, ${-26 * s}px) rotate(-40deg)`, offset: 0.4 },
          { transform: `translate(${-50 * s}px, ${10 * s}px) rotate(-120deg)`, opacity: 0 }
        ],
        { duration: 800, easing: "ease-in", fill: "forwards" }
      ).finished;
    }
    lightUp() {
      this.light.classList.add("shine");
      return this.light.animate(
        [{ transform: "scaleY(0)", opacity: 0 }, { transform: "scaleY(1.15)", opacity: 1, offset: 0.7 }, { transform: "scaleY(1)", opacity: 1 }],
        { duration: 800, easing: "steps(8)", fill: "forwards" }
      ).finished;
    }
    center() {
      const r = this.inner.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height * 0.55, top: r.top + (this.baseTop / this.H) * r.height };
    }
  }
  BD.Gift = Gift;
})();
