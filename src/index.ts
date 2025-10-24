// src/index.ts
import { Context } from "hedera-agent-kit";
import { Plugin } from "hedera-agent-kit";
import generateDidTool, { GENERATE_DID_TOOL } from "./tools/generate-did";
import getPublicKeyFromDidTool, { GET_PUBLICKEY_FROM_DID_TOOL } from "./tools/get-publickey-from-did";

export const zkredAgentIdPlugin: Plugin = {
  name: "zkred-agent-id",
  version: "1.0.0",
  description:
    "Hedera Agent Kit plugin that provides a generate_agent_did tool (Zkred).",
  tools: (context: Context) => [generateDidTool(context), getPublicKeyFromDidTool(context)],
};

export const zkredAgentIdToolNames = {
  GENERATE_DID_TOOL,
  GET_PUBLICKEY_FROM_DID_TOOL
} as const;

export default { zkredAgentIdPlugin, zkredAgentIdToolNames };
