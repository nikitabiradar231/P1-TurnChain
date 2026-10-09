import React from "react";
import { X, CheckCircle, ShieldAlert, Clock, Sparkles } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-xl p-6 relative border border-[var(--border-glow)] animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">How TurnChain Works</h3>
            <p className="text-xs text-[var(--text-muted)]">
              100% Autonomous On-Chain Connect Four on Base Sepolia
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-[var(--text-main)]">
          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="font-bold text-[#00f0ff] flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" /> 1. Two-Player Turn-Based Play
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Player 1 (Red / Crimson) creates a game and goes first. Player 2 (Cyan) joins the game. Discs drop into columns 0 through 6 by gravity onto the 7×6 grid.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="font-bold text-[#ff2a5f] flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4" /> 2. Smart Contract Win Verification
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              The Solidity smart contract autonomously inspects the board after every move for 4 connected discs in any orientation (horizontal, vertical, diagonal-up, diagonal-down). There are no off-chain judges or central servers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="font-bold text-amber-400 flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4" /> 3. 24-Hour Inactivity Timeout Forfeiture
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              If the player whose turn it is does not make a move within 24 hours (1 day), the waiting opponent can execute <code className="font-mono text-amber-300">claimTimeout()</code> on-chain to instantly claim victory and forfeit the stalling player.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
            <h4 className="font-bold text-purple-400 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4" /> 4. Draws & Security Guarantees
            </h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              If all 42 spaces are occupied without a winner, the contract records an immutable Draw. Out-of-turn moves, invalid columns, full column drops, and double-claims are strictly rejected at the EVM bytecode level.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-primary py-2 px-6 text-sm">
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
