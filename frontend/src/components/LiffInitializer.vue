<template>
  <div class="liff-initializer">
    <!-- Loading Screen -->
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-content">
        <img src="@/assets/logo.svg" alt="USDTide" class="logo" />
        <h1 class="brand-title">USDTide</h1>
        <p class="brand-subtitle">Kaia Ecosystem DeFi Tool</p>
        <van-loading color="#1989fa" size="24px">Initializing...</van-loading>
      </div>
    </div>

    <!-- Error Screen -->
    <div v-else-if="error" class="error-screen">
      <van-empty description="Initialization Failed">
        <template #image>
          <van-icon name="warning-o" size="100" color="#ee0a24" />
        </template>
      </van-empty>
      <div class="error-content">
        <h3>{{ error.title }}</h3>
        <p>{{ error.message }}</p>
        <van-button type="primary" @click="retry" :loading="isRetrying">
          Retry
        </van-button>
      </div>
    </div>

    <!-- Success - Render Children -->
    <div v-else class="liff-ready">
      <slot :liff="liff" :user="user" :isLoggedIn="isLoggedIn" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import liff from '@line/liff'
import { showToast, showDialog } from 'vant'

// Props
const props = defineProps({
  liffId: {
    type: String,
    required: true
  },
  mockLogin: {
    type: Boolean,
    default: false // For development testing
  }
})

// Emits
const emit = defineEmits(['ready', 'error', 'login', 'logout'])

// Reactive state
const isLoading = ref(true)
const isRetrying = ref(false)
const error = ref(null)
const isLoggedIn = ref(false)
const user = ref(null)
const liffInstance = ref(null)

// LIFF initialization
const initializeLiff = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Initialize LIFF
    await liff.init({ liffId: props.liffId })
    liffInstance.value = liff

    // Check login status
    if (liff.isLoggedIn()) {
      isLoggedIn.value = true
      
      // Get user profile
      const profile = await liff.getProfile()
      user.value = {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage
      }

      emit('login', user.value)
    } else {
      isLoggedIn.value = false
      emit('logout')
    }

    emit('ready', liffInstance.value)
    
  } catch (err) {
    console.error('LIFF initialization failed:', err)
    
    // Handle different error types
    if (err.code === 'INVALID_ARGUMENT') {
      error.value = {
        title: 'Configuration Error',
        message: 'Invalid LIFF ID. Please contact support.'
      }
    } else if (err.code === 'FORBIDDEN') {
      error.value = {
        title: 'Access Denied',
        message: 'This app is not available in your region.'
      }
    } else if (err.code === 'NETWORK_ERROR') {
      error.value = {
        title: 'Network Error',
        message: 'Please check your internet connection and try again.'
      }
    } else {
      error.value = {
        title: 'Initialization Failed',
        message: 'Failed to initialize LINE login. Please try again.'
      }
    }
    
    emit('error', error.value)
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

// Mock initialization for development
const initializeMock = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock user data
    user.value = {
      userId: 'mock_user_123',
      displayName: 'Test User',
      pictureUrl: 'https://via.placeholder.com/100',
      statusMessage: 'Testing USDTide'
    }

    isLoggedIn.value = true
    
    // Mock LIFF object
    liffInstance.value = {
      isLoggedIn: () => true,
      login: () => Promise.resolve(),
      logout: () => Promise.resolve(),
      getProfile: () => Promise.resolve(user.value),
      sendMessages: () => Promise.resolve(),
      openWindow: (url) => window.open(url, '_blank'),
      closeWindow: () => window.close(),
      isInClient: () => false,
      isApiAvailable: () => true
    }

    emit('login', user.value)
    emit('ready', liffInstance.value)
    
  } catch (err) {
    error.value = {
      title: 'Mock Error',
      message: 'Development mock initialization failed.'
    }
    emit('error', error.value)
  } finally {
    isLoading.value = false
    isRetrying.value = false
  }
}

// Retry initialization
const retry = async () => {
  isRetrying.value = true
  if (props.mockLogin) {
    await initializeMock()
  } else {
    await initializeLiff()
  }
}

// Login function
const login = async () => {
  try {
    if (props.mockLogin) {
      showToast('Mock login successful')
      return
    }

    if (liffInstance.value && !liffInstance.value.isLoggedIn()) {
      liffInstance.value.login()
    }
  } catch (err) {
    console.error('Login failed:', err)
    showToast('Login failed. Please try again.')
  }
}

// Logout function
const logout = async () => {
  try {
    if (props.mockLogin) {
      isLoggedIn.value = false
      user.value = null
      emit('logout')
      showToast('Logged out successfully')
      return
    }

    if (liffInstance.value && liffInstance.value.isLoggedIn()) {
      liffInstance.value.logout()
      isLoggedIn.value = false
      user.value = null
      emit('logout')
    }
  } catch (err) {
    console.error('Logout failed:', err)
    showToast('Logout failed. Please try again.')
  }
}

// Send LINE messages
const sendMessage = async (messages) => {
  try {
    if (props.mockLogin) {
      console.log('Mock sending messages:', messages)
      showToast('Message sent (mock)')
      return
    }

    if (liffInstance.value && liffInstance.value.isApiAvailable('sendMessages')) {
      await liffInstance.value.sendMessages(messages)
      showToast('Message sent successfully')
    } else {
      throw new Error('Send message API not available')
    }
  } catch (err) {
    console.error('Send message failed:', err)
    showToast('Failed to send message')
  }
}

// Open external window
const openWindow = (url, external = false) => {
  try {
    if (props.mockLogin || !liffInstance.value) {
      window.open(url, external ? '_blank' : '_self')
      return
    }

    if (external) {
      liffInstance.value.openWindow({
        url: url,
        external: true
      })
    } else {
      window.open(url, '_self')
    }
  } catch (err) {
    console.error('Open window failed:', err)
    window.open(url, '_blank')
  }
}

// Close LIFF window
const closeWindow = () => {
  try {
    if (props.mockLogin) {
      showDialog({
        title: 'Mock Close',
        message: 'This would close the LIFF window in production.'
      })
      return
    }

    if (liffInstance.value) {
      liffInstance.value.closeWindow()
    }
  } catch (err) {
    console.error('Close window failed:', err)
  }
}

// Expose methods to parent
defineExpose({
  login,
  logout,
  sendMessage,
  openWindow,
  closeWindow,
  liff: liffInstance,
  user,
  isLoggedIn
})

// Initialize on mount
onMounted(() => {
  if (props.mockLogin) {
    initializeMock()
  } else {
    initializeLiff()
  }
})

// Watch for LIFF ID changes
watch(() => props.liffId, () => {
  if (!props.mockLogin) {
    initializeLiff()
  }
})
</script>

<style scoped>
.liff-initializer {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.loading-content {
  text-align: center;
  padding: 2rem;
}

.logo {
  width: 80px;
  height: 80px;
  margin-bottom: 1rem;
  border-radius: 50%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.brand-title {
  font-size: 2rem;
  font-weight: bold;
  margin: 1rem 0 0.5rem;
  background: linear-gradient(45deg, #ffd700, #ffeb3b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-subtitle {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 2rem;
}

.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
}

.error-content {
  margin-top: 1rem;
}

.error-content h3 {
  color: #ee0a24;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #646566;
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.liff-ready {
  width: 100%;
  height: 100%;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .brand-title {
    font-size: 1.8rem;
  }
  
  .loading-content {
    padding: 1.5rem;
  }
  
  .logo {
    width: 70px;
    height: 70px;
  }
}

@media (max-width: 375px) {
  .brand-title {
    font-size: 1.6rem;
  }
  
  .loading-content {
    padding: 1rem;
  }
  
  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>