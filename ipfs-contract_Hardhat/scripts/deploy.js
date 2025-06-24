const hre = require("hardhat");

async function main() {
  try {
    console.log("Starting deployment process...");

    // Get the network we're deploying to
    const network = await hre.ethers.provider.getNetwork();
    console.log(`Deploying to network: ${network.name} (chainId: ${network.chainId})`);

    // Get the deployer's addres
    const [deployer] = await hre.ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    // Check deployer's balance
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log(`Account balance: ${hre.ethers.formatEther(balance)} RBTC`);

    // Deploy the contract
    console.log("\nDeploying IPFSHashStorage contract...");
    const IPFSHashStorage = await hre.ethers.getContractFactory("IPFSHashStorage");
    const ipfsStorage = await IPFSHashStorage.deploy();

    // Wait for deployment to complete
    console.log("Waiting for deployment transaction to be mined...");
    await ipfsStorage.waitForDeployment();

    const deployedAddress = await ipfsStorage.getAddress();
    const deployTx = ipfsStorage.deploymentTransaction();

    // Log deployment details
    console.log("\nDeployment successful!");
    console.log("--------------------");
    console.log("Contract Details:");
    console.log("--------------------");
    console.log(`- Address: ${deployedAddress}`);
    console.log(`- Transaction Hash: ${deployTx.hash}`);
    
    // Wait for transaction receipt
    const receipt = await deployTx.wait();
    console.log(`- Gas Used: ${receipt.gasUsed.toString()}`);
    
    // Log verification information
    console.log("\nVerification Links:");
    console.log("--------------------");
    console.log("Contract on RSK Explorer:");
    console.log(`https://explorer.testnet.rootstock.io/address/${deployedAddress}`);
    console.log("\nDeployment Transaction:");
    console.log(`https://explorer.testnet.rootstock.io/tx/${deployTx.hash}`);

    // Save deployment info to a file
    const fs = require("fs");
    const deploymentInfo = {
      network: network.name,
      chainId: Number(network.chainId),
      contractAddress: deployedAddress,
      deploymentHash: deployTx.hash,
      deployer: deployer.address,
      gasUsed: receipt.gasUsed.toString(),
      timestamp: new Date().toISOString()
    };

    fs.writeFileSync(
      "deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\nDeployment information saved to deployment-info.json");

  } catch (error) {
    console.error("\nDeployment failed!");
    console.error(error);
    process.exitCode = 1;
  }
}

// Execute deployment
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 