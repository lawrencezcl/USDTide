<template>
  <div class="staking">
    <!-- Header Section -->
    <div class="header-section">
      <div class="stats-card">
        <div class="stat-item">
          <h3>${{ totalStakedUSD }}</h3>
          <p>Total Staked</p>
        </div>
        <div class="stat-item">
          <h3>${{ totalEarnedUSD }}</h3>
          <p>Total Earned</p>
        </div>
        <div class="stat-item">
          <h3>{{ averageAPY }}%</h3>
          <p>Average APY</p>
        </div>
      </div>
    </div>

    <!-- Balance Section -->
    <div class="balance-section">
      <van-card class="balance-card">
        <template #title>
          <div class="card-title">
            <van-icon name="gold-coin-o" />
            <span>Available Balance</span>
          </div>
        </template>
        
        <div class="balance-content">
          <div class="balance-display">
            <h2>{{ formatBalance(usdtBalance) }} USDT</h2>
            <p class="balance-usd">${{ formatBalance(usdtBalance) }}</p>
          </div>
          
          <van-button 
            type="primary" 
            size="small" 
            @click="refreshBalance"
            :loading="loadingBalance"
          >
            Refresh
          </van-button>
        </div>
      </van-card>
    </div>

    <!-- Node Selection -->
    <div class="nodes-section">
      <h3 class="section-title">Select Validator Node</h3>
      
      <div class="nodes-list">
        <van-card 
          v-for="(node, index) in nodes" 
          :key="index"
          class="node-card"
          :class="{ 'selected': selectedNodeId === index, 'inactive': !node.isActive }"
          @click="selectNode(index)"
        >
          <template #thumb>
            <div class="node-icon">
              <van-icon name="service-o" size="24" />
            </div>
          </template>
          
          <template #title>
            <div class="node-title">
              <span>{{ node.name }}</span>
              <van-tag 
                v-if="node.isActive" 
                type="success" 
                size="small"
              >
                Active
              </van-tag>
              <van-tag 
                v-else 
                type="default" 
                size="small"
              >
                Inactive
              </van-tag>
            </div>
          </template>
          
          <template #desc>
            <div class="node-details">
              <div class="node-stat">
                <span class="label">APY:</span>
                <span class="value apy">{{ (node.annualRate / 100).toFixed(1) }}%</span>
              </div>
              <div class="node-stat">
                <span class="label">Rating:</span>
                <div class="rating">
                  <van-icon 
                    v-for="star in 5" 
                    :key="star"
                    name="star"
                    :class="{ 'filled': star <= node.securityRating }"
                    size="12"
                  />
                </div>
              </div>
              <div class="node-stat">
                <span class="label">Capacity:</span>
                <span class="value">{{ formatCapacity(node) }}</span>
              </div>
            </div>
          </template>
        </van-card>
      </div>
    </div>

    <!-- Staking Form -->
    <div class="staking-form-section">
      <van-card class="staking-form-card">
        <template #title>
          <div class="card-title">
            <van-icon name="gold-coin-o" />
            <span>Stake USDT</span>
          </div>
        </template>
        
        <van-form @submit="handleStake">
          <van-field
            v-model="stakeAmount"
            name="amount"
            label="Amount"
            placeholder="Enter USDT amount"
            type="number"
            :rules="[{ required: true, message: 'Please enter amount' }]"
          >
            <template #suffix>
              <span class="currency">USDT</span>
            </template>
            <template #button>
              <van-button 
                size="small" 
                type="default"
                @click="setMaxAmount"
              >
                MAX
              </van-button>
            </template>
          </van-field>
          
          <!-- Amount Buttons -->
          <div class="amount-buttons">
            <van-button 
              v-for="amount in quickAmounts" 
              :key="amount"
              size="small"
              type="default"
              @click="setQuickAmount(amount)"
            >
              {{ amount }} USDT
            </van-button>
          </div>
          
          <!-- Earnings Calculator -->
          <div class="earnings-calculator" v-if="stakeAmount && selectedNodeId !== null">
            <van-divider>Estimated Earnings</van-divider>
            
            <div class="earnings-grid">
              <div class="earning-item">
                <p class="period">Daily</p>
                <p class="amount">${{ calculateEarnings('daily') }}</p>
              </div>
              <div class="earning-item">
                <p class="period">Monthly</p>
                <p class="amount">${{ calculateEarnings('monthly') }}</p>
              </div>
              <div class="earning-item">
                <p class="period">Yearly</p>
                <p class="amount">${{ calculateEarnings('yearly') }}</p>
              </div>
            </div>
            
            <van-notice-bar
              left-icon="info-o"
              text="Estimated earnings are not guaranteed and may vary based on network conditions."
              color="#1989fa"
              background="#e8f4ff"
            />
          </div>
          
          <div class="form-actions">
            <van-button 
              type="primary"
              size="large"
              block
              native-type="submit"
              :disabled="!canStake"
              :loading="staking"
            >
              {{ staking ? 'Staking...' : 'Stake USDT' }}
            </van-button>
          </div>
        </van-form>
      </van-card>
    </div>

    <!-- Current Stakes -->
    <div class="current-stakes-section" v-if="userStakes.length > 0">
      <h3 class="section-title">Your Stakes</h3>
      
      <van-card 
        v-for="(stake, index) in userStakes" 
        :key="index"
        class="stake-card"
      >
        <template #title>
          <div class="stake-title">
            <span>{{ getNodeName(stake.nodeId) }}</span>
            <van-tag type="success" size="small">Active</van-tag>
          </div>
        </template>
        
        <div class="stake-details">
          <div class="stake-stat">
            <span class="label">Staked Amount:</span>
            <span class="value">${{ formatBalance(stake.amount) }}</span>
          </div>
          <div class="stake-stat">
            <span class="label">Pending Rewards:</span>
            <span class="value reward">${{ formatBalance(stake.pendingRewards) }}</span>
          </div>
          <div class="stake-stat">
            <span class="label">Stake Date:</span>
            <span class="value">{{ formatDate(stake.stakeTime) }}</span>
          </div>
        </div>
        
        <div class="stake-actions">
          <van-button 
            size="small"
            type="warning"
            @click="withdrawStake(index)"
            :loading="withdrawing === index"
          >
            Withdraw
          </van-button>
          <van-button 
            size="small"
            type="success"
            @click="claimRewards(index)"
            :loading="claiming === index"
            :disabled="stake.pendingRewards === '0'"
          >
            Claim
          </van-button>
        </div>
      </van-card>
    </div>

    <!-- Pull to Refresh -->
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <div class="refresh-placeholder"></div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ethers } from 'ethers'
import { showToast, showDialog, showConfirmDialog } from 'vant'

// Props
const props = defineProps({
  liff: Object,
  user: Object,
  isLoggedIn: Boolean,
  walletConnector: Object
})

// Emits
const emit = defineEmits(['update-title'])

// Reactive state
const refreshing = ref(false)
const loadingBalance = ref(false)
const staking = ref(false)
const withdrawing = ref(null)
const claiming = ref(null)

// Form data
const stakeAmount = ref('')
const selectedNodeId = ref(null)

// Data
const usdtBalance = ref('0')
const nodes = ref([])
const userStakes = ref([])

// Quick amount buttons
const quickAmounts = [10, 50, 100, 500, 1000]

// Mock node data (in production, this would come from the contract)
const mockNodes = [
  {
    name: 'Kaia Wave Node',
    annualRate: 600, // 6.0%
    securityRating: 5,
    isActive: true,
    totalStaked: ethers.parseUnits('500000', 6),
    maxCapacity: ethers.parseUnits('1000000', 6)
  },
  {
    name: 'Kaia Storm Node', 
    annualRate: 550, // 5.5%
    securityRating: 4,
    isActive: true,
    totalStaked: ethers.parseUnits('300000', 6),
    maxCapacity: ethers.parseUnits('500000', 6)
  },
  {
    name: 'Kaia Thunder Node',
    annualRate: 520, // 5.2%
    securityRating: 4,
    isActive: true,
    totalStaked: ethers.parseUnits('200000', 6),
    maxCapacity: ethers.parseUnits('750000', 6)
  }
]

// Mock user stakes
const mockUserStakes = [
  {
    amount: ethers.parseUnits('100', 6),
    nodeId: 0,
    stakeTime: Date.now() - 86400000 * 7, // 7 days ago
    pendingRewards: ethers.parseUnits('1.15', 6)
  },
  {
    amount: ethers.parseUnits('250', 6),
    nodeId: 1,
    stakeTime: Date.now() - 86400000 * 3, // 3 days ago  
    pendingRewards: ethers.parseUnits('1.03', 6)
  }
]

// Computed values
const totalStakedUSD = computed(() => {
  const total = userStakes.value.reduce((sum, stake) => {
    return sum + parseFloat(formatBalance(stake.amount))
  }, 0)
  return total.toFixed(2)
})

const totalEarnedUSD = computed(() => {
  const total = userStakes.value.reduce((sum, stake) => {
    return sum + parseFloat(formatBalance(stake.pendingRewards))
  }, 0)
  return total.toFixed(2)
})

const averageAPY = computed(() => {
  if (userStakes.value.length === 0) return '0.0'
  
  const weightedAPY = userStakes.value.reduce((sum, stake) => {
    const node = nodes.value[stake.nodeId]
    const weight = parseFloat(formatBalance(stake.amount))
    return sum + (node?.annualRate || 0) * weight / 100
  }, 0)
  
  const totalWeight = parseFloat(totalStakedUSD.value)
  return totalWeight > 0 ? (weightedAPY / totalWeight).toFixed(1) : '0.0'
})

const canStake = computed(() => {
  return stakeAmount.value && 
         parseFloat(stakeAmount.value) >= 10 && 
         parseFloat(stakeAmount.value) <= parseFloat(formatBalance(usdtBalance.value)) &&
         selectedNodeId.value !== null &&
         nodes.value[selectedNodeId.value]?.isActive
})

// Methods
const formatBalance = (balance, decimals = 6) => {
  if (!balance || balance === '0') return '0.00'
  
  try {
    const formatted = ethers.formatUnits(balance.toString(), decimals)
    const num = parseFloat(formatted)
    
    if (num < 0.01) return '< 0.01'
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  } catch (error) {
    return '0.00'
  }
}

const formatCapacity = (node) => {
  const used = parseFloat(formatBalance(node.totalStaked))
  const total = parseFloat(formatBalance(node.maxCapacity))
  const percentage = total > 0 ? (used / total * 100).toFixed(1) : 0
  return `${percentage}% used`
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString()
}

const getNodeName = (nodeId) => {
  return nodes.value[nodeId]?.name || 'Unknown Node'
}

const selectNode = (nodeId) => {
  if (nodes.value[nodeId]?.isActive) {
    selectedNodeId.value = nodeId
  }
}

const setMaxAmount = () => {
  stakeAmount.value = formatBalance(usdtBalance.value)
}

const setQuickAmount = (amount) => {
  stakeAmount.value = amount.toString()
}

const calculateEarnings = (period) => {
  if (!stakeAmount.value || selectedNodeId.value === null) return '0.00'
  
  const amount = parseFloat(stakeAmount.value)
  const annualRate = nodes.value[selectedNodeId.value].annualRate / 10000 // Convert basis points to decimal
  
  let multiplier
  switch (period) {
    case 'daily':
      multiplier = 1 / 365
      break
    case 'monthly':
      multiplier = 30 / 365
      break
    case 'yearly':
      multiplier = 1
      break
    default:
      multiplier = 0
  }
  
  const earnings = amount * annualRate * multiplier
  return earnings.toFixed(2)
}

const loadData = async () => {
  try {
    loadingBalance.value = true
    
    // Load balance from wallet connector
    if (props.walletConnector?.isConnected) {
      await props.walletConnector.loadBalances()
      usdtBalance.value = props.walletConnector.usdtBalance
    }
    
    // Load nodes (in production, from contract)
    nodes.value = mockNodes
    
    // Load user stakes (in production, from contract)
    userStakes.value = mockUserStakes
    
    // Auto-select first active node
    if (selectedNodeId.value === null) {
      const firstActiveNode = nodes.value.findIndex(node => node.isActive)
      if (firstActiveNode !== -1) {
        selectedNodeId.value = firstActiveNode
      }
    }
    
  } catch (error) {
    console.error('Failed to load staking data:', error)
    showToast('Failed to load data')
  } finally {
    loadingBalance.value = false
  }
}

const refreshBalance = async () => {
  await loadData()
  showToast('Balance refreshed')
}

const handleRefresh = async () => {
  await loadData()
  refreshing.value = false
  showToast('Data refreshed')
}

const handleStake = async () => {
  try {
    staking.value = true
    
    // Validate inputs
    if (!canStake.value) {
      showToast('Please check your input')
      return
    }
    
    // Confirm stake
    await showConfirmDialog({
      title: 'Confirm Staking',
      message: `Stake ${stakeAmount.value} USDT to ${nodes.value[selectedNodeId.value].name}?`,
    })
    
    // In production, this would call the smart contract
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate transaction
    
    // Add to user stakes (mock)
    userStakes.value.push({
      amount: ethers.parseUnits(stakeAmount.value, 6),
      nodeId: selectedNodeId.value,
      stakeTime: Date.now(),
      pendingRewards: '0'
    })
    
    // Update balance (mock)
    const currentBalance = parseFloat(formatBalance(usdtBalance.value))
    const newBalance = currentBalance - parseFloat(stakeAmount.value)
    usdtBalance.value = ethers.parseUnits(newBalance.toString(), 6)
    
    // Reset form
    stakeAmount.value = ''
    
    showToast('Staking successful!')
    
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('Staking failed:', error)
      showToast('Staking failed. Please try again.')
    }
  } finally {
    staking.value = false
  }
}

const withdrawStake = async (stakeIndex) => {
  try {
    withdrawing.value = stakeIndex
    
    const stake = userStakes.value[stakeIndex]
    
    await showConfirmDialog({
      title: 'Confirm Withdrawal',
      message: `Withdraw ${formatBalance(stake.amount)} USDT from ${getNodeName(stake.nodeId)}?`,
    })
    
    // In production, this would call the smart contract
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Update balance (mock)
    const currentBalance = parseFloat(formatBalance(usdtBalance.value))
    const withdrawAmount = parseFloat(formatBalance(stake.amount))
    const newBalance = currentBalance + withdrawAmount
    usdtBalance.value = ethers.parseUnits(newBalance.toString(), 6)
    
    // Remove stake
    userStakes.value.splice(stakeIndex, 1)
    
    showToast('Withdrawal successful!')
    
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('Withdrawal failed:', error)
      showToast('Withdrawal failed. Please try again.')
    }
  } finally {
    withdrawing.value = null
  }
}

const claimRewards = async (stakeIndex) => {
  try {
    claiming.value = stakeIndex
    
    const stake = userStakes.value[stakeIndex]
    
    if (stake.pendingRewards === '0') {
      showToast('No rewards to claim')
      return
    }
    
    // In production, this would call the smart contract
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Update balance (mock)
    const currentBalance = parseFloat(formatBalance(usdtBalance.value))
    const rewardAmount = parseFloat(formatBalance(stake.pendingRewards))
    const newBalance = currentBalance + rewardAmount
    usdtBalance.value = ethers.parseUnits(newBalance.toString(), 6)
    
    // Reset rewards
    stake.pendingRewards = '0'
    
    showToast(`Claimed ${rewardAmount.toFixed(2)} USDT rewards!`)
    
  } catch (error) {
    console.error('Claim failed:', error)
    showToast('Claim failed. Please try again.')
  } finally {
    claiming.value = null
  }
}

// Lifecycle
onMounted(() => {
  emit('update-title', 'Staking')
  loadData()
})

// Watch for wallet connection changes
watch(() => props.walletConnector?.isConnected, (isConnected) => {
  if (isConnected) {
    loadData()
  }
})
</script>

<style scoped>
.staking {
  padding: 1rem;
  min-height: 100vh;
  background: #f7f8fa;
}

/* Header Section */
.header-section {
  margin-bottom: 1.5rem;
}

.stats-card {
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-item h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-item p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Balance Section */
.balance-section {
  margin-bottom: 1.5rem;
}

.balance-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.balance-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.balance-display h2 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #323233;
}

.balance-usd {
  margin: 0;
  color: #969799;
  font-size: 0.9rem;
}

/* Nodes Section */
.nodes-section {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #323233;
}

.nodes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.node-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 2px solid transparent;
}

.node-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.node-card.selected {
  border-color: #1989fa;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.node-card.inactive {
  opacity: 0.6;
  cursor: not-allowed;
}

.node-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd700, #ffeb3b);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.node-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.node-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.node-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-stat .label {
  color: #646566;
  font-size: 0.85rem;
}

.node-stat .value {
  font-weight: 600;
  color: #323233;
}

.node-stat .value.apy {
  color: #07c160;
  font-size: 1.1rem;
}

.rating {
  display: flex;
  gap: 2px;
}

.rating .van-icon {
  color: #dcdee0;
}

.rating .van-icon.filled {
  color: #ffd700;
}

/* Staking Form */
.staking-form-section {
  margin-bottom: 1.5rem;
}

.staking-form-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.currency {
  color: #969799;
  font-size: 0.9rem;
}

.amount-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.amount-buttons .van-button {
  flex: 1;
  min-width: 80px;
}

/* Earnings Calculator */
.earnings-calculator {
  margin: 1.5rem 0;
}

.earnings-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin: 1rem 0;
}

.earning-item {
  text-align: center;
  padding: 1rem;
  background: #f7f8fa;
  border-radius: 12px;
}

.earning-item .period {
  margin: 0 0 0.5rem;
  color: #646566;
  font-size: 0.85rem;
}

.earning-item .amount {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #07c160;
}

.form-actions {
  margin-top: 1.5rem;
}

/* Current Stakes */
.current-stakes-section {
  margin-bottom: 1.5rem;
}

.stake-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.75rem;
}

.stake-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.stake-details {
  margin: 1rem 0;
}

.stake-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stake-stat:last-child {
  margin-bottom: 0;
}

.stake-stat .label {
  color: #646566;
  font-size: 0.9rem;
}

.stake-stat .value {
  font-weight: 600;
  color: #323233;
}

.stake-stat .value.reward {
  color: #07c160;
}

.stake-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.stake-actions .van-button {
  flex: 1;
}

.refresh-placeholder {
  height: 1px;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .staking {
    padding: 0.75rem;
  }
  
  .stats-card {
    padding: 1.25rem;
  }
  
  .stat-item h3 {
    font-size: 1.1rem;
  }
  
  .balance-display h2 {
    font-size: 1.3rem;
  }
  
  .earnings-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .earning-item {
    padding: 0.75rem;
  }
  
  .amount-buttons .van-button {
    min-width: 70px;
  }
}

@media (max-width: 375px) {
  .staking {
    padding: 0.5rem;
  }
  
  .stats-card {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-item h3 {
    font-size: 1rem;
  }
  
  .balance-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .stake-actions {
    flex-direction: column;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .earning-item {
    background: #2d2d2d;
    color: #ffffff;
  }
  
  .node-stat .label,
  .stake-stat .label {
    color: #a8a8a8;
  }
}
</style>