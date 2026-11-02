/* Retro RPG-style dialogue box with typewriter text.
 * Emojis listed in ICONS are drawn as pixel sprites; "\n" starts a new line. */
(function () {
  const BD = window.BD, C = BD.C;
  const typeMs = window.BIRTHDAY_CONFIG.timing.typeMs;
  const ICONS = { "💗": "heart", "❤": "heart", "♥": "heart", "📸": "camera", "📷": "camera", "🐥": "duck", "📚": "books" };

  /** Turn text into an array of nodes: one per character / icon / line break. */
  function richNodes(text) {
    return [...text.replace(/️/g, "")].map((ch) => {
      if (ch === "\n") return document.createElement("br");
      const sp = document.createElement("span");
      if (ICONS[ch]) {
        sp.className = "emo";
        const cv = BD.Art.icons[ICONS[ch]]().toCanvas();
        cv.className = "px";
        sp.appendChild(cv);
      } else sp.textContent = ch;
      return sp;
    });
  }
  BD.richText = function (el, text) {
    el.textContent = "";
    richNodes(text).forEach((n) => el.appendChild(n));
    return el;
  };

  BD.dialogue = function (host, { speaker, text, button, onClose, secondary }) {
    host.innerHTML = "";
    const plain = text.replace(/\n/g, " ");
    const box = document.createElement("div");
    box.className = "rpg-box";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", `${speaker} says: ${plain}`);

    const name = document.createElement("div");
    name.className = "rpg-name"; name.textContent = speaker;
    const p = document.createElement("p");
    p.className = "rpg-text";
    const sr = document.createElement("span");
    sr.className = "sr-only"; sr.textContent = plain;
    const vis = document.createElement("span");
    vis.setAttribute("aria-hidden", "true");
    const nodes = richNodes(text);
    nodes.forEach((n) => { if (n.tagName === "SPAN") n.classList.add("tw"); vis.appendChild(n); });
    p.append(sr, vis);
    const arrow = BD.spriteImg(BD.small("arrowDown", C.pinkDark), 3, "rpg-next");
    const btn = document.createElement("button");
    btn.className = "pixel-btn rpg-btn"; btn.type = "button";
    BD.richText(btn, button); btn.hidden = true;
    btn.addEventListener("click", (e) => { e.stopPropagation(); onClose && onClose(); });
    // optional second button (sits to the left of the main one)
    const btn2 = secondary ? document.createElement("button") : null;
    if (btn2) {
      btn2.className = "pixel-btn rpg-btn rpg-btn-alt"; btn2.type = "button";
      BD.richText(btn2, secondary.label); btn2.hidden = true;
      btn2.addEventListener("click", (e) => { e.stopPropagation(); secondary.onClick && secondary.onClick(); });
    }

    // little decorative sprites on the frame
    const deco = [
      [BD.small("heart7", C.pink, { hi: C.white, outline: true }), "d1"],
      [BD.small("sparkle", C.yellow, { hi: C.white }), "d2"],
      [BD.small("star7", C.yellow, { hi: C.white, outline: true }), "d3"]
    ].map(([sp, cls]) => BD.spriteImg(sp, 3, "rpg-deco " + cls));

    box.append(name, p, arrow, btn, ...(btn2 ? [btn2] : []), ...deco);
    host.appendChild(box);

    const spans = nodes.filter((n) => n.tagName === "SPAN");
    let i = 0, timer = null, done = false;
    const finish = () => {
      if (done) return;
      done = true; clearInterval(timer);
      spans.forEach((s) => s.classList.add("on"));
      arrow.hidden = true;
      btn.hidden = false;
      if (btn2) btn2.hidden = false;
      btn.focus({ preventScroll: true });
    };
    timer = setInterval(() => {
      const s = spans[i++];
      if (s) { s.classList.add("on"); if (i % 2 && s.textContent.trim()) BD.Audio.sfx("type"); }
      if (i >= spans.length) finish();
    }, typeMs);
    box.addEventListener("click", finish); // click to skip typing

    box.animate(
      [{ transform: "translateY(30px) scale(.6, .1)", opacity: 0 }, { transform: "translateY(-6px) scale(1.03, 1.05)", opacity: 1, offset: 0.7 }, { transform: "none", opacity: 1 }],
      { duration: 380, easing: "steps(6)" }
    );
    return {
      box, btn,
      setButton(label, handler) { BD.richText(btn, label); onClose = handler; if (btn2) btn2.remove(); },
      destroy() { clearInterval(timer); host.innerHTML = ""; }
    };
  };
})();
