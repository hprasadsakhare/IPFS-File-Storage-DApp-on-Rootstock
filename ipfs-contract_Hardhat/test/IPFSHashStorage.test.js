// SPDX-License-Identifier: MIT
// Improved and refactored test suite for IPFSHashStorage smart contract
const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helper constants
const TEST_HASH = "QmTest123";
const TEST_FILE_NAME = "test.txt";

describe("IPFSHashStorage", function () {
  let ipfsStorage, owner, user1, user2;

  // Deploy a fresh contract before each test
  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();
    const IPFSHashStorage = await ethers.getContractFactory("IPFSHashStorage");
    ipfsStorage = await IPFSHashStorage.deploy();
    await ipfsStorage.deployed();
  });

  describe("Deployment", function () {
    it("should set the right owner", async function () {
      expect(await ipfsStorage.owner()).to.equal(owner.address);
    });
    it("should register the owner by default", async function () {
      expect(await ipfsStorage.isUserRegistered(owner.address)).to.equal(true);
    });
  });

  describe("User Registration", function () {
    it("should allow owner to register a new user", async function () {
      await ipfsStorage.registerUser(user1.address);
      expect(await ipfsStorage.isUserRegistered(user1.address)).to.equal(true);
    });
    it("should not allow non-owner to register users", async function () {
      await expect(
        ipfsStorage.connect(user1).registerUser(user2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
    it("should not allow registering already registered users", async function () {
      await ipfsStorage.registerUser(user1.address);
      await expect(
        ipfsStorage.registerUser(user1.address)
      ).to.be.revertedWith("User is already registered");
    });
  });

  describe("User Unregistration", function () {
    beforeEach(async function () {
      await ipfsStorage.registerUser(user1.address);
    });
    it("should allow owner to unregister a user", async function () {
      await ipfsStorage.unregisterUser(user1.address);
      expect(await ipfsStorage.isUserRegistered(user1.address)).to.equal(false);
    });
    it("should not allow unregistering the owner", async function () {
      await expect(
        ipfsStorage.unregisterUser(owner.address)
      ).to.be.revertedWith("Cannot unregister owner");
    });
    it("should not allow non-owner to unregister users", async function () {
      await expect(
        ipfsStorage.connect(user1).unregisterUser(user2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("IPFS Hash Storage", function () {
    beforeEach(async function () {
      await ipfsStorage.registerUser(user1.address);
    });
    it("should allow registered user to add IPFS hash", async function () {
      await ipfsStorage.connect(user1).addIPFSHash(TEST_HASH, TEST_FILE_NAME);
      const files = await ipfsStorage.getUserFiles(user1.address);
      expect(files[0].ipfsHash).to.equal(TEST_HASH);
      expect(files[0].fileName).to.equal(TEST_FILE_NAME);
    });
    it("should not allow unregistered user to add IPFS hash", async function () {
      await expect(
        ipfsStorage.connect(user2).addIPFSHash(TEST_HASH, TEST_FILE_NAME)
      ).to.be.revertedWith("User is not registered");
    });
    it("should not allow empty IPFS hash", async function () {
      await expect(
        ipfsStorage.connect(user1).addIPFSHash("", TEST_FILE_NAME)
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });
    it("should emit HashAdded event", async function () {
      await expect(ipfsStorage.connect(user1).addIPFSHash(TEST_HASH, TEST_FILE_NAME))
        .to.emit(ipfsStorage, "HashAdded")
        .withArgs(user1.address, TEST_HASH, TEST_FILE_NAME);
    });
  });

  describe("File Access", function () {
    beforeEach(async function () {
      await ipfsStorage.registerUser(user1.address);
      await ipfsStorage.connect(user1).addIPFSHash(TEST_HASH, TEST_FILE_NAME);
    });
    it("should allow user to access their own files", async function () {
      const files = await ipfsStorage.connect(user1).getUserFiles(user1.address);
      expect(files.length).to.equal(1);
      expect(files[0].ipfsHash).to.equal(TEST_HASH);
    });
    it("should allow owner to access any user's files", async function () {
      const files = await ipfsStorage.getUserFiles(user1.address);
      expect(files.length).to.equal(1);
      expect(files[0].ipfsHash).to.equal(TEST_HASH);
    });
    it("should not allow other users to access files", async function () {
      await expect(
        ipfsStorage.connect(user2).getUserFiles(user1.address)
      ).to.be.revertedWith("Not authorized");
    });
    it("should return correct file count", async function () {
      expect(await ipfsStorage.getUserFileCount(user1.address)).to.equal(1);
    });
  });
}); 
