const AI_PLAYER = 'O';
const HUMAN_PLAYER = 'X';

function getBestMove(board) {
    let bestScore = -Infinity;
    let move = null;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === '') {
            board[i] = AI_PLAYER;
            let score = minimax(board, 0, false);
            board[i] = '';
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    return move;
}

function getNearestMove(moves, reference) {
    if (!reference || moves.length === 0) return moves[Math.floor(Math.random() * moves.length)];

    moves.sort((a, b) => {
        const da = Math.abs(a.row - reference.row) + Math.abs(a.col - reference.col);
        const db = Math.abs(b.row - reference.row) + Math.abs(b.col - reference.col);
        return da - db;
    });

    return moves[0];
}
// Minimax algorithm for AI decision making
function minimax(board, depth, isMaximizing) {
    const winner = checkWinner(board);
    if (winner !== null) {
        return scores[winner];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = AI_PLAYER;
                let score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = HUMAN_PLAYER;
                let score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

const scores = {
    'X': -1,
    'O': 1,
    'draw': 0
};

function checkWinner(board) {
    const lines = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    for (let [a, b, c] of lines) {
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return board.includes('') ? null : 'draw';
}
//GREEDY AI FUNCTION
function getGreedyMove(board, size, aiSymbol = 'O') {
    const humanSymbol = aiSymbol === 'O' ? 'X' : 'O';
    const winStreak = size === 6 ? 4 : size === 9 ? 5 : 3;

    if (!Array.isArray(board[0])) {
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = aiSymbol;
                if (checkWinner(board) === aiSymbol) {
                    board[i] = '';
                    return i;
                }
                board[i] = humanSymbol;
                if (checkWinner(board) === humanSymbol) {
                    board[i] = '';
                    return i;
                }
                board[i] = '';
            }
        }

        for (let i = 0; i < 9; i++) {
            if (board[i] === '') return i;
        }
        return null;
    }

    const winMove = findBestStreakMove(board, size, aiSymbol, winStreak);
    if (winMove) return winMove;

    const blockMove = findBestStreakMove(board, size, humanSymbol, winStreak);
    if (blockMove) return blockMove;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') return { row, col };
        }
    }

    return null;
}

function findBestStreakMove(board, size, symbol, winStreak) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            for (let [dr, dc] of directions) {
                let count = 0;
                let emptySpot = null;

                for (let i = 0; i < winStreak; i++) {
                    const nr = r + dr * i;
                    const nc = c + dc * i;

                    if (nr < 0 || nr >= size || nc < 0 || nc >= size) break;

                    const val = board[nr][nc];
                    if (val === symbol) count++;
                    else if (val === '' && !emptySpot) emptySpot = { row: nr, col: nc };
                    else break;
                }

                if (count === winStreak - 1 && emptySpot) {
                    return emptySpot;
                }
            }
        }
    }

    return null;
}
//RANDOM AI FUNCTION
function getRandomMove(board, size) {
    if (!Array.isArray(board[0])) {
        const empty = [];
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') empty.push(i);
        }
        if (empty.length === 0) return null;
        return empty[Math.floor(Math.random() * empty.length)];
    }

    const empty = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') empty.push({ row, col });
        }
    }
    if (empty.length === 0) return null;
    return empty[Math.floor(Math.random() * empty.length)];
}

// Heuristic AI function
function getHeuristicMove(board, size, aiSymbol = 'O') {
    const humanSymbol = aiSymbol === 'O' ? 'X' : 'O';
    const winStreak = size === 6 ? 4 : size === 9 ? 5 : 3;
    let bestScore = -Infinity;
    let bestMove = null;

    if (!Array.isArray(board[0])) {
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

    // Check for human threats first — must block
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = humanSymbol;
                if (checkWinConditionCustom(board, row, col, winStreak)) {
                    board[row][col] = '';
                    return { row, col };
                }
                board[row][col] = '';
            }
        }
    }

    // Heuristic evaluation
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = aiSymbol;
                const score = evaluateBoard2D(board, size, aiSymbol, humanSymbol, winStreak);
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

function checkWinConditionCustom(board, row, col, streakToWin) {
    const symbol = board[row][col];
    const size = board.length;

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

    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dr, dc] of directions) {
        const total = 1 + count(dr, dc) + count(-dr, -dc);
        if (total >= streakToWin) return true;
    }

    return false;
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

        if (!(aiCount > 0 && humanCount > 0)) {
            score += evaluateLine(aiCount, humanCount, 3);
        }
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
                    const nr = r + dr * k;
                    const nc = c + dc * k;

                    if (nr < 0 || nr >= size || nc < 0 || nc >= size) {
                        valid = false;
                        break;
                    }

                    const cell = board[nr][nc];
                    if (cell === ai) aiCount++;
                    else if (cell === human) humanCount++;
                }

                if (valid && !(aiCount > 0 && humanCount > 0)) {
                    score += evaluateLine(aiCount, humanCount, streakToWin);
                }
            }
        }
    }

    return score;
}

function evaluateLine(aiCount, humanCount, streakToWin = 4) {
    if (aiCount > 0 && humanCount === 0) {
        if (aiCount === streakToWin - 1) return 10000;
        if (aiCount === streakToWin - 2) return 1000;
        if (aiCount === 2) return 500;
        return Math.pow(5, aiCount);
    } else if (humanCount > 0 && aiCount === 0) {
        if (humanCount === streakToWin - 1) return 100000;
        if (humanCount === streakToWin - 2) return 5000;
        if (humanCount === 2) return 1500; // added for better blocking
        return Math.pow(6, humanCount);
    }
    return 0;
}

function evaluateThreatAt(board, size, row, col, player, winStreak) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];
    let maxChain = 0;

    for (const [dr, dc] of directions) {
        let count = 1; // the cell we hypothetically place in
        for (let d = 1; d < winStreak; d++) {
            const r = row + dr * d;
            const c = col + dc * d;
            if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
                count++;
            } else break;
        }
        for (let d = 1; d < winStreak; d++) {
            const r = row - dr * d;
            const c = col - dc * d;
            if (r >= 0 && r < size && c >= 0 && c < size && board[r][c] === player) {
                count++;
            } else break;
        }

        if (count > maxChain) maxChain = count;
    }

    return maxChain; // 2 means early chain, 3+ is dangerous
}

// Experimental AI function
function getExperimentalMove(board, size, aiSymbol = 'O', lastHumanMove = null) {
    const humanSymbol = aiSymbol === 'O' ? 'X' : 'O';
    const winStreak = size === 6 ? 4 : size === 9 ? 5 : 3;

    let blockMoves = [];
    let doubleThreats = [];

    // 1. Detect serious human threats (win next move or 2 in a row)
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] !== '') continue;

            let threatLevel = evaluateThreatAt(board, size, row, col, humanSymbol, winStreak);
            if (threatLevel >= winStreak - 1) {
                blockMoves.push({ row, col });
            } else if (threatLevel === 2) {
                doubleThreats.push({ row, col });
            }
        }
    }

    if (blockMoves.length > 0) {
        return getNearestMove(blockMoves, lastHumanMove);
    }

    if (doubleThreats.length > 0) {
        return getNearestMove(doubleThreats, lastHumanMove);
    }

    // 2. Look for own attack opportunities
    let attackMoves = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                board[row][col] = aiSymbol;
                if (checkWinConditionCustom(board, row, col, winStreak)) {
                    attackMoves.push({ row, col });
                }
                board[row][col] = '';
            }
        }
    }

    if (attackMoves.length >= 3) {
        return getNearestMove(attackMoves, lastHumanMove);
    }

    // 3. Fallback: play near player to stay close
    let safeMoves = [];
    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (board[row][col] === '') {
                safeMoves.push({ row, col });
            }
        }
    }

    return getNearestMove(safeMoves, lastHumanMove);
}

