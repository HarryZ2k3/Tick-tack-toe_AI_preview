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

    // Find the most recent HUMAN_PLAYER move
    let lastHumanMove = null;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === HUMAN_PLAYER) {
                lastHumanMove = { row: r, col: c };
            }
        }
    }

    // Generate all possible moves
    const moves = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                moves.push({ row, col });
            }
        }
    }

    // Sort moves by distance to lastHumanMove
    if (lastHumanMove) {
        moves.sort((a, b) => {
            const distA = Math.abs(a.row - lastHumanMove.row) + Math.abs(a.col - lastHumanMove.col);
            const distB = Math.abs(b.row - lastHumanMove.row) + Math.abs(b.col - lastHumanMove.col);
            return distA - distB;
        });
    }

    // Apply minimax on moves in sorted order
    for (const move of moves) {
        board[move.row][move.col] = AI_PLAYER;
        const score = minimax2D(board, size, 0, false, depthLimit);
        board[move.row][move.col] = '';
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
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

    if (!Array.isArray(board[0])) {
        // 3x3 case (flat array)
        let lastHuman = -1;
        for (let i = 0; i < 9; i++) {
            if (board[i] === humanSymbol) {
                lastHuman = i;
            }
        }

        // Win or block if possible
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiSymbol;
                if (checkWinner1D(board) === aiSymbol) {
                    board[i] = '';
                    return i;
                }
                board[i] = humanSymbol;
                if (checkWinner1D(board) === humanSymbol) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }

        // Prefer move near human
        if (lastHuman !== -1) {
            let bestDist = Infinity;
            let bestMove = null;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    const dist = Math.abs(i - lastHuman);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestMove = i;
                    }
                }
            }
            return bestMove;
        }

        // Fallback
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') return i;
        }
        return null;
    }

    // 2D case (6x6, 9x9)
    let lastHumanMove = null;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === humanSymbol) {
                lastHumanMove = { row: r, col: c };
            }
        }
    }

    // Try win/block first
    const winMove = findBestStreakMove(board, size, aiSymbol, winStreak);
    if (winMove) return winMove;
    const blockMove = findBestStreakMove(board, size, humanSymbol, winStreak);
    if (blockMove) return blockMove;

    // Choose closest to last human move
    if (lastHumanMove) {
        let bestDist = Infinity;
        let bestMove = null;
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (board[r][c] === '') {
                    const dist = Math.abs(r - lastHumanMove.row) + Math.abs(c - lastHumanMove.col);
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestMove = { row: r, col: c };
                    }
                }
            }
        }
        return bestMove;
    }

    // Fallback
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (board[r][c] === '') return { row: r, col: c };
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

function getRandomMove(board, size) {
    if (!Array.isArray(board[0])) {
        // 3x3 flat board
        const empty = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') empty.push(i);
        }
        if (empty.length === 0) return null;
        const randIndex = Math.floor(Math.random() * empty.length);
        return empty[randIndex];
    }

    // 2D board (6x6 or 9x9)
    const empty = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') empty.push({ row, col });
        }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
}
//Heuristic Strategy
function getHeuristicMove(board, size, aiSymbol = 'O') {
    const humanSymbol = aiSymbol === 'O' ? 'X' : 'O';
    const winStreak = size === 6 ? 4 : size === 9 ? 5 : 3;
    let bestScore = -Infinity;
    let bestMove = null;

    if (!Array.isArray(board[0])) {
        // 3x3 flat
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiSymbol;
                let score = evaluateBoard1D(board, aiSymbol, humanSymbol);
                board[i] = '';
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = i;
                }
            }
        }
        return bestMove;
    }

    // 2D board
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = aiSymbol;
                let score = evaluateBoard2D(board, size, aiSymbol, humanSymbol, winStreak);
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
function evaluateBoard1D(board, ai, human) {
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    let score = 0;

    for (const line of lines) {
        let aiCount = 0;
        let humanCount = 0;

        for (const idx of line) {
            if (board[idx] === ai) aiCount++;
            else if (board[idx] === human) humanCount++;
        }

        score += evaluateLine(aiCount, humanCount);
    }

    return score;
}

function evaluateBoard2D(board, size, ai, human, streakToWin) {
    let score = 0;

    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (const [dr, dc] of directions) {
                let aiCount = 0;
                let humanCount = 0;
                let valid = true;

                for (let k = 0; k < streakToWin; k++) {
                    let nr = r + dr * k;
                    let nc = c + dc * k;

                    if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
                        valid = false;
                        break;
                    }

                    if (board[nr][nc] === ai) aiCount++;
                    else if (board[nr][nc] === human) humanCount++;
                }

                if (valid) {
                    score += evaluateLine(aiCount, humanCount);
                }
            }
        }
    }

    return score;
}

function evaluateLine(aiCount, humanCount) {
    if (aiCount > 0 && humanCount === 0) {
        return Math.pow(10, aiCount); // prioritize offensive streaks
    } else if (humanCount > 0 && aiCount === 0) {
        return Math.pow(10, humanCount - 1); // prioritize blocking
    }
    return 0;
}