<template>
  <div class="lending">
    <!-- Header Section -->
    <div class="header-section">
      <div class="lending-stats">
        <div class="stat-item">
          <h3>${{ totalCollateralUSD }}</h3>
          <p>Collateral Value</p>
        </div>
        <div class="stat-item">
          <h3>${{ totalBorrowedUSD }}</h3>
          <p>Total Borrowed</p>
        </div>
        <div class="stat-item">
          <h3>{{ healthRatio }}%</h3>
          <p>Health Ratio</p>
        </div>
      </div>
    </div>

    <!-- Collateral Overview -->
    <div class="collateral-section">
      <van-card class="collateral-card">
        <template #title>
          <div class="card-title">
            <van-icon name="shield-o" />
            <span>Available Collateral</span>
          </div>
        </template>
        
        <div class="collateral-content">
          <div class="collateral-display">
            <h2>{{ formatBalance(availableCollateral) }} USDT</h2>
            <p class="collateral-value">${{ formatBalance(availableCollateral) }}</p>
          </div>
          
          <div class="collateral-ratio">
            <van-circle
              :rate="collateralUtilization"
              :speed="100"
              :stroke-width="60"
              color="#1989fa"
              size="80"
            >
              {{ collateralUtilization }}%
            </van-circle>
            <p class="ratio-label">Utilization</p>
          </div>
        </div>
        
        <van-notice-bar
          left-icon="info-o"
          text="Collateral is based on your staked USDT. Go to Staking to increase your collateral."
          color="#1989fa"
          background="#e8f4ff"
        />
      </van-card>
    </div>

    <!-- Borrowing Form -->
    <div class="borrowing-section">
      <van-card class="borrowing-card">
        <template #title>
          <div class="card-title">
            <van-icon name="credit-pay" />
            <span>Borrow KAIA</span>
          </div>
        </template>
        
        <van-form @submit="handleBorrow">
          <!-- Loan Amount -->
          <van-field
            v-model="borrowAmount"
            name="amount"
            label="Amount"
            placeholder="Enter KAIA amount"
            type="number"
            :rules="[{ required: true, message: 'Please enter amount' }]"
          >
            <template #suffix>
              <span class="currency">KAIA</span>
            </template>
            <template #button>
              <van-button 
                size="small" 
                type="default"
                @click="setMaxBorrow"
              >
                MAX
              </van-button>
            </template>
          </van-field>
          
          <!-- Quick Amount Buttons -->
          <div class="amount-buttons">
            <van-button 
              v-for="amount in quickBorrowAmounts" 
              :key="amount"
              size="small"
              type="default"
              @click="setQuickBorrow(amount)"
              :disabled="amount > maxBorrowAmount"
            >
              {{ amount }} KAIA
            </van-button>
          </div>
          
          <!-- Loan Term Selection -->
          <van-field 
            v-model="selectedTerm"
            is-link
            readonly
            name="term"
            label="Loan Term"
            placeholder="Select loan term"
            @click="showTermPicker = true"
          />
          
          <!-- Loan Summary -->
          <div class="loan-summary" v-if="borrowAmount && selectedTerm">
            <van-divider>Loan Summary</van-divider>
            
            <div class="summary-grid">
              <div class="summary-item">
                <span class="label">Loan Amount:</span>
                <span class="value">{{ borrowAmount }} KAIA</span>
              </div>
              <div class="summary-item">
                <span class="label">Loan Term:</span>
                <span class="value">{{ getTermDisplay(selectedTerm) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">Daily Interest:</span>
                <span class="value">{{ getDailyRate(selectedTerm) }}%</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Interest:</span>
                <span class="value">{{ calculateTotalInterest() }} KAIA</span>
              </div>
              <div class="summary-item">
                <span class="label">Total Repayment:</span>
                <span class="value total">{{ calculateTotalRepayment() }} KAIA</span>
              </div>
              <div class="summary-item">
                <span class="label">Due Date:</span>
                <span class="value">{{ formatDueDate() }}</span>
              </div>
            </div>
            
            <div class="collateral-info">
              <van-divider>Collateral Required</van-divider>
              <div class="collateral-required">
                <span class="amount">{{ calculateRequiredCollateral() }} USDT</span>
                <span class="ratio">(70% LTV)</span>
              </div>
            </div>
          </div>
          
          <div class="form-actions">
            <van-button 
              type="primary"
              size="large"
              block
              native-type="submit"
              :disabled="!canBorrow"
              :loading="borrowing"
            >
              {{ borrowing ? 'Processing...' : 'Borrow KAIA' }}
            </van-button>
          </div>
        </van-form>
      </van-card>
    </div>

    <!-- Active Loans -->
    <div class="loans-section" v-if="activeLoans.length > 0">
      <h3 class="section-title">Your Active Loans</h3>
      
      <van-card 
        v-for="(loan, index) in activeLoans" 
        :key="index"
        class="loan-card"
        :class="{ 'overdue': isOverdue(loan), 'warning': isNearDue(loan) }"
      >
        <template #title>
          <div class="loan-title">
            <span>Loan #{{ index + 1 }}</span>
            <van-tag 
              :type="getLoanStatusType(loan)"
              size="small"
            >
              {{ getLoanStatus(loan) }}
            </van-tag>
          </div>
        </template>
        
        <div class="loan-details">
          <div class="loan-stat">
            <span class="label">Borrowed Amount:</span>
            <span class="value">{{ formatBalance(loan.kaiaAmount, 18) }} KAIA</span>
          </div>
          <div class="loan-stat">
            <span class="label">Collateral:</span>
            <span class="value">{{ formatBalance(loan.collateralAmount, 6) }} USDT</span>
          </div>
          <div class="loan-stat">
            <span class="label">Interest Rate:</span>
            <span class="value">{{ (loan.interestRate / 100).toFixed(3) }}% daily</span>
          </div>
          <div class="loan-stat">
            <span class="label">Due Date:</span>
            <span class="value" :class="{ 'overdue': isOverdue(loan), 'warning': isNearDue(loan) }">
              {{ formatDate(loan.dueTime) }}
            </span>
          </div>
          <div class="loan-stat">
            <span class="label">Current Interest:</span>
            <span class="value interest">{{ calculateCurrentInterest(loan) }} KAIA</span>
          </div>
          <div class="loan-stat">
            <span class="label">Total Due:</span>
            <span class="value total">{{ calculateTotalDue(loan) }} KAIA</span>
          </div>
        </div>
        
        <div class="loan-progress">
          <van-progress 
            :percentage="getLoanProgress(loan)"
            :color="getLoanProgressColor(loan)"
            show-pivot
            :pivot-text="`${Math.floor((loan.dueTime - Date.now()) / 86400000)} days left`"
          />
        </div>
        
        <div class="loan-actions">
          <van-button 
            size="small"
            type="primary"
            @click="repayLoan(index)"
            :loading="repaying === index"
          >
            Repay Loan
          </van-button>
          <van-button 
            size="small"
            type="default"
            @click="showLoanDetails(loan)"
          >
            Details
          </van-button>
        </div>
      </van-card>
    </div>

    <!-- Empty State -->
    <div class="empty-state" v-if="activeLoans.length === 0">
      <van-empty description="No active loans">
        <template #image>
          <van-icon name="credit-pay" size="100" color="#dcdee0" />
        </template>
        <template #default>
          <p>You don't have any active loans. Borrow KAIA using your staked USDT as collateral.</p>
        </template>
      </van-empty>
    </div>

    <!-- Loan History -->
    <div class="history-section">
      <van-button 
        block
        type="default"
        @click="showHistory = !showHistory"
      >
        {{ showHistory ? 'Hide' : 'Show' }} Loan History
      </van-button>
      
      <van-collapse-item v-if="showHistory" class="history-content">
        <div class="history-list">
          <van-cell 
            v-for="(loan, index) in loanHistory" 
            :key="index"
            :title="`Loan #${index + 1}`"
            :value="`${formatBalance(loan.kaiaAmount, 18)} KAIA`"
            :label="`${formatDate(loan.borrowTime)} - ${loan.isRepaid ? 'Repaid' : 'Liquidated'}`"
          >
            <template #icon>
              <van-icon 
                :name="loan.isRepaid ? 'checked' : 'cross'"
                :color="loan.isRepaid ? '#07c160' : '#ee0a24'"
                size="20"
              />
            </template>
          </van-cell>
        </div>
      </van-collapse-item>
    </div>

    <!-- Term Picker Popup -->
    <van-popup v-model:show="showTermPicker" position="bottom">
      <van-picker
        :columns="termColumns"
        @confirm="onTermConfirm"
        @cancel="showTermPicker = false"
      />
    </van-popup>

    <!-- Loan Details Popup -->
    <van-popup 
      v-model:show="showLoanDetailsPopup" 
      position="bottom"
      :style="{ height: '60%' }"
    >
      <div class="loan-details-popup" v-if="selectedLoanDetails">
        <div class="popup-header">
          <h3>Loan Details</h3>
          <van-button 
            type="default" 
            size="small"
            @click="showLoanDetailsPopup = false"
          >
            Close
          </van-button>
        </div>
        
        <div class="details-content">
          <!-- Detailed loan information would go here -->
          <van-cell-group>
            <van-cell title="Loan Amount" :value="`${formatBalance(selectedLoanDetails.kaiaAmount, 18)} KAIA`" />
            <van-cell title="Collateral" :value="`${formatBalance(selectedLoanDetails.collateralAmount, 6)} USDT`" />
            <van-cell title="Borrow Date" :value="formatDate(selectedLoanDetails.borrowTime)" />
            <van-cell title="Due Date" :value="formatDate(selectedLoanDetails.dueTime)" />
            <van-cell title="Interest Rate" :value="`${(selectedLoanDetails.interestRate / 100).toFixed(3)}% daily`" />
            <van-cell title="Total Due" :value="`${calculateTotalDue(selectedLoanDetails)} KAIA`" />
          </van-cell-group>
        </div>
      </div>
    </van-popup>

    <!-- Pull to Refresh -->
    <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
      <div class="refresh-placeholder"></div>
    </van-pull-refresh>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { ethers } from 'ethers'
import { showToast, showDialog, showConfirmDialog } from 'vant'

// Props
const props = defineProps({
  liff: Object,
  user: Object,
  isLoggedIn: Boolean,
  walletConnector: Object
})

// Emits
const emit = defineEmits(['update-title'])

// Reactive state
const refreshing = ref(false)
const borrowing = ref(false)
const repaying = ref(null)
const showTermPicker = ref(false)
const showHistory = ref(false)
const showLoanDetailsPopup = ref(false)

// Form data
const borrowAmount = ref('')
const selectedTerm = ref('')
const selectedLoanDetails = ref(null)

// Data
const stakedAmount = ref('0')
const availableCollateral = ref('0')
const activeLoans = ref([])
const loanHistory = ref([])

// Constants
const COLLATERAL_RATIO = 0.7 // 70%
const KAIA_PRICE = 0.15 // $0.15 per KAIA (mock price)
const quickBorrowAmounts = [10, 25, 50, 100]

// Term options
const termColumns = [
  {
    text: '7 Days (0.022% daily)',
    value: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    rate: 0.022
  },
  {
    text: '14 Days (0.024% daily)',
    value: 14 * 24 * 60 * 60 * 1000,
    rate: 0.024
  },
  {
    text: '30 Days (0.027% daily)',
    value: 30 * 24 * 60 * 60 * 1000,
    rate: 0.027
  }
]

// Mock data (in production, this would come from contracts)
const mockStakedAmount = ethers.parseUnits('500', 6) // 500 USDT staked
const mockActiveLoans = [
  {
    kaiaAmount: ethers.parseEther('100'),
    collateralAmount: ethers.parseUnits('200', 6),
    interestRate: 22, // 0.022% in basis points * 100
    borrowTime: Date.now() - 86400000 * 3, // 3 days ago
    dueTime: Date.now() + 86400000 * 4, // 4 days from now
    term: 7 * 24 * 60 * 60 * 1000,
    isActive: true
  },
  {
    kaiaAmount: ethers.parseEther('50'),
    collateralAmount: ethers.parseUnits('100', 6),
    interestRate: 24,
    borrowTime: Date.now() - 86400000 * 10, // 10 days ago
    dueTime: Date.now() + 86400000 * 4, // 4 days from now
    term: 14 * 24 * 60 * 60 * 1000,
    isActive: true
  }
]

const mockLoanHistory = [
  {
    kaiaAmount: ethers.parseEther('75'),
    borrowTime: Date.now() - 86400000 * 30,
    isRepaid: true
  },
  {
    kaiaAmount: ethers.parseEther('120'),
    borrowTime: Date.now() - 86400000 * 60,
    isRepaid: false // Liquidated
  }
]

// Computed values
const totalCollateralUSD = computed(() => {
  const collateralUsed = activeLoans.value.reduce((sum, loan) => {
    return sum + parseFloat(formatBalance(loan.collateralAmount, 6))
  }, 0)
  return (parseFloat(formatBalance(stakedAmount.value, 6)) + collateralUsed).toFixed(2)
})

const totalBorrowedUSD = computed(() => {
  const borrowed = activeLoans.value.reduce((sum, loan) => {
    return sum + parseFloat(formatBalance(loan.kaiaAmount, 18)) * KAIA_PRICE
  }, 0)
  return borrowed.toFixed(2)
})

const healthRatio = computed(() => {
  if (activeLoans.value.length === 0) return '100'
  
  const totalCollateral = parseFloat(totalCollateralUSD.value)
  const totalBorrowed = parseFloat(totalBorrowedUSD.value)
  
  if (totalBorrowed === 0) return '100'
  
  const ratio = (totalCollateral / totalBorrowed) * 100
  return Math.min(ratio, 999).toFixed(0)
})

const collateralUtilization = computed(() => {
  const available = parseFloat(formatBalance(availableCollateral.value, 6))
  const total = parseFloat(formatBalance(stakedAmount.value, 6))
  
  if (total === 0) return 0
  
  const used = total - available
  return Math.round((used / total) * 100)
})

const maxBorrowAmount = computed(() => {
  const availableUSD = parseFloat(formatBalance(availableCollateral.value, 6))
  const maxKaia = (availableUSD * COLLATERAL_RATIO) / KAIA_PRICE
  return Math.floor(maxKaia)
})

const canBorrow = computed(() => {
  return borrowAmount.value && 
         parseFloat(borrowAmount.value) >= 1 && 
         parseFloat(borrowAmount.value) <= maxBorrowAmount.value &&
         selectedTerm.value
})

// Methods
const formatBalance = (balance, decimals = 6) => {
  if (!balance || balance === '0') return '0.00'
  
  try {
    const formatted = ethers.formatUnits(balance.toString(), decimals)
    const num = parseFloat(formatted)
    
    if (num < 0.01) return '< 0.01'
    return num.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  } catch (error) {
    return '0.00'
  }
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDueDate = () => {
  if (!selectedTerm.value) return ''
  const dueDate = new Date(Date.now() + parseInt(selectedTerm.value))
  return formatDate(dueDate)
}

const getTermDisplay = (termValue) => {
  const term = termColumns.find(t => t.value.toString() === termValue.toString())
  return term ? term.text.split(' (')[0] : 'Unknown'
}

const getDailyRate = (termValue) => {
  const term = termColumns.find(t => t.value.toString() === termValue.toString())
  return term ? term.rate.toFixed(3) : '0.000'
}

const calculateTotalInterest = () => {
  if (!borrowAmount.value || !selectedTerm.value) return '0.00'
  
  const amount = parseFloat(borrowAmount.value)
  const days = parseInt(selectedTerm.value) / (24 * 60 * 60 * 1000)
  const term = termColumns.find(t => t.value.toString() === selectedTerm.value.toString())
  
  if (!term) return '0.00'
  
  const totalInterest = amount * (term.rate / 100) * days
  return totalInterest.toFixed(2)
}

const calculateTotalRepayment = () => {
  if (!borrowAmount.value) return '0.00'
  
  const principal = parseFloat(borrowAmount.value)
  const interest = parseFloat(calculateTotalInterest())
  return (principal + interest).toFixed(2)
}

const calculateRequiredCollateral = () => {
  if (!borrowAmount.value) return '0.00'
  
  const kaiaAmount = parseFloat(borrowAmount.value)
  const usdValue = kaiaAmount * KAIA_PRICE
  const requiredCollateral = usdValue / COLLATERAL_RATIO
  return requiredCollateral.toFixed(2)
}

const calculateCurrentInterest = (loan) => {
  const daysPassed = (Date.now() - loan.borrowTime) / (24 * 60 * 60 * 1000)
  const kaiaAmount = parseFloat(formatBalance(loan.kaiaAmount, 18))
  const dailyRate = loan.interestRate / 10000 // Convert basis points to decimal
  
  const interest = kaiaAmount * dailyRate * daysPassed
  return interest.toFixed(4)
}

const calculateTotalDue = (loan) => {
  const principal = parseFloat(formatBalance(loan.kaiaAmount, 18))
  const interest = parseFloat(calculateCurrentInterest(loan))
  return (principal + interest).toFixed(4)
}

const isOverdue = (loan) => {
  return Date.now() > loan.dueTime
}

const isNearDue = (loan) => {
  const daysLeft = (loan.dueTime - Date.now()) / (24 * 60 * 60 * 1000)
  return daysLeft <= 2 && daysLeft > 0
}

const getLoanProgress = (loan) => {
  const totalDuration = loan.dueTime - loan.borrowTime
  const elapsed = Date.now() - loan.borrowTime
  return Math.min((elapsed / totalDuration) * 100, 100)
}

const getLoanProgressColor = (loan) => {
  if (isOverdue(loan)) return '#ee0a24'
  if (isNearDue(loan)) return '#ff976a'
  return '#1989fa'
}

const getLoanStatus = (loan) => {
  if (isOverdue(loan)) return 'Overdue'
  if (isNearDue(loan)) return 'Due Soon'
  return 'Active'
}

const getLoanStatusType = (loan) => {
  if (isOverdue(loan)) return 'danger'
  if (isNearDue(loan)) return 'warning'
  return 'success'
}

const setMaxBorrow = () => {
  borrowAmount.value = maxBorrowAmount.value.toString()
}

const setQuickBorrow = (amount) => {
  if (amount <= maxBorrowAmount.value) {
    borrowAmount.value = amount.toString()
  }
}

const onTermConfirm = ({ selectedValues }) => {
  selectedTerm.value = selectedValues[0]
  showTermPicker.value = false
}

const showLoanDetails = (loan) => {
  selectedLoanDetails.value = loan
  showLoanDetailsPopup.value = true
}

const loadData = async () => {
  try {
    // Load staked amount (collateral)
    stakedAmount.value = mockStakedAmount
    
    // Load active loans
    activeLoans.value = mockActiveLoans
    
    // Load loan history
    loanHistory.value = mockLoanHistory
    
    // Calculate available collateral
    const usedCollateral = activeLoans.value.reduce((sum, loan) => {
      return sum + loan.collateralAmount
    }, BigInt(0))
    
    availableCollateral.value = (BigInt(stakedAmount.value) - usedCollateral).toString()
    
  } catch (error) {
    console.error('Failed to load lending data:', error)
    showToast('Failed to load data')
  }
}

const handleRefresh = async () => {
  await loadData()
  refreshing.value = false
  showToast('Data refreshed')
}

const handleBorrow = async () => {
  try {
    borrowing.value = true
    
    if (!canBorrow.value) {
      showToast('Please check your input')
      return
    }
    
    // Confirm borrow
    await showConfirmDialog({
      title: 'Confirm Borrowing',
      message: `Borrow ${borrowAmount.value} KAIA for ${getTermDisplay(selectedTerm.value)}?\n\nTotal repayment: ${calculateTotalRepayment()} KAIA`,
    })
    
    // In production, this would call the smart contract
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add to active loans (mock)
    const termData = termColumns.find(t => t.value.toString() === selectedTerm.value.toString())
    const newLoan = {
      kaiaAmount: ethers.parseEther(borrowAmount.value),
      collateralAmount: ethers.parseUnits(calculateRequiredCollateral(), 6),
      interestRate: termData.rate * 100, // Convert to basis points * 100
      borrowTime: Date.now(),
      dueTime: Date.now() + parseInt(selectedTerm.value),
      term: parseInt(selectedTerm.value),
      isActive: true
    }
    
    activeLoans.value.push(newLoan)
    
    // Update available collateral
    const currentAvailable = BigInt(availableCollateral.value)
    const usedCollateral = BigInt(newLoan.collateralAmount)
    availableCollateral.value = (currentAvailable - usedCollateral).toString()
    
    // Reset form
    borrowAmount.value = ''
    selectedTerm.value = ''
    
    showToast('Loan successful!')
    
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('Borrowing failed:', error)
      showToast('Borrowing failed. Please try again.')
    }
  } finally {
    borrowing.value = false
  }
}

const repayLoan = async (loanIndex) => {
  try {
    repaying.value = loanIndex
    
    const loan = activeLoans.value[loanIndex]
    const totalDue = calculateTotalDue(loan)
    
    await showConfirmDialog({
      title: 'Confirm Repayment',
      message: `Repay ${totalDue} KAIA to close this loan?`,
    })
    
    // In production, this would call the smart contract
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add to history
    loanHistory.value.unshift({
      kaiaAmount: loan.kaiaAmount,
      borrowTime: loan.borrowTime,
      isRepaid: true
    })
    
    // Release collateral
    const currentAvailable = BigInt(availableCollateral.value)
    const releasedCollateral = BigInt(loan.collateralAmount)
    availableCollateral.value = (currentAvailable + releasedCollateral).toString()
    
    // Remove from active loans
    activeLoans.value.splice(loanIndex, 1)
    
    showToast('Loan repaid successfully!')
    
  } catch (error) {
    if (error.message !== 'cancel') {
      console.error('Repayment failed:', error)
      showToast('Repayment failed. Please try again.')
    }
  } finally {
    repaying.value = null
  }
}

// Lifecycle
onMounted(() => {
  emit('update-title', 'Lending')
  loadData()
})

// Watch for wallet connection changes
watch(() => props.walletConnector?.isConnected, (isConnected) => {
  if (isConnected) {
    loadData()
  }
})
</script>

<style scoped>
.lending {
  padding: 1rem;
  min-height: 100vh;
  background: #f7f8fa;
}

/* Header Section */
.header-section {
  margin-bottom: 1.5rem;
}

.lending-stats {
  display: flex;
  background: linear-gradient(135deg, #2196f3 0%, #21cbf3 100%);
  border-radius: 16px;
  padding: 1.5rem;
  color: white;
  box-shadow: 0 4px 20px rgba(33, 150, 243, 0.3);
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-item h3 {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
}

.stat-item p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Collateral Section */
.collateral-section {
  margin-bottom: 1.5rem;
}

.collateral-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.collateral-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 0;
}

.collateral-display h2 {
  margin: 0 0 0.25rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: #323233;
}

.collateral-value {
  margin: 0;
  color: #969799;
  font-size: 0.9rem;
}

.collateral-ratio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.ratio-label {
  margin: 0;
  font-size: 0.8rem;
  color: #646566;
  text-align: center;
}

/* Borrowing Section */
.borrowing-section {
  margin-bottom: 1.5rem;
}

.borrowing-card {
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.currency {
  color: #969799;
  font-size: 0.9rem;
}

.amount-buttons {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
  flex-wrap: wrap;
}

.amount-buttons .van-button {
  flex: 1;
  min-width: 80px;
}

.amount-buttons .van-button:disabled {
  opacity: 0.5;
}

/* Loan Summary */
.loan-summary {
  margin: 1.5rem 0;
}

.summary-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-item .label {
  color: #646566;
  font-size: 0.9rem;
}

.summary-item .value {
  font-weight: 600;
  color: #323233;
}

.summary-item .value.total {
  color: #2196f3;
  font-size: 1.1rem;
}

.collateral-info {
  margin-top: 1rem;
}

.collateral-required {
  text-align: center;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 12px;
  border: 1px solid #2196f3;
}

.collateral-required .amount {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2196f3;
  margin-right: 0.5rem;
}

.collateral-required .ratio {
  color: #646566;
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 1.5rem;
}

/* Loans Section */
.loans-section {
  margin-bottom: 1.5rem;
}

.section-title {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #323233;
}

.loan-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 0.75rem;
  border-left: 4px solid #1989fa;
}

.loan-card.warning {
  border-left-color: #ff976a;
  background: linear-gradient(135deg, #fff8f0 0%, #ffeaa7 5%);
}

.loan-card.overdue {
  border-left-color: #ee0a24;
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 5%);
}

.loan-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
}

.loan-details {
  margin: 1rem 0;
}

.loan-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.loan-stat:last-child {
  margin-bottom: 0;
}

.loan-stat .label {
  color: #646566;
  font-size: 0.9rem;
}

.loan-stat .value {
  font-weight: 600;
  color: #323233;
}

.loan-stat .value.interest {
  color: #ff976a;
}

.loan-stat .value.total {
  color: #2196f3;
  font-size: 1.05rem;
}

.loan-stat .value.overdue {
  color: #ee0a24;
  font-weight: 700;
}

.loan-stat .value.warning {
  color: #ff976a;
  font-weight: 700;
}

.loan-progress {
  margin: 1rem 0;
}

.loan-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
}

.loan-actions .van-button {
  flex: 1;
}

/* Empty State */
.empty-state {
  margin: 2rem 0;
  text-align: center;
}

.empty-state p {
  color: #646566;
  line-height: 1.5;
  margin-top: 1rem;
}

/* History Section */
.history-section {
  margin-bottom: 1.5rem;
}

.history-content {
  margin-top: 1rem;
}

.history-list {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Loan Details Popup */
.loan-details-popup {
  padding: 1rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ebedf0;
  margin-bottom: 1rem;
}

.popup-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #323233;
}

.details-content {
  flex: 1;
  overflow-y: auto;
}

.refresh-placeholder {
  height: 1px;
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .lending {
    padding: 0.75rem;
  }
  
  .lending-stats {
    padding: 1.25rem;
  }
  
  .stat-item h3 {
    font-size: 1.1rem;
  }
  
  .collateral-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .collateral-ratio {
    align-self: center;
  }
  
  .amount-buttons .van-button {
    min-width: 70px;
  }
  
  .summary-grid {
    gap: 0.5rem;
  }
  
  .loan-actions {
    flex-direction: column;
  }
}

@media (max-width: 375px) {
  .lending {
    padding: 0.5rem;
  }
  
  .lending-stats {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .stat-item h3 {
    font-size: 1rem;
  }
  
  .collateral-display h2 {
    font-size: 1.3rem;
  }
  
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .collateral-required {
    background: #1a1a2e;
    border-color: #2196f3;
  }
  
  .loan-card.warning {
    background: linear-gradient(135deg, #2d2318 0%, #3d2f1a 5%);
  }
  
  .loan-card.overdue {
    background: linear-gradient(135deg, #2d1818 0%, #3d1a1a 5%);
  }
  
  .loan-stat .label,
  .summary-item .label {
    color: #a8a8a8;
  }
}

/* Animation for loan cards */
.loan-card {
  transition: all 0.3s ease;
}

.loan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

/* Progress bar custom styling */
.van-progress {
  margin: 0.5rem 0;
}

/* Custom picker styling */
.van-picker {
  background: white;
}

/* Notice bar custom styling */
.van-notice-bar {
  margin-top: 1rem;
  border-radius: 8px;
}
</style>