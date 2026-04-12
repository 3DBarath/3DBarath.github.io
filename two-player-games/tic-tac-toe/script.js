document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const statusText = document.getElementById('status');
    const playerXScoreEl = document.getElementById('player-x-score');
    const playerOScoreEl = document.getElementById('player-o-score');
    const resetBtn = document.getElementById('reset-btn');
    const playAgainBtn = document.getElementById('play-again-btn');
    const winnerOverlay = document.getElementById('winner-overlay');
    const winnerText = document.getElementById('winner-text');

    let currentPlayer = 'X';
    let gameState = ["", "", "", "", "", "", "", "", ""];
    let gameActive = true;
    let scores = { X: 0, O: 0 };

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]             // Diagonals
    ];

    function handleCellClick(e) {
        const clickedCell = e.target;
        const clickedCellIndex = parseInt(clickedCell.getAttribute('data-index'));

        if (gameState[clickedCellIndex] !== "" || !gameActive) return;

        handleCellPlayed(clickedCell, clickedCellIndex);
        handleResultValidation();
    }

    function handleCellPlayed(clickedCell, clickedCellIndex) {
        gameState[clickedCellIndex] = currentPlayer;
        clickedCell.classList.add(currentPlayer.toLowerCase());
    }

    function handlePlayerChange() {
        currentPlayer = currentPlayer === "X" ? "O" : "X";
        statusText.innerText = `Player ${currentPlayer}'s Turn`;
        
        // Update score visuals
        if (currentPlayer === 'X') {
            playerXScoreEl.classList.add('text-brand-accent');
            playerXScoreEl.classList.remove('text-brand-muted');
            playerOScoreEl.classList.add('text-brand-muted');
            playerOScoreEl.classList.remove('text-brand-accent');
        } else {
            playerOScoreEl.classList.add('text-brand-accent');
            playerOScoreEl.classList.remove('text-brand-muted');
            playerXScoreEl.classList.add('text-brand-muted');
            playerXScoreEl.classList.remove('text-brand-accent');
        }
    }

    function handleResultValidation() {
        let roundWon = false;
        let winningLine = null;

        for (let i = 0; i <= 7; i++) {
            const winCondition = winningConditions[i];
            let a = gameState[winCondition[0]];
            let b = gameState[winCondition[1]];
            let c = gameState[winCondition[2]];
            if (a === '' || b === '' || c === '') continue;
            if (a === b && b === c) {
                roundWon = true;
                winningLine = winCondition;
                break;
            }
        }

        if (roundWon) {
            scores[currentPlayer]++;
            updateScoreDisplay();
            winnerText.innerText = `${currentPlayer} Wins!`;
            winnerOverlay.classList.add('active');
            gameActive = false;
            return;
        }

        let roundDraw = !gameState.includes("");
        if (roundDraw) {
            winnerText.innerText = "Draw!";
            winnerOverlay.classList.add('active');
            gameActive = false;
            return;
        }

        handlePlayerChange();
    }

    function updateScoreDisplay() {
        playerXScoreEl.innerText = `Player X: ${scores.X}`;
        playerOScoreEl.innerText = `Player O: ${scores.O}`;
    }

    function handleRestartGame() {
        gameActive = true;
        currentPlayer = "X";
        gameState = ["", "", "", "", "", "", "", "", ""];
        statusText.innerText = "Player X's Turn";
        
        playerXScoreEl.classList.add('text-brand-accent');
        playerXScoreEl.classList.remove('text-brand-muted');
        playerOScoreEl.classList.add('text-brand-muted');
        playerOScoreEl.classList.remove('text-brand-accent');

        cells.forEach(cell => {
            cell.classList.remove('x', 'o');
        });
        winnerOverlay.classList.remove('active');
    }

    function resetAll() {
        scores = { X: 0, O: 0 };
        updateScoreDisplay();
        handleRestartGame();
    }

    cells.forEach(cell => cell.addEventListener('click', handleCellClick));
    playAgainBtn.addEventListener('click', handleRestartGame);
    resetBtn.addEventListener('click', resetAll);
});
