// src/index.ts
import { Context } from "hedera-agent-kit";
import { Plugin } from "hedera-agent-kit";
import generateDidTool, { GENERATE_DID_TOOL } from "./tools/generate-did";
import getPublicKeyFromDidTool, {
  GET_PUBLICKEY_FROM_DID_TOOL,
} from "./tools/get-publickey-from-did";
import createIdentityTool, {
  CREATE_IDENTITY_TOOL,
} from "./tools/create-identity";
import validateAgentTool, { VALIDATE_AGENT_TOOL } from "./tools/validate-agent";
import getAgentFromServiceEndpointTool, {
  GET_AGENT_FROM_SERVICE_ENDPOINT_TOOL,
} from "./tools/get-agent-from-servicendpoint";
import verifySignatureTool, {
  VERIFY_SIGNATURE_TOOL,
} from "./tools/verify-signature";
import generateChallengeTool, {
  GENERATE_CHALLENGE_TOOL,
} from "./tools/generate-challenge";
import initiateHandshakeTool, {
  INITIATE_HANDSHAKE_TOOL,
} from "./tools/initiate-handshake";
import completeHandshakeTool, {
  COMPLETE_HANDSHAKE_TOOL,
} from "./tools/complete-handshake";

export const zkredAgentIdPlugin: Plugin = {
  name: "@zkred/hedera-agentid-plugin",
  version: "1.0.0",
  description:
    "Hedera Agent Kit plugin that provides a generate_agent_did tool (Zkred).",
  tools: (context: Context) => [
    generateDidTool(context),
    getPublicKeyFromDidTool(context),
    createIdentityTool(context),
    validateAgentTool(context),
    getAgentFromServiceEndpointTool(context),
    verifySignatureTool(context),
    generateChallengeTool(context),
    initiateHandshakeTool(context),
    completeHandshakeTool(context),
  ],
};

export const zkredAgentIdToolNames = {
  GENERATE_DID_TOOL,
  GET_PUBLICKEY_FROM_DID_TOOL,
  CREATE_IDENTITY_TOOL,
  VALIDATE_AGENT_TOOL,
  GET_AGENT_FROM_SERVICE_ENDPOINT_TOOL,
  VERIFY_SIGNATURE_TOOL,
  GENERATE_CHALLENGE_TOOL,
  INITIATE_HANDSHAKE_TOOL,
  COMPLETE_HANDSHAKE_TOOL,
} as const;

export default { zkredAgentIdPlugin, zkredAgentIdToolNames };
