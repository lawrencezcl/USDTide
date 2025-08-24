<template>
  <div class="profile">
    <div class="container">
      <h1>Profile</h1>
      <p>Manage your account and view transaction history.</p>
      
      <van-empty description="Profile interface coming soon">
        <template #image>
          <van-icon name="user-o" size="100" color="#07c160" />
        </template>
      </van-empty>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

const emit = defineEmits(['update-title'])

onMounted(() => {
  emit('update-title', 'Profile')
})
</script>

<style scoped>
.profile {
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