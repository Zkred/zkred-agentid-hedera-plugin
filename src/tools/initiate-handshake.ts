// src/tools/agent/initiate-handshake.ts
import { z } from "zod";
import axios from "axios";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { setRpcUrl } from "../utils";
import { validateAgent } from "./validate-agent";

/**
 * Initiate handshake between two agents
 * @param initiatorDid DID of the initiating agent
 * @param initiatorChainId Chain ID for initiator (296 for Hedera)
 * @param receiverDid DID of the receiving agent
 * @param receiverChainId Chain ID for receiver (296 for Hedera)
 * @param initiatorRpcUrl Optional RPC URL for initiator
 * @param receiverRpcUrl Optional RPC URL for receiver
 * @returns Handshake session details
 */
export async function initiateHandshake(
  initiatorDid: string,
  initiatorChainId: 296,
  receiverDid: string,
  receiverChainId: 296,
  initiatorRpcUrl: string = "",
  receiverRpcUrl: string = ""
): Promise<{
  sessionId: number;
  receiverAgentCallbackEndPoint: string;
  challenge: string;
}> {
  if (!initiatorDid || !receiverDid) {
    throw new Error("initiatorDid and receiverDid are required");
  }

  const sessionId = Date.now();
  initiatorRpcUrl = setRpcUrl(initiatorChainId, initiatorRpcUrl);
  receiverRpcUrl = setRpcUrl(receiverChainId, receiverRpcUrl);

  const initiatorAgent = await validateAgent(
    initiatorDid,
    initiatorChainId,
    initiatorRpcUrl
  );

  if (!initiatorAgent) {
    throw new Error("Initiator agent not found");
  }

  // Get service endpoint of receiver
  const receiverAgent = await validateAgent(
    receiverDid,
    receiverChainId,
    receiverRpcUrl
  );

  if (!receiverAgent) {
    throw new Error("Receiver agent not found");
  }

  console.log(
    "Receiver agent service endpoint:",
    receiverAgent?.serviceEndPoint
  );

  // Call receiver agent's /initiate url
  try {
    const response = await axios.post(
      `${receiverAgent?.serviceEndPoint}initiate`,
      {
        sessionId,
        initiatorDid,
        initiatorChainId,
      }
    );

    return {
      sessionId,
      receiverAgentCallbackEndPoint: `${receiverAgent?.serviceEndPoint}/callback`,
      challenge: response?.data?.data?.challenge,
    };
  } catch (err) {
    throw err;
  }
}

/* Zod schema for parameters */
export const initiateHandshakeParameters = (context: Context = {}) =>
  z.object({
    initiatorDid: z.string().min(1).describe("DID of the initiating agent"),
    initiatorChainId: z
      .literal(296)
      .describe("Chain ID for initiator (296 for Hedera)"),
    receiverDid: z.string().min(1).describe("DID of the receiving agent"),
    receiverChainId: z
      .literal(296)
      .describe("Chain ID for receiver (296 for Hedera)"),
    initiatorRpcUrl: z
      .string()
      .optional()
      .describe("Optional RPC URL for initiator"),
    receiverRpcUrl: z
      .string()
      .optional()
      .describe("Optional RPC URL for receiver"),
  });

const initiateHandshakePrompt = (context: Context = {}) => `
Initiates a handshake between two agents on the Hedera network.

Parameters:
- initiatorDid: DID of the initiating agent (required)
- initiatorChainId: Chain ID for initiator (296 for Hedera) (required)
- receiverDid: DID of the receiving agent (required)
- receiverChainId: Chain ID for receiver (296 for Hedera) (required)
- initiatorRpcUrl: Optional RPC URL for initiator (optional)
- receiverRpcUrl: Optional RPC URL for receiver (optional)

Returns: Handshake session details including sessionId, callback endpoint, and challenge
`;

const initiateHandshakeExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof initiateHandshakeParameters>>
) => {
  try {
    const {
      initiatorDid,
      initiatorChainId,
      receiverDid,
      receiverChainId,
      initiatorRpcUrl = "",
      receiverRpcUrl = "",
    } = params;
    const handshake = await initiateHandshake(
      initiatorDid,
      initiatorChainId,
      receiverDid,
      receiverChainId,
      initiatorRpcUrl,
      receiverRpcUrl
    );
    return { success: true, handshake };
  } catch (err: any) {
    return { success: false, error: err.message || String(err) };
  }
};

export const INITIATE_HANDSHAKE_TOOL = "initiate_agent_handshake";

const tool = (context: Context): Tool => ({
  method: INITIATE_HANDSHAKE_TOOL,
  name: "Initiate Agent Handshake",
  description: initiateHandshakePrompt(context),
  parameters: initiateHandshakeParameters(context) as any,
  execute: initiateHandshakeExecute,
});

export default tool;
