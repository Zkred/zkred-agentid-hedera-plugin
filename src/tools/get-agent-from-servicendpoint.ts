import { z } from "zod";
import { ethers } from "ethers";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { setRpcUrl } from "../utils";
import { IDENTITY_REGISTRY_HEDERA } from "../constant";
import identityRegistryABI from "../contracts/IndentityRegistry.json";

/**
 * Get agent details from service endpoint
 * @param serviceEndpoint - The service endpoint URL to lookup
 * @param chainId - The chain ID (296 for Hedera)
 * @param rpcUrl - Optional RPC URL, will use default if not provided
 * @returns Agent details including DID, agent ID, description, and service endpoint
 */
export async function getAgentFromServiceEndpoint(
  serviceEndpoint: string,
  chainId: 296,
  rpcUrl: string = ""
): Promise<{
  did: string;
  agentId: number;
  description: string;
  serviceEndPoint: string;
}> {
  try {
    rpcUrl = setRpcUrl(chainId, rpcUrl);

    // Determine registry contract based on chain ID
    let REGISTRY_CONTRACT = IDENTITY_REGISTRY_HEDERA;

    const provider = new ethers.JsonRpcProvider(rpcUrl as string);
    const registry = new ethers.Contract(
      REGISTRY_CONTRACT,
      identityRegistryABI.abi,
      provider
    );

    const agentDetails = await registry.getAgentByServiceEndpoint(
      serviceEndpoint
    );

    return {
      did: agentDetails[0],
      agentId: Number(agentDetails[1]),
      description: agentDetails[2],
      serviceEndPoint: agentDetails[3],
    };
  } catch (err: any) {
    console.warn("Error in getAgentFromServiceEndpoint:", err.message || err);
    throw err;
  }
}

/* Zod schema for parameters */
export const getAgentFromServiceEndpointParameters = (context: Context = {}) =>
  z.object({
    serviceEndpoint: z
      .string()
      .url()
      .describe("The service endpoint URL to lookup"),
    chainId: z.literal(296).describe("The chain ID (296 for Hedera)"),
    rpcUrl: z
      .string()
      .optional()
      .describe("Optional RPC URL, will use default if not provided"),
  });

const getAgentFromServiceEndpointPrompt = (context: Context = {}) => `
Gets agent details by looking up the service endpoint in the identity registry contract.

Parameters:
- serviceEndpoint: The service endpoint URL to lookup (required)
- chainId: The chain ID - 296 for Hedera (required)
- rpcUrl: Optional RPC URL, will use default if not provided (optional)

The tool will:
1. Set the appropriate RPC URL based on the chain ID
2. Determine the correct registry contract address
3. Query the registry contract using the service endpoint
4. Return the agent information including DID, agent ID, description, and service endpoint

Returns an object with:
- did: The agent's DID
- agentId: The numeric agent ID
- description: The agent's description
- serviceEndPoint: The agent's service endpoint URL
`;

const getAgentFromServiceEndpointExecute = async (
  client: Client,
  context: Context,
  params: z.infer<ReturnType<typeof getAgentFromServiceEndpointParameters>>
) => {
  try {
    const { serviceEndpoint, chainId, rpcUrl } = params;
    const result = await getAgentFromServiceEndpoint(
      serviceEndpoint,
      chainId,
      rpcUrl
    );

    return {
      success: true,
      data: result,
      message: `Successfully retrieved agent for service endpoint: ${serviceEndpoint}`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || String(err),
      message: `Failed to get agent for service endpoint: ${params.serviceEndpoint}`,
    };
  }
};

export const GET_AGENT_FROM_SERVICE_ENDPOINT_TOOL =
  "get_agent_from_service_endpoint";

const tool = (context: Context): Tool => ({
  method: GET_AGENT_FROM_SERVICE_ENDPOINT_TOOL,
  name: "Get Agent From Service Endpoint",
  description: getAgentFromServiceEndpointPrompt(context),
  parameters: getAgentFromServiceEndpointParameters(context) as any,
  execute: getAgentFromServiceEndpointExecute,
});

export default tool;
