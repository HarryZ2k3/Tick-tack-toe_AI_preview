const AI_PLAYER = 'O';
const HUMAN_PLAYER = 'X';

const scores = {
    'X': -1,
    'O': 1,
    'draw': 0
};
//minimax Algorithm
function getBestMove(board) {
    if (Array.isArray(board[0])) {
        // NxN board (2D)
        const size = board.length;
        const depthLimit = size === 6 ? 3 : size === 9 ? 2 : 4; // Fallback for other sizes
        return getBestMove2D(board, size, depthLimit);
    } else {
        // 3x3 board (1D)
        return getBestMove1D(board);
    }
}

function getBestMove1D(board) {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = AI_PLAYER;
            let score = minimax1D(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

function minimax1D(board, depth, isMaximizing) {
    const winner = checkWinner1D(board);
    if (winner !== null) return scores[winner];

    let bestScore = isMaximizing ? -Infinity : Infinity;
    const currentSymbol = isMaximizing ? AI_PLAYER : HUMAN_PLAYER;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = currentSymbol;
            const score = minimax1D(board, depth + 1, !isMaximizing);
            board[i] = '';
            bestScore = isMaximizing
                ? Math.max(score, bestScore)
                : Math.min(score, bestScore);
        }
    }

    return bestScore;
}

function checkWinner1D(board) {
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (const [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes('') ? null : 'draw';
}

function getBestMove2D(board, size, depthLimit) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = AI_PLAYER;
                const score = minimax2D(board, size, 0, false, depthLimit);
                board[row][col] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = { row, col };
                }
            }
        }
    }

    return bestMove;
}

function minimax2D(board, size, depth, isMaximizing, maxDepth) {
    const result = evaluateGame2D(board, size);
    if (result !== null || depth >= maxDepth) return scoreResult(result);

    let bestScore = isMaximizing ? -Infinity : Infinity;
    const currentSymbol = isMaximizing ? AI_PLAYER : HUMAN_PLAYER;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = currentSymbol;
                const score = minimax2D(board, size, depth + 1, !isMaximizing, maxDepth);
                board[row][col] = '';
                bestScore = isMaximizing
                    ? Math.max(score, bestScore)
                    : Math.min(score, bestScore);
            }
        }
    }

    return bestScore;
}

function scoreResult(result) {
    if (result === 'draw') return 0;
    if (result === AI_PLAYER) return 1;
    if (result === HUMAN_PLAYER) return -1;
    return 0; // fallback (e.g., cutoff)
}

function evaluateGame2D(board, size) {
    const winStreak = size === 6 ? 4 : size === 9 ? 5 : 3;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const symbol = board[row][col];
            if (symbol === '') continue;

            const directions = [
                [0, 1], [1, 0], [1, 1], [1, -1]
            ];

            for (const [dr, dc] of directions) {
                let count = 1;
                let r = row + dr;
                let c = col + dc;

                while (
                    r >= 0 && r < size &&
                    c >= 0 && c < size &&
                    board[r][c] === symbol
                ) {
                    count++;
                    if (count >= winStreak) return symbol;
                    r += dr;
                    c += dc;
                }
            }
        }
    }

    const isDraw = board.every(row => row.every(cell => cell !== ''));
    return isDraw ? 'draw' : null;
}
//Greedy Strategy 
function getGreedyMove(board, size, aiSymbol = 'O') {
    const humanSymbol = aiSymbol === 'O' ? 'X' : 'O';
    const winStreak = size === 6 ? 4 : size === 9 ? 5 : 3;

    // 1. Try to win immediately
    const winMove = findBestStreakMove(board, size, aiSymbol, winStreak);
    if (winMove) return winMove;

    // 2. Block opponent from winning
    const blockMove = findBestStreakMove(board, size, humanSymbol, winStreak);
    if (blockMove) return blockMove;

    // 3. Pick first empty cell (default fallback)
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                return { row, col };
            }
        }
    }

    return null;
}

function findBestStreakMove(board, size, symbol, winStreak) {
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = symbol;
                const isWin = checkTempWin(board, row, col, size, winStreak);
                board[row][col] = '';
                if (isWin) return { row, col };
            }
        }
    }
    return null;
}

function checkTempWin(board, row, col, size, winStreak) {
    const symbol = board[row][col];
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    function count(dirRow, dirCol) {
        let r = row + dirRow;
        let c = col + dirCol;
        let count = 0;
        while (
            r >= 0 && r < size &&
            c >= 0 && c < size &&
            board[r][c] === symbol
        ) {
            count++;
            r += dirRow;
            c += dirCol;
        }
        return count;
    }

    for (const [dr, dc] of directions) {
        const total = 1 + count(dr, dc) + count(-dr, -dc);
        if (total >= winStreak) return true;
    }

    return false;
}
