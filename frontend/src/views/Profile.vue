<template>
  <div class="profile">
    <!-- Header Section -->
    <div class="header-section">
      <div class="user-info">
        <van-image
          :src="user?.pictureUrl || '/default-avatar.png'"
          round
          width="60"
          height="60"
          class="user-avatar"
        />
        <div class="user-details">
          <h2>{{ user?.displayName || 'User' }}</h2>
          <p>{{ user?.statusMessage || 'LINE User' }}</p>
        </div>
      </div>
      
      <div class="profile-stats">
        <div class="stat-item">
          <h3>${{ totalPortfolioValue }}</h3>
          <p>Portfolio Value</p>
        </div>
        <div class="stat-item">
          <h3>${{ totalEarnings }}</h3>
          <p>Total Earnings</p>
        </div>
        <div class="stat-item">
          <h3>{{ totalTransactions }}</h3>
          <p>Transactions</p>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="actions-section">
      <van-grid :column-num="4" :border="false">
        <van-grid-item icon="gold-coin-o" text="Staking" @click="goToStaking" />
        <van-grid-item icon="credit-pay" text="Lending" @click="goToLending" />
        <van-grid-item icon="friends-o" text="Invite" @click="goToInvite" />
        <van-grid-item icon="setting-o" text="Settings" @click="goToSettings" />
      </van-grid>
    </div>

    <!-- Asset Overview -->
    <div class="assets-section">
      <van-card class="assets-card">
        <template #title>
          <div class="card-title">
            <van-icon name="balance-list-o" />
            <span>My Assets</span>
          </div>
        </template>
        
        <van-cell-group>
          <van-cell title="USDT Balance" :value="`${formatBalance(usdtBalance)} USDT`" />
          <van-cell title="Staked USDT" :value="`${formatBalance(stakedAmount)} USDT`" />
          <van-cell title="KAIA Balance" :value="`${formatBalance(kaiaBalance, 18)} KAIA`" />
          <van-cell title="Borrowed KAIA" :value="`${formatBalance(borrowedAmount, 18)} KAIA`" />
        </van-cell-group>
      </van-card>
    </div>

    <!-- Transaction History -->
    <div class="transactions-section">
      <van-card class="transactions-card">
        <template #title>
          <div class="card-title">
            <van-icon name="records" />
            <span>Transaction History</span>
            <van-button
              size="mini"
              type="default"
              class="refresh-btn"
              @click="refreshTransactions"
              :loading="loadingTransactions"
            >
              Refresh
            </van-button>
          </div>
        </template>
        
        <van-tabs v-model:active="activeTab" @change="onTabChange">
          <van-tab title="All" name="all"></van-tab>
          <van-tab title="Staking" name="staking"></van-tab>
          <van-tab title="Lending" name="lending"></van-tab>
          <van-tab title="Rewards" name="rewards"></van-tab>
        </van-tabs>
        
        <van-list
          v-model:loading="loadingTransactions"
          :finished="finishedLoading"
          finished-text="No more transactions"
          @load="loadTransactions"
        >
          <van-cell
            v-for="(transaction, index) in filteredTransactions"
            :key="index"
            :title="transaction.title"
            :label="formatTransactionDate(transaction.timestamp)"
            :value="formatTransactionValue(transaction)"
            :value-class="getTransactionValueClass(transaction)"
            @click="showTransactionDetails(transaction)"
          >
            <template #icon>
              <div class="transaction-icon" :class="getTransactionIconClass(transaction.type)">
                <van-icon :name="getTransactionIcon(transaction.type)" />
              </div>
            </template>
            <template #right-icon>
              <van-tag :type="getTransactionStatusType(transaction.status)" size="mini">
                {{ transaction.status }}
              </van-tag>
            </template>
          </van-cell>
          
          <div v-if="filteredTransactions.length === 0 && !loadingTransactions" class="empty-state">
            <van-empty description="No transactions yet">
              <template #image>
                <van-icon name="records" size="60" color="#c8c9cc" />
              </template>
              <p>Start staking or lending to see your transaction history</p>
            </van-empty>
          </div>
        </van-list>
      </van-card>
    </div>

    <!-- Analytics Section -->
    <div class="analytics-section">
      <van-card class="analytics-card">
        <template #title>
          <div class="card-title">
            <van-icon name="bar-chart-o" />
            <span>Earnings Analytics</span>
          </div>
        </template>
        
        <div class="analytics-content">
          <div class="chart-container">
            <div class="chart-placeholder">
              <van-icon name="chart-trending-o" size="40" color="#c8c9cc" />
              <p>Earnings Chart</p>
              <small>Coming soon</small>
            </div>
          </div>
          
          <div class="analytics-stats">
            <div class="stat-row">
              <span>Staking Rewards:</span>
              <span class="value">${{ stakingRewards }}</span>
            </div>
            <div class="stat-row">
              <span>Lending Interest:</span>
              <span class="value">${{ lendingInterest }}</span>
            </div>
            <div class="stat-row">
              <span>Referral Rewards:</span>
              <span class="value">${{ referralRewards }}</span>
            </div>
            <div class="stat-row total">
              <span>Total Earnings:</span>
              <span class="value">${{ totalEarnings }}</span>
            </div>
          </div>
        </div>
      </van-card>
    </div>

    <!-- Transaction Detail Popup -->
    <van-popup
      v-model:show="showTransactionDetail"
      position="bottom"
      :style="{ height: '60%' }"
      round
    >
      <div class="transaction-detail">
        <van-nav-bar
          title="Transaction Details"
          left-arrow
          @click-left="showTransactionDetail = false"
        />
        
        <div class="detail-content" v-if="selectedTransaction">
          <div class="detail-header">
            <div class="detail-icon" :class="getTransactionIconClass(selectedTransaction.type)">
              <van-icon :name="getTransactionIcon(selectedTransaction.type)" size="24" />
            </div>
            <h3>{{ selectedTransaction.title }}</h3>
            <van-tag :type="getTransactionStatusType(selectedTransaction.status)" size="medium">
              {{ selectedTransaction.status }}
            </van-tag>
          </div>
          
          <van-cell-group>
            <van-cell title="Amount" :value="formatTransactionValue(selectedTransaction)" />
            <van-cell title="Date" :value="formatTransactionDate(selectedTransaction.timestamp)" />
            <van-cell title="Transaction Hash" :value="truncateAddress(selectedTransaction.hash)" />
            <van-cell title="Network" :value="selectedTransaction.network" />
            <van-cell title="Gas Fee" :value="selectedTransaction.gasFee ? `${selectedTransaction.gasFee} KAIA` : 'N/A'" />
          </van-cell-group>
          
          <div class="detail-actions">
            <van-button
              v-if="selectedTransaction.hash"
              type="default"
              block
              @click="viewOnExplorer(selectedTransaction.hash)"
            >
              View on Explorer
            </van-button>
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatBalance, truncateAddress, formatDate } from '@/utils/helpers'

// Props
const props = defineProps({
  user: Object,
  walletConnector: Object
})

// Emits
const emit = defineEmits(['update-title'])

// Router
const router = useRouter()

// Reactive state
const activeTab = ref('all')
const showTransactionDetail = ref(false)
const selectedTransaction = ref(null)
const loadingTransactions = ref(false)
const finishedLoading = ref(false)

// User data
const usdtBalance = ref(0)
const kaiaBalance = ref(0)
const stakedAmount = ref(0)
const borrowedAmount = ref(0)
const totalEarnings = ref(0)
const stakingRewards = ref(0)
const lendingInterest = ref(0)
const referralRewards = ref(0)
const totalTransactions = ref(0)

// Transactions data
const transactions = ref([])
const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') return transactions.value
  return transactions.value.filter(tx => tx.category === activeTab.value)
})

// Computed properties
const totalPortfolioValue = computed(() => {
  const usdtValue = parseFloat(usdtBalance.value) + parseFloat(stakedAmount.value)
  const kaiaValue = parseFloat(kaiaBalance.value) * 0.5 // Assuming 1 KAIA = $0.5 USD
  return (usdtValue + kaiaValue - parseFloat(borrowedAmount.value)).toFixed(2)
})

// Initialize component
onMounted(() => {
  emit('update-title', 'Profile')
  loadUserData()
  loadTransactions()
})

// Load user data
const loadUserData = async () => {
  if (!props.walletConnector || !props.walletConnector.isConnected) return
  
  try {
    // Load balances
    usdtBalance.value = await props.walletConnector.getUsdtBalance()
    kaiaBalance.value = await props.walletConnector.getKaiaBalance()
    
    // Load staking data
    const stakingData = await props.walletConnector.getStakingData()
    stakedAmount.value = stakingData.totalStaked || 0
    stakingRewards.value = stakingData.pendingRewards || 0
    
    // Load lending data
    const lendingData = await props.walletConnector.getLendingData()
    borrowedAmount.value = lendingData.totalBorrowed || 0
    lendingInterest.value = lendingData.pendingInterest || 0
    
    // Calculate totals
    totalEarnings.value = (parseFloat(stakingRewards.value) + 
                          parseFloat(lendingInterest.value) + 
                          parseFloat(referralRewards.value)).toFixed(2)
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

// Load transactions
const loadTransactions = async () => {
  if (!props.walletConnector || !props.walletConnector.isConnected) return
  
  loadingTransactions.value = true
  
  try {
    // In a real implementation, this would fetch from the blockchain or API
    // For now, we'll use mock data
    const mockTransactions = [
      {
        id: 1,
        title: 'Stake USDT',
        type: 'stake',
        category: 'staking',
        amount: '100',
        status: 'Confirmed',
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        hash: '0x1234...5678',
        network: 'Kaia Testnet',
        gasFee: '0.001'
      },
      {
        id: 2,
        title: 'Claim Rewards',
        type: 'reward',
        category: 'rewards',
        amount: '2.5',
        status: 'Confirmed',
        timestamp: new Date(Date.now() - 172800000), // 2 days ago
        hash: '0x2345...6789',
        network: 'Kaia Testnet',
        gasFee: '0.001'
      },
      {
        id: 3,
        title: 'Borrow KAIA',
        type: 'borrow',
        category: 'lending',
        amount: '50',
        status: 'Confirmed',
        timestamp: new Date(Date.now() - 259200000), // 3 days ago
        hash: '0x3456...7890',
        network: 'Kaia Testnet',
        gasFee: '0.001'
      },
      {
        id: 4,
        title: 'Repay Loan',
        type: 'repay',
        category: 'lending',
        amount: '52.5',
        status: 'Confirmed',
        timestamp: new Date(Date.now() - 345600000), // 4 days ago
        hash: '0x4567...8901',
        network: 'Kaia Testnet',
        gasFee: '0.001'
      },
      {
        id: 5,
        title: 'Referral Reward',
        type: 'referral',
        category: 'rewards',
        amount: '0.5',
        status: 'Confirmed',
        timestamp: new Date(Date.now() - 432000000), // 5 days ago
        hash: '0x5678...9012',
        network: 'Kaia Testnet',
        gasFee: '0.001'
      }
    ]
    
    transactions.value = mockTransactions
    totalTransactions.value = mockTransactions.length
    finishedLoading.value = true
  } catch (error) {
    console.error('Error loading transactions:', error)
  } finally {
    loadingTransactions.value = false
  }
}

// Refresh transactions
const refreshTransactions = () => {
  loadTransactions()
}

// Handle tab change
const onTabChange = () => {
  // Tab change handled by filteredTransactions computed property
}

// Show transaction details
const showTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetail.value = true
}

// Format transaction date
const formatTransactionDate = (timestamp) => {
  return formatDate(timestamp)
}

// Format transaction value
const formatTransactionValue = (transaction) => {
  const prefix = transaction.type === 'stake' || transaction.type === 'borrow' || transaction.type === 'repay' ? '' : '+'
  return `${prefix}${transaction.amount} ${transaction.type === 'borrow' || transaction.type === 'repay' ? 'KAIA' : 'USDT'}`
}

// Get transaction value class
const getTransactionValueClass = (transaction) => {
  return transaction.type === 'stake' || transaction.type === 'borrow' || transaction.type === 'repay' ? 'negative' : 'positive'
}

// Get transaction icon
const getTransactionIcon = (type) => {
  const icons = {
    stake: 'gold-coin-o',
    borrow: 'credit-pay',
    repay: 'refund-o',
    reward: 'award-o',
    referral: 'friends-o'
  }
  return icons[type] || 'records'
}

// Get transaction icon class
const getTransactionIconClass = (type) => {
  return `icon-${type}`
}

// Get transaction status type
const getTransactionStatusType = (status) => {
  const types = {
    Confirmed: 'success',
    Pending: 'warning',
    Failed: 'danger'
  }
  return types[status] || 'default'
}

// View on explorer
const viewOnExplorer = (hash) => {
  // In a real implementation, this would open the Kaia explorer
  window.open(`https://baobab.scope.klaytn.com/tx/${hash}`, '_blank')
}

// Navigation functions
const goToStaking = () => router.push('/staking')
const goToLending = () => router.push('/lending')
const goToInvite = () => router.push('/invite')
const goToSettings = () => router.push('/settings')
</script>

<style scoped>
.profile {
  padding: 1rem;
  min-height: 100vh;
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #323233;
}

p {
  text-align: center;
  color: #969799;
  margin-bottom: 2rem;
}
</style>