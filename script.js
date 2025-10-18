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
  { name: "Infinity Eye", chance: 1.5, image: "infinity.png" }
];

let rolls = [];
let infinityEyeRolled = false;

function rollGradient() {
  const totalChance = gradients.reduce((sum, g) => sum + g.chance, 0);
  const rand = Math.random() * totalChance;
  let cumulative = 0;

  for (let g of gradients) {
    cumulative += g.chance;
    if (rand < cumulative) {
      rolls.push(g.name);
      if (g.name === "Infinity Eye") infinityEyeRolled = true;
      return g;
    }
  }
}

function forceInfinityEye() {
  if (!infinityEyeRolled && rolls.length >= 65) {
    const g = gradients.find(g => g.name === "Infinity Eye");
    rolls.push(g.name);
    infinityEyeRolled = true;
    return g;
  }
  return null;
}

function openPack() {
  const pack = [];
  for (let i = 0; i < 7; i++) {
    pack.push(rollGradient());
  }
  const forced = forceInfinityEye();
  if (forced) pack.push(forced);
  displayPack(pack);
}

function displayPack(pack) {
  const wrapper = document.getElementById("packWrapper");
  wrapper.innerHTML = ""; // Clear previous pack

  pack.forEach(card => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <p>${card.name}</p>
    `;
    wrapper.appendChild(div);
  });
}
