<template>
  <div class="landing">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-background">
        <div class="hero-content">
          <img src="@/assets/logo.png" alt="USDTide" class="hero-logo" />
          <h1 class="hero-title">USDTide</h1>
          <p class="hero-subtitle">
            Kaia Ecosystem DeFi Tool
          </p>
          <p class="hero-description">
            Make stablecoin value flow naturally with zero-threshold DeFi
          </p>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section">
      <h2 class="section-title">Why Choose USDTide?</h2>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon no-wallet">
            <van-icon name="shield-o" size="32" />
          </div>
          <h3>No Wallet Setup</h3>
          <p>Use your LINE Dapp Portal Wallet directly. No complex wallet creation required.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon staking">
            <van-icon name="gold-coin-o" size="32" />
          </div>
          <h3>USDT Staking</h3>
          <p>Earn 4%-6% annual returns by staking USDT with compliant validator nodes.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon lending">
            <van-icon name="credit-pay" size="32" />
          </div>
          <h3>Flexible Lending</h3>
          <p>Borrow KAIA with 70% collateral ratio using your staked USDT as collateral.</p>
        </div>
        
        <div class="feature-card">
          <div class="feature-icon social">
            <van-icon name="friends-o" size="32" />
          </div>
          <h3>Social Rewards</h3>
          <p>Invite friends and earn 0.5 USDT rewards when they complete their first stake.</p>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section">
      <h2 class="section-title">Platform Statistics</h2>
      
      <van-grid :column-num="2" :border="false" class="stats-grid">
        <van-grid-item>
          <div class="stat-card">
            <h3>$2.5M+</h3>
            <p>Total Value Locked</p>
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="stat-card">
            <h3>1,200+</h3>
            <p>Active Users</p>
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="stat-card">
            <h3>5.8%</h3>
            <p>Average APY</p>
          </div>
        </van-grid-item>
        
        <van-grid-item>
          <div class="stat-card">
            <h3>99.9%</h3>
            <p>Uptime</p>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- CTA Section -->
    <div class="cta-section">
      <div class="cta-card">
        <h2>Ready to Start?</h2>
        <p>Join thousands of users earning passive income with their USDT</p>
        
        <van-button
          type="primary"
          size="large"
          round
          block
          @click="handleGetStarted"
          :loading="isLoading"
          class="cta-button"
        >
          Get Started
        </van-button>
        
        <p class="cta-note">
          * Estimated earnings are not guaranteed. Please read our terms carefully.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer-section">
      <div class="footer-links">
        <van-button type="default" size="small" @click="openTerms">
          Terms of Service
        </van-button>
        <van-button type="default" size="small" @click="openPrivacy">
          Privacy Policy
        </van-button>
        <van-button type="default" size="small" @click="openSupport">
          Support
        </van-button>
      </div>
      
      <p class="footer-text">
        USDTide is built for the Kaia ecosystem. Your assets remain in your wallet at all times.
      </p>
      
      <p class="footer-copyright">
        © 2024 USDTide Team. All rights reserved.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

// Props
const props = defineProps({
  liff: Object,
  user: Object,
  isLoggedIn: Boolean
})

// Emits
const emit = defineEmits(['update-title'])

// Router
const router = useRouter()

// Reactive state
const isLoading = ref(false)

// Methods
const handleGetStarted = async () => {
  try {
    isLoading.value = true
    
    if (props.isLoggedIn) {
      // User is already logged in, go to dashboard
      router.push('/dashboard')
    } else {
      // Trigger login flow
      if (props.liff && props.liff.login) {
        props.liff.login()
      } else {
        showToast('Please refresh the page and try again')
      }
    }
  } catch (error) {
    console.error('Get started failed:', error)
    showToast('Failed to start. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const openTerms = () => {
  if (props.liff && props.liff.openWindow) {
    props.liff.openWindow('https://usdtide.xyz/terms', true)
  } else {
    window.open('https://usdtide.xyz/terms', '_blank')
  }
}

const openPrivacy = () => {
  if (props.liff && props.liff.openWindow) {
    props.liff.openWindow('https://usdtide.xyz/privacy', true)
  } else {
    window.open('https://usdtide.xyz/privacy', '_blank')
  }
}

const openSupport = () => {
  if (props.liff && props.liff.openWindow) {
    props.liff.openWindow('https://usdtide.xyz/support', true)
  } else {
    window.open('https://usdtide.xyz/support', '_blank')
  }
}

// Lifecycle
onMounted(() => {
  emit('update-title', 'USDTide')
})
</script>

<style scoped>
.landing {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.hero-section {
  padding: 2rem 1rem;
  text-align: center;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-background {
  width: 100%;
  max-width: 400px;
}

.hero-logo {
  width: 100px;
  height: 100px;
  margin-bottom: 1.5rem;
  border-radius: 50%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: linear-gradient(45deg, #ffd700, #ffeb3b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin: 0 0 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.hero-description {
  font-size: 1rem;
  margin: 0;
  opacity: 0.8;
  line-height: 1.5;
}

.features-section,
.stats-section,
.cta-section {
  padding: 2rem 1rem;
  background: white;
  color: #323233;
}

.features-section {
  background: #f7f8fa;
}

.section-title {
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 2rem;
  color: #323233;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  max-width: 600px;
  margin: 0 auto;
}

.feature-card {
  background: white;
  padding: 2rem 1.5rem;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
}

.feature-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.feature-icon.no-wallet {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.feature-icon.staking {
  background: linear-gradient(135deg, #ffd700, #ffeb3b);
}

.feature-icon.lending {
  background: linear-gradient(135deg, #2196f3, #21cbf3);
}

.feature-icon.social {
  background: linear-gradient(135deg, #07c160, #00d084);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #323233;
}

.feature-card p {
  margin: 0;
  color: #646566;
  line-height: 1.5;
}

.stats-grid .stat-card {
  text-align: center;
  padding: 1.5rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  color: #323233;
}

.stat-card p {
  margin: 0;
  color: #969799;
  font-size: 0.9rem;
}

.cta-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.cta-card {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.cta-card h2 {
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0 0 1rem;
}

.cta-card p {
  margin: 0 0 2rem;
  opacity: 0.9;
  line-height: 1.5;
}

.cta-button {
  margin-bottom: 1rem;
  height: 48px;
  font-size: 1.1rem;
  font-weight: 600;
}

.cta-note {
  font-size: 0.8rem;
  opacity: 0.7;
  margin: 1rem 0 0;
}

.footer-section {
  padding: 2rem 1rem;
  background: #f7f8fa;
  text-align: center;
  color: #646566;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.footer-text {
  margin: 0 0 1rem;
  line-height: 1.5;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.footer-copyright {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.7;
}

/* Tablet and larger screens */
@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
    max-width: 800px;
  }
  
  .hero-title {
    font-size: 3.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.4rem;
  }
  
  .hero-description {
    font-size: 1.1rem;
  }
}

/* Mobile optimizations */
@media (max-width: 414px) {
  .hero-section {
    padding: 1.5rem 1rem;
    min-height: 60vh;
  }
  
  .hero-logo {
    width: 80px;
    height: 80px;
    margin-bottom: 1rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .features-section,
  .stats-section,
  .cta-section {
    padding: 1.5rem 1rem;
  }
  
  .feature-card {
    padding: 1.5rem 1rem;
  }
  
  .feature-icon {
    width: 56px;
    height: 56px;
  }
  
  .footer-links {
    gap: 0.5rem;
  }
}

@media (max-width: 375px) {
  .hero-title {
    font-size: 2.2rem;
  }
  
  .features-section,
  .stats-section,
  .cta-section {
    padding: 1.25rem 0.75rem;
  }
  
  .feature-card {
    padding: 1.25rem 0.75rem;
  }
}
</style>