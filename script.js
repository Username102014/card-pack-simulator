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

  const infinityEye = { name: "Infinity Eye", chance: 1.5, image: "infinity.png" };

  // compute sell prices
  function computeSellPrices() {
    const all = [...gradients, infinityEye];
    const sortedDesc = all.slice().sort((a, b) => b.chance - a.chance);
    const sortedAsc = sortedDesc.slice().reverse();
    for (let i = 0; i < sortedDesc.length; i++) {
      const card = sortedDesc[i];
      const inv = sortedAsc[i];
      card.sellPrice = Math.round(inv.chance * 100000);
      card.mps = Math.ceil(card.sellPrice / 56);
    }
  }
  computeSellPrices();

  let totalPacksOpened = 0;
  let currentPack = [];
  let revealedCards = [];
  let inventory = [];
  let autosellSet = new Set();
  let coins = 0;
  let moneyPerSecond = 0;
  const MAX_INVENTORY = 30;

  const openBtn = document.getElementById("openBtn");
  const inventoryBtn = document.getElementById("inventoryBtn");
  const autosellBtn = document.getElementById("autosellBtn");
  const sellSelectedBtn = document.getElementById("sellSelectedBtn");
  const sellAllBtn = document.getElementById("sellAllBtn");
  const closeAutosellBtn = document.getElementById("closeAutosellBtn");
  const ripOverlay = document.getElementById("ripOverlay");
  const cardStage = document.getElementById("cardStage");
  const packWrapper = document.getElementById("packWrapper");
  const inventoryPanel = document.getElementById("inventoryPanel");
  const autosellPanel = document.getElementById("autosellPanel");
  const inventoryList = document.getElementById("inventoryList");
  const autosellListEl = document.getElementById("autosellList");
  const coinsEl = document.getElementById("coins");
  const mpsEl = document.getElementById("mps");
  const searchInput = document.getElementById("inventorySearch");

  openBtn.onclick = startPackAnimation;
  inventoryBtn.onclick = toggleInventory;
  autosellBtn.onclick = toggleAutosellPanel;
  sellSelectedBtn.onclick = sellSelectedCards;
  sellAllBtn.onclick = sellAllInventory;
  closeAutosellBtn.onclick = toggleAutosellPanel;
  searchInput.oninput = updateInventoryDisplay;

  function rollGradient() {
    const total = gradients.reduce((s, g) => s + g.chance, 0);
    const r = Math.random() * total;
    let cum = 0;
    for (let g of gradients) {
      cum += g.chance;
      if (r < cum) return g;
    }
    return gradients[0];
  }

  function spinForInfinityEye() {
    if (totalPacksOpened < 3) return null;
    if (totalPacksOpened % 5 === 0 && Math.random() < 0.01) return infinityEye;
    return null;
  }

  function addCardToInventory(card, pack) {
    if (autosellSet.has(card.name)) {
      coins += card.sellPrice;
      moneyPerSecond += card.mps;
    } else {
      if (inventory.length < MAX_INVENTORY) {
        inventory.push({ ...card, selected: false });
      } else {
        coins += card.sellPrice;
        moneyPerSecond += card.mps;
      }
    }
    pack.push(card);
  }

  function openPack() {
    totalPacksOpened++;
    const pack = [];
    for (let i = 0; i < 7; i++) addCardToInventory(rollGradient(), pack);
    const special = spinForInfinityEye();
    if (special) addCardToInventory(special, pack);
    updateStats();
    updateInventoryDisplay();
    return pack;
  }

  function startPackAnimation() {
    cardStage.innerHTML = "";
    packWrapper.innerHTML = "";
    packWrapper.classList.add("hidden");
    ripOverlay.classList.remove("hidden");
    revealedCards = [];
    setTimeout(() => {
      ripOverlay.classList.add("hidden");
      currentPack = openPack();
      showCard(0);
    }, 1000);
  }

  function showCard(index) {
    cardStage.innerHTML = "";
    if (index >= currentPack.length) {
      displayFullPack();
      return;
    }
    const card = currentPack[index];
    const div = document.createElement("div");
    div.className = "card flip-in";
    div.innerHTML = `<img src="${card.image}" alt="${card.name}">`;
    div.onclick = () => {
      revealedCards.push(card);
      showCard(index + 1);
    };
    cardStage.appendChild(div);
  }

  function displayFullPack() {
    packWrapper.classList.remove("hidden");
    packWrapper.innerHTML = "";
    revealedCards.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `<img src="${card.image}" alt="${card.name}">`;
      packWrapper.appendChild(div);
    });
  }

  function toggleInventory() {
    inventoryPanel.classList.toggle("hidden");
    updateInventoryDisplay();
  }

  function toggleAutosellPanel() {
    autosellPanel.classList.toggle("hidden");
    updateAutosellList();
  }

  function updateInventoryDisplay() {
    const filter = searchInput.value.toLowerCase();
    inventoryList.innerHTML = "";
    inventory
      .filter(c => c.name.toLowerCase().includes(filter))
      .forEach((card, i) => {
        const div = document.createElement("div");
        div.className = "card" + (card.selected ? " selected" : "");
        div.innerHTML = `<img src="${card.image}" alt="${card.name}">`;
        div.onclick = () => {
          card.selected = !card.selected;
          updateInventoryDisplay();
        };
        inventoryList.appendChild(div);
      });
  }

  function updateAutosellList() {
    autosellListEl.innerHTML = "";
    [...gradients, infinityEye].forEach(card => {
      const div = document.createElement("div");
      div.className = "card" + (autosellSet.has(card.name) ? " selected" : "");
      div.innerHTML = `<img src="${card.image}" alt="${card.name}">`;
      div.onclick = () => {
        if (autosellSet.has(card.name)) autosellSet.delete(card.name);
        else autosellSet.add(card.name);
        updateAutosellList();
      };
      autosellListEl.appendChild(div);
    });
  }

  function sellSelectedCards() {
    const sold = inventory.filter(c => c.selected);
    sold.forEach(c => {
      coins += c.sellPrice;
      moneyPerSecond += c.mps;
    });
    inventory = inventory.filter(c => !c.selected);
    updateInventoryDisplay();
    updateStats();
  }

  function sellAllInventory() {
    inventory.forEach(c => {
      coins += c.sellPrice;
      moneyPerSecond += c.mps;
    });
    inventory = [];
    updateInventoryDisplay();
    updateStats();
  }

  function updateStats() {
    coinsEl.textContent = coins.toLocaleString();
    mpsEl.textContent = moneyPerSecond.toLocaleString();
  }
});

