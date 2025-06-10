# 🧬 MCP Core
MCP Core is the reference implementation of the Model Context Protocol — a lightweight, zk- and chain-friendly system for verifiable, composable model context commitments onchain.

### It glues together three simple artifacts:
- 🧠 Model Hash — SHA-256 / Blake3 digest of model weights or prompt
- 📄 Context Manifest — JSON metadata (datasets, hyperparameters, license, etc.)
- 🔐 Proof Stub — zk-friendly cryptographic commitment (Poseidon, Keccak, Rescue)
Built for composability, speed, and low-gas operations across EVM and non-EVM chains.

## 🌐 What is MCP?
The Model Context Protocol (MCP) defines a minimal, verifiable, and gas-efficient standard for binding AI model metadata to onchain identities.

### It enables features like:
- Onchain agent memory
- Auditable model registries
- Context-linked NFTs
- DAO explainers & context badges

## 🔧 Contracts Overview
It allows users to:
- putContext(bytes32 modelHash, bytes32 contextCID)
- getContext(address agent) → (modelHash, contextCID)

The contract is chain-agnostic but optimized for low gas on EVM via hash precompiles.

## ✍️ Example: putContext()
```
const modelHash = ethers.utils.sha256("gpt-weights-v1");
const contextCID = ethers.utils.sha256("manifest.json");

await contextStore.putContext(modelHash, contextCID);
```
All context is stored onchain as hash commitments — raw data remains offchain and private.

## 🧠 MCP Use Cases
Explore dApps built with MCP:
- Contextual GPT Agent w/ Wallet Memory
- DAO Proposal Explainer
- AI Chat History NFT
- Mintable AI Agents
- Verifiable Context Badges

See roadmap → https://z1labs.ai/roadmap