import { ethers } from "hardhat";

async function main() {
  const contractFactory = await ethers.getContractFactory("SimpleStaking");
  const simpleStaking = await contractFactory.deploy("SimpleStaking", lpTokenAddress);

  await simpleStaking.deployed();

  console.log("SimpleStaking deployed to:", simpleStaking.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
