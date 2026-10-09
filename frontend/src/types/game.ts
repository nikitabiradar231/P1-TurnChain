export const GameStatus = {
  None: 0,
  Waiting: 1,
  Active: 2,
  Won: 3,
  Drawn: 4,
  Forfeited: 5,
} as const;

export type GameStatus = (typeof GameStatus)[keyof typeof GameStatus];

export interface Game {
  gameId: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  currentTurn: `0x${string}`;
  winner: `0x${string}`;
  status: GameStatus;
  moveCount: number;
  lastMoveTimestamp: bigint;
  board: number[][]; // 7 columns x 6 rows
  colHeights: number[];
}

export interface GameSummary {
  gameId: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  currentTurn: `0x${string}`;
  winner: `0x${string}`;
  status: GameStatus;
  moveCount: number;
  lastMoveTimestamp: bigint;
}
