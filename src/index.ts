// src/index.ts
import { Context } from "hedera-agent-kit";
import { Plugin } from "hedera-agent-kit";
import generateDidTool, { GENERATE_DID_TOOL } from "./tools/generate-did";
import getPublicKeyFromDidTool, { GET_PUBLICKEY_FROM_DID_TOOL } from "./tools/get-publickey-from-did";
import createIdentityTool, { CREATE_IDENTITY_TOOL } from "./tools/create-identity";
import validateAgentTool, { VALIDATE_AGENT_TOOL } from "./tools/validate-agent";
import verifySignatureTool, { VERIFY_SIGNATURE_TOOL } from "./tools/verify-signature";
import generateSignatureTool, { GENERATE_SIGNATURE_TOOL } from "./tools/generate-signature";

export const zkredAgentIdPlugin: Plugin = {
  name: "@zkred/hedera-agentid-plugin",
  version: "1.0.0",
  description:
  "Hedera Agent Kit plugin that provides a generate_agent_did tool (Zkred).",
  tools: (context: Context) => [generateDidTool(context), getPublicKeyFromDidTool(context), createIdentityTool(context), validateAgentTool(context), verifySignatureTool(context), generateSignatureTool(context)],
};

export const zkredAgentIdToolNames = {
  GENERATE_DID_TOOL,
  GET_PUBLICKEY_FROM_DID_TOOL,
  CREATE_IDENTITY_TOOL,
  VALIDATE_AGENT_TOOL,
  VERIFY_SIGNATURE_TOOL,
  GENERATE_SIGNATURE_TOOL
} as const;

export default { zkredAgentIdPlugin, zkredAgentIdToolNames };
