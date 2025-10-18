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
let revealedCards = [];

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
  if (totalPacksOpened % 5 === 0) {
    const chance = Math.random();
    if (chance < 0.01) {
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
  const stage = document.getElementById("cardStage");
  const wrapper = document.getElementById("packWrapper");

  stage.innerHTML = "";
  wrapper.innerHTML = "";
  wrapper.classList.add("hidden");
  overlay.classList.remove("hidden");
  revealedCards = [];

  setTimeout(() => {
    overlay.classList.add("hidden");
    currentPack = openPack();
    showCard(0);
  }, 2000);
}

function showCard(index) {
  const stage = document.getElementById("cardStage");
  stage.innerHTML = "";

  if (index >= currentPack.length) {
    displayFullPack();
    return;
  }

  // Back card (next one)
  const nextCard = currentPack[index + 1];
  if (nextCard) {
    const backDiv = document.createElement("div");
    backDiv.className = "card";
    backDiv.style.zIndex = "5";
    backDiv.style.opacity = "0.5";
    backDiv.innerHTML = `<img src="${nextCard.image}" alt="${nextCard.name}" />`;
    stage.appendChild(backDiv);
  }

  // Front card (current one)
  const card = currentPack[index];
  const frontDiv = document.createElement("div");
  frontDiv.className = "card";
  frontDiv.innerHTML = `<img src="${card.image}" alt="${card.name}" />`;

  frontDiv.onclick = () => {
    frontDiv.classList.add("animate");
    revealedCards.push(card);
    setTimeout(() => {
      showCard(index + 1);
    }, 600);
  };

  stage.appendChild(frontDiv);
}

function displayFullPack() {
  const wrapper = document.getElementById("packWrapper");
  wrapper.classList.remove("hidden");

  revealedCards.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.image}" alt="${card.name}" />`;
    wrapper.appendChild(div);
  });
}




