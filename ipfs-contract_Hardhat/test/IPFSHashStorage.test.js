const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IPFSHashStorage", function () {
  let IPFSHashStorage;
  let ipfsStorage;
  let owner;
  let user1;
  let user2;
  const testHash = "QmTest123";
  const testFileName = "test.txt";

  beforeEach(async function () {
    // Get signers
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy contract
    IPFSHashStorage = await ethers.getContractFactory("IPFSHashStorage");
    ipfsStorage = await IPFSHashStorage.deploy();
    await ipfsStorage.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await ipfsStorage.owner()).to.equal(owner.address);
    });

    it("Should register the owner by default", async function () {
      expect(await ipfsStorage.isUserRegistered(owner.address)).to.equal(true);
    });
  });

  describe("User Registration", function () {
    it("Should allow owner to register a new user", async function () {
      await ipfsStorage.registerUser(user1.address);
      expect(await ipfsStorage.isUserRegistered(user1.address)).to.equal(true);
    });

    it("Should not allow non-owner to register users", async function () {
      await expect(
        ipfsStorage.connect(user1).registerUser(user2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should not allow registering already registered users", async function () {
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

    it("Should allow owner to unregister a user", async function () {
      await ipfsStorage.unregisterUser(user1.address);
      expect(await ipfsStorage.isUserRegistered(user1.address)).to.equal(false);
    });

    it("Should not allow unregistering the owner", async function () {
      await expect(
        ipfsStorage.unregisterUser(owner.address)
      ).to.be.revertedWith("Cannot unregister owner");
    });

    it("Should not allow non-owner to unregister users", async function () {
      await expect(
        ipfsStorage.connect(user1).unregisterUser(user2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });

  describe("IPFS Hash Storage", function () {
    beforeEach(async function () {
      await ipfsStorage.registerUser(user1.address);
    });

    it("Should allow registered user to add IPFS hash", async function () {
      await ipfsStorage.connect(user1).addIPFSHash(testHash, testFileName);
      const files = await ipfsStorage.getUserFiles(user1.address);
      expect(files[0].ipfsHash).to.equal(testHash);
      expect(files[0].fileName).to.equal(testFileName);
    });

    it("Should not allow unregistered user to add IPFS hash", async function () {
      await expect(
        ipfsStorage.connect(user2).addIPFSHash(testHash, testFileName)
      ).to.be.revertedWith("User is not registered");
    });

    it("Should not allow empty IPFS hash", async function () {
      await expect(
        ipfsStorage.connect(user1).addIPFSHash("", testFileName)
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("Should emit HashAdded event", async function () {
      await expect(ipfsStorage.connect(user1).addIPFSHash(testHash, testFileName))
        .to.emit(ipfsStorage, "HashAdded")
        .withArgs(user1.address, testHash, testFileName);
    });
  });

  describe("File Access", function () {
    beforeEach(async function () {
      await ipfsStorage.registerUser(user1.address);
      await ipfsStorage.connect(user1).addIPFSHash(testHash, testFileName);
    });

    it("Should allow user to access their own files", async function () {
      const files = await ipfsStorage.connect(user1).getUserFiles(user1.address);
      expect(files.length).to.equal(1);
      expect(files[0].ipfsHash).to.equal(testHash);
    });

    it("Should allow owner to access any user's files", async function () {
      const files = await ipfsStorage.getUserFiles(user1.address);
      expect(files.length).to.equal(1);
      expect(files[0].ipfsHash).to.equal(testHash);
    });

    it("Should not allow other users to access files", async function () {
      await expect(
        ipfsStorage.connect(user2).getUserFiles(user1.address)
      ).to.be.revertedWith("Not authorized");
    });

    it("Should return correct file count", async function () {
      expect(await ipfsStorage.getUserFileCount(user1.address)).to.equal(1);
    });
  });
}); 