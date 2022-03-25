import { ethers } from "hardhat";

async function main() {
  const contractFactory = await ethers.getContractFactory("SimpleStaking");
  const simpleStaking = await contractFactory.deploy(
    "0x5bd2689f837d78a82f15b372129628a1c44b27fe"
  );

  await simpleStaking.deployed();

  console.log("SimpleStaking deployed to:", simpleStaking.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
