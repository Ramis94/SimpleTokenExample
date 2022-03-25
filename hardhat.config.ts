import * as dotenv from "dotenv";

import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-web3";
import "@typechain/hardhat";
import "solidity-coverage";
import "./tasks/approve.ts";
import "./tasks/claim.ts";
import "./tasks/stake.ts";
import "./tasks/transfer.ts";
import "./tasks/transferFrom.ts";
import "./tasks/unstake.ts";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.4",
  networks: {
    rinkeby: {
      url: process.env.RENKEBY_URL || "",
      accounts:
        process.env.MNEMONIC !== undefined
          ? { mnemonic: process.env.MNEMONIC }
          : [],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
