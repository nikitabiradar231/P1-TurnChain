import React from "react";
import { X, ExternalLink, Droplet, ShieldCheck } from "lucide-react";

interface FaucetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FaucetModal: React.FC<FaucetModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const faucets = [
    {
      name: "Superchain Faucet (Optimism / Base)",
      url: "https://console.optimism.io/faucet",
      desc: "Get free Base Sepolia ETH with GitHub or Onchain ID authentication.",
    },
    {
      name: "Coinbase Developer Faucet",
      url: "https://faucet.coinbase.com/",
      desc: "Instant testnet ETH for Base Sepolia testnet directly to your wallet.",
    },
    {
      name: "QuickNode Base Sepolia Faucet",
      url: "https://faucet.quicknode.com/base/sepolia",
      desc: "Free drip every 12 hours for testing.",
    },
    {
      name: "LearnWeb3 Base Faucet",
      url: "https://learnweb3.io/faucets/base_sepolia/",
      desc: "Fast, community-supported Base Sepolia faucet.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg p-6 relative border border-[var(--border-glow)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[#ff2a5f]/10 text-[#ff2a5f] border border-[#ff2a5f]/20">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Base Sepolia Faucets</h3>
            <p className="text-xs text-[var(--text-muted)]">
              TurnChain runs on Base Sepolia testnet. Real cryptocurrency is NOT required!
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {faucets.map((faucet, idx) => (
            <a
              key={idx}
              href={faucet.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-[#00f0ff]/50 flex items-center justify-between group transition-all"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-[#00f0ff] transition-colors flex items-center gap-1.5">
                  <span>{faucet.name}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {faucet.desc}
                </p>
              </div>
            </a>
          ))}
        </div>

        <div className="p-3 rounded-xl bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-xs text-[#00f0ff] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            Testnet ETH has zero monetary value and is used solely for paying gas fees when executing on-chain transactions on Base Sepolia.
          </span>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="btn-secondary py-2 px-4 text-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
