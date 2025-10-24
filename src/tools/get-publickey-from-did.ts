import { z } from "zod";
import bs58 from "bs58";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";

/**
 * Extracts the Ethereum public key from a Decentralized Identifier (DID)
 * @param didFull - The complete DID string
 * @returns The Ethereum public key as a hex string, or null if invalid
 */
function getETHPublicKeyFromDID(didFull: string): string | null {
  try {
    // Validate DID format and extract Base58 component
    const parts = didFull.split(":");
    if (parts.length < 5) throw new Error("Invalid DID format");
    const base58Id = parts[4];

    // Decode Base58 to bytes
    const decodedBytes = bs58.decode(base58Id);
    
    // Validate decoded bytes length
    if (decodedBytes.length !== 31) {
      throw new Error("Unexpected decoded length, must be 31 bytes");
    }

    // Parse DID components
    const idType = decodedBytes.slice(0, 2);       // 2 bytes
    const zeroPadding = decodedBytes.slice(2, 9);  // 7 bytes
    const ethBytes = decodedBytes.slice(9, 29);    // 20 bytes
    const checksum = decodedBytes.slice(29, 31);   // 2 bytes

    // Verify Ethereum control (zero padding)
    const isEthereumControlled = zeroPadding.every((b) => b === 0);
    if (!isEthereumControlled) {
      console.warn("This DID is NOT Ethereum-controlled, genesis state is non-zero");
      return null;
    }

    // Convert to Ethereum address format
    const ethAddress = "0x" + Buffer.from(ethBytes).toString("hex");
    return ethAddress;
  } catch (err) {
    console.error("Error decoding DID:", err);
    return null;
  }
}

/* Zod schema for parameters */
export const getPublicKeyFromDidParameters = (context: Context = {}) =>
  z.object({
    didFull: z
      .string()
      .min(1)
      .describe("The complete DID string to extract the Ethereum address from"),
  });

const getPublicKeyFromDidPrompt = (context: Context = {}) => `
Extracts the Ethereum public key (address) from a Decentralized Identifier (DID).

Parameters:
- didFull: The complete DID string in the format did:iden3:chain:network:base58Id

Returns: The Ethereum address as a hex string (0x-prefixed), or null if the DID is invalid or not Ethereum-controlled
`;

const getPublicKeyFromDidExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof getPublicKeyFromDidParameters>>
) => {
  try {
    const { didFull } = params;
    const ethAddress = getETHPublicKeyFromDID(didFull);
    
    if (ethAddress === null) {
      return { success: false, error: "Failed to extract Ethereum address from DID" };
    }
    
    return { success: true, ethAddress };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const GET_PUBLICKEY_FROM_DID_TOOL = "get_publickey_from_did";

const tool = (context: Context): Tool => ({
  method: GET_PUBLICKEY_FROM_DID_TOOL,
  name: "Get Public Key from DID",
  description: getPublicKeyFromDidPrompt(context),
  parameters: getPublicKeyFromDidParameters(context) as any,
  execute: getPublicKeyFromDidExecute,
});

export default tool;