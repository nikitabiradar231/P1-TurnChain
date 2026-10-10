# TurnChain Presentation — 4–5 Minute Speaker Script & Notes
**Autonomous, Fully On-Chain Connect Four on Base Sepolia**

Presenter: **Nikita Biradar**  
Program: **B.Sc. Blockchain Technology, Savitribai Phule Pune University**  
Network: **Base Sepolia (Chain ID: 84532)**  
Contract: `0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`  
GitHub Repository: [https://github.com/nikitabiradar231/P1-TurnChain](https://github.com/nikitabiradar231/P1-TurnChain)

---

## ⏱️ Timing & Delivery Strategy
- **Total Duration**: 4 minutes 30 seconds
- **Pacing**: Steady, clear, confident
- **Focus**: Technical design, on-chain state machine, rule verification, anti-griefing timeout, and live testnet deployment

---

### Slide 1: Title & Introduction (30 seconds)
> *"Good morning, respected judges and evaluators. My name is Nikita Biradar, and today I am excited to present **TurnChain**, an autonomous, fully on-chain Connect Four game deployed on Base Sepolia.*
> 
> *In traditional gaming, matches depend on centralized servers. TurnChain eliminates that dependency completely. Every game state, gravity disc drop, four-in-a-row victory check, full-board draw detection, and timeout rule is executed directly by immutable Solidity smart contract logic on the Base Layer 2 network."*

---

### Slide 2: Problem Statement (35 seconds)
> *"Why do we need fully on-chain board games?*
> 
> *Traditional online multiplayer games rely on centralized game servers and WebSockets. If the server crashes, all in-progress matches are lost. Even worse, turn-based games suffer from player griefing: when a player realizes they are losing, they often abandon the match, leaving the winner stalled without resolution.*
> 
> *Furthermore, many so-called 'Web3 games' only put tokenized rewards or NFTs on-chain, while the actual game logic remains centralized on private AWS or Node servers. TurnChain solves this by placing 100% of game state and rules directly on the blockchain."*

---

### Slide 3: Proposed Solution (35 seconds)
> *"TurnChain delivers a truly decentralized board gaming experience with three core solutions:*
> 
> *1. **Pure On-Chain State Machine**: Each match is an isolated state machine directly in the smart contract with zero external server dependencies.*
> *2. **Asynchronous Gameplay**: Players do not need to keep WebSockets open. You can drop a disc, close your browser, and return later when your opponent moves.*
> *3. **24-Hour Timeout Guard**: If an opponent abandons the game or stalls for more than 24 hours on their turn, the active player can call `claimTimeout()` to force an on-chain forfeit victory immediately.*
> *4. **Deep-Link Match Sharing**: Creators can easily copy an invite link such as `/?gameId=1` and share it directly with a friend."*

---

### Slide 4: System Architecture (40 seconds)
> *"Let's look at the system architecture.*
> 
> *On the frontend, we have a responsive React 18 and TypeScript client styled with modern cyberpunk neon aesthetics. We use Wagmi v2 and Viem to interface directly with Base Sepolia via JSON-RPC.*
> 
> *Notice that there is no intermediate web server or backend API. The React client reads state directly from the TurnChain smart contract at `0xBbA7...B6db` and listens for contract events like `MoveMade` and `PlayerJoined` using real-time RPC polling to keep the board synchronized."*

---

### Slide 5: Smart Contract Mechanics (45 seconds)
> *"Now let's examine the Solidity smart contract mechanics inside `TurnChain.sol`.*
> 
> *The board is modeled as a 7-column by 6-row matrix of `uint8` values stored on-chain. When a player invokes `makeMove(gameId, column)`:*
> - *The contract enforces turn alternation, confirming `msg.sender` is the active player.*
> - *It locates the lowest unoccupied row in the selected column to apply realistic gravity physics.*
> - *It runs an optimized pattern recognition algorithm that checks for four connected discs across all four vector axes: horizontal, vertical, positive diagonal, and negative diagonal.*
> - *If 42 moves are made without a winner, the contract declares a Draw.*
> - *Invalid actions revert gas-efficiently with custom errors such as `NotYourTurn`, `ColumnFull`, and `CannotPlayAgainstSelf`."*

---

### Slide 6: Frontend & Web3 Integration (35 seconds)
> *"On the client side, our goal was to deliver an intuitive Web3 user experience.*
> 
> *The frontend automatically detects whether the user is connected to Base Sepolia (Chain ID 84532) and offers a one-click network switch prompt if they are on the wrong chain. An integrated faucet modal provides direct access to testnet faucets.*
> 
> *When viewing an open game, Player 2 sees a distinct 'Join Match as Player 2' action banner. The board includes interactive column hover highlights, turn pulse indicators, disc drop animations, and a victory confetti celebration."*

---

### Slide 7: Testing & Deployment Evidence (40 seconds)
> *"Smart contract security and correctness are essential because blockchain code is immutable once deployed.*
> 
> *We developed a comprehensive Foundry test suite in `TurnChain.t.sol` containing **22 unit tests**, covering:*
> - *All four victory angles (horizontal, vertical, and both diagonals)*
> - *42-move full-board draw detection*
> - *Turn alternation, invalid column rejections, and self-join guards*
> - *Inactivity timeout enforcement and premature claim prevention*
> 
> *All **22 tests pass with 100% success rate**. The contract is deployed and verified on Base Sepolia at address `0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db`, and the frontend production build compiles cleanly with zero TypeScript errors."*

---

### Slide 8: Conclusion, Limitations & Future Scope (30 seconds)
> *"In summary, TurnChain demonstrates how classic turn-based gaming can achieve complete decentralization, immutability, and transparency on a modern Ethereum Layer 2.*
> 
> *Regarding current limitations: while automated unit tests prove 100% smart contract correctness, manual live two-player browser matches require real MetaMask wallet interaction on Base Sepolia. Move latency is bounded by the ~2-second block confirmation time of Base.*
> 
> *For future development, we plan to implement ERC-20 token wagering pools, zero-knowledge state proofs, and EIP-712 gasless meta-transactions via Account Abstraction.*
> 
> *Thank you very much for your time. I would be happy to answer any questions."*
