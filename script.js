document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script loaded and DOM ready");

  const gradients = [
    { name: "Cornflower Breeze", chance: 28, image: "images/cornflower.png" },
    { name: "Tropic Rise", chance: 15, image: "images/tropic.png" },
    { name: "Cyanide Frost", chance: 14, image: "images/cyanide.png" },
    { name: "Nautic Frost", chance: 13, image: "images/nautic.png" },
    { name: "Icestone", chance: 8, image: "images/icestone.png" },
    { name: "Dakratade", chance: 8, image: "images/dakratade.png" },
    { name: "Ember Ashes", chance: 5, image: "images/ember.png" },
    { name: "Gummy Worm", chance: 5, image: "images/gummy.png" },
    { name: "Eclipse", chance: 2.5, image: "images/eclipse.png" }
  ];

  const infinityEye = { name: "Infinity Eye", chance: 1.5, image: "images/infinity.png" };

  // --- SELL PRICE + MPS CALC ---
  function calculateSellData(cards) {
    const sorted = [...cards, infinityEye].sort((a, b) => b.chance - a.chance);
    const inverted = [...sorted].reverse();

    sorted.forEach((card, i) => {
      const invChance = inverted[i].chance;
      const sellPrice = invChance * 100000;
      const mps = Math.ceil(sellPrice / 56);
      card.sellPrice = sellPrice;
      card.mps = mps;
    });
  }
  calculateSellData(gradients);

  // --- VARIABLES ---
  let totalPacksOpened = 0;
  let currentPack = [];
  let revealedCards = [];
  let inventory = [];
  let autosellList = new Set();
  let coins = 0;
  let moneyPerSecond = 0;
  const MAX_INVENTORY = 30;

  const openBtn = document.getElementById("openBtn");
  const inventoryBtn = document.getElementById("inventoryBtn");
  const autosellBtn = document.getElementById("autosellBtn");
  const sellSelectedBtn = document.getElementById("sellSelectedBtn");
  const closeAutosellBtn = document.getElementById("closeAutosellBtn");

  openBtn.onclick = startPackAnimation;
  inventoryBtn.onclick = toggleInventory;
  autosellBtn.onclick = toggleAutosellPanel;
  sellSelectedBtn.onclick = sellSelectedCards;
  closeAutosellBtn.onclick = toggleAutosellPanel;

  // --- CARD ROLLING ---
  function rollGradient() {
    const totalChance = gradients.reduce((sum, g) => sum + g.chance, 0);
    const rand = Math.random() * totalChance;
    let cumulative = 0;
    for (let g of gradients) {
      cumulative += g.chance;
      if (rand < cumulative) return g;
    }
    return gradients[0];
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
      const card = rollGradient();
      handleCardAdd(card, pack);
    }
    const special = spinForInfinityEye();
    if (special) handleCardAdd(special, pack);
    updateInventoryDisplay();
    updateStats();
    return pack;
  }

  function handleCardAdd(card, pack) {
    if (autosellList.has(card.name)) {
      coins += card.sellPrice;
      moneyPerSecond += card.mps;
    } else if (inventory.length < MAX_INVENTORY) {
      inventory.push({ ...card, selected: false });
    }
    pack.push(card);
  }

  // --- UI + ANIMATIONS ---
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

    const card = currentPack[index];
    const frontDiv = document.createElement("div");
    frontDiv.className = "card flip-in";
    frontDiv.innerHTML = `
      <img src="${card.image}" alt="${card.name}" />
      <p>${card.name}</p>
    `;
    frontDiv.onclick = () => {
      frontDiv.classList.add("animate");
      revealedCards.push(card);
      setTimeout(() => showCard(index + 1), 600);
    };
    stage.appendChild(frontDiv);
  }

  function displayFullPack() {
    const wrapper = document.getElementById("packWrapper");
    wrapper.classList.remove("hidden");
    revealedCards.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${card.image}" alt="${card.name}" />
        <p>${card.name}</p>
      `;
      wrapper.appendChild(div);
    });
  }

  function toggleInventory() {
    const panel = document.getElementById("inventoryPanel");
    panel.classList.toggle("hidden");
    updateInventoryDisplay();
  }

  function toggleAutosellPanel() {
    const panel = document.getElementById("autosellPanel");
    panel.classList.toggle("hidden");
    updateAutosellList();
  }

  // --- INVENTORY DISPLAY ---
  function updateInventoryDisplay() {
    const list = document.getElementById("inventoryList");
    list.innerHTML = "";
    inventory.forEach((card, i) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = `card ${card.selected ? "selected" : ""}`;
      cardDiv.innerHTML = `
        <img src="${card.image}" alt="${card.name}" />
        <p>${card.name}</p>
        <p>💵 ${card.sellPrice.toLocaleString()}</p>
      `;
      cardDiv.onclick = () => {
        card.selected = !card.selected;
        updateInventoryDisplay();
      };
      list.appendChild(cardDiv);
    });
  }

  // --- AUTOSELL SETTINGS ---
  function updateAutosellList() {
    const list = document.getElementById("autosellList");
    list.innerHTML = "";
    [...gradients, infinityEye].forEach(card => {
      const div = document.createElement("div");
      const isSelected = autosellList.has(card.name);
      div.className = `card ${isSelected ? "selected" : ""}`;
      div.innerHTML = `
        <img src="${card.image}" alt="${card.name}" />
        <p>${card.name}</p>
        <p>💵 ${card.sellPrice.toLocaleString()}</p>
      `;
      div.onclick = () => {
        if (autosellList.has(card.name)) autosellList.delete(card.name);
        else autosellList.add(card.name);
        updateAutosellList();
      };
      list.appendChild(div);
    });
  }

  // --- SELL SELECTED ---
  function sellSelectedCards() {
    let sold = 0;
    let earned = 0;
    inventory = inventory.filter(card => {
      if (card.selected) {
        sold++;
        earned += card.sellPrice;
        moneyPerSecond += card.mps;
        return false;
      }
      return true;
    });
    coins += earned;
    updateInventoryDisplay();
    updateStats();
    alert(`Sold ${sold} cards for ${earned.toLocaleString()} coins!`);
  }

  // --- STATS ---
  function updateStats() {
    document.getElementById("coins").textContent = coins.toLocaleString();
    document.getElementById("mps").textContent = moneyPerSecond.toLocaleString();
  }
});

