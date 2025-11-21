import { z } from "zod";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { setRpcUrl } from "@/utils";
import identityRegistryABI from "../contracts/IndentityRegistry.json";
import { IDENTITY_REGISTRY_HEDERA } from "@/constant";
const ethers = require("ethers");

/**
 * Register an agent on the blockchain registry
 * @param privateKey - Private key (0x-prefixed, 64-hex string)
 * @param chainId - Chain ID (296 for Hedera)
 * @param tokenURI - Optional token URI
 * @param rpcUrl - Optional RPC URL
 * @returns Registration result with agentId and transaction hash
 */
async function registerAgent(
  privateKey: string,
  chainId?: number,
  tokenURI?: string,
  rpcUrl?: string
): Promise<{
  txHash: string;
  agentId: string;
  tokenURI?: string;
}> {
  try {
    // Set default chainId to 296 (Hedera) if not provided
    if (!chainId) {
      chainId = 296;
    }

    // Set RPC URL if not provided based on chainId
    rpcUrl = setRpcUrl(chainId, rpcUrl);

    // Validate private key format
    if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error("Private key must be a 0x-prefixed 64-hex string");
    }

    // Generate signer
    const provider = new ethers.JsonRpcProvider(rpcUrl as string);
    const signer = new ethers.Wallet(privateKey, provider);

    // Use Hedera registry contract
    const REGISTRY_CONTRACT = IDENTITY_REGISTRY_HEDERA;

    const registry = new ethers.Contract(
      REGISTRY_CONTRACT,
      identityRegistryABI.abi,
      signer
    );

    // Register agent - handle override based on tokenURI presence
    // Use bracket notation with full signature to disambiguate overloaded functions
    let tx;
    if (tokenURI && tokenURI.trim() !== "") {
      // Call register(string memory tokenUri) - use full signature string
      tx = await registry["register(string)"](tokenURI);
    } else {
      // Call register() - no parameters - use full signature string
      tx = await registry["register()"]();
    }

    // Wait for transaction to be mined
    const receipt = await tx.wait();
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get the agentId from the Registered event
    let agentId = "unknown";
    if (receipt && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsedLog = registry.interface.parseLog(log);
          if (parsedLog && parsedLog.name === "Registered") {
            agentId = parsedLog.args.agentId.toString();
            break;
          }
        } catch {
          // Continue to next log if parsing fails
        }
      }
    }

    return {
      txHash: tx.hash,
      agentId,
      ...(tokenURI && { tokenURI }),
    };
  } catch (err: any) {
    const message = err?.message || String(err);
    throw new Error(`Agent registration failed: ${message}`);
  }
}

/* Zod schema for parameters */
export const registerAgentParameters = (context: Context = {}) =>
  z.object({
    privateKey: z
      .string()
      .regex(
        /^0x[0-9a-fA-F]{64}$/,
        "Must be a valid 0x-prefixed 64-hex private key"
      )
      .describe("Private key (0x-prefixed, 64-hex string)"),
    chainId: z
      .number()
      .int()
      .refine(
        (val) => val === 296,
        "Must be a supported chain ID (296 for Hedera)"
      )
      .optional()
      .describe("Chain ID (296 for Hedera, defaults to 296 if not provided)"),
    tokenURI: z
      .string()
      .optional()
      .describe("Optional token URI for the agent"),
    rpcUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "Optional RPC URL (will be set automatically based on chainId if not provided)"
      ),
  });

const registerAgentPrompt = (context: Context = {}) => `
Registers an agent on the blockchain registry. Can register with or without a token URI.

Parameters:
- privateKey: Private key (0x-prefixed, 64-hex string)
- chainId: Chain ID (296 for Hedera)
- tokenURI: Optional token URI for the agent (if not provided, registers without token URI)
- rpcUrl: Optional RPC URL (automatically set based on chainId if not provided)

Returns: Registration result with transaction hash, agent ID, and optional token URI
`;

const registerAgentExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof registerAgentParameters>>
) => {
  try {
    const { privateKey, chainId, tokenURI, rpcUrl } = params;
    const result = await registerAgent(privateKey, chainId, tokenURI, rpcUrl);
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const REGISTER_AGENT_TOOL = "register_agent";

const tool = (context: Context): Tool => ({
  method: REGISTER_AGENT_TOOL,
  name: "Register Agent",
  description: registerAgentPrompt(context),
  parameters: registerAgentParameters(context) as any,
  execute: registerAgentExecute,
});

export default tool;
