// src/tools/agent/generate-did.ts
import { z } from "zod";
import bs58 from "bs58";
import crc from "crc";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";

/**
 * Generate Privado ID DID from Ethereum address
 * @param ethAddress Ethereum address (0x-prefixed, 20 bytes)
 * @param chain "polygon" | "privado" | ...
 * @param network "amoy" | "main" | ...
 * @returns DID string
 */
function generateDID(
  ethAddress: string,
  chain: string,
  network: string
): string {
  if (!ethAddress || !chain || !network) {
    throw new Error("ethAddress, chain and network are required");
  }

  const normalized = ethAddress.toLowerCase().replace(/^0x/, "");
  const addrBytes = Buffer.from(normalized, "hex");
  if (addrBytes.length !== 20) {
    throw new Error("Ethereum address must be 20 bytes");
  }

  const idType = Buffer.from([0x0d, 0x01]); // verify for your ecosystem
  const zeroPadding = Buffer.alloc(7, 0);
  const base = Buffer.concat([idType, zeroPadding, addrBytes]); // 29 bytes

  const checksumVal = crc.crc16xmodem(base);
  const checksum = Buffer.alloc(2);
  checksum.writeUInt16LE(checksumVal);

  const fullBytes = Buffer.concat([base, checksum]); // 31 bytes

  const base58Id = bs58.encode(fullBytes);
  return `did:iden3:${chain}:${network}:${base58Id}`;
}

/* Zod schema for parameters */
export const generateDidParameters = (context: Context = {}) =>
  z.object({
    ethAddress: z
      .string()
      .regex(
        /^0x[a-fA-F0-9]{40}$/,
        "Must be a valid 0x-prefixed Ethereum address"
      )
      .describe("Ethereum address (0x-prefixed, 20 bytes)"),
    chain: z
      .string()
      .min(1)
      .describe('Chain name (e.g., "polygon", "privado")'),
    network: z.string().min(1).describe('Network name (e.g., "amoy", "main")'),
  });

const generateDidPrompt = (context: Context = {}) => `
Generates a Decentralized Identifier (DID) from an Ethereum address.

Parameters:
- ethAddress: Ethereum address (0x-prefixed, 20 bytes)
- chain: Chain name (e.g., "polygon", "privado")
- network: Network name (e.g., "amoy", "main")

Returns: DID string in the format did:iden3:chain:network:base58Id
`;

const generateDidExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof generateDidParameters>>
) => {
  try {
    const { ethAddress, chain, network } = params;
    const did = generateDID(ethAddress, chain, network);
    return { success: true, did };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const GENERATE_DID_TOOL = "generate_agent_did";

const tool = (context: Context): Tool => ({
  method: GENERATE_DID_TOOL,
  name: "Generate Agent DID",
  description: generateDidPrompt(context),
  parameters: generateDidParameters(context) as any,
  execute: generateDidExecute,
});

export default tool;
