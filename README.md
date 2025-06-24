# IPFS File Storage on Rootstock

This project is a simple decentralized application (dApp) that allows you to upload files to the InterPlanetary File System (IPFS) and store the resulting IPFS hash on the Rootstock blockchain. It provides a user-friendly interface for uploading files, viewing the IPFS hash, and retrieving the hash from the smart contract.

## Important Notes

### Smart Contract Limitations
The current implementation of the smart contract supports storing only a single IPFS hash at a time. This design choice was made for simplicity and demonstration purposes. For production use, you might want to extend the contract to support:
- Multiple file hashes per user
- Mapping of file names to hashes
- Array of historical hashes
- Batch upload capabilities

Here's a quick example of how you could modify the contract to store multiple hashes:
```solidity
contract ExtendedIPFSHashStorage {
    mapping(address => string[]) private userHashes;
    
    function addIPFSHash(string memory _ipfsHash) public {
        userHashes[msg.sender].push(_ipfsHash);
        emit HashAdded(msg.sender, _ipfsHash);
    }
    
    function getUserHashes() public view returns (string[] memory) {
        return userHashes[msg.sender];
    }
}
```

### Security Considerations
The current contract uses the `onlyOwner` modifier, which means only the contract deployer can store hashes. This is a significant limitation for multi-user applications. Here are some ways to extend the contract for better access control:

1. **Role-Based Access**: Implement OpenZeppelin's `AccessControl` for fine-grained permissions
2. **Pay-Per-Store**: Allow any user to store hashes by paying a small fee
3. **User Registration**: Add a registration system for approved users

Example implementation with multiple access patterns:
```solidity
contract MultiUserIPFSStorage {
    mapping(address => bool) public registeredUsers;
    uint256 public storageFee;
    
    function registerUser(address user) public onlyOwner {
        registeredUsers[user] = true;
    }
    
    function storeHash(string memory _hash) public payable {
        require(registeredUsers[msg.sender] || msg.value >= storageFee, 
                "Must be registered or pay fee");
        // Store hash logic here
    }
}
```

### Why Pinata SDK?
This project uses the `pinata-web3` SDK for several reasons:
1. **Reliability**: Pinata is a trusted IPFS pinning service that ensures your files remain accessible
2. **Speed**: Dedicated IPFS nodes and gateways provide faster access to your files
3. **Simple API**: The SDK provides an easy-to-use interface for file uploads and management
4. **Gateway Services**: Pinata offers dedicated gateways for faster file retrieval

To get started with Pinata:
1. Create an account at [pinata.cloud](https://app.pinata.cloud)
2. Generate an API Key in the API Keys section
3. Copy the JWT token
4. Add the token to your `.env` file as `REACT_APP_PINATA_JWT`

## Features

*   **File Upload to IPFS**: Upload any file to IPFS via a simple drag-and-drop interface.
*   **Store Hash on Rootstock**: Store the IPFS hash on the Rootstock Testnet using a smart contract.
*   **Retrieve Hash from Rootstock**: View the currently stored IPFS hash from the blockchain.
*   **Wallet Integration**: Connect to the dApp using your MetaMask wallet.
*   **Network Validation**: Ensures you are connected to the Rootstock Testnet before making transactions.
*   **Transaction Tracking**: Provides a link to the Rootstock block explorer to track your transaction status.

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Before you begin, make sure you have the following installed:

*   **Node.js and npm**: You can download them from [nodejs.org](https://nodejs.org/).
*   **MetaMask**: A browser extension for managing your Ethereum wallet. You can get it from [metamask.io](https://metamask.io/).

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/ipfs-storage-app.git
    cd ipfs-storage-app
    ```

2.  **Install the dependencies**:
    ```bash
    npm install
    ```

### Configuration

1.  **Set up your Pinata account**:
    *   Go to [pinata.cloud](https://pinata.cloud/) and create a free account.
    *   Navigate to the **API Keys** section and create a new API key.
    *   Copy the **JWT (JSON Web Token)**.

2.  **Create and Configure the `.env` File**

    A `.env` file is used to store "environment variables"—pieces of information your application needs to run that you don't want to hard-code directly in your source code. This is essential for security, especially for secret keys and API credentials.

    *   **Create the file**: In the root directory of the project (the same folder where `package.json` is), create a new file and name it `.env`.

    *   **Add your Pinata JWT**: Open the `.env` file and add your key like this:
        ```
        REACT_APP_PINATA_JWT="your_pinata_jwt_here"
        ```
        Replace `"your_pinata_jwt_here"` with the actual JWT you copied from Pinata.

    *   **Why the `REACT_APP_` prefix?** This project uses Create React App. For security reasons, it only recognizes environment variables that start with `REACT_APP_`. This prevents accidentally exposing sensitive system variables to your frontend code.

    *   **Security First**: The `.env` file is listed in the `.gitignore` file by default, which means Git will ignore it. **Never commit your `.env` file to GitHub or any other version control system.** This ensures your secret keys are not exposed publicly. When you deploy your application, you will need to set the environment variables separately on your hosting provider's platform (see the "Deployment" section).

3.  **Configure MetaMask**:
    *   Open MetaMask and add the **Rootstock Testnet** to your list of networks. You can find the network details [here](https://developers.rsk.co/rsk/node/networks/).
    *   Make sure you have some tRBTC (test RBTC) to pay for transactions. You can get some from the official [Rootstock Faucet](https://faucet.rsk.co/).

## Usage

To run the application locally, use the following command:

```bash
npm start
```

This will open the application in your browser at `http://localhost:3000`.

1.  **Connect your wallet**: Click the "Connect Wallet" button to link your MetaMask wallet to the dApp.
2.  **Choose a file**: Select a file from your computer to upload.
3.  **Upload to IPFS**: Click the "Upload" button. The file will be uploaded to IPFS, and the hash will be displayed.
4.  **Store the hash**: The app will then prompt you to sign a transaction to store the hash on the Rootstock blockchain.
5.  **Retrieve the hash**: You can click the "Get Stored Hash" button at any time to view the latest hash stored in the smart contract.

## Smart Contract

The smart contract for this application is deployed on the Rootstock Testnet at the following address: `0x404881D9B85f7dD0d7BC3bEC88C0B6f41EFDB2E2`.

You can view the contract and its transactions on the [Rootstock Testnet Explorer](https://explorer.testnet.rootstock.io/address/0x404881D9B85f7dD0d7BC3bEC88C0B6f41EFDB2E2).

### ABI (Application Binary Interface)

The ABI is included in the `src/App.js` file and defines how the frontend interacts with the smart contract.

## Smart Contract Deployment

This project uses Hardhat for smart contract deployment. The contract can be deployed using either Hardhat (recommended) or Remix.

### Deploying with Hardhat

1. Install the dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with your private key:
   ```
   PRIVATE_KEY=your_wallet_private_key_here
   ```
   ⚠️ Never commit your private key or share it with anyone!

3. Deploy to Rootstock Testnet:
   ```bash
   npm run deploy:testnet
   ```

   The script will output the contract address and transaction hash, along with links to view them on the RSK Explorer.

### Deploying with Remix (Alternative)

If you prefer using Remix:
1. Copy the contract code from `contracts/IPFSHashStorage.sol`
2. Paste it into Remix IDE
3. Select "Injected Web3" as your environment
4. Ensure your MetaMask is connected to Rootstock Testnet
5. Deploy the contract
6. Copy the deployed contract address and update it in `src/App.js`

## Deployment

To deploy this application, you can use a platform like Vercel or Netlify.

1.  **Build the application**:
    ```bash
    npm run build
    ```
    This will create a `build` directory with the optimized, static files for your application.

2.  **Deploy to Vercel/Netlify**:
    *   Follow the instructions on your chosen platform to deploy a new site.
    *   Connect your Git repository for continuous deployment.
    *   **Important**: Remember to add your `REACT_APP_PINATA_JWT` as an environment variable in your deployment settings.

## Contributing

Contributions are welcome! If you have any ideas, suggestions, or bug reports, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
