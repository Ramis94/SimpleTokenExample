import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SimpleToken__factory, SimpleToken } from "../typechain";

describe("SimpleTokenTest", function () {
  let simpleToken: SimpleToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const simpleTokenContractFactory = (await ethers.getContractFactory(
      "SimpleToken",
      owner
    )) as SimpleToken__factory;
    simpleToken = await simpleTokenContractFactory.deploy();
    await simpleToken.deployed();
    await simpleToken.mint(100000);
  });

  it("get totalSupply method with mint", async function () {
    expect(await simpleToken.totalSupply()).to.equal(100000);
    await simpleToken.mint(100000);
    expect(await simpleToken.totalSupply()).to.equal(200000);
  });

  it("get totalSupply method with burn", async function () {
    expect(await simpleToken.totalSupply()).to.equal(100000);
    await simpleToken.burn(10000);
    expect(await simpleToken.totalSupply()).to.equal(90000);
  });

  it("transfer", async function () {
    const isTransfer = await simpleToken.transfer(addr1.address, 1000);
    if (isTransfer) {
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(1000);
    } else {
      throw new Error("transfer from " + owner + " to " + addr1);
    }
  });

  it("approve with transferFrom", async function () {
    const approve = await simpleToken.approve(addr1.address, 1000);
    if (approve) {
      expect(
        await simpleToken.allowance(owner.address, addr1.address)
      ).to.equal(1000);
      const transferFrom = await simpleToken.transferFrom(
        owner.address,
        addr1.address,
        100
      );
      if (transferFrom) {
        expect(await simpleToken.allowance(owner.address, addr1.address)).to.equal(900);
        expect(await simpleToken.balanceOf(addr1.address)).to.equal(100);
      } else {
        throw new Error("failed transfer");
      }
    } else {
      throw new Error("failed approve");
    }
  });
});
