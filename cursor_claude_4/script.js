class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scores = {
            X: 0,
            O: 0,
            tie: 0
        };
        
        this.winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // 橫列
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // 直行
            [0, 4, 8], [2, 4, 6] // 對角線
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.playerDisplay = document.getElementById('player-display');
        this.gameStatus = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');
        this.clearScoreBtn = document.getElementById('clear-score-btn');
        this.scoreX = document.getElementById('score-x');
        this.scoreO = document.getElementById('score-o');
        this.scoreTie = document.getElementById('score-tie');
        
        this.attachEventListeners();
        this.updateDisplay();
        this.loadScores();
    }
    
    attachEventListeners() {
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.makeMove(index));
        });
        
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.clearScoreBtn.addEventListener('click', () => this.clearScores());
    }
    
    makeMove(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        if (this.checkWinner()) {
            this.endGame(`玩家 ${this.currentPlayer} 獲勝！`);
            this.scores[this.currentPlayer]++;
            this.highlightWinningCells();
        } else if (this.board.every(cell => cell !== '')) {
            this.endGame('平局！');
            this.scores.tie++;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateDisplay();
        }
        
        this.saveScores();
    }
    
    updateCell(index) {
        const cell = this.cells[index];
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        
        // 添加動畫效果
        cell.style.transform = 'scale(0.8)';
        setTimeout(() => {
            cell.style.transform = 'scale(1)';
        }, 150);
    }
    
    checkWinner() {
        return this.winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winningPattern = pattern;
                return true;
            }
            return false;
        });
    }
    
    highlightWinningCells() {
        if (this.winningPattern) {
            this.winningPattern.forEach(index => {
                this.cells[index].classList.add('winning');
            });
        }
    }
    
    endGame(message) {
        this.gameActive = false;
        this.gameStatus.textContent = message;
        
        if (message.includes('獲勝')) {
            this.gameStatus.classList.add('winner');
        } else if (message.includes('平局')) {
            this.gameStatus.classList.add('tie');
        }
        
        this.updateScoreDisplay();
        
        // 自動重置遊戲
        setTimeout(() => {
            this.resetGame();
        }, 3000);
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.winningPattern = null;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning');
        });
        
        this.gameStatus.textContent = '';
        this.gameStatus.classList.remove('winner', 'tie');
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        this.playerDisplay.textContent = this.currentPlayer;
        this.playerDisplay.style.color = this.currentPlayer === 'X' ? '#e53e3e' : '#3182ce';
    }
    
    updateScoreDisplay() {
        this.scoreX.textContent = this.scores.X;
        this.scoreO.textContent = this.scores.O;
        this.scoreTie.textContent = this.scores.tie;
    }
    
    clearScores() {
        this.scores = { X: 0, O: 0, tie: 0 };
        this.updateScoreDisplay();
        this.saveScores();
    }
    
    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }
    
    loadScores() {
        const savedScores = localStorage.getItem('ticTacToeScores');
        if (savedScores) {
            this.scores = JSON.parse(savedScores);
            this.updateScoreDisplay();
        }
    }
}

// 遊戲初始化
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

// 鍵盤快捷鍵支援
document.addEventListener('keydown', (e) => {
    if (e.key === 'r' || e.key === 'R') {
        document.getElementById('reset-btn').click();
    }
});
