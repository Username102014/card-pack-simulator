const cards = [
  { name: "Dragon", chance: 5 },
  { name: "Knight", chance: 10 },
  { name: "Wizard", chance: 15 },
  { name: "Elf", chance: 10 },
  { name: "Goblin", chance: 20 },
  { name: "Orc", chance: 10 },
  { name: "Fairy", chance: 5 },
  { name: "Golem", chance: 10 },
  { name: "Vampire", chance: 10 },
  { name: "Phoenix", chance: 5 }
];

function pullCard() {
  const totalChance = cards.reduce((sum, card) => sum + card.chance, 0);
  const rand = Math.random() * totalChance;
  let cumulative = 0;

  for (let card of cards) {
    cumulative += card.chance;
    if (rand < cumulative) {
      return card.name;
    }
  }
}

document.getElementById("pullBtn").addEventListener("click", () => {
  const result = pullCard();
  document.getElementById("result").textContent = `You pulled: ${result}!`;
});
