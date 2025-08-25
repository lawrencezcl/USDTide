<template>
  <div class="mini-dapp-wallet-connector">
    <!-- Wallet Status Card -->
    <van-card
      :title="isConnected ? 'Wallet Connected' : 'Connect Wallet'"
      :desc="walletStatusDescription"
      :thumb="walletIcon"
      class="wallet-card"
    >
      <template #tags>
        <van-tag v-if="isConnected" type="success" size="medium">
          {{ walletType }}
        </van-tag>
        <van-tag v-else type="default" size="medium">
          Disconnected
        </van-tag>
      </template>
      
      <template #footer>
        <div class="wallet-actions">
          <van-button
            v-if="!isConnected"
            type="primary"
            size="small"
            :loading="isConnecting"
            @click="connectWallet"
            block
          >
            {{ isConnecting ? 'Connecting...' : 'Connect Wallet' }}
          </van-button>
          
          <div v-else class="connected-actions">
            <van-button
              type="default"
              size="small"
              @click="copyAddress"
              icon="copy"
            >
              Copy Address
            </van-button>
            <van-button
              type="danger"
              size="small"
              @click="disconnectWallet"
              :loading="isDisconnecting"
            >
              Disconnect
            </van-button>
          </div>
        </div>
      </template>
    </van-card>

    <!-- Network Info -->
    <van-cell-group v-if="isConnected" title="Network Information" class="network-info">
      <van-cell title="Network" :value="networkName" />
      <van-cell title="Chain ID" :value="chainId" />
      <van-cell title="Balance" :value="balance + ' KAIA'" />
    </van-cell-group>

    <!-- Debug Information (Development Only) -->
    <van-collapse v-if="isDevelopment" v-model="debugExpanded" class="debug-info">
      <van-collapse-item title="Debug Information" name="debug">
        <div class="debug-content">
          <p><strong>SDK Initialized:</strong> {{ sdkInitialized }}</p>
          <p><strong>Wallet Type:</strong> {{ walletType }}</p>
          <p><strong>Account:</strong> {{ account }}</p>
          <p><strong>Chain ID:</strong> {{ chainId }}</p>
          <p><strong>Environment:</strong> {{ environment }}</p>
          <p><strong>LIFF Available:</strong> {{ liffAvailable }}</p>
        </div>
      </van-collapse-item>
    </van-collapse>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { showToast, showDialog } from 'vant'
import DappPortalSDK from '@linenext/dapp-portal-sdk'
import { ethers } from 'ethers'

// Props
const props = defineProps({
  liff: {
    type: Object,
    default: null
  },
  autoConnect: {
    type: Boolean,
    default: false
  },
  clientId: {
    type: String,
    required: true
  },
  chainId: {
    type: String,
    default: '1001' // Kaia testnet by default
  }
})

// Emits
const emit = defineEmits(['connected', 'disconnected', 'error', 'account-changed'])

// Reactive state
const isConnecting = ref(false)
const isDisconnecting = ref(false)
const isConnected = ref(false)
const account = ref('')
const balance = ref('0')
const walletType = ref('')
const networkName = ref('')
const sdkInitialized = ref(false)
const debugExpanded = ref([])

// SDK instances
const sdk = ref(null)
const walletProvider = ref(null)

// Environment detection
const isDevelopment = computed(() => import.meta.env.DEV)
const environment = computed(() => {
  if (props.liff && props.liff.isInClient && props.liff.isInClient()) {
    return 'LIFF'
  }
  return 'Web'
})
const liffAvailable = computed(() => !!props.liff)

// Computed properties
const walletStatusDescription = computed(() => {
  if (isConnected.value) {
    return `${account.value.slice(0, 6)}...${account.value.slice(-4)}`
  }
  return 'Connect your wallet to start using USDTide'
})

const walletIcon = computed(() => {
  if (isConnected.value) {
    switch (walletType.value) {
      case 'Liff':
        return 'https://static.line-scdn.net/line_logo_200x200.png'
      case 'OKX':
        return 'https://static.okx.com/cdn/assets/imgs/221/58E63FEA47A2B7D7.png'
      case 'BITGET':
        return 'https://img.bitgetimg.com/multiplatform/web/favicon.ico'
      default:
        return 'https://via.placeholder.com/40x40?text=W'
    }
  }
  return 'https://via.placeholder.com/40x40?text=?'
})

// Initialize Mini Dapp SDK
const initializeSDK = async () => {
  try {
    console.log('🚀 Initializing Mini Dapp SDK...')
    console.log('Client ID:', props.clientId)
    console.log('Chain ID:', props.chainId)
    console.log('Environment:', environment.value)
    
    // Initialize SDK
    sdk.value = await DappPortalSDK.init({
      clientId: props.clientId,
      chainId: props.chainId
    })
    
    // Get wallet provider (EIP-1193 compatible)
    walletProvider.value = sdk.value.getWalletProvider()
    
    // Verify EIP-1193 compatibility
    if (typeof walletProvider.value.request !== 'function') {
      throw new Error('Wallet provider is not EIP-1193 compatible')
    }
    
    // Get wallet type
    walletType.value = walletProvider.value.getWalletType()
    
    sdkInitialized.value = true
    
    console.log('✅ Mini Dapp SDK initialized successfully')
    console.log('Wallet Provider:', walletProvider.value)
    console.log('Wallet Type:', walletType.value)
    console.log('Provider methods:', Object.getOwnPropertyNames(walletProvider.value))
    
    // Set up event listeners
    setupEventListeners()
    
    // Check if already connected
    await checkExistingConnection()
    
  } catch (error) {
    console.error('❌ Failed to initialize Mini Dapp SDK:', error)
    emit('error', {
      type: 'SDK_INIT_ERROR',
      message: 'Failed to initialize Mini Dapp SDK',
      error
    })
    showToast('Failed to initialize wallet SDK')
    
    // Initialize mock wallet for development
    console.log('🔄 Falling back to mock wallet for development')
    initializeMockWallet()
  }
}

// Setup event listeners
const setupEventListeners = () => {
  if (!walletProvider.value) return
  
  // Listen for account changes
  walletProvider.value.on('accountsChanged', (accounts) => {
    console.log('👤 Accounts changed:', accounts)
    if (accounts.length === 0) {
      handleDisconnection()
    } else {
      account.value = accounts[0]
      emit('account-changed', accounts[0])
      updateBalance()
    }
  })
  
  // Listen for chain changes
  walletProvider.value.on('chainChanged', (chainId) => {
    console.log('🔗 Chain changed:', chainId)
    updateNetworkInfo()
  })
  
  // Listen for disconnect
  walletProvider.value.on('disconnect', () => {
    console.log('🔌 Wallet disconnected')
    handleDisconnection()
  })
}

// Check existing connection
const checkExistingConnection = async () => {
  try {
    // Try kaia_accounts first, then fall back to eth_accounts
    let accounts
    try {
      accounts = await walletProvider.value.request({ 
        method: 'kaia_accounts' 
      })
    } catch (kaiaError) {
      console.warn('kaia_accounts failed, using eth_accounts:', kaiaError)
      accounts = await walletProvider.value.request({ 
        method: 'eth_accounts' 
      })
    }
    
    if (accounts && accounts.length > 0) {
      account.value = accounts[0]
      isConnected.value = true
      await updateBalance()
      await updateNetworkInfo()
      
      console.log('✅ Existing wallet connection found:', account.value)
      emit('connected', {
        account: account.value,
        walletType: walletType.value,
        chainId: props.chainId
      })
    }
  } catch (error) {
    console.log('ℹ️ No existing wallet connection found')
  }
}

// Connect wallet using kaia_requestAccounts (Mini Dapp SDK method)
const connectWallet = async () => {
  if (!walletProvider.value) {
    showToast('Wallet provider not initialized')
    return
  }
  
  try {
    isConnecting.value = true
    
    console.log('🔗 Requesting wallet connection using kaia_requestAccounts...')
    
    // Use kaia_requestAccounts as specified in Mini Dapp SDK documentation
    let accounts
    try {
      accounts = await walletProvider.value.request({
        method: 'kaia_requestAccounts'
      })
    } catch (kaiaError) {
      console.warn('kaia_requestAccounts failed, falling back to eth_requestAccounts:', kaiaError)
      // Fallback to standard EIP-1193 method
      accounts = await walletProvider.value.request({
        method: 'eth_requestAccounts'
      })
    }
    
    if (accounts && accounts.length > 0) {
      account.value = accounts[0]
      isConnected.value = true
      
      // Update wallet info
      await updateBalance()
      await updateNetworkInfo()
      
      console.log('✅ Wallet connected successfully:', account.value)
      
      emit('connected', {
        account: account.value,
        walletType: walletType.value,
        chainId: props.chainId,
        networkName: networkName.value
      })
      
      showToast('Wallet connected successfully!')
    } else {
      throw new Error('No accounts returned')
    }
    
  } catch (error) {
    console.error('❌ Failed to connect wallet:', error)
    
    let errorMessage = 'Failed to connect wallet'
    
    if (error.code === -32001) {
      errorMessage = 'User canceled wallet connection'
    } else if (error.code === -32002) {
      errorMessage = 'Wallet connection request pending'
    }
    
    emit('error', {
      type: 'CONNECTION_ERROR',
      message: errorMessage,
      error
    })
    
    showToast(errorMessage)
  } finally {
    isConnecting.value = false
  }
}

// Disconnect wallet
const disconnectWallet = async () => {
  try {
    isDisconnecting.value = true
    
    if (walletProvider.value && walletProvider.value.disconnectWallet) {
      await walletProvider.value.disconnectWallet()
    }
    
    handleDisconnection()
    showToast('Wallet disconnected')
    
  } catch (error) {
    console.error('❌ Failed to disconnect wallet:', error)
    showToast('Failed to disconnect wallet')
  } finally {
    isDisconnecting.value = false
  }
}

// Handle disconnection
const handleDisconnection = () => {
  isConnected.value = false
  account.value = ''
  balance.value = '0'
  
  emit('disconnected')
}

// Update balance
const updateBalance = async () => {
  if (!walletProvider.value || !account.value) return
  
  try {
    // Try kaia_getBalance first, then fall back to eth_getBalance
    let balanceWei
    try {
      balanceWei = await walletProvider.value.request({
        method: 'kaia_getBalance',
        params: [account.value, 'latest']
      })
    } catch (kaiaError) {
      console.warn('kaia_getBalance failed, using eth_getBalance:', kaiaError)
      balanceWei = await walletProvider.value.request({
        method: 'eth_getBalance',
        params: [account.value, 'latest']
      })
    }
    
    // Convert from wei to KAIA using ethers.js
    const balanceKaia = ethers.formatEther(balanceWei)
    balance.value = parseFloat(balanceKaia).toFixed(4)
    
    console.log('💰 Balance updated:', {
      raw: balanceWei,
      formatted: balance.value,
      account: account.value
    })
    
  } catch (error) {
    console.error('Failed to update balance:', error)
    balance.value = '0'
  }
}

// Update network info
const updateNetworkInfo = async () => {
  try {
    if (!walletProvider.value) {
      // Fallback to props chainId if no provider
      switch (props.chainId) {
        case '8217':
          networkName.value = 'Kaia Mainnet (Cypress)'
          break
        case '1001':
          networkName.value = 'Kaia Testnet (Kairos)'
          break
        default:
          networkName.value = `Chain ${props.chainId}`
      }
      return
    }
    
    // Try to get current chain ID from provider
    let currentChainId
    try {
      currentChainId = await walletProvider.value.request({
        method: 'kaia_chainId'
      })
    } catch (kaiaError) {
      console.warn('kaia_chainId failed, using eth_chainId:', kaiaError)
      currentChainId = await walletProvider.value.request({
        method: 'eth_chainId'
      })
    }
    
    // Set network name based on chain ID
    const chainIdNum = parseInt(currentChainId, 16)
    switch (chainIdNum) {
      case 1001:
        networkName.value = 'Kaia Testnet (Kairos)'
        break
      case 8217:
        networkName.value = 'Kaia Mainnet (Cypress)'
        break
      case 1:
        networkName.value = 'Ethereum Mainnet'
        break
      default:
        networkName.value = `Chain ${chainIdNum}`
    }
    
    console.log('📡 Network info updated:', {
      chainId: currentChainId,
      networkName: networkName.value,
      chainIdNum
    })
    
  } catch (error) {
    console.error('❌ Failed to get network info:', error)
    // Fallback to props chainId
    switch (props.chainId) {
      case '8217':
        networkName.value = 'Kaia Mainnet (Cypress)'
        break
      case '1001':
        networkName.value = 'Kaia Testnet (Kairos)'
        break
      default:
        networkName.value = `Chain ${props.chainId}`
    }
  }
}

// Copy address to clipboard
const copyAddress = async () => {
  try {
    await navigator.clipboard.writeText(account.value)
    showToast('Address copied to clipboard')
  } catch (error) {
    console.error('Failed to copy address:', error)
    showToast('Failed to copy address')
  }
}

// Auto connect on mount
watch(() => props.autoConnect, (shouldAutoConnect) => {
  if (shouldAutoConnect && sdkInitialized.value && !isConnected.value) {
    connectWallet()
  }
})

// Initialize on mount
onMounted(async () => {
  await initializeSDK()
  
  if (props.autoConnect) {
    await connectWallet()
  }
})

// Update network info on chain ID change
watch(() => props.chainId, () => {
  updateNetworkInfo()
})

// Initialize mock wallet for development
const initializeMockWallet = () => {
  console.log('🎭 Initializing mock wallet...')
  
  // Mock wallet provider
  walletProvider.value = {
    request: async ({ method, params }) => {
      console.log('🎭 Mock provider called:', method, params)
      switch (method) {
        case 'kaia_accounts':
        case 'eth_accounts':
          return ['0x742d35Cc6634C0532925a3b8D4e6D3b6e8d3e8A0']
        case 'kaia_requestAccounts':
        case 'eth_requestAccounts':
          return ['0x742d35Cc6634C0532925a3b8D4e6D3b6e8d3e8A0']
        case 'kaia_getBalance':
        case 'eth_getBalance':
          return '1000000000000000000' // 1 KAIA
        case 'kaia_chainId':
        case 'eth_chainId':
          return '0x3e9' // 1001 in hex
        case 'kaia_sendTransaction':
          return '0xmock_transaction_hash'
        case 'personal_sign':
          return '0xmock_signature'
        default:
          throw new Error(`Mock provider: method ${method} not implemented`)
      }
    },
    on: (event, callback) => {
      console.log('🎭 Mock provider event listener added:', event)
    },
    getWalletType: () => 'Mock',
    disconnectWallet: async () => {
      console.log('🎭 Mock wallet disconnected')
    }
  }
  
  // Set mock values
  walletType.value = 'Mock'
  sdkInitialized.value = true
  
  // Auto-connect mock wallet
  account.value = '0x742d35Cc6634C0532925a3b8D4e6D3b6e8d3e8A0'
  balance.value = '1.0000'
  networkName.value = 'Kaia Testnet (Kairos)'
  isConnected.value = true
  
  console.log('✅ Mock wallet initialized and connected')
}

// Expose methods and state for parent components
defineExpose({
  connectWallet,
  disconnectWallet,
  getAccount: () => account.value,
  getBalance: () => balance.value,
  isConnected: () => isConnected.value,
  getWalletProvider: () => walletProvider.value,
  sdkInitialized: () => sdkInitialized.value,
  sendTransaction: async (transaction) => {
    if (!walletProvider.value) throw new Error('Wallet not connected')
    return await walletProvider.value.request({
      method: 'kaia_sendTransaction',
      params: [transaction]
    })
  },
  signMessage: async (message) => {
    if (!walletProvider.value) throw new Error('Wallet not connected')
    return await walletProvider.value.request({
      method: 'personal_sign',
      params: [message, account.value]
    })
  }
})
</script>

<style scoped>
.mini-dapp-wallet-connector {
  padding: 1rem;
}

.wallet-card {
  margin-bottom: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.wallet-actions {
  margin-top: 0.5rem;
}

.connected-actions {
  display: flex;
  gap: 0.5rem;
}

.connected-actions .van-button {
  flex: 1;
}

.network-info {
  margin-bottom: 1rem;
  border-radius: 8px;
  overflow: hidden;
}

.debug-info {
  margin-top: 1rem;
  border: 1px solid #eee;
  border-radius: 8px;
}

.debug-content {
  padding: 1rem;
  font-family: monospace;
  font-size: 0.8rem;
  background-color: #f8f9fa;
}

.debug-content p {
  margin: 0.25rem 0;
  word-break: break-all;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .mini-dapp-wallet-connector {
    padding: 0.5rem;
  }
  
  .connected-actions {
    flex-direction: column;
  }
  
  .connected-actions .van-button {
    margin-bottom: 0.5rem;
  }
}
</style>