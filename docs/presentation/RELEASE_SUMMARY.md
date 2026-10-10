# TurnChain — Official Release & Presentation Summary
**Autonomous, Fully On-Chain Connect Four on Base Sepolia**

---

## 📌 1. Project Overview
**TurnChain** is an asynchronous, two-player Connect Four game engineered directly onto **Base Sepolia (Chain ID: 84532)**. The Solidity smart contract serves as the sole, immutable authority for:
- 7-column $\times$ 6-row gravity drop slot computation.
- Vector pattern recognition for 4-in-a-row connections across all 4 axes (horizontal, vertical, positive diagonal `/`, negative diagonal `\`).
- 42-move full-board draw detection.
- Turn switching and out-of-turn execution rejections.
- A **24-hour inactivity timeout guard** (`claimTimeout`) to eliminate player stalling/griefing on-chain.

---

## 🏗️ 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Smart Contract** | Solidity `0.8.24`, Foundry (`forge`, `cast`), OpenZeppelin standards |
| **Target Blockchain** | Base Sepolia Testnet (`chainId: 84532`, RPC: `https://sepolia.base.org`) |
| **Frontend Framework** | React 18, TypeScript, Vite |
| **Web3 Integration** | Wagmi v2, Viem, TanStack Query |
| **Styling & UI** | Pure Vanilla CSS (Cyberpunk neon theme), Lucide Icons, Canvas Confetti |

---

## 🚀 3. Blockchain & Deployment References

- **GitHub Repository**: [`https://github.com/nikitabiradar231/P1-TurnChain`](https://github.com/nikitabiradar231/P1-TurnChain)
- **Target Network**: **Base Sepolia (Chain ID: 84532)**
- **Verified Contract Address**: [`0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`](https://sepolia.basescan.org/address/0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db)
- **Deployment Transaction**: [`0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da`](https://sepolia.basescan.org/tx/0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da)
- **Deployed Block**: `47,936,341` (Runtime Bytecode: `12,390 bytes`)

---

## 🧪 4. Automated Verification Results

- **Foundry Test Suite (`test/TurnChain.t.sol`)**:
  - **22 / 22 Tests Passed (100% pass rate)**
  - Full vector win checks, 42-move draw evaluation, out-of-turn reverts, column overflow protection, self-join rejections, and 24h timeout claims/reverts verified.
- **Frontend Production Build**:
  - `npm run build` (`tsc -b && vite build`) succeeds cleanly in ~2.2s with **0 errors, 0 type issues**.
- **Security Check**:
  - `.env` is uncommitted and excluded by `.gitignore`. Zero private keys, seed phrases, or sensitive secrets exist in repository history.

---

## 📂 5. Presentation Package & Documentation Links

- **PowerPoint Presentation Deck (16:9 Widescreen)**:  
  [`docs/presentation/TurnChain_Presentation.pptx`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/TurnChain_Presentation.pptx)
- **Speaker Notes Script (4–5 Minutes)**:  
  [`docs/presentation/Speaker_Notes.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/Speaker_Notes.md)
- **Presentation Outline & Master Guide**:  
  [`docs/presentation/PRESENTATION.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/PRESENTATION.md)
- **Final Project Handover**:  
  [`docs/presentation/FINAL_HANDOVER.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/FINAL_HANDOVER.md)
- **Submission Checklist**:  
  [`docs/presentation/SUBMISSION_CHECKLIST.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/SUBMISSION_CHECKLIST.md)

---

## ⚠️ 6. Disclosed Limitations & Future Roadmap

### Known Limitations:
1. **Live Browser Two-Wallet Match**: All game mechanics, win logic, and timeouts are verified by 22 automated unit tests; completing a live two-player browser match between two separate MetaMask accounts is pending manual execution with testnet ETH.
2. **Move Latency**: Turn execution speed is bounded by Base L2 block confirmation latency (~2 seconds).

### Future Roadmap:
1. **ERC-20 Wagering Pools**: Enable staking and automatic winner payouts in USDC.
2. **Zero-Knowledge State Proofs**: ZK-SNARK move validation for compressed on-chain gas costs.
3. **Account Abstraction (ERC-4337)**: Gasless session keys with EIP-712 for instant gameplay without MetaMask popups.

---

## 🎬 7. Demonstration Checklist for Evaluators
1. **Start Frontend Server**: Run `npm run dev` in `frontend/` $\rightarrow$ Open [`http://localhost:5174/`](http://localhost:5174/).
2. **Wallet Connection**: Connect MetaMask on Base Sepolia (`84532`). Show network badge and faucet directory.
3. **Game Creation & Share Link**: Click "Create New Game" or navigate to [`http://localhost:5174/?gameId=1`](http://localhost:5174/?gameId=1) to display the shareable invite link and Player 2 action banner.
4. **Board Mechanics**: Showcase the 7x6 cyberpunk grid, column drop animations, turn indicator, and the 24-hour inactivity timer.
5. **Presentation Slides**: Open `TurnChain_Presentation.pptx` in PowerPoint presenter view alongside `Speaker_Notes.md`.
