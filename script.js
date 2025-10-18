document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Script loaded");

  // card definitions (images sit in repo root)
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

  const MAX_INVENTORY = 30;
  let totalPacksOpened = 0;
  let currentPack = [];
  let revealedCards = [];
  let inventory = [];
  let autosellList = new Set();

  // DOM nodes (guarded)
  const openBtn = document.getElementById("openBtn");
  const inventoryBtn = document.getElementById("inventoryBtn");
  const searchInput = document.getElementById("searchInput");
  const ripOverlay = document.getElementById("ripOverlay");
  const cardStage = document.getElementById("cardStage");
  const packWrapper = document.getElementById("packWrapper");
  const inventoryList = document.getElementById("inventoryList");

  // if any required element missing, log and stop attaching
  if (!openBtn || !inventoryBtn || !searchInput || !ripOverlay || !cardStage || !packWrapper || !inventoryList) {
    console.error("Critical DOM elements missing. Check IDs in index.html. Found:", {
      openBtn: !!openBtn,
      inventoryBtn: !!inventoryBtn,
      searchInput: !!searchInput,
      ripOverlay: !!ripOverlay,
      cardStage: !!cardStage,
      packWrapper: !!packWrapper,
      inventoryList: !!inventoryList
    });
    return;
  }

  openBtn.addEventListener("click", startPackAnimation);
  inventoryBtn.addEventListener("click", toggleInventory);
  searchInput.addEventListener("input", updateInventoryDisplay);

  function rollGradient() {
    const total = gradients.reduce((s, g) => s + g.chance, 0);
    let r = Math.random() * total;
    for (const g of gradients) {
      if (r < g.chance) return g;
      r -= g.chance;
    }
    return gradients[0];
  }

  function spinForInfinityEye() {
    if (totalPacksOpened < 3) return null;
    if (totalPacksOpened % 5 === 0 && Math.random() < 0.01) return infinityEye;
    return null;
  }

  // sell price logic (inversion): uses the mapping idea you provided
  function calculateSellPrice(card) {
    // use a stable known max (most common = 28) to invert proportionally
    const mostCommon = 28;
    const inv = mostCommon / (card.chance || 1);
    return Math.round(inv * 100000);
  }

  function openPack() {
    totalPacksOpened++;
    const pack = [];
    for (let i = 0; i < 7; i++) {
      const c = rollGradient();
      handleAddCard(c, pack);
    }
    const special = spinForInfinityEye();
    if (special) handleAddCard(special, pack);
    return pack;
  }

  function handleAddCard(card, packArr) {
    // autosell check
    if (autosellList.has(card.name)) {
      // autosell action could be implemented here
      // for now we do not store coins in this script; keep behavior simple
      // (you can plug coin accounting where needed)
    } else {
      if (inventory.length < MAX_INVENTORY) {
        inventory.push(card);
      } else {
        // inventory full: drop or auto-sell (no-op here)
      }
    }
    packArr.push(card);
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
    }, 700);
  }

  function showCard(index) {
    cardStage.innerHTML = "";
    if (index >= currentPack.length) {
      displayFullPack();
      return;
    }
    const card = currentPack[index];
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `<img src="${card.image}" alt="${card.name}" onerror="this.style.opacity=.5"><p>${card.name}</p>`;
    div.addEventListener("click", () => {
      revealedCards.push(card);
      showCard(index + 1);
    });
    cardStage.appendChild(div);
  }

  function displayFullPack() {
    packWrapper.classList.remove("hidden");
    packWrapper.innerHTML = "";
    revealedCards.forEach(c => {
      const d = document.createElement("div");
      d.className = "card";
      d.innerHTML = `<img src="${c.image}" alt="${c.name}" onerror="this.style.opacity=.5"><p>${c.name}</p>`;
      packWrapper.appendChild(d);
    });
    // keep inventory display in sync
    updateInventoryDisplay();
  }

  function toggleInventory() {
    const panel = document.getElementById("inventoryPanel");
    if (!panel) return;
    panel.classList.toggle("hidden");
    updateInventoryDisplay();
    // ensure panel content is centered in viewport (helpful on small screens)
    if (!panel.classList.contains("hidden")) {
      panel.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function updateInventoryDisplay() {
    const q = (searchInput.value || "").toLowerCase().trim();
    inventoryList.innerHTML = "";
    // show horizontally as a row
    const filtered = inventory.filter(c => c.name.toLowerCase().includes(q));
    if (filtered.length === 0) {
      const empty = document.createElement("div");
      empty.style.padding = "8px";
      empty.style.color = "#6b5b4b";
      empty.textContent = "No cards in inventory.";
      inventoryList.appendChild(empty);
      return;
    }
    filtered.forEach(card => {
      const div = document.createElement("div");
      div.className = "card";
      const price = calculateSellPrice(card);
      div.innerHTML = `<img src="${card.image}" alt="${card.name}" onerror="this.style.opacity=.5"><p>${card.name}</p><small>💰 ${price.toLocaleString()}</small>`;
      inventoryList.appendChild(div);
    });
  }

  // initial safe render
  updateInventoryDisplay();
});
