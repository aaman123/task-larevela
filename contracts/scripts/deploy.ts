import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const initialSupply = 1_000_000; // 1 million LRT tokens
  const Token = await ethers.getContractFactory("LaRevelaToken");
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log("LaRevelaToken deployed to:", address);
  console.log(`Initial supply: ${initialSupply.toLocaleString()} LRT`);
  console.log("");
  console.log("Add to frontend/.env:");
  console.log(`VITE_CONTRACT_ADDRESS=${address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
