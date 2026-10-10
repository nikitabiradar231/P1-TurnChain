import React, { useState, useEffect } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useConnect,
  useDisconnect,
  useChainId,
  useSwitchChain,
} from "wagmi";
import { baseSepolia } from "wagmi/chains";
import {
  Share2,
  Clock,
  Trophy,
  AlertTriangle,
  Check,
  RotateCcw,
  Zap,
  Swords,
  ExternalLink,
  Loader2,
  Copy,
  X,
  Wallet,
  AlertCircle,
  LogOut,
} from "lucide-react";
import confetti from "canvas-confetti";
import { TURNCHAIN_ADDRESS, TURNCHAIN_ABI } from "../config/contract";
import { GameStatus } from "../types/game";
import type { Game } from "../types/game";
import { formatContractError } from "../utils/formatError";

interface GameBoardProps {
  game: Game;
  onRefresh: () => void;
  onBackToLobby: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  game,
  onRefresh,
  onBackToLobby,
}) => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const { connect, connectors, isPending: isConnectingWallet } = useConnect();
  const { disconnect } = useDisconnect();
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  const isWrongChain = isConnected && chainId !== baseSepolia.id;

  // Move contract write
  const {
    writeContract: writeMove,
    data: moveHash,
    isPending: isMovePending,
    error: moveError,
    reset: resetMoveError,
  } = useWriteContract();

  // Join contract write (for direct invite links)
  const {
    writeContract: writeJoinGame,
    data: joinHash,
    isPending: isJoinPending,
    error: joinError,
    reset: resetJoinError,
  } = useWriteContract();

  // Timeout contract write
  const {
    writeContract: writeTimeout,
    data: timeoutHash,
    isPending: isTimeoutPending,
    error: timeoutError,
    reset: resetTimeoutError,
  } = useWriteContract();

  const { isLoading: isMoveConfirming, isSuccess: isMoveSuccess } =
    useWaitForTransactionReceipt({ hash: moveHash });

  const { isLoading: isJoinConfirming, isSuccess: isJoinSuccess } =
    useWaitForTransactionReceipt({ hash: joinHash });

  const { isLoading: isTimeoutConfirming, isSuccess: isTimeoutSuccess } =
    useWaitForTransactionReceipt({ hash: timeoutHash });

  // Trigger auto refresh on tx confirmation
  useEffect(() => {
    if (isMoveSuccess || isJoinSuccess || isTimeoutSuccess) {
      onRefresh();
      resetMoveError();
      resetJoinError();
      resetTimeoutError();
    }
  }, [
    isMoveSuccess,
    isJoinSuccess,
    isTimeoutSuccess,
    onRefresh,
    resetMoveError,
    resetJoinError,
    resetTimeoutError,
  ]);

  // Celebrate on win
  useEffect(() => {
    if (game.status === GameStatus.Won || game.status === GameStatus.Forfeited) {
      if (address && game.winner.toLowerCase() === address.toLowerCase()) {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#00f0ff", "#ff2a5f", "#ffd700", "#7000ff"],
        });
      }
    }
  }, [game.status, game.winner, address]);

  // Timeout countdown calculations (24 hours inactivity limit)
  const TIMEOUT_SECONDS = 86400;
  useEffect(() => {
    const updateCountdown = () => {
      const now = Math.floor(Date.now() / 1000);
      const deadline = Number(game.lastMoveTimestamp) + TIMEOUT_SECONDS;
      const diff = deadline - now;
      setTimeRemaining(diff > 0 ? diff : 0);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [game.lastMoveTimestamp]);

  const formatCountdown = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const isPlayer1 =
    address && game.player1.toLowerCase() === address.toLowerCase();
  const isPlayer2 =
    address &&
    game.player2 !== "0x0000000000000000000000000000000000000000" &&
    game.player2.toLowerCase() === address.toLowerCase();
  const isParticipant = isPlayer1 || isPlayer2;
  const isMyTurn =
    address &&
    game.status === GameStatus.Active &&
    game.currentTurn.toLowerCase() === address.toLowerCase();
  const isTimeoutClaimable =
    game.status === GameStatus.Active &&
    isParticipant &&
    !isMyTurn &&
    timeRemaining === 0;

  const canJoinAsPlayer2 =
    game.status === GameStatus.Waiting &&
    isConnected &&
    !isPlayer1;

  const handleColumnClick = (colIndex: number) => {
    if (!isMyTurn || isMovePending || isMoveConfirming) return;
    if (game.colHeights[colIndex] >= 6) return;

    resetMoveError();
    resetJoinError();
    resetTimeoutError();
    writeMove({
      address: TURNCHAIN_ADDRESS,
      abi: TURNCHAIN_ABI,
      functionName: "makeMove",
      args: [game.gameId, colIndex],
    });
  };

  const handleJoinGame = () => {
    if (!canJoinAsPlayer2 || isJoinPending || isJoinConfirming) return;
    resetMoveError();
    resetJoinError();
    resetTimeoutError();
    writeJoinGame({
      address: TURNCHAIN_ADDRESS,
      abi: TURNCHAIN_ABI,
      functionName: "joinGame",
      args: [game.gameId],
    });
  };

  const handleClaimTimeout = () => {
    if (!isTimeoutClaimable || isTimeoutPending || isTimeoutConfirming) return;
    resetMoveError();
    resetJoinError();
    resetTimeoutError();
    writeTimeout({
      address: TURNCHAIN_ADDRESS,
      abi: TURNCHAIN_ABI,
      functionName: "claimTimeout",
      args: [game.gameId],
    });
  };

  const shareUrl = `${window.location.origin}${window.location.pathname}?gameId=${game.gameId.toString()}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Game Navigation & Share Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl glass-panel">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Lobby</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-white font-mono">
                GAME #{game.gameId.toString()}
              </h2>
              {game.status === GameStatus.Waiting && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  Waiting for Opponent
                </span>
              )}
              {game.status === GameStatus.Active && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Live Match ({game.moveCount} moves)
                </span>
              )}
              {game.status === GameStatus.Won && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  Victory
                </span>
              )}
              {game.status === GameStatus.Drawn && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Draw (42 moves)
                </span>
              )}
              {game.status === GameStatus.Forfeited && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                  Timeout Forfeited
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Moves on chain: {game.moveCount} / 42
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5"
            title="Copy Direct Shareable Invite Link"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Share2 className="w-4 h-4 text-[#00f0ff]" />
            )}
            <span>{copied ? "Link Copied!" : "Share Link"}</span>
          </button>
          <button
            onClick={onRefresh}
            className="btn-secondary py-2 px-3 text-xs"
            title="Refresh Board State from Chain"
          >
            <RotateCcw className="w-4 h-4 text-[var(--text-muted)] hover:text-white" />
          </button>
        </div>
      </div>

      {/* Direct Invite / Join Callout Banner for Waiting Games */}
      {game.status === GameStatus.Waiting && (
        <div className="p-5 rounded-2xl glass-panel border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-sm font-bold text-white flex items-center justify-center md:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <span>Game #{game.gameId.toString()} is Waiting for Player 2</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {!isConnected
                ? "This match is open on Base Sepolia! Connect your wallet as Player 2 to join."
                : isWrongChain
                ? "Your wallet is on a different network. Switch to Base Sepolia (Chain ID: 84532) to join."
                : isPlayer1
                ? "You hosted this game as Player 1! To test joining, switch MetaMask to Account 2 or copy the invite link."
                : "This match is open! Click Join Game to enter as Player 2 (Cyan)."}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-center">
            {!isConnected ? (
              <button
                onClick={() => {
                  const connector = connectors[0];
                  if (connector) connect({ connector });
                }}
                disabled={isConnectingWallet}
                className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                <span>
                  {isConnectingWallet
                    ? "Connecting Wallet..."
                    : "Connect Wallet to Join"}
                </span>
              </button>
            ) : isWrongChain ? (
              <button
                onClick={() => switchChain({ chainId: baseSepolia.id })}
                className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Switch to Base Sepolia</span>
              </button>
            ) : canJoinAsPlayer2 ? (
              <button
                onClick={handleJoinGame}
                disabled={isJoinPending || isJoinConfirming}
                className="btn-primary py-2.5 px-6 text-xs flex items-center gap-2"
              >
                <Swords className="w-4 h-4" />
                <span>
                  {isJoinPending
                    ? "Confirm in Wallet..."
                    : isJoinConfirming
                    ? "Joining on Base Sepolia..."
                    : "Join Match as Player 2"}
                </span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="btn-secondary py-2.5 px-4 text-xs flex items-center gap-2"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#00f0ff]" />
                  )}
                  <span>
                    {copied ? "Copied to Clipboard!" : "Copy Invite Link"}
                  </span>
                </button>
                <button
                  onClick={() => disconnect()}
                  className="btn-secondary py-2.5 px-3 text-xs flex items-center gap-1.5 text-amber-300 border-amber-500/30 hover:border-amber-500/50"
                  title="Disconnect current host account to connect Account 2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Switch Account</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Players Status & Turn Indicator Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Player 1 Card */}
        <div
          className={`p-4 rounded-2xl glass-panel transition-all ${
            game.status === GameStatus.Active &&
            game.currentTurn.toLowerCase() === game.player1.toLowerCase()
              ? "border-[#ff2a5f] shadow-[0_0_20px_rgba(255,42,95,0.25)]"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full disc-p1 flex-shrink-0" />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-medium">
                  Player 1 (First Move)
                </div>
                <div className="font-mono text-sm text-white font-bold flex items-center gap-1.5">
                  {truncate(game.player1)}
                  {isPlayer1 && (
                    <span className="text-[10px] bg-[#ff2a5f]/20 text-[#ff2a5f] px-1.5 py-0.2 rounded border border-[#ff2a5f]/30">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
            {game.status === GameStatus.Active &&
              game.currentTurn.toLowerCase() === game.player1.toLowerCase() && (
                <div className="text-xs font-bold text-[#ff2a5f] bg-[#ff2a5f]/10 px-2.5 py-1 rounded-full border border-[#ff2a5f]/30 animate-pulse">
                  Their Turn
                </div>
              )}
            {(game.status === GameStatus.Won ||
              game.status === GameStatus.Forfeited) &&
              game.winner.toLowerCase() === game.player1.toLowerCase() && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Winner</span>
                </div>
              )}
          </div>
        </div>

        {/* Player 2 Card */}
        <div
          className={`p-4 rounded-2xl glass-panel transition-all ${
            game.status === GameStatus.Active &&
            game.player2 !== "0x0000000000000000000000000000000000000000" &&
            game.currentTurn.toLowerCase() === game.player2.toLowerCase()
              ? "border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.25)]"
              : ""
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full disc-p2 flex-shrink-0" />
              <div>
                <div className="text-xs text-[var(--text-muted)] font-medium">
                  Player 2 (Challenger)
                </div>
                <div className="font-mono text-sm text-white font-bold flex items-center gap-1.5">
                  {game.player2 ===
                  "0x0000000000000000000000000000000000000000"
                    ? "Waiting to join..."
                    : truncate(game.player2)}
                  {isPlayer2 && (
                    <span className="text-[10px] bg-[#00f0ff]/20 text-[#00f0ff] px-1.5 py-0.2 rounded border border-[#00f0ff]/30">
                      You
                    </span>
                  )}
                </div>
              </div>
            </div>
            {game.status === GameStatus.Active &&
              game.currentTurn.toLowerCase() === game.player2.toLowerCase() && (
                <div className="text-xs font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2.5 py-1 rounded-full border border-[#00f0ff]/30 animate-pulse">
                  Their Turn
                </div>
              )}
            {(game.status === GameStatus.Won ||
              game.status === GameStatus.Forfeited) &&
              game.winner.toLowerCase() === game.player2.toLowerCase() && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>Winner</span>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Main Interactive Connect Four Board */}
      <div className="flex flex-col items-center justify-center p-4 sm:p-8 rounded-3xl glass-panel relative overflow-hidden">
        {/* Turn Status Alert Banner */}
        {game.status === GameStatus.Active && (
          <div
            className={`w-full max-w-md mb-6 py-2.5 px-4 rounded-xl text-center text-sm font-semibold flex items-center justify-center gap-2 border ${
              isMyTurn
                ? "bg-[#00f0ff]/15 text-[#00f0ff] border-[#00f0ff]/40 pulse-active shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                : "bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)]"
            }`}
          >
            {isMyTurn ? (
              <>
                <Zap className="w-4 h-4 text-[#00f0ff]" />
                <span>YOUR TURN — Select any column (0–6) to drop a disc</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Waiting for opponent's on-chain move...</span>
              </>
            )}
          </div>
        )}

        {/* Board Frame */}
        <div className="connect-board-frame">
          {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => {
            const height = game.colHeights[colIdx] || 0;
            const isFull = height >= 6;
            const canDrop = isMyTurn && !isFull && !isMovePending && !isMoveConfirming;

            return (
              <div
                key={colIdx}
                onMouseEnter={() => setHoveredCol(colIdx)}
                onMouseLeave={() => setHoveredCol(null)}
                onClick={() => handleColumnClick(colIdx)}
                className={`board-column ${!canDrop ? "disabled" : ""} ${isFull ? "column-full opacity-60" : ""}`}
                title={isFull ? `Column ${colIdx} is Full` : canDrop ? `Drop disc in column ${colIdx}` : ""}
              >
                {[0, 1, 2, 3, 4, 5].map((rowIdx) => {
                  const cellVal = game.board[colIdx]?.[rowIdx] || 0;
                  const isGhost =
                    hoveredCol === colIdx &&
                    canDrop &&
                    rowIdx === height &&
                    cellVal === 0;

                  return (
                    <div key={rowIdx} className="board-cell">
                      {cellVal === 1 && (
                        <div className="disc-piece disc-p1" />
                      )}
                      {cellVal === 2 && (
                        <div className="disc-piece disc-p2" />
                      )}
                      {isGhost && (
                        <div
                          className={`disc-piece disc-ghost ${
                            isPlayer1 ? "disc-p1" : "disc-p2"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Column Number Labels (0-6) */}
        <div className="flex items-center justify-between w-full max-w-[350px] sm:max-w-[490px] mt-2 px-3 text-xs font-mono text-[var(--text-dim)]">
          {[0, 1, 2, 3, 4, 5, 6].map((colIdx) => (
            <span key={colIdx} className="w-8 text-center">
              {colIdx}
            </span>
          ))}
        </div>

        {/* Transaction in progress feedback */}
        {(isMovePending || isMoveConfirming) && (
          <div className="mt-4 p-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-xs font-mono text-[#00f0ff] flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting move to Base Sepolia...</span>
            {moveHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${moveHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline flex items-center gap-1 text-[#00f0ff] hover:text-white ml-2"
              >
                <span>View on BaseScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {(isJoinPending || isJoinConfirming) && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Joining match on Base Sepolia...</span>
            {joinHash && (
              <a
                href={`https://sepolia.basescan.org/tx/${joinHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline flex items-center gap-1 text-amber-300 hover:text-white ml-2"
              >
                <span>View on BaseScan</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {(moveError || joinError || timeoutError) && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-2 max-w-md w-full">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{formatContractError(moveError || joinError || timeoutError)}</span>
            </div>
            <button
              onClick={() => {
                resetMoveError();
                resetJoinError();
                resetTimeoutError();
              }}
              className="p-1 hover:text-white text-rose-400 transition-colors"
              title="Dismiss error"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Inactivity Timeout & Game Summary Panel */}
      <div className="p-4 sm:p-6 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Inactivity Deadline</h4>
            {game.status === GameStatus.Active ? (
              <p className="text-xs font-mono text-[var(--text-muted)]">
                {timeRemaining > 0 ? (
                  <>
                    Time until forfeit:{" "}
                    <span className="text-amber-300 font-bold">
                      {formatCountdown(timeRemaining)}
                    </span>
                  </>
                ) : (
                  <span className="text-rose-400 font-bold">
                    Inactivity deadline expired!
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-muted)]">
                24-Hour timeout strictly enforced on-chain.
              </p>
            )}
          </div>
        </div>

        {/* Timeout Claim Button */}
        {game.status === GameStatus.Active && (
          <button
            onClick={handleClaimTimeout}
            disabled={!isTimeoutClaimable || isTimeoutPending || isTimeoutConfirming}
            className={`btn-danger text-xs py-2.5 px-4 ${
              !isTimeoutClaimable ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isTimeoutPending || isTimeoutConfirming
              ? "Claiming..."
              : isTimeoutClaimable
              ? "Claim Timeout Forfeit Victory"
              : `Timeout Claim (${formatCountdown(timeRemaining)})`}
          </button>
        )}
      </div>
    </div>
  );
};
