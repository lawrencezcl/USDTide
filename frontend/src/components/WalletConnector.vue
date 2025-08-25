<template>
  <div class="wallet-connector">
    <!-- Wallet Status Card -->
    <van-card
      v-if="showStatusCard"
      class="wallet-status-card"
      :class="{ 'connected': isConnected, 'disconnected': !isConnected }"
    >
      <template #thumb>
        <van-icon
          :name="isConnected ? 'checked' : 'warning-o'"
          :color="isConnected ? '#07c160' : '#ee0a24'"
          size="20"
        />
      </template>
      
      <template #title>
        <span class="status-title">
          {{ isConnected ? 'Wallet Connected' : 'Wallet Not Connected' }}
        </span>
      </template>
      
      <template #desc>
        <div v-if="isConnected" class="connected-info">
          <p class="address">{{ formatAddress(walletAddress) }}</p>
          <p class="network">{{ networkName }}</p>
        </div>
        <div v-else class="disconnected-info">
          <p>Connect your wallet to start using USDTide</p>
        </div>
      </template>
      
      <template #footer>
        <van-button
          v-if="!isConnected"
          type="primary"
          size="small"
          @click="requestConnection"
          :loading="isConnecting"
        >
          Connect Wallet
        </van-button>
        <van-button
          v-else
          type="default"
          size="small"
          @click="disconnect"
        >
          Disconnect
        </van-button>
      </template>
    </van-card>

    <!-- Balance Display -->
    <div v-if="isConnected && showBalances" class="balance-section">
      <van-grid :column-num="2" :border="false">
        <van-grid-item>
          <div class="balance-item">
            <div class="balance-icon">
              <img src="@/assets/usdt-icon.svg" alt="USDT" />
            </div>
            <div class="balance-info">
              <p class="balance-label">USDT Balance</p>
              <p class="balance-value">
                {{ formatBalance(usdtBalance, 6) }}
                <span class="balance-unit">USDT</span>
              </p>
            </div>
            <van-loading v-if="loadingBalances" size="16px" />
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="balance-item">
            <div class="balance-icon">
              <img src="@/assets/kaia-icon.svg" alt="KAIA" />
            </div>
            <div class="balance-info">
              <p class="balance-label">KAIA Balance</p>
              <p class="balance-value">
                {{ formatBalance(kaiaBalance, 18) }}
                <span class="balance-unit">KAIA</span>
              </p>
            </div>
            <van-loading v-if="loadingBalances" size="16px" />
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- Permission Request Dialog -->
    <van-dialog
      v-model:show="showPermissionDialog"
      title="LINE Wallet Authorization"
      :show-cancel-button="true"
      confirm-button-text="Try Again"
      cancel-button-text="Cancel"
      @confirm="handlePermissionConfirm"
      @cancel="handlePermissionCancel"
    >
      <div class="permission-content">
        <van-icon name="shield-o" size="50" color="#1989fa" />
        <p><strong>LINE Wallet Connection Failed</strong></p>
        <p>Please follow these steps:</p>
        <ol>
          <li>Make sure you're using the LINE app</li>
          <li>Tap "Try Again" below</li>
          <li>When prompted, tap "Authorize" in the wallet dialog</li>
          <li>Do not close the LINE app during authorization</li>
        </ol>
        <p class="permission-note">
          <van-icon name="info-o" size="16" /> Your funds remain secure in your wallet at all times.
        </p>
      </div>
    </van-dialog>

    <!-- Transaction Status Toast -->
    <van-overlay :show="showTransactionOverlay">
      <div class="transaction-overlay">
        <van-loading size="30px" color="#ffffff">
          {{ transactionStatus }}
        </van-loading>
      </div>
    </van-overlay>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ethers } from 'ethers'
import { showToast, showDialog } from 'vant'

// Props
const props = defineProps({
  liff: {
    type: Object,
    default: null
  },
  autoConnect: {
    type: Boolean,
    default: true
  },
  showStatusCard: {
    type: Boolean,
    default: true
  },
  showBalances: {
    type: Boolean,
    default: true
  },
  refreshInterval: {
    type: Number,
    default: 30000 // 30 seconds
  }
})

// Emits
const emit = defineEmits([
  'connected',
  'disconnected',
  'balanceUpdated',
  'error',
  'transactionStart',
  'transactionComplete',
  'transactionError'
])

// Environment configuration
const config = {
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '1001'),
  rpcUrl: import.meta.env.VITE_RPC_URL || 'https://public-node-testnet.kaia.io',
  networkName: import.meta.env.VITE_NETWORK_NAME || 'Kaia Testnet',
  usdtAddress: import.meta.env.VITE_USDT_TOKEN_ADDRESS,
  kaiaAddress: import.meta.env.VITE_KAIA_TOKEN_ADDRESS,
  stakingAddress: import.meta.env.VITE_STAKING_CONTRACT_ADDRESS,
  lendingAddress: import.meta.env.VITE_LENDING_CONTRACT_ADDRESS
}

// Reactive state
const isConnected = ref(false)
const isConnecting = ref(false)
const walletAddress = ref('')
const networkName = ref(config.networkName)
const usdtBalance = ref('0')
const kaiaBalance = ref('0')
const loadingBalances = ref(false)
const showPermissionDialog = ref(false)
const showTransactionOverlay = ref(false)
const transactionStatus = ref('')

// Blockchain instances
const provider = ref(null)
const signer = ref(null)
const contracts = ref({
  usdt: null,
  kaia: null,
  staking: null,
  lending: null
})

// Auto-refresh interval
let refreshTimer = null

// Check LINE wallet capabilities
const checkLineWalletCapabilities = () => {
  console.log('=== LINE Wallet Capabilities Check ===')
  console.log('LIFF available:', !!props.liff)
  
  if (props.liff) {
    console.log('LIFF version:', props.liff.getVersion())
    console.log('LIFF isLoggedIn:', props.liff.isLoggedIn())
    console.log('LIFF ethereum available:', !!props.liff.ethereum)
    
    if (props.liff.ethereum) {
      console.log('Ethereum object type:', typeof props.liff.ethereum)
      console.log('Ethereum object keys:', Object.keys(props.liff.ethereum))
      console.log('Request method available:', typeof props.liff.ethereum.request)
    }
  }
  
  console.log('User agent:', navigator.userAgent)
  console.log('Is LINE app:', navigator.userAgent.includes('Line/'))
  console.log('=======================================') 
}

// Contract ABIs (minimal for balance checking)
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
]

// Initialize provider
const initializeProvider = () => {
  try {
    provider.value = new ethers.JsonRpcProvider(config.rpcUrl)
    return true
  } catch (error) {
    console.error('Failed to initialize provider:', error)
    return false
  }
}

// Request wallet connection
const requestConnection = async () => {
  try {
    isConnecting.value = true
    checkLineWalletCapabilities()

    if (!props.liff) {
      throw new Error('LIFF not initialized')
    }

    // LINE Dapp Portal Wallet - Priority 1
    if (props.liff.ethereum) {
      console.log('🎯 Using LINE Dapp Portal Wallet')
      
      try {
        const accounts = await props.liff.ethereum.request({
          method: 'eth_requestAccounts'
        })

        if (!accounts || accounts.length === 0) {
          throw new Error('No accounts found in LINE wallet')
        }

        walletAddress.value = accounts[0]
        console.log('✅ LINE wallet connected:', accounts[0])
        
        const provider = new ethers.BrowserProvider(props.liff.ethereum)
        signer.value = await provider.getSigner()
      } catch (authError) {
        console.error('LINE wallet authorization failed:', authError)
        
        // Handle specific LINE authorization errors
        if (authError.code === 4001 || authError.message?.includes('User denied')) {
          console.log('🔄 Showing retry dialog for user denial')
          showPermissionDialog.value = true
          return
        } else if (authError.code === -32002) {
          console.log('🔄 Showing retry dialog for pending authorization')
          showPermissionDialog.value = true
          return
        } else {
          console.log('🔄 Showing retry dialog for connection error')
          showPermissionDialog.value = true
          return
        }
      }
      
    } else if (window.ethereum) {
      // Fallback to regular browser wallet
      console.log('Using browser wallet...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found')
      }

      walletAddress.value = accounts[0]
      
      // Initialize signer
      const provider = new ethers.BrowserProvider(window.ethereum)
      signer.value = await provider.getSigner()
      
    } else {
      // No wallet available
      console.log('❌ No wallet provider available')
      showPermissionDialog.value = true
      return
    }

    // Verify network
    await verifyNetwork()
    
    // Initialize contracts
    initializeContracts()
    
    // Load balances
    await loadBalances()
    
    isConnected.value = true
    
    // Start auto-refresh
    startAutoRefresh()
    
    emit('connected', {
      address: walletAddress.value,
      networkName: networkName.value
    })
    
    showToast('Wallet connected successfully')
    
  } catch (error) {
    console.error('Wallet connection failed:', error)
    handleError(error)
  } finally {
    isConnecting.value = false
  }
}

// Handle permission dialog
const handlePermissionConfirm = async () => {
  showPermissionDialog.value = false
  
  try {
    // Run diagnostics first
    checkLineWalletCapabilities()
    
    // For LINE Dapp Portal Wallet integration
    if (props.liff && props.liff.ethereum) {
      console.log('🔄 Retrying LINE wallet authorization...')
      console.log('LIFF ethereum object:', props.liff.ethereum)
      console.log('Available methods:', Object.getOwnPropertyNames(props.liff.ethereum))
      
      // Force a fresh authorization request
      const accounts = await props.liff.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      console.log('Authorization response:', accounts)
      
      if (accounts && accounts.length > 0) {
        walletAddress.value = accounts[0]
        console.log('✅ LINE wallet authorized:', accounts[0])
        
        const provider = new ethers.BrowserProvider(props.liff.ethereum)
        signer.value = await provider.getSigner()
        
        await verifyNetwork()
        initializeContracts()
        await loadBalances()
        
        isConnected.value = true
        startAutoRefresh()
        
        emit('connected', {
          address: walletAddress.value,
          networkName: networkName.value
        })
        
        showToast('Wallet connected successfully')
      } else {
        console.error('No accounts returned from LINE wallet')
        showToast('No accounts found. Please ensure your LINE wallet is set up.')
        showPermissionDialog.value = true
      }
    } else {
      console.error('LINE Dapp Portal Wallet not available')
      console.log('LIFF object:', props.liff)
      showToast('LINE Dapp Portal Wallet not available')
    }
  } catch (error) {
    console.error('Permission dialog authorization failed:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    
    // Show the dialog again for retry
    if (error.code === 4001 || error.message?.includes('User denied')) {
      showToast('Authorization cancelled. Please try again.')
      showPermissionDialog.value = true
    } else {
      handleError(error)
    }
  }
}

const handlePermissionCancel = () => {
  showPermissionDialog.value = false
  showToast('Wallet connection cancelled')
}

// Verify network
const verifyNetwork = async () => {
  try {
    let currentProvider = null;
    
    // Use the actual wallet provider (LINE or browser)
    if (props.liff && props.liff.ethereum) {
      currentProvider = new ethers.BrowserProvider(props.liff.ethereum);
    } else if (window.ethereum) {
      currentProvider = new ethers.BrowserProvider(window.ethereum);
    } else {
      currentProvider = provider.value;
    }
    
    const network = await currentProvider.getNetwork();
    
    if (Number(network.chainId) !== config.chainId) {
      throw new Error(`Wrong network. Please switch to ${config.networkName}`)
    }
  } catch (error) {
    throw new Error(`Network verification failed: ${error.message}`)
  }
}

// Initialize contracts
const initializeContracts = () => {
  try {
    let contractProvider = null;
    
    // Use signer for write operations, provider for read operations
    if (signer.value) {
      // If we have a signer (from LINE or browser wallet)
      contractProvider = signer.value;
    } else if (provider.value) {
      // Fallback to RPC provider
      contractProvider = provider.value;
    } else {
      return;
    }
    
    contracts.value = {
      usdt: new ethers.Contract(config.usdtAddress, ERC20_ABI, contractProvider),
      kaia: new ethers.Contract(config.kaiaAddress, ERC20_ABI, contractProvider),
      staking: null, // Will be initialized when needed
      lending: null  // Will be initialized when needed
    }
  } catch (error) {
    console.error('Contract initialization failed:', error)
  }
}

// Load balances
const loadBalances = async () => {
  if (!isConnected.value || !walletAddress.value) return
  
  try {
    loadingBalances.value = true
    
    let balanceProvider = null;
    
    // Use the appropriate provider for balance queries
    if (props.liff && props.liff.ethereum) {
      balanceProvider = new ethers.BrowserProvider(props.liff.ethereum);
    } else if (window.ethereum) {
      balanceProvider = new ethers.BrowserProvider(window.ethereum);
    } else {
      balanceProvider = provider.value;
    }
    
    // Get USDT contract with the correct provider
    const usdtContract = new ethers.Contract(config.usdtAddress, ERC20_ABI, balanceProvider);
    
    const [usdtBal, kaiaBal] = await Promise.all([
      usdtContract.balanceOf(walletAddress.value),
      balanceProvider.getBalance(walletAddress.value)
    ])
    
    usdtBalance.value = usdtBal.toString()
    kaiaBalance.value = kaiaBal.toString()
    
    emit('balanceUpdated', {
      usdt: usdtBalance.value,
      kaia: kaiaBalance.value,
      address: walletAddress.value
    })
    
  } catch (error) {
    console.error('Failed to load balances:', error)
  } finally {
    loadingBalances.value = false
  }
}

// Format address for display
const formatAddress = (address) => {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format balance for display
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
    console.error('Balance formatting error:', error)
    return '0.00'
  }
}

// Start auto-refresh
const startAutoRefresh = () => {
  if (refreshTimer) clearInterval(refreshTimer)
  
  refreshTimer = setInterval(() => {
    if (isConnected.value) {
      loadBalances()
    }
  }, props.refreshInterval)
}

// Stop auto-refresh
const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Disconnect wallet
const disconnect = () => {
  isConnected.value = false
  walletAddress.value = ''
  usdtBalance.value = '0'
  kaiaBalance.value = '0'
  signer.value = null
  
  stopAutoRefresh()
  
  emit('disconnected')
  showToast('Wallet disconnected')
}

// Execute transaction
const executeTransaction = async (transaction, description = 'Transaction') => {
  try {
    showTransactionOverlay.value = true
    transactionStatus.value = `Preparing ${description}...`
    
    emit('transactionStart', description)
    
    if (!signer.value) {
      throw new Error('Wallet not connected')
    }
    
    transactionStatus.value = `Confirming ${description}...`
    
    const tx = await transaction()
    
    transactionStatus.value = `Processing ${description}...`
    
    const receipt = await tx.wait()
    
    // Refresh balances after transaction
    await loadBalances()
    
    emit('transactionComplete', {
      hash: receipt.hash,
      description
    })
    
    showToast(`${description} completed successfully`)
    
    return receipt
    
  } catch (error) {
    console.error(`${description} failed:`, error)
    emit('transactionError', error)
    handleError(error)
    throw error
  } finally {
    showTransactionOverlay.value = false
    transactionStatus.value = ''
  }
}

// Handle errors
const handleError = (error) => {
  console.error('=== Wallet Error Debug ===', error)
  let message = 'An error occurred'
  
  if (error.code === 'ACTION_REJECTED' || error.code === 4001) {
    message = 'Authorization cancelled by user'
  } else if (error.code === 'INSUFFICIENT_FUNDS') {
    message = 'Insufficient funds for transaction'
  } else if (error.code === 'NETWORK_ERROR') {
    message = 'Network error. Please check your connection.'
  } else if (error.code === -32002) {
    message = 'Authorization request already pending. Please check your wallet.'
  } else if (error.code === -32603) {
    message = 'Internal wallet error. Please try again.'
  } else if (error.message && error.message.includes('User denied')) {
    message = 'Authorization denied by user'
  } else if (error.message && error.message.includes('already pending')) {
    message = 'Authorization request already pending'
  } else if (error.message) {
    message = error.message
  }
  
  console.log('Error message shown to user:', message)
  emit('error', error)
  showToast(message)
}

// Get current signer
const getSigner = () => signer.value

// Get contract instance
const getContract = (contractName) => contracts.value[contractName]

// Expose methods to parent
defineExpose({
  connect: requestConnection,
  disconnect,
  loadBalances,
  executeTransaction,
  getSigner,
  getContract,
  isConnected,
  walletAddress,
  usdtBalance,
  kaiaBalance
})

// Initialize on mount
onMounted(() => {
  initializeProvider()
  
  // Enhanced LINE detection and auto-connection
  const isLineEnvironment = props.liff && props.liff.ethereum
  
  if (isLineEnvironment) {
    console.log('🎯 LINE Dapp Portal detected, auto-connecting...')
    // Small delay to ensure LIFF is fully ready
    setTimeout(() => {
      requestConnection()
    }, 1000)
  } else if (props.autoConnect && props.liff) {
    requestConnection()
  }
})

// Watch for LIFF changes
watch(() => props.liff, (newLiff) => {
  if (newLiff && props.autoConnect) {
    requestConnection()
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
.wallet-connector {
  width: 100%;
}

.wallet-status-card {
  margin-bottom: 1rem;
  border-radius: 12px;
  overflow: hidden;
}

.wallet-status-card.connected {
  border: 1px solid #07c160;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.wallet-status-card.disconnected {
  border: 1px solid #ee0a24;
  background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
}

.status-title {
  font-weight: 600;
  font-size: 1rem;
}

.connected-info .address {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  color: #646566;
  margin: 0.25rem 0;
}

.connected-info .network {
  font-size: 0.8rem;
  color: #969799;
  margin: 0;
}

.disconnected-info p {
  color: #646566;
  margin: 0;
  font-size: 0.9rem;
}

.balance-section {
  margin-top: 1rem;
}

.balance-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  position: relative;
}

.balance-icon {
  width: 40px;
  height: 40px;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.balance-icon img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 0.8rem;
  color: #969799;
  margin: 0 0 0.25rem 0;
}

.balance-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #323233;
  margin: 0;
}

.balance-unit {
  font-size: 0.9rem;
  color: #969799;
  font-weight: normal;
}

.permission-content {
  text-align: center;
  padding: 1rem;
}

.permission-content p {
  margin: 1rem 0;
  line-height: 1.5;
  color: #646566;
}

.permission-content ul {
  text-align: left;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.permission-content li {
  margin: 0.5rem 0;
  color: #646566;
}

.permission-note {
  font-size: 0.85rem;
  color: #969799;
  background: #f7f8fa;
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.transaction-overlay {
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
  .balance-item {
    padding: 0.75rem;
  }
  
  .balance-icon {
    width: 36px;
    height: 36px;
    margin-right: 0.5rem;
  }
  
  .balance-value {
    font-size: 1rem;
  }
}

@media (max-width: 375px) {
  .balance-item {
    padding: 0.5rem;
  }
  
  .balance-icon {
    width: 32px;
    height: 32px;
  }
  
  .balance-value {
    font-size: 0.95rem;
  }
}
</style>