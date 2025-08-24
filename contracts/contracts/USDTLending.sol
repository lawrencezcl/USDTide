// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

interface IUSDTStaking {
    function getStakedAmount(address user) external view returns (uint256);
}

/**
 * @title USDTLending
 * @dev Smart contract for USDT collateralized KAIA lending
 * @notice This contract allows users to borrow KAIA using their staked USDT as collateral
 */
contract USDTLending is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Token contracts
    IERC20 public immutable usdtToken;
    IERC20 public immutable kaiaToken;
    IUSDTStaking public immutable stakingContract;

    // Lending parameters
    uint256 public constant COLLATERAL_RATIO = 7000; // 70% (in basis points)
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_LOAN_AMOUNT = 1 * 10**18; // 1 KAIA minimum

    // Interest rates (daily basis points)
    uint256 public constant DAILY_RATE_7_DAYS = 22; // 0.022%
    uint256 public constant DAILY_RATE_14_DAYS = 24; // 0.024%
    uint256 public constant DAILY_RATE_30_DAYS = 27; // 0.027%

    // Loan terms
    uint256 public constant TERM_7_DAYS = 7 days;
    uint256 public constant TERM_14_DAYS = 14 days;
    uint256 public constant TERM_30_DAYS = 30 days;

    // Loan information structure
    struct LoanInfo {
        uint256 kaiaAmount;        // Amount of KAIA borrowed
        uint256 collateralAmount;  // Amount of USDT collateral
        uint256 interestRate;      // Daily interest rate in basis points
        uint256 borrowTime;        // Timestamp when loan was taken
        uint256 dueTime;           // Timestamp when loan is due
        uint256 term;              // Loan term in seconds
        bool isActive;             // Whether loan is active
        bool isRepaid;             // Whether loan has been repaid
    }

    // Mappings
    mapping(address => LoanInfo[]) public userLoans;
    mapping(address => uint256) public totalBorrowed;
    mapping(address => uint256) public totalCollateral;

    // State variables
    uint256 public totalKaiaLent;
    uint256 public totalUsdtCollateral;
    uint256 public kaiaReserve;
    uint256 public usdtKaiaExchangeRate; // USDT price in KAIA (scaled by 1e18)

    // Events
    event LoanTaken(
        address indexed borrower,
        uint256 kaiaAmount,
        uint256 collateralAmount,
        uint256 term,
        uint256 dueTime
    );
    event LoanRepaid(
        address indexed borrower,
        uint256 loanIndex,
        uint256 kaiaRepaid,
        uint256 interest,
        uint256 timestamp
    );
    event LoanLiquidated(
        address indexed borrower,
        uint256 loanIndex,
        uint256 collateralSeized,
        uint256 timestamp
    );
    event ExchangeRateUpdated(uint256 newRate, uint256 timestamp);
    event ReserveUpdated(uint256 amount, uint256 timestamp);

    /**
     * @dev Constructor
     * @param _usdtToken Address of the USDT token contract
     * @param _kaiaToken Address of the KAIA token contract  
     * @param _stakingContract Address of the USDTStaking contract
     */
    constructor(
        address _usdtToken,
        address _kaiaToken,
        address _stakingContract
    ) {
        require(_usdtToken != address(0), "Invalid USDT token address");
        require(_kaiaToken != address(0), "Invalid KAIA token address");
        require(_stakingContract != address(0), "Invalid staking contract address");
        
        usdtToken = IERC20(_usdtToken);
        kaiaToken = IERC20(_kaiaToken);
        stakingContract = IUSDTStaking(_stakingContract);
        
        // Initialize exchange rate (1 USDT = 0.5 KAIA as example)
        usdtKaiaExchangeRate = 0.5 * 10**18;
    }

    /**
     * @dev Borrow KAIA using staked USDT as collateral
     * @param _kaiaAmount Amount of KAIA to borrow
     * @param _term Loan term (7, 14, or 30 days)
     */
    function borrow(uint256 _kaiaAmount, uint256 _term) external nonReentrant whenNotPaused {
        require(_kaiaAmount >= MIN_LOAN_AMOUNT, "Amount below minimum loan");
        require(_isValidTerm(_term), "Invalid loan term");
        require(kaiaReserve >= _kaiaAmount, "Insufficient KAIA reserve");

        // Check user has enough collateral
        uint256 userStaked = stakingContract.getStakedAmount(msg.sender);
        require(userStaked > 0, "No staked collateral found");

        // Calculate required collateral in USDT
        uint256 requiredCollateral = (_kaiaAmount * BASIS_POINTS) / COLLATERAL_RATIO;
        // Convert KAIA to USDT using exchange rate
        requiredCollateral = (requiredCollateral * 10**18) / usdtKaiaExchangeRate;
        
        // Check if user has enough available collateral
        uint256 availableCollateral = userStaked - totalCollateral[msg.sender];
        require(availableCollateral >= requiredCollateral, "Insufficient collateral");

        // Get interest rate based on term
        uint256 dailyRate = _getDailyRate(_term);
        
        // Calculate due time
        uint256 dueTime = block.timestamp + _term;

        // Create loan record
        LoanInfo memory newLoan = LoanInfo({
            kaiaAmount: _kaiaAmount,
            collateralAmount: requiredCollateral,
            interestRate: dailyRate,
            borrowTime: block.timestamp,
            dueTime: dueTime,
            term: _term,
            isActive: true,
            isRepaid: false
        });

        userLoans[msg.sender].push(newLoan);
        totalBorrowed[msg.sender] += _kaiaAmount;
        totalCollateral[msg.sender] += requiredCollateral;
        totalKaiaLent += _kaiaAmount;
        totalUsdtCollateral += requiredCollateral;
        kaiaReserve -= _kaiaAmount;

        // Transfer KAIA to borrower
        kaiaToken.safeTransfer(msg.sender, _kaiaAmount);

        emit LoanTaken(msg.sender, _kaiaAmount, requiredCollateral, _term, dueTime);
    }

    /**
     * @dev Repay loan with interest
     * @param _loanIndex Index of the loan to repay
     */
    function repay(uint256 _loanIndex) external nonReentrant {
        require(_loanIndex < userLoans[msg.sender].length, "Invalid loan index");
        
        LoanInfo storage loan = userLoans[msg.sender][_loanIndex];
        require(loan.isActive, "Loan is not active");
        require(!loan.isRepaid, "Loan already repaid");

        // Calculate total amount due (principal + interest)
        uint256 interest = calculateInterest(msg.sender, _loanIndex);
        uint256 totalDue = loan.kaiaAmount + interest;

        // Check if user has enough KAIA
        uint256 userKaiaBalance = kaiaToken.balanceOf(msg.sender);
        
        if (userKaiaBalance >= totalDue) {
            // Full repayment with KAIA
            kaiaToken.safeTransferFrom(msg.sender, address(this), totalDue);
            kaiaReserve += totalDue;
        } else {
            // Partial KAIA payment + collateral deduction
            if (userKaiaBalance > 0) {
                kaiaToken.safeTransferFrom(msg.sender, address(this), userKaiaBalance);
                kaiaReserve += userKaiaBalance;
                totalDue -= userKaiaBalance;
            }
            
            // Convert remaining debt to USDT and deduct from collateral
            uint256 usdtDeduction = (totalDue * 10**18) / usdtKaiaExchangeRate;
            require(loan.collateralAmount >= usdtDeduction, "Insufficient collateral for repayment");
            
            // The actual USDT deduction would be handled by the staking contract
            // For now, we just mark it as settled
        }

        // Update loan status
        loan.isActive = false;
        loan.isRepaid = true;
        
        // Update user totals
        totalBorrowed[msg.sender] -= loan.kaiaAmount;
        totalCollateral[msg.sender] -= loan.collateralAmount;
        totalKaiaLent -= loan.kaiaAmount;
        totalUsdtCollateral -= loan.collateralAmount;

        emit LoanRepaid(msg.sender, _loanIndex, loan.kaiaAmount, interest, block.timestamp);
    }

    /**
     * @dev Liquidate overdue loans
     * @param _borrower Address of the borrower
     * @param _loanIndex Index of the loan to liquidate
     */
    function liquidate(address _borrower, uint256 _loanIndex) external {
        require(_loanIndex < userLoans[_borrower].length, "Invalid loan index");
        
        LoanInfo storage loan = userLoans[_borrower][_loanIndex];
        require(loan.isActive, "Loan is not active");
        require(block.timestamp > loan.dueTime, "Loan not yet due");

        // Calculate total debt including interest
        uint256 interest = calculateInterest(_borrower, _loanIndex);
        uint256 totalDebt = loan.kaiaAmount + interest;

        // Seize collateral
        uint256 collateralValue = (loan.collateralAmount * usdtKaiaExchangeRate) / 10**18;
        
        // Update state
        loan.isActive = false;
        totalBorrowed[_borrower] -= loan.kaiaAmount;
        totalCollateral[_borrower] -= loan.collateralAmount;
        totalKaiaLent -= loan.kaiaAmount;
        totalUsdtCollateral -= loan.collateralAmount;

        // If collateral value exceeds debt, return excess to borrower
        if (collateralValue > totalDebt) {
            uint256 excessKaia = collateralValue - totalDebt;
            if (kaiaReserve >= excessKaia) {
                kaiaToken.safeTransfer(_borrower, excessKaia);
                kaiaReserve -= excessKaia;
            }
        }

        emit LoanLiquidated(_borrower, _loanIndex, loan.collateralAmount, block.timestamp);
    }

    /**
     * @dev Calculate interest for a specific loan
     * @param _borrower Address of the borrower
     * @param _loanIndex Index of the loan
     */
    function calculateInterest(address _borrower, uint256 _loanIndex) public view returns (uint256) {
        require(_loanIndex < userLoans[_borrower].length, "Invalid loan index");
        
        LoanInfo memory loan = userLoans[_borrower][_loanIndex];
        if (!loan.isActive) return 0;

        uint256 timeElapsed = block.timestamp - loan.borrowTime;
        uint256 days = timeElapsed / 1 days;
        
        // Calculate interest: principal * daily_rate * days / 10000
        return (loan.kaiaAmount * loan.interestRate * days) / BASIS_POINTS;
    }

    /**
     * @dev Get maximum borrowable amount for a user
     * @param _user Address of the user
     */
    function getMaxBorrowAmount(address _user) external view returns (uint256) {
        uint256 userStaked = stakingContract.getStakedAmount(_user);
        uint256 availableCollateral = userStaked - totalCollateral[_user];
        
        if (availableCollateral == 0) return 0;
        
        // Calculate max KAIA amount based on available collateral
        uint256 maxKaia = (availableCollateral * COLLATERAL_RATIO * usdtKaiaExchangeRate) / (BASIS_POINTS * 10**18);
        
        return maxKaia > kaiaReserve ? kaiaReserve : maxKaia;
    }

    /**
     * @dev Get loan information for a user
     * @param _user Address of the user
     */
    function getLoanInfo(address _user) external view returns (LoanInfo[] memory) {
        return userLoans[_user];
    }

    /**
     * @dev Get active loans for a user
     */
    function getActiveLoans(address _user) external view returns (LoanInfo[] memory) {
        LoanInfo[] memory allLoans = userLoans[_user];
        uint256 activeCount = 0;
        
        // Count active loans
        for (uint256 i = 0; i < allLoans.length; i++) {
            if (allLoans[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active loans
        LoanInfo[] memory activeLoans = new LoanInfo[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < allLoans.length; i++) {
            if (allLoans[i].isActive) {
                activeLoans[index] = allLoans[i];
                index++;
            }
        }
        
        return activeLoans;
    }

    /**
     * @dev Check if user has any active loans
     */
    function hasActiveLoans(address _user) external view returns (bool) {
        LoanInfo[] memory loans = userLoans[_user];
        
        for (uint256 i = 0; i < loans.length; i++) {
            if (loans[i].isActive) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * @dev Update USDT/KAIA exchange rate (only owner)
     * @param _newRate New exchange rate (USDT price in KAIA, scaled by 1e18)
     */
    function updateExchangeRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Invalid exchange rate");
        usdtKaiaExchangeRate = _newRate;
        emit ExchangeRateUpdated(_newRate, block.timestamp);
    }

    /**
     * @dev Add KAIA to reserve (only owner)
     * @param _amount Amount of KAIA to add
     */
    function addReserve(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        kaiaToken.safeTransferFrom(msg.sender, address(this), _amount);
        kaiaReserve += _amount;
        emit ReserveUpdated(kaiaReserve, block.timestamp);
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw(address _token, uint256 _amount) external onlyOwner {
        IERC20(_token).safeTransfer(owner(), _amount);
    }

    /**
     * @dev Pause the contract (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // Internal functions

    /**
     * @dev Check if term is valid
     */
    function _isValidTerm(uint256 _term) internal pure returns (bool) {
        return _term == TERM_7_DAYS || _term == TERM_14_DAYS || _term == TERM_30_DAYS;
    }

    /**
     * @dev Get daily interest rate based on term
     */
    function _getDailyRate(uint256 _term) internal pure returns (uint256) {
        if (_term == TERM_7_DAYS) return DAILY_RATE_7_DAYS;
        if (_term == TERM_14_DAYS) return DAILY_RATE_14_DAYS;
        if (_term == TERM_30_DAYS) return DAILY_RATE_30_DAYS;
        revert("Invalid term");
    }
}