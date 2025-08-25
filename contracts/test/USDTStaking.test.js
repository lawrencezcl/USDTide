const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("USDTStaking", function () {
  let mockUSDT;
  let usdtStaking;
  let owner;
  let user1;
  let user2;
  let addrs;

  const MIN_STAKE = ethers.parseUnits("10", 6); // 10 USDT
  const REWARD_AMOUNT = ethers.parseUnits("100000", 6); // 100k USDT

  beforeEach(async function () {
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy MockUSDT
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.waitForDeployment();

    // Deploy USDTStaking
    const USDTStaking = await ethers.getContractFactory("USDTStaking");
    usdtStaking = await USDTStaking.deploy(await mockUSDT.getAddress());
    await usdtStaking.waitForDeployment();

    // Setup rewards
    await mockUSDT.approve(await usdtStaking.getAddress(), REWARD_AMOUNT);
    await usdtStaking.addRewards(REWARD_AMOUNT);

    // Give users tokens
    await mockUSDT.mint(user1.address, ethers.parseUnits("1000", 6));
    await mockUSDT.mint(user2.address, ethers.parseUnits("1000", 6));
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await usdtStaking.owner()).to.equal(owner.address);
    });

    it("Should set the USDT token address", async function () {
      expect(await usdtStaking.usdtToken()).to.equal(await mockUSDT.getAddress());
    });

    it("Should initialize default nodes", async function () {
      expect(await usdtStaking.nodeCount()).to.equal(3);
      
      const node0 = await usdtStaking.getNode(0);
      expect(node0.name).to.equal("Kaia Wave Node");
      expect(node0.annualRate).to.equal(600); // 6%
      expect(node0.securityRating).to.equal(5);
      expect(node0.isActive).to.be.true;
    });

    it("Should have correct reward pool", async function () {
      expect(await usdtStaking.rewardPool()).to.equal(REWARD_AMOUNT);
    });
  });

  describe("Staking", function () {
    it("Should allow users to stake USDT", async function () {
      const stakeAmount = ethers.parseUnits("100", 6);

    await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      
      const tx = await usdtStaking.connect(user1).stake(stakeAmount, 0);
      const receipt = await tx.wait();
      const timestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;
      
      await expect(tx)
        .to.emit(usdtStaking, "Staked")
        .withArgs(user1.address, stakeAmount, 0, timestamp);

      expect(await usdtStaking.getStakedAmount(user1.address)).to.equal(stakeAmount);
      expect(await usdtStaking.totalStaked()).to.equal(stakeAmount);
    });

    it("Should reject stakes below minimum", async function () {
      const stakeAmount = ethers.parseUnits("5", 6); // Below 10 USDT minimum

    await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await expect(usdtStaking.connect(user1).stake(stakeAmount, 0))
        .to.be.revertedWith("Amount below minimum stake");
    });

    it("Should reject stakes to invalid nodes", async function () {
      const stakeAmount = MIN_STAKE;
      
      await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await expect(usdtStaking.connect(user1).stake(stakeAmount, 99))
        .to.be.revertedWith("Invalid node ID");
    });

    it("Should reject stakes when node capacity is exceeded", async function () {
      const nodeCapacity = (await usdtStaking.getNode(0)).maxCapacity;
      const stakeAmount = nodeCapacity + ethers.parseUnits("1", 6);

    await mockUSDT.mint(user1.address, stakeAmount);
    await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      
      await expect(usdtStaking.connect(user1).stake(stakeAmount, 0))
        .to.be.revertedWith("Node capacity exceeded");
    });

    it("Should update node total staked", async function () {
      const stakeAmount = ethers.parseUnits("100", 6);

    await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await usdtStaking.connect(user1).stake(stakeAmount, 0);

      const node = await usdtStaking.getNode(0);
      expect(node.totalStaked).to.equal(stakeAmount);
    });

    it("Should handle multiple stakes from same user", async function () {
      const stakeAmount1 = ethers.parseUnits("100", 6);
    const stakeAmount2 = ethers.parseUnits("50", 6);

    await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount1 + stakeAmount2);
      
      await usdtStaking.connect(user1).stake(stakeAmount1, 0);
      await usdtStaking.connect(user1).stake(stakeAmount2, 1);

      expect(await usdtStaking.getStakedAmount(user1.address)).to.equal(stakeAmount1 + stakeAmount2);
      
      const stakes = await usdtStaking.getStakeHistory(user1.address);
      expect(stakes.length).to.equal(2);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      const stakeAmount = ethers.parseUnits("100", 6);
    await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await usdtStaking.connect(user1).stake(stakeAmount, 0);
    });

    it("Should allow partial withdrawals", async function () {
      const withdrawAmount = ethers.parseUnits("30", 6);
      const initialBalance = await mockUSDT.balanceOf(user1.address);
      
      const tx = await usdtStaking.connect(user1).withdraw(0, withdrawAmount);
      const receipt = await tx.wait();
      const timestamp = (await ethers.provider.getBlock(receipt.blockNumber)).timestamp;
      
      await expect(tx)
        .to.emit(usdtStaking, "Withdrawn")
        .withArgs(user1.address, withdrawAmount, 0, timestamp);

      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialBalance + withdrawAmount);
      expect(await usdtStaking.getStakedAmount(user1.address)).to.equal(ethers.parseUnits("70", 6));
    });

    it("Should allow full withdrawals", async function () {
      const initialBalance = await mockUSDT.balanceOf(user1.address);
      const stakedAmount = await usdtStaking.getStakedAmount(user1.address);
      
      await usdtStaking.connect(user1).withdraw(0, 0); // 0 means withdraw all
      
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialBalance + stakedAmount);
      expect(await usdtStaking.getStakedAmount(user1.address)).to.equal(0);
    });

    it("Should reject withdrawals exceeding staked amount", async function () {
      const excessiveAmount = ethers.parseUnits("200", 6);
      
      await expect(usdtStaking.connect(user1).withdraw(0, excessiveAmount))
        .to.be.revertedWith("Insufficient staked amount");
    });

    it("Should reject invalid stake index", async function () {
      await expect(usdtStaking.connect(user1).withdraw(99, 0))
        .to.be.revertedWith("Invalid stake index");
    });
  });

  describe("Rewards", function () {
    it("Should calculate rewards correctly", async function () {
      const stakeAmount = ethers.parseUnits("1000", 6); // 1000 USDT

      await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await usdtStaking.connect(user1).stake(stakeAmount, 0); // 6% APY node
      
      // Advance time by 30 days
      await time.increase(30 * 24 * 60 * 60);
      
      const rewards = await usdtStaking.getReward(user1.address);
      
      // Expected: 1000 * 0.06 * 30/365 ≈ 4.93 USDT
      const expectedRewards = stakeAmount * 600n * 30n / (365n * 10000n);
      expect(rewards).to.be.closeTo(expectedRewards, ethers.parseUnits("0.01", 6));
    });

    it("Should allow claiming rewards", async function () {
      const stakeAmount = ethers.parseUnits("1000", 6);

      await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await usdtStaking.connect(user1).stake(stakeAmount, 0);
      
      // Advance time by 7 days
      await time.increase(7 * 24 * 60 * 60);
      
      const initialBalance = await mockUSDT.balanceOf(user1.address);
      const rewards = await usdtStaking.getReward(user1.address);
      
      await expect(usdtStaking.connect(user1).claimRewards())
        .to.emit(usdtStaking, "RewardClaimed");
      
      expect(await mockUSDT.balanceOf(user1.address)).to.equal(initialBalance + BigInt(1150686));
      expect(await usdtStaking.getReward(user1.address)).to.equal(0);
    });

    it("Should reject claiming when no rewards", async function () {
      await expect(usdtStaking.connect(user1).claimRewards())
        .to.be.revertedWith("No rewards to claim");
    });
  });

  describe("Node Management", function () {
    it("Should allow owner to add new nodes", async function () {
      await expect(usdtStaking.addNode("Test Node", 500, 3, true, ethers.parseUnits("100000", 6)))
        .to.emit(usdtStaking, "NodeAdded")
        .withArgs(3, "Test Node", 500);

      expect(await usdtStaking.nodeCount()).to.equal(4);
      
      const newNode = await usdtStaking.getNode(3);
      expect(newNode.name).to.equal("Test Node");
      expect(newNode.annualRate).to.equal(500);
      expect(newNode.securityRating).to.equal(3);
    });

    it("Should allow owner to update nodes", async function () {
      await expect(usdtStaking.updateNode(0, 700, 5, false, ethers.parseUnits("2000000", 6)))
        .to.emit(usdtStaking, "NodeUpdated")
        .withArgs(0, 700, false);

      const updatedNode = await usdtStaking.getNode(0);
      expect(updatedNode.annualRate).to.equal(700);
      expect(updatedNode.isActive).to.be.false;
    });

    it("Should reject invalid security ratings", async function () {
      await expect(usdtStaking.addNode("Invalid Node", 500, 6, true, ethers.parseUnits("100000", 6)))
        .to.be.revertedWith("Invalid security rating");
      
      await expect(usdtStaking.updateNode(0, 500, 0, true, ethers.parseUnits("100000", 6)))
        .to.be.revertedWith("Invalid security rating");
    });

    it("Should get active nodes only", async function () {
      await usdtStaking.updateNode(1, 500, 4, false, ethers.parseUnits("500000", 6)); // Deactivate node 1
      
      const activeNodes = await usdtStaking.getActiveNodes();
      expect(activeNodes.length).to.equal(2); // Should be 2 active nodes now
      expect(activeNodes[0].name).to.equal("Kaia Wave Node");
      expect(activeNodes[1].name).to.equal("Kaia Thunder Node");
    });
  });

  describe("Access Control", function () {
    it("Should reject non-owner node operations", async function () {
      await expect(usdtStaking.connect(user1).addNode("Unauthorized", 500, 3, true, ethers.parseUnits("100000", 6)))
        .to.be.revertedWithCustomError(usdtStaking, "OwnableUnauthorizedAccount");
      
      await expect(usdtStaking.connect(user1).updateNode(0, 700, 5, true, ethers.parseUnits("1000000", 6)))
        .to.be.revertedWithCustomError(usdtStaking, "OwnableUnauthorizedAccount");
    });

    it("Should reject non-owner reward operations", async function () {
      await expect(usdtStaking.connect(user1).addRewards(ethers.parseUnits("1000", 6)))
        .to.be.revertedWithCustomError(usdtStaking, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to pause/unpause", async function () {
      await usdtStaking.pause();
      
      const stakeAmount = MIN_STAKE;
      await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await expect(usdtStaking.connect(user1).stake(stakeAmount, 0))
        .to.be.revertedWithCustomError(usdtStaking, "EnforcedPause");
      
      await usdtStaking.unpause();
      await expect(usdtStaking.connect(user1).stake(stakeAmount, 0))
        .to.not.be.reverted;
    });
  });

  describe("Emergency Functions", function () {
    it("Should allow emergency withdrawals by owner", async function () {
      const emergencyAmount = ethers.parseUnits("1000", 6);
      await mockUSDT.mint(await usdtStaking.getAddress(), emergencyAmount);
      
      const initialBalance = await mockUSDT.balanceOf(owner.address);
      await usdtStaking.emergencyWithdraw(await mockUSDT.getAddress(), emergencyAmount);
      
      expect(await mockUSDT.balanceOf(owner.address)).to.equal(initialBalance + emergencyAmount);
    });

    it("Should reject emergency withdrawals by non-owner", async function () {
      await expect(usdtStaking.connect(user1).emergencyWithdraw(await mockUSDT.getAddress(), 1000))
        .to.be.revertedWithCustomError(usdtStaking, "OwnableUnauthorizedAccount");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle staking when contract is empty", async function () {
      // Deploy fresh contract without rewards
      const USDTStaking = await ethers.getContractFactory("USDTStaking");
      const freshStaking = await USDTStaking.deploy(await mockUSDT.getAddress());
      
      const stakeAmount = MIN_STAKE;
      await mockUSDT.connect(user1).approve(await freshStaking.getAddress(), stakeAmount);
      
      // Should allow staking even without rewards in pool
      await expect(freshStaking.connect(user1).stake(stakeAmount, 0))
        .to.not.be.reverted;
    });

    it("Should handle multiple users staking to same node", async function () {
      const stakeAmount = ethers.parseUnits("100", 6);

      await mockUSDT.connect(user1).approve(await usdtStaking.getAddress(), stakeAmount);
      await mockUSDT.connect(user2).approve(await usdtStaking.getAddress(), stakeAmount);
      
      await usdtStaking.connect(user1).stake(stakeAmount, 0);
      await usdtStaking.connect(user2).stake(stakeAmount, 0);
      
      const node = await usdtStaking.getNode(0);
      expect(node.totalStaked).to.equal(stakeAmount * 2n);
      expect(await usdtStaking.totalStaked()).to.equal(stakeAmount * 2n);
    });
  });
});