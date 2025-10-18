const gradients = [
  { name: "Cornflower Breeze", chance: 28, image: "cornflower.png" },
  { name: "Tropic Rise", chance: 15, image: "tropic.png" },
  { name: "Cyanide Frost", chance: 14, image: "cyanide.png" },
  { name: "Nautic Frost", chance: 13, image: "nautic.png" },
  { name: "Icestone", chance: 8, image: "icestone.png" },
  { name: "Dakratade", chance: 8, image: "dakratade.png" },
  { name: "Ember Ashes", chance: 5, image: "ember.png" },
  { name: "Gummy Worm", chance: 5, image: "gummy.png" },
  { name: "Eclipse", chance: 2.5, image: "eclipse.png" }
];

const infinityEye = { name: "Infinity Eye", image: "infinity.png" };

let rolls = [];
let totalPacksOpened = 0;
let currentPack = [];
let currentCardIndex = 0;

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

function spinForInfinityEye() {
  if (totalPacksOpened < 3) return null;
  if (totalPacksOpened % 10 === 0) {
    const chance = Math.random();
    if (chance < 0.005) {
      rolls.push(infinityEye.name);
      return infinityEye;
    }
  }
  return null;
}

function openPack() {
  totalPacksOpened++;
  const pack = [];
  for (let i = 0; i < 7; i++) {
    pack.push(rollGradient());
  }

  const special = spinForInfinityEye();
  if (special) pack.push(special);

  return pack;
}

function startPackAnimation() {
  const overlay = document.getElementById("ripOverlay");
  const wrapper = document.getElementById("packWrapper");
  const nextBtn = document.getElementById("nextCardBtn");

  wrapper.innerHTML = "";
  overlay.classList.remove("hidden");
  nextBtn.classList.add("hidden");

  setTimeout(() => {
    overlay.classList.add("hidden");
    currentPack = openPack();
    currentCardIndex = 0;
    nextBtn.classList.remove("hidden");
  }, 2000);
}

function revealNextCard() {
  if (currentCardIndex >= currentPack.length) {
    document.getElementById("nextCardBtn").classList.add("hidden");
    return;
  }

  const card = currentPack[currentCardIndex];
  const div = document.createElement("div");
  div.className = "card";
  div.style.opacity = 1;
  div.innerHTML = `
    <img src="${card.image}" alt="${card.name}" />
    <p>${card.name}</p>
  `;
  document.getElementById("packWrapper").appendChild(div);
  currentCardIndex++;
}



