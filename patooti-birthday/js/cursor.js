/* Oversized pixel cursor (desktop / fine pointers only). */
(function () {
  const BD = window.BD, C = BD.C;
  BD.Cursor = {
    init() {
      if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
      const el = document.getElementById("cursor");
      document.documentElement.classList.add("has-cursor");
      const down = document.createElement("div"); down.className = "c-down";
      const bob = document.createElement("div"); bob.className = "c-bob";
      bob.appendChild(BD.spriteImg(BD.cursorSprite(), 3));
      const heart = BD.spriteImg(BD.small("heart7", C.pink, { hi: C.white, outline: C.ink }), 2, "c-heart");
      down.append(bob, heart);
      el.appendChild(down);
      el.classList.add("hidden");

      document.addEventListener("pointermove", (e) => {
        if (e.pointerType !== "mouse") return;
        el.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
        el.classList.remove("hidden");
      });
      document.addEventListener("pointerover", (e) => {
        el.classList.toggle("hover", !!e.target.closest("button, a, [data-hover]"));
      });
      document.addEventListener("pointerdown", (e) => {
        if (e.pointerType !== "mouse") return;
        el.classList.add("down");
        BD.FX.sparkles(e.clientX, e.clientY, 5);
      });
      document.addEventListener("pointerup", () => el.classList.remove("down"));
      document.documentElement.addEventListener("mouseleave", () => el.classList.add("hidden"));
    }
  };
})();
