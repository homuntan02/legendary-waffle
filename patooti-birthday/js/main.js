/* Game flow: opening gift → explosion → greeting → present selection → presents. */
(function () {
  const BD = window.BD, C = BD.C, A = BD.Audio, FX = BD.FX, cfg = window.BIRTHDAY_CONFIG;
  const $ = (s) => document.querySelector(s);
  const wait = BD.wait;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- setup ---------- */
  Object.entries(C).forEach(([k, v]) => document.documentElement.style.setProperty(`--${k}`, v));
  FX.init();
  BD.Cursor.init();

  /* ---------- scenes ---------- */
  let current = $("#scene-gift");
  async function go(sel) {
    const next = $(sel);
    if (next === current) return;
    await current.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: "steps(5)" }).finished;
    current.classList.remove("active");
    next.classList.add("active");
    document.body.dataset.scene = next.id;
    current = next;
    onResize();
    await next.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: "steps(5)" }).finished;
  }

  /* ---------- background decorations ---------- */
  (function buildBg() {
    const bg = $("#bg-deco");
    const kinds = [
      () => BD.small("heart7", C.pink, { hi: C.white, outline: true }),
      () => BD.small("star7", C.yellow, { hi: C.white, outline: true }),
      () => BD.small("flower", C.pinkLight, { outline: true }),
      () => BD.small("sparkle", C.white, { hi: C.yellow }),
      () => BD.small("heart5", C.pinkLight)
    ];
    const n = innerWidth < 640 ? 12 : 22;
    for (let i = 0; i < n; i++) {
      const el = BD.spriteImg(kinds[i % kinds.length](), Math.random() < 0.5 ? 3 : 4, "deco");
      el.style.left = rand(2, 95) + "%";
      el.style.top = rand(2, 94) + "%";
      el.style.animationDelay = -rand(0, 6) + "s";
      el.style.animationDuration = rand(4, 8) + "s";
      bg.appendChild(el);
    }
  })();

  /* ---------- HUD (music / mute / back) ---------- */
  const btnMusic = $("#btn-music"), btnMute = $("#btn-mute"), btnBack = $("#btn-back");
  function renderHud() {
    btnMusic.innerHTML = ""; btnMute.innerHTML = "";
    btnMusic.append(BD.spriteImg(BD.small("note", A.musicOn ? C.pinkDark : C.creamDark), 2), label(A.musicOn ? "ON" : "OFF"));
    btnMute.append(BD.spriteImg(BD.small(A.muted ? "speakerOff" : "speakerOn", A.muted ? C.creamDark : C.pinkDark), 2), label(A.muted ? "OFF" : "ON"));
    btnMusic.setAttribute("aria-pressed", A.musicOn); btnMusic.setAttribute("aria-label", "Background music " + (A.musicOn ? "on" : "off"));
    btnMute.setAttribute("aria-pressed", !A.muted); btnMute.setAttribute("aria-label", "All sound " + (A.muted ? "muted" : "on"));
  }
  const label = (t) => Object.assign(document.createElement("span"), { textContent: t });
  btnMusic.addEventListener("click", () => { A.unlock(); A.setMusic(!A.musicOn); A.sfx("click"); renderHud(); });
  btnMute.addEventListener("click", () => { A.unlock(); A.setMuted(!A.muted); A.sfx("click"); renderHud(); });
  btnBack.prepend(BD.spriteImg(BD.small("arrowLeft", C.white), 3));
  btnBack.addEventListener("click", () => closePresent());
  renderHud();

  /* ---------- opening gift ---------- */
  const mainGift = new BD.Gift(BD.wraps.main);
  const mainBtn = $("#main-gift"), mainWrap = $("#main-wrap");
  mainBtn.appendChild(mainGift.el);
  // floating hearts & sparkles around the gift
  [[-14, 18, "heart7", C.pink], [104, 8, "star7", C.yellow], [-8, 70, "sparkle", C.white], [108, 64, "heart7", C.pinkLight], [46, -16, "sparkle", C.yellowLight], [92, 96, "heart5", C.pink], [2, 98, "star7", C.white]].forEach(
    ([x, y, k, col], i) => {
      const sp = k === "sparkle" || k === "heart5" ? BD.small(k, col, { hi: C.yellow }) : BD.small(k, col, { hi: C.white, outline: true });
      const el = BD.spriteImg(sp, 4, "gift-deco");
      el.style.left = x + "%"; el.style.top = y + "%";
      el.style.animationDelay = i * -0.45 + "s";
      mainWrap.appendChild(el);
    }
  );

  let stage = 0, busy = false;
  mainBtn.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    A.unlock();
    A.startMusic();
    const c = mainGift.center();
    if (stage === 0) {
      A.sfx("shake"); FX.sparkles(c.x, c.top, 8);
      await mainGift.shake(1.3);
    } else if (stage === 1) {
      A.sfx("unwrap"); mainGift.shake(0.5);
      await mainGift.loosenRibbon();
    } else if (stage === 2) {
      A.sfx("pop"); FX.sparkles(c.x, c.top - 40, 10);
      await mainGift.popBow();
    } else {
      await explodeMain();
      return;
    }
    stage++;
    busy = false;
  });

  async function explodeMain() {
    mainWrap.classList.add("still");
    A.sfx("creak");
    await mainGift.shake(0.6);
    A.sfx("open");
    await mainGift.openLid("lift");
    A.sfx("shimmer");
    mainGift.lightUp();
    let c = mainGift.center();
    for (let i = 0; i < 4; i++) { FX.sparkles(c.x + rand(-60, 60), c.top - rand(0, 80), 4); await wait(180); }
    A.sfx("shake");
    await mainGift.shake(1.8);
    c = mainGift.center();
    $("#flash").animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 700, easing: "steps(6)" });
    A.sfx("boom"); A.sfx("celebrate");
    FX.burst(c.x, c.y, { n: 140, speed: 5, up: 1, g: 0.06 });
    FX.burst(c.x, c.y, { n: 30, kinds: ["bigheart", "heart"], colors: [C.pink, C.pinkLight, C.white], speed: 3, g: 0.03 });
    FX.confetti(90);
    mainGift.el.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.5)", opacity: 0 }], { duration: 300, easing: "steps(4)", fill: "forwards" });
    await wait(900);
    await go("#scene-reveal");
    runReveal();
  }

  /* ---------- birthday reveal ---------- */
  const greet = $("#greeting");
  function buildGreeting() {
    const lines = [
      { text: cfg.greeting, cls: "l1" },
      { text: cfg.nickname.toUpperCase() + "!", cls: "l2" },
      { text: cfg.subtitle.replace(/(❤️|❤|♥️|♥)/g, "\u0001"), cls: "l3" }
    ];
    greet.setAttribute("aria-label", `${cfg.greeting} ${cfg.nickname.toUpperCase()}! ${cfg.subtitle}`);
    greet.innerHTML = "";
    let idx = 0;
    const letters = [];
    lines.forEach((ln) => {
      const line = document.createElement("span");
      line.className = "line " + ln.cls;
      line.setAttribute("aria-hidden", "true");
      ln.text.split(" ").forEach((word, wi, arr) => {
        const w = document.createElement("span"); w.className = "word";
        [...word].forEach((ch) => {
          const sp = document.createElement("span");
          sp.className = "ch";
          sp.style.setProperty("--i", idx++);
          if (ch === "\u0001") {
            sp.classList.add("heart-ch");
            sp.appendChild(BD.spriteImg(BD.small("heart7", C.pink, { hi: C.white, outline: C.outline }), 1));
          } else sp.textContent = ch;
          w.appendChild(sp); letters.push(sp);
        });
        line.appendChild(w);
        if (wi < arr.length - 1) line.appendChild(document.createTextNode(" "));
      });
      greet.appendChild(line);
      letters.push(null); // line break marker
    });
    return letters;
  }

  async function runReveal() {
    const letters = buildGreeting();
    const fw = setInterval(() => FX.firework(rand(innerWidth * 0.1, innerWidth * 0.9), rand(innerHeight * 0.1, innerHeight * 0.4)), 700);
    const hearts = setInterval(() => FX.hearts(rand(0, innerWidth), innerHeight + 10, 1), 300);
    let line = 0;
    for (const l of letters) {
      if (l === null) {
        line++;
        if (line === 2) {
          A.sfx("celebrate");
          const r = greet.getBoundingClientRect();
          FX.burst(r.left + r.width / 2, r.top + r.height * 0.5, { n: 60, speed: 4 });
        }
        await wait(260);
        continue;
      }
      l.classList.add("in");
      A.sfx("letter");
      await wait(cfg.timing.revealLetterMs);
    }
    greet.classList.add("done");
    FX.confetti(60);
    $("#reveal-skip").hidden = false;
    const revealScene = $("#scene-reveal");
    let onSkip;
    await Promise.race([
      wait(cfg.timing.revealHoldMs),
      new Promise((r) => { onSkip = r; revealScene.addEventListener("click", r); })
    ]);
    revealScene.removeEventListener("click", onSkip);
    clearInterval(fw); clearInterval(hearts);
    await go("#scene-select");
    A.sfx("open");
  }

  /* ---------- present selection ---------- */
  const row = $("#present-row");
  $("#select-title").textContent = `${cfg.greeting.replace(/,$/, "")} ${cfg.nickname.toUpperCase()}!`;
  const miniGifts = [];
  BD.presents.forEach((p, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "mini bare";
    b.setAttribute("aria-label", `Open the ${p.label.toLowerCase()} present${p.tag ? " (" + p.tag.toLowerCase() + ")" : ""}`);
    const hop = document.createElement("div");
    hop.className = "mini-hop"; hop.style.animationDelay = i * -0.6 + "s";
    const g = new BD.Gift(p.wrap);
    if (p.decorate) p.decorate(g);
    hop.appendChild(g.el);
    const shadow = BD.spriteEl(BD.Art.shadow(Math.round(g.W * 0.8)), "mini-shadow");
    b.append(hop, shadow);
    if (p.tag) {
      const t = document.createElement("span");
      t.className = "tag"; t.textContent = p.tag;
      b.appendChild(t);
    }
    const seen = BD.spriteImg(BD.small("heart7", C.pink, { hi: C.white, outline: true }), 3, "seen");
    b.appendChild(seen);
    b.addEventListener("click", () => openPresent(p, b));
    row.appendChild(b);
    miniGifts.push(g);
  });

  /* ---------- opening a present ---------- */
  const sceneEl = $("#stage-scene"), dlgHost = $("#stage-dialog"), presentSection = $("#scene-present");
  let session = 0, cleanup = null, dlg = null, opening = false;

  async function openPresent(p, btn) {
    if (opening) return;
    opening = true;
    const my = ++session;
    A.unlock(); A.startMusic(); A.sfx("click");
    btn.classList.add("picked");
    await wait(220);
    btn.classList.remove("picked");
    sceneEl.innerHTML = ""; dlgHost.innerHTML = "";
    await go("#scene-present");
    opening = false;
    if (my !== session) return;

    const intro = cfg.intros && cfg.intros[p.id];
    if (intro) showIntro(p, btn, intro, my);
    else await launch(p, btn, my);
  }

  /* Instruction box shown before a present (see `intros` in config.js). */
  function showIntro(p, btn, intro, my) {
    presentSection.classList.add("intro-mode");
    const sr = sceneEl.getBoundingClientRect();
    let art, gift = null;
    if (p.introArt) art = p.introArt();
    else { gift = new BD.Gift(p.stageWrap || p.wrap); art = { el: gift.el, w: gift.W, h: gift.H }; }
    const slot = document.createElement("div");
    slot.className = "slot content-slot";
    slot.style.setProperty("--s", clamp(Math.floor(Math.min((sr.width * 0.8) / art.w, (sr.height * 0.85) / art.h)), 2, 8));
    const holder = document.createElement("div");
    holder.className = "intro-art";
    holder.appendChild(art.el);
    [[-8, 4, "heart7", C.pink], [102, 12, "star7", C.yellow], [-6, 70, "sparkle", C.white], [100, 76, "heart7", C.pinkLight]].forEach(([x, y, k, col], i) => {
      const sp = k === "sparkle" ? BD.small(k, col, { hi: C.yellow }) : BD.small(k, col, { hi: C.white, outline: true });
      const d = BD.spriteImg(sp, 3, "gift-deco");
      d.style.left = x + "%"; d.style.top = y + "%"; d.style.animationDelay = i * -0.5 + "s";
      holder.appendChild(d);
    });
    slot.appendChild(holder);
    sceneEl.appendChild(slot);
    holder.animate([{ transform: "translateY(30px) scale(.3)", opacity: 0 }, { transform: "translateY(-6px) scale(1.08)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }], { duration: 500, easing: "steps(6)" });
    A.sfx("pop");

    // wrapped presents give a little "not yet!" wiggle now and then
    const iv = gift ? setInterval(() => gift.shake(0.6), 2400) : null;
    let extra = null;
    cleanup = () => { clearInterval(iv); if (extra) extra(); };

    dlg = BD.dialogue(dlgHost, {
      speaker: intro.speaker, text: intro.text, button: intro.button,
      secondary: intro.backButton ? { label: intro.backButton, onClick: () => { if (my === session) closePresent(); } } : null,
      onClose: async () => {
        if (my !== session) return;
        if (intro.then === "back") return closePresent();
        if (intro.then === "celebrate") {
          btn.classList.add("opened");
          extra = p.celebrate ? p.celebrate(holder) : null;
          dlg.setButton(cfg.backLabel, closePresent);
          dlg.btn.focus({ preventScroll: true });
          return;
        }
        // "open": continue into the present itself
        cleanup(); cleanup = null;
        dlg.destroy(); dlg = null;
        presentSection.classList.remove("intro-mode");
        sceneEl.innerHTML = "";
        A.sfx("click");
        await launch(p, btn, my);
      }
    });
  }

  async function launch(p, btn, my) {
    if (typeof p.open === "function") { // custom experiences (e.g. the party cam)
      cleanup = p.open({ scene: sceneEl, dialog: dlgHost, close: closePresent }) || null;
      btn.classList.add("opened");
      return;
    }

    const sr = sceneEl.getBoundingClientRect();
    const art = p.art();
    const s = clamp(Math.floor(Math.min((sr.width * 0.85) / art.w, (sr.height * 0.92) / art.h)), 2, 9);
    const contentSlot = document.createElement("div");
    contentSlot.className = "slot content-slot";
    contentSlot.style.setProperty("--s", s);
    const giftSlot = document.createElement("div");
    giftSlot.className = "slot gift-slot";
    const gift = new BD.Gift(p.stageWrap || p.wrap);
    const gs = clamp(Math.floor(Math.min((sr.width * 0.6) / gift.W, (sr.height * 0.62) / gift.H)), 2, 8);
    giftSlot.style.setProperty("--s", gs);
    giftSlot.appendChild(gift.el);
    art.el.style.opacity = "0";
    contentSlot.appendChild(art.el);
    sceneEl.append(giftSlot, contentSlot);

    // unwrap sequence
    await wait(300);
    const steps = [
      async () => { A.sfx("shake"); await gift.shake(1); },
      async () => { A.sfx("shake"); await gift.shake(1.4); },
      async () => { A.sfx("unwrap"); await gift.loosenRibbon(); },
      async () => { A.sfx("pop"); gift.popBow(); await wait(450); },
      async () => { A.sfx("open"); await gift.openLid("off"); },
      async () => { A.sfx("shimmer"); gift.lightUp(); await wait(500); }
    ];
    for (const st of steps) { if (my !== session) return; await st(); }
    if (my !== session) return;

    // pop the surprise out of the box
    const gr = gift.center(), cr = art.el.getBoundingClientRect();
    const dy = gr.top - (cr.top + cr.height / 2);
    art.el.style.opacity = "";
    A.sfx("pop");
    FX.burst(gr.x, gr.top, { n: 50, speed: 3.5, up: 1.2 });
    art.el.animate(
      [
        { transform: `translateY(${dy}px) scale(.1)`, opacity: 0 },
        { transform: "translateY(-10%) scale(1.08)", opacity: 1, offset: 0.6 },
        { transform: "translateY(2%) scale(.97)", offset: 0.82 },
        { transform: "none", opacity: 1 }
      ],
      { duration: 750, easing: "cubic-bezier(.2,.8,.3,1)" }
    );
    gift.el.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(40px)" }], { duration: 600, delay: 450, easing: "steps(6)", fill: "forwards" });
    await wait(800);
    if (my !== session) return;
    cleanup = (await p.onReveal(art.el)) || null;
    if (my !== session) { cleanup && cleanup(); cleanup = null; return; }
    btn.classList.add("opened");
    dlg = BD.dialogue(dlgHost, { speaker: p.message.speaker, text: p.message.text, button: cfg.backLabel, onClose: closePresent });
  }

  async function closePresent() {
    if (current.id !== "scene-present") return;
    session++;
    if (cleanup) { cleanup(); cleanup = null; }
    if (dlg) { dlg.destroy(); dlg = null; }
    presentSection.classList.remove("intro-mode");
    A.sfx("back");
    await go("#scene-select");
    sceneEl.innerHTML = "";
    const firstOpened = document.querySelector(".mini.opened") || document.querySelector(".mini");
    firstOpened && firstOpened.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePresent(); });

  /* ---------- responsive pixel scales ---------- */
  function onResize() {
    const vw = innerWidth, vh = innerHeight;
    const s = clamp(Math.floor(Math.min((vw * 0.66) / mainGift.W, (vh * 0.46) / mainGift.H)), 3, 10);
    mainWrap.style.setProperty("--s", s);
    const g = miniGifts[0];
    if (g) {
      // 2 × 2 grid on every screen size; scale so both rows fit comfortably
      const ms = clamp(Math.floor(Math.min((vw * 0.36) / g.W, (vh * 0.24) / g.H)), 2, 7);
      row.style.setProperty("--s", ms);
    }
  }
  addEventListener("resize", onResize);
  onResize();
  document.body.dataset.scene = "scene-gift";
})();
