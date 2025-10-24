// src/tools/verify-signature.ts
import { z } from "zod";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { getETHPublicKeyFromDID } from "./get-publickey-from-did";
const ethers = require("ethers");

/**
 * Verify signature against DID
 * @param sessionId Session identifier
 * @param challenge Challenge string
 * @param signature Signature to verify
 * @param did Decentralized identifier
 * @returns Boolean indicating if signature is valid
 */
export function verifySignature(
  sessionId: string,
  challenge: string,
  signature: string,
  did: string
): boolean {
  if (!sessionId || !challenge || !signature || !did) {
    throw new Error("sessionId, challenge, signature and did are required");
  }

  const message = JSON.stringify({
    sessionId,
    challenge,
  });
  const recoveredAddress = ethers.verifyMessage(message, signature);
  const derivedAddress = getETHPublicKeyFromDID(did);

  return recoveredAddress?.toLowerCase() === derivedAddress?.toLowerCase();
}

/* Zod schema for parameters */
export const verifySignatureParameters = (context: Context = {}) =>
  z.object({
    sessionId: z
      .string()
      .min(1)
      .describe("Session identifier"),
    challenge: z
      .string()
      .min(1)
      .describe("Challenge string"),
    signature: z
      .string()
      .min(1)
      .describe("Signature to verify"),
    did: z
      .string()
      .min(1)
      .describe("Decentralized identifier"),
  });

const verifySignaturePrompt = (context: Context = {}) => `
Verifies a signature against a Decentralized Identifier (DID).

Parameters:
- sessionId: Session identifier
- challenge: Challenge string
- signature: Signature to verify
- did: Decentralized identifier

Returns: Boolean indicating if the signature is valid
`;

const verifySignatureExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof verifySignatureParameters>>
) => {
  try {
    const { sessionId, challenge, signature, did } = params;
    const isValid = verifySignature(sessionId, challenge, signature, did);
    return { success: true, isValid };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const VERIFY_SIGNATURE_TOOL = "verify_signature";

const tool = (context: Context): Tool => ({
  method: VERIFY_SIGNATURE_TOOL,
  name: "Verify Signature",
  description: verifySignaturePrompt(context),
  parameters: verifySignatureParameters(context) as any,
  execute: verifySignatureExecute,
});

export default tool;