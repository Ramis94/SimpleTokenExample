import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SimpleToken__factory, SimpleToken } from "../typechain";

describe("SimpleTokenTest", function() {
  let simpleToken: SimpleToken;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function() {
    [owner, addr1] = await ethers.getSigners();

    const simpleTokenContractFactory = (await ethers.getContractFactory(
      "SimpleToken",
      owner
    )) as SimpleToken__factory;
    simpleToken = await simpleTokenContractFactory.deploy("SimpleToken", "ST");
    await simpleToken.deployed();
    await simpleToken.mint(100000);
  });

  it("get name", async function() {
    expect(await simpleToken.name()).to.equal("SimpleToken");
  });

  it("get symbol", async function() {
    expect(await simpleToken.symbol()).to.equal("ST");
  });

  it("get decimals", async function() {
    expect(await simpleToken.decimals()).to.equal(18);
  });

  it("get totalSupply method with mint", async function() {
    expect(await simpleToken.totalSupply()).to.equal(100000);
    await simpleToken.mint(100000);
    expect(await simpleToken.totalSupply()).to.equal(200000);
  });

  it("get totalSupply method with burn", async function() {
    expect(await simpleToken.totalSupply()).to.equal(100000);
    await simpleToken.burn(10000);
    expect(await simpleToken.totalSupply()).to.equal(90000);
  });

  it("transfer", async function() {
    const isTransfer = await simpleToken.transfer(addr1.address, 1000);
    if (isTransfer) {
      expect(await simpleToken.balanceOf(addr1.address)).to.equal(1000);
    } else {
      throw new Error("transfer from " + owner + " to " + addr1);
    }
  });

  it("approve with transferFrom", async function() {
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

  it("transfer if from is zero", async function() {
    let error;
    try {
      await simpleToken.transferFrom("0x0000000000000000000000000000000000000000", addr1.address, 123);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an("Error");
    // @ts-ignore
    expect(error.message).contains("'transfer 'from' the zero address'");
  });

  it("transfer if to is zero", async function() {
    let error;
    try {
      await simpleToken.transferFrom(
        owner.address,
        "0x0000000000000000000000000000000000000000",
        123
      );
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an("Error");
    // @ts-ignore
    expect(error.message).contains("'transfer 'to' the zero address'");
  });

  it("transfer amount exceeds balance", async function() {
    let error;
    try {
      const amount = (await owner.getBalance()).add(1);
      await simpleToken.transferFrom(owner.address, addr1.address, amount);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an("Error");
    // @ts-ignore
    expect(error.message).contains("transfer amount exceeds balance");
  });

  it("transferFrom without approve", async function() {
    let error;
    try {
      await simpleToken.transferFrom(owner.address, addr1.address, 123);
    } catch (e) {
      error = e;
    }
    expect(error).to.be.an("Error");
    // @ts-ignore
    expect(error.message).contains("insufficient allowance");
  });
});
