import React, { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { Header } from "./components/Header";
import { GameBoard } from "./components/GameBoard";
import { GameList } from "./components/GameList";
import { FaucetModal } from "./components/FaucetModal";
import { RulesModal } from "./components/RulesModal";
import { TURNCHAIN_ADDRESS, TURNCHAIN_ABI } from "./config/contract";
import type { Game, GameSummary } from "./types/game";
import { GameStatus } from "./types/game";

export function App() {
  const [selectedGameId, setSelectedGameId] = useState<bigint | null>(null);
  const [isFaucetOpen, setIsFaucetOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  // Check URL query parameters for direct game link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const gId = params.get("gameId");
    if (gId) {
      try {
        setSelectedGameId(BigInt(gId));
      } catch (e) {
        console.error("Invalid gameId in URL:", e);
      }
    }

    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const urlGameId = urlParams.get("gameId");
      if (urlGameId) {
        setSelectedGameId(BigInt(urlGameId));
      } else {
        setSelectedGameId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
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
  } = useReadContract({
    address: TURNCHAIN_ADDRESS,
    abi: TURNCHAIN_ABI,
    functionName: "getGame",
    args: selectedGameId ? [selectedGameId] : undefined,
    query: {
      enabled: selectedGameId !== null,
      refetchInterval: 3500, // Poll every 3.5s for seamless asynchronous gameplay
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

  // Map raw single game data
  const currentGame: Game | null = React.useMemo(() => {
    if (!rawGameData) return null;
    const g = rawGameData as any;
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
          {selectedGameId && currentGame ? (
            <GameBoard
              game={currentGame}
              onRefresh={() => {
                refetchGame();
                refetchGames();
              }}
              onBackToLobby={handleBackToLobby}
            />
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
