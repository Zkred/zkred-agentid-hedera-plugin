import { z } from "zod";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { setRpcUrl } from "@/utils";
import identityRegistryABI from "../contracts/IndentityRegistry.json";
import { IDENTITY_REGISTRY_HEDERA } from "@/constant";
const ethers = require("ethers");

/**
 * Register an agent on the blockchain registry with metadata
 * @param privateKey - Private key (0x-prefixed, 64-hex string)
 * @param chainId - Chain ID (296 for Hedera)
 * @param tokenURI - Token URI for the agent
 * @param metadata - Array of metadata entries with key-value pairs
 * @param rpcUrl - Optional RPC URL
 * @returns Registration result with agentId and transaction hash
 */
async function registerAgentWithMetadata(
  privateKey: string,
  tokenURI: string,
  metadata: Array<{ key: string; value: string }>,
  chainId?: number,
  rpcUrl?: string
): Promise<{
  txHash: string;
  agentId: string;
  tokenURI: string;
  metadata: Array<{ key: string; value: string }>;
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

    // Validate tokenURI
    if (!tokenURI || tokenURI.trim() === "") {
      throw new Error("Token URI is required for registration with metadata");
    }

    // Validate metadata
    if (!metadata || metadata.length === 0) {
      throw new Error("Metadata array cannot be empty");
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

    // Convert metadata to the format expected by the contract
    // MetadataEntry[] where each entry has { key: string, value: bytes }
    const metadataEntries = metadata.map((entry) => ({
      key: entry.key,
      value: ethers.toUtf8Bytes(entry.value), // Convert string to bytes
    }));

    // Register agent with tokenURI and metadata
    // Call register(string memory tokenUri, MetadataEntry[] memory metadata)
    // Use bracket notation with full signature to disambiguate overloaded functions
    // MetadataEntry is a tuple: (string, bytes), so the signature is register(string,(string,bytes)[])
    const tx = await registry["register(string,(string,bytes)[])"](
      tokenURI,
      metadataEntries
    );

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
      tokenURI,
      metadata,
    };
  } catch (err: any) {
    const message = err?.message || String(err);
    throw new Error(`Agent registration with metadata failed: ${message}`);
  }
}

/* Zod schema for parameters */
export const registerAgentWithMetadataParameters = (context: Context = {}) =>
  z.object({
    privateKey: z
      .string()
      .regex(
        /^0x[0-9a-fA-F]{64}$/,
        "Must be a valid 0x-prefixed 64-hex private key"
      )
      .describe("Private key (0x-prefixed, 64-hex string)"),
    tokenURI: z.string().min(1).describe("Token URI for the agent (required)"),
    metadata: z
      .array(
        z.object({
          key: z.string().min(1).describe("Metadata key"),
          value: z
            .string()
            .describe("Metadata value (will be converted to bytes)"),
        })
      )
      .min(1)
      .describe("Array of metadata entries with key-value pairs"),
    chainId: z
      .number()
      .int()
      .refine(
        (val) => val === 296,
        "Must be a supported chain ID (296 for Hedera)"
      )
      .optional()
      .describe("Chain ID (296 for Hedera, defaults to 296 if not provided)"),
    rpcUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "Optional RPC URL (will be set automatically based on chainId if not provided)"
      ),
  });

const registerAgentWithMetadataPrompt = (context: Context = {}) => `
Registers an agent on the blockchain registry with token URI and metadata.

Parameters:
- privateKey: Private key (0x-prefixed, 64-hex string)
- tokenURI: Token URI for the agent (required)
- metadata: Array of metadata entries, each with a key (string) and value (string)
- chainId: Optional chain ID (296 for Hedera, defaults to 296 if not provided)
- rpcUrl: Optional RPC URL (automatically set based on chainId if not provided)

Returns: Registration result with transaction hash, agent ID, token URI, and metadata
`;

const registerAgentWithMetadataExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof registerAgentWithMetadataParameters>>
) => {
  try {
    const { privateKey, tokenURI, metadata, chainId, rpcUrl } = params;
    const result = await registerAgentWithMetadata(
      privateKey,
      tokenURI,
      metadata,
      chainId,
      rpcUrl
    );
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const REGISTER_AGENT_WITH_METADATA_TOOL = "register_agent_with_metadata";

const tool = (context: Context): Tool => {
  const schema = registerAgentWithMetadataParameters(context);
  return {
    method: REGISTER_AGENT_WITH_METADATA_TOOL,
    name: "Register Agent With Metadata",
    description: registerAgentWithMetadataPrompt(context),
    parameters: schema as any,
    execute: registerAgentWithMetadataExecute,
  };
};

export default tool;
