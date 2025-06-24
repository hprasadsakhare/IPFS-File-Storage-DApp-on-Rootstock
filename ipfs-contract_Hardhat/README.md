# IPFS Hash Storage Smart Contract

A Solidity smart contract for storing IPFS hashes on the Rootstock blockchain. This contract provides multi-user support with role-based access control and comprehensive file management features.

## Features

- **Multi-User Support**
  - User registration system managed by contract owner
  - Each user can store multiple IPFS hashes
  - Users can only access their own files
  - Owner has administrative access to all files

- **File Management**
  - Store IPFS hashes with associated metadata
  - Track file names and timestamps
  - Retrieve file history per user
  - Get file count statistics

- **Access Control**
  - Owner-controlled user registration
  - Role-based access to functions
  - Protected file access
  - Unregistration protection for owner

- **Gas Optimization**
  - Optimized storage patterns
  - Efficient data structures
  - Gas usage reports in tests

## Contract Details

### Core Functions

```solidity
// User Management
function registerUser(address user) external onlyOwner
function unregisterUser(address user) external onlyOwner
function isUserRegistered(address user) external view returns (bool)

// File Management
function addIPFSHash(string memory ipfsHash, string memory fileName) external onlyRegistered
function getUserFiles(address user) external view returns (FileInfo[] memory)
function getUserFileCount(address user) external view returns (uint256)
```

### Events

```solidity
event HashAdded(address indexed user, string ipfsHash, string fileName)
event UserRegistered(address indexed user)
event UserUnregistered(address indexed user)
```

### Gas Usage (from tests)
- Contract Deployment: ~726,070 gas
- Add IPFS Hash: ~140,240 gas
- Register User: ~47,472 gas
- Unregister User: ~25,649 gas

## Development Setup

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd ipfs-contract
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file:
   ```
   # Your wallet private key (without 0x prefix)
   PRIVATE_KEY=your_private_key_here
   ```

3. **Compile Contract**
   ```bash
   npx hardhat compile
   ```

4. **Run Tests**
   ```bash
   npx hardhat test
   ```

## Deployment

### To Rootstock Testnet

1. **Ensure Wallet Setup**
   - Have sufficient tRBTC in your wallet
   - Private key configured in `.env`

2. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy.js --network rsktestnet
   ```

3. **Deployment Output**
   The script will:
   - Log deployment details
   - Save deployment info to `deployment-info.json`
   - Provide RSK Explorer links
   - Show gas usage statistics

### Deployment Information
The `deployment-info.json` file will contain:
```json
{
  "network": "rsktestnet",
  "chainId": 31,
  "contractAddress": "deployed_contract_address",
  "deploymentHash": "transaction_hash",
  "deployer": "deployer_address",
  "gasUsed": "gas_used",
  "timestamp": "deployment_time"
}
```

## Testing

The test suite covers:

1. **Deployment Tests**
   - Owner assignment
   - Initial state verification

2. **User Management Tests**
   - Registration functionality
   - Unregistration checks
   - Access control validation

3. **File Storage Tests**
   - IPFS hash storage
   - File metadata handling
   - Event emission

4. **Access Control Tests**
   - User permissions
   - Owner privileges
   - Unauthorized access prevention

Run the full test suite:
```bash
npx hardhat test
```

## Security Considerations

1. **Access Control**
   - Only registered users can store hashes
   - Only owner can manage users
   - Users can only access their own files
   - Owner has full administrative access

2. **Data Validation**
   - Empty IPFS hash prevention
   - Duplicate registration checks
   - Owner protection from unregistration

3. **Gas Optimization**
   - Efficient storage patterns
   - Optimized function execution
   - Reasonable gas limits

## Network Configuration

The contract is configured for Rootstock Testnet with the following settings:
```javascript
{
  url: "https://public-node.testnet.rsk.co",
  chainId: 31,
  gasPrice: 0.06e9, // 0.06 gwei
  timeout: 300000   // 5 minutes
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support and questions:
1. Open an issue in the repository
2. Contact the development team
3. Check the [Rootstock Documentation](https://developers.rsk.co/) 