/**
 * Formats Viem / Wagmi / MetaMask errors into clean, user-friendly messages.
 */
export function formatContractError(error: unknown): string {
  if (!error) return "";

  const errObj = error as any;
  const rawMsg = errObj?.shortMessage || errObj?.message || (typeof error === "string" ? error : JSON.stringify(error));

  if (
    rawMsg.includes("User rejected") ||
    rawMsg.includes("User denied") ||
    rawMsg.includes("user rejected") ||
    rawMsg.includes("rejected the request")
  ) {
    return "Transaction was cancelled / rejected in your wallet.";
  }

  if (
    rawMsg.includes("insufficient funds") ||
    rawMsg.includes("exceeds balance") ||
    rawMsg.includes("gas required exceeds allowance")
  ) {
    return "Insufficient Base Sepolia ETH for gas fees. Please claim free testnet ETH from the Faucet.";
  }

  if (rawMsg.includes("AlreadyJoined") || rawMsg.includes("GameAlreadyStarted")) {
    return "This match has already started or already has a second player.";
  }

  if (rawMsg.includes("NotYourTurn")) {
    return "It is not your turn to make a move.";
  }

  if (rawMsg.includes("ColumnFull")) {
    return "This column is full (6 discs maximum). Choose another column.";
  }

  if (rawMsg.includes("InvalidColumn")) {
    return "Invalid column selection. Must be between 0 and 6.";
  }

  if (rawMsg.includes("TimeoutNotReached")) {
    return "Inactivity deadline has not expired yet (24-hour timeout limit).";
  }

  if (
    rawMsg.includes("Connector not connected") ||
    rawMsg.includes("account is not connected")
  ) {
    return "Wallet is not connected. Please connect your wallet first.";
  }

  // Extract clean message by discarding stack traces and compiler versions
  const cleanLine = rawMsg.split("\n")[0].split("Version:")[0].trim();
  return cleanLine.length > 140 ? `${cleanLine.slice(0, 140)}...` : cleanLine;
}
