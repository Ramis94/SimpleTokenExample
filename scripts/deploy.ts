import { ethers } from "hardhat";

async function main() {
  const contractFactory = await ethers.getContractFactory("SimpleToken");
  const simpleToken = await contractFactory.deploy("SimpleToken", "ST");

  await simpleToken.deployed();

  console.log("SimpleToken deployed to:", simpleToken.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
