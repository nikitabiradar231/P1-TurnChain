# TurnChain — Final Project Handover Document
**Autonomous, Fully On-Chain Connect Four on Base Sepolia**

---

## 1. Project Identification & Repository
- **Project Name**: TurnChain
- **Description**: An asynchronous, 100% on-chain Connect Four game deployed on Base Sepolia. The Solidity smart contract serves as the sole authority for board state validation, gravity drop mechanics, 4-in-a-row pattern recognition across all 4 vector axes, full-board draw detection, and 24-hour inactivity timeout forfeits.
- **Presenter / Author**: Nikita Biradar (B.Sc. Blockchain Technology, Savitribai Phule Pune University)
- **GitHub Repository**: [https://github.com/nikitabiradar231/P1-TurnChain](https://github.com/nikitabiradar231/P1-TurnChain)

---

## 2. Blockchain & Deployment Details
- **Target Network**: Base Sepolia
- **Chain ID**: `84532`
- **JSON-RPC Endpoint**: `https://sepolia.base.org`
- **Smart Contract Address**: [`0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`](https://sepolia.basescan.org/address/0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db)
- **Deployment Transaction**: [`0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da`](https://sepolia.basescan.org/tx/0xdd822a522e26307bb87c0eb0d4e2f903e4c3da0f635cc2a65eaf32a1440f89da)
- **Deployed Block**: `47,936,341`
- **Runtime Bytecode**: `12,390 bytes` (Verified on BaseScan)

---

## 3. Verification & Build Results
- **Automated Foundry Test Suite (`test/TurnChain.t.sol`)**:
  - **22 / 22 Tests Passing (100%)**
  - Horizontal, vertical, diagonal positive (`/`), and diagonal negative (`\`) win evaluations.
  - 42-move full-board draw detection.
  - Turn switching, out-of-turn execution reverts (`NotYourTurn`), and column overflow reverts (`ColumnFull`).
  - Self-join protection (`CannotPlayAgainstSelf`) and 24h timeout claims/reverts.
- **Frontend Production Build**:
  - `npm run build` (`tsc -b && vite build`) compiles with **0 errors, 0 type issues** (`dist/index.html`, `dist/assets/`).
- **Security Check**:
  - `.env` is uncommitted and excluded in `.gitignore`. Zero private keys or secrets exist in repository history.

---

## 4. Presentation Package & Documentation Locations
- **PowerPoint Presentation Deck (16:9 Widescreen)**:  
  [`docs/presentation/TurnChain_Presentation.pptx`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/TurnChain_Presentation.pptx)
- **Speaker Notes Script (4–5 Minutes)**:  
  [`docs/presentation/Speaker_Notes.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/Speaker_Notes.md)
- **Presentation Outline & Master Guide**:  
  [`docs/presentation/PRESENTATION.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/PRESENTATION.md)
- **Submission Checklist**:  
  [`docs/presentation/SUBMISSION_CHECKLIST.md`](file:///C:/Users/nikita/OneDrive/Desktop/D1/docs/presentation/SUBMISSION_CHECKLIST.md)

---

## 5. Live Demonstration Sequence
1. **Header & Network**: Open `http://localhost:5174/` and demonstrate wallet connection on Base Sepolia (`84532`), network switch detection, and faucet modal.
2. **Lobby & Match Creation**: Show Open Games / My Matches tabs and create a game to generate an on-chain match ID.
3. **Deep-Link Match Share**: Navigate to `http://localhost:5174/?gameId=1` to demonstrate the shareable link and the "Join Match as Player 2" action banner.
4. **Board Mechanics & Animations**: Demonstrate the 7x6 board, column hover highlights (0–6), drop transitions, turn status alerts, and timeout countdown timer.
5. **On-Chain Settlement**: Explain the autonomous 4-direction pattern recognition and the 24-hour timeout forfeit mechanism (`claimTimeout`).

---

## 6. Disclosed Limitations & Honest Presentation Notes
- **Live Browser Two-Wallet Match**: Smart contract correctness is proven by the 22 passing Foundry tests; completing a live two-player match between two separate MetaMask accounts in the browser is pending manual wallet execution on Base Sepolia with testnet ETH.
- **Block Latency**: Turns are bounded by Base L2 block confirmation latency (~2 seconds).

---

## 7. Presenter Checklist Before Presentation
- [ ] Connect laptop to projector (16:9 aspect ratio).
- [ ] Open `TurnChain_Presentation.pptx` in PowerPoint / Presenter View.
- [ ] (Optional) Start `npm run dev` in `frontend/` to have the live interactive UI ready at `http://localhost:5174/`.
