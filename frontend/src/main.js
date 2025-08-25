import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

// Vant UI
import 'vant/lib/index.css'
import {
  Button,
  Card,
  Cell,
  CellGroup,
  Col,
  Row,
  Divider,
  Empty,
  Grid,
  GridItem,
  Icon,
  Image as VanImage,
  Loading,
  NavBar,
  Overlay,
  Popup,
  Tabbar,
  TabbarItem,
  Toast,
  Dialog,
  ActionSheet,
  Form,
  Field,
  Stepper,
  Slider,
  Switch,
  RadioGroup,
  Radio,
  CheckboxGroup,
  Checkbox,
  Progress,
  Circle,
  NoticeBar,
  Tag,
  Badge,
  List,
  PullRefresh,
  SwipeCell,
  Swipe,
  SwipeItem,
  Sticky,
  IndexBar,
  IndexAnchor,
  ContactCard,
  ContactList,
  ContactEdit,
  Calendar,
  Area,
  PasswordInput,
  NumberKeyboard,
  Search,
  Tabs,
  Tab,
  TreeSelect,
  Cascader,
  Picker,
  DropdownMenu,
  DropdownItem,
  ConfigProvider
} from 'vant'

// Touch emulator for desktop
import '@vant/touch-emulator'

// App and components
import App from './App.vue'

// Styles
import './styles/global.scss'

// Routes (lazy loaded)
const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('./views/Landing.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/staking',
    name: 'Staking',
    component: () => import('./views/Staking.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/lending',
    name: 'Lending',
    component: () => import('./views/Lending.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('./views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('./views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/invite/:code?',
    name: 'Invite',
    component: () => import('./views/Invite.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('./views/NotFound.vue'),
    meta: { requiresAuth: false }
  }
]

// Router configuration
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// I18n configuration
const messages = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      staking: 'Staking',
      lending: 'Lending',
      profile: 'Profile',
      settings: 'Settings'
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      cancel: 'Cancel',
      confirm: 'Confirm',
      retry: 'Retry',
      close: 'Close',
      save: 'Save',
      edit: 'Edit',
      delete: 'Delete',
      submit: 'Submit',
      reset: 'Reset',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      refresh: 'Refresh',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      export: 'Export',
      import: 'Import',
      copy: 'Copy',
      share: 'Share',
      more: 'More'
    },
    wallet: {
      connect: 'Connect Wallet',
      disconnect: 'Disconnect',
      connected: 'Wallet Connected',
      notConnected: 'Wallet Not Connected',
      balance: 'Balance',
      address: 'Address',
      network: 'Network',
      authorize: 'Authorize',
      authorization: 'Authorization',
      authorizationRequired: 'Wallet Authorization Required',
      permissionDenied: 'Permission Denied'
    },
    staking: {
      title: 'USDT Staking',
      stake: 'Stake',
      unstake: 'Unstake',
      claim: 'Claim Rewards',
      amount: 'Amount',
      apy: 'APY',
      rewards: 'Rewards',
      earnings: 'Earnings',
      staked: 'Staked',
      available: 'Available',
      minimum: 'Minimum',
      maximum: 'Maximum',
      node: 'Node',
      nodes: 'Nodes',
      selectNode: 'Select Node',
      estimatedEarnings: 'Estimated Earnings',
      dailyEarnings: 'Daily Earnings',
      totalStaked: 'Total Staked',
      totalRewards: 'Total Rewards'
    },
    lending: {
      title: 'USDT Collateralized Lending',
      borrow: 'Borrow',
      repay: 'Repay',
      loan: 'Loan',
      loans: 'Loans',
      collateral: 'Collateral',
      borrowed: 'Borrowed',
      available: 'Available to Borrow',
      ratio: 'Collateral Ratio',
      term: 'Loan Term',
      interestRate: 'Interest Rate',
      dueDate: 'Due Date',
      totalDue: 'Total Due',
      liquidation: 'Liquidation',
      health: 'Loan Health'
    },
    profile: {
      title: 'Profile',
      assets: 'Assets',
      history: 'History',
      transactions: 'Transactions',
      invite: 'Invite Friends',
      invitations: 'Invitations',
      rewards: 'Rewards',
      statistics: 'Statistics',
      logout: 'Logout'
    }
  },
  ko: {
    nav: {
      dashboard: '대시보드',
      staking: '스테이킹',
      lending: '대출',
      profile: '프로필',
      settings: '설정'
    },
    common: {
      loading: '로딩 중...',
      error: '오류',
      success: '성공',
      cancel: '취소',
      confirm: '확인',
      retry: '다시 시도',
      close: '닫기',
      save: '저장',
      edit: '편집',
      delete: '삭제',
      submit: '제출',
      reset: '재설정',
      back: '뒤로',
      next: '다음',
      previous: '이전',
      refresh: '새로고침',
      search: '검색',
      filter: '필터',
      sort: '정렬',
      export: '내보내기',
      import: '가져오기',
      copy: '복사',
      share: '공유',
      more: '더보기'
    },
    wallet: {
      connect: '지갑 연결',
      disconnect: '연결 해제',
      connected: '지갑 연결됨',
      notConnected: '지갑 연결 안됨',
      balance: '잔액',
      address: '주소',
      network: '네트워크',
      authorize: '승인',
      authorization: '승인',
      authorizationRequired: '지갑 승인 필요',
      permissionDenied: '권한 거부됨'
    },
    staking: {
      title: 'USDT 스테이킹',
      stake: '스테이킹',
      unstake: '언스테이킹',
      claim: '보상 수령',
      amount: '금액',
      apy: '연간 수익률',
      rewards: '보상',
      earnings: '수익',
      staked: '스테이킹됨',
      available: '사용 가능',
      minimum: '최소',
      maximum: '최대',
      node: '노드',
      nodes: '노드',
      selectNode: '노드 선택',
      estimatedEarnings: '예상 수익',
      dailyEarnings: '일일 수익',
      totalStaked: '총 스테이킹',
      totalRewards: '총 보상'
    },
    lending: {
      title: 'USDT 담보 대출',
      borrow: '대출',
      repay: '상환',
      loan: '대출',
      loans: '대출',
      collateral: '담보',
      borrowed: '대출됨',
      available: '대출 가능',
      ratio: '담보 비율',
      term: '대출 기간',
      interestRate: '이자율',
      dueDate: '만기일',
      totalDue: '총 상환액',
      liquidation: '청산',
      health: '대출 건전성'
    },
    profile: {
      title: '프로필',
      assets: '자산',
      history: '히스토리',
      transactions: '거래',
      invite: '친구 초대',
      invitations: '초대',
      rewards: '보상',
      statistics: '통계',
      logout: '로그아웃'
    }
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

// Pinia store
const pinia = createPinia()

// Create Vue app
const app = createApp(App)

// Register Vant components
app.use(Button)
app.use(Card)
app.use(Cell)
app.use(CellGroup)
app.use(Col)
app.use(Row)
app.use(Divider)
app.use(Empty)
app.use(Grid)
app.use(GridItem)
app.use(Icon)
app.use(VanImage)
app.use(Loading)
app.use(NavBar)
app.use(Overlay)
app.use(Popup)
app.use(Tabbar)
app.use(TabbarItem)
app.use(Toast)
app.use(Dialog)
app.use(ActionSheet)
app.use(Form)
app.use(Field)
app.use(Stepper)
app.use(Slider)
app.use(Switch)
app.use(RadioGroup)
app.use(Radio)
app.use(CheckboxGroup)
app.use(Checkbox)
app.use(Progress)
app.use(Circle)
app.use(NoticeBar)
app.use(Tag)
app.use(Badge)
app.use(List)
app.use(PullRefresh)
app.use(SwipeCell)
app.use(Swipe)
app.use(SwipeItem)
app.use(Sticky)
app.use(IndexBar)
app.use(IndexAnchor)
app.use(ContactCard)
app.use(ContactList)
app.use(ContactEdit)
app.use(Calendar)
app.use(Area)
app.use(PasswordInput)
app.use(NumberKeyboard)
app.use(Search)
app.use(Tabs)
app.use(Tab)
app.use(TreeSelect)
app.use(Cascader)
app.use(Picker)
app.use(DropdownMenu)
app.use(DropdownItem)
app.use(ConfigProvider)

// Use plugins
app.use(router)
app.use(pinia)
app.use(i18n)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info)
  // You can send error to monitoring service here
}

// Global properties
app.config.globalProperties.$env = import.meta.env

// Mount app
app.mount('#app')

// Performance monitoring
if (import.meta.env.DEV) {
  console.log('USDTide development mode')
} else {
  console.log('USDTide production mode')
}

// PWA support (future enhancement)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError)
      })
  })
}