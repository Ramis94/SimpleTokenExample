import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SimpleStaking__factory, LPMock, SimpleStaking, LPMock__factory } from "../typechain";
import { describe } from "mocha";

const helper = require("@openzeppelin/test-helpers");

describe("SimpleTokenTest", function() {
  let lpMockToken: LPMock;
  let simpleStaking: SimpleStaking;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;

  beforeEach(async function() {
    [owner, addr1] = await ethers.getSigners();

    const LPMockContractFactory = (await ethers.getContractFactory(
      "LPMock",
      owner
    )) as LPMock__factory;
    lpMockToken = await LPMockContractFactory.deploy("LP", "LP");
    await lpMockToken.deployed();

    const simpleStakingFactory = (await ethers.getContractFactory(
      "SimpleStaking",
      owner
    )) as SimpleStaking__factory;
    simpleStaking = await simpleStakingFactory.deploy(
      lpMockToken.address
    );
    await simpleStaking.deployed;

    Promise.all([
      lpMockToken.mint(owner.address, ethers.utils.parseEther("12")),
      lpMockToken.mint(addr1.address, ethers.utils.parseEther("23"))
    ]);
  });

  describe("Staking", function() {
    it("should stake zero amount", async function() {
      await expect(simpleStaking.stake(0)).to.be.revertedWith(
        "SimpleStaking: Cannot stake nothing"
      );
    });

    it("should revert stake without allowance", async function() {
      const toTransfer = ethers.utils.parseEther("1");
      await expect(simpleStaking.connect(addr1).stake(toTransfer))
        .to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should stake", async function() {
      const toTransfer = ethers.utils.parseEther("3");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toTransfer);
      expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.balance.toString())
      ).to.equal("0");

      await expect(simpleStaking.connect(addr1).stake(toTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toTransfer);

      expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.balance.toString())
      ).to.equal(toTransfer);
    });

    it("should double stake without interval", async function() {
      const toFirstTransfer = ethers.utils.parseEther("4");
      const toSecondTransfer = ethers.utils.parseEther("6");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toFirstTransfer.add(toSecondTransfer));
      expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.balance.toString())
      ).to.equal("0");
      await expect(simpleStaking.connect(addr1).stake(toFirstTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toFirstTransfer);

      await expect(simpleStaking.connect(addr1).stake(toSecondTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toSecondTransfer);
      expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.balance.toString())
      ).to.equal(toFirstTransfer.add(toSecondTransfer));
    });

    it("should double stake with interval 1 hour", async function() {
      const toFirstTransfer = ethers.utils.parseEther("4");
      const toSecondTransfer = ethers.utils.parseEther("6");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toFirstTransfer.add(toSecondTransfer));
      expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.balance.toString())
      ).to.equal("0");
      await expect(simpleStaking.connect(addr1).stake(toFirstTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toFirstTransfer);
      await helper.time.increase(3600);
      await expect(simpleStaking.connect(addr1).stake(toSecondTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toSecondTransfer);
      await simpleStaking
        .stakers(addr1.address)
        .then((value) => {
          expect(value.balance.toString()).to.equal(
            toFirstTransfer.add(toSecondTransfer)
          );
          expect(value.claimedReward.toString()).to.not.equal("0.0");
        });
    });
  });

  describe("Unstaking", function() {
    it("unstake after 20 minutes", async function() {
      const toTransfer = ethers.utils.parseEther("3");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toTransfer);
      await expect(simpleStaking.connect(addr1).stake(toTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toTransfer);
      await helper.time.increase(21 * 60);
      await expect(simpleStaking.connect(addr1).unstake())
        .to.emit(simpleStaking, "Unstake")
        .withArgs(addr1.address, toTransfer);
    });
    it("if unstake in the next 20 minutes after stake", async function() {
      const toTransfer = ethers.utils.parseEther("3");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toTransfer);
      await expect(simpleStaking.connect(addr1).stake(toTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toTransfer);
      await expect(simpleStaking.connect(addr1).unstake())
        .to.be.revertedWith("SimpleStaking: function unstake will be available");
    });
    it("if nothing unstake", async function() {
      await expect(simpleStaking.connect(addr1).unstake())
        .to.be.revertedWith("SimpleStaking: Nothing to unstake");
    });
  });

  describe("Claim", function() {
    it("claim in the next 10 minutes after stake", async function() {
      const toTransfer = ethers.utils.parseEther("3");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toTransfer);
      await expect(simpleStaking.connect(addr1).stake(toTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toTransfer);
      await expect(simpleStaking.connect(addr1).claim())
        .to.be.revertedWith("SimpleStaking: function claim will be available");
    });
    it("claim after 10 minutes after stake", async function() {
      const toTransfer = ethers.utils.parseEther("3");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toTransfer);
      await expect(simpleStaking.connect(addr1).stake(toTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toTransfer);
      await helper.time.increase(11 * 60);
      await expect(simpleStaking.connect(addr1).claim())
        .to.emit(simpleStaking, "Claim");
    });
    it("claim after double stake with intervals", async function() {
      const toFirstTransfer = ethers.utils.parseEther("4");
      const toSecondTransfer = ethers.utils.parseEther("6");
      await lpMockToken.connect(addr1).approve(simpleStaking.address, toFirstTransfer.add(toSecondTransfer));
      await expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.balance.toString())
      ).to.equal("0");
      await expect(simpleStaking.connect(addr1).stake(toFirstTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toFirstTransfer);
      await helper.time.increase(700);

      await expect(
        await simpleStaking
          .stakers(addr1.address)
          .then((value) => value.claimedReward.toString())
      ).to.be.equal("0");

      await expect(simpleStaking.connect(addr1).stake(toSecondTransfer))
        .to.emit(simpleStaking, "Stake")
        .withArgs(addr1.address, toSecondTransfer);
      await expect(
        simpleStaking
          .stakers(addr1.address)
          .then((value) => value.claimedReward.toString())
      ).to.be.not.equal("0");
      await helper.time.increase(7000);
      await expect(simpleStaking.connect(addr1).claim())
        .to.emit(simpleStaking, "Claim");
    });
  });

  it("calculateYieldTotal for 1 year", async function() {
    var date = new Date(Date.now());
    date.setMinutes(date.getMinutes() + 20);
    console.log("date = " + date);
    console.log("dateT = " + date.getTime());

    const startTime = await helper.time.latest();
    await helper.time.increase(31536000);
    const bigNumberPromise = await simpleStaking.calculateYieldTotal({
      balance: ethers.utils.parseEther("10"),
      startStakeTimestamp: startTime.toString(),
      claimedReward: 0
    });
    await expect(ethers.utils.formatEther(bigNumberPromise).startsWith("2.")).to.be.true;
  });

  it("calculateYieldTotal if timeStaked less 10 minutes", async function() {
    const startTime = await helper.time.latest();
    const bigNumberPromise = await simpleStaking.calculateYieldTotal({
      balance: ethers.utils.parseEther("10"),
      startStakeTimestamp: startTime.toString(),
      claimedReward: 0
    });
    const result = ethers.utils.formatEther(bigNumberPromise);
    await expect(result).to.be.equal("0.0");
  });
});
