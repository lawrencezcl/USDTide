// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title USDTStaking
 * @dev Smart contract for USDT staking with multiple node support
 * @notice This contract allows users to stake USDT and earn rewards from multiple validator nodes
 */
contract USDTStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // USDT token contract
    IERC20 public immutable usdtToken;

    // Minimum staking amount (10 USDT)
    uint256 public constant MIN_STAKE = 10 * 10**6; // 10 USDT (6 decimals)

    // Staking node information
    struct StakingNode {
        string name;
        uint256 annualRate; // Annual rate in basis points (e.g., 600 = 6%)
        uint256 securityRating; // 1-5 stars
        bool isActive;
        uint256 totalStaked;
        uint256 maxCapacity;
    }

    // User staking information
    struct UserStake {
        uint256 amount;
        uint256 nodeId;
        uint256 stakeTime;
        uint256 lastRewardTime;
        uint256 pendingRewards;
    }

    // Mappings
    mapping(address => UserStake[]) public userStakes;
    mapping(address => uint256) public totalUserStaked;
    mapping(uint256 => StakingNode) public stakingNodes;
    
    // State variables
    uint256 public nodeCount;
    uint256 public totalStaked;
    uint256 public rewardPool;

    // Events
    event Staked(address indexed user, uint256 amount, uint256 nodeId, uint256 timestamp);
    event Withdrawn(address indexed user, uint256 amount, uint256 nodeId, uint256 timestamp);
    event RewardClaimed(address indexed user, uint256 reward, uint256 timestamp);
    event NodeAdded(uint256 indexed nodeId, string name, uint256 annualRate);
    event NodeUpdated(uint256 indexed nodeId, uint256 annualRate, bool isActive);
    event RewardPoolUpdated(uint256 amount);

    /**
     * @dev Constructor
     * @param _usdtToken Address of the USDT token contract
     */
    constructor(address _usdtToken) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT token address");
        usdtToken = IERC20(_usdtToken);
        
        // Initialize default nodes
        _addNode("Kaia Wave Node", 600, 5, true, 1000000 * 10**6); // 6% APY, 5 stars, 1M USDT capacity
        _addNode("Kaia Storm Node", 550, 4, true, 500000 * 10**6); // 5.5% APY, 4 stars, 500K USDT capacity
        _addNode("Kaia Thunder Node", 520, 4, true, 750000 * 10**6); // 5.2% APY, 4 stars, 750K USDT capacity
    }

    /**
     * @dev Stake USDT to a specific node
     * @param _amount Amount of USDT to stake
     * @param _nodeId ID of the staking node
     */
    function stake(uint256 _amount, uint256 _nodeId) external nonReentrant whenNotPaused {
        require(_amount >= MIN_STAKE, "Amount below minimum stake");
        require(_nodeId < nodeCount, "Invalid node ID");
        require(stakingNodes[_nodeId].isActive, "Node is not active");
        require(
            stakingNodes[_nodeId].totalStaked + _amount <= stakingNodes[_nodeId].maxCapacity,
            "Node capacity exceeded"
        );

        // Update pending rewards before new stake
        _updateUserRewards(msg.sender);

        // Transfer USDT from user
        usdtToken.safeTransferFrom(msg.sender, address(this), _amount);

        // Create new stake record
        UserStake memory newStake = UserStake({
            amount: _amount,
            nodeId: _nodeId,
            stakeTime: block.timestamp,
            lastRewardTime: block.timestamp,
            pendingRewards: 0
        });

        userStakes[msg.sender].push(newStake);
        totalUserStaked[msg.sender] += _amount;
        stakingNodes[_nodeId].totalStaked += _amount;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount, _nodeId, block.timestamp);
    }

    /**
     * @dev Withdraw staked USDT from a specific stake
     * @param _stakeIndex Index of the stake to withdraw from
     * @param _amount Amount to withdraw (0 = withdraw all)
     */
    function withdraw(uint256 _stakeIndex, uint256 _amount) external nonReentrant {
        require(_stakeIndex < userStakes[msg.sender].length, "Invalid stake index");
        
        UserStake storage userStake = userStakes[msg.sender][_stakeIndex];
        require(userStake.amount > 0, "No stake found");

        // Update rewards before withdrawal
        _updateUserRewards(msg.sender);

        // Determine withdrawal amount
        uint256 withdrawAmount = _amount == 0 ? userStake.amount : _amount;
        require(withdrawAmount <= userStake.amount, "Insufficient staked amount");

        // Update state
        userStake.amount -= withdrawAmount;
        totalUserStaked[msg.sender] -= withdrawAmount;
        stakingNodes[userStake.nodeId].totalStaked -= withdrawAmount;
        totalStaked -= withdrawAmount;

        // Transfer USDT back to user
        usdtToken.safeTransfer(msg.sender, withdrawAmount);

        // Remove stake if fully withdrawn
        if (userStake.amount == 0) {
            _removeStake(msg.sender, _stakeIndex);
        }

        emit Withdrawn(msg.sender, withdrawAmount, userStake.nodeId, block.timestamp);
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        _updateUserRewards(msg.sender);
        
        uint256 totalRewards = 0;
        UserStake[] storage stakes = userStakes[msg.sender];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            totalRewards += stakes[i].pendingRewards;
            stakes[i].pendingRewards = 0;
            stakes[i].lastRewardTime = block.timestamp;
        }
        
        require(totalRewards > 0, "No rewards to claim");
        require(rewardPool >= totalRewards, "Insufficient reward pool");
        
        rewardPool -= totalRewards;
        usdtToken.safeTransfer(msg.sender, totalRewards);
        
        emit RewardClaimed(msg.sender, totalRewards, block.timestamp);
    }

    /**
     * @dev Get user's total staked amount
     */
    function getStakedAmount(address _user) external view returns (uint256) {
        return totalUserStaked[_user];
    }

    /**
     * @dev Get user's pending rewards
     */
    function getReward(address _user) external view returns (uint256) {
        uint256 totalRewards = 0;
        UserStake[] memory stakes = userStakes[_user];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            totalRewards += stakes[i].pendingRewards;
            totalRewards += _calculatePendingReward(stakes[i]);
        }
        
        return totalRewards;
    }

    /**
     * @dev Get user's stake history
     */
    function getStakeHistory(address _user) external view returns (UserStake[] memory) {
        return userStakes[_user];
    }

    /**
     * @dev Get node information
     */
    function getNode(uint256 _nodeId) external view returns (StakingNode memory) {
        require(_nodeId < nodeCount, "Invalid node ID");
        return stakingNodes[_nodeId];
    }

    /**
     * @dev Get all active nodes
     */
    function getActiveNodes() external view returns (StakingNode[] memory) {
        uint256 activeCount = 0;
        
        // Count active nodes
        for (uint256 i = 0; i < nodeCount; i++) {
            if (stakingNodes[i].isActive) {
                activeCount++;
            }
        }
        
        // Create array of active nodes
        StakingNode[] memory activeNodes = new StakingNode[](activeCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < nodeCount; i++) {
            if (stakingNodes[i].isActive) {
                activeNodes[index] = stakingNodes[i];
                index++;
            }
        }
        
        return activeNodes;
    }

    /**
     * @dev Add a new staking node (only owner)
     */
    function addNode(
        string memory _name,
        uint256 _annualRate,
        uint256 _securityRating,
        bool _isActive,
        uint256 _maxCapacity
    ) external onlyOwner {
        _addNode(_name, _annualRate, _securityRating, _isActive, _maxCapacity);
    }

    /**
     * @dev Update node parameters (only owner)
     */
    function updateNode(
        uint256 _nodeId,
        uint256 _annualRate,
        uint256 _securityRating,
        bool _isActive,
        uint256 _maxCapacity
    ) external onlyOwner {
        require(_nodeId < nodeCount, "Invalid node ID");
        require(_securityRating >= 1 && _securityRating <= 5, "Invalid security rating");
        
        StakingNode storage node = stakingNodes[_nodeId];
        node.annualRate = _annualRate;
        node.securityRating = _securityRating;
        node.isActive = _isActive;
        node.maxCapacity = _maxCapacity;
        
        emit NodeUpdated(_nodeId, _annualRate, _isActive);
    }

    /**
     * @dev Add rewards to the pool (only owner)
     */
    function addRewards(uint256 _amount) external onlyOwner {
        require(_amount > 0, "Amount must be greater than 0");
        usdtToken.safeTransferFrom(msg.sender, address(this), _amount);
        rewardPool += _amount;
        emit RewardPoolUpdated(rewardPool);
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
     * @dev Internal function to add a new node
     */
    function _addNode(
        string memory _name,
        uint256 _annualRate,
        uint256 _securityRating,
        bool _isActive,
        uint256 _maxCapacity
    ) internal {
        require(bytes(_name).length > 0, "Node name cannot be empty");
        require(_securityRating >= 1 && _securityRating <= 5, "Invalid security rating");
        
        stakingNodes[nodeCount] = StakingNode({
            name: _name,
            annualRate: _annualRate,
            securityRating: _securityRating,
            isActive: _isActive,
            totalStaked: 0,
            maxCapacity: _maxCapacity
        });
        
        emit NodeAdded(nodeCount, _name, _annualRate);
        nodeCount++;
    }

    /**
     * @dev Update user rewards for all stakes
     */
    function _updateUserRewards(address _user) internal {
        UserStake[] storage stakes = userStakes[_user];
        
        for (uint256 i = 0; i < stakes.length; i++) {
            stakes[i].pendingRewards += _calculatePendingReward(stakes[i]);
            stakes[i].lastRewardTime = block.timestamp;
        }
    }

    /**
     * @dev Calculate pending reward for a stake
     */
    function _calculatePendingReward(UserStake memory _stake) internal view returns (uint256) {
        if (_stake.amount == 0) return 0;
        
        uint256 timeDiff = block.timestamp - _stake.lastRewardTime;
        uint256 annualRate = stakingNodes[_stake.nodeId].annualRate;
        
        // Calculate reward: (amount * rate * timeDiff) / (365 days * 10000)
        // Rate is in basis points (e.g., 600 = 6%)
        return (_stake.amount * annualRate * timeDiff) / (365 days * 10000);
    }

    /**
     * @dev Remove a stake from user's stakes array
     */
    function _removeStake(address _user, uint256 _index) internal {
        UserStake[] storage stakes = userStakes[_user];
        require(_index < stakes.length, "Invalid stake index");
        
        // Move last element to the index being removed
        stakes[_index] = stakes[stakes.length - 1];
        stakes.pop();
    }
}