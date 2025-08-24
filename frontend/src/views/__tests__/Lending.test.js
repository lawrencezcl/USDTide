import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ethers } from 'ethers'
import Lending from '../Lending.vue'

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

describe('Lending.vue', () => {
  const mockUser = {
    userId: 'test-user-id'
  }

  const mockWalletConnector = {
    isConnected: true,
    loadBalances: vi.fn().mockResolvedValue()
  }

  const mockActiveLoans = [
    {
      kaiaAmount: ethers.parseEther('100'),
      collateralAmount: ethers.parseUnits('200', 6),
      interestRate: 22,
      borrowTime: Date.now() - 86400000 * 3,
      dueTime: Date.now() + 86400000 * 4,
      term: 7 * 24 * 60 * 60 * 1000,
      isActive: true
    }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = mount(Lending, {
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

  it('renders lending interface correctly', () => {
    expect(wrapper.find('.section-title').text()).toBe('Your Active Loans')
  })

  it('loads data correctly', async () => {
    await wrapper.vm.loadData()
    expect(wrapper.vm.stakedAmount).toBeDefined()
  })

  it('calculates total interest correctly', () => {
    wrapper.vm.borrowAmount = '100'
    wrapper.vm.selectedTerm = (7 * 24 * 60 * 60 * 1000).toString()
    
    const interest = wrapper.vm.calculateTotalInterest()
    expect(parseFloat(interest)).toBeGreaterThan(0)
  })

  it('calculates total repayment correctly', () => {
    wrapper.vm.borrowAmount = '100'
    wrapper.vm.selectedTerm = (7 * 24 * 60 * 60 * 1000).toString()
    
    const repayment = wrapper.vm.calculateTotalRepayment()
    expect(parseFloat(repayment)).toBeGreaterThan(100)
  })

  it('calculates required collateral correctly', () => {
    wrapper.vm.borrowAmount = '100'
    
    const collateral = wrapper.vm.calculateRequiredCollateral()
    expect(parseFloat(collateral)).toBeGreaterThan(0)
  })

  it('validates borrowing amount', () => {
    wrapper.vm.borrowAmount = '0.5' // Below minimum
    wrapper.vm.selectedTerm = (7 * 24 * 60 * 60 * 1000).toString()
    wrapper.vm.availableCollateral = ethers.parseUnits('1000', 6)
    
    expect(wrapper.vm.canBorrow).toBe(false)
    
    wrapper.vm.borrowAmount = '50' // Valid amount
    expect(wrapper.vm.canBorrow).toBe(true)
  })

  it('formats balance correctly', () => {
    const balance = ethers.parseUnits('123.456', 6)
    const formatted = wrapper.vm.formatBalance(balance)
    expect(formatted).toBe('123.46')
  })

  it('formats date correctly', () => {
    const timestamp = Date.now()
    const formatted = wrapper.vm.formatDate(timestamp)
    expect(formatted).toMatch(/[A-Za-z]{3} \d{1,2}, \d{4}/)
  })

  it('checks if loan is overdue', () => {
    const overdueLoan = {
      dueTime: Date.now() - 86400000 // 1 day ago
    }
    
    expect(wrapper.vm.isOverdue(overdueLoan)).toBe(true)
  })

  it('checks if loan is near due', () => {
    const nearDueLoan = {
      dueTime: Date.now() + 86400000 // 1 day from now
    }
    
    expect(wrapper.vm.isNearDue(nearDueLoan)).toBe(true)
  })

  it('calculates loan progress', () => {
    const loan = {
      borrowTime: Date.now() - 86400000 * 3,
      dueTime: Date.now() + 86400000 * 4
    }
    
    const progress = wrapper.vm.getLoanProgress(loan)
    expect(progress).toBeGreaterThan(0)
    expect(progress).toBeLessThan(100)
  })

  it('gets loan progress color', () => {
    const normalLoan = {
      dueTime: Date.now() + 86400000 * 5
    }
    
    const nearDueLoan = {
      dueTime: Date.now() + 86400000 * 1
    }
    
    const overdueLoan = {
      dueTime: Date.now() - 86400000 * 1
    }
    
    expect(wrapper.vm.getLoanProgressColor(normalLoan)).toBe('#1989fa')
    expect(wrapper.vm.getLoanProgressColor(nearDueLoan)).toBe('#ff976a')
    expect(wrapper.vm.getLoanProgressColor(overdueLoan)).toBe('#ee0a24')
  })

  it('gets loan status', () => {
    const normalLoan = {
      dueTime: Date.now() + 86400000 * 5
    }
    
    const nearDueLoan = {
      dueTime: Date.now() + 86400000 * 1
    }
    
    const overdueLoan = {
      dueTime: Date.now() - 86400000 * 1
    }
    
    expect(wrapper.vm.getLoanStatus(normalLoan)).toBe('Active')
    expect(wrapper.vm.getLoanStatus(nearDueLoan)).toBe('Due Soon')
    expect(wrapper.vm.getLoanStatus(overdueLoan)).toBe('Overdue')
  })

  it('gets loan status type', () => {
    const normalLoan = {
      dueTime: Date.now() + 86400000 * 5
    }
    
    const nearDueLoan = {
      dueTime: Date.now() + 86400000 * 1
    }
    
    const overdueLoan = {
      dueTime: Date.now() - 86400000 * 1
    }
    
    expect(wrapper.vm.getLoanStatusType(normalLoan)).toBe('success')
    expect(wrapper.vm.getLoanStatusType(nearDueLoan)).toBe('warning')
    expect(wrapper.vm.getLoanStatusType(overdueLoan)).toBe('danger')
  })

  it('sets max borrow amount', () => {
    wrapper.vm.availableCollateral = ethers.parseUnits('1000', 6)
    wrapper.vm.setMaxBorrow()
    expect(wrapper.vm.borrowAmount).toBeDefined()
  })

  it('handles quick borrow amount selection', () => {
    wrapper.vm.availableCollateral = ethers.parseUnits('1000', 6)
    const amount = 100
    wrapper.vm.setQuickBorrow(amount)
    expect(wrapper.vm.borrowAmount).toBe('100')
  })

  it('processes borrowing transaction', async () => {
    wrapper.vm.borrowAmount = '100'
    wrapper.vm.selectedTerm = (7 * 24 * 60 * 60 * 1000).toString()
    wrapper.vm.availableCollateral = ethers.parseUnits('1000', 6)
    
    // Mock the confirm dialog
    const mockConfirm = vi.spyOn(wrapper.vm, 'showConfirmDialog').mockResolvedValue()
    
    await wrapper.vm.handleBorrow()
    
    expect(mockConfirm).toHaveBeenCalled()
  })

  it('processes loan repayment', async () => {
    wrapper.vm.activeLoans = mockActiveLoans
    wrapper.vm.availableCollateral = ethers.parseUnits('1000', 6)
    
    // Mock the confirm dialog
    const mockConfirm = vi.spyOn(wrapper.vm, 'showConfirmDialog').mockResolvedValue()
    
    await wrapper.vm.repayLoan(0)
    
    expect(mockConfirm).toHaveBeenCalled()
  })

  it('calculates health ratio correctly', () => {
    wrapper.vm.activeLoans = mockActiveLoans
    wrapper.vm.stakedAmount = ethers.parseUnits('1000', 6)
    
    const healthRatio = wrapper.vm.healthRatio
    expect(parseInt(healthRatio)).toBeGreaterThan(0)
  })

  it('calculates collateral utilization correctly', () => {
    wrapper.vm.stakedAmount = ethers.parseUnits('1000', 6)
    wrapper.vm.availableCollateral = ethers.parseUnits('800', 6)
    
    const utilization = wrapper.vm.collateralUtilization
    expect(utilization).toBe(20)
  })
})