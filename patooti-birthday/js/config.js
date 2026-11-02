/* =====================================================================
 *  BIRTHDAY CONFIG — edit everything personal here!
 *  Messages, names, colours and timings all live in this one file.
 * ===================================================================== */
window.BIRTHDAY_CONFIG = {
  // ---- The big reveal ------------------------------------------------
  nickname: "Patooti!",                 // shown in UPPERCASE automatically
  greeting: "HAPPY BIRTHDAY",
  subtitle: "ITS THE MOST WONDERFUL TIME OF THE YEARRRR",       // ❤️ is drawn as a pixel heart

  // ---- Gift selection --------------------------------------------------
  backLabel: "BACK TO PRESENTS",

  // ---- Present messages (RPG dialogue boxes) ---------------------------
  messages: {
    flowers: { speaker: "FLOWERS", text: "For my prettiest flower <3" },
    duck:    { speaker: "DUCKY",   text: "QUACK QUACK OPEN THE BLUE PARCEL" }
  },

  // ---- Instruction box shown when a small present is clicked ------------
  // then: "open"      → continue into the present (camera photo booth / reveal)
  //       "back"      → button returns to the presents
  //       "celebrate" → hearts & sparkles party, then a BACK TO PRESENTS button
  // backButton (optional) adds a second button that returns to the presents.
  // Emojis 💗 ❤️ 📸 📷 🐥 📚 are drawn as little pixel sprites. "\n" = new line.
  intros: {
    camera: {
      speaker: "CAMERA",
      text: "SOWWWII This one's not ready yet... BUT! I've prepared a little Photo Booth for you hehe! 📸",
      button: "LET'S TAKE PHOTOS!", then: "open"
    },
    flowers: {
      speaker: "FLOWERS",
      text: "Wait!! You need to open the BIG BOX first! 💗",
      button: "OPEN ANYWAY!", then: "open", backButton: "GO BACK"
    },
    duck: {
      speaker: "DUCKY",
      text: "HEHE rmb the small blue present? You have to open it first!",
      button: "OPEN ANYWAY!", then: "open", backButton: "GO BACK"
    },
    book: {
      speaker: "BOOK DATE",
      text: "*1 SPECIAL DATE COUPON* 📚💗\nGo to a bookstore together, pick out one book for each other, and then find a CUTIE spot for a picnic where we can read our new books together!",
      button: "IT'S A DATE! 💗", then: "celebrate"
    }
  },

  // ---- Party cam (the camera present) ---------------------------------
  camera: {
    title: "PARTY CAM",
    caption: "HAPPY BIRTHDAY PATOOTI",       // printed under every photo
    fileName: "patooti-party-cam",            // download name (.png added)
    asking:      "SAY CHEESE! PLEASE ALLOW CAMERA ACCESS...",
    denied:      "THE CAMERA IS SHY TEEHEE... I WONT HACK YOU... JUST CLICK THE BUTTON ABOVE!",
    noCamera:    "HMM... NO CAMERA FOUND ON THIS DEVICE. TRY AN ANDRIOD?",
    busy:        "THE CAMERA IS BUSY IN ANOTHER APP. CLOSE IT AND TRY AGAIN!",
    unsupported: "THIS BROWSER CAN'T USE THE CAMERA HERE. TRY CHROME, SAFARI OR FIREFOX ON LOCALHOST OR HTTPS!"
  },

  // ---- Palette (pastel pink / cream / white / pastel yellow) -----------
  colors: {
    pink: "#f7a8c4", pinkLight: "#ffd3e2", pinkDark: "#e57ca4",
    cream: "#fff3dc", creamDark: "#f0d8ae", white: "#ffffff",
    yellow: "#ffe48a", yellowLight: "#fff5c7", yellowDark: "#f5c451",
    orange: "#f8a660", orangeDark: "#e07f3e",
    sage: "#a9cf9f", sageDark: "#7aa982",
    lens: "#6d4e68", lensLight: "#9c7c98",
    outline: "#8c4f6b", ink: "#5a2f45",
    bg: "#fff6ea", check: "#ffe8ef"
  },

  // ---- Timings (ms) ------------------------------------------------------
  timing: {
    revealLetterMs: 70,   // delay between greeting letters
    revealHoldMs: 4200,   // how long the greeting stays before the 3 presents
    typeMs: 40            // dialogue typewriter speed
  },

  // ---- Audio ------------------------------------------------------------
  audio: { musicVolume: 0.14, sfxVolume: 0.4 }
};
