/* PRESENT 1 — Party Cam: a retro photo booth using the webcam.
 * Still labelled "COMING SOON" on the selection screen as a cheeky surprise.
 * Uses the custom `open(api)` hook: main.js calls it instead of the default
 * unwrap → reveal → dialogue flow, and calls the returned cleanup on close. */
(function () {
  const BD = window.BD, C = BD.C, A = BD.Audio, FX = BD.FX;
  const T = window.BIRTHDAY_CONFIG.camera;
  const OW = 160, OH = 120; // party overlay resolution (4:3), scaled up crisp
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const COLORS = [C.pink, C.pinkDark, C.yellow, C.white, C.pinkLight, C.yellowDark];

  /* ---------- pixel party popper (tip bottom-left, opening top-right) ---------- */
  const POP_L = 15, POP_MOUTH = { x: 1 + POP_L * 0.7071, y: 18 - POP_L * 0.7071 };
  function popperSprite() {
    const s = new BD.Sprite(20, 20);
    for (let y = 0; y < 20; y++)
      for (let x = 0; x < 20; x++) {
        const vx = x + 0.5 - 1, vy = y + 0.5 - 18;
        const along = (vx - vy) * 0.7071, perp = (vx + vy) * 0.7071;
        if (along >= 0 && along <= POP_L && Math.abs(perp) <= along * 0.42 + 0.5)
          s.set(x, y, along > POP_L - 2 ? C.white : Math.floor(along / 3) % 2 ? C.pink : C.yellow);
      }
    return s.outline(C.outline);
  }

  /* ---------- animated party overlay ---------- */
  class PartyOverlay {
    constructor(canvas) {
      this.cv = canvas; canvas.width = OW; canvas.height = OH;
      this.ctx = canvas.getContext("2d");
      this.popper = popperSprite().toCanvas();
      this.parts = []; this.t = 0; this.recoil = [0, 0]; this.side = 0;
      this.stars = [[6, 40], [30, 12], [152, 50], [128, 14], [10, 72], [150, 84], [44, 8], [114, 8], [4, 22], [154, 28]];
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
      setTimeout(() => this.fire(0), 300); setTimeout(() => this.fire(1), 700);
    }
    mouth(side) {
      const y = OH - 21 + POP_MOUTH.y;
      return side === 0 ? { x: 2 + POP_MOUTH.x, y } : { x: OW - 2 - POP_MOUTH.x, y };
    }
    fire(side) {
      const m = this.mouth(side), dir = side === 0 ? 1 : -1;
      for (let i = 0; i < 24; i++)
        this.parts.push({ x: m.x, y: m.y, vx: dir * rand(0.2, 1), vy: -rand(1.5, 3.1), g: 0.05, life: rand(80, 130), age: 0, kind: pick(["conf", "conf", "sq", "star"]), color: pick(COLORS), ph: rand(0, 6) });
      this.recoil[side] = 6;
    }
    loop() {
      const t = ++this.t;
      if (t % 75 === 0) { this.fire(this.side); this.side ^= 1; }
      if (t % 5 === 0) { // gentle confetti rain, kept to the sides so faces stay clear
        const x = Math.random() < 0.5 ? rand(0, 38) : rand(122, OW);
        this.parts.push({ x, y: -2, vx: 0, vy: rand(0.3, 0.6), g: 0, life: 260, age: 0, kind: pick(["conf", "sq"]), color: pick(COLORS), ph: rand(0, 6), sway: 0.25 });
      }
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    }
    draw() {
      const g = this.ctx, t = this.t;
      g.clearRect(0, 0, OW, OH);
      // bunting along the top edge
      g.fillStyle = C.outline; g.fillRect(0, 0, OW, 1);
      for (let x = 0, i = 0; x < OW; x += 9, i++) {
        g.fillStyle = [C.pink, C.yellow, C.white, C.pinkLight][i % 4];
        for (let r = 0; r < 4; r++) g.fillRect(x + 1 + r, 1 + r, 7 - r * 2, 1);
      }
      // curly streamers hanging from the corners
      for (let k = 0; k < 4; k++) {
        const len = 22 + ((k * 7) % 13);
        g.fillStyle = [C.pink, C.yellow, C.pinkDark, C.white][k];
        for (let y = 5; y < len; y++) {
          const w = Math.round(Math.sin(y * 0.35 + t * 0.06 + k) * 2);
          g.fillRect(3 + k * 7 + w, y, 2, 1);
          g.fillRect(OW - 5 - k * 7 - w, y, 2, 1);
        }
      }
      // twinkling stars
      this.stars.forEach(([x, y], i) => {
        const on = (Math.floor(t / 18) + i) % 3;
        const c = FX.sprite(on ? "star" : "sparkleS", i % 2 ? C.yellow : C.white);
        if (on !== 2 || i % 2) g.drawImage(c, x - (c.width >> 1), y - (c.height >> 1));
      });
      // confetti
      const keep = [];
      for (const p of this.parts) {
        p.age++; p.vy += p.g; p.vx *= 0.99;
        p.x += p.vx + (p.sway ? Math.sin(p.age * 0.08 + p.ph) * p.sway : 0); p.y += p.vy;
        if (p.age > p.life || p.y > OH + 4) continue;
        keep.push(p);
        const x = Math.round(p.x), y = Math.round(p.y);
        g.fillStyle = p.color;
        if (p.kind === "sq") g.fillRect(x, y, 1, 1);
        else if (p.kind === "conf") Math.floor(p.age / 6 + p.ph) % 2 ? g.fillRect(x, y, 2, 1) : g.fillRect(x, y, 1, 2);
        else g.drawImage(FX.sprite("star", p.color), x - 2, y - 2);
      }
      this.parts = keep;
      // party poppers in the bottom corners (with a little recoil when they pop)
      for (let side = 0; side < 2; side++) {
        const r = this.recoil[side] > 0 ? this.recoil[side]-- && 1 : 0;
        g.save();
        if (side === 0) g.drawImage(this.popper, 2 - r, OH - 21 + r);
        else { g.translate(OW, 0); g.scale(-1, 1); g.drawImage(this.popper, 2 - r, OH - 21 + r); }
        g.restore();
      }
    }
    destroy() { cancelAnimationFrame(this.raf); }
  }

  /* ---------- photo composition: mirrored webcam + overlay + booth frame ---------- */
  async function compose(video, overlay) {
    const vw = video.videoWidth, vh = video.videoHeight;
    if (!vw || !vh) return null;
    const PW = 960, PH = 720, B = 24, CAP = 120;
    let sw = vw, sh = vw * 0.75;
    if (sh > vh) { sh = vh; sw = vh / 0.75; }
    const sx = (vw - sw) / 2, sy = (vh - sh) / 2;
    const cv = document.createElement("canvas");
    cv.width = PW + B * 2; cv.height = PH + B + CAP;
    const g = cv.getContext("2d");
    g.fillStyle = C.pink; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = C.pinkLight; // pixel polka dots on the frame
    for (let y = 4; y < cv.height; y += 16) for (let x = (y / 16) % 2 ? 4 : 12; x < cv.width; x += 16) g.fillRect(x, y, 4, 4);
    g.fillStyle = C.outline; g.fillRect(B - 6, B - 6, PW + 12, PH + 12);
    g.save(); g.translate(B + PW, B); g.scale(-1, 1);
    g.drawImage(video, sx, sy, sw, sh, 0, 0, PW, PH);
    g.restore();
    g.imageSmoothingEnabled = false;
    g.drawImage(overlay, B, B, PW, PH);
    // caption plate
    const cy = B + PH + 18, ch = CAP - 36;
    g.fillStyle = C.outline; g.fillRect(B - 6, cy - 6, PW + 12, ch + 12);
    g.fillStyle = C.cream; g.fillRect(B, cy, PW, ch);
    try { await document.fonts.load('24px "Press Start 2P"'); } catch (e) { /* fallback font is fine */ }
    g.fillStyle = C.ink; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = '24px "Press Start 2P", monospace';
    g.fillText(T.caption, cv.width / 2, cy + ch * 0.38);
    g.font = '14px "Press Start 2P", monospace'; g.fillStyle = C.pinkDark;
    g.fillText(new Date().toLocaleDateString("en-GB").replace(/\//g, "."), cv.width / 2, cy + ch * 0.76);
    const heart = BD.small("heart7", C.pink, { hi: C.white, outline: true }).toCanvas();
    g.drawImage(heart, B + 36, cy + ch / 2 - 16, 36, 32);
    g.drawImage(heart, B + PW - 72, cy + ch / 2 - 16, 36, 32);
    return new Promise((res) => cv.toBlob((b) => res(b), "image/png"));
  }

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  BD.presents.push({
    id: "camera",
    label: "CAMERA",
    wrap: { w: 22, h: 16, lidH: 6, paper: C.cream, paperLight: C.white, paperDark: C.creamDark, ribbon: C.pink, ribbonLight: C.pinkLight, ribbonDark: C.pinkDark, pattern: "dots" },

    /** Shown with the "Oopsie!" instruction box before the booth opens. */
    introArt() {
      const { sprite, flash } = BD.Art.camera();
      const el = document.createElement("div");
      el.className = "art camera-intro";
      el.style.width = `calc(var(--s) * ${sprite.w}px)`;
      el.style.height = `calc(var(--s) * ${sprite.h}px)`;
      el.appendChild(BD.spriteEl(sprite));
      const glint = BD.place(BD.spriteEl(BD.small("sparkle", C.white, { hi: C.yellow }), "camera-glint"), flash.x - 2, flash.y - 2);
      el.appendChild(glint);
      const badge = document.createElement("div");
      badge.className = "soon-badge"; badge.textContent = "COMING SOON";
      el.appendChild(badge);
      return { el, w: sprite.w, h: sprite.h + 8 };
    },

    open(api) {
      const sceneSection = document.getElementById("scene-present");
      sceneSection.classList.add("booth-mode");

      /* --- build the booth UI --- */
      const booth = el("div", "booth");
      const top = el("div", "booth-top");
      top.append(el("span", "rec"), el("span", "booth-title", T.title), BD.spriteImg(BD.small("heart7", C.pink, { hi: C.white, outline: true }), 3));
      const view = el("div", "booth-view");
      const video = el("video", "booth-video");
      video.muted = true; video.playsInline = true; video.autoplay = true;
      video.setAttribute("playsinline", ""); video.setAttribute("aria-label", "Live camera preview");
      const ov = el("canvas", "booth-overlay px");
      ov.setAttribute("aria-hidden", "true");
      const count = el("div", "booth-count"); count.setAttribute("aria-live", "assertive");
      const photo = el("img", "booth-photo"); photo.alt = "Your party cam photo"; photo.hidden = true;
      const status = el("div", "booth-status"); status.hidden = true;
      const statusText = el("p", "booth-msg");
      const retry = el("button", "pixel-btn", "TRY AGAIN"); retry.type = "button";
      status.append(BD.spriteImg(BD.Art.camera().sprite, 3, "booth-cam-icon"), statusText, retry);
      view.append(video, ov, count, photo, status);

      const controls = el("div", "booth-controls");
      const closeBtn = el("button", "pixel-btn booth-close", "CLOSE"); closeBtn.type = "button";
      const shutter = el("button", "bare shutter"); shutter.type = "button";
      shutter.setAttribute("aria-label", "Take a photo");
      const ss = new BD.Sprite(20, 20).ellipse(10, 10, 9, 9, C.pinkDark).ellipse(10, 10, 7.5, 7.5, C.white).ellipse(10, 10, 5.5, 5.5, C.pink).ellipse(8.5, 8.5, 1.8, 1.8, C.pinkLight);
      shutter.appendChild(BD.spriteImg(ss.outline(C.outline), 4));
      const retake = el("button", "pixel-btn", "RETAKE"); retake.type = "button"; retake.hidden = true;
      const download = el("a", "pixel-btn booth-dl", "DOWNLOAD"); download.hidden = true;
      download.download = T.fileName + ".png";
      controls.append(retake, shutter, download, closeBtn);
      booth.append(top, view, controls);
      api.scene.appendChild(booth);

      const overlay = new PartyOverlay(ov);
      let stream = null, closed = false, shooting = false, photoUrl = null;

      const stopStream = (s) => s && s.getTracks().forEach((tr) => tr.stop());
      const setStatus = (kind) => {
        status.hidden = !kind;
        shutter.disabled = !!kind;
        booth.classList.toggle("no-cam", !!kind);
        if (!kind) return;
        statusText.textContent = T[kind] || T.denied;
        retry.hidden = kind === "asking" || kind === "unsupported";
      };
      const showLive = () => {
        if (photoUrl) { URL.revokeObjectURL(photoUrl); photoUrl = null; }
        photo.hidden = true; photo.removeAttribute("src");
        video.hidden = false; ov.hidden = false;
        retake.hidden = true; download.hidden = true; shutter.hidden = false;
        shutter.disabled = !stream;
      };

      async function start() {
        setStatus("asking");
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { setStatus("unsupported"); return; }
        try {
          const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
          if (closed) { stopStream(s); return; } // closed while the permission prompt was open
          stream = s;
          stream.getVideoTracks().forEach((tr) => tr.addEventListener("ended", () => { if (!closed) { stream = null; setStatus("noCamera"); } }));
          video.srcObject = s;
          await video.play().catch(() => {});
          setStatus(null);
          A.sfx("open");
        } catch (e) {
          if (closed) return;
          const n = e && e.name;
          if (n === "NotAllowedError" || n === "SecurityError" || n === "PermissionDeniedError") setStatus("denied");
          else if (n === "NotFoundError" || n === "DevicesNotFoundError" || n === "OverconstrainedError") setStatus("noCamera");
          else if (n === "NotReadableError" || n === "TrackStartError" || n === "AbortError") setStatus("busy");
          else setStatus("denied");
        }
      }

      async function shoot() {
        if (!stream || shooting) return;
        shooting = true; shutter.disabled = true;
        for (const n of ["3", "2", "1"]) {
          count.textContent = n;
          count.animate([{ transform: "scale(2)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }], { duration: 250, easing: "steps(4)" });
          A.sfx("click");
          await BD.wait(650);
          if (closed) return;
        }
        count.textContent = "";
        A.sfx("shutter");
        overlay.fire(0); overlay.fire(1);
        await BD.wait(120); // let the confetti burst land in the shot
        const blob = await compose(video, ov);
        document.getElementById("flash").animate([{ opacity: 0 }, { opacity: 0.9 }, { opacity: 0 }], { duration: 450, easing: "steps(4)" });
        shooting = false;
        if (closed || !blob) { shutter.disabled = !stream; return; }
        photoUrl = URL.createObjectURL(blob);
        photo.src = photoUrl; download.href = photoUrl;
        photo.hidden = false; video.hidden = true; ov.hidden = true;
        shutter.hidden = true; retake.hidden = false; download.hidden = false;
        A.sfx("celebrate");
        const r = view.getBoundingClientRect();
        FX.burst(r.left + r.width / 2, r.top + r.height / 2, { n: 40, speed: 3.5 });
        download.focus({ preventScroll: true });
      }

      shutter.addEventListener("click", shoot);
      retake.addEventListener("click", () => { A.sfx("back"); showLive(); shutter.focus({ preventScroll: true }); });
      download.addEventListener("click", () => A.sfx("sparkle"));
      retry.addEventListener("click", () => { A.sfx("click"); start(); });
      closeBtn.addEventListener("click", () => api.close());

      start(); // only ever requested here, after she clicked the camera present

      return () => {
        closed = true;
        stopStream(stream); stream = null;
        video.srcObject = null;
        overlay.destroy();
        if (photoUrl) URL.revokeObjectURL(photoUrl);
        sceneSection.classList.remove("booth-mode");
      };
    }
  });
})();
