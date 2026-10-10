import React, { useState, useEffect } from "react";
import { useReadContract, useWatchContractEvent } from "wagmi";
import { Header } from "./components/Header";
import { GameBoard } from "./components/GameBoard";
import { GameList } from "./components/GameList";
import { FaucetModal } from "./components/FaucetModal";
import { RulesModal } from "./components/RulesModal";
import { TURNCHAIN_ADDRESS, TURNCHAIN_ABI } from "./config/contract";
import type { Game, GameSummary } from "./types/game";
import { GameStatus } from "./types/game";
import { AlertCircle, RotateCcw, Loader2 } from "lucide-react";

export function App() {
  const [selectedGameId, setSelectedGameId] = useState<bigint | null>(null);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Sync URL query parameters for direct game link support (e.g. ?gameId=1)
  useEffect(() => {
    const parseUrlGameId = () => {
      const params = new URLSearchParams(window.location.search);
      const gId = params.get("gameId");
      if (gId && /^\d+$/.test(gId)) {
        try {
          const parsed = BigInt(gId);
          if (parsed > 0n) {
            setSelectedGameId(parsed);
          }
        } catch (e) {
          console.error("Invalid gameId in URL:", e);
        }
      } else {
        setSelectedGameId(null);
      }
    };

    parseUrlGameId();
    window.addEventListener("popstate", parseUrlGameId);
    return () => window.removeEventListener("popstate", parseUrlGameId);
  }, []);

  const handleSelectGame = (gameId: bigint) => {
    setSelectedGameId(gameId);
    const newUrl = `${window.location.pathname}?gameId=${gameId.toString()}`;
    window.history.pushState({ gameId: gameId.toString() }, "", newUrl);
  };

  const handleBackToLobby = () => {
    setSelectedGameId(null);
    window.history.pushState({}, "", window.location.pathname);
  };

  // Read single game state if selected
  const {
    data: rawGameData,
    refetch: refetchGame,
    isLoading: isSingleGameLoading,
    isError: isSingleGameError,
    error: singleGameError,
  } = useReadContract({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    functionName: "getGame",
    args: selectedGameId ? [selectedGameId] : undefined,
    query: {
      enabled: selectedGameId !== null,
      refetchInterval: 3500, // 3.5s polling for active game updates
    },
  });

  // Read recent games list for lobby
  const {
    data: rawGamesData,
    refetch: refetchGames,
    isLoading: isGamesLoading,
  } = useReadContract({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    functionName: "getRecentGames",
    args: [BigInt(0), BigInt(50)],
    query: {
      refetchInterval: 5000,
    },
  });

  // Listen for real-time contract events to trigger immediate UI refresh
  useWatchContractEvent({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    eventName: "MoveMade",
    onLogs() {
      refetchGame();
      refetchGames();
    },
  });

  useWatchContractEvent({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    eventName: "PlayerJoined",
    onLogs() {
      refetchGame();
      refetchGames();
    },
  });

  useWatchContractEvent({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    eventName: "GameCreated",
    onLogs() {
      refetchGames();
    },
  });

  useWatchContractEvent({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    eventName: "GameWon",
    onLogs() {
      refetchGame();
      refetchGames();
    },
  });

  useWatchContractEvent({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    eventName: "GameDrawn",
    onLogs() {
      refetchGame();
      refetchGames();
    },
  });

  useWatchContractEvent({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    eventName: "GameForfeited",
    onLogs() {
      refetchGame();
      refetchGames();
    },
  });

  // Map raw single game data
  const currentGame: Game | null = React.useMemo(() => {
    if (!rawGameData) return null;
    const g = rawGameData as any;
    if (!g || !g.player1 || g.player1 === "0x0000000000000000000000000000000000000000") {
      return null;
    }
    return {
      gameId: g.gameId,
      player1: g.player1,
      player2: g.player2,
      currentTurn: g.currentTurn,
      winner: g.winner,
      status: g.status as GameStatus,
      moveCount: Number(g.moveCount),
      lastMoveTimestamp: g.lastMoveTimestamp,
      board: g.board,
      colHeights: g.colHeights,
    };
  }, [rawGameData]);

  // Map raw games summaries
  const gameSummaries: GameSummary[] = React.useMemo(() => {
    if (!rawGamesData) return [];
    const [summaries] = rawGamesData as [any[], bigint];
    return summaries.map((s) => ({
      gameId: s.gameId,
      player1: s.player1,
      player2: s.player2,
      currentTurn: s.currentTurn,
      winner: s.winner,
      status: s.status as GameStatus,
      moveCount: Number(s.moveCount),
      lastMoveTimestamp: s.lastMoveTimestamp,
    }));
  }, [rawGamesData]);

  const totalGames = rawGamesData ? Number((rawGamesData as any)[1]) : 0;

  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div>
        <Header
          onOpenFaucet={() => setIsFaucetOpen(true)}
          onOpenRules={() => setIsRulesOpen(true)}
          onGoHome={handleBackToLobby}
        />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {selectedGameId !== null ? (
            currentGame ? (
              <GameBoard
                game={currentGame}
                onRefresh={() => {
                  refetchGame();
                  refetchGames();
                }}
                onBackToLobby={handleBackToLobby}
              />
            ) : isSingleGameLoading ? (
              <div className="p-16 text-center rounded-3xl glass-panel space-y-4 max-w-xl mx-auto">
                <Loader2 className="w-10 h-10 text-[#00f0ff] animate-spin mx-auto" />
                <h3 className="text-lg font-bold text-white">
                  Loading Game #{selectedGameId.toString()}...
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Fetching verified game state directly from Base Sepolia.
                </p>
              </div>
            ) : (
              <div className="p-12 text-center rounded-3xl glass-panel space-y-5 max-w-xl mx-auto border border-rose-500/30">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">
                    Game #{selectedGameId.toString()} Not Found
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                    {isSingleGameError
                      ? (singleGameError?.message || "Error reading from Base Sepolia.")
                      : "This match does not exist or has not yet been initialized on-chain."}
                  </p>
                </div>
                <button
                  onClick={handleBackToLobby}
                  className="btn-primary py-2.5 px-6 text-xs mx-auto flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return to Lobby</span>
                </button>
              </div>
            )
          ) : (
            <GameList
              games={gameSummaries}
              totalGames={totalGames}
              isLoading={isGamesLoading}
              onSelectGame={handleSelectGame}
              onRefresh={() => refetchGames()}
            />
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border-color)] bg-[var(--bg-primary)]/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[var(--text-muted)] space-y-2">
          <p className="font-mono">
            TurnChain — Built on Base Sepolia (Chain ID: 84532)
          </p>
          <p>
            Smart contract is the sole authority for game validation, moves, wins,
            draws, and timeout forfeits.
          </p>
        </div>
      </footer>

      {/* Modals */}
      <FaucetModal
        isOpen={isFaucetOpen}
        onClose={() => setIsFaucetOpen(false)}
      />
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />
    </div>
  );
}
export default App;
