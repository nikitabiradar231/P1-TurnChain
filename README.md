# TurnChain 🔴🔵 — Autonomous On-Chain Connect Four on Base Sepolia

[![Base Sepolia](https://img.shields.io/badge/Network-Base%20Sepolia%20(84532)-0052FF?style=flat-square)](https://sepolia.basescan.org/address/0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?style=flat-square&logo=solidity)](https://soliditylang.org/)
[![Foundry Tests](https://img.shields.io/badge/Foundry%20Tests-22%2F22%20Passed-brightgreen?style=flat-square)](file:///test/TurnChain.t.sol)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**TurnChain** is an asynchronous, two-player **Connect Four** game deployed on **Base Sepolia (Chain ID: 84532)**. Smart contracts serve as the **sole and final authority** for move validation, turn alternation, 4-in-a-row victory detection across all four axes, full-board draw detection, and inactivity timeout forfeitures.

> [!NOTE]
> **Network Target**: This project is deployed and verified strictly on the **Base Sepolia testnet**. Free testnet ETH is required to submit transactions, which can be acquired from standard faucets in the in-app faucet directory.

---

## 🎯 Problem Statement & Motivation

Traditional online board games depend on centralized game servers and databases to coordinate match state, enforce rules, and determine winners. This architecture creates several critical vulnerabilities:
1. **Centralized Trust & Tampering**: Server operators or database admins can manipulate game outcomes or censor moves.
2. **Session Fragility**: If a centralized WebSocket server crashes, in-progress games are lost.
3. **Opponent Griefing & Stalling**: In turn-based games without strict economic or time-based enforcement, losing players can simply abandon the match, leaving the other player stranded without a resolution.

**TurnChain solves this by running 100% on Base Sepolia:**
- **Zero Central Server**: Every match is an isolated state machine directly in the Solidity smart contract.
- **Asynchronous Flexibility**: Players can submit a move, close their browser, and return hours later without losing state.
- **Strict 24-Hour Inactivity Guard**: If an opponent stalls for longer than 24 hours (`1 days`), the active non-current player can invoke `claimTimeout()` to immediately claim victory and forfeit the stalling player on-chain.

---

## ✨ Features

- **100% On-Chain Rule Engine**:
  - Full 7-column $\times$ 6-row gravity matrix validation.
  - Pattern matching algorithm for horizontal, vertical, diagonal-positive (`/`), and diagonal-negative (`\`) 4-in-a-row wins.
  - 42-move full-board draw condition detection.
  - Out-of-turn execution rejection (`NotYourTurn`) and column-overflow guards (`ColumnFull`).
- **Shareable Match Invites (`/?gameId=X`)**:
  - Direct URL deep linking allows creators to copy an invite link and share it directly with friends.
  - Opening a match URL automatically loads verified match state from Base Sepolia and presents an interactive **"Join Match as Player 2"** action banner.
- **Live Event Watching & Opponent Updates**:
  - Uses Wagmi `useWatchContractEvent` to listen to contract events (`MoveMade`, `PlayerJoined`, `GameWon`, `GameDrawn`, `GameForfeited`).
  - Active-game polling interval (`3.5s`) guarantees the board updates seamlessly when the opponent submits a transaction.
- **Cyberpunk / Arcade Visual Design**:
  - Glassmorphic neon-styled interface with distinct Player 1 (Red/Pink `#ff2a5f`) and Player 2 (Cyan `#00f0ff`) colorways.
  - Pulsing turn status alerts, column number indexing (0–6), drop animations, and winner confetti celebration.
- **Zero Cryptocurrency Cost**:
  - Runs on Base Sepolia testnet with integrated in-app faucet links.

---

## 🏗 System Architecture

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
│   • Game State Machine (Waiting, Active, Won, Drawn,        │
│     Forfeited)                                              │
│   • 7x6 Gravity Grid Matrix                                 │
│   • Autonomous 4-in-a-Row Pattern Recognition Engine        │
│   • 24-Hour Timeout Inactivity Guard                        │
│   • Indexed Real-Time Event Logs                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Smart Contract** | Solidity `0.8.24`, Foundry (`forge`, `cast`), OpenZeppelin standards |
| **Target Blockchain** | Base Sepolia Testnet (`chainId: 84532`, RPC: `https://sepolia.base.org`) |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Web3 Integration** | Wagmi v2, Viem, TanStack Query |
| **Styling & UI** | Vanilla CSS, Lucide React Icons, Canvas Confetti |

---

## 📂 Repository Structure

```text
.
├── contracts/
│   └── TurnChain.sol              # Core 100% on-chain Connect Four contract
├── test/
│   └── TurnChain.t.sol            # 22 comprehensive Foundry unit tests
├── script/
│   └── DeployTurnChain.s.sol      # Foundry Base Sepolia deployment script
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx         # Wallet connection & Base Sepolia network switch
│   │   │   ├── GameBoard.tsx      # 7x6 grid, turn indicator, drop actions, timeout claim
│   │   │   ├── GameList.tsx       # Public lobby, filter tabs, quick-join lookup
│   │   │   ├── RulesModal.tsx     # In-app game rules modal
│   │   │   └── FaucetModal.tsx    # Testnet faucet directory
│   │   ├── config/
│   │   │   ├── contract.ts        # Deployed address & full ABI definition
│   │   │   └── wagmi.ts           # Wagmi client & Base Sepolia transport
│   │   ├── types/
│   │   │   └── game.ts            # TypeScript interfaces & GameStatus enum
│   │   ├── App.tsx                # Main state, deep-link router, contract event watcher
│   │   └── index.css              # Cyberpunk neon design system & animations
│   ├── package.json
│   └── vite.config.ts
├── foundry.toml                   # Foundry profile & optimizer configuration
├── .env.example                   # Environment configuration template
└── README.md
```

---

## 🚀 Deployed Contract Information

| Parameter | Value |
| :--- | :--- |
| **Network** | **Base Sepolia** |
| **Chain ID** | `84532` |
| **RPC Endpoint** | `https://sepolia.base.org` |
| **Contract Address** | [`0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`](https://sepolia.basescan.org/address/0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db) |
| **Deployment Transaction** | [`0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da`](https://sepolia.basescan.org/tx/0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da) |
| **Deployed Block** | `47,936,341` |
| **Runtime Bytecode** | `12,390 bytes` (Verified on-chain) |

---

## ⚡ Prerequisites & Local Setup

### 1. Prerequisites
- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Foundry**: `forge` and `cast` CLI tools ([Install Foundry](https://book.getfoundry.sh/getting-started/installation))
- **Browser Wallet**: MetaMask, Coinbase Wallet, or any injected EVM wallet funded with Base Sepolia ETH.

### 2. Environment Configuration
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Populate `.env` with your deployment private key (only needed if deploying a fresh contract):
```env
PRIVATE_KEY=0x<your_64_character_hex_private_key>
BASE_SEPOLIA_RPC=https://sepolia.base.org
VITE_CONTRACT_ADDRESS=0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db
```

---

## 💻 Running the Project Locally

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Launch Development Server
```bash
npm run dev
```
Open your browser to [`http://localhost:5174/`](http://localhost:5174/) (or the port indicated by Vite).

### 3. Run Foundry Smart Contract Tests
From the project root:
```bash
forge test -vvv
```

### 4. Build Frontend for Production
```bash
cd frontend
npm run build
```

---

## 🎮 How to Play TurnChain

1. **Connect Wallet**: Click **"Connect Wallet"** in the top right. Ensure your wallet is switched to **Base Sepolia (84532)**.
2. **Host a Game (Player 1)**: Click **"Create New Game"**. Confirm the transaction in your wallet.
3. **Share Match Link**: Once created, click **"Share Link"** to copy the URL (e.g., `http://localhost:5174/?gameId=1`).
4. **Join a Game (Player 2)**: An opponent opens the share link or clicks **"Join Game"** from the public lobby.
5. **Drop Discs Turn-by-Turn**:
   - Player 1 plays first (Red/Pink discs).
   - Player 2 plays second (Cyan discs).
   - Click any column (0–6) to drop a disc. Discs fall to the lowest unoccupied slot.
6. **Win Conditions**: Connect 4 discs horizontally, vertically, or diagonally.
7. **Timeout Protection**: If an opponent fails to make a move within 24 hours, click **"Claim Timeout Forfeit Victory"** to claim the win.

---

## 🧪 Test Results & Verification

### Automated Smart Contract Unit Tests (Foundry)
The contract test suite ([test/TurnChain.t.sol](file:///test/TurnChain.t.sol)) contains **22 comprehensive tests** covering all positive rules and adversarial edge cases:

```text
Ran 22 tests for test/TurnChain.t.sol:TurnChainTest
[PASS] test_CreateGame() (gas: 241080)
[PASS] test_DiagonalNegativeSlopeWin() (gas: 1211765)
[PASS] test_DiagonalPositiveSlopeWin() (gas: 1233676)
[PASS] test_DrawDetectionExplicit() (gas: 6602937)
[PASS] test_GetRecentGames() (gas: 812587)
[PASS] test_HorizontalWin() (gas: 916818)
[PASS] test_JoinGame() (gas: 295605)
[PASS] test_MakeMove_TurnSwitching() (gas: 688191)
[PASS] test_MultipleConcurrentGames() (gas: 830181)
[PASS] test_RevertIf_InvalidColumn() (gas: 282676)
[PASS] test_RevertIf_JoinNonExistentGame() (gas: 34938)
[PASS] test_RevertIf_MoveBeforeJoin() (gas: 192415)
[PASS] test_RevertIf_MoveIntoFullColumn() (gas: 720333)
[PASS] test_RevertIf_NonPlayerClaimsTimeout() (gas: 258936)
[PASS] test_RevertIf_OutOfTurnMove() (gas: 254964)
[PASS] test_RevertIf_Player1JoinsOwnGame() (gas: 194274)
[PASS] test_RevertIf_ThirdPlayerJoins() (gas: 254667)
[PASS] test_RevertIf_TimeoutClaimedBeforeDeadline() (gas: 260594)
[PASS] test_RevertIf_TimeoutClaimedByCurrentTurnPlayer() (gas: 257021)
[PASS] test_RevertIf_TimeoutClaimedOnInactiveGame() (gas: 192611)
[PASS] test_Timeout_SuccessByOpponent() (gas: 444704)
[PASS] test_VerticalWin() (gas: 880742)
Suite result: ok. 22 passed; 0 failed; 0 skipped
```

### Live On-Chain Revert Verification (Base Sepolia)
- **Self-Join Rejection**: `joinGame(1)` called by Player 1 successfully reverted with custom error `CannotPlayAgainstSelf(1, 0xda9F...d719)` (`0xf5884cc2`).
- **Premature Move Rejection**: `makeMove(1, 3)` called before Player 2 joined successfully reverted with custom error `GameNotActive(1, 1)` (`0xbf61476b`).

---

## 👥 Two-Player Manual Testing Checklist

| Step | Action | Description | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Host Game** | Account A connects and clicks "Create New Game". | Tested On-Chain (Tx `0x7ae1...cb34`) |
| **2** | **Copy Invite** | Account A clicks "Share Link" (`/?gameId=1`). | Verified in UI |
| **3** | **Join Game** | Account B opens link and clicks "Join Match as Player 2". | ⏳ Pending Manual 2nd Account Execution |
| **4** | **Turn 1 (P1)** | Account A drops a disc in column 3. | ⏳ Pending Manual 2nd Account Execution |
| **5** | **Turn 2 (P2)** | Account B sees board update and drops disc in column 3. | ⏳ Pending Manual 2nd Account Execution |
| **6** | **Win Detection** | Complete 4-in-a-row to trigger win status and confetti. | ⏳ Pending Manual 2nd Account Execution |

---

## 🛡️ Security & Privacy Notice

- **No Private Keys in Repository**: `.env` is strictly ignored by `.gitignore` and untracked.
- **Trustless Outcome Engine**: No owner keys, admin privileges, or upgrade proxies exist in `TurnChain.sol`. Game resolutions are strictly mathematical and immutable.

---

## 👩‍💻 Author

- **Name**: Nikita Biradar
- **Degree**: B.Sc. Blockchain Technology
- **Institution**: Savitribai Phule Pune University
- **GitHub**: [https://github.com/nikitabiradar231](https://github.com/nikitabiradar231)
- **Repository**: [https://github.com/nikitabiradar231/P1-TurnChain](https://github.com/nikitabiradar231/P1-TurnChain)

---

## 📄 License
This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).
