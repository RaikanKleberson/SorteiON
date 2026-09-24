const STORAGE_KEY = "sorteion:history:v1";

const state = {
  mode: "names",
  lastWinners: [],
  isDrawing: false,
};

const els = {
  participants: document.getElementById("participants"),
  fileInput: document.getElementById("fileInput"),
  minNumber: document.getElementById("minNumber"),
  maxNumber: document.getElementById("maxNumber"),
  winnerCount: document.getElementById("winnerCount"),
  countBadge: document.getElementById("countBadge"),
  namesSection: document.getElementById("namesSection"),
  numbersSection: document.getElementById("numbersSection"),
  namesModeBtn: document.getElementById("namesModeBtn"),
  numbersModeBtn: document.getElementById("numbersModeBtn"),
  drawBtn: document.getElementById("drawBtn"),
  redrawBtn: document.getElementById("redrawBtn"),
  copyResultBtn: document.getElementById("copyResultBtn"),
  clearAllBtn: document.getElementById("clearAllBtn"),
  removeDuplicatesBtn: document.getElementById("removeDuplicatesBtn"),
  keepScreen: document.getElementById("keepScreen"),
  resultStatus: document.getElementById("resultStatus"),
  emptyResult: document.getElementById("emptyResult"),
  drawingState: document.getElementById("drawingState"),
  winnerArea: document.getElementById("winnerArea"),
  winnerList: document.getElementById("winnerList"),
  presentationBtn: document.getElementById("presentationBtn"),
  historyList: document.getElementById("historyList"),
  clearHistoryBtn: document.getElementById("clearHistoryBtn"),
  toast: document.getElementById("toast"),
};

function normalizeLines(raw) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^\uFEFF/, "").trim())
    .filter(Boolean);
}

function parseImportedText(text) {
  const lines = normalizeLines(text);
  if (!lines.length) return [];

  const rows = lines.map((line) => {
    const commaIndex = line.indexOf(",");
    if (commaIndex === -1) return line;
    return line.slice(0, commaIndex).trim().replace(/^"|"$/g, "");
  });

  const maybeHeader = rows[0].toLowerCase();
  const headerWords = ["nome", "nomes", "name", "participante", "participantes"];
  if (rows.length > 1 && headerWords.includes(maybeHeader)) {
    rows.shift();
  }
  return rows.filter(Boolean);
}

function getNames() {
  return normalizeLines(els.participants.value);
}

function getNumberPool() {
  const min = Number(els.minNumber.value);
  const max = Number(els.maxNumber.value);

  if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max)) {
    throw new Error("Digite números inteiros válidos.");
  }

  if (min > max) {
    throw new Error("O número inicial não pode ser maior que o final.");
  }

  const size = max - min + 1;
  if (!Number.isSafeInteger(size) || size <= 0) {
    throw new Error("Intervalo de números inválido.");
  }

  // Materializa apenas quando o sorteio realmente precisa dos valores.
  return { min, max, size };
}

function getItemCount() {
  if (state.mode === "names") {
    return getNames().length;
  }
  return getNumberPool().size;
}

function updateCount() {
  try {
    const count = getItemCount();
    els.countBadge.textContent = `${count.toLocaleString("pt-BR")} ${count === 1 ? "item" : "itens"}`;
  } catch {
    els.countBadge.textContent = "verifique os dados";
  }
}

function setMode(mode) {
  state.mode = mode;
  const namesActive = mode === "names";

  els.namesSection.classList.toggle("hidden", !namesActive);
  els.numbersSection.classList.toggle("hidden", namesActive);
  els.namesModeBtn.classList.toggle("active", namesActive);
  els.numbersModeBtn.classList.toggle("active", !namesActive);

  els.namesModeBtn.setAttribute("aria-selected", String(namesActive));
  els.numbersModeBtn.setAttribute("aria-selected", String(!namesActive));

  updateCount();
}

function cryptoUint32() {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0];
}

// Seleção uniforme de [0, upperExclusive) com rejeição.
function randomIndex(upperExclusive) {
  if (!Number.isSafeInteger(upperExclusive) || upperExclusive <= 0) {
    throw new Error("Tamanho de sorteio inválido.");
  }

  if (upperExclusive === 1) return 0;

  const maxUint = 0x100000000;
  const limit = maxUint - (maxUint % upperExclusive);

  let value;
  do {
    value = cryptoUint32();
  } while (value >= limit);

  return value % upperExclusive;
}

function pickUniqueFromArray(items, amount) {
  const result = [];
  const pool = items.slice();

  for (let i = 0; i < amount; i++) {
    const index = randomIndex(pool.length);
    result.push(pool[index]);
    pool[index] = pool[pool.length - 1];
    pool.pop();
  }
  return result;
}

function pickUniqueNumbers(min, size, amount) {
  // Para poucos vencedores, sorteia índices únicos sem precisar montar o intervalo inteiro.
  const pickedIndices = new Set();
  while (pickedIndices.size < amount) {
    pickedIndices.add(randomIndex(size));
  }
  return [...pickedIndices].map((index) => min + index);
}

function validateDraw() {
  const requested = Number(els.winnerCount.value);

  if (!Number.isSafeInteger(requested) || requested < 1) {
    throw new Error("A quantidade de vencedores deve ser pelo menos 1.");
  }

  const total = getItemCount();

  if (requested > total) {
    throw new Error("A quantidade de vencedores não pode ser maior que a quantidade disponível.");
  }

  return requested;
}

function setDrawingUI(isDrawing) {
  els.emptyResult.hidden = isDrawing || state.lastWinners.length > 0;
  els.drawingState.hidden = !isDrawing;
  els.winnerArea.hidden = isDrawing || state.lastWinners.length === 0;
  els.drawBtn.disabled = isDrawing;
  els.redrawBtn.disabled = isDrawing;
  els.presentationBtn.disabled = isDrawing;
}

function renderWinners(winners) {
  els.winnerList.innerHTML = "";

  winners.forEach((winner, index) => {
    const li = document.createElement("li");

    const pos = document.createElement("span");
    pos.className = "winner-position";
    pos.textContent = String(index + 1);

    const name = document.createElement("span");
    name.className = "winner-name";
    name.textContent = String(winner);

    li.append(pos, name);
    els.winnerList.appendChild(li);
  });

  els.resultStatus.textContent = `${winners.length} vencedor(es) selecionado(s).`;
}

function saveHistory(winners) {
  const history = loadHistory();
  history.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random(),
    mode: state.mode,
    winners: winners.map(String),
    timestamp: new Date().toISOString(),
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 30)));
  renderHistory();
}

function loadHistory() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "data desconhecida";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function renderHistory() {
  const history = loadHistory();
  els.historyList.innerHTML = "";

  if (!history.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = "Nenhum sorteio realizado ainda.";
    els.historyList.appendChild(empty);
    return;
  }

  history.forEach((item) => {
    const row = document.createElement("div");
    row.className = "history-item";

    const main = document.createElement("div");
    main.className = "history-main";

    const title = document.createElement("div");
    title.className = "history-title";
    title.textContent = item.winners.join(" • ");

    const meta = document.createElement("div");
    meta.className = "history-meta";
    meta.textContent = `${item.mode === "names" ? "Nomes" : "Números"} · ${formatDate(item.timestamp)}`;

    main.append(title, meta);
    row.appendChild(main);
    els.historyList.appendChild(row);
  });
}

async function draw() {
  if (state.isDrawing) return;

  try {
    const amount = validateDraw();

    state.isDrawing = true;
    setDrawingUI(true);

    if (!els.keepScreen.checked) {
      state.lastWinners = [];
      els.winnerArea.hidden = true;
    }

    const delay = Math.min(1100, 500 + amount * 100);
    await new Promise((resolve) => window.setTimeout(resolve, delay));

    let winners;
    if (state.mode === "names") {
      winners = pickUniqueFromArray(getNames(), amount);
    } else {
      const { min, size } = getNumberPool();
      winners = pickUniqueNumbers(min, size, amount);
    }

    state.lastWinners = winners;
    renderWinners(winners);
    saveHistory(winners);
    setDrawingUI(false);

    showToast("Sorteio realizado com sucesso.");
  } catch (error) {
    setDrawingUI(false);
    showToast(error.message || "Não foi possível realizar o sorteio.");
  } finally {
    state.isDrawing = false;
    els.drawBtn.disabled = false;
    els.redrawBtn.disabled = false;
    els.presentationBtn.disabled = false;
  }
}

function showToast(message) {
  els.toast.textContent = message;
  els.toast.classList.add("show");

  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    els.toast.classList.remove("show");
  }, 2600);
}

async function copyResult() {
  if (!state.lastWinners.length) {
    showToast("Ainda não há resultado para copiar.");
    return;
  }

  const title = state.mode === "names" ? "SorteiON — Resultado" : "SorteiON — Números sorteados";
  const lines = state.lastWinners.map((winner, index) => `${index + 1}. ${winner}`);
  const text = `${title}\n${lines.join("\n")}`;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Resultado copiado.");
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    showToast("Resultado copiado.");
  }
}

function removeDuplicates() {
  const names = getNames();
  const unique = [...new Set(names.map((name) => name.toLocaleLowerCase("pt-BR")))];
  const map = new Map();

  names.forEach((name) => {
    const key = name.toLocaleLowerCase("pt-BR");
    if (!map.has(key)) map.set(key, name);
  });

  const cleaned = unique.map((key) => map.get(key));
  els.participants.value = cleaned.join("\n");
  updateCount();
  showToast(`${names.length - cleaned.length} duplicado(s) removido(s).`);
}

function clearAll() {
  els.participants.value = "";
  els.minNumber.value = "1";
  els.maxNumber.value = "100";
  els.winnerCount.value = "1";
  state.lastWinners = [];
  state.isDrawing = false;
  els.emptyResult.hidden = false;
  els.drawingState.hidden = true;
  els.winnerArea.hidden = true;
  els.resultStatus.textContent = "Ainda não há sorteio realizado.";
  updateCount();
}

function togglePresentation() {
  document.body.classList.toggle("presentation-mode");
  const active = document.body.classList.contains("presentation-mode");
  els.presentationBtn.textContent = active ? "Sair da apresentação" : "Modo apresentação";

  if (active && document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else if (!active && document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
  renderHistory();
  showToast("Histórico limpo.");
}

els.namesModeBtn.addEventListener("click", () => setMode("names"));
els.numbersModeBtn.addEventListener("click", () => setMode("numbers"));
els.participants.addEventListener("input", updateCount);
els.minNumber.addEventListener("input", updateCount);
els.maxNumber.addEventListener("input", updateCount);
els.winnerCount.addEventListener("input", updateCount);
els.drawBtn.addEventListener("click", draw);
els.redrawBtn.addEventListener("click", draw);
els.copyResultBtn.addEventListener("click", copyResult);
els.removeDuplicatesBtn.addEventListener("click", removeDuplicates);
els.clearAllBtn.addEventListener("click", clearAll);
els.presentationBtn.addEventListener("click", togglePresentation);
els.clearHistoryBtn.addEventListener("click", clearHistory);

els.fileInput.addEventListener("change", async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = parseImportedText(text);

    if (!imported.length) {
      throw new Error("Não encontrei participantes no arquivo.");
    }

    els.participants.value = imported.join("\n");
    setMode("names");
    updateCount();
    showToast(`${imported.length} participante(s) importado(s).`);
  } catch (error) {
    showToast(error.message || "Não foi possível importar o arquivo.");
  } finally {
    event.target.value = "";
  }
});

setMode("names");
renderHistory();
updateCount();
