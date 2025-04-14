let boardSize = 3;
let board = [];
let currentPlayer = 'X';
let gameOver = false;
let turnCount = 0;
let lastMove = null;

let stats = {
    x: 0,
    o: 0,
    draws: 0
};

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
    updateAlgorithmDescription();
}

function resetGame() {
    turnCount = 0;
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
    currentPlayer = 'X';
    gameOver = false;
    lastMove = null;

    renderBoard();
    setStatus(`Player ${currentPlayer}'s turn`);
    updateTurnCounter();

    // Show stat/turn sections if hidden
    document.getElementById('turn-counter').style.display = 'block';
    document.getElementById('game-stats').style.display = 'block';
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

            if (row === lastMove?.row && col === lastMove?.col) {
                cell.classList.add('last-move');
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
    lastMove = { row, col };
    turnCount++;
    updateTurnCounter();
    renderBoard();

    if (checkWinCondition(row, col)) {
        setStatus(`Player ${currentPlayer} wins!`);
        gameOver = true;
        updateStats(currentPlayer);
        return;
    }

    if (isDraw()) {
        setStatus("It's a draw!");
        gameOver = true;
        updateStats('draw');
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
    } else if (selectedAI === 'heuristic') {
        aiMove = getHeuristicMove(inputBoard, boardSize);
    }

    if (aiMove !== null) {
        const row = boardSize === 3 ? Math.floor(aiMove / 3) : aiMove.row;
        const col = boardSize === 3 ? aiMove % 3 : aiMove.col;
        handleMove(row, col);
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

function updateTurnCounter() {
    document.getElementById('turn-counter').textContent = `Turn: ${turnCount}`;
}

function updateStats(winner) {
    if (winner === 'X') stats.x++;
    else if (winner === 'O') stats.o++;
    else if (winner === 'draw') stats.draws++;

    document.getElementById('stat-x').textContent = `X Wins: ${stats.x}`;
    document.getElementById('stat-o').textContent = `O Wins: ${stats.o}`;
    document.getElementById('stat-draws').textContent = `Draws: ${stats.draws}`;
}

function resetStats() {
    stats = { x: 0, o: 0, draws: 0 };
    updateStats('');
}

function updateAlgorithmDescription() {
    const aiType = aiSelector.value;
    const desc = document.getElementById('ai-description');

    if (aiType === 'random') {
        desc.textContent = "Easy - Randomly selects a move. Completely unpredictable.";
    } else if (aiType === 'greedy') {
        desc.textContent = "Hard - Picks the best immediate move without deep prediction.";
    } else if (aiType === 'minimax') {
        desc.textContent = "Easy - Minimax explores all possibilities recursively. Strong but slower.";
    } else if (aiType === 'heuristic') {
        desc.textContent = "Expert - Strategically scores each move. Efficient and tough.";
    }
}

function updateCurrentAI() {
    const aiType = aiSelector.value;
    if (aiType === 'minimax') {
        aiDisplay.textContent = "AI Mode: Easy (Minimax)";
    } else if (aiType === 'greedy') {
        aiDisplay.textContent = "AI Mode: Hard (Greedy)";
    } else if (aiType === 'random') {
        aiDisplay.textContent = "AI Mode: Easy (Random)";
    } else if (aiType === 'heuristic') {
        aiDisplay.textContent = "AI Mode: Expert (Heuristic)";
    }
}

window.onload = () => {
    updateAlgorithmDescription();
    updateCurrentAI();
};
