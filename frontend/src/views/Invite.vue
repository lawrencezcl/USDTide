<template>
  <div class="invite">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <van-icon name="friends-o" size="60" color="#07c160" />
        <h1>Invite Friends</h1>
        <p>Earn 0.5 USDT when your friends complete their first stake!</p>
        <div class="earnings-display">
          <span class="earnings-amount">${{ totalEarnings }}</span>
          <span class="earnings-label">Total Earned</span>
        </div>
      </div>
    </div>

    <!-- Invitation Card -->
    <div class="invitation-section">
      <van-card class="invitation-card">
        <template #title>
          <div class="card-title">
            <van-icon name="share-o" />
            <span>Your Invitation</span>
          </div>
        </template>
        
        <div class="invitation-content">
          <!-- Invitation Code -->
          <div class="invite-code-section">
            <label class="section-label">Your Invitation Code</label>
            <div class="invite-code-display">
              <van-field
                v-model="inviteCode"
                readonly
                type="text"
                placeholder="Generating..."
              >
                <template #button>
                  <van-button 
                    size="small" 
                    type="primary"
                    @click="copyInviteCode"
                    :loading="copying"
                  >
                    {{ copied ? 'Copied!' : 'Copy' }}
                  </van-button>
                </template>
              </van-field>
            </div>
          </div>

          <!-- Invitation Link -->
          <div class="invite-link-section">
            <label class="section-label">Invitation Link</label>
            <div class="invite-link-display">
              <van-field
                v-model="inviteLink"
                readonly
                type="text"
                placeholder="Generating..."
              >
                <template #button>
                  <van-button 
                    size="small" 
                    type="default"
                    @click="copyInviteLink"
                    :loading="copyingLink"
                  >
                    {{ copiedLink ? 'Copied!' : 'Copy' }}
                  </van-button>
                </template>
              </van-field>
            </div>
          </div>

          <!-- Share Buttons -->
          <div class="share-section">
            <label class="section-label">Share with Friends</label>
            <div class="share-buttons">
              <van-button
                type="primary"
                size="large"
                icon="chat-o"
                @click="shareViaLine"
                :loading="sharingLine"
                class="share-button line-share"
              >
                Share on LINE
              </van-button>
              
              <van-button
                type="default"
                size="large"
                icon="link-o"
                @click="shareGeneric"
                class="share-button generic-share"
              >
                More Options
              </van-button>
            </div>
          </div>
        </div>
      </van-card>
    </div>

    <!-- Statistics -->
    <div class="stats-section">
      <van-card class="stats-card">
        <template #title>
          <div class="card-title">
            <van-icon name="bar-chart-o" />
            <span>Your Statistics</span>
          </div>
        </template>
        
        <van-grid :column-num="2" :border="false">
          <van-grid-item>
            <div class="stat-item">
              <h3>{{ totalInvites }}</h3>
              <p>Total Invites</p>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <h3>{{ successfulInvites }}</h3>
              <p>Successful</p>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <h3>{{ conversionRate }}%</h3>
              <p>Conversion Rate</p>
            </div>
          </van-grid-item>
          <van-grid-item>
            <div class="stat-item">
              <h3>${{ totalEarnings }}</h3>
              <p>Total Earned</p>
            </div>
          </van-grid-item>
        </van-grid>
      </van-card>
    </div>

    <!-- Recent Invitations -->
    <div class="recent-section" v-if="recentInvitations.length > 0">
      <van-card class="recent-card">
        <template #title>
          <div class="card-title">
            <van-icon name="records" />
            <span>Recent Invitations</span>
          </div>
        </template>
        
        <van-list>
          <van-cell
            v-for="(invitation, index) in recentInvitations"
            :key="index"
            :title="invitation.friendName || 'Anonymous User'"
            :label="formatDate(invitation.date)"
            :value="formatStatus(invitation.status)"
            :value-class="getStatusClass(invitation.status)"
          >
            <template #icon>
              <div class="van-avatar van-avatar--round van-avatar--small invitation-avatar">
                <van-icon name="user-o" v-if="!invitation.avatar" />
              </div>
            </template>
            <template #right-icon>
              <van-tag 
                :type="getStatusType(invitation.status)"
                size="small"
              >
                {{ invitation.reward ? '+$0.5' : formatStatus(invitation.status) }}
              </van-tag>
            </template>
          </van-cell>
        </van-list>
      </van-card>
    </div>

    <!-- Referral Program Info -->
    <div class="program-info">
      <van-card class="info-card">
        <template #title>
          <div class="card-title">
            <van-icon name="info-o" />
            <span>How It Works</span>
          </div>
        </template>
        
        <div class="program-steps">
          <div class="step">
            <div class="step-icon">
              <van-icon name="share-o" color="#1989fa" />
            </div>
            <div class="step-content">
              <h4>1. Share Your Code</h4>
              <p>Send your invitation code or link to friends</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-icon">
              <van-icon name="user-circle-o" color="#07c160" />
            </div>
            <div class="step-content">
              <h4>2. Friend Joins</h4>
              <p>Your friend signs up using your invitation</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-icon">
              <van-icon name="gold-coin-o" color="#ffd700" />
            </div>
            <div class="step-content">
              <h4>3. First Stake</h4>
              <p>When they complete their first stake, you both earn!</p>
            </div>
          </div>
          
          <div class="step">
            <div class="step-icon">
              <van-icon name="certificate" color="#ff976a" />
            </div>
            <div class="step-content">
              <h4>4. Instant Reward</h4>
              <p>Receive 0.5 USDT directly to your wallet</p>
            </div>
          </div>
        </div>
        
        <van-notice-bar
          left-icon="volume-o"
          text="Referral rewards are paid instantly when your friend completes their first stake of at least 10 USDT."
          color="#1989fa"
          background="#e8f4ff"
        />
      </van-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { generateUniqueCode, formatCurrency, formatDateRelative } from '@/utils/helpers'

// Props & Emits
const emit = defineEmits(['update-title'])

// Dependencies
const route = useRoute()
const router = useRouter()
const liff = inject('liff', null)
const user = inject('user', null)

// Reactive state
const inviteCode = ref('')
const inviteLink = ref('')
const totalEarnings = ref(0)
const totalInvites = ref(0)
const successfulInvites = ref(0)
const recentInvitations = ref([])

// Loading states
const copying = ref(false)
const copyingLink = ref(false)
const copied = ref(false)
const copiedLink = ref(false)
const sharingLine = ref(false)

// Computed properties
const conversionRate = computed(() => {
  if (totalInvites.value === 0) return 0
  return Math.round((successfulInvites.value / totalInvites.value) * 100)
})

// Methods
const generateInviteCode = () => {
  // Generate a unique 8-character code
  const userId = user?.value?.userId || 'guest'
  const timestamp = Date.now().toString(36)
  const randomPart = Math.random().toString(36).substring(2, 6)
  return `${userId.substring(0, 2)}${timestamp.substring(-4)}${randomPart}`.toUpperCase()
}

const generateInviteLink = (code) => {
  const baseUrl = window.location.origin
  return `${baseUrl}/invite/${code}`
}

const copyInviteCode = async () => {
  try {
    copying.value = true
    await navigator.clipboard.writeText(inviteCode.value)
    copied.value = true
    showToast('Invitation code copied!')
    
    setTimeout(() => {
      copied.value = false
    }, 2000)
    
    // Track copy event
    trackInviteAction('copy_code')
  } catch (error) {
    console.error('Failed to copy code:', error)
    showToast('Failed to copy code')
  } finally {
    copying.value = false
  }
}

const copyInviteLink = async () => {
  try {
    copyingLink.value = true
    await navigator.clipboard.writeText(inviteLink.value)
    copiedLink.value = true
    showToast('Invitation link copied!')
    
    setTimeout(() => {
      copiedLink.value = false
    }, 2000)
    
    // Track copy event
    trackInviteAction('copy_link')
  } catch (error) {
    console.error('Failed to copy link:', error)
    showToast('Failed to copy link')
  } finally {
    copyingLink.value = false
  }
}

const shareViaLine = async () => {
  try {
    sharingLine.value = true
    
    const shareMessage = `🚀 Join me on USDTide and start earning with your USDT!\n\n💰 Stake USDT and earn up to 6% APY\n🏦 Borrow KAIA with flexible terms\n🎁 Use my code: ${inviteCode.value}\n\n${inviteLink.value}`
    
    if (liff && liff.shareTargetPicker) {
      // Use LINE's native share picker
      await liff.shareTargetPicker([
        {
          type: 'text',
          text: shareMessage
        }
      ])
      showToast('Shared via LINE!')
      trackInviteAction('share_line')
    } else if (liff && liff.openWindow) {
      // Fallback to LINE URL scheme
      const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareMessage)}`
      liff.openWindow(lineUrl, true)
      trackInviteAction('share_line_fallback')
    } else {
      // Copy to clipboard as fallback
      await navigator.clipboard.writeText(shareMessage)
      showToast('Message copied! Share it on LINE manually.')
    }
  } catch (error) {
    console.error('Failed to share via LINE:', error)
    showToast('Failed to share. Please try copying the link.')
  } finally {
    sharingLine.value = false
  }
}

const shareGeneric = async () => {
  const shareData = {
    title: 'Join USDTide - Earn with Your USDT',
    text: `Join me on USDTide and start earning with your USDT! Use my invitation code: ${inviteCode.value}`,
    url: inviteLink.value
  }
  
  try {
    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData)
      trackInviteAction('share_native')
    } else {
      // Fallback to copy
      const shareText = `${shareData.text}\n${shareData.url}`
      await navigator.clipboard.writeText(shareText)
      showToast('Invitation copied to clipboard!')
      trackInviteAction('share_copy')
    }
  } catch (error) {
    console.error('Failed to share:', error)
    showToast('Failed to share')
  }
}

const trackInviteAction = (action) => {
  // Track invitation actions for analytics
  console.log('Invite action:', action, {
    code: inviteCode.value,
    userId: user?.value?.userId,
    timestamp: new Date().toISOString()
  })
  
  // TODO: Send to analytics service
}

const loadInvitationData = async () => {
  try {
    // Load user's invitation statistics
    // This would typically come from an API
    const mockData = {
      totalEarnings: 12.5,
      totalInvites: 8,
      successfulInvites: 5,
      recentInvitations: [
        {
          friendName: 'Alice Kim',
          avatar: null,
          date: new Date(Date.now() - 86400000), // 1 day ago
          status: 'completed',
          reward: true
        },
        {
          friendName: 'Bob Chen',
          avatar: null,
          date: new Date(Date.now() - 259200000), // 3 days ago
          status: 'registered',
          reward: false
        },
        {
          friendName: 'Carol Wang',
          avatar: null,
          date: new Date(Date.now() - 604800000), // 1 week ago
          status: 'completed',
          reward: true
        }
      ]
    }
    
    totalEarnings.value = mockData.totalEarnings
    totalInvites.value = mockData.totalInvites
    successfulInvites.value = mockData.successfulInvites
    recentInvitations.value = mockData.recentInvitations
  } catch (error) {
    console.error('Failed to load invitation data:', error)
  }
}

const processInviteCode = (code) => {
  if (!code) return
  
  console.log('Processing invite code:', code)
  
  // Show welcome dialog for invited users
  showDialog({
    title: 'Welcome to USDTide!',
    message: `You've been invited by a friend. Complete your first stake to earn rewards for both of you!`,
    confirmButtonText: 'Start Staking',
    cancelButtonText: 'Maybe Later'
  }).then(() => {
    router.push('/staking')
  }).catch(() => {
    // User cancelled
  })
  
  // TODO: Store invite code for reward attribution
  localStorage.setItem('usdtide_invite_code', code)
}

// Utility functions
const formatDate = (date) => {
  return formatDateRelative(date)
}

const formatStatus = (status) => {
  const statusMap = {
    'registered': 'Registered',
    'staked': 'First Stake',
    'completed': 'Completed',
    'pending': 'Pending'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    'completed': 'status-success',
    'staked': 'status-success',
    'registered': 'status-warning',
    'pending': 'status-default'
  }
  return classMap[status] || 'status-default'
}

const getStatusType = (status) => {
  const typeMap = {
    'completed': 'success',
    'staked': 'success',
    'registered': 'warning',
    'pending': 'default'
  }
  return typeMap[status] || 'default'
}

// Lifecycle
onMounted(async () => {
  emit('update-title', 'Invite Friends')
  
  // Generate invite code and link
  inviteCode.value = generateInviteCode()
  inviteLink.value = generateInviteLink(inviteCode.value)
  
  // Load invitation data
  await loadInvitationData()
  
  // Handle invite code if present in URL
  if (route.params.code) {
    processInviteCode(route.params.code)
  }
})
</script>

<style scoped>
.invite {
  min-height: 100vh;
  background: #f7f8fa;
  padding-bottom: 2rem;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #07c160 0%, #00d084 100%);
  color: white;
  padding: 2rem 1rem;
  text-align: center;
}

.hero-content h1 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 1rem 0 0.5rem;
}

.hero-content p {
  margin: 0 0 1.5rem;
  opacity: 0.9;
  font-size: 1rem;
}

.earnings-display {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 1rem;
  display: inline-block;
  backdrop-filter: blur(10px);
}

.earnings-amount {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.earnings-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

/* Card Sections */
.invitation-section,
.stats-section,
.recent-section,
.program-info {
  padding: 0 1rem;
  margin-top: 1rem;
}

.invitation-card,
.stats-card,
.recent-card,
.info-card {
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #323233;
}

/* Invitation Content */
.invitation-content {
  padding: 0;
}

.section-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #646566;
  margin-bottom: 0.5rem;
  padding: 0 16px;
}

.invite-code-section,
.invite-link-section {
  margin-bottom: 1.5rem;
}

.invite-code-display,
.invite-link-display {
  padding: 0 16px;
}

/* Share Section */
.share-section {
  padding: 0 16px 16px;
}

.share-buttons {
  display: grid;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.share-button {
  height: 48px;
  border-radius: 12px;
  font-weight: 500;
}

.line-share {
  background: #07c160;
  border-color: #07c160;
}

.line-share:hover {
  background: #06a050;
}

.generic-share {
  background: #f7f8fa;
  color: #323233;
  border-color: #ebedf0;
}

/* Statistics */
.stat-item {
  text-align: center;
  padding: 1rem 0.5rem;
}

.stat-item h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
  color: #323233;
}

.stat-item p {
  margin: 0;
  font-size: 0.85rem;
  color: #969799;
}

/* Recent Invitations */
.invitation-avatar {
  background: #f7f8fa;
}

.status-success {
  color: #07c160;
  font-weight: 500;
}

.status-warning {
  color: #ff976a;
  font-weight: 500;
}

.status-default {
  color: #969799;
}

/* Program Info */
.program-steps {
  padding: 0 16px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.step:last-child {
  margin-bottom: 1rem;
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f7f8fa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.step-content h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem;
  color: #323233;
}

.step-content p {
  margin: 0;
  font-size: 0.9rem;
  color: #646566;
  line-height: 1.4;
}

/* Loading States */
.van-button--loading {
  opacity: 0.7;
}

/* Responsive Design */
@media (min-width: 768px) {
  .invite {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .hero-section {
    padding: 3rem 2rem;
  }
  
  .hero-content h1 {
    font-size: 2.2rem;
  }
  
  .earnings-amount {
    font-size: 2.2rem;
  }
  
  .invitation-section,
  .stats-section,
  .recent-section,
  .program-info {
    padding: 0 2rem;
  }
  
  .share-buttons {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 414px) {
  .hero-section {
    padding: 1.5rem 1rem;
  }
  
  .hero-content h1 {
    font-size: 1.6rem;
  }
  
  .earnings-amount {
    font-size: 1.6rem;
  }
  
  .step {
    gap: 0.75rem;
  }
  
  .step-icon {
    width: 36px;
    height: 36px;
  }
  
  .step-content h4 {
    font-size: 0.95rem;
  }
  
  .step-content p {
    font-size: 0.85rem;
  }
}

@media (max-width: 375px) {
  .invitation-section,
  .stats-section,
  .recent-section,
  .program-info {
    padding: 0 0.75rem;
  }
  
  .hero-section {
    padding: 1.25rem 0.75rem;
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.invitation-card,
.stats-card,
.recent-card,
.info-card {
  animation: fadeInUp 0.4s ease-out;
}

.stats-card {
  animation-delay: 0.1s;
}

.recent-card {
  animation-delay: 0.2s;
}

.info-card {
  animation-delay: 0.3s;
}

/* Dark mode support (future enhancement) */
@media (prefers-color-scheme: dark) {
  .invite {
    background: #1a1a1a;
  }
  
  .invitation-card,
  .stats-card,
  .recent-card,
  .info-card {
    background: #2a2a2a;
    color: #ffffff;
  }
  
  .card-title {
    color: #ffffff;
  }
  
  .section-label {
    color: #cccccc;
  }
  
  .stat-item h3,
  .step-content h4 {
    color: #ffffff;
  }
  
  .stat-item p,
  .step-content p {
    color: #999999;
  }
}
</style>