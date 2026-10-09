import React from "react";
import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import {
  Wallet,
  LogOut,
  Droplet,
  BookOpen,
  Layers,
  AlertCircle,
} from "lucide-react";

interface HeaderProps {
  onOpenFaucet: () => void;
  onOpenRules: () => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenFaucet,
  onOpenRules,
  onGoHome,
}) => {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongChain = isConnected && chainId !== baseSepolia.id;

  const truncateAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <header className="w-full border-b border-[var(--border-color)] bg-[var(--bg-card)] backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#00f0ff] to-[#7000ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,240,255,0.4)] group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight text-white font-mono">
                TURN<span className="text-[#00f0ff]">CHAIN</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-mono">
                Base Sepolia
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              100% Autonomous On-Chain Connect Four
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Rules button */}
          <button
            onClick={onOpenRules}
            className="btn-secondary hidden sm:inline-flex text-sm py-2 px-3"
            title="How to Play"
          >
            <BookOpen className="w-4 h-4 text-[#00f0ff]" />
            <span>Rules</span>
          </button>

          {/* Faucet button */}
          <button
            onClick={onOpenFaucet}
            className="btn-secondary text-sm py-2 px-3"
            title="Get Testnet ETH"
          >
            <Droplet className="w-4 h-4 text-[#ff2a5f]" />
            <span className="hidden sm:inline">Faucet</span>
          </button>

          {/* Network Alert / Switch */}
          {isWrongChain && (
            <button
              onClick={() => switchChain({ chainId: baseSepolia.id })}
              className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-500/30 transition-colors"
            >
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Switch to Base Sepolia</span>
            </button>
          )}

          {/* Wallet Connect */}
          {isConnected && address ? (
            <div className="flex items-center gap-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-3 py-2 rounded-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span className="font-mono text-sm text-white font-medium">
                {truncateAddress(address)}
              </span>
              <button
                onClick={() => disconnect()}
                className="p-1 hover:text-[#ff2a5f] text-[var(--text-muted)] transition-colors ml-1"
                title="Disconnect"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                const connector = connectors[0];
                if (connector) connect({ connector });
              }}
              disabled={isConnecting}
              className="btn-primary text-sm py-2.5 px-4"
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnecting ? "Connecting..." : "Connect Wallet"}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
