# USDTide API Documentation

## Smart Contract APIs

### USDTStaking Contract

The main staking contract that allows users to stake USDT and earn rewards from validator nodes.

#### Contract Address
- **Kaia Testnet**: `TBD` (will be populated after deployment)
- **Kaia Mainnet**: `TBD` (future deployment)

#### Key Functions

##### `stake(uint256 amount, uint256 nodeId)`
Stakes USDT tokens to a specific validator node.

**Parameters:**
- `amount`: Amount of USDT to stake (in wei, 6 decimals)
- `nodeId`: ID of the validator node (0, 1, 2, etc.)

**Requirements:**
- Amount must be >= 10 USDT (10 * 10^6)
- User must have approved the contract to spend USDT
- Node must be active and have available capacity

**Events Emitted:**
```solidity
event Staked(address indexed user, uint256 amount, uint256 nodeId, uint256 timestamp);
```

**Example Usage:**
```javascript
// Approve USDT spending
await usdtToken.approve(stakingContract.address, amount);

// Stake 100 USDT to node 0
await stakingContract.stake(ethers.parseUnits("100", 6), 0);
```

##### `withdraw(uint256 stakeIndex, uint256 amount)`
Withdraws staked USDT from a specific stake position.

**Parameters:**
- `stakeIndex`: Index of the stake in user's stake array
- `amount`: Amount to withdraw (0 = withdraw all)

**Requirements:**
- User must own the stake at the specified index
- Amount must not exceed staked amount

**Events Emitted:**
```solidity
event Withdrawn(address indexed user, uint256 amount, uint256 nodeId, uint256 timestamp);
```

##### `claimRewards()`
Claims all pending rewards from all user stakes.

**Requirements:**
- User must have pending rewards > 0
- Contract must have sufficient reward pool

**Events Emitted:**
```solidity
event RewardClaimed(address indexed user, uint256 reward, uint256 timestamp);
```

##### `getReward(address user) view returns (uint256)`
Returns the total pending rewards for a user.

**Parameters:**
- `user`: Address of the user

**Returns:**
- Total pending rewards in USDT (6 decimals)

##### `getStakedAmount(address user) view returns (uint256)`
Returns the total amount staked by a user across all nodes.

**Parameters:**
- `user`: Address of the user

**Returns:**
- Total staked amount in USDT (6 decimals)

##### `getStakeHistory(address user) view returns (UserStake[] memory)`
Returns all stake records for a user.

**Parameters:**
- `user`: Address of the user

**Returns:**
- Array of UserStake structs containing stake details

##### `getNode(uint256 nodeId) view returns (StakingNode memory)`
Returns information about a specific validator node.

**Parameters:**
- `nodeId`: ID of the node

**Returns:**
- StakingNode struct with node details

##### `getActiveNodes() view returns (StakingNode[] memory)`
Returns all active validator nodes.

**Returns:**
- Array of active StakingNode structs

#### Data Structures

```solidity
struct UserStake {
    uint256 amount;          // Amount staked
    uint256 nodeId;          // Node ID
    uint256 stakeTime;       // Timestamp when staked
    uint256 lastRewardTime;  // Last reward calculation time
    uint256 pendingRewards;  // Pending rewards
}

struct StakingNode {
    string name;             // Node name
    uint256 annualRate;      // Annual rate in basis points
    uint256 securityRating;  // Security rating (1-5 stars)
    bool isActive;          // Whether node accepts new stakes
    uint256 totalStaked;    // Total amount staked to this node
    uint256 maxCapacity;    // Maximum capacity of the node
}
```

---

### USDTLending Contract

Handles collateralized lending using staked USDT as collateral.

#### Contract Address
- **Kaia Testnet**: `TBD` (will be populated after deployment)
- **Kaia Mainnet**: `TBD` (future deployment)

#### Key Functions

##### `borrow(uint256 kaiaAmount, uint256 term)`
Borrows KAIA using staked USDT as collateral.

**Parameters:**
- `kaiaAmount`: Amount of KAIA to borrow (in wei, 18 decimals)
- `term`: Loan term in seconds (7 days, 14 days, or 30 days)

**Requirements:**
- Amount must be >= 1 KAIA
- User must have sufficient collateral in staking contract
- Contract must have sufficient KAIA reserve

**Events Emitted:**
```solidity
event LoanTaken(
    address indexed borrower,
    uint256 kaiaAmount,
    uint256 collateralAmount,
    uint256 term,
    uint256 dueTime
);
```

##### `repay(uint256 loanIndex)`
Repays a loan with interest.

**Parameters:**
- `loanIndex`: Index of the loan in user's loan array

**Requirements:**
- Loan must be active
- User must have sufficient KAIA or collateral for repayment

**Events Emitted:**
```solidity
event LoanRepaid(
    address indexed borrower,
    uint256 loanIndex,
    uint256 kaiaRepaid,
    uint256 interest,
    uint256 timestamp
);
```

##### `liquidate(address borrower, uint256 loanIndex)`
Liquidates an overdue loan.

**Parameters:**
- `borrower`: Address of the borrower
- `loanIndex`: Index of the loan to liquidate

**Requirements:**
- Loan must be overdue (past due time)
- Loan must be active

**Events Emitted:**
```solidity
event LoanLiquidated(
    address indexed borrower,
    uint256 loanIndex,
    uint256 collateralSeized,
    uint256 timestamp
);
```

##### `getMaxBorrowAmount(address user) view returns (uint256)`
Returns the maximum amount of KAIA a user can borrow.

**Parameters:**
- `user`: Address of the user

**Returns:**
- Maximum borrowable amount in KAIA (18 decimals)

##### `getLoanInfo(address user) view returns (LoanInfo[] memory)`
Returns all loans for a user.

**Parameters:**
- `user`: Address of the user

**Returns:**
- Array of LoanInfo structs

##### `getActiveLoans(address user) view returns (LoanInfo[] memory)`
Returns active loans for a user.

**Parameters:**
- `user`: Address of the user

**Returns:**
- Array of active LoanInfo structs

##### `calculateInterest(address borrower, uint256 loanIndex) view returns (uint256)`
Calculates the current interest owed on a loan.

**Parameters:**
- `borrower`: Address of the borrower
- `loanIndex`: Index of the loan

**Returns:**
- Interest amount in KAIA (18 decimals)

#### Data Structures

```solidity
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
```

#### Constants

```solidity
uint256 public constant COLLATERAL_RATIO = 7000; // 70%
uint256 public constant MIN_LOAN_AMOUNT = 1 * 10**18; // 1 KAIA
uint256 public constant DAILY_RATE_7_DAYS = 22;  // 0.022%
uint256 public constant DAILY_RATE_14_DAYS = 24; // 0.024%  
uint256 public constant DAILY_RATE_30_DAYS = 27; // 0.027%
uint256 public constant TERM_7_DAYS = 7 days;
uint256 public constant TERM_14_DAYS = 14 days;
uint256 public constant TERM_30_DAYS = 30 days;
```

---

## Frontend Integration

### Ethers.js Setup

```javascript
import { ethers } from 'ethers';

// Provider setup
const provider = new ethers.JsonRpcProvider('https://public-node-testnet.kaia.io');

// Contract instances
const stakingContract = new ethers.Contract(
  stakingAddress,
  stakingABI,
  provider
);

const lendingContract = new ethers.Contract(
  lendingAddress, 
  lendingABI,
  provider
);
```

### Common Integration Patterns

#### Staking Flow

```javascript
// 1. Check user balance
const usdtBalance = await usdtToken.balanceOf(userAddress);

// 2. Get active nodes
const nodes = await stakingContract.getActiveNodes();

// 3. Approve USDT spending
const amount = ethers.parseUnits("100", 6); // 100 USDT
await usdtToken.approve(stakingContract.address, amount);

// 4. Stake to selected node
await stakingContract.stake(amount, nodeId);

// 5. Check staking status
const stakedAmount = await stakingContract.getStakedAmount(userAddress);
const rewards = await stakingContract.getReward(userAddress);
```

#### Lending Flow

```javascript
// 1. Check borrowing capacity
const maxBorrow = await lendingContract.getMaxBorrowAmount(userAddress);

// 2. Calculate loan terms
const borrowAmount = ethers.parseEther("50"); // 50 KAIA
const term = 7 * 24 * 60 * 60; // 7 days
const interest = await lendingContract.calculateInterest(userAddress, 0);

// 3. Take loan
await lendingContract.borrow(borrowAmount, term);

// 4. Check loan status
const loans = await lendingContract.getActiveLoans(userAddress);
```

#### Event Listening

```javascript
// Listen for staking events
stakingContract.on('Staked', (user, amount, nodeId, timestamp) => {
  console.log(`User ${user} staked ${ethers.formatUnits(amount, 6)} USDT`);
});

// Listen for lending events
lendingContract.on('LoanTaken', (borrower, kaiaAmount, collateral, term, dueTime) => {
  console.log(`User ${borrower} borrowed ${ethers.formatEther(kaiaAmount)} KAIA`);
});
```

### Error Handling

```javascript
try {
  await stakingContract.stake(amount, nodeId);
} catch (error) {
  if (error.code === 'ACTION_REJECTED') {
    // User rejected transaction
    showToast('Transaction cancelled by user');
  } else if (error.reason === 'Amount below minimum stake') {
    // Contract revert with reason
    showToast('Minimum stake is 10 USDT');
  } else {
    // Other errors
    console.error('Staking failed:', error);
    showToast('Transaction failed. Please try again.');
  }
}
```

---

## LINE LIFF Integration

### LIFF SDK Setup

```javascript
import liff from '@line/liff';

// Initialize LIFF
await liff.init({ liffId: 'your_liff_id' });

// Check login status
if (liff.isLoggedIn()) {
  const profile = await liff.getProfile();
  console.log('User:', profile.displayName);
} else {
  liff.login();
}
```

### Wallet Integration

```javascript
// Access LINE Dapp Portal Wallet
if (liff.ethereum) {
  // Request account access
  const accounts = await liff.ethereum.request({
    method: 'eth_requestAccounts'
  });
  
  // Create ethers provider
  const provider = new ethers.BrowserProvider(liff.ethereum);
  const signer = await provider.getSigner();
}
```

### Social Features

```javascript
// Send LINE message
const message = {
  type: 'text',
  text: 'I just earned 0.5 USDT on USDTide! Join me: https://usdtide.xyz/invite/abc123'
};

await liff.sendMessages([message]);

// Generate invite link
const inviteCode = generateInviteCode(userAddress);
const inviteUrl = `https://usdtide.xyz/invite/${inviteCode}`;

// Share functionality
liff.shareTargetPicker([{
  type: 'text',
  text: `Join USDTide and earn rewards! ${inviteUrl}`
}]);
```

---

## Error Codes & Responses

### Smart Contract Errors

| Error | Description | Solution |
|-------|-------------|----------|
| `Amount below minimum stake` | Stake amount < 10 USDT | Increase stake amount |
| `Invalid node ID` | Node doesn't exist | Use valid node ID |
| `Node is not active` | Node is disabled | Choose different node |
| `Node capacity exceeded` | Node at max capacity | Choose different node |
| `Insufficient collateral` | Not enough staked USDT | Stake more USDT first |
| `Invalid loan term` | Invalid term duration | Use 7, 14, or 30 days |
| `Loan not yet due` | Trying to liquidate early | Wait until due date |

### Frontend Error Handling

```javascript
const ERROR_MESSAGES = {
  'ACTION_REJECTED': 'Transaction cancelled by user',
  'INSUFFICIENT_FUNDS': 'Insufficient balance for transaction',
  'NETWORK_ERROR': 'Network error. Please check connection.',
  'CALL_EXCEPTION': 'Contract call failed. Check parameters.',
  'TIMEOUT': 'Transaction timed out. Please try again.'
};

function handleError(error) {
  const message = ERROR_MESSAGES[error.code] || error.message || 'Unknown error';
  showToast(message);
  console.error('Transaction error:', error);
}
```

---

## Rate Limits & Best Practices

### RPC Rate Limits
- **Kaia Public RPC**: 100 requests/minute
- **Recommendation**: Implement request caching and batching

### Gas Optimization
- **Staking**: ~150,000 gas
- **Lending**: ~200,000 gas  
- **Claiming**: ~100,000 gas

### Caching Strategy
```javascript
// Cache frequently accessed data
const nodeCache = new Map();
const balanceCache = new Map();

// Refresh cache every 30 seconds
setInterval(() => {
  nodeCache.clear();
  balanceCache.clear();
}, 30000);
```

### Security Best Practices

1. **Input Validation**
```javascript
function validateStakeAmount(amount) {
  const minStake = ethers.parseUnits("10", 6);
  if (amount < minStake) {
    throw new Error('Minimum stake is 10 USDT');
  }
}
```

2. **Transaction Verification**
```javascript
// Verify transaction after sending
const tx = await contract.stake(amount, nodeId);
const receipt = await tx.wait();
if (receipt.status !== 1) {
  throw new Error('Transaction failed');
}
```

3. **State Synchronization**
```javascript
// Refresh balances after transactions
async function refreshUserData() {
  const [usdtBalance, stakedAmount, rewards] = await Promise.all([
    usdtToken.balanceOf(userAddress),
    stakingContract.getStakedAmount(userAddress),
    stakingContract.getReward(userAddress)
  ]);
  
  updateUI({ usdtBalance, stakedAmount, rewards });
}
```

---

## Testing & Debugging

### Contract Testing on Kaia Testnet

```bash
# Deploy to testnet
npm run deploy:kaia-testnet

# Get test tokens
# Visit: https://baobab.wallet.klaytn.foundation/faucet

# Test contract interactions
npx hardhat console --network kaia-testnet
```

### Frontend Testing

```javascript
// Mock contract for testing
const mockContract = {
  stake: async (amount, nodeId) => {
    console.log(`Mock stake: ${amount} to node ${nodeId}`);
    return { hash: '0x123...', wait: () => ({ status: 1 }) };
  }
};

// Feature flags for testing
const config = {
  useMockContracts: process.env.NODE_ENV === 'development',
  enableDebugLogs: process.env.NODE_ENV === 'development'
};
```

### Debug Tools

```javascript
// Contract event debugging
stakingContract.on('*', (event) => {
  console.log('Contract event:', event);
});

// Transaction debugging
provider.on('pending', (txHash) => {
  console.log('Pending transaction:', txHash);
});

// Network debugging
provider.getNetwork().then(network => {
  console.log('Connected to network:', network);
});
```

---

## Support & Resources

### Documentation Links
- **Ethers.js**: https://docs.ethers.org/
- **LINE LIFF**: https://developers.line.biz/en/docs/liff/
- **Kaia Docs**: https://docs.kaia.io/
- **Vant UI**: https://vant-contrib.gitee.io/vant/

### Community Support
- **Discord**: Join our development Discord
- **GitHub**: Report issues and contribute
- **Email**: dev@usdtide.xyz

### Contract Verification
All deployed contracts will be verified on Kaia's block explorer with source code and ABI available for public inspection.

---

*This API documentation is kept up-to-date with each release. Last updated: August 2024*