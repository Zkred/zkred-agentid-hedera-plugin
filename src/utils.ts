/**
 * Set RPC URL based on chainId if not provided
 * @param chainId - The chain ID
 * @param rpcUrl - Optional RPC URL
 * @returns RPC URL string
 */
export function setRpcUrl(chainId: number, rpcUrl?: string): string {
  if (rpcUrl) return rpcUrl;
  
  switch (chainId) {
    case 80002: // Polygon Amoy
      return "https://rpc-amoy.polygon.technology";
    case 296: // Hedera
      return "https://mainnet.hashio.io/api";
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}