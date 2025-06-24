import React, { useState, useEffect } from "react";
import { pinata } from "./config";
import { ethers } from "ethers";
import "./App.css";

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [ipfsHash, setIpfsHash] = useState("");
  const [storedHash, setStoredHash] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isUploading, setIsUploading] = useState(false);
  const [account, setAccount] = useState(null);

  // Replace these with your deployed contract's details
  const contractAddress = "0x404881D9B85f7dD0d7BC3bEC88C0B6f41EFDB2E2";
  const contractABI = [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "setter",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "hash",
          "type": "string"
        }
      ],
      "name": "HashSet",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_ipfsHash",
          "type": "string"
        }
      ],
      "name": "setIPFSHash",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getIPFSHash",
      "outputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  const checkNetwork = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const { chainId } = await provider.getNetwork();
        // Rootstock Testnet Chain ID is 31 (0x1f in hex)
        if (chainId !== 31) {
          setStatus({ type: "error", message: "Please connect to the Rootstock Testnet." });
          return false;
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error checking network:", error);
      setStatus({ type: "error", message: "Could not check network. Please ensure MetaMask is installed and configured." });
      return false;
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        setStatus({ type: "error", message: "MetaMask is not installed. Please install it to use this app." });
        return;
      }
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setStatus({ type: "success", message: "Wallet connected successfully." });
      } else {
        setStatus({ type: "error", message: "No authorized account found." });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setStatus({ type: "error", message: "Failed to connect wallet." });
    }
  };

  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      const { ethereum } = window;
      if (!ethereum) {
        return;
      } else {
         ethereum.on('chainChanged', (_chainId) => window.location.reload());
         ethereum.on('accountsChanged', (_accounts) => window.location.reload());
      }
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      if (accounts.length !== 0) {
        setAccount(accounts[0]);
        await checkNetwork();
      }
    };
    checkIfWalletIsConnected();
  }, []);

  const changeHandler = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setStatus({ type: "info", message: `Selected file: ${file.name}` });
    }
  };

  const handleSubmission = async () => {
    try {
      if (!selectedFile) {
        setStatus({ type: "error", message: "Please select a file first" });
        return;
      }

      setIsUploading(true);
      setStatus({ type: "info", message: "Uploading file to IPFS..." });

      const response = await pinata.upload.file(selectedFile);
      const ipfsHash = response.IpfsHash;
      setIpfsHash(ipfsHash);
      setStatus({ type: "success", message: "File uploaded successfully to IPFS!" });

      await storeHashOnBlockchain(ipfsHash);
    } catch (error) {
      console.error("File upload failed:", error);
      setStatus({ type: "error", message: "Upload failed. Please try again." });
    } finally {
      setIsUploading(false);
    }
  };

  const storeHashOnBlockchain = async (hash) => {
    try {
      if (!account) {
        await connectWallet();
        // connectWallet will set the account state, but we need it now
        // so we re-check it, this is a bit of a workaround for state update delay
        const { ethereum } = window;
        if(ethereum){
          const accounts = await ethereum.request({ method: 'eth_accounts' });
          if(accounts.length === 0){
             setStatus({ type: "error", message: "Please connect your wallet to store the hash." });
             return;
          }
        }
      }

      if (!(await checkNetwork())) {
        return;
      }

      setStatus({ type: "info", message: "Storing hash on blockchain..." });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      const tx = await contract.setIPFSHash(hash);
      
      const explorerUrl = `https://explorer.testnet.rootstock.io/tx/${tx.hash}`;
      setStatus({
        type: "info",
        message: (
          <span>
            Waiting for transaction confirmation...
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer" style={{color: 'blue', marginLeft: '5px'}}>
              View on Rootstock Explorer
            </a>
          </span>
        )
      });

      await tx.wait();

      setStatus({ type: "success", message: "Hash stored on blockchain successfully!" });
    } catch (error) {
      console.error("Failed to store IPFS hash on blockchain:", error);
      let errorMessage = "Failed to store hash on blockchain.";
      if (error.reason) {
        errorMessage += ` Reason: ${error.reason}`;
      } else if (error.message) {
        errorMessage += ` Reason: ${error.message}`;
      }
      setStatus({ type: "error", message: errorMessage });
    }
  };

  const retrieveHashFromBlockchain = async () => {
    try {
      if (!(await checkNetwork())) {
        return;
      }
      setStatus({ type: "info", message: "Retrieving hash from blockchain..." });
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, contractABI, provider);

      const retrievedHash = await contract.getIPFSHash();
      
      if (retrievedHash) {
        setStoredHash(retrievedHash);
        setStatus({ type: "success", message: "Hash retrieved successfully!" });
      } else {
        setStoredHash("");
        setStatus({ type: "info", message: "No IPFS hash has been stored in this contract yet." });
      }

    } catch (error) {
      console.error("Failed to retrieve IPFS hash from blockchain:", error);
      setStoredHash("");

      if (error.code === 'CALL_EXCEPTION') {
        setStatus({ type: "info", message: "No hash has been stored in the contract yet." });
      } else {
        let errorMessage = "Failed to retrieve hash from blockchain.";
        if (error.reason) {
          errorMessage += ` Reason: ${error.reason}`;
        } else if (error.message) {
          errorMessage += ` Reason: ${error.message}`;
        }
        setStatus({ type: "error", message: errorMessage });
      }
    }
  };

  return (
    <div className="app-container">
      <div className="wallet-connector">
        {!account ? (
          <button onClick={connectWallet} className="submit-button">
            Connect Wallet
          </button>
        ) : (
          <p className="wallet-address">Connected: {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}</p>
        )}
      </div>

      <h1 style={{ color: 'var(--primary-orange)', textAlign: 'center', marginBottom: '2rem' }}>
        IPFS File Storage
      </h1>

      <div className="upload-section">
        <label className="form-label">Upload File to IPFS</label>
        <div className="buttons-container">
          <label className="file-input-label">
            Choose File
            <input type="file" onChange={changeHandler} className="file-input" />
          </label>
          <button 
            onClick={handleSubmission} 
            className="submit-button"
            disabled={isUploading || !account}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        {selectedFile && (
          <div className="file-info">
            <p>Selected File: {selectedFile.name}</p>
            <p>Size: {(selectedFile.size / 1024).toFixed(2)} KB</p>
          </div>
        )}

        {status.message && (
          <div className={`status-message ${status.type}`}>
            {typeof status.message === 'string' ? status.message : <>{status.message}</>}
          </div>
        )}

        {ipfsHash && (
          <div className="result-section">
            <p>
              <strong>IPFS Hash:</strong>
              <span className="hash-display">{ipfsHash}</span>
            </p>
          </div>
        )}
      </div>

      <div className="retrieve-section">
        <h2 style={{ color: 'var(--primary-orange)', marginBottom: '1rem' }}>
          Retrieve Stored Hash
        </h2>
        <button onClick={retrieveHashFromBlockchain} className="retrieve-button" disabled={!account}>
          Get Stored Hash
        </button>
        {storedHash && (
          <div className="result-section">
            <p>
              <strong>Stored IPFS Hash:</strong>
              <span className="hash-display">{storedHash}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;


//https://gateway.pinata.cloud/ipfs/