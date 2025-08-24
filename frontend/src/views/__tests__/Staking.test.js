import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ethers } from 'ethers'
import Staking from '../Staking.vue'

// Mock the Vant components
vi.mock('vant', () => ({
  showToast: vi.fn(),
  showDialog: vi.fn(),
  showConfirmDialog: vi.fn().mockResolvedValue({})
}))

// Mock the router
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

describe('Staking.vue', () => {
  const mockUser = {
    userId: 'test-user-id'
  }

  const mockWalletConnector = {
    isConnected: true,
    usdtBalance: ethers.parseUnits('1000', 6),
    loadBalances: vi.fn().mockResolvedValue()
  }

  const mockNodes = [
    {
      name: 'Kaia Wave Node',
      annualRate: 600,
      securityRating: 5,
      isActive: true,
      totalStaked: ethers.parseUnits('500000', 6),
      maxCapacity: ethers.parseUnits('1000000', 6)
    },
    {
      name: 'Kaia Storm Node',
      annualRate: 550,
      securityRating: 4,
      isActive: true,
      totalStaked: ethers.parseUnits('300000', 6),
      maxCapacity: ethers.parseUnits('500000', 6)
    }
  ]

  const mockUserStakes = [
    {
      amount: ethers.parseUnits('100', 6),
      nodeId: 0,
      stakeTime: Date.now() - 86400000 * 7,
      pendingRewards: ethers.parseUnits('1.15', 6)
    }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = mount(Staking, {
      props: {
        user: mockUser,
        walletConnector: mockWalletConnector,
        isLoggedIn: true
      },
      global: {
        mocks: {
          $t: (msg) => msg
        },
        provide: {
          liff: null
        }
      }
    })
  })

  it('renders staking interface correctly', () => {
    expect(wrapper.find('.section-title').text()).toBe('Select Validator Node')
  })

  it('loads data correctly', async () => {
    await wrapper.vm.loadData()
    
    expect(mockWalletConnector.loadBalances).toHaveBeenCalled()
    expect(wrapper.vm.nodes.length).toBeGreaterThan(0)
  })

  it('calculates earnings correctly', () => {
    wrapper.vm.stakeAmount = '100'
    wrapper.vm.selectedNodeId = 0
    wrapper.vm.nodes = mockNodes
    
    const daily = wrapper.vm.calculateEarnings('daily')
    const monthly = wrapper.vm.calculateEarnings('monthly')
    const yearly = wrapper.vm.calculateEarnings('yearly')
    
    expect(parseFloat(daily)).toBeGreaterThan(0)
    expect(parseFloat(monthly)).toBeGreaterThan(parseFloat(daily))
    expect(parseFloat(yearly)).toBeGreaterThan(parseFloat(monthly))
  })

  it('validates staking amount', () => {
    wrapper.vm.stakeAmount = '5' // Below minimum
    wrapper.vm.selectedNodeId = 0
    wrapper.vm.nodes = mockNodes
    wrapper.vm.usdtBalance = ethers.parseUnits('1000', 6)
    
    expect(wrapper.vm.canStake).toBe(false)
    
    wrapper.vm.stakeAmount = '50' // Valid amount
    expect(wrapper.vm.canStake).toBe(true)
  })

  it('formats balance correctly', () => {
    const balance = ethers.parseUnits('123.456', 6)
    const formatted = wrapper.vm.formatBalance(balance)
    expect(formatted).toBe('123.46')
  })

  it('formats capacity correctly', () => {
    const node = mockNodes[0]
    const capacity = wrapper.vm.formatCapacity(node)
    expect(capacity).toContain('% used')
  })

  it('handles node selection', () => {
    const nodeId = 0
    wrapper.vm.selectNode(nodeId)
    expect(wrapper.vm.selectedNodeId).toBe(nodeId)
  })

  it('sets max amount correctly', async () => {
    wrapper.vm.usdtBalance = ethers.parseUnits('500', 6)
    await wrapper.vm.setMaxAmount()
    expect(wrapper.vm.stakeAmount).toBe('500.00')
  })

  it('calculates total staked USD', async () => {
    wrapper.vm.userStakes = mockUserStakes
    const total = wrapper.vm.totalStakedUSD
    expect(parseFloat(total)).toBeGreaterThan(0)
  })

  it('calculates average APY', async () => {
    wrapper.vm.userStakes = mockUserStakes
    wrapper.vm.nodes = mockNodes
    const apy = wrapper.vm.averageAPY
    expect(parseFloat(apy)).toBeGreaterThan(0)
  })

  it('handles quick amount selection', () => {
    const amount = 100
    wrapper.vm.setQuickAmount(amount)
    expect(wrapper.vm.stakeAmount).toBe('100')
  })

  it('gets node name correctly', () => {
    wrapper.vm.nodes = mockNodes
    const name = wrapper.vm.getNodeName(0)
    expect(name).toBe('Kaia Wave Node')
  })

  it('formats date correctly', () => {
    const timestamp = Date.now()
    const formatted = wrapper.vm.formatDate(timestamp)
    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
  })

  it('processes staking transaction', async () => {
    wrapper.vm.stakeAmount = '100'
    wrapper.vm.selectedNodeId = 0
    wrapper.vm.nodes = mockNodes
    wrapper.vm.usdtBalance = ethers.parseUnits('1000', 6)
    
    // Mock the confirm dialog
    const mockConfirm = vi.spyOn(wrapper.vm, 'showConfirmDialog').mockResolvedValue()
    
    await wrapper.vm.handleStake()
    
    expect(mockConfirm).toHaveBeenCalled()
  })

  it('processes withdrawal transaction', async () => {
    wrapper.vm.userStakes = mockUserStakes
    wrapper.vm.usdtBalance = ethers.parseUnits('1000', 6)
    
    // Mock the confirm dialog
    const mockConfirm = vi.spyOn(wrapper.vm, 'showConfirmDialog').mockResolvedValue()
    
    await wrapper.vm.withdrawStake(0)
    
    expect(mockConfirm).toHaveBeenCalled()
  })

  it('processes reward claiming', async () => {
    wrapper.vm.userStakes = mockUserStakes
    wrapper.vm.usdtBalance = ethers.parseUnits('1000', 6)
    
    await wrapper.vm.claimRewards(0)
    
    // Check that rewards were reset
    expect(wrapper.vm.userStakes[0].pendingRewards).toBe('0')
  })
})