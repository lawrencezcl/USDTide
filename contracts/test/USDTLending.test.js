const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("USDTLending", function () {
  let mockUSDT;
  let mockKAIA;
  let usdtStaking;
  let usdtLending;
  let owner;
  let user1;
  let user2;
  let addrs;

  const MIN_STAKE = ethers.utils.parseUnits("10", 6); // 10 USDT
  const REWARD_AMOUNT = ethers.utils.parseUnits("100000", 6); // 100k USDT
  const KAIA_RESERVE = ethers.utils.parseEther("50000"); // 50k KAIA

  beforeEach(async function () {
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy mock tokens
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();
    await mockUSDT.deployed();

    const MockKAIA = await ethers.getContractFactory("MockKAIA");
    mockKAIA = await MockKAIA.deploy();
    await mockKAIA.deployed();

    // Deploy staking contract
    const USDTStaking = await ethers.getContractFactory("USDTStaking");
    usdtStaking = await USDTStaking.deploy(mockUSDT.address);
    await usdtStaking.deployed();

    // Deploy lending contract
    const USDTLending = await ethers.getContractFactory("USDTLending");
    usdtLending = await USDTLending.deploy(
      mockUSDT.address,
      mockKAIA.address,
      usdtStaking.address
    );
    await usdtLending.deployed();

    // Setup contracts
    await mockUSDT.approve(usdtStaking.address, REWARD_AMOUNT);
    await usdtStaking.addRewards(REWARD_AMOUNT);

    await mockKAIA.approve(usdtLending.address, KAIA_RESERVE);
    await usdtLending.addReserve(KAIA_RESERVE);

    // Give users tokens
    await mockUSDT.mint(user1.address, ethers.utils.parseUnits("10000", 6));
    await mockUSDT.mint(user2.address, ethers.utils.parseUnits("10000", 6));
    await mockKAIA.mint(user1.address, ethers.utils.parseEther("1000"));
    await mockKAIA.mint(user2.address, ethers.utils.parseEther("1000"));

    // User1 stakes USDT for collateral
    const stakeAmount = ethers.utils.parseUnits("1000", 6); // 1000 USDT
    await mockUSDT.connect(user1).approve(usdtStaking.address, stakeAmount);
    await usdtStaking.connect(user1).stake(stakeAmount, 0);
  });

  describe("Deployment", function () {
    it("Should set the right parameters", async function () {
      expect(await usdtLending.usdtToken()).to.equal(mockUSDT.address);
      expect(await usdtLending.kaiaToken()).to.equal(mockKAIA.address);
      expect(await usdtLending.stakingContract()).to.equal(usdtStaking.address);
      expect(await usdtLending.owner()).to.equal(owner.address);
    });

    it("Should have correct constants", async function () {
      expect(await usdtLending.COLLATERAL_RATIO()).to.equal(7000); // 70%
      expect(await usdtLending.MIN_LOAN_AMOUNT()).to.equal(ethers.utils.parseEther("1"));
      expect(await usdtLending.DAILY_RATE_7_DAYS()).to.equal(22); // 0.022%
      expect(await usdtLending.DAILY_RATE_14_DAYS()).to.equal(24); // 0.024%
      expect(await usdtLending.DAILY_RATE_30_DAYS()).to.equal(27); // 0.027%
    });

    it("Should have KAIA reserve", async function () {
      expect(await usdtLending.kaiaReserve()).to.equal(KAIA_RESERVE);
    });
  });

  describe("Borrowing", function () {
    it("Should allow borrowing with sufficient collateral", async function () {
      const borrowAmount = ethers.utils.parseEther("100"); // 100 KAIA
      const term = 7 * 24 * 60 * 60; // 7 days
      
      await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
        .to.emit(usdtLending, "LoanTaken");

      expect(await usdtLending.totalBorrowed(user1.address)).to.equal(borrowAmount);
      expect(await mockKAIA.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("1100")); // 1000 + 100
    });

    it("Should reject borrowing below minimum amount", async function () {
      const borrowAmount = ethers.utils.parseEther("0.5"); // Below 1 KAIA minimum
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
        .to.be.revertedWith("Amount below minimum loan");
    });

    it("Should reject borrowing with invalid term", async function () {
      const borrowAmount = ethers.utils.parseEther("100");
      const invalidTerm = 5 * 24 * 60 * 60; // 5 days (invalid)
      
      await expect(usdtLending.connect(user1).borrow(borrowAmount, invalidTerm))
        .to.be.revertedWith("Invalid loan term");
    });

    it("Should reject borrowing without collateral", async function () {
      const borrowAmount = ethers.utils.parseEther("100");
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user2).borrow(borrowAmount, term))
        .to.be.revertedWith("No staked collateral found");
    });

    it("Should reject borrowing with insufficient collateral", async function () {
      const borrowAmount = ethers.utils.parseEther("1000"); // Too much
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
        .to.be.revertedWith("Insufficient collateral");
    });

    it("Should reject borrowing when reserve is insufficient", async function () {
      // Drain the reserve
      await usdtLending.emergencyWithdraw(mockKAIA.address, KAIA_RESERVE);
      
      const borrowAmount = ethers.utils.parseEther("100");
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
        .to.be.revertedWith("Insufficient KAIA reserve");
    });

    it("Should calculate collateral correctly for different terms", async function () {
      const borrowAmount = ethers.utils.parseEther("100");
      
      // Test all valid terms
      const terms = [
        7 * 24 * 60 * 60,   // 7 days
        14 * 24 * 60 * 60,  // 14 days
        30 * 24 * 60 * 60   // 30 days
      ];
      
      for (let term of terms) {
        await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
          .to.not.be.reverted;
        
        // Repay the loan before next borrow
        const loans = await usdtLending.getLoanInfo(user1.address);
        const lastLoanIndex = loans.length - 1;
        
        await mockKAIA.connect(user1).approve(usdtLending.address, ethers.utils.parseEther("200"));
        await usdtLending.connect(user1).repay(lastLoanIndex);
      }
    });
  });

  describe("Repayment", function () {
    beforeEach(async function () {
      // User1 borrows 100 KAIA for 7 days
      const borrowAmount = ethers.utils.parseEther("100");
      const term = 7 * 24 * 60 * 60;
      await usdtLending.connect(user1).borrow(borrowAmount, term);
    });

    it("Should allow full repayment with KAIA", async function () {
      const loanIndex = 0;
      const loan = (await usdtLending.getLoanInfo(user1.address))[loanIndex];
      
      // Advance time by 3 days
      await time.increase(3 * 24 * 60 * 60);
      
      const interest = await usdtLending.calculateInterest(user1.address, loanIndex);
      const totalDue = loan.kaiaAmount.add(interest);
      
      await mockKAIA.connect(user1).approve(usdtLending.address, totalDue);
      
      await expect(usdtLending.connect(user1).repay(loanIndex))
        .to.emit(usdtLending, "LoanRepaid");
      
      const updatedLoan = (await usdtLending.getLoanInfo(user1.address))[loanIndex];
      expect(updatedLoan.isRepaid).to.be.true;
      expect(updatedLoan.isActive).to.be.false;
    });

    it("Should handle partial KAIA payment", async function () {
      const loanIndex = 0;
      
      // User has only 50 KAIA (less than loan amount)
      await mockKAIA.connect(user1).transfer(owner.address, ethers.utils.parseEther("1050"));
      expect(await mockKAIA.balanceOf(user1.address)).to.equal(ethers.utils.parseEther("50"));
      
      await mockKAIA.connect(user1).approve(usdtLending.address, ethers.utils.parseEther("50"));
      
      await expect(usdtLending.connect(user1).repay(loanIndex))
        .to.emit(usdtLending, "LoanRepaid");
    });

    it("Should reject repayment of invalid loan index", async function () {
      await expect(usdtLending.connect(user1).repay(99))
        .to.be.revertedWith("Invalid loan index");
    });

    it("Should reject repayment of inactive loan", async function () {
      const loanIndex = 0;
      
      // Repay once
      await mockKAIA.connect(user1).approve(usdtLending.address, ethers.utils.parseEther("200"));
      await usdtLending.connect(user1).repay(loanIndex);
      
      // Try to repay again
      await expect(usdtLending.connect(user1).repay(loanIndex))
        .to.be.revertedWith("Loan is not active");
    });
  });

  describe("Interest Calculation", function () {
    beforeEach(async function () {
      const borrowAmount = ethers.utils.parseEther("1000"); // 1000 KAIA
      const term = 7 * 24 * 60 * 60; // 7 days
      await usdtLending.connect(user1).borrow(borrowAmount, term);
    });

    it("Should calculate interest correctly", async function () {
      const loanIndex = 0;
      
      // Advance time by 7 days
      await time.increase(7 * 24 * 60 * 60);
      
      const interest = await usdtLending.calculateInterest(user1.address, loanIndex);
      
      // Expected: 1000 * 0.022% * 7 = 1.54 KAIA
      const expectedInterest = ethers.utils.parseEther("1000").mul(22).mul(7).div(10000);
      expect(interest).to.equal(expectedInterest);
    });

    it("Should return zero interest for inactive loans", async function () {
      const loanIndex = 0;
      
      // Repay the loan
      await mockKAIA.connect(user1).approve(usdtLending.address, ethers.utils.parseEther("2000"));
      await usdtLending.connect(user1).repay(loanIndex);
      
      const interest = await usdtLending.calculateInterest(user1.address, loanIndex);
      expect(interest).to.equal(0);
    });

    it("Should calculate different rates for different terms", async function () {
      // Test different term loans
      const borrowAmount = ethers.utils.parseEther("1000");
      
      // 14-day loan
      await usdtLending.connect(user1).borrow(borrowAmount, 14 * 24 * 60 * 60);
      // 30-day loan  
      await usdtLending.connect(user1).borrow(borrowAmount, 30 * 24 * 60 * 60);
      
      // Advance time by 1 day
      await time.increase(24 * 60 * 60);
      
      const interest7 = await usdtLending.calculateInterest(user1.address, 0); // 7-day loan
      const interest14 = await usdtLending.calculateInterest(user1.address, 1); // 14-day loan
      const interest30 = await usdtLending.calculateInterest(user1.address, 2); // 30-day loan
      
      // 30-day should have highest rate, 7-day lowest
      expect(interest30).to.be.gt(interest14);
      expect(interest14).to.be.gt(interest7);
    });
  });

  describe("Liquidation", function () {
    beforeEach(async function () {
      const borrowAmount = ethers.utils.parseEther("100");
      const term = 7 * 24 * 60 * 60;
      await usdtLending.connect(user1).borrow(borrowAmount, term);
    });

    it("Should allow liquidation of overdue loans", async function () {
      const loanIndex = 0;
      
      // Advance time past due date
      await time.increase(8 * 24 * 60 * 60); // 8 days
      
      await expect(usdtLending.connect(user2).liquidate(user1.address, loanIndex))
        .to.emit(usdtLending, "LoanLiquidated");
      
      const liquidatedLoan = (await usdtLending.getLoanInfo(user1.address))[loanIndex];
      expect(liquidatedLoan.isActive).to.be.false;
    });

    it("Should reject liquidation of non-overdue loans", async function () {
      const loanIndex = 0;
      
      // Only advance time by 3 days (not overdue)
      await time.increase(3 * 24 * 60 * 60);
      
      await expect(usdtLending.connect(user2).liquidate(user1.address, loanIndex))
        .to.be.revertedWith("Loan not yet due");
    });

    it("Should reject liquidation of invalid loan", async function () {
      await expect(usdtLending.connect(user2).liquidate(user1.address, 99))
        .to.be.revertedWith("Invalid loan index");
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      const borrowAmount = ethers.utils.parseEther("100");
      const term = 7 * 24 * 60 * 60;
      await usdtLending.connect(user1).borrow(borrowAmount, term);
    });

    it("Should get maximum borrow amount correctly", async function () {
      const maxBorrow = await usdtLending.getMaxBorrowAmount(user1.address);
      
      // User staked 1000 USDT, already borrowed some, should have remaining capacity
      expect(maxBorrow).to.be.gt(0);
    });

    it("Should return zero max borrow for users without collateral", async function () {
      const maxBorrow = await usdtLending.getMaxBorrowAmount(user2.address);
      expect(maxBorrow).to.equal(0);
    });

    it("Should get loan information", async function () {
      const loans = await usdtLending.getLoanInfo(user1.address);
      expect(loans.length).to.equal(1);
      expect(loans[0].kaiaAmount).to.equal(ethers.utils.parseEther("100"));
      expect(loans[0].isActive).to.be.true;
    });

    it("Should get active loans only", async function () {
      const borrowAmount = ethers.utils.parseEther("50");
      const term = 14 * 24 * 60 * 60;
      await usdtLending.connect(user1).borrow(borrowAmount, term);
      
      let activeLoans = await usdtLending.getActiveLoans(user1.address);
      expect(activeLoans.length).to.equal(2);
      
      // Repay first loan
      await mockKAIA.connect(user1).approve(usdtLending.address, ethers.utils.parseEther("200"));
      await usdtLending.connect(user1).repay(0);
      
      activeLoans = await usdtLending.getActiveLoans(user1.address);
      expect(activeLoans.length).to.equal(1);
      expect(activeLoans[0].kaiaAmount).to.equal(borrowAmount);
    });

    it("Should check if user has active loans", async function () {
      expect(await usdtLending.hasActiveLoans(user1.address)).to.be.true;
      expect(await usdtLending.hasActiveLoans(user2.address)).to.be.false;
      
      // Repay loan
      await mockKAIA.connect(user1).approve(usdtLending.address, ethers.utils.parseEther("200"));
      await usdtLending.connect(user1).repay(0);
      
      expect(await usdtLending.hasActiveLoans(user1.address)).to.be.false;
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update exchange rate", async function () {
      const newRate = ethers.utils.parseEther("0.6"); // 1 USDT = 0.6 KAIA
      
      await expect(usdtLending.updateExchangeRate(newRate))
        .to.emit(usdtLending, "ExchangeRateUpdated")
        .withArgs(newRate, await time.latest() + 1);
      
      expect(await usdtLending.usdtKaiaExchangeRate()).to.equal(newRate);
    });

    it("Should reject invalid exchange rate", async function () {
      await expect(usdtLending.updateExchangeRate(0))
        .to.be.revertedWith("Invalid exchange rate");
    });

    it("Should allow owner to add reserve", async function () {
      const additionalReserve = ethers.utils.parseEther("10000");
      
      await mockKAIA.approve(usdtLending.address, additionalReserve);
      await expect(usdtLending.addReserve(additionalReserve))
        .to.emit(usdtLending, "ReserveUpdated");
      
      expect(await usdtLending.kaiaReserve()).to.equal(KAIA_RESERVE.add(additionalReserve));
    });

    it("Should allow emergency withdrawals", async function () {
      const emergencyAmount = ethers.utils.parseEther("1000");
      
      const initialBalance = await mockKAIA.balanceOf(owner.address);
      await usdtLending.emergencyWithdraw(mockKAIA.address, emergencyAmount);
      
      expect(await mockKAIA.balanceOf(owner.address)).to.equal(initialBalance.add(emergencyAmount));
    });

    it("Should allow pause/unpause", async function () {
      await usdtLending.pause();
      
      const borrowAmount = ethers.utils.parseEther("100");
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
        .to.be.revertedWith("Pausable: paused");
      
      await usdtLending.unpause();
      await expect(usdtLending.connect(user1).borrow(borrowAmount, term))
        .to.not.be.reverted;
    });
  });

  describe("Access Control", function () {
    it("Should reject non-owner admin operations", async function () {
      await expect(usdtLending.connect(user1).updateExchangeRate(ethers.utils.parseEther("0.6")))
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(usdtLending.connect(user1).addReserve(ethers.utils.parseEther("1000")))
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(usdtLending.connect(user1).emergencyWithdraw(mockKAIA.address, 1000))
        .to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(usdtLending.connect(user1).pause())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integration with Staking", function () {
    it("Should respect staking contract balances", async function () {
      // User2 stakes some USDT
      const stakeAmount = ethers.utils.parseUnits("500", 6);
      await mockUSDT.connect(user2).approve(usdtStaking.address, stakeAmount);
      await usdtStaking.connect(user2).stake(stakeAmount, 0);
      
      // User2 should now be able to borrow
      const borrowAmount = ethers.utils.parseEther("50");
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user2).borrow(borrowAmount, term))
        .to.not.be.reverted;
    });

    it("Should prevent borrowing more than collateral allows", async function () {
      // Calculate the exact maximum borrowable amount
      const stakedAmount = await usdtStaking.getStakedAmount(user1.address);
      const maxBorrow = await usdtLending.getMaxBorrowAmount(user1.address);
      
      // Try to borrow slightly more than maximum
      const excessiveBorrow = maxBorrow.add(ethers.utils.parseEther("1"));
      const term = 7 * 24 * 60 * 60;
      
      await expect(usdtLending.connect(user1).borrow(excessiveBorrow, term))
        .to.be.revertedWith("Insufficient collateral");
    });
  });
});