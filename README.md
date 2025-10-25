# Zkred Agent ID Hedera Plugin

A comprehensive Hedera Agent Kit plugin that provides a complete identity management solution for decentralized agents. Built by the Zkred Team, this plugin enables developers to create, manage, and verify digital identities using Privado ID Decentralized Identifiers (DIDs) within Hedera Agent Kit workflows.

The plugin provides seamless integration between Hedera's distributed ledger technology and Zkred's identity management system, offering a full suite of tools for agent identity creation, validation, handshake protocols, and signature verification.

### Installation

```bash
npm install @zkred/hedera-agentid-plugin
```

### Usage

```javascript
import { zkredAgentIdPlugin } from "@zkred/hedera-agentid-plugin";
```

```javascript
const hederaAgentToolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    context: {
      mode: AgentMode.AUTONOMOUS,
    },
    plugins: [
      coreTokenPlugin,
      coreAccountPlugin,
      coreConsensusPlugin,
      coreQueriesPlugin,
      zkredAgentIdPlugin,
    ],
  },
});
```

### Available Tools

This plugin provides 9 comprehensive tools for complete identity management and agent interaction:

| Tool Name                         | Description                                                                  | Method                            |
| --------------------------------- | ---------------------------------------------------------------------------- | --------------------------------- |
| `generate_agent_did`              | Generates a Privado ID DID from an Ethereum address using the iden3 protocol | `generate_agent_did`              |
| `get_publickey_from_did`          | Extracts Ethereum public key from a DID string                               | `get_publickey_from_did`          |
| `create_identity`                 | Creates a new agent identity on the blockchain registry                      | `create_identity`                 |
| `validate_agent`                  | Validates an agent's existence and retrieves details from the registry       | `validate_agent`                  |
| `get_agent_from_service_endpoint` | Gets agent details by looking up the service endpoint in the registry        | `get_agent_from_service_endpoint` |
| `verify_signature`                | Verifies a signature against a DID                                           | `verify_signature`                |
| `generate_signature`              | Generates a signature for a message using a private key                      | `generate_signature`              |
| `initiate_agent_handshake`        | Initiates a handshake between two agents                                     | `initiate_agent_handshake`        |
| `complete_agent_handshake`        | Completes a handshake by signing and sending challenge response              | `complete_agent_handshake`        |

### Tool Details

#### 1. Generate Agent DID

Generates a Privado ID DID from an Ethereum address using the iden3 protocol.

**Parameters:**

- `ethAddress` (string, required): Ethereum address in 0x-prefixed format (20 bytes)
- `chain` (string, required): Chain name (e.g., "polygon", "privado")
- `network` (string, required): Network name (e.g., "amoy", "main")

**Example:**

```javascript
const result = await agent.execute({
  method: "generate_agent_did",
  params: {
    ethAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    chain: "polygon",
    network: "amoy",
  },
});
// Returns: { success: true, did: "did:iden3:polygon:amoy:..." }
```

#### 2. Get Public Key from DID

Extracts the Ethereum public key from a DID string.

**Parameters:**

- `did` (string, required): The DID string to extract public key from

**Example:**

```javascript
const result = await agent.execute({
  method: "get_publickey_from_did",
  params: {
    did: "did:iden3:polygon:amoy:...",
  },
});
// Returns: { success: true, publicKey: "0x..." }
```

#### 3. Create Identity

Creates a new agent identity on the blockchain registry.

**Parameters:**

- `privateKey` (string, required): Private key (0x-prefixed, 64-hex string)
- `chainId` (number, required): Chain ID (296 for Hedera)
- `description` (string, required): Agent description
- `serviceEndpoint` (string, required): Service endpoint URL
- `rpcUrl` (string, optional): Optional RPC URL

**Example:**

```javascript
const result = await agent.execute({
  method: "create_identity",
  params: {
    privateKey: "0x1234567890abcdef...",
    chainId: 296,
    description: "My Agent",
    serviceEndpoint: "https://myagent.com",
  },
});
// Returns: { success: true, txHash: "0x...", did: "did:...", agentId: "123", publicKey: "0x..." }
```

#### 4. Validate Agent

Validates an agent's existence and retrieves details from the registry.

**Parameters:**

- `did` (string, required): The DID string to validate
- `chainId` (number, required): Chain ID (296 for Hedera)
- `rpcUrl` (string, optional): Optional RPC URL

**Example:**

```javascript
const result = await agent.execute({
  method: "validate_agent",
  params: {
    did: "did:iden3:privado:main:...",
    chainId: 296,
  },
});
// Returns: { success: true, data: { did, agentId, description, serviceEndPoint } }
```

#### 5. Get Agent From Service Endpoint

Gets agent details by looking up the service endpoint in the identity registry.

**Parameters:**

- `serviceEndpoint` (string, required): The service endpoint URL to lookup
- `chainId` (number, required): Chain ID (296 for Hedera)
- `rpcUrl` (string, optional): Optional RPC URL

**Example:**

```javascript
const result = await agent.execute({
  method: "get_agent_from_service_endpoint",
  params: {
    serviceEndpoint: "https://myagent.com",
    chainId: 296,
  },
});
// Returns: { success: true, data: { did, agentId, description, serviceEndPoint } }
```

#### 6. Verify Signature

Verifies a signature against a DID.

**Parameters:**

- `sessionId` (string, required): Session identifier
- `challenge` (string, required): Challenge string
- `signature` (string, required): Signature to verify
- `did` (string, required): Decentralized identifier

**Example:**

```javascript
const result = await agent.execute({
  method: "verify_signature",
  params: {
    sessionId: "12345",
    challenge: "challenge_string",
    signature: "0x...",
    did: "did:iden3:privado:main:...",
  },
});
// Returns: { success: true, isValid: true }
```

#### 7. Generate Signature

Generates a signature for a message using a private key.

**Parameters:**

- `privateKey` (string, required): Private key for signing
- `message` (string, required): Message to sign

**Example:**

```javascript
const result = await agent.execute({
  method: "generate_signature",
  params: {
    privateKey: "0x1234567890abcdef...",
    message: "Hello World",
  },
});
// Returns: { success: true, signature: "0x..." }
```

#### 8. Initiate Agent Handshake

Initiates a handshake between two agents.

**Parameters:**

- `initiatorDid` (string, required): DID of the initiating agent
- `initiatorChainId` (number, required): Chain ID for initiator (296 for Hedera)
- `receiverDid` (string, required): DID of the receiving agent
- `receiverChainId` (number, required): Chain ID for receiver (296 for Hedera)
- `initiatorRpcUrl` (string, optional): Optional RPC URL for initiator
- `receiverRpcUrl` (string, optional): Optional RPC URL for receiver

**Example:**

```javascript
const result = await agent.execute({
  method: "initiate_agent_handshake",
  params: {
    initiatorDid: "did:iden3:privado:main:...",
    initiatorChainId: 296,
    receiverDid: "did:iden3:privado:main:...",
    receiverChainId: 296,
  },
});
// Returns: { success: true, handshake: { sessionId, receiverAgentCallbackEndPoint, challenge } }
```

#### 9. Complete Agent Handshake

Completes a handshake by signing and sending challenge response.

**Parameters:**

- `privateKey` (string, required): Private key for signing the challenge
- `sessionId` (string, required): Session ID from handshake initiation
- `receiverAgentCallbackEndPoint` (string, required): Callback endpoint URL
- `challenge` (string, required): Challenge string to be signed

**Example:**

```javascript
const result = await agent.execute({
  method: "complete_agent_handshake",
  params: {
    privateKey: "0x1234567890abcdef...",
    sessionId: "12345",
    receiverAgentCallbackEndPoint: "https://receiver.com/callback",
    challenge: "challenge_string",
  },
});
// Returns: { success: true, handshakeCompleted: true }
```

### Complete Workflow Example

Here's a complete example of how to use the plugin for agent identity management and handshake:

```javascript
// 1. Generate a DID from an Ethereum address
const didResult = await agent.execute({
  method: "generate_agent_did",
  params: {
    ethAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    chain: "privado",
    network: "main",
  },
});

// 2. Create an identity on the blockchain
const identityResult = await agent.execute({
  method: "create_identity",
  params: {
    privateKey: "0x1234567890abcdef...",
    chainId: 296,
    description: "My Agent",
    serviceEndpoint: "https://myagent.com",
  },
});
// identityResult now includes: { txHash, did, agentId, publicKey }

// 3. Validate the created agent
const validationResult = await agent.execute({
  method: "validate_agent",
  params: {
    did: identityResult.did,
    chainId: 296,
  },
});

// 4. Get agent details from service endpoint
const agentFromEndpoint = await agent.execute({
  method: "get_agent_from_service_endpoint",
  params: {
    serviceEndpoint: "https://myagent.com",
    chainId: 296,
  },
});

// 5. Initiate handshake with another agent
const handshakeResult = await agent.execute({
  method: "initiate_agent_handshake",
  params: {
    initiatorDid: identityResult.did,
    initiatorChainId: 296,
    receiverDid: "did:iden3:privado:main:...",
    receiverChainId: 296,
  },
});

// 6. Complete the handshake
const completeResult = await agent.execute({
  method: "complete_agent_handshake",
  params: {
    privateKey: "0x1234567890abcdef...",
    sessionId: handshakeResult.handshake.sessionId,
    receiverAgentCallbackEndPoint:
      handshakeResult.handshake.receiverAgentCallbackEndPoint,
    challenge: handshakeResult.handshake.challenge,
  },
});
```

### Features

- **Complete Identity Management**: Full lifecycle management of decentralized agent identities
- **Cross-chain Identity**: Generate DIDs that work across different blockchain networks
- **Ethereum Integration**: Convert Ethereum addresses to Privado ID format
- **Blockchain Registry**: Create and manage agent identities on Hedera blockchain
- **Agent Validation**: Verify agent existence and retrieve detailed information
- **Secure Handshake Protocol**: Initiate and complete secure agent-to-agent handshakes
- **Digital Signatures**: Generate and verify cryptographic signatures
- **Public Key Management**: Extract and manage public keys from DIDs
- **Verifiable Credentials**: Support for self-sovereign identity (SSI) workflows
- **Hedera Integration**: Seamless integration with Hedera Agent Kit
- **TypeScript Support**: Full TypeScript support with comprehensive type definitions

### Dependencies

- `@hashgraph/sdk`: Hedera SDK for blockchain operations
- `@zkred/agent-id`: Zkred's agent ID SDK
- `bs58`: Base58 encoding for DID generation
- `crc`: Checksum validation
- `ethers`: Ethereum library for cryptographic operations and blockchain interactions
- `hedera-agent-kit`: Core Hedera Agent Kit framework
- `zod`: Schema validation
- `axios`: HTTP client for agent-to-agent communication

### Changelog

#### Version 2.0.1

- **Changed**: Updated the contract address to the latest deployed version for improved stability and compatibility.

#### Version 2.0.0

- **BREAKING**: Updated `create_identity` tool to return `agentId` as string instead of BigInt for better serialization
- **Added**: `create_identity` tool now returns `publicKey` in the response for enhanced identity management
- **Fixed**: Resolved BigInt serialization issues in agent responses
- **Enhanced**: Improved type safety and compatibility with agent frameworks
- **Major**: Significant improvements to identity management and agent integration

#### Version 1.0.3

- **Added**: Service endpoint lookup tool for agent discovery
- **Enhanced**: Improved code formatting and structure
- **Enhanced**: Better error handling and validation

#### Version 1.0.2

- **Added**: Complete identity management suite with 9 comprehensive tools
- **Added**: Agent handshake protocol for secure agent-to-agent communication
- **Added**: Digital signature generation and verification capabilities
- **Added**: Public key extraction from DIDs
- **Added**: Agent validation and registry management
- **Added**: Blockchain identity creation on Hedera network
- **Enhanced**: Comprehensive TypeScript support with full type definitions
- **Enhanced**: Improved error handling and validation across all tools
- **Enhanced**: Better documentation and usage examples

#### Version 1.0.0

- **Initial Release**: Basic DID generation from Ethereum addresses
- **Core Features**: Integration with Hedera Agent Kit
- **Basic Tools**: Generate agent DIDs using iden3 protocol

### License

MIT

### Support

For issues and questions, please visit: https://github.com/Zkred/zkred-agentid-hedera-plugin/issues
