<template>
  <div class="settings">
    <div class="container">
      <h1>Settings</h1>
      <p>Configure your USDTide preferences.</p>
      
      <van-empty description="Settings interface coming soon">
        <template #image>
          <van-icon name="setting-o" size="100" color="#969799" />
        </template>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const emit = defineEmits(['update-title'])

onMounted(() => {
  emit('update-title', 'Settings')
})
</script>

<style scoped>
.settings {
  padding: 1rem;
  min-height: 100vh;
}

h1 {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #323233;
}

p {
  text-align: center;
  color: #969799;
  margin-bottom: 2rem;
}
</style>