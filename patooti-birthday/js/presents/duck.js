/* PRESENT 3 — Jellycat-style duckling plushie. */
(function () {
  const BD = window.BD, C = BD.C, FX = BD.FX, A = BD.Audio;
  const msg = window.BIRTHDAY_CONFIG.messages.duck;

  BD.presents.push({
    id: "duck",
    label: "DUCKY",
    message: msg,
    wrap: { w: 22, h: 16, lidH: 6, paper: C.yellow, paperLight: C.yellowLight, paperDark: C.yellowDark, ribbon: C.pink, ribbonLight: C.white, ribbonDark: C.pinkDark, pattern: "checks" },
    stageWrap: { w: 30, h: 20, lidH: 7, paper: C.yellow, paperLight: C.yellowLight, paperDark: C.yellowDark, ribbon: C.pink, ribbonLight: C.white, ribbonDark: C.pinkDark, pattern: "checks" },

    art() {
      const sp = BD.Art.duck();
      const el = document.createElement("button");
      el.type = "button";
      el.className = "art duck-art bare";
      el.setAttribute("aria-label", "Squeeze the duck plushie");
      el.style.width = `calc(var(--s) * ${sp.w}px)`;
      el.style.height = `calc(var(--s) * ${sp.h}px)`;
      el.appendChild(BD.spriteEl(sp, "duck-sprite"));
      return { el, w: sp.w, h: sp.h };
    },

    async onReveal(el) {
      A.sfx("boing");
      setTimeout(() => A.sfx("quack"), 250);
      el.classList.add("bouncing");
      const heartsNear = (n) => {
        const r = el.getBoundingClientRect();
        const side = Math.random() < 0.5 ? 0.1 : 0.9;
        FX.hearts(r.left + r.width * side, r.top + r.height * (0.2 + Math.random() * 0.4), n);
      };
      heartsNear(3); heartsNear(3);
      const iv = setInterval(() => heartsNear(1), 650);
      const squeeze = () => {
        A.sfx("quack");
        const r = el.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height * 0.4, { n: 14, kinds: ["heart", "bigheart", "sparkle"], colors: [C.pink, C.pinkLight, C.white], speed: 2, g: 0.03 });
        el.querySelector(".duck-sprite").animate(
          [{ transform: "scale(1)" }, { transform: "scale(1.15, .8)" }, { transform: "scale(.92, 1.1)" }, { transform: "scale(1)" }],
          { duration: 400, easing: "steps(4)" }
        );
      };
      el.addEventListener("click", squeeze);
      return () => { clearInterval(iv); el.removeEventListener("click", squeeze); };
    }
  });
})();
