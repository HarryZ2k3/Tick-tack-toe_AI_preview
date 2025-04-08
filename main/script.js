let boardSize = 3;
let board = [];
let currentPlayer = 'X';
let gameOver = false;

const boardContainer = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const sizeSelector = document.getElementById('board-size');

function startGame() {
    boardSize = parseInt(sizeSelector.value);
    boardContainer.style.display = 'grid';
    resetGame();
}

function resetGame() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameOver = false;
    renderBoard();
    setStatus(`Player ${currentPlayer}'s turn`);
}

function renderBoard() {
    boardContainer.innerHTML = '';
    boardContainer.setAttribute('data-size', boardSize);

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.textContent = board[row][col];
            if (board[row][col] === '') {
                cell.classList.add('played');
            }
            cell.addEventListener('click', handleCellClick);
            boardContainer.appendChild(cell);
        }
    }
}

function handleCellClick(e) {
    if (gameOver) return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (board[row][col] !== '') return;

    handleMove(row, col);

    if (!gameOver && currentPlayer === 'O') {
        const aiMove = getBestMove(boardSize === 3 ? board.flat() : board);
        const row = boardSize === 3 ? Math.floor(aiMove / 3) : aiMove.row;
        const col = boardSize === 3 ? aiMove % 3 : aiMove.col;
        setTimeout(() => handleMove(row, col), 200);
    }
}

function handleMove(row, col) {
    if (gameOver || board[row][col] !== '') return;

    board[row][col] = currentPlayer;
    renderBoard();

    if (checkWinCondition(row, col)) {
        setStatus(`Player ${currentPlayer} wins!`);
        gameOver = true;
    } else if (isDraw()) {
        setStatus("It's a draw!");
        gameOver = true;
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        setStatus(`Player ${currentPlayer}'s turn`);
    }
}

function isDraw() {
    return board.every(row => row.every(cell => cell !== ''));
}

function checkWinCondition(row, col) {
    const streakToWin = boardSize === 3 ? 3 : boardSize === 6 ? 4 : 5;
    const symbol = board[row][col];

    function count(dirRow, dirCol) {
        let r = row + dirRow;
        let c = col + dirCol;
        let count = 0;
        while (
            r >= 0 && r < boardSize &&
            c >= 0 && c < boardSize &&
            board[r][c] === symbol
        ) {
            count++;
            r += dirRow;
            c += dirCol;
        }
        return count;
    }

    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dr, dc] of directions) {
        const total = 1 + count(dr, dc) + count(-dr, -dc);
        if (total >= streakToWin) return true;
    }

    return false;
}

function setStatus(message) {
    statusDisplay.textContent = message;
}
