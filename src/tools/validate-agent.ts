import { z } from "zod";
import { ethers } from "ethers";
import { Context, Tool } from "hedera-agent-kit";
import { Client } from "@hashgraph/sdk";
import { setRpcUrl } from "../utils";
import { IDENTITY_REGISTRY_HEDERA } from "../constant";
import identityRegistryABI from "../contracts/IndentityRegistry.json";
import { getETHPublicKeyFromDID } from "./get-publickey-from-did";

/**
* Validate an agent's existence and retrieve its details from the identity registry
* @param did - The DID string to validate
* @param chainId - The chain ID (296 for Hedera)
* @param rpcUrl - Optional RPC URL, will use default if not provided
* @returns Agent details including DID, agent ID, description, and service endpoint
*/
export async function validateAgent(
    did: string,
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
        let REGISTRY_CONTRACT = IDENTITY_REGISTRY_HEDERA
        
        const ethAddress = getETHPublicKeyFromDID(did);
        if (!ethAddress) {
            throw new Error("Failed to extract Ethereum address from DID");
        }
        
        const provider = new ethers.JsonRpcProvider(rpcUrl as string);
        const registry = new ethers.Contract(
            REGISTRY_CONTRACT,
            identityRegistryABI.abi,
            provider
        );
        
        const agentDetails = await registry.getAgentByAddress(ethAddress);
        
        return {
            did: agentDetails[0],
            agentId: Number(agentDetails[1]),
            description: agentDetails[2],
            serviceEndPoint: agentDetails[3],
        };
    } catch (err: any) {
        console.warn("Error in validateAgent:", err.message || err);
        throw err;
    }
}

/* Zod schema for parameters */
export const validateAgentParameters = (context: Context = {}) =>
    z.object({
    did: z
    .string()
    .min(1)
    .describe("The DID string to validate"),
    chainId: z
    .literal(296)
    .describe("The chain ID (296 for Hedera)"),
    rpcUrl: z
    .string()
    .optional()
    .describe("Optional RPC URL, will use default if not provided"),
});

const validateAgentPrompt = (context: Context = {}) => `
Validates an agent's existence and retrieves its details from the identity registry contract.

Parameters:
- did: The DID string to validate (required)
- chainId: The chain ID - 296 for Hedera (required)
- rpcUrl: Optional RPC URL, will use default if not provided (optional)

The tool will:
1. Set the appropriate RPC URL based on the chain ID
2. Determine the correct registry contract address
3. Extract the Ethereum address from the DID
4. Query the registry contract to get agent details
5. Return the agent information including DID, agent ID, description, and service endpoint

Returns an object with:
- did: The agent's DID
- agentId: The numeric agent ID
- description: The agent's description
- serviceEndPoint: The agent's service endpoint URL
`;

const validateAgentExecute = async (
    client: Client,
    context: Context,
    params: z.infer<ReturnType<typeof validateAgentParameters>>
) => {
    try {
        const { did, chainId, rpcUrl } = params;
        const result = await validateAgent(did, chainId, rpcUrl);
        
        return { 
            success: true, 
            data: result,
            message: `Successfully validated agent with DID: ${did}`
        };
    } catch (err: any) {
        return { 
            success: false, 
            error: err.message || String(err),
            message: `Failed to validate agent with DID: ${params.did}`
        };
    }
};

export const VALIDATE_AGENT_TOOL = "validate_agent";

const tool = (context: Context): Tool => ({
    method: VALIDATE_AGENT_TOOL,
    name: "Validate Agent",
    description: validateAgentPrompt(context),
    parameters: validateAgentParameters(context) as any,
    execute: validateAgentExecute,
});

export default tool;