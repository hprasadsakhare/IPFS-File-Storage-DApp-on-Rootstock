// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IPFSHashStorage
 * @dev A contract for storing IPFS hashes with multi-user support and access control
 */
contract IPFSHashStorage {
    struct FileInfo {
        string ipfsHash;
        string fileName;
        uint256 timestamp;
        bool exists;
    }

    // Contract owner
    address public owner;
    
    // Mapping from user address to their file hashes
    mapping(address => FileInfo[]) private userFiles;
    
    // Mapping to track registered users
    mapping(address => bool) public registeredUsers;
    
    // Events
    event HashAdded(address indexed user, string ipfsHash, string fileName);
    event UserRegistered(address indexed user);
    event UserUnregistered(address indexed user);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "User is not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        registeredUsers[msg.sender] = true; // Register owner by default
        emit UserRegistered(msg.sender);
    }

    /**
     * @dev Register a new user
     * @param user Address of the user to register
     */
    function registerUser(address user) external onlyOwner {
        require(!registeredUsers[user], "User is already registered");
        registeredUsers[user] = true;
        emit UserRegistered(user);
    }

    /**
     * @dev Unregister a user
     * @param user Address of the user to unregister
     */
    function unregisterUser(address user) external onlyOwner {
        require(user != owner, "Cannot unregister owner");
        require(registeredUsers[user], "User is not registered");
        registeredUsers[user] = false;
        emit UserUnregistered(user);
    }

    /**
     * @dev Add a new IPFS hash
     * @param ipfsHash The IPFS hash to store
     * @param fileName Name of the file (for reference)
     */
    function addIPFSHash(string memory ipfsHash, string memory fileName) external onlyRegistered {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        userFiles[msg.sender].push(FileInfo({
            ipfsHash: ipfsHash,
            fileName: fileName,
            timestamp: block.timestamp,
            exists: true
        }));
        
        emit HashAdded(msg.sender, ipfsHash, fileName);
    }

    /**
     * @dev Get all files for a specific user
     * @param user Address of the user
     * @return Array of FileInfo structs
     */
    function getUserFiles(address user) external view returns (FileInfo[] memory) {
        require(msg.sender == user || msg.sender == owner, "Not authorized");
        return userFiles[user];
    }

    /**
     * @dev Get the number of files stored by a user
     * @param user Address of the user
     * @return Number of files
     */
    function getUserFileCount(address user) external view returns (uint256) {
        return userFiles[user].length;
    }

    /**
     * @dev Check if a user is registered
     * @param user Address to check
     * @return bool indicating if user is registered
     */
    function isUserRegistered(address user) external view returns (bool) {
        return registeredUsers[user];
    }
} 