const _rows = 9;
const _cols = 9;

// Wait for the DOM to fully load before executing the script
document.addEventListener("DOMContentLoaded", () => {
    // Get references to various DOM elements
    const blocksContainer = document.getElementById("block-select");
    const gridContainer = document.getElementById("squares");
    const gameOverDialog = document.getElementById("game-over");
    const reshuffleButton = document.getElementById("reshuffle-blocks");
    const gameOverNoLivesDialog = document.getElementById("game-over-no-lives");
    const resetButtonGameOverDialog = document.getElementById(
        "reset-game-no-lives-dialog"
    );
    const scoreEndElement = document.getElementById("score-end");
    const muteToggle = document.getElementById("mute-toggle");
    const muteIcon = document.getElementById("mute-icon");
    const gameModeToggle = document.getElementById("game-mode-toggle");
    const gameModeText = document.getElementById("game-mode-text");

    const volumePopup = document.getElementById("volume-popup");
    const volumeSlider = document.getElementById("volume-slider");

    let gameMode = localStorage.getItem("gameMode") || "classic"; // classic, 99
    gameModeText.textContent = gameMode === "classic" ? "Classic" : "99";

    // Set initial class
    if (gameMode === "99") {
        gridContainer.classList.add("mode-99");
    } else {
        gridContainer.classList.remove("mode-99");
    }

    gameModeToggle.addEventListener("click", () => {
        if (confirm("Switching modes will reset the current game. Continue?")) {
            gameMode = gameMode === "classic" ? "99" : "classic";
            localStorage.setItem("gameMode", gameMode);
            gameModeText.textContent = gameMode === "classic" ? "Classic" : "99";

            if (gameMode === "99") {
                gridContainer.classList.add("mode-99");
            } else {
                gridContainer.classList.remove("mode-99");
            }

            gameSounds.play("click");
            resetGame();
        }
    });

    // Initialize UI state
    if (gameSounds.isMuted) {
        muteIcon.textContent = "🔇";
    }
    volumeSlider.value = gameSounds.masterVolume;

    // Toggle popup on mute button click
    muteToggle.addEventListener("click", (e) => {
        e.stopPropagation();
        volumePopup.classList.toggle("hidden");
    });

    // Close popup on outside click
    window.addEventListener("click", (e) => {
        if (!volumePopup.classList.contains("hidden") &&
            !volumePopup.contains(e.target) &&
            !muteToggle.contains(e.target)) {
            volumePopup.classList.add("hidden");
        }
    });

    // Volume slider logic
    volumeSlider.addEventListener("input", (e) => {
        const value = parseFloat(e.target.value);
        gameSounds.setVolume(value);
        if (value === 0) {
            if (!gameSounds.isMuted) {
                gameSounds.toggleMute();
                muteIcon.textContent = "🔇";
            }
        } else {
            if (gameSounds.isMuted) {
                gameSounds.toggleMute();
                muteIcon.textContent = "🔊";
            }
        }
    });

    // prevent clicking on popup from closing it
    volumePopup.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    let isLosingReshuffle = false;

    // Event listener for reshuffling blocks
    reshuffleButton.addEventListener("click", () => {
        gameSounds.play("click");
        if (blocksContainer.children.length === 0 || isLosingReshuffle) {
            if (lives > 0) {
                lives--;
                livesElement.textContent = lives;
                gameOverDialog.classList.add("hidden");
                isLosingReshuffle = true;
                generateBlocks();

                if (!hasValidMoves() && lives > 0) {
                    showGameOverDialog();
                } else if (!hasValidMoves() && lives <= 0) {
                    showGameOverNoLivesDialog();
                } else {
                    initialBlocksGenerated = true;
                }
            } else {
                showGameOverNoLivesDialog();
            }
        } else {
            console.error(
                "Cannot reshuffle blocks while existing blocks are available."
            );
        }
    });

    // Event listener for resetting the game from the game over dialog
    resetButtonGameOverDialog.addEventListener("click", () => {
        gameSounds.play("click");
        resetGame();
    });

    const resetButtonGameOver = document.getElementById("reset-game-no-lives");
    if (resetButtonGameOver) {
        resetButtonGameOver.addEventListener("click", () => {
            saveHighScore(score);
            gameSounds.play("click");
            resetGame();
        });
    }

    // Function to show the game over dialog
    function showGameOverDialog() {
        if (hasValidMoves()) {
            generateBlocks();
        } else {
            if (lives > 0) {
                isLosingReshuffle = true;
                gameOverDialog.classList.remove("hidden");
                gameSounds.play("gameOver");
            }
        }
    }

    // Function to hide the game over dialog
    function hideGameOverDialog() {
        gameOverDialog.classList.add("hidden");
    }

    // Function to show the game over dialog when no lives are left
    function showGameOverNoLivesDialog() {
        gameOverNoLivesDialog.classList.remove("hidden");
        gameSounds.play("gameOver");
    }

    // Function to hide the game over dialog when no lives are left
    function hideGameOverNoLivesDialog() {
        gameOverNoLivesDialog.classList.add("hidden");
    }

    if (!gridContainer) {
        console.error("Grid container is missing in the HTML.");
        return;
    }

    // Define the shapes of the blocks
    const blockShapes = [
        [[1]],

        [[1, 1]],
        [[1], [1]],

        [[1, 1, 1]],
        [[1], [1], [1]],

        [[1, 1, 1, 1]],
        [[1], [1], [1], [1]],

        [
            [1, 1, 1],
            [0, 0, 1],
        ],
        [
            [1, 1, 1],
            [1, 0, 0],
        ],
        [
            [0, 0, 1],
            [1, 1, 1],
        ],
        [
            [1, 0, 0],
            [1, 1, 1],
        ],
        [
            [1, 0],
            [1, 0],
            [1, 1],
        ],
        [
            [0, 1],
            [0, 1],
            [1, 1],
        ],
        [
            [1, 1],
            [0, 1],
            [0, 1],
        ],
        [
            [1, 1],
            [1, 0],
            [1, 0],
        ],

        [
            [1, 1],
            [1, 0],
        ],
        [
            [1, 1],
            [0, 1],
        ],
        [
            [1, 0],
            [1, 1],
        ],
        [
            [0, 1],
            [1, 1],
        ],

        [
            [1, 1, 1],
            [0, 1, 0],
        ],
        [
            [1, 0],
            [1, 1],
            [1, 0],
        ],
        [
            [0, 1, 0],
            [1, 1, 1],
        ],
        [
            [0, 1],
            [1, 1],
            [0, 1],
        ],

        [
            [1, 1],
            [1, 1],
            [1, 1],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
        ],

        [
            [1, 1],
            [1, 1],
        ],
        [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ],
        [
            [1, 1, 0],
            [0, 1, 1],
        ],
        [
            [0, 1],
            [1, 1],
            [1, 0],
        ],
        [
            [0, 1, 1],
            [1, 1, 0],
        ],
        [
            [1, 0],
            [1, 1],
            [0, 1],
        ],
        [[1, 1, 1, 1, 1]],
        [[1], [1], [1], [1], [1]],
        [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1],
        ],
        [
            [0, 0, 1],
            [0, 0, 1],
            [1, 1, 1],
        ],
        [
            [1, 1, 1],
            [0, 0, 1],
            [0, 0, 1],
        ],
        [
            [1, 1, 1],
            [1, 0, 0],
            [1, 0, 0],
        ],
        [
            [1, 0, 0],
            [0, 1, 0],
            [0, 0, 1],
        ],
        [
            [0, 0, 1],
            [0, 1, 0],
            [1, 0, 0],
        ],
        [
            [1, 0],
            [0, 1],
        ],
        [
            [0, 1],
            [1, 0],
        ],
    ];

    let selectedBlock = null;

    let score = 0;
    let lives = 3;
    const scoreElement = document.getElementById("score");
    const highScore_Element = document.getElementById("high-score");
    const livesElement = document.getElementById("lives");

    let initialBlocksGenerated = false;

    let comboCount = 0;
    let comboMovesLeft = 3;

    const comboCountElement = document.getElementById("combo-count");
    const comboProgressBar = document.getElementById("combo-progress-bar");

    const score_base = 10;
    const score_bingo = [1, 3, 6, 10, 15, 21];

    // Function to update the combo display
    function updateComboDisplay() {
        comboCountElement.textContent = comboCount;
        const progressPercentage = (comboMovesLeft / 3) * 100;
        comboProgressBar.style.width = `${progressPercentage}%`;
        if (comboMovesLeft == 0) {
            comboProgressBar.style.width = "100%";
        }
    }

    // Function to update the score
    function updateScore(points) {
        score += points;
        scoreElement.textContent = score;
        scoreEndElement.textContent = score;
        const highScore_ = localStorage.getItem("highScore_") || 0;
        if (score > highScore_) {
            localStorage.setItem("highScore_", score);
            highScore_Element.textContent = score;
        }
    }

    // Function to calculate the score of a block based on its shape
    function calculateBlockScore(shape) {
        let count = 0;
        shape.forEach((row) => {
            row.forEach((cell) => {
                if (cell) count++;
            });
        });
        return count;
    }

    // Function to calculate the score based on cleared lines and block value
    function calculateScore(clearedLines, blockValue) {
        const comboMultiplier = comboCount + 1;
        const linesClearedMultiplier = score_bingo[clearedLines - 1] || 0;

        const baseScore = blockValue;
        return baseScore * linesClearedMultiplier * comboMultiplier;
    }

    // Function to show the reshuffle dialog
    function showReshuffleDialog() {
        const reshuffle = confirm(
            "Game Over! Do you want to reshuffle the blocks and continue? This will remove 1 life."
        );
        if (reshuffle) {
            if (lives > 0) {
                lives -= 1;
                livesElement.textContent = lives;
                isLosingReshuffle = true;
                generateBlocks();

                if (!hasValidMoves() && lives > 0) {
                    showReshuffleDialog();
                } else if (!hasValidMoves() && lives <= 0) {
                    showGameOverNoLivesDialog();
                } else {
                    initialBlocksGenerated = true;
                }
            } else {
                showGameOverNoLivesDialog();
            }
        } else {
            showGameOverNoLivesDialog();
        }
    }

    // Function to reset the game
    function resetGame() {
        hideGameOverDialog();
        hideGameOverNoLivesDialog();
        blocksContainer.innerHTML = "";
        score = 0;
        lives = 3;
        comboCount = 0;
        comboMovesLeft = 3;
        scoreElement.textContent = score;
        livesElement.textContent = lives;
        initializeGrid(9, 9);
        generateBlocks();
        updateComboDisplay();
        localStorage.removeItem("boardState");
        localStorage.removeItem("blocksState");
        localStorage.removeItem("blockSelectState");
        localStorage.removeItem("score");
        localStorage.removeItem("lives");
        initialBlocksGenerated = false;
        isLosingReshuffle = false;
    }

    // Function to generate new blocks
    function generateBlocks() {
        if (blocksContainer.children.length > 0 && !isLosingReshuffle) {
            console.error(
                "Cannot generate new blocks while existing blocks are available."
            );
            return;
        }

        blocksContainer.innerHTML = "";

        let attempts = 0;
        const maxAttempts = 100;

        const generatedBlocks = [];

        for (let i = 0; i < 3; i++) {
            let blockShape, blockColor, blockElement;
            do {
                // Filter out 3x3 block in Mode 99
                let availableShapes = blockShapes;
                if (gameMode === "99") {
                    availableShapes = blockShapes.filter(shape => {
                        // Check if shape is 3x3 of all 1s
                        if (shape.length === 3 && shape[0].length === 3 &&
                            shape[0].every(c => c === 1) &&
                            shape[1].every(c => c === 1) &&
                            shape[2].every(c => c === 1)) {
                            return false;
                        }
                        return true;
                    });
                }

                blockShape =
                    availableShapes[Math.floor(Math.random() * availableShapes.length)];
                blockColor = getRandomColor();
                blockElement = createBlockElement(blockShape, blockColor);
                blockElement.classList.add("block-pick");
                blockElement.dataset.index = i;
                blockElement.dataset.shape = JSON.stringify(blockShape);
                blockElement.dataset.color = blockColor;
                attempts++;
            } while (!canPlaceBlock(blockShape) && attempts < maxAttempts);

            if (attempts >= maxAttempts) {
                console.error(
                    "Unable to generate placeable blocks after maximum attempts."
                );
                showGameOverNoLivesDialog();
                return;
            }

            generatedBlocks.push(blockElement);
        }

        if (!canPlaceAllBlocks(generatedBlocks)) {
            console.error("Generated blocks cannot all fit on the board.");
            showGameOverNoLivesDialog();
            return;
        }

        generatedBlocks.forEach((blockElement) => {
            blocksContainer.appendChild(blockElement);
            blockElement.addEventListener("click", () =>
                selectBlock(blockElement)
            );
        });

        saveGameState();

        if (initialBlocksGenerated && !hasValidMoves()) {
            if (lives > 0) {
                showReshuffleDialog();
            } else {
                showGameOverNoLivesDialog();
            }
        } else {
            initialBlocksGenerated = true;
            isLosingReshuffle = false;
        }
    }

    // Function to check if all blocks can be placed on the board
    function canPlaceAllBlocks(blocks) {
        const rows = _rows;
        const cols = _cols;
        const board = Array.from({ length: rows }, () =>
            Array(cols).fill(false)
        );

        for (const block of blocks) {
            const shape = JSON.parse(block.dataset.shape);
            let placed = false;

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (canPlaceShapeAt(shape, row, col, board)) {
                        placeShapeAt(shape, row, col, board);
                        placed = true;
                        break;
                    }
                }
                if (placed) break;
            }

            if (!placed) return false;
        }

        return true;
    }

    // Function to check if a shape can be placed at a specific position on the board
    function canPlaceShapeAt(shape, startRow, startCol, board) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const row = startRow + r;
                    const col = startCol + c;
                    if (
                        row >= board.length ||
                        col >= board[0].length ||
                        board[row][col]
                    ) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    // Function to place a shape at a specific position on the board
    function placeShapeAt(shape, startRow, startCol, board) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (shape[r][c]) {
                    const row = startRow + r;
                    const col = startCol + c;
                    board[row][col] = true;
                }
            }
        }
    }

    // Function to forcefully generate new blocks
    function generateBlocksForce() {
        blocksContainer.innerHTML = "";

        for (let i = 0; i < 3; i++) {
            const blockShape =
                blockShapes[Math.floor(Math.random() * blockShapes.length)];
            const blockColor = getRandomColor();
            const blockElement = createBlockElement(blockShape, blockColor);
            blockElement.classList.add("block-pick");
            blockElement.dataset.index = i;
            blockElement.dataset.shape = JSON.stringify(blockShape);
            blockElement.dataset.color = blockColor;
            blocksContainer.appendChild(blockElement);
            blockElement.addEventListener("click", () =>
                selectBlock(blockElement)
            );
        }
    }

    // Function to check if a block can be placed on the board
    function canPlaceBlock(shape) {
        const rows = _rows;
        const cols = _cols;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                let canPlace = true;

                shape.forEach((shapeRow, rIdx) => {
                    shapeRow.forEach((cell, cIdx) => {
                        if (cell) {
                            const targetCell = document.querySelector(
                                `.square[data-row="${row + rIdx}"][data-col="${col + cIdx
                                }"]`
                            );
                            if (
                                !targetCell ||
                                targetCell.style.backgroundColor
                            ) {
                                canPlace = false;
                            }
                        }
                    });
                });

                if (canPlace) {
                    return true;
                }
            }
        }

        return false;
    }

    // Function to create a block element
    function createBlockElement(shape, color) {
        const blockDiv = document.createElement("div");
        blockDiv.className = "flex flex-col items-center justify-center";

        shape.forEach((row) => {
            const rowDiv = document.createElement("div");
            rowDiv.className = "flex justify-center";
            row.forEach((cell) => {
                const cellDiv = document.createElement("div");
                cellDiv.className = "w-[20px] h-[20px] m-0";
                if (cell) {
                    cellDiv.style.backgroundColor = color;
                } else {
                    cellDiv.className += " invisible";
                }
                rowDiv.appendChild(cellDiv);
            });
            blockDiv.appendChild(rowDiv);
        });

        blockDiv.draggable = true;

        return blockDiv;
    }

    // Function to get a random color for the blocks
    function getRandomColor() {
        const colors = [
            "var(--color-red-block)",
            "var(--color-green-block)",
            "var(--color-blue-block)",
            "var(--color-yellow-block)",
            "var(--color-purple-block)",
            "var(--color-orange-block)",
            "var(--color-pink-block)",
            "var(--color-cyan-block)",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Function to select a block
    function selectBlock(block) {
        document
            .querySelectorAll(".block-pick")
            .forEach((b) => b.classList.remove("selected"));
        block.classList.add("selected");
        selectedBlock = block;
        gameSounds.play("select");
    }

    // Function to save the game state to local storage
    function saveGameState() {
        const boardState = [];
        document.querySelectorAll(".square").forEach((cell) => {
            boardState.push(cell.style.backgroundColor || "");
        });
        const blocksState = [];
        document.querySelectorAll(".block-pick").forEach((block) => {
            blocksState.push({
                shape: block.dataset.shape,
                color: block.dataset.color,
            });
        });
        localStorage.setItem("boardState", JSON.stringify(boardState));
        localStorage.setItem("blocksState", JSON.stringify(blocksState));
        localStorage.setItem("score", score);
        localStorage.setItem("lives", lives);
    }

    // Function to load the game state from local storage
    function loadGameState() {
        const boardState = JSON.parse(localStorage.getItem("boardState"));
        const blocksState = JSON.parse(localStorage.getItem("blocksState"));
        if (boardState && blocksState) {
            document.querySelectorAll(".square").forEach((cell, index) => {
                cell.style.backgroundColor = boardState[index];
            });
            blocksContainer.innerHTML = "";
            blocksState.forEach((blockData) => {
                const blockShape = JSON.parse(blockData.shape);
                const blockColor = blockData.color;
                const blockElement = createBlockElement(blockShape, blockColor);
                blockElement.classList.add("block-pick");
                blockElement.dataset.shape = blockData.shape;
                blockElement.dataset.color = blockColor;
                blocksContainer.appendChild(blockElement);
                blockElement.addEventListener("click", () =>
                    selectBlock(blockElement)
                );
            });
            score = parseInt(localStorage.getItem("score"));
            lives = parseInt(localStorage.getItem("lives"));
            scoreElement.textContent = score;
            livesElement.textContent = lives;
            scoreEndElement.textContent = score;
        }
    }

    let reshuffled = false;

    // Event listener for placing a block on the grid
    gridContainer.addEventListener("click", (event) => {
        if (!selectedBlock) return;

        const cell = event.target;
        if (!cell.classList.contains("square")) return;

        const shape = JSON.parse(selectedBlock.dataset.shape);
        const color = selectedBlock.dataset.color;

        const startRow = parseInt(cell.dataset.row);
        const startCol = parseInt(cell.dataset.col);

        let canPlace = true;

        shape.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    const targetCell = document.querySelector(
                        `.square[data-row="${startRow + rIdx}"][data-col="${startCol + cIdx
                        }"]`
                    );
                    if (!targetCell || targetCell.style.backgroundColor) {
                        canPlace = false;
                    }
                }
            });
        });

        if (canPlace) {
            shape.forEach((row, rIdx) => {
                row.forEach((cell, cIdx) => {
                    if (cell) {
                        const targetCell = document.querySelector(
                            `.square[data-row="${startRow + rIdx}"][data-col="${startCol + cIdx
                            }"]`
                        );
                        targetCell.style.backgroundColor = color;
                    }
                });
            });

            gameSounds.play("place");
            selectedBlock.remove();
            selectedBlock = null;

            if (blocksContainer.children.length === 0) {
                generateBlocks();
            }

            updateScore(calculateBlockScore(shape));

            checkAndBreakLines();

            if (!hasValidMoves() && initialBlocksGenerated) {
                if (blocksContainer.children.length === 0) {
                    generateBlocksForce();
                } else {
                    if (lives > 0) {
                        showGameOverDialog();
                    } else {
                        showGameOverNoLivesDialog();
                    }
                }
            }

            saveGameState();
            clearPreview();
        }
    });

    // Function to check and break completed lines or squares based on mode
    function checkAndBreakLines() {
        if (gameMode === "classic") {
            checkAndBreakLinesClassic();
        } else if (gameMode === "99") {
            checkAndBreakSquares99();
        }
    }

    function checkAndBreakLinesClassic() {
        const rows = _rows;
        const cols = _cols;
        let breakableRows = [];
        let breakableCols = [];

        for (let row = 0; row < rows; row++) {
            let isRowBreakable = true;
            for (let col = 0; col < cols; col++) {
                const cell = document.querySelector(
                    `.square[data-row="${row}"][data-col="${col}"]`
                );
                if (!cell.style.backgroundColor) {
                    isRowBreakable = false;
                    break;
                }
            }
            if (isRowBreakable) breakableRows.push(row);
        }

        for (let col = 0; col < cols; col++) {
            let isColBreakable = true;
            for (let row = 0; row < rows; row++) {
                const cell = document.querySelector(
                    `.square[data-row="${row}"][data-col="${col}"]`
                );
                if (!cell.style.backgroundColor) {
                    isColBreakable = false;
                    break;
                }
            }
            if (isColBreakable) breakableCols.push(col);
        }

        if (breakableRows.length > 0 || breakableCols.length > 0) {
            comboCount++;
            comboMovesLeft = 3;
        } else {
            comboMovesLeft--;
            if (comboMovesLeft <= 0) {
                comboCount = 0;
            }
        }

        updateComboDisplay();

        breakableRows.forEach((row) => {
            for (let col = 0; col < cols; col++) {
                const cell = document.querySelector(
                    `.square[data-row="${row}"][data-col="${col}"]`
                );
                cell.style.backgroundColor = "";
            }
        });

        breakableCols.forEach((col) => {
            for (let row = 0; row < rows; row++) {
                const cell = document.querySelector(
                    `.square[data-row="${row}"][data-col="${col}"]`
                );
                cell.style.backgroundColor = "";
            }
        });

        if (breakableRows.length > 0 || breakableCols.length > 0) {
            const multiplier = breakableRows.length + breakableCols.length;
            const comboBonus = calculateScore(multiplier, score_base);
            updateScore(comboBonus);

            if (comboCount > 1) {
                gameSounds.play("combo");
            } else {
                gameSounds.play("clear");
            }
        }
    }

    function checkAndBreakSquares99() {
        const rows = _rows;
        const cols = _cols;
        let breakableSquares = []; // Store top-left coordinates of 3x3 squares

        // Iterate through all 3x3 subgrids
        // Hardcoded for 9x9 grid: 0, 3, 6 (0-2, 3-5, 6-8)
        const subgridStarts = [0, 3, 6];

        for (let rStart of subgridStarts) {
            for (let cStart of subgridStarts) {
                let isSquareBreakable = true;
                // Check if 3x3 is full
                for (let r = 0; r < 3; r++) {
                    for (let c = 0; c < 3; c++) {
                        const cell = document.querySelector(
                            `.square[data-row="${rStart + r}"][data-col="${cStart + c}"]`
                        );
                        if (!cell.style.backgroundColor) {
                            isSquareBreakable = false;
                            break;
                        }
                    }
                    if (!isSquareBreakable) break;
                }

                if (isSquareBreakable) {
                    breakableSquares.push({ r: rStart, c: cStart });
                }
            }
        }

        if (breakableSquares.length > 0) {
            comboCount++;
            comboMovesLeft = 3;
        } else {
            comboMovesLeft--;
            if (comboMovesLeft <= 0) {
                comboCount = 0;
            }
        }

        updateComboDisplay();

        breakableSquares.forEach((start) => {
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const cell = document.querySelector(
                        `.square[data-row="${start.r + r}"][data-col="${start.c + c}"]`
                    );
                    cell.style.backgroundColor = "";
                }
            }
        });

        if (breakableSquares.length > 0) {
            const multiplier = breakableSquares.length;
            const comboBonus = calculateScore(multiplier, score_base);
            updateScore(comboBonus);

            if (comboCount > 1) {
                gameSounds.play("combo");
            } else {
                gameSounds.play("clear");
            }
        }
    }

    // Function to check if there are valid moves left
    function hasValidMoves() {
        const rows = _rows;
        const cols = _cols;
        const blocks = document.querySelectorAll(".block-pick");

        for (let block of blocks) {
            const shape = JSON.parse(block.dataset.shape);

            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    let canPlace = true;

                    shape.forEach((shapeRow, rIdx) => {
                        shapeRow.forEach((cell, cIdx) => {
                            if (cell) {
                                const targetCell = document.querySelector(
                                    `.square[data-row="${row + rIdx
                                    }"][data-col="${col + cIdx}"]`
                                );
                                if (
                                    !targetCell ||
                                    targetCell.style.backgroundColor
                                ) {
                                    canPlace = false;
                                }
                            }
                        });
                    });

                    if (canPlace) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    // Function to initialize the grid
    function initializeGrid(rows, cols) {
        gridContainer.innerHTML = "";
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const cell = document.createElement("div");
                cell.classList.add("square");
                cell.dataset.row = row;
                cell.dataset.col = col;
                gridContainer.appendChild(cell);
            }
        }
    }

    initializeGrid(9, 9);

    if (localStorage.getItem("boardState")) {
        loadGameState();
        checkGameOverCondition();
    } else {
        generateBlocks();
        checkGameOverCondition();
    }

    function checkGameOverCondition() {
        // Simple timeout to ensure DOM is ready and blocks are rendered
        setTimeout(() => {
            if (!hasValidMoves()) {
                if (lives > 0) {
                    showGameOverDialog();
                } else {
                    showGameOverNoLivesDialog();
                }
            }
        }, 100);
    }

    highScore_Element.textContent = localStorage.getItem("highScore_") || 0;

    const refreshButton = document.getElementById("refresh");
    const showScoresButton = document.getElementById("show-scores");
    const highScoresModal = document.getElementById("high-scores-modal");
    const closeScoresModal = document.getElementById("close-modal");
    const highScoresList = document.getElementById("high-scores-list");
    const clearScoresButton = document.getElementById("clear-scores");

    refreshButton.addEventListener("click", () => {
        if (confirm("Reset the game? Your current score will be lost.")) {
            resetGame();
        }
    });

    // Function to save score to high scores list
    function saveHighScore(newScore) {
        if (newScore <= 0) return;
        let highScores = JSON.parse(localStorage.getItem("highScores_list")) || [];
        const date = new Date().toLocaleDateString();
        highScores.push({ score: newScore, date: date });
        highScores.sort((a, b) => b.score - a.score);
        highScores = highScores.slice(0, 10);
        localStorage.setItem("highScores_list", JSON.stringify(highScores));
    }

    // Function to display high scores
    function displayHighScores() {
        const highScores = JSON.parse(localStorage.getItem("highScores_list")) || [];
        highScoresList.innerHTML = "";
        if (highScores.length === 0) {
            highScoresList.innerHTML = "<li>No scores yet!</li>";
        } else {
            highScores.forEach((item) => {
                const li = document.createElement("li");
                li.innerHTML = `${item.date} <span>${item.score}</span>`;
                highScoresList.appendChild(li);
            });
        }
        highScoresModal.classList.remove("hidden");
    }

    showScoresButton.addEventListener("click", displayHighScores);
    closeScoresModal.addEventListener("click", () => {
        highScoresModal.classList.add("hidden");
    });

    window.addEventListener("click", (event) => {
        if (event.target === highScoresModal) {
            highScoresModal.classList.add("hidden");
        }
    });

    clearScoresButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear all high scores?")) {
            localStorage.removeItem("highScores_list");
            displayHighScores();
        }
    });

    // Update showGameOverNoLivesDialog to save score
    const originalShowGameOverNoLivesDialog = showGameOverNoLivesDialog;
    showGameOverNoLivesDialog = function () {
        saveHighScore(score);
        originalShowGameOverNoLivesDialog();
    };

    // Function to show a preview of the block placement
    function showPreview(startRow, startCol) {
        clearPreview();
        if (!selectedBlock && !touchDraggingBlock) return;

        const shape = selectedBlock
            ? JSON.parse(selectedBlock.dataset.shape)
            : JSON.parse(touchDraggingBlock.dataset.shape);
        let canPlace = true;

        shape.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    const targetRow = startRow + rIdx;
                    const targetCol = startCol + cIdx;
                    const targetCell = document.querySelector(
                        `.square[data-row="${targetRow}"][data-col="${targetCol}"]`
                    );
                    if (targetCell) {
                        targetCell.classList.add("preview");
                        if (targetCell.style.backgroundColor) {
                            canPlace = false;
                            targetCell.classList.add("preview-wrong");
                        }
                    } else {
                        canPlace = false;
                    }
                }
            });
        });

        if (!canPlace) {
            shape.forEach((row, rIdx) => {
                row.forEach((cell, cIdx) => {
                    if (cell) {
                        const targetRow = startRow + rIdx;
                        const targetCol = startCol + cIdx;
                        const targetCell = document.querySelector(
                            `.square[data-row="${targetRow}"][data-col="${targetCol}"]`
                        );
                        if (targetCell) {
                            targetCell.classList.add("preview-wrong");
                        }
                    }
                });
            });
        }
    }

    // Function to clear the block placement preview
    function clearPreview() {
        document
            .querySelectorAll(".preview, .preview-wrong")
            .forEach((cell) => {
                cell.classList.remove("preview", "preview-wrong");
            });
    }

    // Function to show a snapping preview of the block placement
    function showSnappingPreview(startRow, startCol) {
        clearPreview();
        if (!draggedBlock) return;

        const shape = JSON.parse(draggedBlock.dataset.shape);
        let canPlace = true;

        shape.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    const targetRow = startRow + rIdx;
                    const targetCol = startCol + cIdx;
                    const targetCell = document.querySelector(
                        `.square[data-row="${targetRow}"][data-col="${targetCol}"]`
                    );
                    if (targetCell) {
                        targetCell.classList.add("preview");
                        if (targetCell.style.backgroundColor) {
                            canPlace = false;
                            targetCell.classList.add("preview-wrong");
                        }
                    } else {
                        canPlace = false;
                    }
                }
            });
        });

        if (!canPlace) {
            shape.forEach((row, rIdx) => {
                row.forEach((cell, cIdx) => {
                    if (cell) {
                        const targetRow = startRow + rIdx;
                        const targetCol = startCol + cIdx;
                        const targetCell = document.querySelector(
                            `.square[data-row="${targetRow}"][data-col="${targetCol}"]`
                        );
                        if (targetCell) {
                            targetCell.classList.add("preview-wrong");
                        }
                    }
                });
            });
        }
    }

    let draggedBlock = null;

    // Event listener for starting to drag a block
    blocksContainer.addEventListener("dragstart", (event) => {
        if (event.target.classList.contains("block-pick")) {
            gameSounds.play("pickup");
            draggedBlock = event.target;
            event.dataTransfer.setData(
                "text/plain",
                event.target.dataset.index
            );

            const shape = JSON.parse(draggedBlock.dataset.shape);
            const color = draggedBlock.dataset.color;

            const dragPreview = document.createElement("div");
            dragPreview.className = "flex flex-col items-center justify-center absolute -top-[9999px]";
            // dragPreview.style.display = "flex";
            // dragPreview.style.flexDirection = "column";
            // dragPreview.style.alignItems = "center";
            // dragPreview.style.justifyContent = "center";
            // dragPreview.style.position = "absolute";
            // dragPreview.style.top = "-9999px";

            shape.forEach((row) => {
                const rowDiv = document.createElement("div");
                rowDiv.className = "flex justify-center";
                row.forEach((cell) => {
                    const cellDiv = document.createElement("div");
                    cellDiv.className = "w-[78px] h-[78px] m-0 border border-gray-300 dark:border-gray-600 opacity-50";
                    // cellDiv.style.width = "78px";
                    // cellDiv.style.height = "78px";
                    // cellDiv.style.margin = "0";
                    // cellDiv.style.border = "1px solid var(--border-color)";
                    // cellDiv.style.opacity = "0.5";
                    if (cell) {
                        cellDiv.style.backgroundColor = color;
                    } else {
                        cellDiv.className += " invisible";
                    }
                    rowDiv.appendChild(cellDiv);
                });
                dragPreview.appendChild(rowDiv);
            });

            document.body.appendChild(dragPreview);
            event.dataTransfer.setDragImage(dragPreview, 0, 0);
            setTimeout(() => document.body.removeChild(dragPreview), 0);
        }
    });

    // Event listener for ending the drag of a block
    blocksContainer.addEventListener("dragend", () => {
        draggedBlock = null;
    });

    // Event listener for dragging a block over the grid
    gridContainer.addEventListener("dragover", (event) => {
        event.preventDefault();
        const cell = event.target;
        if (cell.classList.contains("square")) {
            const startRow = parseInt(cell.dataset.row);
            const startCol = parseInt(cell.dataset.col);
            showPreview(startRow, startCol);
        }
    });

    // Event listener for dropping a block on the grid
    gridContainer.addEventListener("drop", (event) => {
        event.preventDefault();
        const cell = event.target;
        if (!draggedBlock || !cell.classList.contains("square")) return;

        placeBlock(cell, draggedBlock);
    });

    // Event listener for entering a cell while dragging a block
    gridContainer.addEventListener("dragenter", (event) => {
        const cell = event.target;
        if (cell.classList.contains("square")) {
            const startRow = parseInt(cell.dataset.row);
            const startCol = parseInt(cell.dataset.col);
            showSnappingPreview(startRow, startCol);
        }
    });

    // Event listener for dragging a block over the grid
    gridContainer.addEventListener("dragover", (event) => {
        event.preventDefault();
        const cell = event.target;
        if (cell.classList.contains("square")) {
            const startRow = parseInt(cell.dataset.row);
            const startCol = parseInt(cell.dataset.col);
            showSnappingPreview(startRow, startCol);
        }
    });

    // Event listener for leaving a cell while dragging a block
    gridContainer.addEventListener("dragleave", () => {
        clearPreview();
    });

    // Event listener for dropping a block on the grid
    gridContainer.addEventListener("drop", (event) => {
        event.preventDefault();
        const cell = event.target;
        if (!draggedBlock || !cell.classList.contains("square")) return;

        placeBlock(cell, draggedBlock);
    });

    // Event listener for entering a cell while dragging a block
    gridContainer.addEventListener("dragenter", (event) => {
        const cell = event.target;
        if (cell.classList.contains("square")) {
            const startRow = parseInt(cell.dataset.row);
            const startCol = parseInt(cell.dataset.col);
            showSnappingPreview(startRow, startCol);
        }
    });

    let touchStartX = 0;
    let touchStartY = 0;
    let touchDraggingBlock = null;
    let touchDragPreview = null;
    let previewCell = null;

    // Event listener for starting to touch a block
    blocksContainer.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const block = target.closest(".block-pick");
        if (block) {
            gameSounds.play("pickup");
            touchDraggingBlock = block;
            touchStartX = touch.clientX;
            touchStartY = touch.clientY;
            block.classList.add("dragging");

            const shape = JSON.parse(block.dataset.shape);
            const color = block.dataset.color;

            touchDragPreview = document.createElement("div");
            touchDragPreview.className = "flex flex-col items-center justify-center fixed pointer-events-none z-[1000] -translate-x-1/2 -translate-y-1/2";
            touchDragPreview.style.left = `${touch.clientX}px`;
            touchDragPreview.style.top = `${touch.clientY - 80}px`;
            // touchDragPreview.style.transform = "translate(-50%, -50%)";

            shape.forEach((row) => {
                const rowDiv = document.createElement("div");
                rowDiv.style.display = "flex";
                rowDiv.style.justifyContent = "center";
                row.forEach((cell) => {
                    const cellDiv = document.createElement("div");
                    cellDiv.style.width = "38px";
                    cellDiv.style.height = "38px";
                    cellDiv.style.margin = "0";
                    cellDiv.style.border = "1px solid var(--border-color)";
                    cellDiv.style.opacity = "0.5";
                    if (cell) {
                        cellDiv.style.backgroundColor = color;
                    } else {
                        cellDiv.style.visibility = "hidden";
                    }
                    rowDiv.appendChild(cellDiv);
                });
                touchDragPreview.appendChild(rowDiv);
            });

            document.body.appendChild(touchDragPreview);
        }
    });

    // Event listener for moving a touch while dragging a block
    blocksContainer.addEventListener("touchmove", (event) => {
        if (touchDraggingBlock && touchDragPreview) {
            event.preventDefault();
            const touch = event.touches[0];
            const mappedY = touch.clientY - 160;
            const touchClientX = touch.clientX + 60

            touchDragPreview.style.left = `${touchClientX}px`;
            touchDragPreview.style.top = `${mappedY}px`;
            // console.log(mappedY, touchClientX)
            // log1.innerHTML = mappedY + " " + touchClientX
            previewCell = document.elementFromPoint(touchClientX, mappedY);
            showPreviewOnTouch(touchClientX, mappedY);
        }
    });

    // Event listener for ending a touch while dragging a block
    blocksContainer.addEventListener("touchend", (event) => {
        if (touchDraggingBlock && touchDragPreview) {
            touchDraggingBlock.classList.remove("dragging");
            document.body.removeChild(touchDragPreview);
            touchDragPreview = null;
            if (previewCell && previewCell.classList.contains("square")) {
                placeBlock(previewCell, touchDraggingBlock);
            }
            touchDraggingBlock = null;
            previewCell = null;
        }
    });

    // Event listener for starting to touch the grid
    gridContainer.addEventListener("touchstart", (event) => {
        if (touchDraggingBlock) {
            const touch = event.touches[0];
            const cell = document.elementFromPoint(
                touch.clientX,
                touch.clientY
            );
            if (cell && cell.classList.contains("square")) {
                showPreview(
                    parseInt(cell.dataset.row),
                    parseInt(cell.dataset.col)
                );
            }
        }
    });

    // Function to show a preview of the block placement on touch
    function showPreviewOnTouch(x, y) {
        clearPreview();
        const cell = document.elementFromPoint(x, y);
        if (cell && cell.classList.contains("square")) {
            showPreview(parseInt(cell.dataset.row), parseInt(cell.dataset.col));
        }
    }

    // Function to place a block on the grid
    function placeBlock(cell, block) {
        const shape = JSON.parse(block.dataset.shape);
        const color = block.dataset.color;

        const startRow = parseInt(cell.dataset.row);
        const startCol = parseInt(cell.dataset.col);

        let canPlace = true;

        shape.forEach((row, rIdx) => {
            row.forEach((cell, cIdx) => {
                if (cell) {
                    const targetCell = document.querySelector(
                        `.square[data-row="${startRow + rIdx}"][data-col="${startCol + cIdx
                        }"]`
                    );
                    if (!targetCell || targetCell.style.backgroundColor) {
                        canPlace = false;
                    }
                }
            });
        });

        if (canPlace) {
            shape.forEach((row, rIdx) => {
                row.forEach((cell, cIdx) => {
                    if (cell) {
                        const targetCell = document.querySelector(
                            `.square[data-row="${startRow + rIdx}"][data-col="${startCol + cIdx
                            }"]`
                        );
                        targetCell.style.backgroundColor = color;
                    }
                });
            });

            gameSounds.play("place");
            block.remove();

            if (blocksContainer.children.length === 0) {
                generateBlocks();
            }

            updateScore(calculateBlockScore(shape));

            checkAndBreakLines();

            if (!hasValidMoves() && initialBlocksGenerated) {
                if (blocksContainer.children.length === 0) {
                    generateBlocksForce();
                } else {
                    if (lives > 0) {
                        showGameOverDialog();
                    } else {
                        showGameOverNoLivesDialog();
                    }
                }
            }

            saveGameState();
            clearPreview();
        } else {
            clearPreview();
            gameSounds.play("invalid");
        }
    }

    // Joystick Logic
    const joystickLayer = document.getElementById("joystick-layer");

    function createJoysticks() {
        joystickLayer.innerHTML = "";
        const blocks = Array.from(blocksContainer.children); // Get actual block elements
        const count = blocks.length;

        // Apply alignment classes to containers
        // Alignments: 3 -> around, 2 -> center (modified), 1 -> center
        let justifyClass = "justify-around"; // Default for 3
        if (count <= 2) justifyClass = "justify-center gap-[20px]"; // Added gap for spacing when centered

        // Update block select container
        blocksContainer.className = `flex flex-col justify-center items-center w-[198px] h-[638px] border border-gray-300 dark:border-gray-600 rounded-[10px] ml-[20px] max-sm:w-[320px] max-sm:h-[98px] max-sm:ml-0 max-sm:mt-[20px] max-sm:flex-row ${justifyClass}`;

        // Update joystick layer container
        joystickLayer.className = `max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:h-[100px] max-sm:flex max-sm:items-center max-sm:pointer-events-none max-sm:z-[900] ${justifyClass}`;

        // Create exactly 'count' joysticks, mapped to the blocks
        blocks.forEach((block, index) => {
            const zone = document.createElement("div");
            // zone width could be dynamic or fixed. 30% works for around/between.
            // If center, maybe auto? Or still 30%?
            zone.className = "joystick-zone w-[30%] h-[100px] flex justify-center items-center pointer-events-auto";
            zone.dataset.index = index;

            const base = document.createElement("div");
            base.className = "joystick-base";

            const stick = document.createElement("div");
            stick.className = "joystick-stick";

            base.appendChild(stick);
            zone.appendChild(base);
            joystickLayer.appendChild(zone);

            initJoystick(zone, stick, block);
        });
    }

    function initJoystick(zone, stick, block) {
        let startX, startY;
        let initialBlockX, initialBlockY;
        let active = false;

        zone.addEventListener("touchstart", (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            active = true;
            gameSounds.play("pickup");

            // Visual feedback
            stick.style.transition = "none";

            // Initialize Drag
            touchDraggingBlock = block;
            block.classList.add("dragging");

            const shape = JSON.parse(block.dataset.shape);
            const color = block.dataset.color;

            // Create ghost block
            touchDragPreview = document.createElement("div");
            touchDragPreview.className = "flex flex-col items-center justify-center fixed pointer-events-none z-[1000] -translate-x-1/2 -translate-y-1/2";
            // Calculate initial position: Start slightly above the joystick or at the block's original dock position?
            // "Move new block" -> We want to lift it out of the dock.
            // Let's start the ghost at the dock position (center of joystick zone roughly)
            const rect = zone.getBoundingClientRect();
            initialBlockX = rect.left + rect.width / 2;
            initialBlockY = rect.top - 50; // Start slightly above

            touchDragPreview.style.left = `${initialBlockX}px`;
            touchDragPreview.style.top = `${initialBlockY}px`;

            shape.forEach((row) => {
                const rowDiv = document.createElement("div");
                rowDiv.style.display = "flex";
                rowDiv.style.justifyContent = "center";
                row.forEach((cell) => {
                    const cellDiv = document.createElement("div");
                    cellDiv.style.width = "38px";
                    cellDiv.style.height = "38px";
                    cellDiv.style.margin = "0";
                    cellDiv.style.border = "1px solid var(--border-color)";
                    cellDiv.style.opacity = "0.5";
                    if (cell) {
                        cellDiv.style.backgroundColor = color;
                    } else {
                        cellDiv.style.visibility = "hidden";
                    }
                    rowDiv.appendChild(cellDiv);
                });
                touchDragPreview.appendChild(rowDiv);
            });

            document.body.appendChild(touchDragPreview);
        });

        zone.addEventListener("touchmove", (e) => {
            if (!active) return;
            e.preventDefault();
            const touch = e.touches[0];

            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;

            // Move Joystick Knob with limit
            const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDist = 25;
            const angle = Math.atan2(deltaY, deltaX);
            const stickX = dist > maxDist ? Math.cos(angle) * maxDist : deltaX;
            const stickY = dist > maxDist ? Math.sin(angle) * maxDist : deltaY;

            stick.style.transform = `translate(calc(-50% + ${stickX}px), calc(-50% + ${stickY}px))`;

            // Move Block (Amplified?)
            // 1:1 movement feels most precise for "dragging via proxy"
            // But maybe 1.5x interaction to reach top of screen easily?
            // User requested: "character doesn't reach the top of the grid" in a previous conversation.
            // Let's use a multiplier.
            const sensitivity = 2.0;
            const currentBlockX = initialBlockX + (deltaX * sensitivity);
            const currentBlockY = initialBlockY + (deltaY * sensitivity);

            if (touchDragPreview) {
                touchDragPreview.style.left = `${currentBlockX}px`;
                touchDragPreview.style.top = `${currentBlockY}px`;

                // Update preview on grid
                previewCell = document.elementFromPoint(currentBlockX, currentBlockY);
                showPreviewOnTouch(currentBlockX, currentBlockY);
            }
        });

        zone.addEventListener("touchend", (e) => {
            if (!active) return;
            active = false;

            // Reset Joystick
            stick.style.transition = "transform 0.1s";
            stick.style.transform = "translate(-50%, -50%)";

            // Attempt Place
            if (touchDraggingBlock && touchDragPreview) {
                touchDraggingBlock.classList.remove("dragging");
                document.body.removeChild(touchDragPreview);
                touchDragPreview = null;

                if (previewCell && previewCell.classList.contains("square")) {
                    placeBlock(previewCell, touchDraggingBlock);
                    // Update joysticks after placement (remove the used one)
                    createJoysticks();
                }

                touchDraggingBlock = null;
                previewCell = null;
                clearPreview();
            }
        });
    }

    // Hook into generateBlocks to refresh joysticks
    const originalGenerateBlocks = generateBlocks;
    generateBlocks = function () {
        originalGenerateBlocks();
        createJoysticks();
    }
    createJoysticks();
    // Also hook loadGameState
    const originalLoadGameState = loadGameState;
    loadGameState = function () {
        originalLoadGameState();
        createJoysticks();
    }
});
