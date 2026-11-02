/* Pop-cat cursor (desktop / fine pointers only).
 * Two stacked images: mouth open (default) and mouth closed (while clicking).
 * Phones and touch screens keep their normal behaviour. */
(function () {
  const BD = window.BD;
  const CAT = {
    open: "img/cat-open.png",
    closed: "img/cat-closed.png",
    width: 108,          // CSS px on screen
    hotX: 67, hotY: 51,  // the point that clicks: the middle of the cat's mouth
    holdMs: 170          // how long the mouth stays shut on a quick click
  };

  BD.Cursor = {
    init() {
      if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const el = document.getElementById("cursor");
      const root = document.documentElement;
      const inner = document.createElement("div");
      inner.className = "cat-cursor";
      inner.style.width = CAT.width + "px";
      const mk = (src, cls) => Object.assign(document.createElement("img"), { src, className: cls, alt: "", draggable: false });
      const open = mk(CAT.open, "cat-open"), closed = mk(CAT.closed, "cat-closed");
      inner.append(open, closed);
      el.appendChild(inner);
      el.classList.add("hidden");

      // only hide the system cursor once the cat has actually loaded
      let loaded = 0;
      const ready = () => { if (++loaded === 2) root.classList.add("has-cursor"); };
      const fail = () => { root.classList.remove("has-cursor"); el.remove(); };
      [open, closed].forEach((img) => {
        if (img.complete && img.naturalWidth) ready();
        else { img.addEventListener("load", ready, { once: true }); img.addEventListener("error", fail, { once: true }); }
      });

      document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        el.style.transform = `translate(${e.clientX - CAT.hotX}px, ${e.clientY - CAT.hotY}px)`;
        el.classList.remove("hidden");
      }, { passive: true });
      document.addEventListener("pointerover", (e) => {
        el.classList.toggle("hover", !!e.target.closest("button, a, [data-hover]"));
      });

      // chomp: close on press, stay shut at least holdMs, then pop back open
      let downAt = 0, upTimer = null, pressed = false;
      const reopen = () => {
        el.classList.remove("chomp");
        inner.animate(
          [{ transform: "scale(.88, 1.1)" }, { transform: "scale(1.06, .95)" }, { transform: "none" }],
          { duration: 160, easing: "ease-out" }
        );
      };
      document.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(upTimer);
        pressed = true; downAt = performance.now();
        el.classList.add("chomp");
        BD.FX.sparkles(e.clientX, e.clientY, 5);
      });
      const release = () => {
        if (!pressed) return;
        pressed = false;
        upTimer = setTimeout(reopen, Math.max(0, CAT.holdMs - (performance.now() - downAt)));
      };
      document.addEventListener("pointerup", release);
      document.addEventListener("pointercancel", release);
      window.addEventListener("blur", release);
      root.addEventListener("mouseleave", () => el.classList.add("hidden"));
    }
  };
})();
