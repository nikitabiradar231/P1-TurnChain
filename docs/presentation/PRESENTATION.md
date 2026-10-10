# TurnChain — Final Project Presentation Package
**Autonomous, Fully On-Chain Connect Four on Base Sepolia**

---

## 📋 Presentation Overview
- **Project Name**: TurnChain
- **Author**: Nikita Biradar (B.Sc. Blockchain Technology, Savitribai Phule Pune University)
- **GitHub Repository**: [https://github.com/nikitabiradar231/P1-TurnChain](https://github.com/nikitabiradar231/P1-TurnChain)
- **Target Network**: Base Sepolia (Chain ID: `84532`)
- **Deployed Contract**: [`0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`](https://sepolia.basescan.org/address/0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db)
- **Deployment Transaction**: [`0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da`](https://sepolia.basescan.org/tx/0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da)

---

## 🖥️ Slide-by-Slide Content & Speaker Notes

### Slide 1: Project Title & Introduction
- **Slide Title**: TurnChain — Autonomous On-Chain Connect Four
- **Subtitle**: Decentralized, Asynchronous Board Gaming on Base Sepolia
- **Key Points**:
  - Classic 7x6 Connect Four fully governed by EVM smart contract logic.
  - Zero centralized backend, zero centralized database, zero proprietary game servers.
  - Deployed, verified, and test-covered on Base Sepolia (Chain ID: 84532).
  - **Presenter**: Nikita Biradar | B.Sc. Blockchain Technology

> **🎙️ Speaker Notes (30 seconds)**:
> *"Good morning respected evaluators. Today I am presenting TurnChain, an autonomous, turn-based Connect Four game deployed on Base Sepolia. TurnChain proves that interactive, competitive board games can run 100% on-chain without any central backend server or proprietary coordinator. Every game state, gravity drop, win check, and draw evaluation is executed strictly by EVM bytecode."*

---

### Slide 2: Problem Statement & Motivation
- **Slide Title**: Challenges with Traditional & Hybrid Web3 Gaming
- **Key Points**:
  - **Centralized Vulnerabilities**: Traditional multiplayer games rely on centralized game servers that can be shut down, modified, or manipulated.
  - **Session Fragility**: Network disconnects and server crashes destroy in-progress matches.
  - **The Stalling / Griefing Problem**: In turn-based games without strict economic or time enforcement, losing players frequently abandon games to prevent opponents from winning.
  - **Pseudo-Web3 "Fake Decentralization"**: Many blockchain games only use smart contracts for NFTs/tokens while game logic runs on private AWS servers.

> **🎙️ Speaker Notes (35 seconds)**:
> *"Most online board games depend entirely on centralized WebSockets and database servers. If the server goes down, your match is lost. Even worse, in turn-based games, losing players often abandon the match to stall their opponent indefinitely. Furthermore, many so-called 'Web3' games only put token rewards on-chain while running all actual logic off-chain. TurnChain addresses this by putting 100% of game state and rules directly on the blockchain."*

---

### Slide 3: Proposed Solution — TurnChain
- **Slide Title**: Autonomous On-Chain Architecture
- **Key Points**:
  - **Pure On-Chain State Machine**: Game status transitions (`Waiting` -> `Active` -> `Won` / `Drawn` / `Forfeited`) exist immutably in the contract.
  - **Deterministic Rule Enforcement**: Column-bounds checking, gravity drops, turn switching, and 4-in-a-row pattern recognition computed on-chain.
  - **24-Hour Timeout Protection**: If an opponent fails to move within 24 hours, the active player can call `claimTimeout()` to force an on-chain forfeit victory.
  - **Shareable Match Invites**: Unique URL deep links (`/?gameId=1`) enable instant peer-to-peer matchmaking.

> **🎙️ Speaker Notes (35 seconds)**:
> *"TurnChain solves these issues with three key pillars: First, every match is an independent on-chain state machine. Second, players can play asynchronously—you make a move, close your browser, and come back whenever your opponent responds. Third, to eliminate stalling, we implemented a 24-hour timeout rule: if your opponent goes inactive for more than 24 hours on their turn, you can call `claimTimeout()` to immediately forfeit them and claim the win."*

---

### Slide 4: System Architecture
- **Slide Title**: End-to-End System Architecture
- **Key Diagram**:
```
┌─────────────────────────────────────────────────────────────┐
│                 React 18 + TypeScript Client                │
│    (Wagmi v2 + Viem + TanStack Query + Cyberpunk CSS UI)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Direct JSON-RPC (Chain ID: 84532)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│              Base Sepolia Blockchain Network                │
│ ─────────────────────────────────────────────────────────── │
│                 TurnChain Smart Contract                    │
│        (0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db)        │
│                                                             │
│   • Game State Engine (Waiting, Active, Won, Drawn,         │
│     Forfeited)                                              │
│   • 7x6 Gravity Grid Matrix Storage                         │
│   • Autonomous 4-in-a-Row Pattern Recognition Engine        │
│   • 24-Hour Timeout Inactivity Guard                        │
│   • Indexed Real-Time Event Logs                            │
└─────────────────────────────────────────────────────────────┘
```

> **🎙️ Speaker Notes (40 seconds)**:
> *"Here is the complete architectural layout. On the frontend, we have a modern React 18 and TypeScript client utilizing Wagmi v2 and Viem. The frontend connects directly to the Base Sepolia network via standard JSON-RPC. There is no intermediate Node.js or Express API backend. The smart contract at `0xBbA7...B6db` acts as the single source of truth, storing the board state in a 7-column by 6-row matrix, checking victory conditions, and emitting indexed events for live client updates."*

---

### Slide 5: Smart Contract Functionality & Game Mechanics
- **Slide Title**: Solidity Core Mechanics (`TurnChain.sol`)
- **Key Points**:
  - **Grid Representation**: `uint8[6][7] board` — 7 columns, 6 rows (0: Empty, 1: Player 1 Red, 2: Player 2 Cyan).
  - **Turn Alternation**: Contract strictly validates `msg.sender == currentTurnAddress` and toggles turn upon successful move.
  - **4-Direction Win Detection**:
    - Horizontal: `(c, r)` to `(c+3, r)`
    - Vertical: `(c, r)` to `(c, r+3)`
    - Diagonal Positive (`/`): `(c, r)` to `(c+3, r+3)`
    - Diagonal Negative (`\`): `(c, r)` to `(c+3, r-3)`
  - **Draw Detection**: Triggered when `moveCount == 42` without a winner.
  - **Gas Optimization**: Clean loop bounds and zero redundant storage writes.

> **🎙️ Speaker Notes (45 seconds)**:
> *"Let us examine the smart contract design. The board is represented as a 7x6 array of uint8 values. When a player calls `makeMove`, the contract first checks if the game is active and if it is that player's turn. It finds the lowest empty row in the selected column to simulate gravity. Then, it evaluates 4-in-a-row connections along four distinct vector directions: horizontal, vertical, positive diagonal, and negative diagonal. If 42 moves occur without a 4-in-a-row, it declares a draw. All custom errors like `ColumnFull` and `NotYourTurn` provide clear, gas-efficient revert reasons."*

---

### Slide 6: Frontend & Web3 Integration
- **Slide Title**: Reactive UI & Real-Time Web3 Integration
- **Key Points**:
  - **Wagmi v2 + Viem**: Direct blockchain interaction with hooks (`useReadContract`, `useWriteContract`, `useWatchContractEvent`).
  - **Deep-Link Match Sharing**: URLs with `/?gameId=1` load the specific match and display an invite banner for Player 2.
  - **Real-Time Synchronisation**: WebSockets/RPC polling every 3.5 seconds ensures that when Player 1 drops a disc, Player 2's UI updates immediately.
  - **Cyberpunk / Arcade Aesthetic**: Pure Vanilla CSS design system with neon player glow, drop animations, interactive hover indicators, and confetti celebration.

> **🎙️ Speaker Notes (35 seconds)**:
> *"The frontend is designed for an engaging arcade user experience. Using Wagmi hooks and Viem, it interacts with Base Sepolia in real time. We built deep-linking so hosts can simply copy a URL like `http://localhost:5174/?gameId=1` and share it with an opponent. The interface uses real-time contract event listeners and smart polling so the board updates automatically when the other player submits their transaction."*

---

### Slide 7: Testing & Deployment Verification
- **Slide Title**: Rigorous Testing & Live Deployment Evidence
- **Key Points**:
  - **22/22 Passing Foundry Tests (`TurnChain.t.sol`)**:
    - Horizontal, vertical, positive diagonal, and negative diagonal wins.
    - 42-move full-board draw detection.
    - Self-join prevention, out-of-turn execution reverts, column-full overflow reverts.
    - Inactivity timeout success and premature claim reverts.
  - **Deployed on Base Sepolia**:
    - **Contract Address**: `0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`
    - **Bytecode**: `12,390 bytes` (Verified)
    - **Deployment Tx**: `0xdd822a52...` (Block `47,936,341`)
  - **Production Frontend**: Built cleanly via Vite with 0 TypeScript errors.

> **🎙️ Speaker Notes (40 seconds)**:
> *"Reliability in smart contracts is critical because code is immutable once deployed. We wrote 22 automated Foundry unit tests covering every valid move path and adversarial edge case—including invalid columns, playing out of turn, self-joining, and timeout edge cases. All 22 tests pass with 100% success rate. The contract is live on Base Sepolia and verified on BaseScan."*

---

### Slide 8: Conclusion, Limitations & Future Scope
- **Slide Title**: Project Summary & Roadmap
- **Key Points**:
  - **Project Achievements**:
    - Proved 100% decentralized, serverless turn-based board gaming on Base L2.
    - Implemented robust anti-griefing timeout mechanisms and deep-link matchmaking.
  - **Known Limitations**:
    - Game logic is fully verified by automated tests; manual two-player browser matches require real MetaMask execution on Base Sepolia with testnet ETH.
    - Turn speed is bounded by block confirmation times (~2 seconds on Base).
  - **Future Roadmap**:
    - Smart contract wagering / prize pools with ERC-20 tokens.
    - Zero-Knowledge move proofs / state compression.
    - EIP-712 gasless meta-transactions via Account Abstraction (ERC-4337).

> **🎙️ Speaker Notes (35 seconds)**:
> *"In conclusion, TurnChain demonstrates how classic turn-based games can achieve complete decentralization, immutability, and tamper-resistance on Layer 2 blockchains. In the future, we plan to introduce ERC-20 prize pools, EIP-712 gasless meta-transactions for smoother onboarding, and account abstraction. Thank you for your time, and I welcome any questions."*

---

## 📸 Recommended Visual Presentation Assets
Save the following application screenshots to `docs/screenshots/`:
1. `01_game_lobby.png` — Main Game Lobby with Open Matches, My Matches tab, and Quick Jump ID bar.
2. `02_waiting_invite.png` — Match #1 in Waiting state showing host address and the Share Invite Link button.
3. `03_active_match.png` — 7x6 board during active play with Player 1 (Red) and Player 2 (Cyan) discs and column hover indicators.
4. `04_winner_celebration.png` — Completed game showing victory banner and celebratory confetti.
