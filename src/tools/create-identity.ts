import { z } from "zod";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { generateDID } from "./generate-did";
import { setRpcUrl } from "@/utils";
import identityRegistryABI from "../contracts/IndentityRegistry.json";
import { IDENTITY_REGISTRY_HEDERA } from "@/constant";
const ethers = require("ethers");

/**
 * Create a new identity on the blockchain
 * @param privateKey - Private key (0x-prefixed, 64-hex string)
 * @param chainId - Chain ID (296 for Hedera)
 * @param description - Agent description
 * @param serviceEndpoint - Service endpoint URL
 * @param rpcUrl - Optional RPC URL
 * @returns Identity creation result
 */
async function createIdentity(
  privateKey: string,
  chainId: number,
  description: string,
  serviceEndpoint: string,
  rpcUrl?: string
): Promise<{
  txHash: string;
  did: string;
  description: string;
  serviceEndpoint: string;
  agentId: string;
  publicKey: string;
}> {
  try {
    // Set RPC URL if not provided based on chainId
    rpcUrl = setRpcUrl(chainId, rpcUrl);

    // Validate private key format
    if (!/^0x[0-9a-fA-F]{64}$/.test(privateKey)) {
      throw new Error("Private key must be a 0x-prefixed 64-hex string");
    }

    // Generate public key and signer
    const publicKey = ethers.computeAddress(privateKey);
    const provider = new ethers.JsonRpcProvider(rpcUrl as string);
    const signer = new ethers.Wallet(privateKey, provider);

    // Use Hedera registry contract
    const REGISTRY_CONTRACT = IDENTITY_REGISTRY_HEDERA;

    const registry = new ethers.Contract(
      REGISTRY_CONTRACT,
      identityRegistryABI.abi,
      signer
    );
    const registrationFee = ethers.parseEther("0.01");

    // Check if agent already exists
    let agentDetails;
    try {
      agentDetails = await registry.getAgentByAddress(publicKey);
    } catch (err: any) {
      console.log("agent not found now registering");
    }

    if (agentDetails?.length) {
      console.log(agentDetails);
      throw new Error("Agent already registered");
    }

    // Register new agent
    const did = generateDID(publicKey, "privado", "main");
    const tx = await registry.registerAgent(did, description, serviceEndpoint, {
      value: registrationFee,
    });

    await tx.wait();
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Get updated agent details
    const agent = await registry.getAgentByAddress(publicKey);

    return {
      txHash: tx.hash,
      did,
      description,
      serviceEndpoint,
      agentId: BigInt(agent[1]).toString(),
      publicKey,
    };
  } catch (err: any) {
    const message = err?.message || String(err);
    throw new Error(`Identity creation failed: ${message}`);
  }
}

/* Zod schema for parameters */
export const createIdentityParameters = (context: Context = {}) =>
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
      .describe("Chain ID (296 for Hedera)"),
    description: z.string().min(1).describe("Agent description"),
    serviceEndpoint: z.string().url().describe("Service endpoint URL"),
    rpcUrl: z
      .string()
      .url()
      .optional()
      .describe(
        "Optional RPC URL (will be set automatically based on chainId if not provided)"
      ),
  });

const createIdentityPrompt = (context: Context = {}) => `
Creates a new identity on the blockchain by registering an agent with the identity registry.

Parameters:
- privateKey: Private key (0x-prefixed, 64-hex string)
- chainId: Chain ID (296 for Hedera)
- description: Agent description
- serviceEndpoint: Service endpoint URL
- rpcUrl: Optional RPC URL (automatically set based on chainId if not provided)

Returns: Identity creation result with transaction hash, DID, description, service endpoint, and agent ID
`;

const createIdentityExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof createIdentityParameters>>
) => {
  try {
    const { privateKey, chainId, description, serviceEndpoint, rpcUrl } =
      params;
    const result = await createIdentity(
      privateKey,
      chainId,
      description,
      serviceEndpoint,
      rpcUrl
    );
    return { success: true, ...result };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const CREATE_IDENTITY_TOOL = "create_identity";

const tool = (context: Context): Tool => ({
  method: CREATE_IDENTITY_TOOL,
  name: "Create Identity",
  description: createIdentityPrompt(context),
  parameters: createIdentityParameters(context) as any,
  execute: createIdentityExecute,
});

export default tool;
