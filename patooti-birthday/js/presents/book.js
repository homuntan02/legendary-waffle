/* PRESENT 4 — Book Date: an invitation to a bookstore + picnic reading date.
 * The message lives in BIRTHDAY_CONFIG.intros.book; this file draws the
 * present (two books peeking out of an open box) and the picnic scene. */
(function () {
  const BD = window.BD, C = BD.C, A = BD.Audio, FX = BD.FX;

  BD.presents.push({
    id: "book",
    label: "BOOK DATE",
    wrap: { w: 22, h: 16, lidH: 6, paper: C.pinkLight, paperLight: C.white, paperDark: C.pink, ribbon: C.yellow, ribbonLight: C.yellowLight, ribbonDark: C.yellowDark, pattern: "hearts" },

    /** Selection-screen look: lid off, two books poking out, sparkles around. */
    decorate(g) {
      const books = BD.Art.books();
      const el = BD.place(BD.spriteEl(books, "mini-books"), (g.W - books.w) / 2, g.baseTop - books.h + 7);
      g.inner.insertBefore(el, g.base);
      g.lid.style.display = "none";
      BD.place(g.bow, (g.W - g.p.bow.w) / 2, g.baseTop + 3 - g.p.bow.h / 2);
      [[-12, 8, "sparkle", C.yellow], [96, 18, "heart5", C.pink], [100, 52, "sparkle", C.white], [-10, 48, "heart5", C.pinkDark]].forEach(([x, y, k, col], i) => {
        const d = BD.spriteImg(BD.small(k, col, { hi: C.white }), 3, "gift-deco");
        d.style.left = x + "%"; d.style.top = y + "%"; d.style.animationDelay = i * -0.4 + "s";
        g.el.appendChild(d);
      });
    },

    /** Shown above the invitation: books, blanket, basket, flowers, sunshine. */
    introArt() {
      const sp = BD.Art.picnic();
      const el = document.createElement("div");
      el.className = "art picnic-art";
      el.style.width = `calc(var(--s) * ${sp.w}px)`;
      el.style.height = `calc(var(--s) * ${sp.h}px)`;
      el.appendChild(BD.spriteEl(sp));
      return { el, w: sp.w, h: sp.h };
    },

    /** "IT'S A DATE!" → hearts & sparkles everywhere. Returns a cleanup fn. */
    celebrate(el) {
      A.sfx("celebrate");
      setTimeout(() => A.sfx("sparkle"), 450);
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      document.getElementById("flash").animate([{ opacity: 0 }, { opacity: 0.35 }, { opacity: 0 }], { duration: 320, easing: "steps(3)" });
      FX.burst(cx, cy, { n: 50, kinds: ["heart", "bigheart", "sparkle"], colors: [C.pink, C.pinkLight, C.pinkDark, C.white], speed: 3.5, g: 0.03 });
      FX.burst(cx, cy, { n: 40, kinds: ["sparkle", "star", "sq"], colors: [C.yellow, C.white, C.yellowDark], speed: 4.5 });
      FX.confetti(50);
      el.animate(
        [{ transform: "none" }, { transform: "translateY(-10%) scale(1.06)" }, { transform: "translateY(2%) scale(.98)" }, { transform: "none" }],
        { duration: 600, easing: "steps(6)" }
      );
      let n = 0;
      const iv = setInterval(() => {
        FX.hearts(r.left + Math.random() * r.width, r.bottom, 2);
        if (++n > 14) clearInterval(iv);
      }, 220);
      return () => clearInterval(iv);
    }
  });
})();
