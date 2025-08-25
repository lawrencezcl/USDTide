<template>
  <div class="transaction-monitor">
    <!-- Notification Bell -->
    <div class="notification-bell" @click="showNotifications = true">
      <van-badge :content="unreadCount" :max="99" v-if="unreadCount > 0">
        <van-icon name="bell" size="24" />
      </van-badge>
      <van-icon v-else name="bell-o" size="24" />
    </div>

    <!-- Notifications Popup -->
    <van-popup
      v-model:show="showNotifications"
      position="right"
      :style="{ width: '100%', height: '100%' }"
    >
      <div class="notifications-panel">
        <van-nav-bar
          title="Notifications"
          left-arrow
          @click-left="showNotifications = false"
        />
        
        <van-tabs v-model:active="activeTab">
          <van-tab title="All" name="all">
            <van-list
              v-model:loading="loadingNotifications"
              :finished="notificationsFinished"
              finished-text="No more notifications"
              @load="loadNotifications"
            >
              <van-cell-group>
                <van-swipe-cell
                  v-for="notification in notifications"
                  :key="notification.id"
                >
                  <van-cell
                    :title="notification.title"
                    :label="notification.description"
                    :icon="getNotificationIcon(notification.type)"
                    :class="{ 'unread': !notification.read }"
                    @click="markAsRead(notification)"
                  >
                    <template #value>
                      <div class="notification-meta">
                        <span class="time">{{ formatDateRelative(notification.timestamp) }}</span>
                        <van-tag :type="getStatusType(notification.status)" size="small">
                          {{ getStatusText(notification.status) }}
                        </van-tag>
                      </div>
                    </template>
                  </van-cell>
                  
                  <template #right>
                    <van-button
                      square
                      type="danger"
                      text="Delete"
                      @click="deleteNotification(notification.id)"
                    />
                  </template>
                </van-swipe-cell>
              </van-cell-group>
            </van-list>
          </van-tab>
          
          <van-tab title="Transactions" name="transactions">
            <van-list
              v-model:loading="loadingTransactions"
              :finished="transactionsFinished"
              finished-text="No more transactions"
              @load="loadTransactionHistory"
            >
              <van-cell-group>
                <van-cell
                  v-for="tx in transactionHistory"
                  :key="tx.hash"
                  :title="getTransactionTitle(tx)"
                  :label="tx.description"
                  :icon="getTransactionIcon(tx.type)"
                  @click="viewTransactionDetails(tx)"
                >
                  <template #value>
                    <div class="transaction-meta">
                      <span class="amount" :class="getAmountClass(tx)">
                        {{ formatAmount(tx) }}
                      </span>
                      <span class="time">{{ formatDateRelative(tx.timestamp) }}</span>
                    </div>
                  </template>
                </van-cell>
              </van-cell-group>
            </van-list>
          </van-tab>
        </van-tabs>
      </div>
    </van-popup>

    <!-- Transaction Details Modal -->
    <van-dialog
      v-model:show="showTransactionDetails"
      :title="selectedTransaction?.title || 'Transaction Details'"
      show-cancel-button
    >
      <div class="transaction-details" v-if="selectedTransaction">
        <van-cell-group>
          <van-cell title="Status" :value="getStatusText(selectedTransaction.status)" />
          <van-cell title="Amount" :value="formatAmount(selectedTransaction)" />
          <van-cell title="Type" :value="getTransactionType(selectedTransaction.type)" />
          <van-cell title="Date" :value="formatDate(selectedTransaction.timestamp)" />
          <van-cell 
            title="Transaction Hash" 
            :value="truncateAddress(selectedTransaction.hash)" 
            is-link
            @click="openInExplorer(selectedTransaction.hash)"
          />
          <van-cell 
            title="From" 
            :value="truncateAddress(selectedTransaction.from)" 
            v-if="selectedTransaction.from"
          />
          <van-cell 
            title="To" 
            :value="truncateAddress(selectedTransaction.to)" 
            v-if="selectedTransaction.to"
          />
          <van-cell 
            title="Gas Fee" 
            :value="formatCurrency(selectedTransaction.gasFee, 4) + ' KAIA'" 
            v-if="selectedTransaction.gasFee"
          />
        </van-cell-group>
      </div>
    </van-dialog>

    <!-- Transaction Toast -->
    <van-overlay :show="showTransactionToast" @click="showTransactionToast = false">
      <div class="transaction-toast">
        <van-notice-bar
          :text="transactionToastMessage"
          color="#1989fa"
          background="#e8f4ff"
          left-icon="info-o"
        />
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast, showDialog } from 'vant'
import { formatCurrency, formatDateRelative, truncateAddress } from '@/utils/helpers.js'

// Props
const props = defineProps({
  walletConnector: {
    type: Object,
    required: true
  }
})

// Reactive state
const showNotifications = ref(false)
const activeTab = ref('all')
const notifications = ref([])
const transactionHistory = ref([])
const selectedTransaction = ref(null)
const showTransactionDetails = ref(false)
const showTransactionToast = ref(false)
const transactionToastMessage = ref('')

const loadingNotifications = ref(false)
const loadingTransactions = ref(false)
const notificationsFinished = ref(false)
const transactionsFinished = ref(false)

// Computed
const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

// Methods
const getNotificationIcon = (type) => {
  const icons = {
    success: 'passed',
    error: 'close',
    warning: 'warning-o',
    info: 'info-o',
    staking: 'gold-coin-o',
    lending: 'credit-pay',
    referral: 'friends-o'
  }
  return icons[type] || 'info-o'
}

const getTransactionIcon = (type) => {
  const icons = {
    stake: 'gold-coin-o',
    unstake: 'refund-o',
    borrow: 'credit-pay',
    repay: 'balance-o',
    claim: 'gift-o',
    referral: 'friends-o'
  }
  return icons[type] || 'orders-o'
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger',
    processing: 'primary'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    processing: 'Processing'
  }
  return texts[status] || status
}

const getTransactionTitle = (tx) => {
  const titles = {
    stake: 'USDT Staked',
    unstake: 'USDT Unstaked',
    borrow: 'KAIA Borrowed',
    repay: 'Loan Repaid',
    claim: 'Rewards Claimed',
    referral: 'Referral Bonus'
  }
  return titles[tx.type] || 'Transaction'
}

const getTransactionType = (type) => {
  const types = {
    stake: 'Staking',
    unstake: 'Unstaking',
    borrow: 'Borrowing',
    repay: 'Repayment',
    claim: 'Claim',
    referral: 'Referral'
  }
  return types[type] || type
}

const getAmountClass = (tx) => {
  const classes = {
    stake: 'positive',
    unstake: 'negative',
    borrow: 'positive',
    repay: 'negative',
    claim: 'positive',
    referral: 'positive'
  }
  return classes[tx.type] || ''
}

const formatAmount = (tx) => {
  const prefix = tx.type === 'repay' || tx.type === 'unstake' ? '-' : '+'
  return `${prefix}${formatCurrency(tx.amount)} ${tx.token || 'USDT'}`
}

const loadNotifications = async () => {
  if (loadingNotifications.value || notificationsFinished.value) return
  
  loadingNotifications.value = true
  try {
    // Mock data - replace with actual API calls
    const mockNotifications = [
      {
        id: 1,
        title: 'Staking Successful',
        description: 'You have successfully staked 1000 USDT',
        type: 'staking',
        status: 'completed',
        read: false,
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 2,
        title: 'Borrowing Completed',
        description: 'You have borrowed 50 KAIA against your collateral',
        type: 'lending',
        status: 'completed',
        read: true,
        timestamp: new Date(Date.now() - 7200000)
      },
      {
        id: 3,
        title: 'Referral Bonus',
        description: 'You earned $25 from your referral David',
        type: 'referral',
        status: 'completed',
        read: false,
        timestamp: new Date(Date.now() - 86400000)
      }
    ]
    
    notifications.value = [...notifications.value, ...mockNotifications]
    notificationsFinished.value = true
  } catch (error) {
    console.error('Error loading notifications:', error)
  } finally {
    loadingNotifications.value = false
  }
}

const loadTransactionHistory = async () => {
  if (loadingTransactions.value || transactionsFinished.value) return
  
  loadingTransactions.value = true
  try {
    // Mock data - replace with actual blockchain queries
    const mockTransactions = [
      {
        hash: '0x1234567890abcdef',
        type: 'stake',
        amount: 1000,
        token: 'USDT',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000),
        description: 'Staked 1000 USDT in Node A',
        from: props.walletConnector?.account,
        to: '0xnodecontractaddress',
        gasFee: 0.001
      },
      {
        hash: '0xabcdef1234567890',
        type: 'borrow',
        amount: 50,
        token: 'KAIA',
        status: 'completed',
        timestamp: new Date(Date.now() - 7200000),
        description: 'Borrowed 50 KAIA against USDT collateral',
        from: '0xlendingcontract',
        to: props.walletConnector?.account,
        gasFee: 0.0008
      }
    ]
    
    transactionHistory.value = [...transactionHistory.value, ...mockTransactions]
    transactionsFinished.value = true
  } catch (error) {
    console.error('Error loading transaction history:', error)
  } finally {
    loadingTransactions.value = false
  }
}

const markAsRead = (notification) => {
  notification.read = true
}

const deleteNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

const viewTransactionDetails = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDetails.value = true
}

const openInExplorer = (hash) => {
  const explorerUrl = `https://baobab.scope.klaytn.com/tx/${hash}`
  window.open(explorerUrl, '_blank')
}

const showTransactionNotification = (message) => {
  transactionToastMessage.value = message
  showTransactionToast.value = true
  
  setTimeout(() => {
    showTransactionToast.value = false
  }, 5000)
}

// WebSocket connection for real-time updates
const setupWebSocket = () => {
  // This would connect to your backend for real-time transaction updates
  // For now, we'll simulate with polling
  const checkForUpdates = () => {
    // Check for new transactions or status updates
    console.log('Checking for transaction updates...')
  }
  
  const interval = setInterval(checkForUpdates, 30000)
  
  // Cleanup on unmount
  return () => clearInterval(interval)
}

// Lifecycle
onMounted(() => {
  loadNotifications()
  loadTransactionHistory()
  const cleanup = setupWebSocket()
  
  // Listen for transaction events
  if (props.walletConnector) {
    props.walletConnector.on('transaction', (tx) => {
      showTransactionNotification(`Transaction ${tx.type} completed`)
    })
  }
  
  return cleanup
})
</script>

<style scoped>
.transaction-monitor {
  position: relative;
}

.notification-bell {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 1000;
  cursor: pointer;
  padding: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.notifications-panel {
  height: 100%;
  background: #f5f5f5;
}

.unread {
  background: #e8f4ff;
}

.notification-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.time {
  font-size: 12px;
  color: #666;
}

.transaction-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount {
  font-weight: 600;
}

.amount.positive {
  color: #07c160;
}

.amount.negative {
  color: #ee0a24;
}

.transaction-details {
  padding: 16px;
}

.transaction-toast {
  position: fixed;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2000;
  width: 90%;
  max-width: 400px;
}

@media (max-width: 768px) {
  .notification-bell {
    top: 12px;
    right: 12px;
  }
}
</style>