<template>
  <div class="dashboard">
    <!-- Transaction Monitor Component -->
    <TransactionMonitor :wallet-connector="walletConnector" />
    
    <!-- Header Section -->
    <div class="header-section">
      <div class="welcome-card">
        <div class="welcome-content">
          <h2>{{ $t('nav.dashboard') }}</h2>
          <p class="welcome-text">
            Welcome back, {{ user?.displayName || 'User' }}!
          </p>
        </div>
        <div class="welcome-icon">
          <van-image
            :src="user?.pictureUrl || '/default-avatar.png'"
            round
            width="50"
            height="50"
          />
        </div>
      </div>
    </div>

    <!-- Total Assets Section -->
    <div class="assets-section">
      <van-card class="assets-card">
        <template #title>
          <div class="card-title">
            <van-icon name="gold-coin-o" />
            <span>Total Assets</span>
          </div>
        </template>
        
        <div class="assets-content">
          <div class="total-value">
            <h1>${{ totalAssetsUSD }}</h1>
            <p class="value-change" :class="{ 'positive': priceChange >= 0, 'negative': priceChange < 0 }">
              <van-icon :name="priceChange >= 0 ? 'arrow-up' : 'arrow-down'" />
              {{ Math.abs(priceChange).toFixed(2) }}% (24h)
            </p>
          </div>
          
          <van-grid :column-num="2" :border="false" class="assets-grid">
            <van-grid-item>
              <div class="asset-item">
                <img src="@/assets/usdt-icon.svg" alt="USDT" class="asset-icon" />
                <div class="asset-info">
                  <p class="asset-amount">{{ formatBalance(usdtBalance, 6) }}</p>
                  <p class="asset-symbol">USDT</p>
                </div>
              </div>
            </van-grid-item>
            
            <van-grid-item>
              <div class="asset-item">
                <img src="@/assets/kaia-icon.svg" alt="KAIA" class="asset-icon" />
                <div class="asset-info">
                  <p class="asset-amount">{{ formatBalance(kaiaBalance, 18) }}</p>
                  <p class="asset-symbol">KAIA</p>
                </div>
              </div>
            </van-grid-item>
          </van-grid>
        </div>
      </van-card>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <h3 class="section-title">Quick Actions</h3>
      <van-grid :column-num="2" :border="false" class="actions-grid">
        <van-grid-item @click="goToStaking">
          <div class="action-item">
            <div class="action-icon staking">
              <van-icon name="gold-coin-o" size="24" />
            </div>
            <p class="action-title">Stake USDT</p>
            <p class="action-subtitle">Earn 4-6% APY</p>
          </div>
        </van-grid-item>
        
        <van-grid-item @click="goToLending">
          <div class="action-item">
            <div class="action-icon lending">
              <van-icon name="credit-pay" size="24" />
            </div>
            <p class="action-title">Borrow KAIA</p>
            <p class="action-subtitle">70% LTV Ratio</p>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <h3 class="section-title">Your Activity</h3>
      
      <van-grid :column-num="3" :border="false" class="stats-grid">
        <van-grid-item>
          <div class="stat-item">
            <p class="stat-value">${{ stakedValueUSD }}</p>
            <p class="stat-label">Staked Value</p>
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="stat-item">
            <p class="stat-value">${{ earnedRewardsUSD }}</p>
            <p class="stat-label">Earned Rewards</p>
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="stat-item">
            <p class="stat-value">${{ borrowedValueUSD }}</p>
            <p class="stat-label">Borrowed Value</p>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- Recent Transactions -->
    <div class="transactions-section">
      <div class="section-header">
        <h3 class="section-title">Recent Transactions</h3>
        <van-button type="default" size="small" @click="viewAllTransactions">
          View All
        </van-button>
      </div>
      
      <div class="transactions-list">
        <van-empty v-if="recentTransactions.length === 0" description="No transactions yet">
          <template #image>
            <van-icon name="orders-o" size="60" color="#dcdee0" />
          </template>
        </van-empty>
        
        <van-cell
          v-for="tx in recentTransactions"
          :key="tx.id"
          :title="tx.type"
          :value="formatTransactionValue(tx)"
          :label="formatTransactionDate(tx.timestamp)"
          class="transaction-item"
        >
          <template #icon>
            <div class="transaction-icon" :class="tx.type.toLowerCase()">
              <van-icon :name="getTransactionIcon(tx.type)" size="20" />
            </div>
          </template>
          
          <template #right-icon>
            <van-tag
              :type="getTransactionStatus(tx.status)"
              size="small"
            >
              {{ tx.status }}
            </van-tag>
          </template>
        </van-cell>
      </div>
    </div>

    <!-- Social Features Component -->
    <SocialFeatures :wallet-connector="walletConnector" />
    
    <!-- Market Info -->
    <div class="market-section">
      <h3 class="section-title">Market Information</h3>
      
      <van-grid :column-num="2" :border="false" class="market-grid">
        <van-grid-item>
          <div class="market-item">
            <p class="market-label">USDT/USD</p>
            <p class="market-value">$1.000</p>
            <p class="market-change positive">+0.01%</p>
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="market-item">
            <p class="market-label">KAIA/USD</p>
            <p class="market-value">${{ kaiaPrice }}</p>
            <p class="market-change" :class="{ 'positive': kaiaPriceChange >= 0, 'negative': kaiaPriceChange < 0 }">
              {{ kaiaPriceChange >= 0 ? '+' : '' }}{{ kaiaPriceChange.toFixed(2) }}%
            </p>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- Pull to Refresh -->
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <div class="refresh-placeholder"></div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ethers } from 'ethers'
import { showToast } from 'vant'
import TransactionMonitor from '@/components/TransactionMonitor.vue'
import SocialFeatures from '@/components/SocialFeatures.vue'

// Props
const props = defineProps({
  liff: Object,
  user: Object,
  isLoggedIn: Boolean,
  walletConnector: Object
})

// Emits
const emit = defineEmits(['update-title'])

// Router
const router = useRouter()

// Reactive state
const refreshing = ref(false)
const loading = ref(false)
const usdtBalance = ref('0')
const kaiaBalance = ref('0')
const stakedAmount = ref('0')
const earnedRewards = ref('0')
const borrowedAmount = ref('0')
const recentTransactions = ref([])

// Market data (mock for now)
const kaiaPrice = ref('0.15')
const kaiaPriceChange = ref(2.34)
const priceChange = ref(1.25)

// Auto-refresh interval
let refreshInterval = null

// Computed values
const totalAssetsUSD = computed(() => {
  const usdtValue = parseFloat(formatBalance(usdtBalance.value, 6))
  const kaiaValue = parseFloat(formatBalance(kaiaBalance.value, 18)) * parseFloat(kaiaPrice.value)
  return (usdtValue + kaiaValue).toFixed(2)
})

const stakedValueUSD = computed(() => {
  const staked = parseFloat(formatBalance(stakedAmount.value, 6))
  return staked.toFixed(2)
})

const earnedRewardsUSD = computed(() => {
  const rewards = parseFloat(formatBalance(earnedRewards.value, 6))
  return rewards.toFixed(2)
})

const borrowedValueUSD = computed(() => {
  const borrowed = parseFloat(formatBalance(borrowedAmount.value, 18)) * parseFloat(kaiaPrice.value)
  return borrowed.toFixed(2)
})

// Methods
const formatBalance = (balance, decimals) => {
  if (!balance || balance === '0') return '0.00'
  
  try {
    const formatted = ethers.formatUnits(balance, decimals)
    const num = parseFloat(formatted)
    
    if (num < 0.01) return '< 0.01'
    if (num < 1) return num.toFixed(4)
    if (num < 1000) return num.toFixed(2)
    
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  } catch (error) {
    return '0.00'
  }
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    
    if (props.walletConnector?.isConnected) {
      // Load wallet balances
      await props.walletConnector.loadBalances()
      
      usdtBalance.value = props.walletConnector.usdtBalance
      kaiaBalance.value = props.walletConnector.kaiaBalance
      
      // Load staking data (mock for now)
      stakedAmount.value = ethers.parseUnits('250', 6).toString()
      earnedRewards.value = ethers.parseUnits('3.75', 6).toString()
      
      // Load lending data (mock for now)
      borrowedAmount.value = ethers.parseEther('125').toString()
      
      // Load recent transactions (mock for now)
      recentTransactions.value = [
        {
          id: '1',
          type: 'Stake',
          amount: '100',
          symbol: 'USDT',
          status: 'Success',
          timestamp: Date.now() - 3600000 // 1 hour ago
        },
        {
          id: '2',
          type: 'Borrow',
          amount: '50',
          symbol: 'KAIA',
          status: 'Success',
          timestamp: Date.now() - 7200000 // 2 hours ago
        },
        {
          id: '3',
          type: 'Claim',
          amount: '1.25',
          symbol: 'USDT',
          status: 'Success',
          timestamp: Date.now() - 86400000 // 1 day ago
        }
      ]
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
    showToast('Failed to load dashboard data')
  } finally {
    loading.value = false
  }
}

const handleRefresh = async () => {
  await loadDashboardData()
  refreshing.value = false
  showToast('Dashboard refreshed')
}

const goToStaking = () => {
  router.push('/staking')
}

const goToLending = () => {
  router.push('/lending')
}

const viewAllTransactions = () => {
  router.push('/profile?tab=history')
}

const formatTransactionValue = (tx) => {
  return `${tx.amount} ${tx.symbol}`
}

const formatTransactionDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffHours = diffMs / (1000 * 60 * 60)
  
  if (diffHours < 1) {
    return `${Math.floor(diffMs / (1000 * 60))} min ago`
  } else if (diffHours < 24) {
    return `${Math.floor(diffHours)} hours ago`
  } else {
    return date.toLocaleDateString()
  }
}

const getTransactionIcon = (type) => {
  switch (type) {
    case 'Stake': return 'gold-coin-o'
    case 'Unstake': return 'exchange'
    case 'Borrow': return 'credit-pay'
    case 'Repay': return 'passed'
    case 'Claim': return 'gift-o'
    default: return 'orders-o'
  }
}

const getTransactionStatus = (status) => {
  switch (status) {
    case 'Success': return 'success'
    case 'Pending': return 'warning'
    case 'Failed': return 'danger'
    default: return 'default'
  }
}

const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    loadDashboardData()
  }, 60000) // Refresh every minute
}

const stopAutoRefresh = () => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}

// Lifecycle
onMounted(() => {
  emit('update-title', 'Dashboard')
  loadDashboardData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})

// Watch for wallet connection changes
watch(() => props.walletConnector?.isConnected, (isConnected) => {
  if (isConnected) {
    loadDashboardData()
  }
})
</script>

<style scoped>
.dashboard {
  padding: 1rem;
  min-height: 100vh;
  background: #f7f8fa;
}

.header-section {
  margin-bottom: 1.5rem;
}

.welcome-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
}

.welcome-content h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.welcome-text {
  margin: 0;
  opacity: 0.9;
  font-size: 0.95rem;
}

.assets-section {
  margin-bottom: 1.5rem;
}

.assets-card {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.assets-content {
  padding: 1rem 0;
}

.total-value {
  text-align: center;
  margin-bottom: 1.5rem;
}

.total-value h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  color: #323233;
}

.value-change {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  font-weight: 500;
}

.value-change.positive {
  color: #07c160;
}

.value-change.negative {
  color: #ee0a24;
}

.assets-grid .asset-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.asset-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.asset-amount {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #323233;
}

.asset-symbol {
  margin: 0;
  font-size: 0.85rem;
  color: #969799;
}

.section-title {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #323233;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.actions-section,
.stats-section,
.transactions-section,
.market-section {
  margin-bottom: 1.5rem;
}

.action-item {
  text-align: center;
  padding: 1.5rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.action-item:active {
  transform: scale(0.98);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 0.75rem;
  color: white;
}

.action-icon.staking {
  background: linear-gradient(135deg, #ffd700, #ffeb3b);
}

.action-icon.lending {
  background: linear-gradient(135deg, #2196f3, #21cbf3);
}

.action-title {
  margin: 0 0 0.25rem;
  font-weight: 600;
  color: #323233;
}

.action-subtitle {
  margin: 0;
  font-size: 0.8rem;
  color: #969799;
}

.stat-item {
  text-align: center;
  padding: 1rem 0.5rem;
}

.stat-value {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 600;
  color: #323233;
}

.stat-label {
  margin: 0;
  font-size: 0.8rem;
  color: #969799;
}

.transactions-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.transaction-item {
  padding: 1rem;
}

.transaction-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: white;
}

.transaction-icon.stake {
  background: #ffd700;
}

.transaction-icon.borrow {
  background: #2196f3;
}

.transaction-icon.claim {
  background: #07c160;
}

.market-grid .market-item {
  text-align: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.market-label {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #969799;
}

.market-value {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #323233;
}

.market-change {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 500;
}

.market-change.positive {
  color: #07c160;
}

.market-change.negative {
  color: #ee0a24;
}

.refresh-placeholder {
  height: 1px;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .dashboard {
    padding: 0.75rem;
  }
  
  .welcome-card {
    padding: 1.25rem;
  }
  
  .welcome-content h2 {
    font-size: 1.3rem;
  }
  
  .total-value h1 {
    font-size: 2.2rem;
  }
  
  .action-item {
    padding: 1.25rem 0.75rem;
  }
  
  .action-icon {
    width: 40px;
    height: 40px;
  }
}

@media (max-width: 375px) {
  .dashboard {
    padding: 0.5rem;
  }
  
  .welcome-card {
    padding: 1rem;
  }
  
  .total-value h1 {
    font-size: 2rem;
  }
  
  .action-item {
    padding: 1rem 0.5rem;
  }
}
</style>