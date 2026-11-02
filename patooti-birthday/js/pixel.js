/* Tiny pixel-art engine: sprites are grids of colours rendered to canvases
 * and scaled up with `image-rendering: pixelated` so edges stay crisp. */
(function () {
  const BD = (window.BD = window.BD || {});
  const C = (BD.C = window.BIRTHDAY_CONFIG.colors);

  const rgbaCache = {};
  function rgba(hex) {
    if (rgbaCache[hex]) return rgbaCache[hex];
    let h = hex.replace("#", "");
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h.slice(0, 6), 16);
    const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255;
    return (rgbaCache[hex] = [(n >> 16) & 255, (n >> 8) & 255, n & 255, a]);
  }

  class Sprite {
    constructor(w, h) {
      this.w = w; this.h = h;
      this.px = new Array(w * h).fill(null);
    }
    set(x, y, c) {
      x = Math.floor(x); y = Math.floor(y);
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return this;
      this.px[y * this.w + x] = c;
      return this;
    }
    get(x, y) {
      if (x < 0 || y < 0 || x >= this.w || y >= this.h) return null;
      return this.px[y * this.w + x];
    }
    rect(x, y, w, h, c) {
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.set(x + i, y + j, c);
      return this;
    }
    ellipse(cx, cy, rx, ry, c) {
      for (let y = Math.floor(cy - ry) - 1; y <= Math.ceil(cy + ry); y++)
        for (let x = Math.floor(cx - rx) - 1; x <= Math.ceil(cx + rx); x++) {
          const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
          if (dx * dx + dy * dy <= 1) this.set(x, y, c);
        }
      return this;
    }
    line(x0, y0, x1, y1, c, w = 1) {
      x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx + dy;
      for (;;) {
        this.rect(x0, y0, w, 1, c);
        if (x0 === x1 && y0 === y1) break;
        const e2 = 2 * err;
        if (e2 >= dy) { err += dy; x0 += sx; }
        if (e2 <= dx) { err += dx; y0 += sy; }
      }
      return this;
    }
    /** Recolour existing pixels: fn(x, y, colour) -> new colour | undefined */
    each(fn) {
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++) {
          const c = this.px[y * this.w + x];
          if (c) { const n = fn(x, y, c); if (n !== undefined) this.px[y * this.w + x] = n; }
        }
      return this;
    }
    grid(rows, map, ox = 0, oy = 0) {
      rows.forEach((r, y) => [...r].forEach((ch, x) => { if (map[ch]) this.set(ox + x, oy + y, map[ch]); }));
      return this;
    }
    /** Crop to content with `pad` empty pixels around it. */
    trim(pad = 1) {
      let x0 = this.w, y0 = this.h, x1 = -1, y1 = -1;
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++)
          if (this.px[y * this.w + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      if (x1 < 0) return this;
      const s = new Sprite(x1 - x0 + 1 + pad * 2, y1 - y0 + 1 + pad * 2);
      for (let y = y0; y <= y1; y++)
        for (let x = x0; x <= x1; x++) s.set(x - x0 + pad, y - y0 + pad, this.get(x, y));
      s.ox = x0 - pad; s.oy = y0 - pad;
      return s;
    }
    /** Add a 1px outline around all filled pixels (4-neighbour). */
    outline(c = C.outline) {
      const src = this.px.slice();
      const at = (x, y) => (x < 0 || y < 0 || x >= this.w || y >= this.h ? null : src[y * this.w + x]);
      for (let y = 0; y < this.h; y++)
        for (let x = 0; x < this.w; x++)
          if (!src[y * this.w + x] && (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)))
            this.px[y * this.w + x] = c;
      return this;
    }
    toCanvas() {
      const cv = document.createElement("canvas");
      BD.paint(cv, this);
      return cv;
    }
  }
  BD.Sprite = Sprite;

  BD.paint = function (cv, sprite) {
    cv.width = sprite.w; cv.height = sprite.h;
    const ctx = cv.getContext("2d");
    const img = ctx.createImageData(sprite.w, sprite.h);
    sprite.px.forEach((c, i) => {
      if (!c) return;
      const [r, g, b, a] = rgba(c);
      img.data.set([r, g, b, a], i * 4);
    });
    ctx.putImageData(img, 0, 0);
    return cv;
  };

  BD.grid = function (rows, map) {
    return new Sprite(rows[0].length, rows.length).grid(rows, map);
  };

  /** Canvas sized in sprite units × CSS var --s (the current pixel scale). */
  BD.spriteEl = function (sprite, cls) {
    const cv = sprite.toCanvas();
    cv.className = "px" + (cls ? " " + cls : "");
    cv.style.width = `calc(var(--s) * ${sprite.w}px)`;
    cv.style.height = `calc(var(--s) * ${sprite.h}px)`;
    cv.setAttribute("aria-hidden", "true");
    return cv;
  };
  /** Canvas with a fixed pixel scale (for decorations, HUD, cursor). */
  BD.spriteImg = function (sprite, scale, cls) {
    const cv = sprite.toCanvas();
    cv.className = "px" + (cls ? " " + cls : "");
    cv.style.width = sprite.w * scale + "px";
    cv.style.height = sprite.h * scale + "px";
    cv.setAttribute("aria-hidden", "true");
    return cv;
  };
  BD.place = function (el, x, y) {
    el.style.position = "absolute";
    el.style.left = `calc(var(--s) * ${x}px)`;
    el.style.top = `calc(var(--s) * ${y}px)`;
    return el;
  };

  /* ---------------- small sprite library ---------------- */
  const G = {
    heart5: [".X.X.", "XXXXX", "XXXXX", ".XXX.", "..X.."],
    heart7: [".XX.XX.", "XWXXXXX", "XXXXXXX", ".XXXXX.", "..XXX..", "...X..."],
    star5: ["..X..", ".XXX.", "XXXXX", ".XXX.", ".X.X."],
    star7: ["...X...", "..XXX..", "XXXWXXX", ".XXXXX.", "..XXX..", ".XX.XX.", ".X...X."],
    sparkle: ["..X..", "..X..", "XXWXX", "..X..", "..X.."],
    sparkleS: [".X.", "XWX", ".X."],
    petalA: [".XX", "XX."],
    petalB: ["XX.", ".XX"],
    flower: [".X.X.", "XXXXX", ".XCX.", "XXXXX", ".X.X."],
    arrowDown: ["XXXXX", ".XXX.", "..X.."],
    note: ["...XXXXXX", "...XXXXXX", "...X....X", "...X....X", "...X....X", ".XXX..XXX", "XXXX.XXXX", "XXXX.XXXX", ".XX...XX."],
    speakerOn: ["....X....", "...XX.X..", "XXXXX..X.", "XXXXX..X.", "XXXXX..X.", "...XX.X..", "....X...."],
    speakerOff: ["....X....", "...XX....", "XXXXX.X.X", "XXXXX..X.", "XXXXX.X.X", "...XX....", "....X...."],
    arrowLeft: ["..X", ".XX", "XXX", ".XX", "..X"]
  };
  BD.G = G;
  /** Build a small sprite from a library grid; X = main colour, W = highlight. */
  BD.small = function (name, color, opts = {}) {
    const s = BD.grid(G[name], { X: color, W: opts.hi || color, C: opts.center || C.yellow });
    if (opts.outline) {
      const p = new Sprite(s.w + 2, s.h + 2);
      s.px.forEach((c, i) => c && p.set((i % s.w) + 1, Math.floor(i / s.w) + 1, c));
      return p.outline(opts.outline === true ? C.outline : opts.outline);
    }
    return s;
  };

  BD.cursorSprite = function () {
    return BD.grid(
      [
        "O..........",
        "OO.........",
        "OLO........",
        "OLPO.......",
        "OLPPO......",
        "OLPPPO.....",
        "OLPPPPO....",
        "OLPPPPPO...",
        "OLPPPPPPO..",
        "OLPPPPPPPO.",
        "OLPPPPOOOOO",
        "OLPPOPO....",
        "OLPO.OPO...",
        "OLO..OPO...",
        "OO....OPO..",
        "O.....OPO..",
        ".......OO.."
      ],
      { O: C.ink, L: C.white, P: C.pink }
    );
  };
})();
