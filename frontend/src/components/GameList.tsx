import React, { useState } from "react";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import {
  PlusCircle,
  LogIn,
  Swords,
  Layers,
  ArrowRight,
  ShieldCheck,
  Search,
  Share2,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import { TURNCHAIN_ADDRESS, TURNCHAIN_ABI } from "../config/contract";
import { GameStatus } from "../types/game";
import type { GameSummary } from "../types/game";
import { formatContractError } from "../utils/formatError";

interface GameListProps {
  games: GameSummary[];
  totalGames: number;
  isLoading: boolean;
  onSelectGame: (gameId: bigint) => void;
  onRefresh: () => void;
}

export const GameList: React.FC<GameListProps> = ({
  games,
  totalGames,
  onSelectGame,
  onRefresh,
}) => {
  const { address, isConnected } = useAccount();
  const [joinInputId, setJoinInputId] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "open" | "my">("open");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create game contract write
  const {
    writeContract: writeCreateGame,
    data: createHash,
    isPending: isCreatePending,
    error: createError,
    reset: resetCreate,
  } = useWriteContract();

  // Join game contract write
  const {
    writeContract: writeJoinGame,
    data: joinHash,
    isPending: isJoinPending,
    error: joinError,
    reset: resetJoin,
  } = useWriteContract();

  const { isLoading: isCreateConfirming, isSuccess: isCreateSuccess } =
    useWaitForTransactionReceipt({ hash: createHash });

  const { isLoading: isJoinConfirming, isSuccess: isJoinSuccess } =
    useWaitForTransactionReceipt({ hash: joinHash });

  React.useEffect(() => {
    if (isCreateSuccess || isJoinSuccess) {
      onRefresh();
      resetCreate();
      resetJoin();
    }
  }, [isCreateSuccess, isJoinSuccess, onRefresh, resetCreate, resetJoin]);

  // Handle create game
  const handleCreateGame = () => {
    if (!isConnected || isCreatePending || isCreateConfirming) return;
    resetCreate();
    resetJoin();
    writeCreateGame({
      address: TURNCHAIN_ADDRESS,
      abi: TURNCHAIN_ABI,
      functionName: "createGame",
    });
  };

  // Handle direct join / view by ID or URL
  const handleDirectJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinInputId.trim()) return;

    let parsedId = joinInputId.trim();
    // If user pasted a full URL like http://.../?gameId=1
    if (parsedId.includes("gameId=")) {
      const match = parsedId.match(/gameId=(\d+)/);
      if (match && match[1]) {
        parsedId = match[1];
      }
    }

    if (/^\d+$/.test(parsedId)) {
      const id = BigInt(parsedId);
      onSelectGame(id);
    }
  };

  const handleJoinSpecific = (gameId: bigint) => {
    if (!isConnected || isJoinPending || isJoinConfirming) return;
    resetCreate();
    resetJoin();
    writeJoinGame({
      address: TURNCHAIN_ADDRESS,
      abi: TURNCHAIN_ABI,
      functionName: "joinGame",
      args: [gameId],
    });
  };

  const handleCopyCardLink = (e: React.MouseEvent, gameId: bigint) => {
    e.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?gameId=${gameId.toString()}`;
    navigator.clipboard.writeText(url);
    setCopiedId(gameId.toString());
    setTimeout(() => setCopiedId(null), 2500);
  };

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  // Filter games based on selected tab
  const filteredGames = games.filter((g) => {
    if (filterTab === "open") {
      return g.status === GameStatus.Waiting;
    }
    if (filterTab === "my") {
      if (!address) return false;
      const user = address.toLowerCase();
      return (
        g.player1.toLowerCase() === user ||
        (g.player2 && g.player2.toLowerCase() === user)
      );
    }
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Hero Welcome Banner */}
      <div className="p-8 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-b-[#00f0ff]/30">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Server / 100% Solidity Verified</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Asynchronous On-Chain Connect Four
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-xl">
            Challenge players worldwide. The smart contract validates every move,
            tracks turn order, evaluates 4-in-a-row wins, and guarantees timeout
            forfeits on Base Sepolia.
          </p>
        </div>

        {/* Action button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCreateGame}
            disabled={!isConnected || isCreatePending || isCreateConfirming}
            className="btn-primary w-full sm:w-auto py-3.5 px-6 text-sm"
          >
            <PlusCircle className="w-5 h-5" />
            <span>
              {isCreatePending
                ? "Confirm in Wallet..."
                : isCreateConfirming
                ? "Creating on Base Sepolia..."
                : "Create New Game"}
            </span>
          </button>
        </div>
      </div>

      {/* Quick Jump / Lookup Bar */}
      <div className="p-4 rounded-2xl glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <Search className="w-4 h-4 text-[#00f0ff]" />
          <span>Quick Open by ID or Link:</span>
        </div>
        <form
          onSubmit={handleDirectJoin}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <input
            type="text"
            placeholder="Enter ID or paste link (e.g. 1)"
            value={joinInputId}
            onChange={(e) => setJoinInputId(e.target.value)}
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3.5 py-2 text-xs font-mono text-white placeholder-[var(--text-dim)] focus:outline-none focus:border-[#00f0ff] w-full sm:w-64"
          />
          <button
            type="submit"
            className="btn-secondary py-2 px-4 text-xs font-semibold flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4 text-[#00f0ff]" />
            <span>Open Match</span>
          </button>
        </form>
      </div>

      {/* Transaction alerts */}
      {(createError || joinError) && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{formatContractError(createError || joinError)}</span>
          </div>
          <button
            onClick={() => {
              resetCreate();
              resetJoin();
            }}
            className="p-1 hover:text-white text-rose-400 transition-colors"
            title="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter Tabs & Game List Table */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)]">
            <button
              onClick={() => setFilterTab("open")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === "open"
                  ? "bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              Open to Join ({games.filter((g) => g.status === GameStatus.Waiting).length})
            </button>
            <button
              onClick={() => setFilterTab("my")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === "my"
                  ? "bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              My Games
            </button>
            <button
              onClick={() => setFilterTab("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterTab === "all"
                  ? "bg-[#00f0ff] text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  : "text-[var(--text-muted)] hover:text-white"
              }`}
            >
              All Matches ({totalGames})
            </button>
          </div>

          <button
            onClick={onRefresh}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            Refresh List
          </button>
        </div>

        {/* Cards Grid */}
        {filteredGames.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel space-y-3">
            <Layers className="w-10 h-10 text-[var(--text-dim)] mx-auto" />
            <h3 className="text-base font-bold text-white">No games found</h3>
            <p className="text-xs text-[var(--text-muted)]">
              {filterTab === "open"
                ? "There are currently no waiting games. Click 'Create New Game' to host one!"
                : "No matching games found in this category."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGames.map((g) => {
              const isCreator =
                address &&
                g.player1.toLowerCase() === address.toLowerCase();
              const isChallenger =
                address &&
                g.player2 &&
                g.player2 !== "0x0000000000000000000000000000000000000000" &&
                g.player2.toLowerCase() === address.toLowerCase();
              const canJoin =
                g.status === GameStatus.Waiting && isConnected && !isCreator;
              const isCopied = copiedId === g.gameId.toString();

              return (
                <div
                  key={g.gameId.toString()}
                  onClick={() => onSelectGame(g.gameId)}
                  className="p-5 rounded-2xl glass-panel hover:border-[#00f0ff]/40 flex flex-col justify-between gap-4 transition-all group cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-[#00f0ff]">
                        GAME #{g.gameId.toString()}
                      </span>
                      {g.status === GameStatus.Waiting && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                          Waiting for Player 2
                        </span>
                      )}
                      {g.status === GameStatus.Active && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active ({g.moveCount} moves)
                        </span>
                      )}
                      {g.status === GameStatus.Won && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
                          Won
                        </span>
                      )}
                      {g.status === GameStatus.Drawn && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">
                          Draw
                        </span>
                      )}
                      {g.status === GameStatus.Forfeited && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          Timeout Forfeited
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Host (P1):</span>
                        <span className="font-mono font-medium text-white">
                          {truncate(g.player1)}
                          {isCreator && (
                            <span className="ml-1 text-[10px] text-[#ff2a5f]">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">
                          Challenger (P2):
                        </span>
                        <span className="font-mono font-medium text-white">
                          {g.player2 ===
                          "0x0000000000000000000000000000000000000000"
                            ? "—"
                            : truncate(g.player2)}
                          {isChallenger && (
                            <span className="ml-1 text-[10px] text-[#00f0ff]">
                              (You)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[var(--border-color)] flex items-center gap-2">
                    {canJoin ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinSpecific(g.gameId);
                        }}
                        disabled={isJoinPending || isJoinConfirming}
                        className="btn-primary w-full py-2 text-xs"
                      >
                        <Swords className="w-3.5 h-3.5" />
                        <span>Join Game</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectGame(g.gameId)}
                        className="btn-secondary w-full py-2 text-xs flex items-center justify-center gap-1.5"
                      >
                        <span>View Board</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Copy Share Link Icon */}
                    <button
                      onClick={(e) => handleCopyCardLink(e, g.gameId)}
                      className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#00f0ff]/50 text-[var(--text-muted)] hover:text-[#00f0ff] transition-colors"
                      title="Copy Direct Share Link"
                    >
                      {isCopied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
