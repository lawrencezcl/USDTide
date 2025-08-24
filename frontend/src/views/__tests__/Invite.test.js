import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import Invite from '../Invite.vue'
import { generateUniqueCode } from '@/utils/helpers'

// Mock the Vant components
vi.mock('vant', () => ({
  showToast: vi.fn(),
  showDialog: vi.fn()
}))

// Mock the router
vi.mock('vue-router', () => ({
  useRoute: () => ({}),
  useRouter: () => ({
    push: vi.fn()
  })
}))

// Mock LIFF
const mockLiff = {
  shareTargetPicker: vi.fn().mockResolvedValue(),
  openWindow: vi.fn()
}

describe('Invite.vue', () => {
  const mockUser = {
    userId: 'test-user-id',
    displayName: 'Test User'
  }

  let wrapper

  beforeEach(() => {
    wrapper = mount(Invite, {
      global: {
        mocks: {
          $t: (msg) => msg
        },
        provide: {
          liff: mockLiff,
          user: mockUser
        }
      }
    })
  })

  it('renders invite interface correctly', () => {
    expect(wrapper.find('.hero-section h1').text()).toBe('Invite Friends')
  })

  it('generates unique invite code', () => {
    const code = wrapper.vm.generateInviteCode()
    expect(code).toBeDefined()
    expect(code.length).toBeGreaterThan(5)
  })

  it('generates invite link', () => {
    const code = 'TEST123'
    const link = wrapper.vm.generateInviteLink(code)
    expect(link).toContain('/invite/TEST123')
  })

  it('copies invite code to clipboard', async () => {
    wrapper.vm.inviteCode = 'TEST123'
    
    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText
      },
      writable: true
    })
    
    await wrapper.vm.copyInviteCode()
    expect(mockWriteText).toHaveBeenCalledWith('TEST123')
  })

  it('copies invite link to clipboard', async () => {
    wrapper.vm.inviteLink = 'https://example.com/invite/TEST123'
    
    // Mock clipboard API
    const mockWriteText = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText
      },
      writable: true
    })
    
    await wrapper.vm.copyInviteLink()
    expect(mockWriteText).toHaveBeenCalledWith('https://example.com/invite/TEST123')
  })

  it('shares via LINE', async () => {
    wrapper.vm.inviteCode = 'TEST123'
    wrapper.vm.inviteLink = 'https://example.com/invite/TEST123'
    
    await wrapper.vm.shareViaLine()
    expect(mockLiff.shareTargetPicker).toHaveBeenCalled()
  })

  it('shares via generic method', async () => {
    wrapper.vm.inviteCode = 'TEST123'
    wrapper.vm.inviteLink = 'https://example.com/invite/TEST123'
    
    // Mock navigator.share
    const mockShare = vi.fn().mockResolvedValue()
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true
    })
    
    // Mock navigator.canShare
    Object.defineProperty(navigator, 'canShare', {
      value: vi.fn().mockReturnValue(true),
      writable: true
    })
    
    await wrapper.vm.shareGeneric()
    expect(mockShare).toHaveBeenCalled()
  })

  it('tracks invite actions', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    wrapper.vm.trackInviteAction('test_action')
    expect(consoleSpy).toHaveBeenCalledWith('Invite action:', 'test_action', expect.any(Object))
  })

  it('loads invitation data', async () => {
    await wrapper.vm.loadInvitationData()
    expect(wrapper.vm.totalEarnings.value).toBeDefined()
  })

  it('calculates conversion rate correctly', () => {
    wrapper.vm.totalInvites = 10
    wrapper.vm.successfulInvites = 5
    expect(wrapper.vm.conversionRate).toBe(50)
    
    wrapper.vm.totalInvites = 0
    expect(wrapper.vm.conversionRate).toBe(0)
  })

  it('formats dates correctly', () => {
    const date = new Date(Date.now() - 3600000) // 1 hour ago
    const formatted = wrapper.vm.formatDate(date)
    expect(formatted).toContain('hour')
  })

  it('formats status correctly', () => {
    expect(wrapper.vm.formatStatus('completed')).toBe('Completed')
    expect(wrapper.vm.formatStatus('registered')).toBe('Registered')
    expect(wrapper.vm.formatStatus('unknown')).toBe('unknown')
  })

  it('gets status class correctly', () => {
    expect(wrapper.vm.getStatusClass('completed')).toBe('status-success')
    expect(wrapper.vm.getStatusClass('registered')).toBe('status-warning')
    expect(wrapper.vm.getStatusClass('unknown')).toBe('status-default')
  })

  it('gets status type correctly', () => {
    expect(wrapper.vm.getStatusType('completed')).toBe('success')
    expect(wrapper.vm.getStatusType('registered')).toBe('warning')
    expect(wrapper.vm.getStatusType('unknown')).toBe('default')
  })

  it('processes invite code', () => {
    const code = 'TEST123'
    const showDialogSpy = vi.spyOn(wrapper.vm, 'showDialog').mockResolvedValue()
    
    wrapper.vm.processInviteCode(code)
    expect(showDialogSpy).toHaveBeenCalled()
  })

  it('generates unique codes', () => {
    const code1 = generateUniqueCode()
    const code2 = generateUniqueCode()
    expect(code1).not.toBe(code2)
    expect(code1.length).toBe(8)
  })
})