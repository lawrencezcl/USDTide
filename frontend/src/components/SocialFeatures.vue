<template>
  <div class="social-features">
    <!-- Social Dashboard -->
    <div class="social-dashboard">
      <van-cell-group title="Social & Referral Dashboard">
        <van-grid :column-num="2" :gutter="10">
          <van-grid-item icon="friends-o" text="Total Referrals" :badge="referralStats.totalReferrals" />
          <van-grid-item icon="gold-coin-o" text="Total Earnings" :badge="formatCurrency(referralStats.totalEarnings)" />
          <van-grid-item icon="fire-o" text="Active Referrals" :badge="referralStats.activeReferrals" />
          <van-grid-item icon="trophy-o" text="Rank" :badge="referralStats.rank" />
        </van-grid>
      </van-cell-group>
    </div>

    <!-- Referral Link Section -->
    <van-cell-group title="Your Referral Link">
      <van-cell center>
        <template #title>
          <div class="referral-link-section">
            <van-field
              v-model="referralLink"
              readonly
              label="Referral Link"
              placeholder="Loading..."
            />
            <van-button
              type="primary"
              size="small"
              @click="copyReferralLink"
              :disabled="!referralLink"
            >
              Copy
            </van-button>
          </div>
        </template>
      </van-cell>
      <van-cell center>
        <template #title>
          <div class="share-buttons">
            <van-button
              type="success"
              size="small"
              @click="shareToLINE"
              icon="chat-o"
            >
              Share to LINE
            </van-button>
            <van-button
              type="info"
              size="small"
              @click="shareGeneral"
              icon="share-o"
            >
              Share
            </van-button>
          </div>
        </template>
      </van-cell>
    </van-cell-group>

    <!-- Referral Leaderboard -->
    <van-cell-group title="Referral Leaderboard">
      <van-list
        v-model:loading="loadingLeaderboard"
        :finished="leaderboardFinished"
        finished-text="No more data"
        @load="loadLeaderboard"
      >
        <van-cell
          v-for="(user, index) in leaderboard"
          :key="user.address"
          center
        >
          <template #title>
            <div class="leaderboard-item">
              <span class="rank">#{{ index + 1 }}</span>
              <span class="address">{{ truncateAddress(user.address) }}</span>
              <span class="earnings">{{ formatCurrency(user.earnings) }}</span>
            </div>
          </template>
          <template #icon>
            <van-icon
              :name="getRankIcon(index)"
              :color="getRankColor(index)"
              size="20"
            />
          </template>
        </van-cell>
      </van-list>
    </van-cell-group>

    <!-- Recent Referrals -->
    <van-cell-group title="Recent Referrals">
      <van-list
        v-model:loading="loadingReferrals"
        :finished="referralsFinished"
        finished-text="No more referrals"
        @load="loadRecentReferrals"
      >
        <van-cell
          v-for="referral in recentReferrals"
          :key="referral.id"
          center
        >
          <template #title>
            <div class="referral-item">
              <span class="address">{{ referral.name || truncateAddress(referral.address) }}</span>
              <span class="date">{{ formatDateRelative(referral.date) }}</span>
              <span class="earnings">{{ formatCurrency(referral.earnings) }}</span>
            </div>
          </template>
          <template #icon>
            <van-icon name="user-circle-o" size="20" />
          </template>
        </van-cell>
      </van-list>
    </van-cell-group>

    <!-- Social Actions -->
    <van-cell-group title="Social Actions">
      <van-cell
        title="Invite Friends"
        is-link
        @click="showInviteModal = true"
        icon="friends-o"
      />
      <van-cell
        title="Share Achievement"
        is-link
        @click="showShareModal = true"
        icon="share-o"
      />
    </van-cell-group>

    <!-- Invite Modal -->
    <van-dialog
      v-model:show="showInviteModal"
      title="Invite Friends"
      show-cancel-button
      @confirm="sendInvites"
    >
      <div class="invite-modal">
        <van-field
          v-model="inviteMessage"
          rows="3"
          autosize
          type="textarea"
          placeholder="Write a personal message..."
        />
        <van-field
          v-model="inviteContacts"
          label="Contacts"
          placeholder="Enter LINE IDs or phone numbers..."
        />
      </div>
    </van-dialog>

    <!-- Share Modal -->
    <van-dialog
      v-model:show="showShareModal"
      title="Share Achievement"
      show-cancel-button
      @confirm="shareAchievement"
    >
      <div class="share-modal">
        <van-cell-group>
          <van-field
            v-model="achievementText"
            label="Message"
            readonly
            :value="getAchievementText()"
          />
          <van-field
            v-model="sharePlatforms"
            label="Share to"
            readonly
            :value="'LINE, Twitter, Facebook'"
          />
        </van-cell-group>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
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
const referralStats = ref({
  totalReferrals: 0,
  totalEarnings: 0,
  activeReferrals: 0,
  rank: 0
})

const referralLink = ref('')
const leaderboard = ref([])
const recentReferrals = ref([])
const loadingLeaderboard = ref(false)
const loadingReferrals = ref(false)
const leaderboardFinished = ref(false)
const referralsFinished = ref(false)

// Modal states
const showInviteModal = ref(false)
const showShareModal = ref(false)
const inviteMessage = ref('')
const inviteContacts = ref('')
const achievementText = ref('')
const sharePlatforms = ref('')

// Methods
const generateReferralLink = () => {
  if (!props.walletConnector?.account) return ''
  return `https://usdtide.com/ref/${props.walletConnector.account}`
}

const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(referralLink.value)
    showToast('Referral link copied to clipboard!')
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

const shareGeneral = () => {
  if (navigator.share) {
    navigator.share({
      title: 'USDTide - Earn with USDT',
      text: 'Join USDTide and start earning with USDT staking and lending!',
      url: referralLink.value
    }).catch(() => {
      showToast('Sharing cancelled')
    })
  } else {
    copyReferralLink()
  }
}

const getRankIcon = (index) => {
  const icons = ['medal-o', 'star-o', 'gem-o']
  return icons[index] || 'user-o'
}

const getRankColor = (index) => {
  const colors = ['#FFD700', '#C0C0C0', '#CD7F32']
  return colors[index] || '#666'
}

const getAchievementText = () => {
  return `I've earned ${formatCurrency(referralStats.value.totalEarnings)} through USDTide referrals! Join now: ${referralLink.value}`
}

const loadLeaderboard = async () => {
  if (loadingLeaderboard.value || leaderboardFinished.value) return
  
  loadingLeaderboard.value = true
  try {
    // Mock leaderboard data
    const mockLeaderboard = [
      { address: '0x1234567890abcdef1234567890abcdef12345678', earnings: 2500 },
      { address: '0xabcdef1234567890abcdef1234567890abcdef12', earnings: 1800 },
      { address: '0x567890abcdef1234567890abcdef1234567890ab', earnings: 1200 },
      { address: '0x90abcdef1234567890abcdef1234567890abcdef', earnings: 950 },
      { address: '0xdef1234567890abcdef1234567890abcdef12345', earnings: 800 }
    ]
    
    leaderboard.value = mockLeaderboard
    leaderboardFinished.value = true
  } catch (error) {
    console.error('Error loading leaderboard:', error)
  } finally {
    loadingLeaderboard.value = false
  }
}

const loadRecentReferrals = async () => {
  if (loadingReferrals.value || referralsFinished.value) return
  
  loadingReferrals.value = true
  try {
    // Mock recent referrals data
    const mockReferrals = [
      { id: 1, address: '0x1111111111111111111111111111111111111111', name: 'Alice', earnings: 50, date: new Date(Date.now() - 86400000) },
      { id: 2, address: '0x2222222222222222222222222222222222222222', earnings: 25, date: new Date(Date.now() - 172800000) },
      { id: 3, address: '0x3333333333333333333333333333333333333333', name: 'Bob', earnings: 75, date: new Date(Date.now() - 259200000) }
    ]
    
    recentReferrals.value = mockReferrals
    referralsFinished.value = true
  } catch (error) {
    console.error('Error loading referrals:', error)
  } finally {
    loadingReferrals.value = false
  }
}

const sendInvites = () => {
  if (!inviteContacts.value.trim()) {
    showToast('Please enter contact information')
    return
  }
  
  const contacts = inviteContacts.value.split(',').map(c => c.trim())
  
  // Mock sending invites
  showToast(`Invites sent to ${contacts.length} contacts`)
  
  inviteMessage.value = ''
  inviteContacts.value = ''
  showInviteModal.value = false
}

const shareAchievement = () => {
  shareGeneral()
  showShareModal.value = false
}

const fetchReferralStats = async () => {
  try {
    // Mock API call to fetch referral stats
    const stats = {
      totalReferrals: 15,
      totalEarnings: 750,
      activeReferrals: 8,
      rank: 127
    }
    
    referralStats.value = stats
  } catch (error) {
    console.error('Error fetching referral stats:', error)
  }
}

// Lifecycle
onMounted(() => {
  referralLink.value = generateReferralLink()
  fetchReferralStats()
  
  // Listen for wallet connection changes
  if (props.walletConnector) {
    watch(() => props.walletConnector.account, (newAccount) => {
      if (newAccount) {
        referralLink.value = generateReferralLink()
        fetchReferralStats()
      }
    })
  }
})
</script>

<style scoped>
.social-features {
  padding: 16px;
}

.social-dashboard {
  margin-bottom: 16px;
}

.referral-link-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.share-buttons {
  display: flex;
  gap: 8px;
}

.leaderboard-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.rank {
  font-weight: bold;
  color: #1989fa;
}

.address {
  flex: 1;
  font-family: monospace;
}

.earnings {
  font-weight: bold;
  color: #07c160;
}

.referral-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.date {
  color: #666;
  font-size: 12px;
}

.invite-modal,
.share-modal {
  padding: 16px;
}

@media (max-width: 768px) {
  .social-features {
    padding: 8px;
  }
  
  .referral-link-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .share-buttons {
    flex-direction: column;
  }
}
</style>