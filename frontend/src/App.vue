<template>
  <div id="app">
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
            v-if="isLoggedIn"
            name="user-o"
            size="18"
            @click="showUserMenu = true"
          />
        </template>
      </van-nav-bar>

      <!-- Main Content -->
      <div class="main-content" :class="{ 'with-navbar': showNavBar }">
        <!-- LIFF Initializer (non-blocking) -->
        <LiffInitializer
          :liff-id="liffId"
          :mock-login="isDevelopment"
          @ready="handleLiffReady"
          @login="handleLogin"
          @logout="handleLogout"
          @error="handleLiffError"
        />

        <!-- Mini Dapp Wallet Connector -->
        <MiniDappWalletConnector
          ref="walletConnector"
          :liff="liff"
          :client-id="miniDappClientId"
          :chain-id="chainId"
          :auto-connect="isLoggedIn"
          @connected="handleWalletConnected"
          @disconnected="handleWalletDisconnected"
          @error="handleWalletError"
        />

        <!-- Router View -->
        <router-view
          :liff="liff"
          :user="user"
          :is-logged-in="isLoggedIn"
          :wallet-connector="walletConnector"
          @update-title="updatePageTitle"
        />
      </div>

      <!-- Bottom Navigation -->
      <van-tabbar
        v-if="showTabbar"
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
            <van-image
              :src="user?.pictureUrl || '/default-avatar.png'"
              round
              width="60"
              height="60"
            />
            <h3>{{ user?.displayName || 'User' }}</h3>
            <p>{{ user?.statusMessage || '' }}</p>
          </div>
          
          <van-cell-group>
            <van-cell
              title="Language / 언어"
              :value="currentLanguage"
              is-link
              @click="showLanguageSelector = true"
            />
            <van-cell
              title="Settings"
              is-link
              @click="goToSettings"
            />
            <van-cell
              title="Help & Support"
              is-link
              @click="openSupport"
            />
            <van-cell
              v-if="isLoggedIn"
              title="Logout"
              @click="handleLogoutClick"
              class="logout-cell"
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

      <!-- Global Loading -->
      <van-overlay :show="globalLoading">
        <div class="global-loading">
          <van-loading size="30px" color="#ffffff">
            {{ loadingMessage }}
          </van-loading>
        </div>
      </van-overlay>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast, showDialog, showConfirmDialog } from 'vant'
import LiffInitializer from '@/components/LiffInitializer.vue'
import MiniDappWalletConnector from '@/components/MiniDappWalletConnector.vue'

// Router and i18n
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

// Environment configuration
const liffId = import.meta.env.VITE_LIFF_ID || 'mock'
const miniDappClientId = import.meta.env.VITE_MINI_DAPP_CLIENT_ID || 'demo-client-id'
const chainId = import.meta.env.VITE_CHAIN_ID || '1001'
const isDevelopment = import.meta.env.VITE_ENABLE_MOCK_MODE === 'true' || import.meta.env.DEV

// Reactive state
const activeTab = ref('dashboard')
const currentPageTitle = ref('USDTide')
const showNavBar = ref(true)
const showTabbar = ref(true)
const showUserMenu = ref(false)
const showLanguageSelector = ref(false)
const globalLoading = ref(false)
const loadingMessage = ref('')

// LIFF and user state
const liff = ref(null)
const user = ref(null)
const isLoggedIn = ref(false)

// Wallet connector ref
const walletConnector = ref(null)

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

// LIFF event handlers
const handleLiffReady = (liffInstance) => {
  liff.value = liffInstance
  console.log('LIFF ready:', liffInstance)
}

const handleLogin = (userData) => {
  user.value = userData
  isLoggedIn.value = true
  console.log('User logged in:', userData)
  
  // Navigate to dashboard if on landing page
  if (route.path === '/') {
    router.push('/dashboard')
  }
}

const handleLogout = () => {
  user.value = null
  isLoggedIn.value = false
  console.log('User logged out')
  
  // Navigate to landing page
  router.push('/')
}

const handleLiffError = (error) => {
  console.error('LIFF error:', error)
  showDialog({
    title: 'Initialization Error',
    message: error.message || 'Failed to initialize LINE login. Please refresh and try again.',
    confirmButtonText: 'Refresh',
  }).then(() => {
    window.location.reload()
  })
}

// Wallet event handlers
const handleWalletConnected = (walletInfo) => {
  console.log('Wallet connected:', walletInfo)
  showToast('Wallet connected successfully')
}

const handleWalletDisconnected = () => {
  console.log('Wallet disconnected')
  showToast('Wallet disconnected')
}

const handleWalletError = (error) => {
  console.error('Wallet error:', error)
  // Error is already handled by WalletConnector
}

// Navigation handlers
const handleBack = () => {
  if (router.options.history.state.back) {
    router.back()
  } else {
    router.push('/dashboard')
  }
}

const handleTabChange = (name) => {
  router.push(`/${name}`)
}

const updatePageTitle = (title) => {
  currentPageTitle.value = title
}

// User menu handlers
const handleLogoutClick = async () => {
  try {
    const confirmed = await showConfirmDialog({
      title: 'Logout',
      message: 'Are you sure you want to logout?'
    })
    
    if (confirmed) {
      if (liff.value && liff.value.logout) {
        liff.value.logout()
      } else {
        handleLogout()
      }
    }
  } catch (error) {
    // User cancelled
  }
}

const goToSettings = () => {
  showUserMenu.value = false
  router.push('/settings')
}

const openSupport = () => {
  showUserMenu.value = false
  
  if (liff.value && liff.value.openWindow) {
    liff.value.openWindow('https://usdtide.xyz/support', true)
  } else {
    window.open('https://usdtide.xyz/support', '_blank')
  }
}

// Language handlers
const handleLanguageSelect = (action) => {
  locale.value = action.value
  localStorage.setItem('usdtide-language', action.value)
  showLanguageSelector.value = false
  showToast(`Language changed to ${action.name}`)
}

// Global loading control
const showGlobalLoading = (message = 'Loading...') => {
  loadingMessage.value = message
  globalLoading.value = true
}

const hideGlobalLoading = () => {
  globalLoading.value = false
  loadingMessage.value = ''
}

// Update page configuration based on route
const updatePageConfig = () => {
  const config = pageConfig[route.path] || pageConfig['/']
  currentPageTitle.value = t(`nav.${config.title.toLowerCase()}`) || config.title
  showNavBar.value = config.showNavBar
  showTabbar.value = config.showTabbar
  
  // Update active tab
  const pathParts = route.path.split('/')
  if (pathParts.length > 1 && pathParts[1]) {
    activeTab.value = pathParts[1]
  } else {
    activeTab.value = 'dashboard'
  }
}

// Watch route changes
watch(route, () => {
  updatePageConfig()
  showUserMenu.value = false
}, { immediate: true })

// Initialize app
onMounted(() => {
  // Load saved language
  const savedLanguage = localStorage.getItem('usdtide-language')
  if (savedLanguage && ['en', 'ko'].includes(savedLanguage)) {
    locale.value = savedLanguage
  }
  
  // Set initial page config
  updatePageConfig()
})

// Expose global methods
defineExpose({
  showGlobalLoading,
  hideGlobalLoading,
  liff,
  user,
  isLoggedIn,
  walletConnector
})
</script>

<style scoped>
#app {
  height: 100vh;
  overflow: hidden;
  background: #f7f8fa;
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 60px; /* Space for tabbar */
}

.main-content.with-navbar {
  padding-top: 46px; /* Space for navbar */
}

.user-menu {
  padding: 1rem;
  height: 100%;
}

.user-header {
  text-align: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 1rem;
}

.user-header h3 {
  margin: 0.75rem 0 0.25rem;
  color: #323233;
}

.user-header p {
  margin: 0;
  color: #969799;
  font-size: 0.9rem;
}

.logout-cell {
  color: #ee0a24;
}

.global-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: white;
  text-align: center;
  flex-direction: column;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .main-content {
    padding-bottom: 55px;
  }
  
  .main-content.with-navbar {
    padding-top: 44px;
  }
}

/* Handle safe area for devices with notch */
@supports (padding: max(0px)) {
  .main-content {
    padding-bottom: max(60px, env(safe-area-inset-bottom));
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  #app {
    background: #1a1a1a;
  }
}
</style>