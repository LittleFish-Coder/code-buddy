// 井字遊戲 - 支援雙人與簡易 AI
(function(){
  const boardEl = document.getElementById('board');
  const restartBtn = document.getElementById('restartBtn');
  const turnIndicator = document.getElementById('turnIndicator');
  const modeButtons = document.querySelectorAll('.mode-btn');
  const resultDialog = document.getElementById('resultDialog');
  const resultText = document.getElementById('resultText');
  const playAgainBtn = document.getElementById('playAgainBtn');

  const WIN_LINES = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
  ];

  let board = Array(9).fill(null); // 'X' | 'O' | null
  let currentPlayer = 'X';
  let gameOver = false;
  let mode = 'pvp'; // 'pvp' | 'pve'

  function createBoard(){
    boardEl.innerHTML = '';
    for(let i=0;i<9;i++){
      const btn = document.createElement('button');
      btn.className = 'cell empty';
      btn.type = 'button';
      btn.setAttribute('data-index', i);
      btn.setAttribute('aria-label', `格子 ${i+1}`);
      btn.addEventListener('click', () => handleMove(i));
      btn.addEventListener('keydown', e => { if((e.key==='Enter'|| e.key===' ') && !gameOver){ e.preventDefault(); handleMove(i);} });
      boardEl.appendChild(btn);
    }
  }

  function handleMove(idx){
    if(gameOver || board[idx]) return;
    board[idx] = currentPlayer;
    updateCell(idx);
    const winInfo = checkWin();
    if(winInfo){
      endGame(`${currentPlayer} 勝利!`, winInfo.line);
      return;
    }
    if(board.every(c=>c)){ endGame('平手!'); return; }
    // 換人
    currentPlayer = currentPlayer === 'X' ? 'O':'X';
    updateTurn();

    if(mode==='pve' && currentPlayer==='O' && !gameOver){
      // 稍微延遲使 UI 有感覺
      setTimeout(aiMove, 260);
    }
  }

  function aiMove(){
    // 簡易策略：1. 可直接贏 -> 下 2. 擋玩家勝利 3. 取中心 4. 取角 5. 隨機
    const ai = 'O';
    const human = 'X';

    const emptyIdx = board.map((v,i)=> v? null:i).filter(i=> i!==null);

    function lineValue(line, player){
      const vals = line.map(i=>board[i]);
      const countPlayer = vals.filter(v=>v===player).length;
      const countEmpty = vals.filter(v=>!v).length;
      return {countPlayer,countEmpty, line};
    }

    // 1. 直接贏
    for(const line of WIN_LINES){
      const {countPlayer,countEmpty} = lineValue(line, ai);
      if(countPlayer===2 && countEmpty===1){
        const idx = line.find(i=>!board[i]);
        place(idx); return;
      }
    }
    // 2. 擋對方
    for(const line of WIN_LINES){
      const {countPlayer,countEmpty} = lineValue(line, human);
      if(countPlayer===2 && countEmpty===1){
        const idx = line.find(i=>!board[i]);
        place(idx); return;
      }
    }
    // 3. 中心
    if(!board[4]){ place(4); return; }
    // 4. 角
    const corners = [0,2,6,8].filter(i=>!board[i]);
    if(corners.length){ place(corners[Math.floor(Math.random()*corners.length)]); return; }
    // 5. 隨機
    place(emptyIdx[Math.floor(Math.random()*emptyIdx.length)]);

    function place(i){ handleMove(i); }
  }

  function updateCell(idx){
    const btn = boardEl.querySelector(`button[data-index='${idx}']`);
    btn.textContent = board[idx];
    btn.classList.remove('empty');
    btn.setAttribute('aria-label', `格子 ${idx+1} ${board[idx]}`);
  }

  function updateTurn(){
    turnIndicator.textContent = currentPlayer;
  }

  function checkWin(){
    for(const line of WIN_LINES){
      const [a,b,c] = line;
      if(board[a] && board[a]===board[b] && board[a]===board[c]){
        return {player: board[a], line};
      }
    }
    return null;
  }

  function endGame(message, line){
    gameOver = true;
    if(line){
      line.forEach(i=>{
        const btn = boardEl.querySelector(`button[data-index='${i}']`);
        btn.classList.add('winning');
      });
    }
    resultText.textContent = message;
    if(!resultDialog.open) resultDialog.showModal();
  }

  function restart(){
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    updateTurn();
    createBoard();
  }

  restartBtn.addEventListener('click', restart);
  playAgainBtn.addEventListener('click', () => { restart(); });

  modeButtons.forEach(btn => btn.addEventListener('click', () => {
    if(btn.classList.contains('active')) return;
    modeButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    mode = btn.dataset.mode;
    restart();
  }));

  // 點 backdrop 關閉後可以再玩
  resultDialog.addEventListener('close', () => {
    // no-op
  });

  // 初始化
  createBoard();
  updateTurn();
})();
