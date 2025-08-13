const board = document.getElementById("board");
const scoreDisplay = document.getElementById("score");
const overlay = document.getElementById("gameOverOverlay");

let score = 0;
let grid = []; // 4x4

// --- Init ---
document.addEventListener("keydown", keyHandler);
document.addEventListener("keydown", wasdSupport);
createBoard();

// Touch swipe (basic)
let touchStartX = 0, touchStartY = 0;
board.addEventListener("touchstart", (e) => {
  const t = e.changedTouches[0];
  touchStartX = t.clientX; touchStartY = t.clientY;
}, {passive: true});
board.addEventListener("touchend", (e) => {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if (Math.abs(dx) < 30 && Math.abs(dy) < 30) return;
  if (Math.abs(dx) > Math.abs(dy)) {
    handleMove(dx > 0 ? "ArrowRight" : "ArrowLeft");
  } else {
    handleMove(dy > 0 ? "ArrowDown" : "ArrowUp");
  }
}, {passive: true});

// --- Core ---
function createBoard() {
  score = 0;
  grid = Array.from({ length: 4 }, () => Array(4).fill(0));
  addNumber();
  addNumber();
  updateBoard();
}

function updateBoard() {
  board.innerHTML = "";
  grid.forEach(row => {
    row.forEach(num => {
      const tile = document.createElement("div");
      tile.className = "tile " + (num ? `tile-${num}` : "tile-0");
      tile.textContent = num || "";
      board.appendChild(tile);
    });
  });
  scoreDisplay.textContent = "Score: " + score;
}

function addNumber() {
  const empty = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) empty.push({ r, c });
    }
  }
  if (empty.length === 0) return false;
  const { r, c } = empty[Math.floor(Math.random() * empty.length)];
  grid[r][c] = Math.random() < 0.9 ? 2 : 4;
  return true;
}

function slide(row) {
  // compact non-zero
  row = row.filter(v => v !== 0);
  // merge
  for (let i = 0; i < row.length - 1; i++) {
    if (row[i] !== 0 && row[i] === row[i + 1]) {
      row[i] *= 2;
      score += row[i];
      row[i + 1] = 0;
      i++; // skip next
    }
  }
  // compact again
  row = row.filter(v => v !== 0);
  while (row.length < 4) row.push(0);
  return row;
}

function rotateGridCW(g = grid) {
  const n = 4;
  const res = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) res[c][n - 1 - r] = g[r][c];
  return res;
}
function rotateGridCCW(g = grid) { return rotateGridCW(rotateGridCW(rotateGridCW(g))); }
function flipRows(g = grid) { return g.map(row => [...row].reverse()); }

function handleMove(key) {
  let played = false;
  let newGrid;

  if (key === "ArrowLeft") {
    newGrid = grid.map(slide);
    played = JSON.stringify(newGrid) !== JSON.stringify(grid);
    grid = newGrid;
  } else if (key === "ArrowRight") {
    newGrid = flipRows(grid).map(slide);
    newGrid = flipRows(newGrid);
    played = JSON.stringify(newGrid) !== JSON.stringify(grid);
    grid = newGrid;
  } else if (key === "ArrowUp") {
    newGrid = rotateGridCCW(grid).map(slide);
    newGrid = rotateGridCW(newGrid);
    played = JSON.stringify(newGrid) !== JSON.stringify(grid);
    grid = newGrid;
  } else if (key === "ArrowDown") {
    newGrid = rotateGridCW(grid).map(slide);
    newGrid = rotateGridCCW(newGrid);
    played = JSON.stringify(newGrid) !== JSON.stringify(grid);
    grid = newGrid;
  }

  if (played) {
    addNumber();
    updateBoard();
    if (isGameOver()) showGameOver();
  }
}

function keyHandler(e) {
  if (["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(e.key)) {
    e.preventDefault();
    handleMove(e.key);
  }
}

// WASD support cuz vibes
function wasdSupport(e) {
  const map = { a: "ArrowLeft", d: "ArrowRight", w: "ArrowUp", s: "ArrowDown" };
  const k = e.key.toLowerCase();
  if (map[k]) {
    e.preventDefault();
    handleMove(map[k]);
  }
}

function isGameOver() {
  // any zero?
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (grid[r][c] === 0) return false;
      if (c < 3 && grid[r][c] === grid[r][c + 1]) return false;
      if (r < 3 && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

function showGameOver() {
  overlay.style.display = "flex";
  overlay.setAttribute("aria-hidden", "false");
}

function restartGame() {
  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
  createBoard();
}
