const surpriseContent = window.SURPRISE_CONTENT || {};

const setText = (selector, value) => {
  const target = document.querySelector(selector);
  if (target && value) {
    target.textContent = value;
  }
};

setText("[data-intro]", surpriseContent.intro);
setText("[data-message]", surpriseContent.message);
setText("[data-signature]", surpriseContent.signature);
setText("[data-closing-title]", surpriseContent.closingTitle);
setText("[data-closing-text]", surpriseContent.closingText);

const highlightRow = document.querySelector("[data-highlights]");
if (highlightRow && Array.isArray(surpriseContent.highlights)) {
  surpriseContent.highlights.forEach((item) => {
    const pill = document.createElement("span");
    pill.className = "highlight-pill";
    pill.textContent = item;
    highlightRow.appendChild(pill);
  });
}

const gallery = document.querySelector("[data-gallery]");
if (gallery && Array.isArray(surpriseContent.gallery)) {
  surpriseContent.gallery.forEach((item, index) => {
    const card = document.createElement("figure");
    const size = item.size || "medium";
    card.className = `memory-card memory-card-${size}`;
    card.style.setProperty("--hover-tilt", item.tilt || "2deg");
    card.style.transform = `rotate(${item.tilt || "0deg"})`;

    card.innerHTML = `
      <div class="memory-frame">
        <img src="${item.src}" alt="${item.alt || ""}">
      </div>
      <figcaption>
        <span class="memory-caption-title">${item.caption || `Memory ${index + 1}`}</span>
        ${item.detail ? `<p class="memory-caption-detail">${item.detail}</p>` : ""}
      </figcaption>
    `;

    const image = card.querySelector("img");
    if (image && item.position) {
      image.style.objectPosition = item.position;
    }

    gallery.appendChild(card);
  });
}

const songPlayer = document.querySelector("[data-song-player]");
const restartSongButton = document.querySelector("[data-restart-song]");

const syncMusicChip = (message) => {
  if (!restartSongButton) {
    return;
  }

  const actionLabel = restartSongButton.querySelector(".music-chip-action");
  if (actionLabel && message) {
    actionLabel.textContent = message;
  }
};

if (songPlayer) {
  songPlayer.addEventListener("error", () => {
    syncMusicChip("Missing local MP3 file");
  });
}

const startSong = async () => {
  if (!songPlayer) {
    return;
  }

  if (!songPlayer.querySelector("source")?.src) {
    syncMusicChip("Add the local MP3 file");
    return;
  }

  songPlayer.currentTime = 0;

  try {
    await songPlayer.play();
    syncMusicChip("Replay song");
  }
  catch {
    syncMusicChip("Press Enter if needed");
  }
};

window.addEventListener("load", () => {
  restartSongButton?.focus({ preventScroll: true });
  window.setTimeout(startSong, 350);
});

if (restartSongButton) {
  restartSongButton.addEventListener("click", startSong);
}

const retrySongOnFirstInteraction = () => {
  void startSong();
};

document.addEventListener("pointerdown", retrySongOnFirstInteraction, { once: true });
document.addEventListener("keydown", retrySongOnFirstInteraction, { once: true });

const floatingGarden = document.querySelector("[data-floating-garden]");
const petalRain = document.querySelector("[data-petal-rain]");

const makeFloaty = (type, count) => {
  if (!floatingGarden) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const item = document.createElement("div");
    item.className = `floaty floaty-${type}`;
    item.style.left = `${Math.random() * 100}%`;
    item.style.setProperty("--duration", `${12 + Math.random() * 10}s`);
    item.style.setProperty("--delay", `${-Math.random() * 20}s`);
    item.style.setProperty("--drift-x", `${-8 + Math.random() * 16}vw`);
    item.style.setProperty("--twist", `${-110 + Math.random() * 220}deg`);
    item.style.setProperty("--scale", `${0.75 + Math.random() * 1.15}`);
    item.innerHTML = '<span class="shape"></span>';
    floatingGarden.appendChild(item);
  }
};

const makePetals = (count) => {
  if (!petalRain) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const petal = document.createElement("span");
    petal.className = "petal";
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.setProperty("--duration", `${10 + Math.random() * 8}s`);
    petal.style.setProperty("--delay", `${-Math.random() * 16}s`);
    petal.style.setProperty("--drift-x", `${-12 + Math.random() * 24}vw`);
    petal.style.setProperty("--twist", `${120 + Math.random() * 220}deg`);
    petal.style.setProperty("--scale", `${0.7 + Math.random() * 0.9}`);
    petalRain.appendChild(petal);
  }
};

makeFloaty("heart", 28);
makeFloaty("blossom", 20);
makeFloaty("sparkle", 18);
makePetals(28);
