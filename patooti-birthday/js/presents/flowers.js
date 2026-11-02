/* PRESENT 2 — Flower bouquet that blooms. */
(function () {
  const BD = window.BD, C = BD.C, FX = BD.FX, A = BD.Audio;
  const msg = window.BIRTHDAY_CONFIG.messages.flowers;

  BD.presents.push({
    id: "flowers",
    label: "FLOWERS",
    message: msg,
    wrap: { w: 22, h: 16, lidH: 6, paper: C.pink, paperLight: C.pinkLight, paperDark: C.pinkDark, ribbon: C.yellow, ribbonLight: C.yellowLight, ribbonDark: C.yellowDark, pattern: "stripes" },
    stageWrap: { w: 30, h: 20, lidH: 7, paper: C.pink, paperLight: C.pinkLight, paperDark: C.pinkDark, ribbon: C.yellow, ribbonLight: C.yellowLight, ribbonDark: C.yellowDark, pattern: "stripes" },

    art() {
      const { base, heads } = BD.Art.bouquet();
      const el = document.createElement("div");
      el.className = "art bouquet-art";
      el.style.width = `calc(var(--s) * ${base.w}px)`;
      el.style.height = `calc(var(--s) * ${base.h}px)`;
      el.appendChild(BD.spriteEl(base));
      heads.forEach((h) => {
        const c = BD.place(BD.spriteEl(h.sp, "head"), h.x - h.sp.w / 2, h.y - h.sp.h / 2);
        c.style.transform = "scale(0)";
        el.appendChild(c);
      });
      return { el, w: base.w, h: base.h };
    },

    async onReveal(el) {
      const heads = [...el.querySelectorAll(".head")];
      for (let i = 0; i < heads.length; i++) {
        const h = heads[i];
        h.animate(
          [{ transform: "scale(0) rotate(-30deg)" }, { transform: "scale(1.3) rotate(8deg)", offset: 0.6 }, { transform: "scale(.92)", offset: 0.8 }, { transform: "scale(1)" }],
          { duration: 520, easing: "steps(6)", fill: "forwards" }
        );
        A.sfx("bloom", i);
        const r = h.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 6, kinds: ["petal", "sparkle"], colors: [C.pink, C.pinkLight, C.white, C.yellow], speed: 1.2, g: 0.02, life: [40, 70] });
        await BD.wait(150);
      }
      el.classList.add("sway");
      A.sfx("sparkle");
      for (let i = 0; i < 12; i++) FX.petalFall();
      const iv = setInterval(() => FX.petalFall(), 240);
      return () => clearInterval(iv);
    }
  });
})();
