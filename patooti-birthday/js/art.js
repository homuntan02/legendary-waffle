/* Hand-tuned procedural pixel illustrations: duck plushie, bouquet, camera. */
(function () {
  const BD = window.BD, C = BD.C, S = BD.Sprite;
  const Art = (BD.Art = {});

  /* ---------- Jellycat-style duckling plush ---------- */
  Art.duck = function () {
    const s = new S(52, 52);
    const Y = C.yellow, YD = C.yellowDark, YL = C.yellowLight, O = C.orange, OD = C.orangeDark;
    // little orange feet (behind body)
    s.ellipse(17.5, 43, 5, 2.6, O); s.ellipse(29.5, 43, 5, 2.6, O);
    s.each((x, y, c) => (c === O && y >= 44 ? OD : undefined));
    // stubby wing nubs
    s.ellipse(9.2, 32, 3.4, 4.8, YD); s.ellipse(37.8, 32, 3.4, 4.8, YD);
    s.ellipse(9.6, 31.4, 2.4, 3.6, Y); s.ellipse(37.4, 31.4, 2.4, 3.6, Y);
    // soft round body: dark rim bottom-right, then main fill
    s.ellipse(23.5, 33, 15, 10.6, YD); s.ellipse(22.9, 32.3, 14.2, 9.8, Y);
    // fuzzy plush silhouette — little bumps around the edge
    const fuzz = (cx, cy, rx, ry, step) => {
      for (let a = 0; a < Math.PI * 2; a += step) {
        const x = cx + Math.cos(a) * (rx + 0.6), y = cy + Math.sin(a) * (ry + 0.6);
        s.set(x, y, Math.cos(a) + Math.sin(a) > 0.4 ? YD : Y);
      }
    };
    fuzz(23.5, 33, 15, 10.6, 0.42);
    // oversized head
    s.ellipse(23.5, 17, 12.8, 11.8, YD); s.ellipse(22.9, 16.3, 12, 11, Y);
    fuzz(23.5, 17, 12.8, 11.8, 0.38);
    // tuft of fluff on top
    [[21, 5], [22, 4], [22, 3], [23, 4], [24, 3], [24, 2], [25, 4], [26, 3]].forEach(([x, y]) => s.set(x, y, Y));
    // soft highlights
    s.ellipse(17, 9.5, 3.6, 2.2, YL); s.rect(26, 8, 2, 1, YL); s.ellipse(15, 27.5, 3, 1.6, YL);
    // eyes with sparkle
    s.rect(17, 14, 2, 3, C.ink).set(17, 14, C.white);
    s.rect(29, 14, 2, 3, C.ink).set(29, 14, C.white);
    // blushy cheeks
    s.rect(14, 18, 2, 1, C.pink); s.rect(32, 18, 2, 1, C.pink);
    // flat little beak
    s.ellipse(24, 19.6, 3.8, 1.9, O);
    s.rect(22, 20, 4, 1, OD); s.set(22, 19, C.yellowLight);
    return s.trim(1).outline(C.outline);
  };

  /* ---------- Flowers for the bouquet ---------- */
  function canvasFor(r) { const n = Math.ceil(r * 2) + 4; return [new S(n, n), n / 2]; }

  Art.rose = function (r, col = C.pink, colL = C.pinkLight, colD = C.pinkDark) {
    const [s, c] = canvasFor(r);
    s.ellipse(c, c, r, r * 0.92, col);
    s.each((x, y) => {
      const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy);
      if (d < 1.1) return colD;
      if (Math.abs(d - r * 0.52) < 0.55 && Math.atan2(dy, dx) > -2.4) return colD;
      if (dx + dy > r * 0.85) return colD;
      if (dx + dy < -r * 0.9) return colL;
    });
    return s.outline(C.outline);
  };
  /** Scalloped flower: `lobes` round petals with little notches between them. */
  function petals(s, c, r, lobes, col, vein) {
    for (let y = 0; y < s.h; y++)
      for (let x = 0; x < s.w; x++) {
        const dx = x + 0.5 - c, dy = y + 0.5 - c, d = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
        const k = Math.abs(Math.cos((lobes / 2) * a));
        if (d <= r * (0.62 + 0.38 * k)) s.set(x, y, k < 0.3 && d > r * 0.45 ? vein : col);
      }
  }
  Art.daisy = function (r) {
    const [s, c] = canvasFor(r);
    petals(s, c, r, 8, C.white, C.creamDark);
    s.each((x, y, col) => (col === C.white && y + 0.5 - c > r * 0.4 ? C.cream : undefined));
    s.ellipse(c, c, r * 0.34, r * 0.34, C.yellow);
    s.set(c + 1, c + 1, C.yellowDark); s.set(c - 1, c - 1, C.yellowLight);
    return s.outline(C.outline);
  };
  Art.tulip = function (r) {
    const [s, c] = canvasFor(r);
    s.ellipse(c, c + 1, r * 0.78, r * 0.82, C.yellow);
    for (let i = -1; i <= 1; i++) {
      const px = c + i * r * 0.5, top = c - r * (i === 0 ? 0.95 : 0.7);
      s.rect(px - 0.5, top, 1, 3, C.yellow); s.rect(px - 1.5, top + 1, 3, 2, C.yellow);
    }
    s.each((x, y) => {
      const dx = x + 0.5 - c;
      if (Math.abs(dx) < 0.6 && y > c - 1) return C.yellowDark;
      if (dx > r * 0.35 && y > c) return C.yellowDark;
      if (dx < -r * 0.45 && y < c + 1) return C.yellowLight;
    });
    return s.outline(C.outline);
  };
  Art.cosmos = function (r) {
    const [s, c] = canvasFor(r);
    petals(s, c, r, 5, C.pinkLight, C.pink);
    s.each((x, y, col) => (Math.hypot(x + 0.5 - c, y + 0.5 - c) < r * 0.5 && col === C.pinkLight ? C.pink : undefined));
    s.ellipse(c, c, r * 0.28, r * 0.28, C.yellow);
    return s.outline(C.outline);
  };

  /* ---------- Bouquet: wrapped base + bloomable flower heads ---------- */
  Art.bouquet = function () {
    const W = 50, H = 64, cx = 25;
    const s = new S(W, H);
    const heads = [
      { sp: Art.daisy(6), x: 11, y: 14 },
      { sp: Art.daisy(6), x: 39, y: 14 },
      { sp: Art.cosmos(5), x: 7, y: 25 },
      { sp: Art.cosmos(5), x: 43, y: 25 },
      { sp: Art.tulip(5), x: 17, y: 25 },
      { sp: Art.tulip(5), x: 33, y: 25 },
      { sp: Art.rose(4.6, C.pinkLight, C.white, C.pink), x: 25, y: 27 },
      { sp: Art.rose(5, C.pink, C.pinkLight, C.pinkDark), x: 15, y: 18 },
      { sp: Art.rose(5, C.pink, C.pinkLight, C.pinkDark), x: 35, y: 18 },
      { sp: Art.rose(6.6, C.pink, C.pinkLight, C.pinkDark), x: 25, y: 14 }
    ];
    // back paper fan
    for (let y = 8; y < 38; y++) {
      const hw = 21 - (y - 8) * 0.36;
      for (let x = Math.round(cx - hw); x <= Math.round(cx + hw); x++) {
        if (y === 8 && x % 3 === 0) continue;
        s.set(x, y, (x + y) % 5 === 0 ? C.pink : C.pinkLight);
      }
    }
    // stems
    heads.forEach((h) => s.line(h.x, h.y, cx + (h.x - cx) * 0.15, 52, C.sageDark, 2));
    // leaves
    [[8, 31, 5, 2.2], [42, 31, 5, 2.2], [12, 35, 4, 1.7], [38, 35, 4, 1.7]].forEach(([x, y, rx, ry]) => {
      s.ellipse(x, y, rx, ry, C.sage);
      s.rect(x - rx + 1, y + ry - 1, rx * 2 - 2, 1, C.sageDark);
    });
    // baby's breath sprigs
    [[4, 18], [46, 18], [8, 8], [42, 8]].forEach(([x, y]) =>
      [[0, 0], [2, -1], [1, 1], [-1, 2], [3, 1], [-2, 0]].forEach(([dx, dy]) => s.set(x + dx, y + dy, C.white))
    );
    // front cone of wrapping paper
    for (let y = 33; y < 62; y++) {
      const hw = 17 - (y - 33) * (14 / 29);
      const l = Math.round(cx - hw), r = Math.round(cx + hw);
      for (let x = l; x <= r; x++) {
        if (y === 33 && (x - l) % 4 === 0) continue;
        let col = C.cream;
        if (x < l + 2) col = C.white;
        else if (x > r - 2) col = C.creamDark;
        else if (x === Math.round(cx - hw * 0.35) || x === Math.round(cx + hw * 0.45)) col = C.creamDark;
        s.set(x, y, col);
      }
    }
    // ribbon & bow on the wrap
    for (let y = 46; y < 49; y++) {
      const hw = 17 - (y - 33) * (14 / 29);
      s.rect(Math.round(cx - hw), y, Math.round(hw * 2) + 1, 1, y === 48 ? C.pinkDark : C.pink);
    }
    s.line(cx - 1, 49, cx - 4, 57, C.pink, 2); s.line(cx + 1, 49, cx + 4, 57, C.pink, 2);
    s.ellipse(cx - 4.5, 47, 4, 2.6, C.pink); s.ellipse(cx + 4.5, 47, 4, 2.6, C.pink);
    s.set(cx - 5, 47, C.pinkDark); s.set(cx + 5, 47, C.pinkDark);
    s.rect(cx - 2, 45, 4, 4, C.pinkDark); s.rect(cx - 1, 46, 2, 2, C.pinkLight);
    s.outline(C.outline);
    return { base: s, heads };
  };

  /* ---------- Cute camera ---------- */
  Art.camera = function () {
    const s = new S(38, 30);
    s.rect(4, 3, 10, 5, C.creamDark); s.rect(5, 4, 8, 2, C.yellow); s.set(5, 4, C.yellowLight); s.set(6, 4, C.yellowLight);
    s.rect(26, 4, 7, 4, C.pinkDark); s.rect(26, 4, 7, 1, C.pink);
    s.rect(2, 7, 34, 20, C.pink);
    s.rect(2, 7, 34, 4, C.cream); s.rect(2, 10, 34, 1, C.creamDark);
    s.rect(3, 11, 1, 15, C.pinkLight); s.rect(34, 8, 1, 18, C.pinkDark); s.rect(3, 25, 32, 1, C.pinkDark);
    [[2, 7], [35, 7], [2, 26], [35, 26]].forEach(([x, y]) => s.set(x, y, null));
    s.ellipse(19, 17.5, 8, 8, C.creamDark); s.ellipse(18.6, 17.1, 7, 7, C.cream);
    s.ellipse(19, 17.5, 5.4, 5.4, C.lens); s.ellipse(19, 17.5, 3, 3, C.lensLight);
    s.set(16, 14, C.white); s.set(17, 14, C.white); s.set(16, 15, C.white); s.set(21, 20, C.white);
    s.rect(28, 12, 5, 3, C.lens); s.set(28, 12, C.white);
    s.grid(["X.X", "XXX", ".X."], { X: C.white }, 5, 14);
    s.outline(C.outline);
    return { sprite: s, flash: { x: 9, y: 5 } };
  };

  /* ---------- Two books (Book Date present) ---------- */
  Art.books = function () {
    const s = new S(24, 22);
    // book 1: tall pink hardback with a heart label
    s.rect(2, 2, 9, 18, C.pink); s.rect(2, 2, 1, 18, C.pinkLight); s.rect(10, 2, 1, 18, C.pinkDark);
    s.rect(3, 3, 7, 1, C.pinkDark); s.rect(3, 18, 7, 1, C.pinkDark);
    s.rect(4, 6, 5, 5, C.cream); s.grid([".X.X.", "XXXXX", ".XXX.", "..X.."], { X: C.pinkDark }, 4, 6);
    s.rect(4, 13, 5, 1, C.pinkLight); s.rect(4, 15, 4, 1, C.pinkLight);
    // book 2: shorter yellow book with stripes & a star (1px gap → separate outline)
    s.rect(12, 6, 9, 14, C.yellow); s.rect(12, 6, 1, 14, C.yellowLight); s.rect(20, 6, 1, 14, C.yellowDark);
    s.rect(13, 8, 7, 1, C.pinkDark); s.rect(13, 17, 7, 1, C.pinkDark);
    s.grid(["..X..", ".XXX.", "XXXXX", ".X.X."], { X: C.white }, 14, 11);
    // little page edges peeking at the top
    s.rect(3, 1, 7, 1, C.cream); s.rect(13, 5, 7, 1, C.cream);
    return s.trim(1).outline(C.outline);
  };

  /** Paste `src` onto `dst` at (ox, oy). */
  function stamp(dst, src, ox, oy) {
    src.px.forEach((c, i) => c && dst.set(ox + (i % src.w), oy + Math.floor(i / src.w), c));
  }

  /* ---------- Sunny picnic scene: blanket, basket, books, flowers ---------- */
  Art.picnic = function () {
    const W = 84, H = 54, s = new S(W, H);
    const HILL = "#cfe6c2", WICKER = "#eebd84", WICKER_D = "#cc915a";
    // sky + sun + clouds
    s.rect(0, 0, W, 32, C.yellowLight);
    for (let y = 0; y < 32; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < W; x += 4) if (y < 12) s.set(x, y, C.cream);
    s.ellipse(12, 10, 5.5, 5.5, C.yellowDark); s.ellipse(11.6, 9.6, 4.6, 4.6, C.yellow); s.rect(10, 7, 2, 1, C.white);
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4;
      s.rect(12 + Math.cos(a) * 8 - 0.5, 10 + Math.sin(a) * 8 - 0.5, 2, 2, C.yellowDark);
    }
    const cloud = new S(18, 8).ellipse(6, 5, 5, 3, C.white).ellipse(11, 4, 5, 3.5, C.white).ellipse(14, 5.5, 3.5, 2.4, C.white).outline("#e9d6c0");
    stamp(s, cloud, 52, 3); stamp(s, cloud.trim(0), 32, 12);
    // hills & grass
    s.ellipse(64, 34, 30, 8, HILL); s.ellipse(14, 35, 26, 7, HILL);
    s.rect(0, 32, W, H - 32, C.sage);
    [[4, 36], [70, 38], [9, 50], [77, 49], [40, 51], [62, 52], [20, 44], [80, 42], [2, 46]].forEach(([x, y]) => {
      s.set(x, y, C.sageDark); s.set(x + 2, y, C.sageDark); s.set(x + 1, y + 1, C.sageDark);
    });
    // checkered picnic blanket in perspective
    const blanket = new S(56, 16);
    for (let r = 0; r < 14; r++) {
      const l = 9 - r * 0.6, rt = 45 + r * 0.6;
      for (let x = Math.round(l); x <= Math.round(rt); x++) {
        const u = (x - l) / (rt - l), v = r / 14;
        blanket.set(x, r + 1, (Math.floor(u * 8) + Math.floor(v * 4)) % 2 ? C.white : C.pink);
      }
    }
    blanket.each((x, y, c) => (y === 14 ? (c === C.pink ? C.pinkDark : C.pinkLight) : undefined));
    stamp(s, blanket.outline(C.outline), 12, 35);
    // two books lying on the blanket
    const book = (cover, edge) => new S(11, 7).rect(1, 1, 9, 5, cover).rect(1, 5, 9, 1, C.cream).rect(9, 1, 1, 5, edge).outline(C.outline);
    const b1 = book(C.pink, C.pinkDark); b1.rect(3, 2, 3, 2, C.white);
    const b2 = book(C.yellow, C.yellowDark); b2.set(4, 2, C.pinkDark); b2.set(6, 2, C.pinkDark); b2.rect(4, 3, 3, 1, C.pinkDark);
    stamp(s, b1, 24, 40); stamp(s, b2, 33, 43);
    // wicker basket with a peek of pink cloth
    const bk = new S(18, 15);
    for (let a = Math.PI; a <= Math.PI * 2; a += 0.08) bk.set(9 + Math.cos(a) * 6, 7 + Math.sin(a) * 6, WICKER_D);
    bk.rect(2, 6, 14, 2, C.pinkLight); bk.set(4, 6, C.white); bk.set(9, 6, C.white); bk.set(13, 6, C.white);
    bk.rect(2, 8, 14, 6, WICKER);
    bk.each((x, y, c) => (c === WICKER && (x + y * 2) % 4 === 0 ? WICKER_D : undefined));
    bk.rect(2, 8, 14, 1, WICKER_D);
    stamp(s, bk.outline(C.outline), 47, 31);
    // flowers dotted in the grass
    const fl = (x, y, petal) => { s.set(x, y - 1, petal); s.set(x - 1, y, petal); s.set(x + 1, y, petal); s.set(x, y + 1, petal); s.set(x, y, C.yellowDark); s.set(x, y + 2, C.sageDark); };
    [[5, 41, C.pink], [8, 47, C.white], [3, 51, C.pinkLight], [72, 45, C.pink], [78, 51, C.white], [68, 50, C.yellow], [16, 51, C.yellow], [56, 50, C.pinkLight], [75, 39, C.white]].forEach(([x, y, c]) => fl(x, y, c));
    // a couple of floating hearts
    s.grid([".X.X.", "XXXXX", ".XXX.", "..X.."], { X: C.pinkDark }, 30, 22);
    s.grid([".X.X.", "XXXXX", ".XXX.", "..X.."], { X: C.pink }, 40, 18);
    // frame
    const out = new S(W + 2, H + 2);
    stamp(out, s, 1, 1);
    return out.outline(C.outline);
  };

  /* ---------- Tiny inline icons (used instead of emojis in dialogue text) ---------- */
  Art.icons = {
    heart: () => BD.small("heart7", C.pink, { hi: C.white, outline: true }),
    camera: () => BD.grid([".YY...DD.", "PPPPPPPPP", "PPPWWWPPP", "PPWLLLWPP", "PPWLLLWPP", "PPPWWWPPP", "PPPPPPPPP"],
      { Y: C.yellow, D: C.pinkDark, P: C.pink, W: C.cream, L: C.lens }),
    duck: () => BD.grid(["..YYY....", ".YYYYY...", ".YYKYYOO.", ".YYYYYO..", "..YYY....", "YYYYYYY..", "YYYYYYYY.", ".YYYYYY.."],
      { Y: C.yellow, K: C.ink, O: C.orange }),
    books: () => BD.grid(["PPPP.YYYY", "PWWP.YYYY", "PPPP.YDDY", "PPPP.YYYY", "PPPP.YDDY", "PPPP.YYYY", "PPPP.YYYY"],
      { P: C.pink, W: C.white, Y: C.yellow, D: C.pinkDark })
  };
  ["camera", "duck", "books"].forEach((k) => {
    const make = Art.icons[k];
    Art.icons[k] = () => { const g = make(), p = new S(g.w + 2, g.h + 2); stamp(p, g, 1, 1); return p.outline(C.outline); };
  });

  /* ---------- Light rays & helpers ---------- */
  Art.rays = function (w, h) {
    const s = new S(w, h), ox = w / 2;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const dx = x + 0.5 - ox, dy = h - (y + 0.5);
        const a = Math.atan2(dx, dy), d = Math.hypot(dx, dy);
        if (Math.abs(a) > 1.05 || d > h) continue;
        if (d > h * 0.78 && (x + y) % 2) continue;
        const band = Math.floor((a + 1.05) / 0.21);
        s.set(x, y, band % 2 ? "#fff6c8e6" : d < h * 0.45 ? "#ffffffcc" : "#ffffff80");
      }
    return s;
  };
  Art.shadow = function (w) {
    return new S(w, 4).ellipse(w / 2, 2, w / 2, 2, "#c97f9f33");
  };
})();
