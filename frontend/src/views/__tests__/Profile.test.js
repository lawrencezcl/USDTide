import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Profile from '../Profile.vue'
import { formatBalance, truncateAddress, formatDate } from '@/utils/helpers'

// Mock the Vant components
vi.mock('vant', () => ({
  showToast: vi.fn(),
  showDialog: vi.fn()
}))

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('Profile.vue', () => {
  const mockUser = {
    displayName: 'Test User',
    pictureUrl: 'https://example.com/avatar.jpg',
    statusMessage: 'LINE User'
  }

  const mockWalletConnector = {
    isConnected: true,
    getUsdtBalance: vi.fn().mockResolvedValue('1000000000'),
    getKaiaBalance: vi.fn().mockResolvedValue('5000000000000000000'),
    getStakingData: vi.fn().mockResolvedValue({
      totalStaked: '500000000',
      pendingRewards: '25000000'
    }),
    getLendingData: vi.fn().mockResolvedValue({
      totalBorrowed: '1000000000000000000',
      pendingInterest: '50000000000000000'
    })
  }

  const mockTransactions = [
    {
      id: 1,
      title: 'Stake USDT',
      type: 'stake',
      category: 'staking',
      amount: '100',
      status: 'Confirmed',
      timestamp: new Date(Date.now() - 86400000),
      hash: '0x1234...5678',
      network: 'Kaia Testnet',
      gasFee: '0.001'
    },
    {
      id: 2,
      title: 'Claim Rewards',
      type: 'reward',
      category: 'rewards',
      amount: '2.5',
      status: 'Confirmed',
      timestamp: new Date(Date.now() - 172800000),
      hash: '0x2345...6789',
      network: 'Kaia Testnet',
      gasFee: '0.001'
    }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = mount(Profile, {
      props: {
        user: mockUser,
        walletConnector: mockWalletConnector
      },
      global: {
        mocks: {
          $t: (msg) => msg
        }
      }
    })
  })

  it('renders user profile information', () => {
    expect(wrapper.find('.user-details h2').text()).toBe('Test User')
    expect(wrapper.find('.user-details p').text()).toBe('LINE User')
  })

  it('displays correct portfolio value', async () => {
    await wrapper.vm.$nextTick()
    const portfolioValue = wrapper.find('.stat-item h3').text()
    expect(portfolioValue).toContain('$')
  })

  it('loads user data correctly', async () => {
    await wrapper.vm.loadUserData()
    
    expect(mockWalletConnector.getUsdtBalance).toHaveBeenCalled()
    expect(mockWalletConnector.getKaiaBalance).toHaveBeenCalled()
    expect(mockWalletConnector.getStakingData).toHaveBeenCalled()
    expect(mockWalletConnector.getLendingData).toHaveBeenCalled()
  })

  it('formats transaction values correctly', () => {
    const stakeTransaction = mockTransactions[0]
    const rewardTransaction = mockTransactions[1]
    
    const stakeValue = wrapper.vm.formatTransactionValue(stakeTransaction)
    const rewardValue = wrapper.vm.formatTransactionValue(rewardTransaction)
    
    expect(stakeValue).toBe('-100 USDT')
    expect(rewardValue).toBe('+2.5 USDT')
  })

  it('gets correct transaction icons', () => {
    expect(wrapper.vm.getTransactionIcon('stake')).toBe('gold-coin-o')
    expect(wrapper.vm.getTransactionIcon('reward')).toBe('award-o')
    expect(wrapper.vm.getTransactionIcon('borrow')).toBe('credit-pay')
    expect(wrapper.vm.getTransactionIcon('unknown')).toBe('records')
  })

  it('truncates addresses correctly', () => {
    const address = '0x1234567890123456789012345678901234567890'
    const truncated = truncateAddress(address)
    expect(truncated).toBe('0x1234...7890')
  })

  it('formats dates correctly', () => {
    const date = new Date('2023-01-01T12:00:00Z')
    const formatted = formatDate(date)
    expect(formatted).toBe('Jan 1, 2023')
  })

  it('calculates total portfolio value correctly', async () => {
    await wrapper.vm.loadUserData()
    await wrapper.vm.$nextTick()
    
    const totalValue = parseFloat(wrapper.vm.totalPortfolioValue)
    expect(totalValue).toBeGreaterThanOrEqual(0)
  })

  it('filters transactions by category', async () => {
    wrapper.vm.transactions = mockTransactions
    wrapper.vm.activeTab = 'staking'
    
    const filtered = wrapper.vm.filteredTransactions
    expect(filtered.length).toBe(1)
    expect(filtered[0].category).toBe('staking')
  })

  it('navigates to correct routes', () => {
    const router = wrapper.vm.$router
    wrapper.vm.goToStaking()
    expect(router.push).toHaveBeenCalledWith('/staking')
    
    wrapper.vm.goToLending()
    expect(router.push).toHaveBeenCalledWith('/lending')
    
    wrapper.vm.goToInvite()
    expect(router.push).toHaveBeenCalledWith('/invite')
    
    wrapper.vm.goToSettings()
    expect(router.push).toHaveBeenCalledWith('/settings')
  })
})