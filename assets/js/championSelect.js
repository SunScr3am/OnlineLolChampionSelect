let champions = [];
let championRoles = {};
fetch("assets/js/championsWithRoles.json")
  .then(res => res.json())
  .then(data => {
    championRoles = data;
    champions = Object.keys(data);
    generateChampionGrid();
  });

const championGrid = document.getElementById("champion-grid");
let selectedPlayer = "player1"; 
let banMode = false;
let bans = { player1: [], player2: [] };

// ==================== GESTIONE LOCAL/REMOTE ICON & LOADING ====================
const localChampionMap = {
  "ChoGath": "assets/img/champions/ChoGath.png",
  "KhaZix": "assets/img/champions/KhaZix.png",
  "LeBlanc": "assets/img/champions/LeBlanc.png",
  "RenataGlasc": "assets/img/champions/RenataGlasc.png",
  "KaiSa": "assets/img/champions/KaiSa.png"
};

function cleanChampionName(name) {
  return name.replace(/’/g, "'").replace(/\s+/g, '').trim();
}

function getImageName(champ) {
  const cleanName = cleanChampionName(champ);
  return cleanName
    .replace("Nunu&Willump","Nunu")
    .replace("Wukong","MonkeyKing")
    .replace("RenataGlasc","RenataGlasc")
    .replace("KaiSa","KaiSa")
    .replace("ChoGath","ChoGath")
    .replace("LeBlanc","LeBlanc")
    .replace("KhaZix","KhaZix")
    || cleanName;
}

function getIconSrc(champ) {
  return localChampionMap[champ] || `https://ddragon.leagueoflegends.com/cdn/15.22.1/img/champion/${getImageName(champ)}.png`;
}

function getLoadingSrc(champ) {
  if (localChampionMap[champ]) {
    return localChampionMap[champ].replace(".png", "_0.jpg");
  } else {
    return `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${getImageName(champ)}_0.jpg`;
  }
}

// ==================== GESTIONE CHAMPION GRID ====================
document.getElementById("ban-mode-btn").addEventListener("click", () => {
  banMode = !banMode;
  document.getElementById("ban-mode-btn").textContent = banMode ? "Modalità Ban Attiva" : "Attiva Ban";
});

function onChampionClick(champ) {
  if (bans.player1.includes(champ) || bans.player2.includes(champ)) {
    alert(`${champ} è bannato!`);
    return;
  }

  if (banMode) handleBan(champ);
  else selectChampion(champ);
}

function generateChampionGrid() {
  championGrid.innerHTML = "";
  champions.forEach(champ => {
    const div = document.createElement("div");
    div.className = "champion-icon";
    div.title = champ;

    const img = document.createElement("img");
    img.src = getIconSrc(champ);
    img.alt = champ;
    img.className = "champion-icon-img";
    div.appendChild(img);

    div.addEventListener("click", () => onChampionClick(champ));
    championGrid.appendChild(div);
  });
  updateChampionGridState();
}

function selectChampion(champ) {
  const champNameEl = document.getElementById(`${selectedPlayer}-champ-name`);
  const champImgEl = document.getElementById(`${selectedPlayer}-champ-img`);
  champNameEl.textContent = champ;

  champImgEl.innerHTML = ""; 
  const img = document.createElement("img");
  img.src = getLoadingSrc(champ);
  img.alt = champ;
  img.style.width = "100%";
  img.style.height = "100%";
  img.style.objectFit = "cover";
  img.onload = () => img.classList.add("visible"); // fade-in
  champImgEl.appendChild(img);

  // LOCK-IN VISUAL
  const gridIcons = Array.from(championGrid.children);
  gridIcons.forEach(div => {
    if (div.title === champ) {
      div.classList.add("locked");
      setTimeout(() => div.classList.remove("locked"), 1500);
    }
  });

  // Passa al prossimo giocatore
  selectedPlayer = selectedPlayer === "player1" ? "player2" : "player1";
  updateActivePlayerUI();
}

function handleBan(champ) {
  const playerBans = bans[selectedPlayer];
  if (playerBans.length >= 3 || playerBans.includes(champ)) return;
  playerBans.push(champ);
  updateBanUI(selectedPlayer);
  updateChampionGridState();
  selectedPlayer = selectedPlayer === "player1" ? "player2" : "player1";
  updateActivePlayerUI();
}

function updateBanUI(player) {
  const container = document.getElementById(`${player}-bans`);
  const slots = container.querySelectorAll(".ban-slot");

  slots.forEach((slot, index) => {
    if (bans[player][index]) {
      const champ = bans[player][index];
      slot.innerHTML = "";
      const img = document.createElement("img");
      img.src = getIconSrc(champ);
      img.alt = champ;
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.objectFit = "contain";
      slot.appendChild(img);

      slot.style.filter = "brightness(30%) grayscale(100%)";
      slot.style.position = "relative";

      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.top = "0";
      line.style.left = "0";
      line.style.width = "100%";
      line.style.height = "100%";
      line.style.background = "linear-gradient(135deg, rgba(255,0,0,0.8) 2px, transparent 2px)";
      line.style.pointerEvents = "none";
      slot.appendChild(line);
    } else {
      slot.innerHTML = "";
      slot.style.filter = "none";
    }
  });
}

function updateChampionGridState() {
  Array.from(championGrid.children).forEach(div => {
    const champ = div.title;
    if (bans.player1.includes(champ) || bans.player2.includes(champ)) {
      div.style.filter = "brightness(30%) grayscale(100%)";
      div.style.pointerEvents = "none";
    } else {
      div.style.filter = "none";
      div.style.pointerEvents = "auto";
    }
  });
}

function updateActivePlayerUI() {
  document.getElementById("player1-panel").classList.toggle("active", selectedPlayer === "player1");
  document.getElementById("player2-panel").classList.toggle("active", selectedPlayer === "player2");
}

function applyFilters() {
  const searchValue = document.getElementById("champ-search").value.toLowerCase();
  const roleValue = document.getElementById("role-filter").value;

  Array.from(championGrid.children).forEach(div => {
    const champName = div.title;
    const role = championRoles[champName] || "";
    const matchesSearch = champName.toLowerCase().includes(searchValue);
    const matchesRole = !roleValue || role === roleValue;
    div.style.display = matchesSearch && matchesRole ? "flex" : "none";
  });
}

document.getElementById("champ-search").addEventListener("input", applyFilters);
document.getElementById("role-filter").addEventListener("change", applyFilters);

// ======================= TIMER ANIMATO =======================
let totalTime = 30; 
let startTime = null;

const timerText = document.getElementById("timer-text");
const canvas = document.getElementById("timer-canvas");
const ctx = canvas.getContext("2d");
const radius = canvas.width / 2 - 6;

function drawTimer(progress) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(canvas.width/2, canvas.height/2, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = "#333";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(
    canvas.width/2,
    canvas.height/2,
    radius,
    -Math.PI/2,
    -Math.PI/2 + 2 * Math.PI * progress
  );

  if (progress > 0.5) ctx.strokeStyle = "#0f0";
  else if (progress > 0.25) ctx.strokeStyle = "#ff0";
  else ctx.strokeStyle = "#f00";

  ctx.lineWidth = 6;
  ctx.stroke();
}

function animateTimer(timestamp) {
  if (!startTime) startTime = timestamp;
  const elapsed = (timestamp - startTime) / 1000;
  const remaining = Math.max(totalTime - elapsed, 0);
  timerText.textContent = Math.ceil(remaining);
  const progress = remaining / totalTime;
  drawTimer(progress);

  if (remaining > 0) requestAnimationFrame(animateTimer);
  else {
    timerText.textContent = 0;
    drawTimer(0);
  }
}

requestAnimationFrame(animateTimer);

// LOCK-IN BUTTON
document.getElementById("lockin-btn").addEventListener("click", () => {
  alert("Lock-in premuto!");
});

updateActivePlayerUI();
