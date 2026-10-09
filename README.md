# TurnChain 🔴🔵 — Fully On-Chain Connect Four on Base Sepolia

**TurnChain** is an asynchronous, two-player **Connect Four** game deployed on **Base Sepolia (Chain ID: 84532)**. Smart contracts are the **sole and final authority** for move validity, turn ordering, win verification, draw detection, and inactivity timeout forfeitures.

---

## 🌟 Overview & Highlights

- **100% On-Chain Rule Enforcement**: All Connect Four board validation, gravity drop mechanics, horizontal / vertical / diagonal-up / diagonal-down win checks, and 42-move full-board draw detection are executed autonomously within the Solidity smart contract.
- **Asynchronous Turn-Based Gameplay**: Players can submit their move, close their browser, and return whenever they want. The contract stores complete state independently across multiple concurrent games.
- **Strict Inactivity Timeout Forfeiture**: If an opponent goes inactive for more than **24 hours (`1 days`)**, the non-current player can invoke `claimTimeout()` on-chain to immediately claim victory and forfeit the stalling player.
- **Zero Centralized Backend**: No off-chain coordinator, no database, no central API, and no trust requirements. The frontend reads and interacts directly with the Base Sepolia blockchain via Wagmi & Viem.
- **No Cryptocurrency Purchase Required**: Operates on Base Sepolia testnet with free faucets provided in the in-app faucet directory.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              React + TypeScript Frontend                │
│    (Wagmi v2 + Viem + TanStack Query + Cyberpunk UI)    │
└──────────────────────────┬──────────────────────────────┘
                           │ Direct RPC (Chain ID: 84532)
                           ▼
┌─────────────────────────────────────────────────────────┐
│                 TurnChain Smart Contract                │
│ ─────────────────────────────────────────────────────── │
│  • Game State Machine (Waiting, Active, Won, Drawn,     │
│    Forfeited)                                           │
│  • 7x6 Board Gravity Matrix                             │
│  • 4-in-a-Row Autonomous Pattern Matching Algorithm     │
│  • 24-Hour Timeout Inactivity Guard                     │
│  • Indexed Move & Outcome Events                        │
└─────────────────────────────────────────────────────────┘
```

---

## 📜 Smart Contract Specifications (`contracts/TurnChain.sol`)

### Game Status Lifecycle
1. `Waiting` (1): Game created by Player 1, awaiting Player 2 to join.
2. `Active` (2): Both players present; turn-by-turn moves are active.
3. `Won` (3): 4 connected discs detected in any direction; winner recorded.
4. `Drawn` (4): Board completely filled (42 moves) with no winner.
5. `Forfeited` (5): Winner awarded through `claimTimeout()` after 24h of opponent inactivity.

### Key Smart Contract Functions
| Function | Access | Description |
|---|---|---|
| `createGame()` | Public | Instantiates a new game session with `msg.sender` as Player 1. Returns `gameId`. |
| `joinGame(uint256 gameId)` | Public | Allows Player 2 to join a waiting game. Initializes turn timer. |
| `makeMove(uint256 gameId, uint8 column)` | Current Player | Drops a disc into specified column (0–6). Checks gravity bounds, updates board, checks 4-in-a-row & draw conditions, switches turn. |
| `claimTimeout(uint256 gameId)` | Waiting Player | Claims forfeit victory if current turn player exceeds 24-hour deadline. Reverts if called before deadline or by current player. |
| `getGame(uint256 gameId)` | View | Returns complete state struct including board grid and column heights. |
| `getBoard(uint256 gameId)` | View | Returns 7x6 grid matrix (`uint8[6][7]`). |
| `getRecentGames(uint256 offset, uint256 limit)` | View | Returns paginated game summaries for the global game lobby. |

---

## 🧪 Automated Testing Suite (Foundry)

The Foundry test suite (`test/TurnChain.t.sol`) contains **22 comprehensive tests** covering all positive paths and adversarial edge cases:

- [x] Game creation and initialization of state
- [x] Player 2 joining and turn assignment
- [x] Rejection of Player 1 attempting to play against themselves
- [x] Rejection of third player joining
- [x] Rejection of moves on non-existent or inactive games
- [x] Rejection of out-of-turn moves (`NotYourTurn`)
- [x] Rejection of invalid column indices (`InvalidColumn`)
- [x] Rejection of moves into full columns (`ColumnFull`)
- [x] Turn alternation between Player 1 and Player 2
- [x] Horizontal 4-in-a-row victory detection
- [x] Vertical 4-in-a-row victory detection
- [x] Diagonal positive slope (`/`) 4-in-a-row victory detection
- [x] Diagonal negative slope (`\`) 4-in-a-row victory detection
- [x] Rejection of any moves after a game is won or ended
- [x] 42-move full-board draw detection
- [x] Time-warped timeout test: opponent forfeits after 24 hours inactivity
- [x] Rejection of timeout claims before the 24-hour deadline
- [x] Rejection of timeout claims made by the current-turn player against themselves
- [x] Rejection of timeout claims by third parties
- [x] State independence across multiple concurrent games
- [x] Emitted events with indexed `gameId` parameters

### Running Tests
```bash
# Run all Foundry unit tests
forge test

# Run with full trace verbosity
forge test -vvv
```

---

## 🚀 Base Sepolia Deployment

### Network Information
- **Network Name**: Base Sepolia
- **Chain ID**: `84532`
- **Currency Symbol**: `ETH`
- **RPC URL**: `https://sepolia.base.org`
- **Block Explorer**: [https://sepolia.basescan.org](https://sepolia.basescan.org)

### Deployment Instructions
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Populate `PRIVATE_KEY` with a testnet account funded with Base Sepolia ETH.
3. Deploy the contract using Foundry:
   ```bash
   forge script script/DeployTurnChain.s.sol:DeployTurnChain \
     --rpc-url https://sepolia.base.org \
     --broadcast \
     --verify
   ```

---

## 💻 Frontend Setup & Execution

### Prerequisites
- Node.js `v18+` or `v20+` / `v24+`
- npm `v9+` or `v11+`
- Browser with MetaMask, Coinbase Wallet, or any EVM-compatible injected wallet.

### Installation & Local Run
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

### Production Build
```bash
cd frontend
npm run build
```

---

## 🌐 Testnet Faucet Resources

TurnChain runs strictly on testnet and does **not** require real cryptocurrency. You can acquire free Base Sepolia ETH from:
1. **Superchain Faucet**: [https://console.optimism.io/faucet](https://console.optimism.io/faucet)
2. **Coinbase Developer Faucet**: [https://faucet.coinbase.com](https://faucet.coinbase.com)
3. **QuickNode Faucet**: [https://faucet.quicknode.com/base/sepolia](https://faucet.quicknode.com/base/sepolia)
4. **LearnWeb3 Faucet**: [https://learnweb3.io/faucets/base_sepolia/](https://learnweb3.io/faucets/base_sepolia/)

---

## 🛡 Security & Audit Checklist

- [x] **Checks-Effects-Interactions**: Storage state updated before event emissions and exits.
- [x] **No Central Admin**: Contract outcome is fully deterministic and mathematical.
- [x] **Timeout Protection**: Strict timestamp math prevents griefing and stalled games.
- [x] **No Secrets in Repo**: All private keys and local configs are `.gitignore`d.

---

## 📄 License
MIT License. Built for the **Turn by Turn: A Board Game That Waits for You** hackathon challenge.
