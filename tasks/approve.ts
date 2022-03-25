import { task } from "hardhat/config";

task("approve", "approve")
  .addParam("contract", "The contract address")
  .addParam("spender", "Spender address")
  .addParam("amount", "amount")
  .setAction(async (taskArgs, hre) => {
    const amount = hre.ethers.utils.parseEther(taskArgs.amount);
    const contract = await hre.ethers.getContractAt(
      "SimpleToken",
      taskArgs.contract
    );
    console.log(await contract.transfer(taskArgs.spender, amount));
  });
