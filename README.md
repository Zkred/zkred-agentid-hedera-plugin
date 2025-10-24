# Zkred Agent ID Hedera Plugin

This plugin was built by the Zkred Team for the Hedera Agent Kit. It was built to enable developers to generate Privado ID Decentralized Identifiers (DIDs) from Ethereum addresses using the @zkred/agent-id SDK within Hedera Agent Kit workflows.

The plugin provides seamless integration between Hedera's distributed ledger technology and Zkred's identity management system, allowing for the creation of verifiable digital identities that can be used across different blockchain networks.

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

### Functionality

This plugin provides tools for generating Privado ID DIDs from Ethereum addresses, enabling cross-chain identity management and verifiable credentials.

**Zkred Agent ID Plugin**
_Generate Privado ID DIDs from Ethereum addresses for cross-chain identity management_

| Tool Name            | Description                                                                  | Usage                                                                        |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `generate_agent_did` | Generates a Privado ID DID from an Ethereum address using the iden3 protocol | `generate_agent_did(ethAddress: "0x...", chain: "polygon", network: "amoy")` |

#### Parameters

- **ethAddress** (string, required): Ethereum address in 0x-prefixed format (20 bytes)
- **chain** (string, required): Chain name (e.g., "polygon", "privado")
- **network** (string, required): Network name (e.g., "amoy", "main")

#### Example Usage

```javascript
// Generate a DID for a Polygon address on Amoy testnet
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

### Features

- **Cross-chain Identity**: Generate DIDs that work across different blockchain networks
- **Ethereum Integration**: Convert Ethereum addresses to Privado ID format
- **Verifiable Credentials**: Support for self-sovereign identity (SSI) workflows
- **Hedera Integration**: Seamless integration with Hedera Agent Kit

### Dependencies

- `@hashgraph/sdk`: Hedera SDK for blockchain operations
- `@zkred/agent-id`: Zkred's agent ID SDK
- `bs58`: Base58 encoding for DID generation
- `crc`: Checksum validation
- `hedera-agent-kit`: Core Hedera Agent Kit framework
- `zod`: Schema validation

### License

MIT

### Support

For issues and questions, please visit: https://github.com/Zkred/zkred-agentid-hedera-plugin/issues
