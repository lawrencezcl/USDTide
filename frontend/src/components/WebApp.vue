<template>
  <div id="web-app">
    <!-- Web Version Header -->
    <div class="web-header">
      <div class="header-content">
        <img src="@/assets/logo.svg" alt="USDTide" class="logo" />
        <h1 class="brand-title">USDTide</h1>
        <p class="brand-subtitle">Kaia Ecosystem DeFi Tool</p>
      </div>
    </div>

    <!-- Main App Content -->
    <div class="app-container">
      <!-- Navigation Bar -->
      <van-nav-bar
        v-if="showNavBar"
        :title="currentPageTitle"
        left-arrow
        @click-left="handleBack"
        :fixed="true"
        :z-index="100"
      >
        <template #right>
          <van-icon
            v-if="isWalletConnected"
            name="user-o"
            size="18"
            @click="showUserMenu = true"
          />
        </template>
      </van-nav-bar>

      <!-- Main Content -->
      <div class="main-content" :class="{ 'with-navbar': showNavBar }">
        <!-- Wallet Connection Required Screen -->
        <div v-if="!isWalletConnected" class="wallet-required-screen">
          <div class="wallet-required-content">
            <van-empty description="Wallet Connection Required">
              <template #image>
                <van-icon name="wallet-o" size="100" color="#1989fa" />
              </template>
            </van-empty>
            
            <div class="connection-info">
              <h3>Welcome to USDTide Web</h3>
              <p>Connect your wallet to start using USDTide's DeFi features</p>
              
              <!-- Mini Dapp Wallet Connector -->
              <MiniDappWalletConnector
                ref="walletConnector"
                :client-id="miniDappClientId"
                :chain-id="chainId"
                :auto-connect="false"
                @connected="handleWalletConnected"
                @disconnected="handleWalletDisconnected"
                @error="handleWalletError"
              />
            </div>
          </div>
        </div>

        <!-- App Content (when wallet is connected) -->
        <div v-else class="app-content">
          <!-- Wallet Status Bar -->
          <div class="wallet-status-bar">
            <div class="wallet-info">
              <van-tag type="success" size="small">
                {{ walletType }} Connected
              </van-tag>
              <span class="wallet-address">
                {{ formatAddress(walletAccount) }}
              </span>
            </div>
            <van-button
              type="default"
              size="mini"
              @click="showWalletDetails = true"
            >
              Details
            </van-button>
          </div>

          <!-- Router View -->
          <router-view
            :wallet-connector="walletConnector"
            :wallet-account="walletAccount"
            :is-wallet-connected="isWalletConnected"
            @update-title="updatePageTitle"
          />
        </div>
      </div>

      <!-- Bottom Navigation -->
      <van-tabbar
        v-if="isWalletConnected && showTabbar"
        v-model="activeTab"
        :fixed="true"
        :z-index="100"
        @change="handleTabChange"
      >
        <van-tabbar-item name="dashboard" icon="home-o">
          {{ $t('nav.dashboard') }}
        </van-tabbar-item>
        <van-tabbar-item name="staking" icon="gold-coin-o">
          {{ $t('nav.staking') }}
        </van-tabbar-item>
        <van-tabbar-item name="lending" icon="credit-pay">
          {{ $t('nav.lending') }}
        </van-tabbar-item>
        <van-tabbar-item name="profile" icon="user-o">
          {{ $t('nav.profile') }}
        </van-tabbar-item>
      </van-tabbar>

      <!-- User Menu Popup -->
      <van-popup
        v-model:show="showUserMenu"
        position="top"
        :style="{ height: '40%' }"
      >
        <div class="user-menu">
          <div class="user-header">
            <van-icon name="wallet-o" size="60" color="#1989fa" />
            <h3>Wallet Connected</h3>
            <p>{{ formatAddress(walletAccount) }}</p>
          </div>
          
          <van-cell-group>
            <van-cell
              title="Language / 언어"
              :value="currentLanguage"
              is-link
              @click="showLanguageSelector = true"
            />
            <van-cell
              title="Wallet Details"
              is-link
              @click="showWalletDetails = true"
            />
            <van-cell
              title="Disconnect Wallet"
              is-link
              @click="handleDisconnectWallet"
            />
          </van-cell-group>
        </div>
      </van-popup>

      <!-- Language Selector -->
      <van-action-sheet
        v-model:show="showLanguageSelector"
        :actions="languageActions"
        @select="handleLanguageSelect"
        cancel-text="Cancel"
      />

      <!-- Wallet Details Popup -->
      <van-popup
        v-model:show="showWalletDetails"
        position="bottom"
        :style="{ height: '60%' }"
        round
      >
        <div class="wallet-details">
          <div class="wallet-details-header">
            <h3>Wallet Details</h3>
            <van-button
              type="default"
              size="small"
              @click="showWalletDetails = false"
            >
              Close
            </van-button>
          </div>
          
          <!-- Wallet Connector Component -->
          <MiniDappWalletConnector
            ref="walletDetailsConnector"
            :client-id="miniDappClientId"
            :chain-id="chainId"
            :auto-connect="false"
          />
        </div>
      </van-popup>

      <!-- Loading Overlay -->
      <van-overlay v-model:show="globalLoading" class="loading-overlay">
        <div class="loading-content">
          <van-loading color="#1989fa" size="24px">
            {{ loadingMessage || 'Loading...' }}
          </van-loading>
        </div>
      </van-overlay>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showDialog, showConfirmDialog } from 'vant'
import MiniDappWalletConnector from '@/components/MiniDappWalletConnector.vue'

// Router and i18n
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// Environment configuration
const miniDappClientId = import.meta.env.VITE_MINI_DAPP_CLIENT_ID || 'demo-client-id'
const chainId = import.meta.env.VITE_CHAIN_ID || '1001'

// Reactive state
const activeTab = ref('dashboard')
const currentPageTitle = ref('USDTide')
const showNavBar = ref(true)
const showTabbar = ref(true)
const showUserMenu = ref(false)
const showLanguageSelector = ref(false)
const showWalletDetails = ref(false)
const globalLoading = ref(false)
const loadingMessage = ref('')

// Wallet state
const isWalletConnected = ref(false)
const walletAccount = ref('')
const walletType = ref('')

// Wallet connector refs
const walletConnector = ref(null)
const walletDetailsConnector = ref(null)

// Language configuration
const languageActions = [
  { name: 'English', value: 'en' },
  { name: '한국어', value: 'ko' }
]

const currentLanguage = computed(() => {
  const lang = languageActions.find(l => l.value === locale.value)
  return lang ? lang.name : 'English'
})

// Page configuration
const pageConfig = {
  '/': { title: 'USDTide', showNavBar: false, showTabbar: true },
  '/dashboard': { title: 'Dashboard', showNavBar: false, showTabbar: true },
  '/staking': { title: 'Staking', showNavBar: true, showTabbar: true },
  '/lending': { title: 'Lending', showNavBar: true, showTabbar: true },
  '/profile': { title: 'Profile', showNavBar: true, showTabbar: true },
  '/settings': { title: 'Settings', showNavBar: true, showTabbar: false }
}

// Wallet event handlers
const handleWalletConnected = (walletInfo) => {
  console.log('✅ Wallet connected:', walletInfo)
  
  isWalletConnected.value = true
  walletAccount.value = walletInfo.account
  walletType.value = walletInfo.walletType
  
  showToast('Wallet connected successfully!')
  
  // Navigate to dashboard after connection
  if (route.path === '/') {
    router.push('/dashboard')
  }
}

const handleWalletDisconnected = () => {
  console.log('🔌 Wallet disconnected')
  
  isWalletConnected.value = false
  walletAccount.value = ''
  walletType.value = ''
  
  showToast('Wallet disconnected')
  
  // Navigate back to home
  router.push('/')
}

const handleWalletError = (error) => {
  console.error('❌ Wallet error:', error)
  
  showDialog({
    title: 'Wallet Error',
    message: error.message || 'An error occurred with the wallet connection',
    confirmButtonText: 'OK'
  })
}

const handleDisconnectWallet = async () => {
  try {
    const result = await showConfirmDialog({
      title: 'Disconnect Wallet',
      message: 'Are you sure you want to disconnect your wallet?',
      confirmButtonText: 'Disconnect',
      cancelButtonText: 'Cancel'
    })
    
    if (result === 'confirm' && walletConnector.value) {
      await walletConnector.value.disconnectWallet()
    }
  } catch (error) {
    // User cancelled
  }
  
  showUserMenu.value = false
}

// Navigation handlers
const handleTabChange = (name) => {
  router.push(`/${name}`)
}

const handleBack = () => {
  if (router.options.history.state.back) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}

const updatePageTitle = (title) => {
  currentPageTitle.value = title
}

// Language handlers
const handleLanguageSelect = (action) => {
  locale.value = action.value
  showLanguageSelector.value = false
  showToast(`Language changed to ${action.name}`)
}

// Utility functions
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Route watcher for page configuration
watch(route, (newRoute) => {
  const config = pageConfig[newRoute.path] || pageConfig['/']
  currentPageTitle.value = config.title
  showNavBar.value = config.showNavBar
  showTabbar.value = config.showTabbar
  
  // Update active tab
  const pathSegments = newRoute.path.split('/').filter(Boolean)
  if (pathSegments.length > 0) {
    activeTab.value = pathSegments[0]
  } else {
    activeTab.value = 'dashboard'
  }
}, { immediate: true })

// Initialize on mount
onMounted(() => {
  console.log('🌐 Web App initialized')
  console.log('Client ID:', miniDappClientId)
  console.log('Chain ID:', chainId)
})
</script>

<style scoped>
.web-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem 1rem 1rem;
  text-align: center;
}

.header-content {
  max-width: 400px;
  margin: 0 auto;
}

.logo {
  width: 60px;
  height: 60px;
  margin-bottom: 1rem;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.brand-title {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0.5rem 0;
  background: linear-gradient(45deg, #ffd700, #ffeb3b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin: 0;
}

.app-container {
  min-height: calc(100vh - 120px);
}

.main-content {
  padding-bottom: 60px;
}

.main-content.with-navbar {
  padding-top: 46px;
}

.wallet-required-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
}

.wallet-required-content {
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.connection-info {
  margin-top: 2rem;
}

.connection-info h3 {
  color: #323233;
  margin-bottom: 0.5rem;
}

.connection-info p {
  color: #646566;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.wallet-status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.wallet-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wallet-address {
  font-family: monospace;
  font-size: 0.8rem;
  color: #646566;
}

.app-content {
  padding: 0;
}

.user-menu {
  padding: 1rem;
}

.user-header {
  text-align: center;
  padding: 1rem 0 2rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 1rem;
}

.user-header h3 {
  margin: 1rem 0 0.5rem;
  color: #323233;
}

.user-header p {
  color: #646566;
  font-family: monospace;
  font-size: 0.9rem;
  margin: 0;
}

.wallet-details {
  padding: 1rem;
}

.wallet-details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.wallet-details-header h3 {
  margin: 0;
  color: #323233;
}

.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  text-align: center;
  color: white;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .web-header {
    padding: 1.5rem 1rem 0.75rem;
  }
  
  .brand-title {
    font-size: 1.6rem;
  }
  
  .logo {
    width: 50px;
    height: 50px;
  }
  
  .wallet-required-screen {
    padding: 1rem;
    min-height: 50vh;
  }
  
  .wallet-status-bar {
    padding: 0.5rem;
  }
  
  .wallet-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>