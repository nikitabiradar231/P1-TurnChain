// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title TurnChain
 * @notice Fully on-chain, asynchronous, two-player Connect Four game on Base Sepolia.
 * @dev All game logic, win conditions, draw checks, turn enforcement, and inactivity timeout
 * forfeitures are enforced strictly and autonomously by this contract.
 */
contract TurnChain {
    // ---------------------------------------------------------
    // Constants
    // ---------------------------------------------------------
    uint8 public constant BOARD_COLUMNS = 7;
    uint8 public constant BOARD_ROWS = 6;
    uint8 public constant MAX_MOVES = BOARD_COLUMNS * BOARD_ROWS; // 42
    uint256 public constant TIMEOUT_DURATION = 1 days; // 24 hours inactivity limit

    // ---------------------------------------------------------
    // Data Structures
    // ---------------------------------------------------------
    enum GameStatus {
        None,       // 0: Game does not exist
        Waiting,    // 1: Created, waiting for Player 2
        Active,     // 2: Game in progress
        Won,        // 3: Finished with 4 in a row
        Drawn,      // 4: Board filled without a winner
        Forfeited   // 5: Winner decided via timeout claim
    }

    struct Game {
        uint256 gameId;
        address player1;
        address player2;
        address currentTurn;
        address winner;
        GameStatus status;
        uint8 moveCount;
        uint256 lastMoveTimestamp;
        uint8[6][7] board;     // board[col][row], where 0 = Empty, 1 = Player 1, 2 = Player 2
        uint8[7] colHeights;   // Current height (number of discs) in each column (0..6)
    }

    struct GameSummary {
        uint256 gameId;
        address player1;
        address player2;
        address currentTurn;
        address winner;
        GameStatus status;
        uint8 moveCount;
        uint256 lastMoveTimestamp;
    }

    // ---------------------------------------------------------
    // Storage
    // ---------------------------------------------------------
    uint256 public gameCount;
    mapping(uint256 => Game) private _games;

    // ---------------------------------------------------------
    // Events
    // ---------------------------------------------------------
    event GameCreated(uint256 indexed gameId, address indexed player1);
    event PlayerJoined(uint256 indexed gameId, address indexed player2);
    event MoveMade(
        uint256 indexed gameId,
        address indexed player,
        uint8 column,
        uint8 row
    );
    event GameWon(uint256 indexed gameId, address indexed winner);
    event GameDrawn(uint256 indexed gameId);
    event GameForfeited(
        uint256 indexed gameId,
        address indexed winner,
        address indexed forfeitedPlayer
    );

    // ---------------------------------------------------------
    // Custom Errors
    // ---------------------------------------------------------
    error GameDoesNotExist(uint256 gameId);
    error GameNotJoinable(uint256 gameId, GameStatus status);
    error CannotPlayAgainstSelf(uint256 gameId, address caller);
    error GameNotActive(uint256 gameId, GameStatus status);
    error NotYourTurn(uint256 gameId, address caller, address currentTurn);
    error InvalidColumn(uint256 gameId, uint8 column);
    error ColumnFull(uint256 gameId, uint8 column);
    error NotAPlayer(uint256 gameId, address caller);
    error CannotClaimTimeoutOnOwnTurn(uint256 gameId, address caller);
    error TimeoutNotReached(
        uint256 gameId,
        uint256 currentTimestamp,
        uint256 claimableTimestamp
    );

    // ---------------------------------------------------------
    // External Functions
    // ---------------------------------------------------------

    /**
     * @notice Creates a new game with msg.sender as Player 1.
     * @return gameId The newly assigned unique game ID.
     */
    function createGame() external returns (uint256 gameId) {
        unchecked {
            gameId = ++gameCount;
        }

        Game storage game = _games[gameId];
        game.gameId = gameId;
        game.player1 = msg.sender;
        game.status = GameStatus.Waiting;
        game.currentTurn = msg.sender;
        game.lastMoveTimestamp = block.timestamp;

        emit GameCreated(gameId, msg.sender);
    }

    /**
     * @notice Allows a second player to join an open game.
     * @param gameId The ID of the game to join.
     */
    function joinGame(uint256 gameId) external {
        Game storage game = _games[gameId];

        if (game.status == GameStatus.None) {
            revert GameDoesNotExist(gameId);
        }
        if (game.status != GameStatus.Waiting) {
            revert GameNotJoinable(gameId, game.status);
        }
        if (msg.sender == game.player1) {
            revert CannotPlayAgainstSelf(gameId, msg.sender);
        }

        game.player2 = msg.sender;
        game.status = GameStatus.Active;
        game.currentTurn = game.player1;
        game.lastMoveTimestamp = block.timestamp;

        emit PlayerJoined(gameId, msg.sender);
    }

    /**
     * @notice Drops a piece in the selected column on behalf of the current player.
     * @param gameId The ID of the game.
     * @param column The column index (0 to 6).
     */
    function makeMove(uint256 gameId, uint8 column) external {
        Game storage game = _games[gameId];

        if (game.status != GameStatus.Active) {
            if (game.status == GameStatus.None) {
                revert GameDoesNotExist(gameId);
            }
            revert GameNotActive(gameId, game.status);
        }
        if (msg.sender != game.currentTurn) {
            revert NotYourTurn(gameId, msg.sender, game.currentTurn);
        }
        if (column >= BOARD_COLUMNS) {
            revert InvalidColumn(gameId, column);
        }

        uint8 row = game.colHeights[column];
        if (row >= BOARD_ROWS) {
            revert ColumnFull(gameId, column);
        }

        uint8 playerDisc = (msg.sender == game.player1) ? 1 : 2;

        // Apply move
        game.board[column][row] = playerDisc;
        game.colHeights[column] = row + 1;
        game.moveCount++;
        game.lastMoveTimestamp = block.timestamp;

        emit MoveMade(gameId, msg.sender, column, row);

        // Check for 4 in a row
        if (_checkWin(game.board, column, row, playerDisc)) {
            game.status = GameStatus.Won;
            game.winner = msg.sender;
            emit GameWon(gameId, msg.sender);
            return;
        }

        // Check for draw (full board)
        if (game.moveCount == MAX_MOVES) {
            game.status = GameStatus.Drawn;
            emit GameDrawn(gameId);
            return;
        }

        // Switch turns
        game.currentTurn = (msg.sender == game.player1) ? game.player2 : game.player1;
    }

    /**
     * @notice Claims victory if the opponent exceeds the inactivity timeout deadline.
     * @param gameId The ID of the active game.
     */
    function claimTimeout(uint256 gameId) external {
        Game storage game = _games[gameId];

        if (game.status != GameStatus.Active) {
            if (game.status == GameStatus.None) {
                revert GameDoesNotExist(gameId);
            }
            revert GameNotActive(gameId, game.status);
        }
        if (msg.sender != game.player1 && msg.sender != game.player2) {
            revert NotAPlayer(gameId, msg.sender);
        }
        if (msg.sender == game.currentTurn) {
            revert CannotClaimTimeoutOnOwnTurn(gameId, msg.sender);
        }

        uint256 deadline = game.lastMoveTimestamp + TIMEOUT_DURATION;
        if (block.timestamp < deadline) {
            revert TimeoutNotReached(gameId, block.timestamp, deadline);
        }

        address forfeitedPlayer = game.currentTurn;
        game.status = GameStatus.Forfeited;
        game.winner = msg.sender;

        emit GameForfeited(gameId, msg.sender, forfeitedPlayer);
    }

    // ---------------------------------------------------------
    // View Functions
    // ---------------------------------------------------------

    /**
     * @notice Returns full state for a given game ID.
     */
    function getGame(uint256 gameId) external view returns (Game memory) {
        if (_games[gameId].status == GameStatus.None) {
            revert GameDoesNotExist(gameId);
        }
        return _games[gameId];
    }

    /**
     * @notice Returns 2D board for a given game ID.
     * @dev board[column][row] where col is 0..6, row is 0..5 (0 = bottom, 5 = top).
     */
    function getBoard(uint256 gameId) external view returns (uint8[6][7] memory) {
        if (_games[gameId].status == GameStatus.None) {
            revert GameDoesNotExist(gameId);
        }
        return _games[gameId].board;
    }

    /**
     * @notice Returns current column heights for a given game ID.
     */
    function getColHeights(uint256 gameId) external view returns (uint8[7] memory) {
        if (_games[gameId].status == GameStatus.None) {
            revert GameDoesNotExist(gameId);
        }
        return _games[gameId].colHeights;
    }

    /**
     * @notice Returns game summaries with pagination (from newest to oldest).
     * @param offset Start index from total games (e.g. 0 is the newest).
     * @param limit Maximum number of summaries to return.
     */
    function getRecentGames(
        uint256 offset,
        uint256 limit
    ) external view returns (GameSummary[] memory summaries, uint256 total) {
        total = gameCount;
        if (total == 0 || offset >= total) {
            return (new GameSummary[](0), total);
        }

        uint256 available = total - offset;
        uint256 count = limit < available ? limit : available;

        summaries = new GameSummary[](count);
        for (uint256 i = 0; i < count; i++) {
            uint256 id = total - offset - i;
            Game storage g = _games[id];
            summaries[i] = GameSummary({
                gameId: g.gameId,
                player1: g.player1,
                player2: g.player2,
                currentTurn: g.currentTurn,
                winner: g.winner,
                status: g.status,
                moveCount: g.moveCount,
                lastMoveTimestamp: g.lastMoveTimestamp
            });
        }
    }

    // ---------------------------------------------------------
    // Internal Win Detection
    // ---------------------------------------------------------

    /**
     * @dev Checks if placing `disc` at (`col`, `row`) completes 4 connected pieces in any direction.
     */
    function _checkWin(
        uint8[6][7] storage board,
        uint8 col,
        uint8 row,
        uint8 disc
    ) internal view returns (bool) {
        // 1. Horizontal (-)
        int8 count = 0;
        for (int8 c = int8(col) - 3; c <= int8(col) + 3; c++) {
            if (c >= 0 && c < int8(BOARD_COLUMNS)) {
                if (board[uint8(c)][row] == disc) {
                    count++;
                    if (count == 4) return true;
                } else {
                    count = 0;
                }
            }
        }

        // 2. Vertical (|) - discs drop from top, so check below current row
        if (row >= 3) {
            if (
                board[col][row - 1] == disc &&
                board[col][row - 2] == disc &&
                board[col][row - 3] == disc
            ) {
                return true;
            }
        }

        // 3. Diagonal Positive Slope (/) -> (col+d, row+d)
        count = 0;
        for (int8 d = -3; d <= 3; d++) {
            int8 c = int8(col) + d;
            int8 r = int8(row) + d;
            if (c >= 0 && c < int8(BOARD_COLUMNS) && r >= 0 && r < int8(BOARD_ROWS)) {
                if (board[uint8(c)][uint8(r)] == disc) {
                    count++;
                    if (count == 4) return true;
                } else {
                    count = 0;
                }
            }
        }

        // 4. Diagonal Negative Slope (\) -> (col+d, row-d)
        count = 0;
        for (int8 d = -3; d <= 3; d++) {
            int8 c = int8(col) + d;
            int8 r = int8(row) - d;
            if (c >= 0 && c < int8(BOARD_COLUMNS) && r >= 0 && r < int8(BOARD_ROWS)) {
                if (board[uint8(c)][uint8(r)] == disc) {
                    count++;
                    if (count == 4) return true;
                } else {
                    count = 0;
                }
            }
        }

        return false;
    }
}
