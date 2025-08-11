const board = document.getElementById('game-board');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart');

let cells = Array(9).fill(null);
let currentPlayer = 'X';
let gameActive = true;

function renderBoard() {
  board.innerHTML = '';
  cells.forEach((cell, idx) => {
    const cellDiv = document.createElement('div');
    cellDiv.className = 'cell';
    cellDiv.textContent = cell ? cell : '';
    cellDiv.addEventListener('click', () => handleCellClick(idx));
    board.appendChild(cellDiv);
  });
}

function handleCellClick(idx) {
  if (!gameActive || cells[idx]) return;
  cells[idx] = currentPlayer;
  renderBoard();
  if (checkWinner()) {
    statusDiv.textContent = `玩家 ${currentPlayer} 勝利！`;
    gameActive = false;
  } else if (cells.every(cell => cell)) {
    statusDiv.textContent = '平手！';
    gameActive = false;
  } else {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    statusDiv.textContent = `輪到玩家 ${currentPlayer}`;
  }
}

function checkWinner() {
  const winPatterns = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
  ];
  return winPatterns.some(pattern => {
    const [a, b, c] = pattern;
    return cells[a] && cells[a] === cells[b] && cells[a] === cells[c];
  });
}

function restartGame() {
  cells = Array(9).fill(null);
  currentPlayer = 'X';
  gameActive = true;
  statusDiv.textContent = `輪到玩家 ${currentPlayer}`;
  renderBoard();
}

restartBtn.addEventListener('click', restartGame);

// 初始化
restartGame();
