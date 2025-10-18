document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script ready");

  // === Card data ===
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

  // === Compute Sell Prices ===
  function computeSellPrices() {
    const all = [...gradients, infinityEye];
    const sortedDesc = all.slice().sort((a, b) => b.chance - a.chance);
    const sortedAsc = sortedDesc.slice().reverse();
    sortedDesc.forEach((card, i) => {
      const inv = sortedAsc[i];
      card.sellPrice = Math.round(inv.chance * 100000);
      card.mps = Math.ceil(card.sellPrice / 56);
    });
  }
  computeSellPrices();

  // === Game State ===
  let coins = 0;
  let moneyPerSecond = 0;
  let inventory = [];
  let autosell = new Set();
  let currentPack = [];
  let totalPacksOpened = 0;

  const MAX_INVENTORY = 30;

  // === DOM Elements ===
  const openBtn = document.getElementById("openBtn");
  const inventoryBtn = document.getElementById("inventoryBtn");
  const autosellBtn = document.getElementById("autosellBtn");
  const sellSelectedBtn = document.getElementById("sellSelectedBtn");
  const closeAutosellBtn = document.getElementById("closeAutosellBtn");

  const coinsEl = document.getElementById("coins");
  const mpsEl = document.getElementById("mps");
  const inventoryPanel = document.getElementById("inventoryPanel");
  const autosellPanel = document.getElementById("autosellPanel");
  const inventoryList = document.getElementById("inventoryList");
  const autosellList = document.getElementById("autosellList");
  const ripOverlay = document.getElementById("ripOverlay");
  const cardStage = document.getElementById("cardStage");
  const packWrapper = document.getElementById("packWrapper");

  // === Utility ===
  function updateStats() {
    coinsEl.textContent = coins.toLocaleString();
    mpsEl.textContent = moneyPerSecond.toLocaleString();
  }

  function rollGradient() {
    const total = gradients.reduce((s, g) => s + g.chance, 0);
    const rand = Math.random() * total;
    let sum = 0;
    for (const g of gradients) {
      sum += g.chance;
      if (rand <= sum) return g;
    }
    return gradients[0];
  }

  // === Pack Open Logic ===
  openBtn.onclick = () => {
    ripOverlay.classList.remove("hidden");
    cardStage.innerHTML = "";
    packWrapper.innerHTML = "";
    setTimeout(() => {
      ripOverlay.classList.add("hidden");
      currentPack = [];
      totalPacksOpened++;

      for (let i = 0; i < 7; i++) {
        const card = rollGradient();
        processCard(card);
      }

      const special = totalPacksOpened >= 3 && Math.random() < 0.01 ? infinityEye : null;
      if (special) processCard(special);

      displayPack();
      updateStats();
    }, 1200);
  };

  function processCard(card) {
    if (autosell.has(card.name)) {
      coins += card.sellPrice;
      moneyPerSecond += card.mps;
    } else if (inventory.length < MAX_INVENTORY) {
      inventory.push({ ...card, selected: false });
    } else {
      coins += card.sellPrice;
    }
    currentPack.push(card);
  }

  // === Display ===
  function displayPack() {
    packWrapper.classList.remove("hidden");
    packWrapper.innerHTML = "";
    currentPack.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <img src="${card.image}" alt="${card.name}" onerror="this.src='images/fallback.png'">
        <p>${card.name}</p>
      `;
      packWrapper.appendChild(div);
    });
    updateInventory();
  }

  function toggleInventory() {
    inventoryPanel.classList.toggle("hidden");
    updateInventory();
  }

  function toggleAutosellPanel() {
    autosellPanel.classList.toggle("hidden");
    updateAutosellList();
  }

  function updateInventory() {
    inventoryList.innerHTML = "";
    inventory.forEach((card, i) => {
      const div = document.createElement("div");
      div.className = `card ${card.selected ? "selected" : ""}`;
      div.innerHTML = `
        <img src="${card.image}" alt="${card.name}" onerror="this.src='images/fallback.png'">
        <p>${card.name}</p>
        <p>💵 ${card.sellPrice.toLocaleString()}</p>
      `;
      div.onclick = () => {
        card.selected = !card.selected;
        updateInventory();
      };
      inventoryList.appendChild(div);
    });
  }

  function updateAutosellList() {
    autosellList.innerHTML = "";
    [...gradients, infinityEye].forEach(card => {
      const div = document.createElement("div");
      const active = autosell.has(card.name);
      div.className = `card ${active ? "selected" : ""}`;
      div.innerHTML = `
        <img src="${card.image}" alt="${card.name}" onerror="this.src='images/fallback.png'">
        <p>${card.name}</p>
        <p>💵 ${card.sellPrice.toLocaleString()}</p>
      `;
      div.onclick = () => {
        if (autosell.has(card.name)) autosell.delete(card.name);
        else autosell.add(card.name);
        updateAutosellList();
      };
      autosellList.appendChild(div);
    });
  }

  sellSelectedBtn.onclick = () => {
    const sellable = inventory.filter(c => c.selected);
    const total = sellable.reduce((a, c) => a + c.sellPrice, 0);
    const totalMps = sellable.reduce((a, c) => a + c.mps, 0);
    coins += total;
    moneyPerSecond += totalMps;
    inventory = inventory.filter(c => !c.selected);
    alert(`Sold ${sellable.length} cards for ${total.toLocaleString()} coins!`);
    updateInventory();
    updateStats();
  };

  closeAutosellBtn.onclick = toggleAutosellPanel;
});
