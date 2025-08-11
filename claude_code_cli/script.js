class TicTacToe {
    constructor() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.cells = document.querySelectorAll('.cell');
        this.currentPlayerElement = document.getElementById('current-player');
        this.gameStatusElement = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-button');
        
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
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(index));
        });
        
        this.resetButton.addEventListener('click', () => this.resetGame());
        this.updateDisplay();
    }
    
    handleCellClick(index) {
        if (this.board[index] !== '' || !this.gameActive) {
            return;
        }
        
        this.makeMove(index);
        this.checkResult();
        
        if (this.gameActive) {
            this.switchPlayer();
        }
    }
    
    makeMove(index) {
        this.board[index] = this.currentPlayer;
        this.cells[index].textContent = this.currentPlayer;
        this.cells[index].classList.add(this.currentPlayer.toLowerCase());
        
        this.cells[index].style.animation = 'celebrate 0.3s ease-in-out';
        setTimeout(() => {
            this.cells[index].style.animation = '';
        }, 300);
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateDisplay();
    }
    
    checkResult() {
        let roundWon = false;
        let winningCondition = null;
        
        for (let i = 0; i < this.winningConditions.length; i++) {
            const winCondition = this.winningConditions[i];
            const a = this.board[winCondition[0]];
            const b = this.board[winCondition[1]];
            const c = this.board[winCondition[2]];
            
            if (a === '' || b === '' || c === '') {
                continue;
            }
            
            if (a === b && b === c) {
                roundWon = true;
                winningCondition = winCondition;
                break;
            }
        }
        
        if (roundWon) {
            this.gameStatusElement.textContent = `玩家 ${this.currentPlayer} 獲勝！`;
            this.gameStatusElement.style.color = '#e53e3e';
            this.gameStatusElement.classList.add('winner');
            this.gameActive = false;
            this.highlightWinningCells(winningCondition);
            return;
        }
        
        if (!this.board.includes('')) {
            this.gameStatusElement.textContent = '平局！';
            this.gameStatusElement.style.color = '#718096';
            this.gameActive = false;
            return;
        }
    }
    
    highlightWinningCells(winningCondition) {
        winningCondition.forEach(index => {
            this.cells[index].classList.add('winning-line');
        });
    }
    
    updateDisplay() {
        this.currentPlayerElement.textContent = this.currentPlayer;
        this.currentPlayerElement.style.color = this.currentPlayer === 'X' ? '#e53e3e' : '#3182ce';
        
        if (this.gameActive) {
            this.gameStatusElement.textContent = '遊戲進行中';
            this.gameStatusElement.style.color = '#4a5568';
            this.gameStatusElement.classList.remove('winner');
        }
    }
    
    resetGame() {
        this.board = ['', '', '', '', '', '', '', '', ''];
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
            cell.style.animation = '';
        });
        
        this.updateDisplay();
        
        this.resetButton.style.animation = 'celebrate 0.3s ease-in-out';
        setTimeout(() => {
            this.resetButton.style.animation = '';
        }, 300);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        document.getElementById('reset-button').click();
    }
});