// Contract Address on Base Sepolia (or local fallback)
export const TURNCHAIN_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS ||
  "0xBbA7fA5D15Ba7C05954235B0E6B913cdE9dfB6db") as `0x${string}`;

export const TURNCHAIN_ABI = [
  {
    type: "function",
    name: "createGame",
    inputs: [],
    outputs: [{ name: "gameId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "joinGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "makeMove",
    inputs: [
      { name: "gameId", type: "uint256" },
      { name: "column", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "claimTimeout",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getGame",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "gameId", type: "uint256" },
          { name: "player1", type: "address" },
          { name: "player2", type: "address" },
          { name: "currentTurn", type: "address" },
          { name: "winner", type: "address" },
          { name: "status", type: "uint8" },
          { name: "moveCount", type: "uint8" },
          { name: "lastMoveTimestamp", type: "uint256" },
          { name: "board", type: "uint8[6][7]" },
          { name: "colHeights", type: "uint8[7]" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBoard",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8[6][7]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getColHeights",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [{ name: "", type: "uint8[7]" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRecentGames",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit", type: "uint256" },
    ],
    outputs: [
      {
        name: "summaries",
        type: "tuple[]",
        components: [
          { name: "gameId", type: "uint256" },
          { name: "player1", type: "address" },
          { name: "player2", type: "address" },
          { name: "currentTurn", type: "address" },
          { name: "winner", type: "address" },
          { name: "status", type: "uint8" },
          { name: "moveCount", type: "uint8" },
          { name: "lastMoveTimestamp", type: "uint256" },
        ],
      },
      { name: "total", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "gameCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "TIMEOUT_DURATION",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "GameCreated",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player1", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "PlayerJoined",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player2", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "MoveMade",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "player", type: "address", indexed: true },
      { name: "column", type: "uint8", indexed: false },
      { name: "row", type: "uint8", indexed: false },
    ],
  },
  {
    type: "event",
    name: "GameWon",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
    ],
  },
  {
    type: "event",
    name: "GameDrawn",
    inputs: [{ name: "gameId", type: "uint256", indexed: true }],
  },
  {
    type: "event",
    name: "GameForfeited",
    inputs: [
      { name: "gameId", type: "uint256", indexed: true },
      { name: "winner", type: "address", indexed: true },
      { name: "forfeitedPlayer", type: "address", indexed: true },
    ],
  },
] as const;
