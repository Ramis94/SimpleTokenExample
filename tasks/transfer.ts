import { task } from "hardhat/config";

task("transfer", "transfer token")
  .addParam("contract", "The contract address")
  .addParam("recipient", "The recipient address")
  .addParam("amount", "amount")
  .setAction(async (taskArgs, hre) => {
    const amount = hre.ethers.utils.parseEther(taskArgs.amount);
    const contract = await hre.ethers.getContractAt(
      "SimpleToken",
      taskArgs.contract
    );
    console.log(await contract.transfer(taskArgs.recipient, amount));
  });