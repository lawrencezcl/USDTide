// USDTide Demo Recording Script
// This script guides you through the complete demo recording process

const DEMO_STEPS = [
  {
    step: 1,
    title: "Setup & Preparation",
    actions: [
      "Clear device notifications",
      "Enable Do Not Disturb",
      "Set brightness to 80%",
      "Test screen recording quality",
      "Open https://usdtidelive-dl4ce7l0v-lawrencezcls-projects.vercel.app"
    ],
    duration: "30 seconds"
  },
  {
    step: 2,
    title: "Landing Page Showcase",
    actions: [
      "Start recording",
      "Show full landing page scroll",
      "Tap 'Get Started' button",
      "Show mock LINE login (auto-login as Test User)",
      "Transition to dashboard"
    ],
    duration: "45 seconds"
  },
  {
    step: 3,
    title: "USDT Staking Demo",
    actions: [
      "Show dashboard overview",
      "Navigate to Staking tab",
      "Select 6% APY pool",
      "Enter 100 USDT amount",
      "Tap 'Stake' and show confirmation",
      "Show success message",
      "Verify updated staking position"
    ],
    duration: "90 seconds"
  },
  {
    step: 4,
    title: "USDT Lending Demo",
    actions: [
      "Navigate to Lending tab",
      "Show available lending pools",
      "Select collateral (KAIA tokens)",
      "Enter borrow amount (50 USDT)",
      "Show collateral calculation",
      "Confirm lending position",
      "Show active lending dashboard"
    ],
    duration: "90 seconds"
  },
  {
    step: 5,
    title: "Mobile Responsive Test",
    actions: [
      "Rotate device to landscape",
      "Show responsive layout",
      "Test touch interactions",
      "Switch back to portrait",
      "Test LINE MiniDapp view (if available)"
    ],
    duration: "45 seconds"
  },
  {
    step: 6,
    title: "Call to Action",
    actions: [
      "Show invite friends feature",
      "Display QR code for easy access",
      "End with USDTide branding",
      "Stop recording"
    ],
    duration: "30 seconds"
  }
];

// Recording Checklist
const RECORDING_CHECKLIST = {
  preRecording: [
    "✅ Device charged to 80%+",
    "✅ Stable internet connection",
    "✅ Screen recording app ready",
    "✅ Audio tested (if using voiceover)",
    "✅ Notifications cleared",
    "✅ USDTide URL bookmarked"
  ],
  
  duringRecording: [
    "✅ Smooth transitions between screens",
    "✅ Clear finger gestures for touch",
    "✅ Pause briefly at key moments",
    "✅ Show loading animations",
    "✅ Demonstrate responsive design"
  ],
  
  postRecording: [
    "✅ Review recording quality",
    "✅ Check audio levels",
    "✅ Verify all features shown",
    "✅ Export in 1080p resolution",
    "✅ Backup original file"
  ]
};

// Mobile Recording Instructions
const MOBILE_RECORDING = {
  iPhone: {
    setup: [
      "Settings > Control Center > Add Screen Recording",
      "Swipe down from top-right > Tap record button",
      "3-second countdown before recording starts",
      "Red status bar indicates active recording"
    ],
    tips: [
      "Use silent mode to avoid notification sounds",
      "Record in airplane mode for clean audio",
      "Hold device steady with both hands"
    ]
  },
  
  Android: {
    setup: [
      "Settings > Advanced features > Screenshots and screen recorder",
      "Swipe down twice from top > Tap Screen record",
      "Choose audio source (Media sounds recommended)",
      "3-second countdown before recording"
    ],
    tips: [
      "Close background apps for smooth performance",
      "Use landscape mode for better YouTube format",
      "Enable high-quality recording in settings"
    ]
  }
};

// Video Editing Timeline
const EDITING_TIMELINE = {
  intro: {
    duration: 3,
    content: "USDTide logo animation with tagline",
    music: "Upbeat electronic background"
  },
  
  landing: {
    duration: 45,
    content: "Landing page tour and get started",
    textOverlay: "6% APY USDT Staking"
  },
  
  staking: {
    duration: 90,
    content: "Complete staking demonstration",
    textOverlay: "Stake USDT in 3 simple steps"
  },
  
  lending: {
    duration: 90,
    content: "Lending feature walkthrough",
    textOverlay: "Instant USDT loans"
  },
  
  mobile: {
    duration: 45,
    content: "Responsive design showcase",
    textOverlay: "Works perfectly on mobile"
  },
  
  outro: {
    duration: 30,
    content: "Call to action with QR code",
    textOverlay: "Try USDTide today!"
  }
};

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DEMO_STEPS,
    RECORDING_CHECKLIST,
    MOBILE_RECORDING,
    EDITING_TIMELINE
  };
}

console.log("🎬 USDTide Demo Recording Script Loaded!");
console.log("📱 Live Demo URL: https://usdtidelive-dl4ce7l0v-lawrencezcls-projects.vercel.app");
console.log("🎯 Follow the steps in DEMO_PRESENTATION_PACKAGE.md for complete instructions");