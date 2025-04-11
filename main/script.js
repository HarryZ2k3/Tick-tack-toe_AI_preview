let boardSize = 3;
let board = [];
let currentPlayer = 'X';
let gameOver = false;

const boardContainer = document.getElementById('board');
const statusDisplay = document.getElementById('status');
const sizeSelector = document.getElementById('board-size');
const aiSelector = document.getElementById('ai-type');
const aiDisplay = document.getElementById('current-ai');

function startGame() {
    boardSize = parseInt(sizeSelector.value);
    boardContainer.style.display = 'grid';
    resetGame();
    updateCurrentAI();
}

function resetGame() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameOver = false;
    renderBoard();
    setStatus(`Player ${currentPlayer}'s turn`);
    updateCurrentAI();
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
    if (gameOver || currentPlayer !== 'X') return;

    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);

    if (board[row][col] !== '') return;

    handleMove(row, col);
}

function handleMove(row, col) {
    if (gameOver || board[row][col] !== '') return;

    board[row][col] = currentPlayer;
    renderBoard();

    if (checkWinCondition(row, col)) {
        setStatus(`Player ${currentPlayer} wins!`);
        gameOver = true;
        return;
    }

    if (isDraw()) {
        setStatus("It's a draw!");
        gameOver = true;
        return;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    setStatus(`Player ${currentPlayer}'s turn`);

    if (!gameOver && currentPlayer === 'O') {
        setTimeout(() => aiMove(), 200);
    }
}

function aiMove() {
    const selectedAI = aiSelector.value;
    const inputBoard = boardSize === 3 ? board.flat() : board;
    let aiMove = null;

    if (selectedAI === 'minimax') {
        aiMove = getBestMove(inputBoard);
    } else if (selectedAI === 'greedy') {
        aiMove = getGreedyMove(inputBoard, boardSize);
    } else if (selectedAI === 'random') {
        aiMove = getRandomMove(inputBoard, boardSize);
    }

    if (aiMove !== null) {
        const row = boardSize === 3 ? Math.floor(aiMove / 3) : aiMove.row;
        const col = boardSize === 3 ? aiMove % 3 : aiMove.col;
        handleMove(row, col);
    }
    if (aiMove === null) {
        console.log('[Greedy AI] No available moves.');
        return;
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

function updateAlgorithmDescription() {
    const aiType = aiSelector.value;
    const desc = document.getElementById('ai-description');

    if (aiType === 'minimax') {
        desc.textContent = "Minimax explores all possible moves and outcomes recursively to choose the best path. Strong but slower.";
    } else if (aiType === 'greedy') {
        desc.textContent = "Greedy strategy chooses the best-looking move immediately without future prediction. Fast but short-sighted.";
    } else if (aiType === 'random') {
        desc.textContent = "Blindly make a move.";
    }
}

function updateCurrentAI() {
    const aiType = aiSelector.value;
    if (aiType === 'minimax') {
        aiDisplay.textContent = "AI Mode: Minimax (Recursive Strategy)";
    } else if (aiType === 'greedy') {
        aiDisplay.textContent = "AI Mode: Greedy (Immediate Choice)";
    } else if (aiType === 'random') {
        aiDisplay.textContent = "AI Mode: Random (God knows where it will make the next move)";
    }
}

window.onload = () => {
    updateAlgorithmDescription();
    updateCurrentAI();
};
