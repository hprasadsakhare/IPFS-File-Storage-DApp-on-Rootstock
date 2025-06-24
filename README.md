# IPFS File Storage on Rootstock

This project is a simple decentralized application (dApp) that allows you to upload files to the InterPlanetary File System (IPFS) and store the resulting IPFS hash on the Rootstock blockchain. It provides a user-friendly interface for uploading files, viewing the IPFS hash, and retrieving the hash from the smart contract.

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
