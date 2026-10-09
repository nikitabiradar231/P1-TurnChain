// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../contracts/TurnChain.sol";

contract TurnChainTest is Test {
    TurnChain public turnChain;

    address public alice = address(0xA11CE);
    address public bob = address(0xB0B);
    address public charlie = address(0xCAFE);

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

    function setUp() public {
        turnChain = new TurnChain();
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }

    // ---------------------------------------------------------
    // 1. Game Creation & Joining
    // ---------------------------------------------------------

    function test_CreateGame() public {
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GameCreated(1, alice);
        uint256 gameId = turnChain.createGame();

        assertEq(gameId, 1);
        assertEq(turnChain.gameCount(), 1);

        TurnChain.Game memory g = turnChain.getGame(1);
        assertEq(g.gameId, 1);
        assertEq(g.player1, alice);
        assertEq(g.player2, address(0));
        assertEq(g.currentTurn, alice);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Waiting));
        assertEq(g.moveCount, 0);
        assertEq(g.lastMoveTimestamp, block.timestamp);
    }

    function test_JoinGame() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit PlayerJoined(gameId, bob);
        turnChain.joinGame(gameId);

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(g.player2, bob);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Active));
        assertEq(g.currentTurn, alice);
        assertEq(g.lastMoveTimestamp, block.timestamp);
    }

    function test_RevertIf_Player1JoinsOwnGame() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(TurnChain.CannotPlayAgainstSelf.selector, gameId, alice)
        );
        turnChain.joinGame(gameId);
    }

    function test_RevertIf_ThirdPlayerJoins() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(bob);
        turnChain.joinGame(gameId);

        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(
                TurnChain.GameNotJoinable.selector,
                gameId,
                TurnChain.GameStatus.Active
            )
        );
        turnChain.joinGame(gameId);
    }

    function test_RevertIf_JoinNonExistentGame() public {
        vm.prank(bob);
        vm.expectRevert(abi.encodeWithSelector(TurnChain.GameDoesNotExist.selector, 999));
        turnChain.joinGame(999);
    }

    // ---------------------------------------------------------
    // 2. Turn Management & Legal Moves
    // ---------------------------------------------------------

    function test_MakeMove_TurnSwitching() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Move 1: Alice moves at column 3
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit MoveMade(gameId, alice, 3, 0);
        turnChain.makeMove(gameId, 3);

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(g.currentTurn, bob);
        assertEq(g.moveCount, 1);
        assertEq(turnChain.getColHeights(gameId)[3], 1);
        assertEq(turnChain.getBoard(gameId)[3][0], 1);

        // Move 2: Bob moves at column 3
        vm.prank(bob);
        vm.expectEmit(true, true, false, true);
        emit MoveMade(gameId, bob, 3, 1);
        turnChain.makeMove(gameId, 3);

        g = turnChain.getGame(gameId);
        assertEq(g.currentTurn, alice);
        assertEq(g.moveCount, 2);
        assertEq(turnChain.getColHeights(gameId)[3], 2);
        assertEq(turnChain.getBoard(gameId)[3][1], 2);
    }

    function test_RevertIf_OutOfTurnMove() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Bob tries to move when it's Alice's turn
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(TurnChain.NotYourTurn.selector, gameId, bob, alice)
        );
        turnChain.makeMove(gameId, 0);
    }

    function test_RevertIf_MoveBeforeJoin() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                TurnChain.GameNotActive.selector,
                gameId,
                TurnChain.GameStatus.Waiting
            )
        );
        turnChain.makeMove(gameId, 0);
    }

    function test_RevertIf_InvalidColumn() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        vm.prank(bob);
        turnChain.joinGame(gameId);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(TurnChain.InvalidColumn.selector, gameId, 7));
        turnChain.makeMove(gameId, 7);

        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(TurnChain.InvalidColumn.selector, gameId, 10));
        turnChain.makeMove(gameId, 10);
    }

    function test_RevertIf_MoveIntoFullColumn() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Fill column 0 with 6 discs
        for (uint8 i = 0; i < 3; i++) {
            vm.prank(alice);
            turnChain.makeMove(gameId, 0);
            vm.prank(bob);
            turnChain.makeMove(gameId, 0);
        }

        // Alice tries to drop 7th disc into col 0
        vm.prank(alice);
        vm.expectRevert(abi.encodeWithSelector(TurnChain.ColumnFull.selector, gameId, 0));
        turnChain.makeMove(gameId, 0);
    }

    // ---------------------------------------------------------
    // 3. Win Conditions
    // ---------------------------------------------------------

    function test_HorizontalWin() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Alice: col 0, 1, 2, 3 (row 0)
        // Bob: col 0, 1, 2 (row 1)
        vm.prank(alice);
        turnChain.makeMove(gameId, 0); // A: (0,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 0); // B: (0,1)

        vm.prank(alice);
        turnChain.makeMove(gameId, 1); // A: (1,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 1); // B: (1,1)

        vm.prank(alice);
        turnChain.makeMove(gameId, 2); // A: (2,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 2); // B: (2,1)

        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GameWon(gameId, alice);
        turnChain.makeMove(gameId, 3); // A: (3,0) -> 4 in a row!

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Won));
        assertEq(g.winner, alice);

        // Moves after game ends should revert
        vm.prank(bob);
        vm.expectRevert(
            abi.encodeWithSelector(
                TurnChain.GameNotActive.selector,
                gameId,
                TurnChain.GameStatus.Won
            )
        );
        turnChain.makeMove(gameId, 4);
    }

    function test_VerticalWin() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Alice plays column 2 (rows 0, 1, 2, 3)
        // Bob plays column 3 (rows 0, 1, 2)
        vm.prank(alice);
        turnChain.makeMove(gameId, 2); // A: (2,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 3); // B: (3,0)

        vm.prank(alice);
        turnChain.makeMove(gameId, 2); // A: (2,1)
        vm.prank(bob);
        turnChain.makeMove(gameId, 3); // B: (3,1)

        vm.prank(alice);
        turnChain.makeMove(gameId, 2); // A: (2,2)
        vm.prank(bob);
        turnChain.makeMove(gameId, 3); // B: (3,2)

        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GameWon(gameId, alice);
        turnChain.makeMove(gameId, 2); // A: (2,3) -> 4 in a column!

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Won));
        assertEq(g.winner, alice);
    }

    function test_DiagonalPositiveSlopeWin() public {
        // Winning line: (0,0), (1,1), (2,2), (3,3)
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Set up columns:
        // Col 0: A(0,0)
        // Col 1: B(1,0), A(1,1)
        // Col 2: B(2,0), B(2,1), A(2,2)
        // Col 3: B(3,0), B(3,1), B(3,2), A(3,3)

        // Turn 1: Alice (0,0)
        vm.prank(alice);
        turnChain.makeMove(gameId, 0);

        // Turn 2: Bob (1,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 1);

        // Turn 3: Alice (1,1)
        vm.prank(alice);
        turnChain.makeMove(gameId, 1);

        // Turn 4: Bob (2,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 2);

        // Turn 5: Alice (3,0) - helper move
        vm.prank(alice);
        turnChain.makeMove(gameId, 3);

        // Turn 6: Bob (2,1)
        vm.prank(bob);
        turnChain.makeMove(gameId, 2);

        // Turn 7: Alice (2,2)
        vm.prank(alice);
        turnChain.makeMove(gameId, 2);

        // Turn 8: Bob (3,1)
        vm.prank(bob);
        turnChain.makeMove(gameId, 3);

        // Turn 9: Alice (4,0) - arbitrary
        vm.prank(alice);
        turnChain.makeMove(gameId, 4);

        // Turn 10: Bob (3,2)
        vm.prank(bob);
        turnChain.makeMove(gameId, 3);

        // Turn 11: Alice (3,3) -> Diagonal win!
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GameWon(gameId, alice);
        turnChain.makeMove(gameId, 3);

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Won));
        assertEq(g.winner, alice);
    }

    function test_DiagonalNegativeSlopeWin() public {
        // Winning line: (3,0), (2,1), (1,2), (0,3)
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Col 3: A(3,0)
        // Col 2: B(2,0), A(2,1)
        // Col 1: B(1,0), B(1,1), A(1,2)
        // Col 0: B(0,0), B(0,1), B(0,2), A(0,3)

        // Turn 1: A -> (3,0)
        vm.prank(alice);
        turnChain.makeMove(gameId, 3);

        // Turn 2: B -> (2,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 2);

        // Turn 3: A -> (2,1)
        vm.prank(alice);
        turnChain.makeMove(gameId, 2);

        // Turn 4: B -> (1,0)
        vm.prank(bob);
        turnChain.makeMove(gameId, 1);

        // Turn 5: A -> (0,0) - base for col 0
        vm.prank(alice);
        turnChain.makeMove(gameId, 0);

        // Turn 6: B -> (1,1)
        vm.prank(bob);
        turnChain.makeMove(gameId, 1);

        // Turn 7: A -> (1,2)
        vm.prank(alice);
        turnChain.makeMove(gameId, 1);

        // Turn 8: B -> (0,1)
        vm.prank(bob);
        turnChain.makeMove(gameId, 0);

        // Turn 9: A -> (4,0) - arbitrary filler
        vm.prank(alice);
        turnChain.makeMove(gameId, 4);

        // Turn 10: B -> (0,2)
        vm.prank(bob);
        turnChain.makeMove(gameId, 0);

        // Turn 11: A -> (0,3) -> Diagonal negative win!
        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit GameWon(gameId, alice);
        turnChain.makeMove(gameId, 0);

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Won));
        assertEq(g.winner, alice);
    }

    // ---------------------------------------------------------
    // 4. Draw Detection (Full 42-cell board)
    // ---------------------------------------------------------


    function test_DrawDetectionExplicit() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Carefully constructed non-winning full board sequence:
        // Col 0: A B A B A B
        // Col 1: A B A B A B
        // Col 2: B A B A B A
        // Col 3: B A B A B A
        // Col 4: A B A B A B
        // Col 5: A B A B A B
        // Col 6: B A B A B A
        // Let's feed column sequence:
        uint8[42] memory moves = [
            0, 2, // A: 0 (row 0), B: 2 (row 0)
            1, 3, // A: 1 (row 0), B: 3 (row 0)
            4, 6, // A: 4 (row 0), B: 6 (row 0)
            5, 0, // A: 5 (row 0), B: 0 (row 1)
            2, 1, // A: 2 (row 1), B: 1 (row 1)
            3, 4, // A: 3 (row 1), B: 4 (row 1)
            6, 5, // A: 6 (row 1), B: 5 (row 1)
            0, 2, // A: 0 (row 2), B: 2 (row 2)
            1, 3, // A: 1 (row 2), B: 3 (row 2)
            4, 6, // A: 4 (row 2), B: 6 (row 2)
            5, 0, // A: 5 (row 2), B: 0 (row 3)
            2, 1, // A: 2 (row 3), B: 1 (row 3)
            3, 4, // A: 3 (row 3), B: 4 (row 3)
            6, 5, // A: 6 (row 3), B: 5 (row 3)
            0, 2, // A: 0 (row 4), B: 2 (row 4)
            1, 3, // A: 1 (row 4), B: 3 (row 4)
            4, 6, // A: 4 (row 4), B: 6 (row 4)
            5, 0, // A: 5 (row 4), B: 0 (row 5)
            2, 1, // A: 2 (row 5), B: 1 (row 5)
            3, 4, // A: 3 (row 5), B: 4 (row 5)
            6, 5  // A: 6 (row 5), B: 5 (row 5) -> Move 42!
        ];

        for (uint256 i = 0; i < 41; i++) {
            address current = (i % 2 == 0) ? alice : bob;
            vm.prank(current);
            turnChain.makeMove(gameId, moves[i]);
            assertEq(uint8(turnChain.getGame(gameId).status), uint8(TurnChain.GameStatus.Active));
        }

        // Final 42nd move by Bob
        vm.prank(bob);
        vm.expectEmit(true, false, false, false);
        emit GameDrawn(gameId);
        turnChain.makeMove(gameId, moves[41]);

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Drawn));
        assertEq(g.winner, address(0));
        assertEq(g.moveCount, 42);
    }

    // ---------------------------------------------------------
    // 5. Inactivity Timeout Forfeiture
    // ---------------------------------------------------------

    function test_Timeout_SuccessByOpponent() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Turn is Alice's. Alice makes a move.
        vm.prank(alice);
        turnChain.makeMove(gameId, 3);

        // Now turn is Bob's. Bob goes inactive.
        // Fast forward time by 1 day (86400 seconds)
        vm.warp(block.timestamp + 1 days);

        // Alice claims timeout
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit GameForfeited(gameId, alice, bob);
        turnChain.claimTimeout(gameId);

        TurnChain.Game memory g = turnChain.getGame(gameId);
        assertEq(uint8(g.status), uint8(TurnChain.GameStatus.Forfeited));
        assertEq(g.winner, alice);
    }

    function test_RevertIf_TimeoutClaimedBeforeDeadline() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // Turn is Alice's. Fast forward only 23 hours.
        vm.warp(block.timestamp + 23 hours);

        // Bob tries to claim timeout too early
        vm.prank(bob);
        vm.expectRevert();
        turnChain.claimTimeout(gameId);
    }

    function test_RevertIf_TimeoutClaimedByCurrentTurnPlayer() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        // It is Alice's turn. Time passes 2 days.
        vm.warp(block.timestamp + 2 days);

        // Alice cannot claim timeout against Bob on her own turn!
        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                TurnChain.CannotClaimTimeoutOnOwnTurn.selector,
                gameId,
                alice
            )
        );
        turnChain.claimTimeout(gameId);
    }

    function test_RevertIf_NonPlayerClaimsTimeout() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(gameId);

        vm.warp(block.timestamp + 2 days);

        // Charlie is not in the game
        vm.prank(charlie);
        vm.expectRevert(
            abi.encodeWithSelector(TurnChain.NotAPlayer.selector, gameId, charlie)
        );
        turnChain.claimTimeout(gameId);
    }

    function test_RevertIf_TimeoutClaimedOnInactiveGame() public {
        vm.prank(alice);
        uint256 gameId = turnChain.createGame();

        // Game is Waiting (not Active)
        vm.warp(block.timestamp + 2 days);

        vm.prank(alice);
        vm.expectRevert(
            abi.encodeWithSelector(
                TurnChain.GameNotActive.selector,
                gameId,
                TurnChain.GameStatus.Waiting
            )
        );
        turnChain.claimTimeout(gameId);
    }

    // ---------------------------------------------------------
    // 6. Multiple Concurrent Games State Independence
    // ---------------------------------------------------------

    function test_MultipleConcurrentGames() public {
        // Game 1: Alice vs Bob
        vm.prank(alice);
        uint256 g1 = turnChain.createGame();
        vm.prank(bob);
        turnChain.joinGame(g1);

        // Game 2: Bob vs Charlie
        vm.prank(bob);
        uint256 g2 = turnChain.createGame();
        vm.prank(charlie);
        turnChain.joinGame(g2);

        // Game 1 move
        vm.prank(alice);
        turnChain.makeMove(g1, 0);

        // Game 2 move
        vm.prank(bob);
        turnChain.makeMove(g2, 5);

        // Verify independent state
        assertEq(turnChain.getColHeights(g1)[0], 1);
        assertEq(turnChain.getColHeights(g1)[5], 0);
        assertEq(turnChain.getColHeights(g2)[0], 0);
        assertEq(turnChain.getColHeights(g2)[5], 1);

        assertEq(turnChain.getGame(g1).currentTurn, bob);
        assertEq(turnChain.getGame(g2).currentTurn, charlie);
    }

    // ---------------------------------------------------------
    // 7. Pagination and Summaries View
    // ---------------------------------------------------------

    function test_GetRecentGames() public {
        for (uint256 i = 0; i < 5; i++) {
            vm.prank(alice);
            turnChain.createGame();
        }

        (TurnChain.GameSummary[] memory summaries, uint256 total) = turnChain.getRecentGames(0, 3);
        assertEq(total, 5);
        assertEq(summaries.length, 3);
        assertEq(summaries[0].gameId, 5); // Newest first
        assertEq(summaries[1].gameId, 4);
        assertEq(summaries[2].gameId, 3);

        (TurnChain.GameSummary[] memory page2, ) = turnChain.getRecentGames(3, 3);
        assertEq(page2.length, 2);
        assertEq(page2[0].gameId, 2);
        assertEq(page2[1].gameId, 1);
    }
}
