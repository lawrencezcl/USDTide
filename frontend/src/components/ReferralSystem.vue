<template>
  <div class="referral-system">
    <!-- Referral Stats -->
    <van-card class="referral-stats-card">
      <template #title>
        <div class="card-title">
          <van-icon name="friends-o" />
          <span>Referral Program</span>
        </div>
      </template>
      
      <div class="referral-stats">
        <div class="stat-item">
          <h3>{{ referralStats.totalReferrals }}</h3>
          <p>Total Referrals</p>
        </div>
        <div class="stat-item">
          <h3>{{ referralStats.activeReferrals }}</h3>
          <p>Active Referrals</p>
        </div>
        <div class="stat-item">
          <h3>${{ formatCurrency(referralStats.totalEarnings) }}</h3>
          <p>Total Earnings</p>
        </div>
      </div>
    </van-card>

    <!-- Referral Link -->
    <van-card class="referral-link-card">
      <template #title>
        <div class="card-title">
          <van-icon name="link-o" />
          <span>Your Referral Link</span>
        </div>
      </template>
      
      <div class="referral-link-section">
        <van-field
          v-model="referralLink"
          readonly
          label="Referral Link"
          placeholder="Generating..."
        >
          <template #button>
            <van-button 
              size="small" 
              type="primary"
              @click="copyReferralLink"
              :loading="generatingLink"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </van-button>
          </template>
        </van-field>
        
        <div class="share-buttons">
          <van-button 
            type="default" 
            size="small"
            @click="shareToLINE"
            icon="share-o"
          >
            Share to LINE
          </van-button>
          <van-button 
            type="default" 
            size="small"
            @click="shareReferral"
            icon="share"
          >
            Share
          </van-button>
        </div>
      </div>
    </van-card>

    <!-- Referral Leaderboard -->
    <van-card class="leaderboard-card" v-if="leaderboard.length > 0">
      <template #title>
        <div class="card-title">
          <van-icon name="trophy-o" />
          <span>Top Referrers</span>
        </div>
      </template>
      
      <van-list>
        <van-cell 
          v-for="(referrer, index) in leaderboard" 
          :key="referrer.address"
          :title="referrer.name || truncateAddress(referrer.address)"
          :label="`${referrer.referrals} referrals • $${formatCurrency(referrer.earnings)} earned`"
        >
          <template #icon>
            <div class="rank-badge" :class="`rank-${index + 1}`">
              {{ index + 1 }}
            </div>
          </template>
          <template #value>
            <span class="earnings">${{ formatCurrency(referrer.earnings) }}</span>
          </template>
        </van-cell>
      </van-list>
    </van-card>

    <!-- Referral History -->
    <van-card class="referral-history-card">
      <template #title>
        <div class="card-title">
          <van-icon name="clock-o" />
          <span>Referral History</span>
        </div>
      </template>
      
      <van-list
        v-model:loading="loadingHistory"
        :finished="historyFinished"
        finished-text="No more referrals"
        @load="loadReferralHistory"
      >
        <van-cell-group>
          <van-cell 
            v-for="referral in referralHistory" 
            :key="referral.id"
            :title="referral.referreeName || truncateAddress(referral.referreeAddress)"
            :label="formatDate(referral.timestamp)"
          >
            <template #value>
              <div class="referral-value">
                <span class="amount">+${{ formatCurrency(referral.earnings) }}</span>
                <van-tag :type="getStatusType(referral.status)">
                  {{ getStatusText(referral.status) }}
                </van-tag>
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-list>
    </van-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { showToast, showDialog } from 'vant'
import { formatCurrency, formatDate, truncateAddress } from '@/utils/helpers.js'

// Props
const props = defineProps({
  walletConnector: {
    type: Object,
    required: true
  }
})

// Reactive state
const referralStats = ref({
  totalReferrals: 0,
  activeReferrals: 0,
  totalEarnings: 0
})

const referralLink = ref('')
const generatingLink = ref(false)
const copied = ref(false)
const leaderboard = ref([])
const referralHistory = ref([])
const loadingHistory = ref(false)
const historyFinished = ref(false)

// Methods
const generateReferralLink = async () => {
  if (!props.walletConnector?.account) return
  
  generatingLink.value = true
  try {
    const userAddress = props.walletConnector.account
    const baseUrl = window.location.origin
    referralLink.value = `${baseUrl}/invite?ref=${userAddress}`
  } catch (error) {
    console.error('Error generating referral link:', error)
    showToast('Failed to generate referral link')
  } finally {
    generatingLink.value = false
  }
}

const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    copied.value = true
    showToast('Referral link copied!')
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    showToast('Failed to copy link')
  }
}

const shareToLINE = () => {
  const message = `Join USDTide and earn rewards! Use my referral link: ${referralLink.value}`
  const encodedMessage = encodeURIComponent(message)
  const lineUrl = `https://line.me/R/msg/text/?${encodedMessage}`
  window.open(lineUrl, '_blank')
}

const shareReferral = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Join USDTide',
        text: `Earn rewards with USDTide! Use my referral link to get started.`,
        url: referralLink.value
      })
    } catch (error) {
      console.error('Error sharing:', error)
    }
  } else {
    copyReferralLink()
  }
}

const loadReferralStats = async () => {
  try {
    // This would be replaced with actual contract calls
    referralStats.value = {
      totalReferrals: 12,
      activeReferrals: 8,
      totalEarnings: 245.50
    }
  } catch (error) {
    console.error('Error loading referral stats:', error)
  }
}

const loadLeaderboard = async () => {
  try {
    // Mock data - replace with actual contract calls
    leaderboard.value = [
      { address: '0x1234...5678', name: 'Alice', referrals: 45, earnings: 1250.75 },
      { address: '0x8765...4321', name: 'Bob', referrals: 32, earnings: 890.25 },
      { address: '0xabcd...efgh', name: 'Charlie', referrals: 28, earnings: 750.00 }
    ]
  } catch (error) {
    console.error('Error loading leaderboard:', error)
  }
}

const loadReferralHistory = async () => {
  if (loadingHistory.value || historyFinished.value) return
  
  loadingHistory.value = true
  try {
    // Mock data - replace with actual contract calls
    const mockHistory = [
      {
        id: 1,
        referreeAddress: '0x9876...5432',
        referreeName: 'David',
        earnings: 25.00,
        status: 'completed',
        timestamp: new Date(Date.now() - 86400000)
      },
      {
        id: 2,
        referreeAddress: '0x1357...2468',
        earnings: 15.50,
        status: 'pending',
        timestamp: new Date(Date.now() - 172800000)
      }
    ]
    
    referralHistory.value = [...referralHistory.value, ...mockHistory]
    historyFinished.value = true
  } catch (error) {
    console.error('Error loading referral history:', error)
  } finally {
    loadingHistory.value = false
  }
}

const getStatusType = (status) => {
  const types = {
    pending: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || 'default'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed'
  }
  return texts[status] || status
}

// Lifecycle
onMounted(() => {
  generateReferralLink()
  loadReferralStats()
  loadLeaderboard()
})
</script>

<style scoped>
.referral-system {
  padding: 16px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.referral-stats {
  display: flex;
  justify-content: space-around;
  text-align: center;
  padding: 16px 0;
}

.stat-item h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1989fa;
  margin: 0;
}

.stat-item p {
  margin: 4px 0 0;
  color: #666;
  font-size: 14px;
}

.referral-link-section {
  padding: 16px 0;
}

.share-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.leaderboard-card .van-cell__title {
  flex: 2;
}

.rank-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 12px;
  margin-right: 8px;
}

.rank-1 { background: #ffd700; }
.rank-2 { background: #c0c0c0; }
.rank-3 { background: #cd7f32; }

.earnings {
  color: #1989fa;
  font-weight: 600;
}

.referral-value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.amount {
  color: #1989fa;
  font-weight: 600;
}
</style>