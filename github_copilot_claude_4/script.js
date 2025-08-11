class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.scoreX = 0;
        this.scoreO = 0;
        
        // 獲勝組合
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.initializeGame();
    }
    
    initializeGame() {
        // 綁定事件監聽器
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
        document.getElementById('newGameBtn').addEventListener('click', () => this.newGame());
        
        this.updateDisplay();
        this.loadScore();
    }
    
    handleCellClick(index) {
        // 檢查遊戲是否結束或格子已被占用
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        // 下棋
        this.board[index] = this.currentPlayer;
        this.updateCell(index);
        
        // 檢查遊戲狀態
        this.checkGameResult();
        
        // 切換玩家
        if (this.gameActive) {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateCurrentPlayerDisplay();
        }
    }
    
    updateCell(index) {
        const cell = document.querySelector(`[data-cell="${index}"]`);
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());
        cell.classList.add('disabled');
    }
    
    checkGameResult() {
        let roundWon = false;
        let winningCombination = [];
        
        // 檢查是否有獲勝組合
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                roundWon = true;
                winningCombination = condition;
                break;
            }
        }
        
        if (roundWon) {
            this.handleWin(winningCombination);
            return;
        }
        
        // 檢查是否平局
        if (!this.board.includes('')) {
            this.handleDraw();
        }
    }
    
    handleWin(winningCombination) {
        this.gameActive = false;
        
        // 高亮獲勝格子
        winningCombination.forEach(index => {
            document.querySelector(`[data-cell="${index}"]`).classList.add('winning');
        });
        
        // 更新分數
        if (this.currentPlayer === 'X') {
            this.scoreX++;
        } else {
            this.scoreO++;
        }
        
        this.updateScore();
        this.saveScore();
        
        // 顯示獲勝訊息
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = `🎉 玩家 ${this.currentPlayer} 獲勝！`;
        statusElement.className = 'game-status winner';
        
        // 禁用所有格子
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.add('disabled');
        });
    }
    
    handleDraw() {
        this.gameActive = false;
        const statusElement = document.getElementById('gameStatus');
        statusElement.textContent = '🤝 平局！';
        statusElement.className = 'game-status draw';
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // 清除所有格子
        document.querySelectorAll('.cell').forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        // 清除狀態訊息
        document.getElementById('gameStatus').textContent = '';
        document.getElementById('gameStatus').className = 'game-status';
        
        this.updateCurrentPlayerDisplay();
    }
    
    newGame() {
        this.resetGame();
        this.scoreX = 0;
        this.scoreO = 0;
        this.updateScore();
        this.saveScore();
    }
    
    updateDisplay() {
        this.updateCurrentPlayerDisplay();
        this.updateScore();
    }
    
    updateCurrentPlayerDisplay() {
        document.getElementById('currentPlayer').textContent = this.currentPlayer;
        document.getElementById('currentPlayer').style.color = this.currentPlayer === 'X' ? '#e53e3e' : '#3182ce';
    }
    
    updateScore() {
        document.getElementById('scoreX').textContent = this.scoreX;
        document.getElementById('scoreO').textContent = this.scoreO;
    }
    
    saveScore() {
        localStorage.setItem('ticTacToeScoreX', this.scoreX.toString());
        localStorage.setItem('ticTacToeScoreO', this.scoreO.toString());
    }
    
    loadScore() {
        const savedScoreX = localStorage.getItem('ticTacToeScoreX');
        const savedScoreO = localStorage.getItem('ticTacToeScoreO');
        
        if (savedScoreX !== null) {
            this.scoreX = parseInt(savedScoreX);
        }
        if (savedScoreO !== null) {
            this.scoreO = parseInt(savedScoreO);
        }
        
        this.updateScore();
    }
}

// 當頁面載入完成時初始化遊戲
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

// 新增一些音效提示（可選）
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initAudio();
    }
    
    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.log('Audio not supported');
        }
    }
    
    playClickSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }
    
    playWinSound() {
        if (!this.audioContext) return;
        
        const frequencies = [523, 659, 783, 1047]; // C, E, G, C
        let time = this.audioContext.currentTime;
        
        frequencies.forEach((freq, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(freq, time + index * 0.1);
            gainNode.gain.setValueAtTime(0.1, time + index * 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, time + index * 0.1 + 0.2);
            
            oscillator.start(time + index * 0.1);
            oscillator.stop(time + index * 0.1 + 0.2);
        });
    }
}

// 如果需要音效，可以取消註解下面的代碼
/*
const soundEffects = new SoundEffects();

// 在handleCellClick方法中添加點擊音效
// soundEffects.playClickSound();

// 在handleWin方法中添加獲勝音效
// soundEffects.playWinSound();
*/
