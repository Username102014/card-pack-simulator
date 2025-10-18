const gradients = [
  { name: "Cornflower Breeze", chance: 28, image: "cornflower.png" },
  { name: "Tropic Rise", chance: 15, image: "tropic.png" },
  { name: "Cyanide Frost", chance: 14, image: "cyanide.png" },
  { name: "Nautic Frost", chance: 13, image: "nautic.png" },
  { name: "Icestone", chance: 8, image: "icestone.png" },
  { name: "Dakratade", chance: 8, image: "dakratade.png" },
  { name: "Ember Ashes", chance: 5, image: "ember.png" },
  { name: "Gummy Worm", chance: 5, image: "gummy.png" },
  { name: "Eclipse", chance: 2.5, image: "eclipse.png" },
  { name: "Infinity Eye", chance: 0, image: "infinity.png" } // chance handled separately
];

let rolls = [];
let totalPacksOpened = 0;

function rollGradient() {
  const totalChance = gradients.reduce((sum, g) => sum + g.chance, 0);
  const rand = Math.random() * totalChance;
  let cumulative = 0;

  for (let g of gradients) {
    cumulative += g.chance;
    if (rand < cumulative) {
      rolls.push(g.name);
      return g;
    }
  }
}

function maybeAddInfinityEye(pack) {
  totalPacksOpened++;
  if (totalPacksOpened % 10 === 0) {
    const chance = Math.random();
    if (chance < 0.005) {
      const g = gradients.find(g => g.name === "Infinity Eye");
      pack.push(g);
      rolls.push(g.name);
    }
  }
}

function openPack() {
  const pack = [];
  for (let i = 0; i < 7; i++) {
    pack.push(rollGradient());
  }
  maybeAddInfinityEye(pack);
  return pack;
}

function startPackAnimation() {
  const overlay = document.getElementById("ripOverlay");
  const wrapper = document.getElementById("packWrapper");
  wrapper.innerHTML = "";
  overlay.classList.remove("hidden");

  setTimeout(() => {
    overlay.classList.add("hidden");
    const pack = openPack();
    revealCards(pack);
  }, 2000);
}

function revealCards(pack) {
  const wrapper = document.getElementById("packWrapper");

  pack.forEach((card, index) => {
    setTimeout(() => {
      const div = document.createElement("div");
      div.className = "card";
      div.style.animationDelay = `${index * 0.2}s`;
      div.style.opacity = 1;
      div.innerHTML = `
        <img src="${card.image}" alt="${card.name}" />
        <p>${card.name}</p>
      `;
      wrapper.appendChild(div);
    }, index * 300);
  });
}


