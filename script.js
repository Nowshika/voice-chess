// Chess pieces
const PIECES = {
    WHITE_KING: '♔', WHITE_QUEEN: '♕', WHITE_ROOK: '♖', WHITE_BISHOP: '♗', WHITE_KNIGHT: '♘', WHITE_PAWN: '♙',
    BLACK_KING: '♚', BLACK_QUEEN: '♛', BLACK_ROOK: '♜', BLACK_BISHOP: '♝', BLACK_KNIGHT: '♞', BLACK_PAWN: '♟'
};

// Game state
let board = [];
let currentPlayer = 'white';
let selectedSquare = null;
let gameOver = false;
let moveHistory = [];
let boardHistory = [];
let enPassantTarget = null;
let castlingRights = {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
};
let kingMoved = { white: false, black: false };
let rookMoved = {
    white: { kingSide: false, queenSide: false },
    black: { kingSide: false, queenSide: false }
};

// Initialize
function initGame() {
    board = [
        ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
        ['♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟'],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙'],
        ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖']
    ];
    currentPlayer = 'white';
    selectedSquare = null;
    gameOver = false;
    moveHistory = [];
    boardHistory = [];
    enPassantTarget = null;
    castlingRights = { white: { kingSide: true, queenSide: true }, black: { kingSide: true, queenSide: true } };
    kingMoved = { white: false, black: false };
    rookMoved = { white: { kingSide: false, queenSide: false }, black: { kingSide: false, queenSide: false } };
    
    attachEventListeners();
    renderBoard();
    updateTurnDisplay();
    document.getElementById('gameStatus').textContent = '';
    document.getElementById('moveList').innerHTML = '';
}

function attachEventListeners() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const newSquare = square.cloneNode(true);
        square.parentNode.replaceChild(newSquare, square);
        newSquare.addEventListener('click', () => handleSquareClick(row, col));
    });
}

function handleSquareClick(row, col) {
    if (gameOver) return;
    const piece = board[row][col];
    
    if (selectedSquare) {
        if (isValidMove(selectedSquare.row, selectedSquare.col, row, col)) {
            const movingPiece = board[selectedSquare.row][selectedSquare.col];
            if (isPawn(movingPiece) && (row === 0 || row === 7)) {
                showPromotionModal(selectedSquare.row, selectedSquare.col, row, col);
            } else {
                makeMove(selectedSquare.row, selectedSquare.col, row, col);
            }
        } else if (piece && getPieceColor(piece) === currentPlayer) {
            selectSquare(row, col);
        } else {
            selectedSquare = null;
            renderBoard();
        }
    } else if (piece && getPieceColor(piece) === currentPlayer) {
        selectSquare(row, col);
    }
}

function selectSquare(row, col) {
    selectedSquare = { row, col };
    renderBoard();
    highlightValidMoves(row, col);
}

function renderBoard() {
    const squares = document.querySelectorAll('.square');
    squares.forEach((square) => {
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        const piece = board[row][col];
        square.innerHTML = '';
        if (piece) {
            const span = document.createElement('span');
            span.textContent = piece;
            span.className = getPieceColor(piece) === 'white' ? 'piece-white' : 'piece-black';
            square.appendChild(span);
        }
        square.classList.remove('selected', 'valid-move', 'valid-capture', 'in-check');
        if (selectedSquare?.row === row && selectedSquare?.col === col) square.classList.add('selected');
        if (piece && isKing(piece) && getPieceColor(piece) === currentPlayer && isInCheck(currentPlayer)) {
            square.classList.add('in-check');
        }
    });
}

function highlightValidMoves(row, col) {
    for (let tr = 0; tr < 8; tr++) {
        for (let tc = 0; tc < 8; tc++) {
            if (isValidMove(row, col, tr, tc)) {
                const sq = document.querySelector(`.square[data-row="${tr}"][data-col="${tc}"]`);
                if (sq) sq.classList.add(board[tr][tc] ? 'valid-capture' : 'valid-move');
            }
        }
    }
}

function makeMove(fR, fC, tR, tC, promotedPiece = null) {
    saveState();
    const piece = board[fR][fC];
    const captured = board[tR][tC];

    if (isKing(piece) && Math.abs(tC - fC) === 2) {
        if (tC === 6) { board[tR][5] = board[tR][7]; board[tR][7] = ''; }
        if (tC === 2) { board[tR][3] = board[tR][0]; board[tR][0] = ''; }
    }

    if (isPawn(piece) && enPassantTarget?.row === tR && enPassantTarget?.col === tC) {
        board[currentPlayer === 'white' ? tR + 1 : tR - 1][tC] = '';
    }

    board[tR][tC] = promotedPiece || piece;
    board[fR][fC] = '';

    enPassantTarget = (isPawn(piece) && Math.abs(tR - fR) === 2) ? {row: (fR + tR)/2, col: fC} : null;
    if (isKing(piece)) kingMoved[currentPlayer] = true;
    if (isRook(piece)) {
        if (fC === 0) rookMoved[currentPlayer].queenSide = true;
        if (fC === 7) rookMoved[currentPlayer].kingSide = true;
    }

    const moveNote = `${String.fromCharCode(97+fC)}${8-fR}→${String.fromCharCode(97+tC)}${8-tR}`;
    moveHistory.push({ player: currentPlayer, notation: moveNote, captured: !!captured });

    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    selectedSquare = null;
    checkGameStatus();
    renderBoard();
    updateTurnDisplay();
    updateMoveHistory();
}

function checkGameStatus() {
    const status = document.getElementById('gameStatus');
    if (isCheckmate(currentPlayer)) {
        gameOver = true;
        status.textContent = `Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`;
    } else if (isStalemate(currentPlayer)) {
        gameOver = true;
        status.textContent = "Stalemate! Draw.";
    } else if (isInCheck(currentPlayer)) {
        status.textContent = "Check!";
    } else {
        status.textContent = "";
    }
}

// Logic Helpers
function isValidMove(fR, fC, tR, tC) {
    const p = board[fR][fC];
    if (!p || (board[tR][tC] && getPieceColor(p) === getPieceColor(board[tR][tC]))) return false;
    if (!isPieceMoveLegal(p, fR, fC, tR, tC)) return false;
    return !wouldBeInCheck(fR, fC, tR, tC);
}

function isPieceMoveLegal(p, fR, fC, tR, tC) {
    const rd = Math.abs(tR - fR), cd = Math.abs(tC - fC), dir = getPieceColor(p) === 'white' ? -1 : 1;
    if (isPawn(p)) {
        if (fC === tC && board[tR][tC] === '') {
            if (tR === fR + dir) return true;
            if (fR === (getPieceColor(p) === 'white' ? 6 : 1) && tR === fR + 2*dir && board[fR+dir][fC] === '') return true;
        }
        if (rd === 1 && cd === 1 && (board[tR][tC] !== '' || (enPassantTarget?.row === tR && enPassantTarget?.col === tC))) {
            if (tR === fR + dir) return true;
        }
        return false;
    }
    if (isKnight(p)) return (rd === 2 && cd === 1) || (rd === 1 && cd === 2);
    if (isBishop(p)) return rd === cd && isPathClear(fR, fC, tR, tC);
    if (isRook(p)) return (fR === tR || fC === tC) && isPathClear(fR, fC, tR, tC);
    if (isQueen(p)) return (rd === cd || fR === tR || fC === tC) && isPathClear(fR, fC, tR, tC);
    if (isKing(p)) {
        if (rd <= 1 && cd <= 1) return true;
        const color = getPieceColor(p);
        if (!kingMoved[color] && !isInCheck(color)) {
            if (tC === 6 && !rookMoved[color].kingSide && isPathClear(fR, 4, fR, 7) && !isSquareUnderAttack(fR, 5, color)) return true;
            if (tC === 2 && !rookMoved[color].queenSide && isPathClear(fR, 4, fR, 0) && !isSquareUnderAttack(fR, 3, color)) return true;
        }
    }
    return false;
}

function isPathClear(fR, fC, tR, tC) {
    const rs = Math.sign(tR - fR), cs = Math.sign(tC - fC);
    let r = fR + rs, c = fC + cs;
    while (r !== tR || c !== tC) {
        if (board[r][c] !== '') return false;
        r += rs; c += cs;
    }
    return true;
}

function wouldBeInCheck(fR, fC, tR, tC) {
    const p = board[fR][fC], t = board[tR][tC];
    board[tR][tC] = p; board[fR][fC] = '';
    const check = isInCheck(getPieceColor(p));
    board[fR][fC] = p; board[tR][tC] = t;
    return check;
}

function isInCheck(color) {
    let kR, kC;
    for(let r=0; r<8; r++) for(let c=0; c<8; c++) 
        if(board[r][c] && isKing(board[r][c]) && getPieceColor(board[r][c]) === color) { kR=r; kC=c; }
    return isSquareUnderAttack(kR, kC, color);
}

function isSquareUnderAttack(r, c, defCol) {
    for(let i=0; i<8; i++) for(let j=0; j<8; j++) {
        const p = board[i][j];
        if (p && getPieceColor(p) !== defCol) {
            if (isPawn(p)) {
                if (r === i + (getPieceColor(p) === 'white' ? -1 : 1) && Math.abs(c - j) === 1) return true;
            } else if (isPieceMoveLegalSimple(p, i, j, r, c)) return true;
        }
    }
    return false;
}

function isPieceMoveLegalSimple(p, fR, fC, tR, tC) {
    const rd = Math.abs(tR-fR), cd = Math.abs(tC-fC);
    if(isKnight(p)) return (rd===2 && cd===1) || (rd===1 && cd===2);
    if(isBishop(p)) return rd===cd && isPathClear(fR, fC, tR, tC);
    if(isRook(p)) return (fR===tR || fC===tC) && isPathClear(fR, fC, tR, tC);
    if(isQueen(p)) return (rd===cd || fR===tR || fC===tC) && isPathClear(fR, fC, tR, tC);
    if(isKing(p)) return rd<=1 && cd<=1;
    return false;
}

function isCheckmate(color) { return isInCheck(color) && !hasLegalMoves(color); }
function isStalemate(color) { return !isInCheck(color) && !hasLegalMoves(color); }
function hasLegalMoves(color) {
    for(let r=0; r<8; r++) for(let c=0; c<8; c++)
        if(board[r][c] && getPieceColor(board[r][c]) === color)
            for(let tr=0; tr<8; tr++) for(let tc=0; tc<8; tc++)
                if(isValidMove(r, c, tr, tc)) return true;
    return false;
}

// Promotion Modal Logic
function showPromotionModal(fR, fC, tR, tC) {
    const modal = document.getElementById('promotionModal');
    const container = document.getElementById('promotionPieces');
    const options = currentPlayer === 'white' ? ['♕','♖','♗','♘'] : ['♛','♜','♝','♞'];
    container.innerHTML = '';
    options.forEach(op => {
        const div = document.createElement('div');
        div.className = 'promotion-piece';
        div.textContent = op;
        div.onclick = () => {
            modal.classList.remove('active');
            makeMove(fR, fC, tR, tC, op);
        };
        container.appendChild(div);
    });
    modal.classList.add('active');
}

// Global Helpers
function getPieceColor(p) { return ['♔','♕','♖','♗','♘','♙'].includes(p) ? 'white' : 'black'; }
function isPawn(p) { return p === '♙' || p === '♟'; }
function isKing(p) { return p === '♔' || p === '♚'; }
function isRook(p) { return p === '♖' || p === '♜'; }
function isKnight(p) { return p === '♘' || p === '♞'; }
function isBishop(p) { return p === '♗' || p === '♝'; }
function isQueen(p) { return p === '♕' || p === '♛'; }

function saveState() {
    boardHistory.push({
        board: JSON.parse(JSON.stringify(board)),
        enPassantTarget: {...enPassantTarget},
        castlingRights: JSON.parse(JSON.stringify(castlingRights)),
        kingMoved: {...kingMoved},
        rookMoved: JSON.parse(JSON.stringify(rookMoved))
    });
}

function updateTurnDisplay() { document.getElementById('playerTurn').textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s Turn`; }
function updateMoveHistory() {
    const list = document.getElementById('moveList'); list.innerHTML = '';
    moveHistory.forEach((m, i) => {
        const item = document.createElement('div'); item.className = 'move-item';
        item.innerHTML = `<span class="move-number">${Math.floor(i/2)+1}.</span> ${m.notation}`;
        list.appendChild(item);
    });
    list.scrollTop = list.scrollHeight;
}

function resetGame() { if(confirm("Reset Game?")) initGame(); }
function undoMove() {
    if(!boardHistory.length) return;
    const s = boardHistory.pop();
    board = s.board; enPassantTarget = s.enPassantTarget; castlingRights = s.castlingRights;
    kingMoved = s.kingMoved; rookMoved = s.rookMoved;
    moveHistory.pop();
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
    renderBoard(); updateTurnDisplay(); updateMoveHistory();
}

// ==========================================
// 🎙️ CONTINUOUS VOICE ACCESSIBILITY MODULE
// ==========================================
let recognition = null;
let isVoiceActive = false; // Tracking state to keep mic on

function toggleVoiceRecognition() {
    const statusEl = document.getElementById('voiceStatus');
    
    if (!recognition) {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) return alert("Speech not supported in this browser");
        
        recognition = new SR();
        recognition.lang = 'en-US';
        
        // This makes the browser keep listening even after you finish a sentence
        recognition.continuous = true; 
        recognition.interimResults = false;

        recognition.onstart = () => {
            isVoiceActive = true;
            statusEl.textContent = "🎙️ Listening (Hands-Free Mode)...";
            statusEl.style.color = "#28a745"; // Visual feedback
        };

        recognition.onresult = (e) => {
            // Get the last phrase spoken
            const text = e.results[e.results.length - 1][0].transcript.toLowerCase();
            handleVoiceCommand(text);
        };

        recognition.onerror = (e) => {
            console.error("Speech Error:", e.error);
        };

        recognition.onend = () => {
            // AUTO-RESTART: If the user hasn't clicked 'stop', start again
            if (isVoiceActive) {
                recognition.start();
            } else {
                statusEl.textContent = "Click mic to speak";
                statusEl.style.color = "";
            }
        };
    }

    if (isVoiceActive) {
        isVoiceActive = false;
        recognition.stop();
    } else {
        recognition.start();
    }
}

function handleVoiceCommand(text) {
    const statusEl = document.getElementById('voiceStatus');
    
    // Normalize text (Converting "for" to "4" or "to" to "2")
    const voiceMap = { 'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'for': '4', 'to': '2' };
    let processedText = text.toLowerCase();
    Object.keys(voiceMap).forEach(word => {
        processedText = processedText.replace(new RegExp(word, 'g'), voiceMap[word]);
    });

    statusEl.textContent = `Heard: "${processedText}"`;

    // Regex for "d2 to d4" or "d2 d4"
    const m = processedText.match(/([a-h])\s*([1-8])\s*(?:2|to|\s)*([a-h])\s*([1-8])/);
    
    if (m) {
        const fC = m[1].charCodeAt(0)-97, fR = 8-parseInt(m[2]), tC = m[3].charCodeAt(0)-97, tR = 8-parseInt(m[4]);
        if (isValidMove(fR, fC, tR, tC)) {
            makeMove(fR, fC, tR, tC);
        }
    }
}

window.addEventListener('DOMContentLoaded', initGame);