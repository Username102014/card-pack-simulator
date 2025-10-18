document.addEventListener("DOMContentLoaded", () => {
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

  let totalPacksOpened = 0;
  let currentPack = [];
  let revealedCards = [];

  const openBtn = document.getElementById("openBtn");
  const overlay = document.getElementById("ripOverlay");
  const stage = document.getElementById("cardStage");
  const wrapper = document.getElementById("packWrapper");

  openBtn.onclick = startPackAnimation;

  function rollGradient() {
    const totalChance = gradients.reduce((sum, g) => sum + g.chance, 0);
    const rand = Math.random() * totalChance;
    let cumulative = 0;
    for (let g of gradients) {
      cumulative += g.chance;
      if (rand < cumulative) return g;
    }
    return gradients[0]; // fallback
  }

  function spinForInfinityEye() {
    if (totalPacksOpened < 3) return null;
    if (totalPacksOpened % 5 === 0 && Math.random() < 0.01) return infinityEye;
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
    stage.innerHTML = "";

    if (index >= currentPack.length) {
      displayFullPack();
      return;
    }

    const nextCard = currentPack[index + 1];
    if (nextCard) {
      const backDiv = document.createElement("div");
      backDiv.className = "card";
      backDiv.style.zIndex = "5";
      backDiv.style.opacity = "0.5";
      backDiv.innerHTML = `<img src="${nextCard.image}" alt="${nextCard.name}" />`;
      stage.appendChild(backDiv);
    }

    const card = currentPack[index];
    const frontDiv = document.createElement("div");
    frontDiv.className = "card";
    frontDiv.innerHTML = `<img src="${card.image}" alt="${card.name}" />`;

    frontDiv.onclick = () => {
      if (frontDiv.classList.contains("animate")) return;
      frontDiv.classList.add("animate");
      revealedCards.push(card);

      frontDiv.addEventListener("transitionend", () => {
        showCard(index + 1);
      }, { once: true });
    };

    stage.appendChild(frontDiv);
  }

  function displayFullPack() {
    wrapper.classList.remove("hidden");
    revealedCards.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `<img src="${card.image}" alt="${card.name}" />`;
      wrapper.appendChild(div);
    });
  }
});

