(() => {
  const boardEl = document.querySelector('.board');
  const turnTextEl = document.getElementById('turnText');
  const resultTextEl = document.getElementById('resultText');
  const scoreXEl = document.getElementById('scoreX');
  const scoreOEl = document.getElementById('scoreO');
  const scoreDrawEl = document.getElementById('scoreDraw');
  const resetBtn = document.getElementById('resetBtn');
  const clearScoreBtn = document.getElementById('clearScoreBtn');
  const modeSelect = document.getElementById('modeSelect');
  const firstMoveSelect = document.getElementById('firstMoveSelect');
  const firstMoveWrapper = document.getElementById('firstMoveWrapper');

  const STORAGE_KEY = 'ttt_score_v1';
  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  let cells = Array.from({ length: 9 }, () => null);
  let currentPlayer = 'X';
  let isGameOver = false;

  const score = loadScore();
  renderScore();

  // Render 9 cells
  renderBoard();

  // Initialize UI from defaults
  syncFirstMoveVisibility();
  updateTurnText();

  // Event bindings
  boardEl.addEventListener('click', onCellClick);
  resetBtn.addEventListener('click', () => startNewGame());
  clearScoreBtn.addEventListener('click', () => {
    persistScore({ X: 0, O: 0, D: 0 });
    renderScore();
  });
  modeSelect.addEventListener('change', () => {
    syncFirstMoveVisibility();
    startNewGame();
  });
  firstMoveSelect.addEventListener('change', () => startNewGame());

  function syncFirstMoveVisibility() {
    const isCpu = modeSelect.value === 'cpu';
    firstMoveWrapper.style.display = isCpu ? 'inline-flex' : 'inline-flex'; // keep but alter options

    // When CPU mode, show CPU option; otherwise hide it and fallback
    const hasCpuOption = Array.from(firstMoveSelect.options).some(o => o.value === 'CPU');
    if (!hasCpuOption) {
      const opt = document.createElement('option');
      opt.value = 'CPU';
      opt.textContent = '電腦';
      firstMoveSelect.appendChild(opt);
    }
    Array.from(firstMoveSelect.options).forEach(o => {
      if (o.value === 'CPU') {
        o.hidden = !isCpu;
      }
    });

    if (!isCpu && firstMoveSelect.value === 'CPU') {
      firstMoveSelect.value = 'X';
    }
  }

  function startNewGame() {
    cells = Array.from({ length: 9 }, () => null);
    isGameOver = false;
    currentPlayer = getInitialPlayer();
    resultTextEl.textContent = '';
    renderBoard();
    updateTurnText();

    // If CPU is set to go first, trigger immediately
    maybeCpuTurn();
  }

  function getInitialPlayer() {
    const isCpuMode = modeSelect.value === 'cpu';
    const first = firstMoveSelect.value;
    // 當人機對戰且選擇 CPU 先手時，CPU 使用 X
    if (isCpuMode && first === 'CPU') return 'X';
    return first === 'O' ? 'O' : 'X';
  }

  function renderBoard() {
    boardEl.innerHTML = '';
    cells.forEach((mark, idx) => {
      const btn = document.createElement('button');
      btn.className = 'cell';
      btn.setAttribute('role', 'gridcell');
      btn.setAttribute('aria-label', mark ? `格子 ${idx+1}：${mark}` : `格子 ${idx+1}：空`);
      btn.dataset.index = String(idx);
      btn.textContent = mark ? mark : '';
      btn.disabled = isGameOver || Boolean(mark);
      btn.setAttribute('aria-disabled', String(btn.disabled));
      boardEl.appendChild(btn);
    });

    const result = getGameResult(cells);
    if (result.type === 'win') {
      highlightWin(result.line);
    }
  }

  function onCellClick(e) {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (!target.classList.contains('cell')) return;
    const index = Number(target.dataset.index);
    if (Number.isNaN(index)) return;
    if (isGameOver || cells[index]) return;

    makeMove(index, currentPlayer);

    if (!isGameOver) {
      maybeCpuTurn();
    }
  }

  function makeMove(index, player) {
    cells[index] = player;
    const result = getGameResult(cells);

    if (result.type === 'win') {
      isGameOver = true;
      resultTextEl.textContent = `${player} 勝利！`;
      incrementScore(player);
      renderBoard();
    } else if (result.type === 'draw') {
      isGameOver = true;
      resultTextEl.textContent = `平手！`;
      incrementScore('D');
      renderBoard();
    } else {
      currentPlayer = player === 'X' ? 'O' : 'X';
      renderBoard();
      updateTurnText();
    }
  }

  function maybeCpuTurn() {
    const isCpuMode = modeSelect.value === 'cpu';
    if (!isCpuMode || isGameOver) return;
    const isCpuTurn = (firstMoveSelect.value === 'CPU' && currentPlayer === 'X') ||
                      (firstMoveSelect.value !== 'CPU' && currentPlayer === 'O');
    if (!isCpuTurn) return;

    // Simple AI: try to win, block, take center, take corner, otherwise first empty.
    const bestIndex = pickBestMove(cells, currentPlayer);
    if (bestIndex != null) {
      // Small delay for UX
      setTimeout(() => makeMove(bestIndex, currentPlayer), 180);
    }
  }

  function pickBestMove(board, aiPlayer) {
    const humanPlayer = aiPlayer === 'X' ? 'O' : 'X';

    // 1) Can win now?
    for (const i of emptyIndices(board)) {
      const clone = board.slice();
      clone[i] = aiPlayer;
      if (getGameResult(clone).type === 'win') return i;
    }

    // 2) Must block?
    for (const i of emptyIndices(board)) {
      const clone = board.slice();
      clone[i] = humanPlayer;
      if (getGameResult(clone).type === 'win') return i;
    }

    // 3) Take center
    if (board[4] == null) return 4;

    // 4) Take a corner
    const corners = [0, 2, 6, 8].filter(i => board[i] == null);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

    // 5) Any empty
    const empties = emptyIndices(board);
    return empties.length ? empties[0] : null;
  }

  function emptyIndices(board) {
    const arr = [];
    for (let i = 0; i < board.length; i++) if (board[i] == null) arr.push(i);
    return arr;
  }

  function getGameResult(board) {
    for (const line of WIN_LINES) {
      const [a,b,c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { type: 'win', line, winner: board[a] };
      }
    }
    if (board.every(v => v)) return { type: 'draw' };
    return { type: 'progress' };
  }

  function highlightWin(line) {
    const children = Array.from(boardEl.children);
    for (const idx of line) {
      const cell = children[idx];
      if (cell) cell.classList.add('win');
    }
  }

  function updateTurnText() {
    if (isGameOver) {
      turnTextEl.textContent = '遊戲結束';
      return;
    }
    turnTextEl.textContent = `輪到：${currentPlayer}`;
  }

  function incrementScore(key) {
    score[key] = (score[key] || 0) + 1;
    persistScore(score);
    renderScore();
  }

  function renderScore() {
    scoreXEl.textContent = String(score.X || 0);
    scoreOEl.textContent = String(score.O || 0);
    scoreDrawEl.textContent = String(score.D || 0);
  }

  function persistScore(s) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {}
  }

  function loadScore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { X: 0, O: 0, D: 0 };
      const parsed = JSON.parse(raw);
      return { X: Number(parsed.X)||0, O: Number(parsed.O)||0, D: Number(parsed.D)||0 };
    } catch {
      return { X: 0, O: 0, D: 0 };
    }
  }

  // Start immediately if CPU is first
  maybeCpuTurn();
})();
