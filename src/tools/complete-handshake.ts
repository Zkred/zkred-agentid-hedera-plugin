// src/tools/agent/complete-handshake.ts
import { z } from "zod";
import { ethers } from "ethers";
import axios from "axios";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";

/**
 * Complete handshake by signing challenge and sending response
 * @param privateKey Private key for signing the challenge
 * @param sessionId Session ID from the handshake initiation
 * @param receiverAgentCallbackEndPoint Callback endpoint for the receiver agent
 * @param challenge Challenge string to be signed
 * @returns boolean indicating success or failure
 */
export async function completeHandshake(
  privateKey: string,
  sessionId: string,
  receiverAgentCallbackEndPoint: string,
  challenge: string
): Promise<boolean> {
  if (!privateKey || !sessionId || !receiverAgentCallbackEndPoint || !challenge) {
    throw new Error("privateKey, sessionId, receiverAgentCallbackEndPoint and challenge are required");
  }

  const message = JSON.stringify({
    sessionId,
    challenge,
  });

  const wallet = new ethers.Wallet(privateKey);
  const signature = await wallet.signMessage(message);

  try {
    const response = await axios.post(receiverAgentCallbackEndPoint, {
      sessionId,
      challenge,
      signature,
    });

    if (
      response?.data?.data?.sessionId === sessionId &&
      response?.data?.data?.status === "handshake_completed"
    ) {
      return true;
    }
  } catch (err) {
    return false;
  }

  return false;
}

/* Zod schema for parameters */
export const completeHandshakeParameters = (context: Context = {}) =>
  z.object({
    privateKey: z
      .string()
      .regex(
        /^0x[a-fA-F0-9]{64}$/,
        "Must be a valid 0x-prefixed private key (64 hex characters)"
      )
      .describe("Private key for signing the challenge (0x-prefixed, 32 bytes)"),
    sessionId: z
      .string()
      .min(1)
      .describe("Session ID from the handshake initiation"),
    receiverAgentCallbackEndPoint: z
      .string()
      .url()
      .describe("Callback endpoint URL for the receiver agent"),
    challenge: z
      .string()
      .min(1)
      .describe("Challenge string to be signed"),
  });

const completeHandshakePrompt = (context: Context = {}) => `
Completes a handshake by signing a challenge and sending the response to the receiver agent.

Parameters:
- privateKey: Private key for signing the challenge (0x-prefixed, 32 bytes)
- sessionId: Session ID from the handshake initiation
- receiverAgentCallbackEndPoint: Callback endpoint URL for the receiver agent
- challenge: Challenge string to be signed

Returns: Boolean indicating whether the handshake was completed successfully
`;

const completeHandshakeExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof completeHandshakeParameters>>
) => {
  try {
    const { privateKey, sessionId, receiverAgentCallbackEndPoint, challenge } = params;
    const success = await completeHandshake(privateKey, sessionId, receiverAgentCallbackEndPoint, challenge);
    return { success: true, handshakeCompleted: success };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const COMPLETE_HANDSHAKE_TOOL = "complete_agent_handshake";

const tool = (context: Context): Tool => ({
  method: COMPLETE_HANDSHAKE_TOOL,
  name: "Complete Agent Handshake",
  description: completeHandshakePrompt(context),
  parameters: completeHandshakeParameters(context) as any,
  execute: completeHandshakeExecute,
});

export default tool;