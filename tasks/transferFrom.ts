import { task } from "hardhat/config";

task("transferFrom", "transferFrom")
  .addParam("contract", "The contract address")
  .addParam("sender", "The sender address")
  .addParam("recipient", "The recipient address")
  .addParam("amount", "amount")
  .setAction(async (taskArgs, hre) => {
    const amount = hre.ethers.utils.parseEther(taskArgs.amount);
    const contract = await hre.ethers.getContractAt(
      "SimpleToken",
      taskArgs.contract
    );
    const result = await contract.transferFrom(
      taskArgs.sender,
      taskArgs.recipient,
      amount
    );
    console.log("result: " + result);
  });
